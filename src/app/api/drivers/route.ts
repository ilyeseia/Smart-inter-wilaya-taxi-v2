import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch drivers with profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const wilaya = searchParams.get('wilaya');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const userWhere: Record<string, string | Record<string, string>> = { role: 'driver' };
    if (status) userWhere.status = status;

    const driverWhere: Record<string, string> = {};
    if (wilaya) driverWhere.wilaya = wilaya;

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
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    // Filter out users without driver profiles if wilaya filter is applied
    const filteredDrivers = wilaya 
      ? drivers.filter((d) => d.driverProfile !== null)
      : drivers;

    const total = await db.user.count({ where: userWhere });

    return NextResponse.json({
      success: true,
      data: filteredDrivers,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

// POST - Create a new driver with profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      phone,
      language = 'ar',
      licenseNumber,
      vehiclePlate,
      vehicleType = 'sedan',
      vehicleColor,
      vehicleCapacity = 4,
      wilaya,
    } = body;

    if (!email || !name || !licenseNumber || !vehiclePlate || !wilaya) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user and driver profile in transaction
    const driver = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          phone,
          role: 'driver',
          language,
          status: 'offline',
        },
      });

      const profile = await tx.driver.create({
        data: {
          userId: user.id,
          licenseNumber,
          vehiclePlate,
          vehicleType,
          vehicleColor,
          vehicleCapacity,
          wilaya,
        },
      });

      return { ...user, driverProfile: profile };
    });

    return NextResponse.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create driver' },
      { status: 500 }
    );
  }
}

// PUT - Update driver status or profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, userId, status, isVerified, rating, totalTrips, totalEarnings } = body;

    const id = driverId || userId;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    // Update user status
    if (status) {
      const user = await db.user.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, data: user });
    }

    // Update driver profile
    const updateData: Record<string, boolean | number> = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (rating !== undefined) updateData.rating = rating;
    if (totalTrips !== undefined) updateData.totalTrips = totalTrips;
    if (totalEarnings !== undefined) updateData.totalEarnings = totalEarnings;

    if (Object.keys(updateData).length > 0) {
      const driver = await db.driver.update({
        where: { userId: id },
        data: updateData,
      });
      return NextResponse.json({ success: true, data: driver });
    }

    return NextResponse.json(
      { success: false, error: 'No update data provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update driver' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a driver
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: { id: driverId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete driver' },
      { status: 500 }
    );
  }
}
