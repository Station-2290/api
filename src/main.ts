import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { winston_config } from './shared/logger/winston.config';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ValidationExceptionFilter } from './shared/filters/validation-exception.filter';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winston_config),
  });

  // Get the HTTP adapter for the global exception filter
  const http_adapter_host = app.get(HttpAdapterHost);
  const configService = app.get(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters (order matters - specific to generic)
  app.useGlobalFilters(
    new AllExceptionsFilter(http_adapter_host),
    new HttpExceptionFilter(),
    new ValidationExceptionFilter(),
  );

  app.set('trust proxy', 'loopback');

  app.setGlobalPrefix('api');

  app.use(cookieParser());
  app.use(compression());
  app.use(helmet());

  // CORS configuration - supports both development and production origins
  const corsOrigins = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = corsOrigins
    ? corsOrigins.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:8081',
      ];

  console.log('🔧 CORS Configuration:');
  console.log('  Raw CORS_ORIGIN env var:', corsOrigins);
  console.log('  Parsed allowed origins:', allowedOrigins);

  app.enableCors({
    credentials: true,
    origin: (origin, callback) => {
      console.log('🌐 CORS request from origin:', origin);
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        console.log('✅ Allowing request with no origin');
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log('✅ Origin allowed:', origin);
        return callback(null, true);
      }

      console.log('❌ Origin blocked:', origin);
      console.log('  Allowed origins:', allowedOrigins);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 200,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Coffee Shop API')
    .setDescription(
      `RESTful API for managing a coffee shop including products, categories, customers, and orders.
      
      ## Features
      - Product management with categories
      - Customer management
      - Order processing with status tracking
      - Real-time order notifications via Server-Sent Events (SSE)
      - Pagination support on all list endpoints
      - Comprehensive error handling
      - Request/response logging
      
      ## Authentication
      The API supports JWT token authentication and API key authentication. 
      SSE endpoints require API key authentication for tablet access.
      `,
    )
    .setVersion('1.0')
    .addTag('health', 'Health check endpoint')
    .addTag('categories', 'Manage product categories')
    .addTag('products', 'Manage coffee shop products')
    .addTag('customers', 'Manage customer information')
    .addTag('orders', 'Process and track orders')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'Manage users')
    .addTag('api-keys', 'Manage API keys')
    .addTag('events', 'Real-time order events via Server-Sent Events')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token authentication',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API key authentication',
      },
      'api-key',
    )
    .build();

  const document_factory = () =>
    SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controller_key: string, method_key: string) =>
        `${controller_key}_${method_key}`,
    });

  SwaggerModule.setup('docs', app, document_factory, {
    jsonDocumentUrl: 'docs/api-json',
    yamlDocumentUrl: 'docs/api-yaml',
    urls: [
      {
        url: 'docs/api-json',
        name: 'JSON',
      },
      {
        url: 'docs/api-yaml',
        name: 'YAML',
      },
    ],
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Coffee Shop API Documentation',
  });

  // Export OpenAPI specification files for local development (optional)
  if (
    configService.get<string>('app.mode') === 'development' &&
    process.env.EXPORT_OPENAPI === 'true'
  ) {
    const document = document_factory();
    const output_path = path.resolve(process.cwd(), 'docs');

    // Ensure docs directory exists
    if (!fs.existsSync(output_path)) {
      fs.mkdirSync(output_path, { recursive: true });
    }

    // Export specifications
    fs.writeFileSync(
      path.join(output_path, 'openapi-spec.json'),
      JSON.stringify(document, null, 2),
    );

    fs.writeFileSync(
      path.join(output_path, 'openapi-spec.yaml'),
      yaml.dump(document, { noRefs: true, skipInvalid: true }),
    );

    console.log('✅ OpenAPI specifications exported for development:');
    console.log(`   JSON: ${path.join(output_path, 'openapi-spec.json')}`);
    console.log(`   YAML: ${path.join(output_path, 'openapi-spec.yaml')}`);
  }

  await app.listen(configService.getOrThrow<number>('app.port'));
}

void bootstrap();
