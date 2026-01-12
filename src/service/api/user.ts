import { request } from '@/service/request';

/** 获取用户列表 */
export function fetchUserList(params?: Api.User.UserListParams) {
  return request<Api.User.UserListResult>({
    url: '/user/user_list',
    method: 'GET',
    params
  });
}

/** 获取用户详情 */
export function fetchUserDetail(id: number) {
  return request<Api.User.UserDetailResult>({
    url: `/user/${id}`,
    method: 'GET'
  });
}