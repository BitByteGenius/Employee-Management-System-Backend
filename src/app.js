const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { setupSwagger } = require('./docs');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const isDevelopment = process.env.NODE_ENV !== 'production';
const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (isDevelopment && localDevOriginPattern.test(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`), false);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Setup Swagger UI Documentation at /api-docs
// setupSwagger(app);

// app.get('/health', (req, res) => res.json({ status: 'ok', service: 'tms-api' }));
// app.use('/api/v1', routes);
// app.use(errorHandler);
// Setup Swagger UI Documentation
setupSwagger(app);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TMS API is running successfully 🚀',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'tms-api',
  });
});

app.use('/api/v1', routes);

app.use(errorHandler);

module.exports = app;
