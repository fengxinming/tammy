# Tammy // mock

[![npm package](https://nodei.co/npm/tammy-mock.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy-mock)

> Note: xhr adapter

[![NPM version](https://img.shields.io/npm/v/tammy-mock.svg?style=flat)](https://npmjs.org/package/tammy-mock)
[![NPM Downloads](https://img.shields.io/npm/dm/tammy-mock.svg?style=flat)](https://npmjs.org/package/tammy-mock)
[![](https://data.jsdelivr.com/v1/package/npm/tammy-mock/badge)](https://www.jsdelivr.com/package/npm/tammy-mock)

---

## Example

```javascript

// es6
import { http } from 'tammy';
import Mock from 'tammy-mock';

const mock = new Mock();
mock.get('/api/test', (req, res) => {
  res.json({
    code: 0,
    message: 'success'
  });
});
http.defaults.adapter = mock.getAdapter();

```

---

## API

  - use(fn)
  - all(path, ...fns)
  - head(path, ...fns)
  - options(path, ...fns)
  - get(path, ...fns)
  - put(path, ...fns)
  - patch(path, ...fns)
  - post(path, ...fns)
  - delete(path, ...fns)
  - del(path, ...fns)

### req
  - url
  - method
  - path
  - headers
  - query
  - body
  - xhr
  - header(name)
  - getHeader(name)
  - get(name)

### res
  - req
  - headers
  - type()
  - header(name, value)
  - set(name, value)
  - setHeader(name, value)
  - get(name)
  - getHeader(name)
  - removeHeader(name)
  - status(code)
  - send(body)
  - json(obj)
