import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  ValidationPipe,
  VersioningType,
  VERSION_NEUTRAL,
} from '@nestjs/common';

// 拦截器
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// 异常处理
import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { generateDocument } from './doc';

// declare const module: any;

async function bootstrap() {
  // 使用 fastify 作为底层框架
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 增加请求版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, '1', '2'],
  });

  // 增加全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 增加全局异常处理
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // 启动全局字段校验，保证请求接口字段校验正确
  app.useGlobalPipes(new ValidationPipe());

  // 创建文档
  generateDocument(app);

  // 添加热更新
  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close());
  // }

  // 开始监听端口
  await app.listen(5000);
}
bootstrap();
