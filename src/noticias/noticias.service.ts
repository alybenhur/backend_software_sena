import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Noticia } from './entities/noticia.entity';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NoticiaEstado } from '../common/enums/user-role.enum';

@Injectable()
export class NoticiasService {
  constructor(
    @InjectRepository(Noticia)
    private noticiaRepository: Repository<Noticia>,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ─── Crear ────────────────────────────────────────────────────────────────────

  async create(
    createNoticiaDto: CreateNoticiaDto,
    files: Express.Multer.File[],
    autorId: string,
  ): Promise<Noticia> {
    let imagenes: string | undefined;

    if (files && files.length > 0) {
      const urls = await this.cloudinaryService.uploadImages(files);
      imagenes = urls.join(',');
    }

    const noticia = this.noticiaRepository.create({
      ...createNoticiaDto,
      imagenes,
      autorId,
      estado: NoticiaEstado.PENDIENTE,
    });

    return this.noticiaRepository.save(noticia);
  }

  // ─── Listar aprobadas (público) ───────────────────────────────────────────────

  async findAllAprobadas(): Promise<Noticia[]> {
    return this.noticiaRepository.find({
      where: { estado: NoticiaEstado.APROBADA },
      order: { fechaCreacion: 'DESC' },
    });
  }

  // ─── Listar todas (admin) ─────────────────────────────────────────────────────

  async findAll(estado?: NoticiaEstado): Promise<Noticia[]> {
    const where = estado ? { estado } : {};
    return this.noticiaRepository.find({
      where,
      order: { fechaCreacion: 'DESC' },
    });
  }

  // ─── Listar noticias propias (rol NOTICIAS) ───────────────────────────────────

  async findMisNoticias(autorId: string, estado?: NoticiaEstado): Promise<Noticia[]> {
    const where: any = { autorId };
    if (estado) where.estado = estado;

    return this.noticiaRepository.find({
      where,
      order: { fechaCreacion: 'DESC' },
    });
  }

  // ─── Obtener una ──────────────────────────────────────────────────────────────

  async findOne(id: number): Promise<Noticia> {
    const noticia = await this.noticiaRepository.findOne({ where: { id } });

    if (!noticia) {
      throw new NotFoundException(`Noticia con ID ${id} no encontrada`);
    }

    return noticia;
  }

  // ─── Actualizar (solo autor, solo si está PENDIENTE) ──────────────────────────

  async update(
    id: number,
    updateNoticiaDto: UpdateNoticiaDto,
    files: Express.Multer.File[],
    usuarioId: string,
  ): Promise<Noticia> {
    const noticia = await this.findOne(id);

    if (noticia.autorId !== usuarioId) {
      throw new ForbiddenException('Solo el autor puede editar esta noticia');
    }

    if (noticia.estado !== NoticiaEstado.PENDIENTE) {
      throw new BadRequestException(
        'Solo se pueden editar noticias en estado PENDIENTE',
      );
    }

    // 1. Eliminar imágenes indicadas de Cloudinary
    if (updateNoticiaDto.imagenesAEliminar) {
      const urlsAEliminar = updateNoticiaDto.imagenesAEliminar
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      for (const url of urlsAEliminar) {
        const publicId = this.cloudinaryService.extractPublicId(url);
        await this.cloudinaryService.deleteImage(publicId);
      }

      const urlsActuales = noticia.imagenes
        ? noticia.imagenes.split(',').map((u) => u.trim())
        : [];

      const urlsRestantes = urlsActuales.filter(
        (u) => !urlsAEliminar.includes(u),
      );

      noticia.imagenes = urlsRestantes.length > 0 ? urlsRestantes.join(',') : null;
    }

    // 2. Subir nuevas imágenes
    if (files && files.length > 0) {
      const nuevasUrls = await this.cloudinaryService.uploadImages(files);
      const urlsActuales = noticia.imagenes
        ? noticia.imagenes.split(',').map((u) => u.trim())
        : [];

      noticia.imagenes = [...urlsActuales, ...nuevasUrls].filter(Boolean).join(',');
    }

    // 3. Aplicar campos del DTO
    const { imagenesAEliminar, ...camposActualizar } = updateNoticiaDto;
    Object.assign(noticia, camposActualizar);

    return this.noticiaRepository.save(noticia);
  }

  // ─── Aprobar (super admin) ────────────────────────────────────────────────────

  async aprobar(id: number): Promise<Noticia> {
    const noticia = await this.findOne(id);

    if (noticia.estado === NoticiaEstado.APROBADA) {
      throw new BadRequestException('La noticia ya está aprobada');
    }

    noticia.estado = NoticiaEstado.APROBADA;
    return this.noticiaRepository.save(noticia);
  }

  // ─── Rechazar (super admin) ───────────────────────────────────────────────────

  async rechazar(id: number): Promise<Noticia> {
    const noticia = await this.findOne(id);

    if (noticia.estado === NoticiaEstado.RECHAZADA) {
      throw new BadRequestException('La noticia ya está rechazada');
    }

    noticia.estado = NoticiaEstado.RECHAZADA;
    return this.noticiaRepository.save(noticia);
  }

  // ─── Eliminar (super admin) ───────────────────────────────────────────────────

  async remove(id: number): Promise<void> {
    const noticia = await this.findOne(id);

    if (noticia.imagenes) {
      const urls = noticia.imagenes.split(',').map((u) => u.trim());
      for (const url of urls) {
        const publicId = this.cloudinaryService.extractPublicId(url);
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    await this.noticiaRepository.remove(noticia);
  }
}
