import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty() @IsString() customerId: string;
  @ApiProperty() @IsString() branchId: string;
  @ApiPropertyOptional() @IsString() @IsOptional() loanOfficerId?: string;
  @ApiProperty({ example: 'Personal' }) @IsString() loanType: string;
  @ApiProperty() @IsNumber() @Min(1000) principalAmount: number;
  @ApiProperty({ example: 0.12 }) @IsNumber() @Min(0.01) @Max(0.5) interestRate: number;
  @ApiProperty({ example: 24 }) @IsNumber() @Min(1) @Max(360) termMonths: number;
  @ApiPropertyOptional() @IsString() @IsOptional() purpose?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() collateral?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
}
