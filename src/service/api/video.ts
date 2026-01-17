import { request } from '@/service/request';

/** 获取视频记录历史 */
export function fetchVideoHistory(params?: Api.Video.VideoHistoryParams) {
  return request<Api.Video.VideoHistoryData>({
    url: '/video-record/admin/history',
    method: 'GET',
    params
  });
}

/** 获取视频详情 */
export function getVideoDetail(videoId: number) {
  return request<Api.Video.VideoDetailData>({
    url: `/video-record/admin/detail/${videoId}`,
    method: 'GET'
  });
}

/** 删除视频记录 */
export function deleteVideoRecord(videoId: number) {
  return request<boolean>({
    url: `/video-record/admin/delete/${videoId}`,
    method: 'DELETE'
  });
}