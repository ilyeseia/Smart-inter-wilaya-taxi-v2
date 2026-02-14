// Socket.io handler for Smart Inter-Wilaya Taxi v2
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

// Type definitions for socket events
interface LocationUpdatePayload {
  userId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

interface MessagePayload {
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'location' | 'image';
}

interface TripUpdatePayload {
  tripId: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  driverId: string;
}

interface DriverStatusPayload {
  driverId: string;
  status: 'online' | 'offline' | 'busy';
}

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/api/socket',
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`[Socket] User ${userId} joined their room`);
    });

    // Join a group chat
    socket.on('join-group', (groupId: string) => {
      socket.join(`group:${groupId}`);
      console.log(`[Socket] Client joined group: ${groupId}`);
    });

    // Leave a group chat
    socket.on('leave-group', (groupId: string) => {
      socket.leave(`group:${groupId}`);
      console.log(`[Socket] Client left group: ${groupId}`);
    });

    // Handle location updates from drivers
    socket.on('location-update', (payload: LocationUpdatePayload) => {
      // Broadcast to all clients tracking this driver
      io?.emit('driver-location', payload);
      console.log(`[Socket] Location update from user ${payload.userId}`);
    });

    // Handle chat messages
    socket.on('send-message', (payload: MessagePayload) => {
      if (payload.groupId) {
        // Group message
        io?.to(`group:${payload.groupId}`).emit('new-message', payload);
      } else if (payload.receiverId) {
        // Direct message
        io?.to(`user:${payload.receiverId}`).emit('new-message', payload);
      }
      console.log(`[Socket] Message from ${payload.senderId}`);
    });

    // Handle trip updates
    socket.on('trip-update', (payload: TripUpdatePayload) => {
      io?.emit('trip-status', payload);
      console.log(`[Socket] Trip ${payload.tripId} status: ${payload.status}`);
    });

    // Handle driver status changes
    socket.on('driver-status', (payload: DriverStatusPayload) => {
      io?.emit('driver-status-change', payload);
      console.log(`[Socket] Driver ${payload.driverId} status: ${payload.status}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}

// Emit helper functions
export function emitLocationUpdate(payload: LocationUpdatePayload): void {
  io?.emit('driver-location', payload);
}

export function emitNewMessage(payload: MessagePayload): void {
  if (payload.groupId) {
    io?.to(`group:${payload.groupId}`).emit('new-message', payload);
  } else if (payload.receiverId) {
    io?.to(`user:${payload.receiverId}`).emit('new-message', payload);
  }
}

export function emitTripUpdate(payload: TripUpdatePayload): void {
  io?.emit('trip-status', payload);
}

export function emitDriverStatus(payload: DriverStatusPayload): void {
  io?.emit('driver-status-change', payload);
}
