import { request } from '../request';

/**
 * Login
 *
 * @param username User name
 * @param password Password
 */
export function fetchLogin(username: string, password: string) {
  return request<Api.Auth.LoginToken>({
    url: '/user/login',
    method: 'post',
    data: {
      username,
      password,
    }
  });
}
/**
 * Login
 *
 * @param username User name
 * @param password Password
 */
export function fetchRegister(username: string, password: string) {
  return request<Api.Auth.LoginToken>({
    url: '/user/register',
    method: 'post',
    data: {
      username,
      password
    }
  });
}
/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/user/getUserInfo' });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/user/refreshToken',
    method: 'post',
    data: {
      refresh_token:refreshToken,
    }
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}
