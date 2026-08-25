import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthenticatedUser } from 'src/common/types/authenticated-user.type';
import { EnvironmentVariables } from 'src/config/env.validation';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<EnvironmentVariables, true>,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    });
  }

  /**
   * Har bir so'rovda bazadan o'qiymiz, chunki token ichidagi `role` eskirgan
   * bo'lishi mumkin (admin roli o'zgartirilgan yoki hisob o'chirilgan holat).
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer has access');
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
