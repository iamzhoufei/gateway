import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddUserDto {
  @ApiProperty({ example: '123' })
  id?: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'is name' })
  name: string;

  @IsNotEmpty()
  @ApiProperty({ example: '123@gmail.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'is username' })
  username: string;
}
