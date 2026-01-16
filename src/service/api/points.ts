
import { request } from '@/service/request';

/** 获取用户积分历史记录 */
export function fetchPointsHistory(params?: Api.Points.PointsHistoryParams) {
  return request<Api.Points.PointsHistoryData>({
    url: '/points/admin/history',
    method: 'GET',
    params
  });
}

/** 调整用户积分 */
export function adjustUserPoints(params: Api.Points.AdjustPointsParams) {
  return request<Api.Points.AdjustPointsData>({
    url: '/points/admin/adjust',
    method: 'POST',
    data: params
  });
}

/** 获取用户当前积分 */
export function getUserPoints(userId: number) {
  return request<Api.Points.UserPointsData>({
    url: `/points/admin/balance/${userId}`,
    method: 'GET'
  });
}