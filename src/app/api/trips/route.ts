import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Price constants
const PRICE_PER_KM = 15;
const BASE_FARE = 100;

// GET - Fetch trips
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const userId = searchParams.get('userId');
    const groupId = searchParams.get('groupId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, string> = {};
    if (driverId) where.driverId = driverId;
    if (userId) where.userId = userId;
    if (groupId) where.groupId = groupId;
    if (status) where.status = status;

    const trips = await db.trip.findMany({
      where,
      include: {
        driver: {
          include: {
            driverProfile: true,
          },
        },
        group: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await db.trip.count({ where });

    return NextResponse.json({
      success: true,
      data: trips,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      driverId,
      userId,
      groupId,
      wilayaFrom,
      wilayaTo,
      distance,
      duration,
      passengers = 1,
    } = body;

    if (!driverId || !wilayaFrom || !wilayaTo) {
      return NextResponse.json(
        { success: false, error: 'Driver, origin, and destination are required' },
        { status: 400 }
      );
    }

    // Calculate price
    const calculatedDistance = distance || 100; // Default 100km if not provided
    const price = BASE_FARE + (calculatedDistance * PRICE_PER_KM);

    const trip = await db.trip.create({
      data: {
        driverId,
        userId,
        groupId,
        wilayaFrom,
        wilayaTo,
        distance: calculatedDistance,
        duration: duration || Math.round(calculatedDistance * 1.2), // ~1.2 min per km
        price,
        passengers,
        status: 'scheduled',
      },
      include: {
        driver: {
          include: {
            driverProfile: true,
          },
        },
      },
    });

    // Update driver's total trips
    await db.driver.update({
      where: { userId: driverId },
      data: {
        totalTrips: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}

// PUT - Update trip status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, status, startDate, endDate } = body;

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, string | Date> = {};
    if (status) updateData.status = status;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const trip = await db.trip.update({
      where: { id: tripId },
      data: updateData,
      include: {
        driver: {
          include: {
            driverProfile: true,
          },
        },
      },
    });

    // If trip completed, update driver earnings
    if (status === 'completed') {
      await db.driver.update({
        where: { userId: trip.driverId },
        data: {
          totalEarnings: { increment: trip.price },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}
