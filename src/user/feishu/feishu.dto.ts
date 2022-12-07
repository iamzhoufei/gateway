import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { RECEIVE_TYPE, MSG_TYPE } from '@/helper/feishu/message';

export class FeishuMessageDto {
  @IsNotEmpty()
  @IsEnum(RECEIVE_TYPE)
  @ApiProperty({ example: 'email', enum: RECEIVE_TYPE })
  receive_id_type: RECEIVE_TYPE;

  @IsNotEmpty()
  @ApiProperty({ example: 'iamzhoufei@gmail.com' })
  receive_id?: string;

  @IsNotEmpty()
  @ApiProperty({ example: '{"text":" test content"}' })
  content?: string;

  @IsNotEmpty()
  @IsEnum(MSG_TYPE)
  @ApiProperty({ example: 'text', enum: MSG_TYPE })
  msg_type?: MSG_TYPE;
}

export class GetUserTokenDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'f97q0462b16142d893e04d2a6b6ff969',
    description: '飞书临时登录凭证',
  })
  code: string;
  app_token: string;
}
