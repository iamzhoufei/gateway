import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheModule } from './common/cache/redis-cache.module';

import { getConfig } from './utils';

import { UserModule } from './user/user.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// ConfigModule 默认会从 项目根路径 载入并解析一个 .env 文件，并将文件内容与 process.env 合并环境变量键值对
// 并将结果存储到一个可以通过 ConfigService 访问的私有结构

// 通用模块
const SharedModule = [
  RedisCacheModule,
  ConfigModule.forRoot({
    ignoreEnvFile: true,
    isGlobal: true,
    load: [getConfig],
  }),
];
@Module({
  imports: [...SharedModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
