import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyResetCodeDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @ApiProperty({ example: '483920' })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  code: string;
}
