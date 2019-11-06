import pathToRegExp from 'path-to-regexp';
import isFunction from 'celia/isFunction';
import iterate from 'celia/_iterate';

function safeDecodeURIComponent(text) {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    return text;
  }
}

const { isArray } = Array;

class Route {

  constructor(path, opts) {
    this.middleware = [];
    this.method = [];
    this.path = path || '(.*)';
    this.opts = opts || {};
    this.name = this.opts.name || null;
    this.regexp = pathToRegExp(
      (this.path = path),
      (this.paramNames = []),
      this.opts
    );
  }

  setMethod(val) {
    if (val) {
      val = (isArray(val) ? val : [val])
        .map(method => method.toUpperCase());
      const hasGet = val.indexOf('GET');
      if (hasGet > -1) {
        val.splice(hasGet, 0, 'HEAD');
      }
      this.method = val;
    }
  }

  setMiddleware(val) {
    if (val) {
      (this.middleware = isArray(val) ? val : [val]).forEach((fn) => {
        if (!isFunction(fn)) {
          throw new TypeError(
            `middleware "${this.name || this.path}" must be a function, not ${typeof fn}`
          );
        }
      });
    }
  }

  match(path) {
    return path === this.path ? [] : this.regexp.exec(path);
  }

  matchMethod(method) {
    return this.method.indexOf(method) > -1;
  }

  params(captures, existingParams) {
    let params = existingParams || {};
    const { paramNames } = this;

    iterate(captures, 1, captures.length, (val, i) => {
      const { name } = (paramNames[i - 1] || {});
      if (name) {
        params[name] = val && safeDecodeURIComponent(val);
      }
    });
    return params;
  }

}

export default Route;
