import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { NoticiasService } from './noticias.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public, CurrentUser } from '../common/decorators/auth.decorator';
import { UserRole, NoticiaEstado } from '../common/enums/user-role.enum';

@ApiTags('Noticias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('noticias')
export class NoticiasController {
  constructor(private readonly noticiasService: NoticiasService) {}

  // ─── POST /noticias ───────────────────────────────────────────────────────────
  @Post()
  @Roles(UserRole.NOTICIAS)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('imagenes', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear noticia (Solo rol Noticias) — queda en PENDIENTE' })
  @ApiResponse({ status: 201, description: 'Noticia creada, pendiente de aprobación' })
  create(
    @Body() createNoticiaDto: CreateNoticiaDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: { id: string },
  ) {
    return this.noticiasService.create(createNoticiaDto, files, user.id);
  }

  // ─── GET /noticias ────────────────────────────────────────────────────────────
  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar noticias aprobadas (público)' })
  @ApiResponse({ status: 200, description: 'Lista de noticias aprobadas' })
  findAll() {
    return this.noticiasService.findAllAprobadas();
  }

  // ─── GET /noticias/admin ──────────────────────────────────────────────────────
  @Get('admin')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las noticias con filtro opcional (Solo Super Admin)' })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: NoticiaEstado,
    description: 'Filtrar por estado: pendiente | aprobada | rechazada',
  })
  @ApiResponse({ status: 200, description: 'Lista completa de noticias' })
  findAllAdmin(@Query('estado') estado?: NoticiaEstado) {
    return this.noticiasService.findAll(estado);
  }

  // ─── GET /noticias/mis-noticias ───────────────────────────────────────────────
  @Get('mis-noticias')
  @Roles(UserRole.NOTICIAS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver mis noticias (Solo rol Noticias)' })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: NoticiaEstado,
    description: 'Filtrar por estado: pendiente | aprobada | rechazada',
  })
  @ApiResponse({ status: 200, description: 'Lista de noticias del autor' })
  misNoticias(
    @CurrentUser() user: { id: string },
    @Query('estado') estado?: NoticiaEstado,
  ) {
    return this.noticiasService.findMisNoticias(user.id, estado);
  }

  // ─── GET /noticias/:id ────────────────────────────────────────────────────────
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener noticia por ID (público)' })
  @ApiResponse({ status: 200, description: 'Noticia encontrada' })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticiasService.findOne(id);
  }

  // ─── PATCH /noticias/:id ──────────────────────────────────────────────────────
  @Patch(':id')
  @Roles(UserRole.NOTICIAS)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('imagenes', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Editar noticia propia (Solo rol Noticias, solo si está PENDIENTE)' })
  @ApiResponse({ status: 200, description: 'Noticia actualizada' })
  @ApiResponse({ status: 403, description: 'No es el autor de la noticia' })
  @ApiResponse({ status: 400, description: 'La noticia no está en estado PENDIENTE' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoticiaDto: UpdateNoticiaDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: { id: string },
  ) {
    return this.noticiasService.update(id, updateNoticiaDto, files, user.id);
  }

  // ─── PATCH /noticias/:id/aprobar ──────────────────────────────────────────────
  @Patch(':id/aprobar')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprobar noticia (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Noticia aprobada' })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.noticiasService.aprobar(id);
  }

  // ─── PATCH /noticias/:id/rechazar ─────────────────────────────────────────────
  @Patch(':id/rechazar')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechazar noticia (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Noticia rechazada' })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  rechazar(@Param('id', ParseIntPipe) id: number) {
    return this.noticiasService.rechazar(id);
  }

  // ─── DELETE /noticias/:id ─────────────────────────────────────────────────────
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar noticia y sus imágenes (Solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Noticia eliminada' })
  @ApiResponse({ status: 404, description: 'Noticia no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticiasService.remove(id);
  }
}
