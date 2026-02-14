import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch locations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (userId) {
      // Get latest location for a specific user
      const location = await db.location.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            include: {
              driverProfile: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: location,
      });
    }

    // Get latest locations for all drivers
    const users = await db.user.findMany({
      where: { role: 'driver' },
      include: {
        driverProfile: true,
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    const locations = users
      .filter((user) => user.locations.length > 0)
      .map((user) => ({
        ...user,
        location: user.locations[0],
      }))
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST - Update or create location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, latitude, longitude, heading, speed } = body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'UserId, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const location = await db.location.create({
      data: {
        userId,
        latitude,
        longitude,
        heading,
        speed,
      },
    });

    // Update user status to online
    await db.user.update({
      where: { id: userId },
      data: { status: 'online' },
    });

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

// DELETE - Clean old locations (older than 24 hours)
export async function DELETE(request: NextRequest) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const result = await db.location.deleteMany({
      where: {
        timestamp: {
          lt: yesterday,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error('Error cleaning locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clean locations' },
      { status: 500 }
    );
  }
}
