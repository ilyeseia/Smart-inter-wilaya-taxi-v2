import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');
    const groupId = searchParams.get('groupId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (groupId) {
      // Get group messages
      const messages = await db.message.findMany({
        where: { groupId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: messages.reverse(),
      });
    }

    if (senderId && receiverId) {
      // Get direct messages between two users
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: messages.reverse(),
      });
    }

    // Get all recent conversations for a user
    if (senderId) {
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId },
            { receiverId: senderId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: messages,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, groupId, content, type = 'text' } = body;

    if (!senderId || !content) {
      return NextResponse.json(
        { success: false, error: 'SenderId and content are required' },
        { status: 400 }
      );
    }

    if (!receiverId && !groupId) {
      return NextResponse.json(
        { success: false, error: 'Either receiverId or groupId is required' },
        { status: 400 }
      );
    }

    const message = await db.message.create({
      data: {
        senderId,
        receiverId,
        groupId,
        content,
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PUT - Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageIds, receiverId, groupId } = body;

    if (messageIds && Array.isArray(messageIds)) {
      await db.message.updateMany({
        where: {
          id: { in: messageIds },
        },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true });
    }

    if (receiverId) {
      await db.message.updateMany({
        where: {
          receiverId,
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true });
    }

    if (groupId) {
      await db.message.updateMany({
        where: {
          groupId,
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'No update criteria provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update messages' },
      { status: 500 }
    );
  }
}
