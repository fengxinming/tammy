# Tammy
> Note: A progressive HTTP client for the browser and node.js

[![npm package](https://nodei.co/npm/tammy.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy)

---

| Package | Version | Docs | Description |
| ------- | ------- | ---- | ----------- |
| [`tammy`](/packages/tammy) | [![npm](https://img.shields.io/npm/v/tammy.svg?style=flat-square)](https://www.npmjs.com/package/tammy) | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/packages/tammy#readme) |  |
| [`tammy-adapter-xhr`](/packages/tammy-adapter-xhr) | [![npm](https://img.shields.io/npm/v/tammy-adapter-xhr.svg?style=flat-square)](https://www.npmjs.com/package/tammy-adapter-xhr) | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/packages/tammy-adapter-xhr#readme) |  |
| [`tammy-adapter-request`](/packages/tammy-adapter-request) | [![npm](https://img.shields.io/npm/v/tammy-adapter-request.svg?style=flat-square)](https://www.npmjs.com/package/tammy-adapter-request) | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/packages/tammy-adapter-request#readme) |  |
| [`tammy-plugin-xsrf`](/packages/tammy-plugin-xsrf) | [![npm](https://img.shields.io/npm/v/tammy-plugin-xsrf.svg?style=flat-square)](https://www.npmjs.com/package/tammy-plugin-xsrf) | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/packages/tammy-plugin-xsrf#readme) |  |
| [`tammy-mock`](/packages/tammy-mock) | [![npm](https://img.shields.io/npm/v/tammy-mock.svg?style=flat-square)](https://www.npmjs.com/package/tammy-mock) | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/packages/tammy-mock#readme) |  |

---

## Usage

```js
import { http } from 'tammy';
import xhr from 'tammy-adapter-xhr';
http.defaults.adapter = xhr;

http.get('/user?ID=12345')
  .then(function (response) {
    // 处理成功情况
  })
  .catch(function (error) {
    // 处理异常情况
  });
```

## License

MIT
