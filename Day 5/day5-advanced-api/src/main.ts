import { NestFactory, HttpAdapterHost } from '@nestjs/core'; // <-- Import HttpAdapterHost
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'; // <-- 1. Import your new filter

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // --- Task 9: Apply Global Error Filter (Corrected) ---
  const httpAdapterHost = app.get(HttpAdapterHost); // <-- 1. Get the host object
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost)); // <-- 2. Pass the host object
  // ------------------------------------------

  // Task 3: Configure ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Task 7: Apply Global Interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Task 10: Setup Swagger
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const config = new DocumentBuilder()
    .setTitle(packageJson.name || 'NestJS API')
    .setDescription(packageJson.description || 'API documentation')
    .setVersion(packageJson.version || '1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();