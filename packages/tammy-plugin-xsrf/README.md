# Tammy // xsrf

[![npm package](https://nodei.co/npm/tammy-plugin-xsrf.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy-plugin-xsrf)

> Note: xsrf plugin

[![NPM version](https://img.shields.io/npm/v/tammy-plugin-xsrf.svg?style=flat)](https://npmjs.org/package/tammy-plugin-xsrf)
[![NPM Downloads](https://img.shields.io/npm/dm/tammy-plugin-xsrf.svg?style=flat)](https://npmjs.org/package/tammy-plugin-xsrf)
[![](https://data.jsdelivr.com/v1/package/npm/tammy-plugin-xsrf/badge)](https://www.jsdelivr.com/package/npm/tammy-plugin-xsrf)

---

## Installation

### Load `tammy` via classical `<script>` tag

```html
<script src="//cdn.jsdelivr.net/npm/tammy/umd.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tammy-plugin-xsrf/umd.min.js"></script>
```

```javascript
tammy.http.install(tammyPluginXsrf);
```

### CommonJS style with npm

```bash
npm install tammy --save
npm install tammy-plugin-xsrf --save
```

```javascript

// es6
import { http } from 'tammy';
import xsrf from 'tammy-plugin-xsrf';

http.install(xsrf);

```
