import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token temporal obtenido al verificar el código' })
  @IsString()
  resetToken: string;

  @ApiProperty({ example: 'NuevaContraseña123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}
