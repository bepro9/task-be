import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description too long' })
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean; // default false from schema
}
