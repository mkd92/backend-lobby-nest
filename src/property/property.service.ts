import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddPropertyDto } from './dto/addPropertyDto';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}
  async getAllProperty(userId: number) {
    try {
      const userWithProperties = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          properties: true,
        },
      });
      if (userWithProperties) return userWithProperties;
    } catch (e) {
      console.log(e);
      return { message: e.message };
    }
  }
  async addProperty(userId: number, dto: AddPropertyDto) {
    try {
      const userWithProperties = await this.prisma.property.create({
        data: {
          propertyName: dto.propertyName,
          propertyAddress: dto.propertyAddress,
          userId: userId,
        },
      });
      return userWithProperties;
    } catch (e) {
      console.log(e);
      return { message: e.message };
    }
  }
}
