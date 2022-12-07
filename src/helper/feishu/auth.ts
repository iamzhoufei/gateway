import { APP_ID, APP_SECRET } from './const';
import { methodWithVersion } from '@/utils/request';

export type GetTokenRes = {
  code: number;
  msg: string;
  app_access_token?: string;
  tenant_access_token?: string;
  expire: number;
};

export const getAppToken = async () => {
  const { data } = await methodWithVersion({
    url: `/auth/v3/app_access_token/internal`,
    method: 'POST',
    params: {
      app_id: APP_ID,
      app_secret: APP_SECRET,
    },
  });
  return data as GetTokenRes;
};

export const getTenantToken = async () => {
  const { data } = await methodWithVersion({
    url: `/auth/v3/tenant_access_token/internal`,
    method: 'POST',
    params: {
      app_id: APP_ID,
      app_secret: APP_SECRET,
    },
  });
  return data as GetTokenRes;
};

// 获取用户token
export const getUserToken = async ({ code, app_token }) => {
  const { data } = await methodWithVersion({
    url: `/authen/v1/access_token`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${app_token}`,
    },
    params: {
      grant_type: 'authorization_code',
      code,
    },
  });

  return data;
};

// 刷新用户token
export const refreshUserToken = async ({ refreshToken, app_token }) => {
  const { data } = await methodWithVersion({
    url: `/authen/v1/refresh_access_token`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${app_token}`,
    },
    params: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      app_token,
    },
  });

  return data;
};
