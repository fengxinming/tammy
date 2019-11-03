# Tammy // request

[![npm package](https://nodei.co/npm/tammy-adapter-request.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy-adapter-request)

> Note: request adapter

[![NPM version](https://img.shields.io/npm/v/tammy-adapter-request.svg?style=flat)](https://npmjs.org/package/tammy-adapter-request)
[![NPM Downloads](https://img.shields.io/npm/dm/tammy-adapter-request.svg?style=flat)](https://npmjs.org/package/tammy-adapter-request)
[![](https://data.jsdelivr.com/v1/package/npm/tammy-adapter-request/badge)](https://www.jsdelivr.com/package/npm/tammy-adapter-request)

---

## Installation

### Load `tammy` via classical `<script>` tag

```html
<script src="//cdn.jsdelivr.net/npm/tammy/umd.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tammy-adapter-request/umd.min.js"></script>
```

```javascript
tammy.http.install(tammyAdapterRequest);
```

### CommonJS style with npm

```bash
npm install tammy --save

# for the browser
npm install tammy-adapter-request --save
```

```javascript

// es6
import { http } from 'tammy';
import request from 'tammy-adapter-request';

http.defaults.adapter = request;

```
