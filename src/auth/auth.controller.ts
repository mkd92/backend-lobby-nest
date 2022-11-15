import { Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('signup')
  signup() {
    return 'signup';
  }
  @Get('login')
  login() {
    return 'login';
  }
}
