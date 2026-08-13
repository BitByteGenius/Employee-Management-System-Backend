const Notification = require('../models/Notification');

let io;

const setSocketServer = (server) => {
  io = server;
};

const notify = async (payload) => {
  const notification = await Notification.create(payload);
  if (io) io.to(`user:${payload.recipient}`).emit('notification:new', notification);
  return notification;
};

module.exports = { setSocketServer, notify };
