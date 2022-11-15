import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AppService],
})
export class AppModule {}
