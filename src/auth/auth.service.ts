import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const { password, ...result } = user;
    const token = this.generateToken(user);

    return {
      user: result,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const { password, ...result } = user;
    const token = this.generateToken(user);

    return {
      user: result,
      access_token: token,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('No existe una cuenta con ese correo');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    user.resetCode = code;
    user.resetCodeExpiry = expiry;
    await this.userRepository.save(user);

    await this.mailService.sendPasswordResetCode(user.email, code);

    return { message: 'Se envió un código de verificación a tu correo' };
  }

  async verifyResetCode(dto: VerifyResetCodeDto): Promise<{ resetToken: string }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user || !user.resetCode || !user.resetCodeExpiry) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (user.resetCode !== dto.code) {
      throw new BadRequestException('El código ingresado es incorrecto');
    }

    if (new Date() > user.resetCodeExpiry) {
      user.resetCode = null;
      user.resetCodeExpiry = null;
      await this.userRepository.save(user);
      throw new BadRequestException('El código ha expirado, solicita uno nuevo');
    }

    user.resetCode = null;
    user.resetCodeExpiry = null;
    await this.userRepository.save(user);

    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'password-reset' },
      { expiresIn: '15m' },
    );

    return { resetToken };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    let payload: { sub: string; purpose: string };

    try {
      payload = this.jwtService.verify(dto.resetToken);
    } catch {
      throw new BadRequestException('El token es inválido o ha expirado');
    }

    if (payload.purpose !== 'password-reset') {
      throw new BadRequestException('Token no válido para este propósito');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}