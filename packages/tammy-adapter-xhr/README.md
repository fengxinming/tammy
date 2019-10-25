# Tammy // xhr

[![npm package](https://nodei.co/npm/tammy-adapter-xhr.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy-adapter-xhr)

> Note: xhr adapter

[![NPM version](https://img.shields.io/npm/v/tammy-adapter-xhr.svg?style=flat)](https://npmjs.org/package/tammy-adapter-xhr)
[![NPM Downloads](https://img.shields.io/npm/dm/tammy-adapter-xhr.svg?style=flat)](https://npmjs.org/package/tammy-adapter-xhr)
[![](https://data.jsdelivr.com/v1/package/npm/tammy-adapter-xhr/badge)](https://www.jsdelivr.com/package/npm/tammy-adapter-xhr)

---

## Installation

### Load `tammy` via classical `<script>` tag

```html
<script src="//cdn.jsdelivr.net/npm/tammy/umd.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/tammy-adapter-xhr/umd.min.js"></script>
```

```javascript
tammy.http.install(tammyAdapterXhr);
```

### CommonJS style with npm

```bash
npm install tammy --save

# for the browser
npm install tammy-adapter-xhr --save
```

```javascript

// es6
import { http } from 'tammy';
import xhr from 'tammy-adapter-xhr';

http.defaults.adapter = xhr;

```
