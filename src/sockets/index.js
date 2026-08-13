const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { setSocketServer } = require('../services/notificationService');

const registerSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN?.split(',') || true, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next();
      socket.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return next();
    } catch (error) {
      return next(error);
    }
  });

  io.on('connection', (socket) => {
    if (socket.user?.sub) socket.join(`user:${socket.user.sub}`);
  });

  setSocketServer(io);
  return io;
};

module.exports = registerSocket;
