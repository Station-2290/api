import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class ChangeRoleDto {
  @ApiProperty({
    enum: Role,
    example: Role.MANAGER,
    description: 'New role for the user',
  })
  @IsEnum(Role)
  role: Role;
}
