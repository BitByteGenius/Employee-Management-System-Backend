require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDb = require('./config/db');
const registerSocket = require('./sockets');

const port = Number(process.env.PORT || 5000);
const server = http.createServer(app);

registerSocket(server);

const listen = (targetPort) => {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && process.env.NODE_ENV !== 'production') {
      const nextPort = targetPort + 1;
      console.warn(`Port ${targetPort} is already in use. Trying ${nextPort}...`);
      listen(nextPort);
      return;
    }
    console.error('Failed to start server', error);
    process.exit(1);
  });

  server.listen(targetPort, () => console.log(`TMS API running on ${targetPort}`));
};

connectDb()
  .then(() => listen(port))
  .catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
