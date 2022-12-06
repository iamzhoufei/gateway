import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserProviders } from './user.providers';

import { FeishuService } from './feishu/feishu.service';
import { FeishuController } from './feishu/feishu.controller';

import { RedisCacheService } from '@/common/cache/redis-cache.service';

import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FeishuController, UserController],
  providers: [...UserProviders, FeishuService, UserService, RedisCacheService],
  exports: [UserService],
})
export class UserModule {}
