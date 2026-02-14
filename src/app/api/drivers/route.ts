import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import {
  successResponse,
  paginatedResponse,
  handleApiError,
  ValidationError,
  NotFoundError,
  ConflictError,
  validateQuery,
  withMiddleware,
  schemas,
  getClientIdentifier,
  checkRateLimit,
} from '@/lib/api-utils';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const getDriversSchema = z.object({
  status: z.enum(['online', 'offline', 'busy']).optional(),
  wilaya: z.string().optional(),
  isVerified: z.coerce.boolean().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['createdAt', 'rating', 'totalTrips']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createDriverSchema = z.object({
  email: schemas.email,
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20).optional(),
  language: schemas.language.default('ar'),
  licenseNumber: z.string().min(5).max(50),
  vehiclePlate: z.string().regex(/^[0-9]{1,2}-[0-9]{3,4}-[0-9]{2}$/, {
    message: 'Invalid Algerian plate format (e.g., 01-234-16)',
  }),
  vehicleType: schemas.vehicleType.default('sedan'),
  vehicleColor: z.string().min(2).max(50).optional(),
  vehicleCapacity: z.coerce.number().int().min(2).max(16).default(4),
  wilaya: z.string().min(1, 'Wilaya is required'),
});

const updateDriverSchema = z.object({
  driverId: z.string().min(1),
  status: schemas.status.optional(),
  isVerified: z.boolean().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  totalTrips: z.coerce.number().int().min(0).optional(),
  totalEarnings: z.coerce.number().min(0).optional(),
});

// ============================================
// GET - Fetch drivers with profiles
// ============================================
async function getDriversHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = validateQuery(searchParams, getDriversSchema);
  
  const { status, wilaya, isVerified, minRating, search, limit, offset, sortBy, sortOrder } = params;

  // Build where clause
  const userWhere: Record<string, unknown> = { role: 'driver' };
  if (status) userWhere.status = status;
  if (search) {
    userWhere.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const driverWhere: Record<string, unknown> = {};
  if (wilaya) driverWhere.wilaya = { contains: wilaya, mode: 'insensitive' };
  if (isVerified !== undefined) driverWhere.isVerified = isVerified;
  if (minRating !== undefined) driverWhere.rating = { gte: minRating };

  // Fetch drivers
  const drivers = await db.user.findMany({
    where: userWhere,
    include: {
      driverProfile: {
        where: Object.keys(driverWhere).length > 0 ? driverWhere : undefined,
      },
      locations: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
    take: limit + 1, // Fetch one extra to check if there's more
    skip: offset,
    orderBy: sortBy === 'createdAt' 
      ? { createdAt: sortOrder }
      : sortBy === 'rating' 
        ? { driverProfile: { rating: sortOrder } }
        : { driverProfile: { totalTrips: sortOrder } },
  });

  // Filter out users without matching driver profiles
  const filteredDrivers = wilaya || isVerified || minRating
    ? drivers.filter((d) => d.driverProfile !== null)
    : drivers;

  // Check if there are more results
  const hasMore = filteredDrivers.length > limit;
  const results = hasMore ? filteredDrivers.slice(0, limit) : filteredDrivers;

  // Get total count for pagination
  const total = await db.user.count({ where: userWhere });

  return paginatedResponse(results, {
    total: hasMore ? total : offset + results.length,
    limit,
    offset,
    meta: {
      filters: { status, wilaya, isVerified, minRating, search },
    },
  });
}

// ============================================
// POST - Create a new driver with profile
// ============================================
async function createDriverHandler(request: NextRequest) {
  // Rate limiting for creation
  const clientId = getClientIdentifier(request);
  const rateCheck = checkRateLimit(`create:${clientId}`, 10, 60000);
  if (!rateCheck.allowed) {
    throw new Error('Too many driver creation requests. Please wait.');
  }

  const body = await request.json();
  const data = createDriverSchema.parse(body);

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }

  // Check if license number is already registered
  const existingLicense = await db.driver.findUnique({
    where: { licenseNumber: data.licenseNumber },
  });

  if (existingLicense) {
    throw new ConflictError('This license number is already registered');
  }

  // Check if vehicle plate is already registered
  const existingPlate = await db.driver.findUnique({
    where: { vehiclePlate: data.vehiclePlate },
  });

  if (existingPlate) {
    throw new ConflictError('This vehicle plate is already registered');
  }

  // Create user and driver profile in transaction
  const driver = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: 'driver',
        language: data.language,
        status: 'offline',
      },
    });

    const profile = await tx.driver.create({
      data: {
        userId: user.id,
        licenseNumber: data.licenseNumber,
        vehiclePlate: data.vehiclePlate,
        vehicleType: data.vehicleType,
        vehicleColor: data.vehicleColor,
        vehicleCapacity: data.vehicleCapacity,
        wilaya: data.wilaya,
        isVerified: false,
        rating: 0,
        totalTrips: 0,
        totalEarnings: 0,
      },
    });

    return { ...user, driverProfile: profile, locations: [] };
  });

  return successResponse(driver, {
    message: 'Driver created successfully',
    status: 201,
  });
}

