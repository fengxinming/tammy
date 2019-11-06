# Tammy // request

[![npm package](https://nodei.co/npm/tammy-adapter-request.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy-adapter-request)

> Note: A tammy adapter for making http calls with request module.

[![NPM version](https://img.shields.io/npm/v/tammy-adapter-request.svg?style=flat)](https://npmjs.org/package/tammy-adapter-request)
[![NPM Downloads](https://img.shields.io/npm/dm/tammy-adapter-request.svg?style=flat)](https://npmjs.org/package/tammy-adapter-request)
[![](https://data.jsdelivr.com/v1/package/npm/tammy-adapter-request/badge)](https://www.jsdelivr.com/package/npm/tammy-adapter-request)

---

## Installation

```bash
npm install tammy --save

# for the nodejs
npm install tammy-adapter-request --save
```

```javascript

const { http } = require('tammy');
const request = require('tammy-adapter-request');

http.defaults.adapter = request;

```
