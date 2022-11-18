import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetCurrentUserId, GetUser, Public } from './decorator';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { RtGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signup(dto);
  }
  @Public()
  @Post('local/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.login(dto);
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetUser('refresh_token') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
