import request from './axiosService';

const URL_NOTIFICATION_LISTEN = '/listen';

export function updateNotificationListen(body, params) {
  return request({
    url: URL_NOTIFICATION_LISTEN,
    method: 'post',
    params,
    body,
  });
}
