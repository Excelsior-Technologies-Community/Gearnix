const swaggerJSDoc = require('swagger-jsdoc');

/**
 * Swagger / OpenAPI definition.
 *
 * Route files under ./routes annotate their endpoints with @swagger JSDoc
 * blocks; swagger-jsdoc scans them (see `apis` below) to build the spec that
 * is served at /api-docs. As modules are added in later steps, their routes
 * are documented in place — no central list to maintain here.
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gearnix E-Commerce API',
      version: '1.0.0',
      description:
        'REST API for the Gearnix e-commerce platform. Built with Node.js, ' +
        'Express and MySQL Stored Procedures. Includes JWT auth, RBAC and ' +
        'Razorpay payments.',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Paths scanned for @swagger annotations.
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
