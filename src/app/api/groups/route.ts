import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, string> = {};
    if (status) where.status = status;

    const groups = await db.group.findMany({
      where,
      include: {
        members: {
          include: {
            user: {
              include: {
                driverProfile: true,
              },
            },
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await db.group.count({ where });

    return NextResponse.json({
      success: true,
      data: groups,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST - Create a new group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, wilayaFrom, wilayaTo, maxMembers, createdBy } = body;

    if (!name || !wilayaFrom || !wilayaTo || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Name, wilayas, and creator are required' },
        { status: 400 }
      );
    }

    // Create group and add creator as leader
    const group = await db.group.create({
      data: {
        name,
        description,
        wilayaFrom,
        wilayaTo,
        maxMembers: maxMembers || 10,
        createdBy,
        members: {
          create: {
            userId: createdBy,
            role: 'leader',
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

// PUT - Update group status or add member
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, status, addMember, removeMember } = body;

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'Group ID is required' },
        { status: 400 }
      );
    }

    if (status) {
      const group = await db.group.update({
        where: { id: groupId },
        data: { status },
      });
      return NextResponse.json({ success: true, data: group });
    }

    if (addMember) {
      const member = await db.groupMember.create({
        data: {
          groupId,
          userId: addMember.userId,
          role: addMember.role || 'member',
        },
        include: {
          user: true,
        },
      });
      return NextResponse.json({ success: true, data: member });
    }

    if (removeMember) {
      await db.groupMember.delete({
        where: {
          id: removeMember,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'Group ID is required' },
        { status: 400 }
      );
    }

    await db.group.delete({
      where: { id: groupId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
