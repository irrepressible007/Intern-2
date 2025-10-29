import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- 1. This is the import line you asked for

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. This is where you use it
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();