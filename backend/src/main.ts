import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /\.onrender\.com$/.test(origin) ||
        /\.railway\.app$/.test(origin);
      callback(null, allowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  const port = process.env.PORT || 3001;
  await app.listen(port);
  const config = app.get(ConfigService);
  const users = app.get(UsersService);
  const adminEmail = config.get<string>('ADMIN_EMAIL');
  const adminPassword = config.get<string>('ADMIN_PASSWORD');
  if (adminEmail && adminPassword) {
    await users.ensureAdminUser(adminEmail, adminPassword);
  }
  console.log(`Backend running at http://localhost:${port}`);
}
bootstrap();
