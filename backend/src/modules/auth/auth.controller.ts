import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import {
  ApiDataResponse,
  ApiErrorResponses,
} from 'src/common/swagger/api-response.decorator';

import { AuthService } from './auth.service';
import { AuthResultDto, UserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  // Brute-force va spam registratsiyaga qarshi qattiqroq limit.
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ResponseMessage('Registration successful')
  @ApiOperation({ summary: 'Yangi foydalanuvchini ro`yxatdan o`tkazish' })
  @ApiDataResponse(AuthResultDto, {
    status: 201,
    description: 'Foydalanuvchi yaratildi va token qaytarildi',
  })
  @ApiErrorResponses(400, 409, 429)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ResponseMessage('Login successful')
  @ApiOperation({ summary: 'Tizimga kirish va JWT token olish' })
  @ApiDataResponse(AuthResultDto, { description: 'Token qaytarildi' })
  @ApiErrorResponses(400, 401, 403, 429)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ResponseMessage('Current user')
  @ApiOperation({ summary: 'Joriy foydalanuvchi ma`lumotlari' })
  @ApiDataResponse(UserDto, { description: 'Token egasining profili' })
  @ApiErrorResponses(401)
  getProfile(@CurrentUser('id') userId: number) {
    return this.authService.getProfile(userId);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ResponseMessage('Logout successful')
  @ApiOperation({
    summary: 'Tizimdan chiqish',
    description:
      'JWT stateless bo`lgani uchun server tokenni bekor qilmaydi — mijoz tokenni o`chiradi. ' +
      'Endpoint mavjudligi mijoz uchun yagona chiqish nuqtasi bo`lishi va kelajakda ' +
      'refresh token/blacklist qo`shilsa API o`zgarmasligi uchun.',
  })
  @ApiErrorResponses(401)
  logout(): null {
    return null;
  }
}
