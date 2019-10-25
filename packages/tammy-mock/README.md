# Tammy // mock

[![npm package](https://nodei.co/npm/tammy-mock.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy-mock)

> Note: mock for tammy or axios

[![NPM version](https://img.shields.io/npm/v/tammy-mock.svg?style=flat)](https://npmjs.org/package/tammy-mock)
[![NPM Downloads](https://img.shields.io/npm/dm/tammy-mock.svg?style=flat)](https://npmjs.org/package/tammy-mock)
[![](https://data.jsdelivr.com/v1/package/npm/tammy-mock/badge)](https://www.jsdelivr.com/package/npm/tammy-mock)

---

## Installation

### Load `tammy` via classical `<script>` tag

```html
<script src="//cdn.jsdelivr.net/npm/tammy/umd.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tammy-mock/umd.min.js"></script>
```

```javascript
const mock = new TammyMock();
mock.get('/api/test', (req, res) => {
  res.json({
    code: 0,
    message: 'success'
  });
});
tammy.http.defaults.adapter = mock.getAdapter();
http('/api/test')
  .then(function(res) {

  });
```

### CommonJS style with npm

```bash
npm install tammy --save

# mock
npm install tammy-mock --save
```

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
http('/api/test')
  .then(function(res) {

  });

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
  - type(type)
  - header(name, value)
  - set(name, value)
  - setHeader(name, value)
  - get(name)
  - getHeader(name)
  - removeHeader(name)
  - status(code)
  - send(body)
  - json(obj)