// ============================================
// PUT - Update driver status or profile
// ============================================
async function updateDriverHandler(request: NextRequest) {
  const body = await request.json();
  const data = updateDriverSchema.parse(body);
  const { driverId, status, isVerified, rating, totalTrips, totalEarnings } = data;

  // Verify driver exists
  const existingDriver = await db.user.findUnique({
    where: { id: driverId },
    include: { driverProfile: true },
  });

  if (!existingDriver || existingDriver.role !== 'driver') {
    throw new NotFoundError('Driver');
  }

  // Update user status
  if (status) {
    const user = await db.user.update({
      where: { id: driverId },
      data: { status },
    });
    return successResponse({ ...user, driverProfile: existingDriver.driverProfile });
  }

  // Update driver profile
  const updateData: Record<string, unknown> = {};
  if (isVerified !== undefined) updateData.isVerified = isVerified;
  if (rating !== undefined) updateData.rating = rating;
  if (totalTrips !== undefined) updateData.totalTrips = totalTrips;
  if (totalEarnings !== undefined) updateData.totalEarnings = totalEarnings;

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('No update data provided', {});
  }

  const updatedProfile = await db.driver.update({
    where: { userId: driverId },
    data: updateData,
  });

  return successResponse({
    ...existingDriver,
    driverProfile: updatedProfile,
  });
}

// ============================================
// DELETE - Delete a driver
// ============================================
async function deleteDriverHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const driverId = searchParams.get('driverId');

  if (!driverId) {
    throw new ValidationError('Driver ID is required', { driverId: ['Required'] });
  }

  // Verify driver exists
  const existingDriver = await db.user.findUnique({
    where: { id: driverId },
  });

  if (!existingDriver) {
    throw new NotFoundError('Driver');
  }

  // Delete driver (cascade will handle driver profile and locations)
  await db.user.delete({
    where: { id: driverId },
  });

  return successResponse(null, { message: 'Driver deleted successfully' });
}

// ============================================
// EXPORT ROUTES WITH MIDDLEWARE
// ============================================

export const GET = withMiddleware(getDriversHandler, {
  rateLimit: { max: 100, windowMs: 60000 },
  logRequests: true,
});

export const POST = withMiddleware(createDriverHandler, {
  rateLimit: { max: 10, windowMs: 60000 },
  logRequests: true,
});

export const PUT = withMiddleware(updateDriverHandler, {
  rateLimit: { max: 50, windowMs: 60000 },
  logRequests: true,
});

export const DELETE = withMiddleware(deleteDriverHandler, {
  rateLimit: { max: 20, windowMs: 60000 },
  logRequests: true,
});
