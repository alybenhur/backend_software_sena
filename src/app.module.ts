import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Configuraciones
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import cloudinaryConfig from './config/cloudinary.config';
import appConfig from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SoftwareModule } from './software/software.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, cloudinaryConfig, appConfig],
      envFilePath: '.env',
    }),

    // TypeORM con MySQL
    TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    return configService.get('database')!;
  },
}),

    // Rate Limiting
 /*   ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL) || 60000,
        limit: parseInt(process.env.THROTTLE_LIMIT) || 10,
      },
    ]),*/

    // Aquí se agregarán los módulos de la aplicación
     AuthModule,
    UserModule,
    SoftwareModule,
    CloudinaryModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
