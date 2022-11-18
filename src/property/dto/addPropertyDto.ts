import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class AddPropertyDto {
  @IsString()
  @IsNotEmpty()
  propertyName: string;
  @IsString()
  @IsOptional()
  propertyAddress: string;
}
