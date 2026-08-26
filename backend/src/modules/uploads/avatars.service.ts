import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/modules/prisma/prisma.service';

import { UploadedFileDto } from './dto/uploaded-file.dto';
import { UploadsService } from './uploads.service';

const AVATARS = 'avatars';

@Injectable()
export class AvatarsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

  /**
   * Yangi rasm saqlanadi, so'ng eskisi diskdan o'chiriladi. Tartib muhim:
   * avval yozib, keyin o'chirsak, saqlash muvaffaqiyatsiz bo'lganda
   * foydalanuvchi eski rasmisiz qolmaydi.
   */
  async replace(
    userId: number,
    file: Express.Multer.File | undefined,
  ): Promise<UploadedFileDto> {
    const current = await this.requireUser(userId);
    const url = await this.uploads.saveImage(AVATARS, file);

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
      select: { id: true },
    });

    await this.uploads.removeByUrl(current.avatarUrl);

    return { url };
  }

  async remove(userId: number): Promise<UploadedFileDto | null> {
    const current = await this.requireUser(userId);

    if (!current.avatarUrl) {
      return null;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: { id: true },
    });

    await this.uploads.removeByUrl(current.avatarUrl);

    return null;
  }

  private async requireUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
