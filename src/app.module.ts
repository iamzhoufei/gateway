import { RedisCacheModule } from './common/cache/redis-cache.module';
import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { getConfig } from './utils';

import { UserModule } from './user/user.module';

// ConfigModule 默认会从 项目根路径 载入并解析一个 .env 文件，并将文件内容与 process.env 合并环境变量键值对
// 并将结果存储到一个可以通过 ConfigService 访问的私有结构
@Module({
  imports: [
    RedisCacheModule,
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   useFactory: async () => {
    //     return {
    //       store: redisStore as any,
    //       host: getConfig('REDIS_CONFIG').host,
    //       port: getConfig('REDIS_CONFIG').port,
    //       db: getConfig('REDIS_CONFIG').db, //目标库,
    //       auth_pass: getConfig('REDIS_CONFIG').auth, // 密码,没有可以不写
    //     };
    //   },
    //   // store: redisStore as any,
    //   // host: getConfig('REDIS_CONFIG').host,
    //   // port: getConfig('REDIS_CONFIG').port,
    //   // auth_pass: getConfig('REDIS_CONFIG').auth,
    //   // // db: getConfig('REDIS_CONFIG').db,
    // }),
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [getConfig],
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
