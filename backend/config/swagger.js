import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ping API',
      version: '1.0.0',
      description: 'API documentation for the Ping learning platform',
    },
    servers: [{ url: 'http://localhost:5000/api', description: 'Local dev server' }],
    // Reusable security scheme so we don't redefine JWT auth on every route
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  // Glob pattern: tells swagger-jsdoc where to look for the JSDoc annotations below
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);