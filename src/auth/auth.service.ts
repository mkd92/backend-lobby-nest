import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  async hash(data: string): Promise<string> {
    const hash = await argon.hash(data);
    return hash;
  }

  async signup(dto: AuthDto): Promise<Tokens> {
    const hash = await argon.hash(dto.password);

    const user = await this.prisma.user
      .create({
        data: {
          email: dto.email,
          hash: hash,
        },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new ForbiddenException('Credentials Taken');
          }
        }
        throw e;
      });
    const tokens = await this.signTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }
  async login(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }
    const tokens = await this.signTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }
  // logout
  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: { id: userId, hashedRt: { not: null } },
      data: { hashedRt: null },
    });
    return true;
  }
  // refresh tokens
  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access denied');
    const rtMatches = await argon.verify(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.signTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  // Helper methods
  async signTokens(userId: number, email: string): Promise<Tokens> {
    const payload = { sub: userId, email };
    const atSecret = 'at-secret';
    const rtSecret = 'rt-secret';
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: 60 * 15,
      secret: atSecret,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: 60 * 60 * 24 * 7,
      secret: rtSecret,
    });
    return { access_token: accessToken, refresh_token: refreshToken };
  }
  // update token
  async updateRefreshTokenHash(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hash = await this.hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }
}
