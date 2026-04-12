import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NoticiaEstado } from '../../common/enums/user-role.enum';

@Entity('noticias')
export class Noticia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  resumen: string | null;

  @Column({ type: 'longtext' })
  contenidoTexto: string;

  @Column({ type: 'longtext', nullable: true })
  contenidoHtml: string | null;

  @Column({ type: 'text', nullable: true, name: 'url_imagenes' })
  imagenes: string | null;

  @Column({
    type: 'enum',
    enum: NoticiaEstado,
    default: NoticiaEstado.PENDIENTE,
  })
  estado: NoticiaEstado;

  @Column({ name: 'autor_id', nullable: true })
  autorId: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;
}
