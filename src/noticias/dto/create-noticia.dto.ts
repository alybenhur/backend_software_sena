import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateNoticiaDto {
  @ApiProperty({ example: 'Nuevo avance tecnológico', description: 'Título de la noticia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @ApiPropertyOptional({
    example: 'Breve resumen de la noticia...',
    description: 'Resumen corto en texto plano',
  })
  @IsOptional()
  @IsString()
  resumen?: string;

  @ApiProperty({
    example: 'Contenido completo de la noticia en texto plano.',
    description: 'Contenido en texto plano',
  })
  @IsString()
  @IsNotEmpty()
  contenidoTexto: string;

  @ApiPropertyOptional({
    example: '<p>Contenido <strong>enriquecido</strong> en HTML.</p>',
    description: 'Contenido enriquecido en HTML',
  })
  @IsOptional()
  @IsString()
  contenidoHtml?: string;
}
