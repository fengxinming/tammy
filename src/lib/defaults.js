export default {
  timeout: 0,
  responseType: 'json', // 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  validateStatus(status) {
    return (status >= 200 && status < 300) || status === 304;
  }
};
