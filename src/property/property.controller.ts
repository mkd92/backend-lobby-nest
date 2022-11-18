import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetCurrentUserId } from 'src/auth/decorator';
import { PropertyService } from './property.service';
import { AddPropertyDto } from './dto/addPropertyDto';

@Controller('properties')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Get()
  getAllProperty(@GetCurrentUserId() userId: number) {
    return this.propertyService.getAllProperty(userId);
  }
  @Post()
  addProperty(
    @GetCurrentUserId() userId: number,
    @Body() property: AddPropertyDto,
  ) {
    return this.propertyService.addProperty(userId, property);
  }
}
