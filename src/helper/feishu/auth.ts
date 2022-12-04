import { APP_ID, APP_SECRET } from './const';
import { methodWithVersion } from 'src/utils/request';

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
    // url: `/auth/v3/tenant_access_token/internal`,
    method: 'POST',
    params: {
      app_id: APP_ID,
      app_secret: APP_SECRET,
    },
  });
  return data as GetTokenRes;
};

export const getTenanToken = async () => {
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
