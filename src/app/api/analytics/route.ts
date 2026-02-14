import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // day, week, month

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get total counts
    const [
      totalDrivers,
      onlineDrivers,
      totalGroups,
      activeGroups,
      totalTrips,
      completedTrips,
      inProgressTrips,
    ] = await Promise.all([
      db.user.count({ where: { role: 'driver' } }),
      db.user.count({ where: { role: 'driver', status: 'online' } }),
      db.group.count(),
      db.group.count({ where: { status: 'active' } }),
      db.trip.count(),
      db.trip.count({ where: { status: 'completed' } }),
      db.trip.count({ where: { status: 'in_progress' } }),
    ]);

    // Get trips in date range for chart data
    const trips = await db.trip.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        price: true,
        status: true,
        wilayaFrom: true,
        wilayaTo: true,
      },
    });

    // Calculate earnings
    const totalEarnings = trips
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + (t.price || 0), 0);

    // Group trips by date for chart
    const tripsByDate: Record<string, { trips: number; earnings: number }> = {};
    
    trips.forEach((trip) => {
      const dateKey = trip.createdAt.toISOString().split('T')[0];
      if (!tripsByDate[dateKey]) {
        tripsByDate[dateKey] = { trips: 0, earnings: 0 };
      }
      tripsByDate[dateKey].trips++;
      if (trip.status === 'completed') {
        tripsByDate[dateKey].earnings += trip.price || 0;
      }
    });

    // Convert to array for charts
    const chartData = Object.entries(tripsByDate)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get popular routes
    const routeCounts: Record<string, { count: number; earnings: number }> = {};
    trips.forEach((trip) => {
      const key = `${trip.wilayaFrom} - ${trip.wilayaTo}`;
      if (!routeCounts[key]) {
        routeCounts[key] = { count: 0, earnings: 0 };
      }
      routeCounts[key].count++;
      if (trip.status === 'completed') {
        routeCounts[key].earnings += trip.price || 0;
      }
    });

    const topRoutes = Object.entries(routeCounts)
      .map(([route, data]) => ({
        route,
        ...data,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate average rating
    const drivers = await db.driver.findMany({
      select: { rating: true },
    });
    const avgRating = drivers.length > 0
      ? drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalDrivers,
          onlineDrivers,
          totalGroups,
          activeGroups,
          totalTrips,
          completedTrips,
          inProgressTrips,
          totalEarnings,
          avgRating,
        },
        chartData,
        topRoutes,
        period,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST - Record analytics snapshot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { totalTrips, activeDrivers, totalEarnings, avgRating, wilayaFrom, wilayaTo } = body;

    const analytics = await db.analytics.create({
      data: {
        totalTrips: totalTrips || 0,
        activeDrivers: activeDrivers || 0,
        totalEarnings: totalEarnings || 0,
        avgRating: avgRating || 0,
        wilayaFrom: wilayaFrom || 'N/A',
        wilayaTo: wilayaTo || 'N/A',
      },
    });

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error creating analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create analytics' },
      { status: 500 }
    );
  }
}
