import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthenticatedUser } from 'src/common/types/authenticated-user.type';
import { EnvironmentVariables } from 'src/config/env.validation';
import { Prisma } from 'src/generated/prisma/client';
import { UserRole } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';

const SALT_ROUNDS = 10;

export interface PublicUser {
  id: number;
  fullname: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    // Avval `findUnique` bilan tekshirmaymiz: ikkita parallel so'rov orasida
    // race condition bo'ladi. Unique constraint'ning o'zi yagona ishonchli manba.
    const user = await this.prisma.user
      .create({
        data: {
          fullname: dto.fullname,
          email: dto.email,
          password: await bcrypt.hash(dto.password, SALT_ROUNDS),
          role: UserRole.DOCTOR,
          doctorProfile: { create: {} },
        },
      })
      .catch((error: unknown) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('A user with this email already exists');
        }

        throw error;
      });

    return this.buildAuthResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      omit: { password: false },
    });

    // Foydalanuvchi topilmagan holatda ham bcrypt chaqiriladi —
    // javob vaqti bo'yicha email mavjudligini aniqlab bo'lmaydi.
    const passwordMatches = await bcrypt.compare(
      dto.password,
      user?.password ??
        '$2b$10$invalidhashinvalidhashinvalidhashinvalidhashinvalidha',
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('This account has been deactivated');
    }

    return this.buildAuthResult(this.toPublicUser(user));
  }

  async getProfile(userId: number): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return user;
  }

  /** Parolni tashqariga chiqmasligini tip darajasida kafolatlaydi. */
  private toPublicUser(user: PublicUser & { password: string }): PublicUser {
    return {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private buildAuthResult(user: PublicUser): AuthResult {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: this.configService.get('JWT_EXPIRES_IN', { infer: true }),
      user,
    };
  }
}

export type { AuthenticatedUser };
