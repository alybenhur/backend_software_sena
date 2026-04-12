import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticiasService } from './noticias.service';
import { NoticiasController } from './noticias.controller';
import { Noticia } from './entities/noticia.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Noticia]),
    CloudinaryModule,
  ],
  controllers: [NoticiasController],
  providers: [NoticiasService],
})
export class NoticiasModule {}
