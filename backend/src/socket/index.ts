import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.cors.origin,
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token as string, env.jwt.secret) as { id: string; role: string };
      (socket as any).userId = decoded.id;
      (socket as any).userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const userRole = (socket as any).userRole;

    // Join personal room
    socket.join(`user:${userId}`);

    // Join role-based rooms
    if (['super_admin', 'admin', 'manager'].includes(userRole)) {
      socket.join('admin');
    }
    if (userRole === 'kitchen_staff') {
      socket.join('kitchen');
    }
    if (userRole === 'rider') {
      socket.join(`rider:${userId}`);
    }

    // Join branch room
    socket.on('join:branch', (branchId: string) => {
      socket.join(`branch:${branchId}`);
    });

    // Join order room
    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      // Cleanup handled automatically by socket.io
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Emit helpers
export const emitOrderUpdate = (orderId: string, data: any) => {
  if (!io) return;
  io.to(`order:${orderId}`).to('admin').emit('order:updated', data);
};

export const emitNewOrder = (branchId: string, data: any) => {
  if (!io) return;
  io.to(`branch:${branchId}`).to('admin').emit('order:new', data);
};

export const emitKitchenUpdate = (branchId: string, data: any) => {
  if (!io) return;
  io.to(`branch:${branchId}`).to('kitchen').emit('kitchen:updated', data);
};

export const emitRiderUpdate = (riderId: string, data: any) => {
  if (!io) return;
  io.to(`rider:${riderId}`).emit('rider:update', data);
};

export const emitInventoryAlert = (branchId: string, data: any) => {
  if (!io) return;
  io.to(`branch:${branchId}`).to('admin').emit('inventory:alert', data);
};

export const emitDashboardRefresh = () => {
  if (!io) return;
  io.to('admin').emit('dashboard:refresh');
};
