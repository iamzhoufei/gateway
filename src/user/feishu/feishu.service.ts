import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

import { RedisCacheService } from '@/common/cache/redis-cache.service';
import { BusinessException } from '@/common/exceptions/business.exception';
import { messages } from '@/helper/feishu/message';

import {
  getAppToken,
  getTenantToken,
  getUserToken,
  refreshUserToken,
  // getUserAccessToken,
  // refreshUserToken,
} from '@/helper/feishu/auth';
import { GetUserTokenDto } from './feishu.dto';
import { BUSINESS_ERROR_CODE } from '@/common/exceptions/business.error.codes';

@Injectable()
export class FeishuService {
  private APP_TOKEN_CACHE_KEY;
  private TENANT_TOKEN_CACHE_KEY;
  private USER_TOKEN_CACHE_KEY;
  private USER_REFRESH_TOKEN_CACHE_KEY;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
    private redisCacheService: RedisCacheService,
  ) {
    this.APP_TOKEN_CACHE_KEY =
      this.configService.get('FEISHU_TOKEN_CACHE').APP_TOKEN_CACHE_KEY;

    this.TENANT_TOKEN_CACHE_KEY =
      this.configService.get('FEISHU_TOKEN_CACHE').TENANT_TOKEN_CACHE_KEY;

    this.USER_TOKEN_CACHE_KEY =
      this.configService.get('FEISHU_TOKEN_CACHE').USER_TOKEN_CACHE_KEY;

    this.USER_REFRESH_TOKEN_CACHE_KEY =
      this.configService.get('FEISHU_TOKEN_CACHE').USER_REFRESH_TOKEN_CACHE_KEY;
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
      const response = await getTenantToken();
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

  async getUserToken(code: string) {
    const app_token = await this.getAppToken();
    const dto: GetUserTokenDto = {
      code,
      app_token,
    };
    const res: any = await getUserToken(dto);
    if (res.code === 0) {
    } else {
      throw new BusinessException(res.msg);
    }
    return res.data;
  }

  // 缓存用户 token & refresh_token
  async setUserCacheToken(tokenInfo: any) {
    const {
      refresh_token,
      access_token,
      user_id,
      expires_in,
      refresh_expires_in,
    } = tokenInfo;

    // 缓存用户的 token
    this.redisCacheService.cacheSet(
      `${this.USER_TOKEN_CACHE_KEY}_${user_id}`,
      access_token,
      expires_in - 60,
    );

    // 缓存用户的 refresh_token
    this.redisCacheService.cacheSet(
      `${this.USER_REFRESH_TOKEN_CACHE_KEY}_${user_id}`,
      refresh_token,
      refresh_expires_in - 60,
    );
  }

  // 刷新用户 token
  async getUserTokenByRefreshToken(refreshToken: string) {
    return await refreshUserToken({
      refreshToken,
      app_token: await this.getAppToken(),
    });
  }

  // 获取用户缓存的 token & refresh_token
  async getCachedUserToken(userId: string) {
    let userToken: string = await this.redisCacheService.cacheGet(
      `${this.USER_TOKEN_CACHE_KEY}_${userId}`,
    );

    // 如果 token 过期
    if (!userToken) {
      // 获取更新后的 token
      const refreshToken: string = await this.redisCacheService.cacheGet(
        `${this.USER_REFRESH_TOKEN_CACHE_KEY}_${userId}`,
      );

      // 如果更新后的 token 也不存在 || 过期，就提示 token 失效
      if (!refreshToken) {
        throw new BusinessException({
          code: BUSINESS_ERROR_CODE.TOKEN_INVALID,
          message: 'token 已失效',
        });
      }

      // 获取新的用户 token
      const userTokenInfo = await this.getUserTokenByRefreshToken(refreshToken);

      // 更新缓存的用户 token
      await this.setUserCacheToken(userTokenInfo);

      userToken = userTokenInfo.access_token;
    }

    return userToken;
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
