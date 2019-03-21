import isString from 'celia/es/isString';

export default function (response) {
  let { options, data } = response;
  if (options.responseType === 'json' && isString(data)) {
    try {
      options.data = JSON.parse(data);
    } catch (e) {
      console && console.error && console.error('parse data error: ', e);
    }
  }
  return response;
}
