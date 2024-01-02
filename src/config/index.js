let baseUrl;
if (import.meta.env.DEV) {
  // 开发环境配置
  baseUrl = 'http://127.0.0.1:8080';
} else {
  // 生产环境配置
  baseUrl = 'https://replay.aoe4.top';
}

export { baseUrl };