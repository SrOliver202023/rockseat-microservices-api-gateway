/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      //CSP para mitigar ataques XSS
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          stylesSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    credentials: true,
    maxAge: 86400, // 24 hrs
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Marketplace API Gateway')
    .setDescription(
      `
    API Gateway for Marketplace Microservices
    
    Services Available:
    - Users Service**: User authentication and management
    - Products Service**: Catalog and product management
    - Checkouts Service**: Checkouts and order processing
    - Pyaments Service**: Payment processing

    Authentication:
    - Use JWT Bearer token to protected routes
    - Use Session token to validate session

    `,
    )
    .setVersion('1.0')
    .setContact(
      'Marketplace Team',
      'https://www.marketplace.com',
      'dev@marketplace.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-session-token',
        in: 'header',
        description: 'Sessiontoken for user validation',
      },
      'session-auth',
    )
    .addTag('Authentication', 'Endpoints to authentication and authorization')
    .addTag('Users', 'Endpoints to manage users')
    .addTag('Products', 'Endpoints to manage products catalog')
    .addTag('Checkouts', 'Endpoints to manage checkouts and orders')
    .addTag('Payments', 'Endpoints to manage payments')
    .addTag('Health', 'Endpoints to check service health')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3005;

  await app.listen(port);

  console.log(`🚀 API Gateway running on port ${port}`);
  console.log(`📚 Swagger documentation: <http://localhost>:${port}/api`);
}

bootstrap();
