import { IsString, IsEmail, IsOptional, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiPropertyOptional() @IsEmail() @IsOptional() email?: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsString() nationalId: string;
  @ApiProperty() @IsDateString() dateOfBirth: string;
  @ApiProperty() @IsString() address: string;
  @ApiProperty() @IsString() city: string;
  @ApiPropertyOptional() @IsString() @IsOptional() occupation?: string;
  @ApiProperty() @IsNumber() @Min(0) monthlyIncome: number;
  @ApiProperty() @IsString() branchId: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
