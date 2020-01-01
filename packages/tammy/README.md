# Tammy

[![npm package](https://nodei.co/npm/tammy.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy)

> Note: 基于promise用于浏览器和node.js的http客户端

[![NPM version](https://img.shields.io/npm/v/tammy.svg?style=flat)](https://npmjs.org/package/tammy)
[![NPM Downloads](https://img.shields.io/npm/dm/tammy.svg?style=flat)](https://npmjs.org/package/tammy)
[![](https://data.jsdelivr.com/v1/package/npm/tammy/badge)](https://www.jsdelivr.com/package/npm/tammy)

---

## 目录

  - [安装](#安装)
  - [用法](#用法)
  - [Tammy API](#Tammy-API)
  - [配置参数](#配置参数)
  - [Response 结构](#Response-结构)
  - [默认参数](#默认参数)
  - [拦截器](#拦截器)
  - [异常处理](#异常处理)
  - [CancelToken](#CancelToken)
  - [插件](#插件)
  - [适配器](#适配器)
  - [License](#License)

---

## 安装

### 使用传统的 `<script>` 标签加载 `tammy`

```html
<script src="//cdn.jsdelivr.net/npm/tammy/umd.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tammy-adapter-xhr/umd.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tammy-plugin-xsrf/umd.min.js"></script>
```

### 使用 CommonJS 方式导入

```bash
npm install tammy --save

# 浏览器环境
npm install tammy-adapter-xhr --save

# nodejs环境
npm install tammy-adapter-request --save

# 可选
npm install tammy-plugin-xsrf --save
```

---

## 用法

执行一个 `GET` 请求

```js
import { http } from 'tammy';
import xhr from 'tammy-adapter-xhr';
http.defaults.adapter = xhr;

// Make a request for a user with a given ID
http.get('/user?ID=12345')
  .then(function (response) {
    // 处理成功情况
  })
  .catch(function (error) {
    // 处理异常情况
  });

// Optionally the request above could also be done as
http.get('/user', {
  qs: {
    ID: 12345
  }
})
.then(function (response) {
    // 处理成功情况
})
.catch(function (error) {
  // 处理异常情况
});

// 使用 async/await
async function getUser() {
  try {
    const response = await http.get('/user?ID=12345');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
```

> **NOTE:** `async/await` 是 ECMAScript 2017 的一部分, 浏览器不一定都支持

执行一个 `POST` 请求

```js
import { http } from 'tammy';

request.post('/user', {
  firstName: 'Fred',
  lastName: 'Flintstone'
})
.then(function (response) {
  console.log(response);
})
.catch(function (error) {
  console.log(error);
});
```

执行多个并发请求

```js
import { http } from 'tammy';

request.all([{
  url: '/user/12345',
  qs: {
    num: 1
  }
}, '/user/12345/permissions'])
  .then(function (arr) {
    // Both requests are now complete
  });
```

---

## Tammy API

- Constants
  - CT_FORM
  - CT_JSON
  - CT_FORM_DATA
  - CONTENT_TYPES
  - ECONNABORTED
  - ECONNRESET
  - ENETWORK
  - EREQCANCELLED
- Request
  - cancel
  - cancelAll
  - create
  - http
- Utils
  - createError
  - forOwn
  - formify
  - isAbsoluteURL
  - isCancelled
  - isFunction
  - isNil
  - isNumber
  - isObject
  - isString
  - joinPath
  - joinQuery
  - forSlice
  - merge
  - noop
  - remove
  - removeAt
  - stringifyQuery
  - uuid

```js
import {
  CT_FORM
  CT_JSON
  CT_FORM_DATA
  CONTENT_TYPES,
  ECONNABORTED,
  ECONNRESET,
  ENETWORK,
  EREQCANCELLED,
  cancel,
  cancelAll,
  create,
  http,
  createError,
  forOwn,
  formify,
  isAbsoluteURL,
  isCancelled,
  isFunction,
  isNil,
  isNumber,
  isObject,
  isString,
  joinPath,
  joinQuery,
  forSlice,
  merge,
  noop,
  remove,
  removeAt,
  stringifyQuery,
  uuid
} from 'tammy';

```

通过相关配置发起请求

#### http(options)

```js
// Send a POST request

import { http } from 'tammy';

http({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});
```

#### http(url[, options])

```js
// Send a GET request (default method)

import { http } from 'tammy';

http('/user/12345');
```

### 请求方法别名

#### http(options)
#### http.get(url[, data[, options]])
#### http.delete(url[, data[, options]])
#### http.del(url[, data[, options]])
#### http.head(url[, data[, options]])
#### http.options(url[, data[, options]])
#### http.post(url[, data[, options]])
#### http.put(url[, data[, options]])
#### http.patch(url[, data[, options]])

> NOTE: 
当使用以上别名方法时，`url`，`method`和`data`等属性不用在config重复声明。

### 执行多个并发请求

http.all([ ...options ])

### 创建一个实例

创建一个拥有通用配置的 `tammy` 实例

#### create([options])

```js
import { create } from 'tammy';
import xhr from 'tammy-adapter-xhr';

const instance = create({
  baseUrl: 'https://some-domain.com/api/',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'},
  adapter: xhr
});
```

### 实例方法别名


#### instance(options)
#### instance.get(url[, data[, options]])
#### instance.delete(url[, data[, options]])
#### instance.del(url[, data[, options]])
#### instance.head(url[, data[, options]])
#### instance.options(url[, data[, options]])
#### instance.post(url[, data[, options]])
#### instance.put(url[, data[, options]])
#### instance.patch(url[, data[, options]])

---

## 配置参数

下面是可用配置项, 只有 `url` 必填, 如果没有指定方法, 就默认 `GET` 方法

- `url` - 请求地址.
- `baseUrl` - 跟路径，将会跟 `url` 拼接.
- `method` - 请求方法 (默认值: `"GET"`).
- `headers` - 自定义请求头 (默认值: `{'Accept': 'application/json, text/plain, */*'}`).
- `qs` - `url` 拼接参数, 必须是一个对象或者一个 query string 字符串.
- `data` - 如果是 `GET` 请求, 将转成 query string; 如果是 `POST` 请求, 将根据 content-type 转成 query string 或者 json string.
- `cache` - 如果设置为 `false`, 将在 `url` 后增加时间戳, 当 `method` 是 `HEAD`、`DELETE` 或 `GET`.
- `timeout` - 请求超时毫秒数 (默认值: `0` 无超时).
- `adapter` - 自定义适配不同环境 (参考 https://github.com/fengxinming/tammy/blob/dev/packages/tammy-adapter-xhr/src/index.js).

```javascript
{
  adapter: function (options) {
    /* ... */
  }
}
```

- `validateStatus` - 校验 HTTP 响应状态码 (默认值: `(status >= 200 && status < 300) || status === 304`.

```javascript
{
  validateStatus: function (status) {
    // 校验状态码并返回 bool 值
  }
}
```

- `cancelToken` - 保存 token 用于中断请求.

```javascript
let cancelToken;
// ...

{
  cancelToken: function(token) {
    cancelToken = token;
  }
}
```

- `requestType` - 简化设置 content-type, 可选值包括: ‘form’、'json'或'form-data'
- `responseType` - 设置响应数据类型, 可选值包括 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream' (默认值: `"json"`).

---

- `withCredentials` - 是否携带cookie信息 (默认值: `false`).
- `auth` - HTTP Basic auth

```javascript
{
  auth: {
    username: 'janedoe',
    password: 's00pers3cret'
  }
}
```

- `xsrfCookieName` xsrf token 名称 (默认值: `"XSRF-TOKEN"`).
- `xsrfHeaderName` xsrf token 值 (默认值: `"X-XSRF-TOKEN"`).
- `onUploadProgress` - 处理上传进度事件.

```javascript
{
  onUploadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  }
}
```  

- `onDownloadProgress` - 处理下载进度事件.

```javascript
{
  onDownloadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  }
}
```

---

## Response 结构

Response 包含以下信息.

```javascript
{
  // `data` 服务端返回的数据
  data: {},

  // `status` 服务端返回的状态码
  status: 200,

  // `statusText` 服务端返回的状态信息
  statusText: 'OK',

  // `headers` 响应头
  headers: {},

  // `config` 请求配置
  config: {},

  // `request` 请求对象
  request: {}
}
```

使用 `then` 接受 response 相关信息

```js
import { http } from 'tammy';

http.get('/user/12345')
  .then(function (response) {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
  });
```

使用 `catch` 接受异常信息 [rejection callback](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then), 可见 [异常处理](#Handling-Errors) 区域.

## 默认参数

### 全局 http 默认配置

```js
import { http, CT_FORM } from 'tammy';

http.defaults.baseUrl = 'https://api.example.com';
http.headers.common.Authorization = 'authtoken';
http.headers.post['Content-Type'] = CT_FORM;
```

### 定制 http 实例

```js
import { create } from 'tammy';

const instance = create({
  baseUrl: 'https://api.example.com',
  Authorization: 'authtoken'
});
```

### 配置优先级

配置项通过一定的规则合并, request配置将覆盖instance.defaults配置.

```js
import { create } from 'tammy';

const instance = create();

instance.defaults.timeout = 2500;

// timeout 将覆盖 instance.defaults.timeout
instance.get('/longRequest', {
  timeout: 5000
});
```

## 拦截器

增加全局 http 拦截器

```js
// Add a request interceptor
import { http } from 'tammy';

const interceptorId = http.interceptors.request.use(function(config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
http.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  // Do something with response error
  return Promise.reject(error);
});
```

通过 id 或下标移除拦截器

```js
http.interceptors.request.eject(interceptorId);
// 或者
http.interceptors.request.eject(0);
```

增加定制 http 拦截器

```js
import { create } from 'tammy';

const instance = create();
// Add a request interceptor
instance.interceptors.request.use(function({ interceptors }) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.request.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  // Do something with response error
  return Promise.reject(error);
});
```

## 异常处理

```js
http.get('/user/12345')
  .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  });
```

校验 HTTP 状态码

```js
http.get('/user/12345', {
  validateStatus: function (status) {
    return status < 500; // Reject only if the status code is greater than or equal to 500
  }
})
```

## CancelToken

使用 cancel 方法中断请求

```js
let cancelToken;

http.get('/user/12345', {
  cancelToken(token) {
    cancelToken = token;
  }
}).catch(function (thrown) {
  if (isCancelled(thrown)) {
    console.log('Request cancelled', thrown.message);
  } else {
    // handle error
  }
});

http.post('/user/12345', {
  name: 'new name'
})

// cancel the request (the message parameter is optional)
http.cancel(cancelToken, 'Operation aborted by the user.');

// cancel all requests
http.cancelAll();
```

## 插件

- [tammy-plugin-xsrf](https://github.com/fengxinming/tammy/tree/master/packages/tammy-plugin-xsrf)

## 适配器

- [tammy-adapter-xhr](https://github.com/fengxinming/tammy/tree/master/packages/tammy-adapter-xhr)
- [tammy-adapter-request](https://github.com/fengxinming/tammy/tree/master/packages/tammy-adapter-request)
- [tammy-mock](https://github.com/fengxinming/tammy/tree/master/packages/tammy-mock)

## License

MIT
