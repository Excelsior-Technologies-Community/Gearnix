require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const { testConnection } = require('./config/db');
const swaggerSpec = require('./swagger/swagger');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Core middleware ────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── API routes ─────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Swagger docs ───────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Root ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Gearnix API',
    docs: '/api-docs',
    health: '/api/health',
  });
});

// ─── Error handling (must be last) ──────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ───────────────────────────────────────────
async function start() {
  try {
    await testConnection();
  } catch (err) {
    // The DB may not exist yet on first setup — warn but keep the server up
    // so /api/health and /api-docs are still reachable while you configure it.
    console.warn('⚠️  MySQL not reachable yet:', err.message);
    console.warn('    Update backend/.env and create the database, then restart.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Gearnix API listening on http://localhost:${PORT}`);
    console.log(`📚 Swagger docs at   http://localhost:${PORT}/api-docs`);
  });
}

start();
