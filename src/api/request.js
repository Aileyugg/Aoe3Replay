import { baseUrl } from '@/config';

export default async function request(options) {
  const url = `${baseUrl}${options.url}`;
  try {
    const res = await fetch(url, options);
    if (res.status === 401) {
      throw new Error('身份过期，请重新登录');
    } else if (res.status !== 200) {
      throw new Error('未知错误，请反馈给管理员');
    }

    const body = await res.json();
    if (body.code === 1) {
      return body;
    } else {
      throw new Error(body.msg);
    }
  } catch (err) {
    return Promise.reject(err.message);
  }
}