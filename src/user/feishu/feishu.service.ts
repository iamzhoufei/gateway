import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '@/common/cache/redis-cache.service';

import {
  getAppToken,
  getTenanToken,
  // getUserAccessToken,
  // getUserToken,
  // refreshUserToken,
} from '@/helper/feishu/auth';
import { Cache } from 'cache-manager';
import { BusinessException } from '@/common/exceptions/business.exception';
import { messages } from '@/helper/feishu/message';

@Injectable()
export class FeishuService {
  private APP_TOKEN_CACHE_KEY;
  private TENANT_TOKEN_CACHE_KEY;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
    private redisCacheService: RedisCacheService,
  ) {
    this.APP_TOKEN_CACHE_KEY =
      this.configService.get('FEISHU_TOKEN_CACHE').APP_TOKEN_CACHE_KEY;

    this.TENANT_TOKEN_CACHE_KEY =
      this.configService.get('FEISHU_TOKEN_CACHE').TENANT_TOKEN_CACHE_KEY;
  }

  async getAppToken() {
    let appToken: string;
    appToken = await this.redisCacheService.cacheGet(this.APP_TOKEN_CACHE_KEY);

    if (!appToken) {
      const response = await getAppToken();
      if (response.code === 0) {
        // token 有效期为 2 小时，在此期间调用该接口 token 不会改变。当 token 有效期小于 30 分的时候,再次请求获取 token 的时候，会生成一个新的 token，与此同时老的 token 依然有效。
        appToken = response.app_access_token;
        this.redisCacheService.cacheSet(
          this.APP_TOKEN_CACHE_KEY,
          appToken,
          response.expire - 60,
        );
      } else {
        throw new BusinessException('飞书调用异常');
      }
    }
    return appToken;
  }

  async getTenantToken() {
    let tenantToken: string;
    tenantToken = await this.cacheManager.get(this.TENANT_TOKEN_CACHE_KEY);
    if (!tenantToken) {
      const response = await getTenanToken();
      if (response.code === 0) {
        // token 有效期为 2 小时，在此期间调用该接口 token 不会改变。当 token 有效期小于 30 分的时候,再次请求获取 token 的时候，会生成一个新的 token，与此同时老的 token 依然有效。
        // appToken = response.app_access_token;
        tenantToken = response.tenant_access_token;
        this.cacheManager.set(this.TENANT_TOKEN_CACHE_KEY, tenantToken, {
          ttl: response.expire - 60,
        } as any);
      } else {
        throw new BusinessException('飞书调用异常');
      }
    }
    return tenantToken;
  }

  async sendMessage(receive_id_type, params) {
    const app_token = await this.getAppToken();
    return messages(receive_id_type, params, app_token as string);
  }

  async sendMessageByTenant(receive_id_type, params) {
    const tenant_token = await this.getTenantToken();
    return messages(receive_id_type, params, tenant_token as string);
  }
}
