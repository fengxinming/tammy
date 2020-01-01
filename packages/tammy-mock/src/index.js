import {
  isFunction,
  isString,
  isAbsoluteURL,
  forSlice,
  createError,
  ECONNRESET
} from 'tammy';
import isRegExp from 'celia/isRegExp';
import assign from 'celia/assign';
import flattenDeep from 'celia/flattenDeep';
import append from 'celia/_append';
import Route from './Route';
import { Request } from './Request';
import { Response } from './Response';

function compose(middleware) {
  return function (req, res, next) {
    let index = -1;
    const dispatch = function (i) {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      let fn = middleware[i];
      if (i < middleware.length) {
        try {
          fn(req, res, (e) => {
            e
              ? next(e)
              : dispatch(i + 1);
          });
        } catch (e) {
          next(e);
        }
      } else {
        next();
      }
    };
    dispatch(0);
  };
}

class Mock {

  constructor(opts) {
    this.opts = opts || {};
    this.routes = [];
    this.middleware = [];
    this.methods = this.opts.methods || [
      'HEAD',
      'OPTIONS',
      'GET',
      'PUT',
      'PATCH',
      'POST',
      'DELETE'
    ];

    // 内置 method 相关函数
    this.methods.concat('all').forEach((method) => {
      this[method.toLowerCase()] = function (name, path, middleware) {
        let start;
        let end = arguments.length;
        if (isFunction(name)) { // 未传入path
          start = 0;
          path = name = null;
        } else if (isString(path) || isRegExp(path)) {
          start = 2;
          end = arguments.length;
        } else {
          start = 1;
          path = name;
          name = null;
        }
        middleware = [];
        forSlice(arguments, start, end, (arg) => {
          append(middleware, arg);
        });

        this.addRoute(path, method, middleware, { name });
        return this;
      };
    });

    // delete 的别名
    this.del = this['delete'];
  }

  /**
   * 挂载中间件
   * @param {Function} fn
   *
   * 或者
   * @param {String} path
   * @param {Function} fn
   */
  use(fn) {
    let offset = 0;
    let path = null;

    // 处理 router.use([fn])
    if (!isFunction(fn)) {
      let arg = fn;

      while (Array.isArray(arg) && arg.length !== 0) {
        arg = arg[0];
      }

      // 第一个参数是path
      if (!isFunction(arg)) {
        offset = 1;
        path = fn;
      }
    }

    // 扁平化回调函数
    const fns = flattenDeep([].slice.call(arguments, offset));

    // 检查参数的个数
    if (fns.length === 0) {
      throw new TypeError('Mock.use() requires a middleware function');
    }

    // 检查参数的内容
    const newCallbacks = [];
    fns.forEach((callback) => {
      isFunction(callback)
        ? append(newCallbacks, callback)
        : console.warn(`Mock.use() requires a middleware function but got a ${typeof callback}`);
    });

    // 挂载回调函数
    if (newCallbacks.length) {
      this.addMiddleware(path, newCallbacks);
    }

    return this;
  }

  /**
   * 追加回调函数
   * @param {String} path
   * @param {Array<Function>|Function} middleware
   * @param {Object} opts
   */
  addMiddleware(path, middleware, opts) {
    opts = assign({ end: false }, this.opts.match, opts);

    // 创建路由
    let route = new Route(path, opts);
    route.middleware = middleware;

    append(this.middleware, route);
    return this;
  }

  /**
   * 追加路由
   * @param {String} path
   * @param {String} method
   * @param {Array<Function>|Function} middleware
   * @param {Object} opts
   */
  addRoute(path, method, middleware, opts) {
    method = method === 'all'
      ? this.methods
      : method;
    opts = assign({ end: true }, this.opts.match, opts);

    // 创建路由
    const route = new Route(path, opts);
    route.setMethod(method);
    route.setMiddleware(middleware);

    append(this.routes, route);
    return this;
  }

  /**
   * 适配器供Tammy使用
   */
  getAdapter() {
    const { middleware, routes, opts } = this;
    return function (config) {
      return new Promise((resolve, reject) => {
        const {
          url,
          method
        } = config;
        const searchIndex = url.indexOf('?');
        let pathname = searchIndex === -1 ? url : url.slice(0, searchIndex);
        pathname = isAbsoluteURL(url) ? pathname.slice(pathname.indexOf('/', 8)) : pathname;

        // 匹配中间件
        let matchedMiddleware = [];
        middleware.some((mw) => {
          if (mw.match(pathname)) {
            matchedMiddleware = mw;
            return true;
          }
        });

        // 匹配路由规则
        let captures;
        let matchedRoute;
        routes.some((route) => {
          if ((captures = route.match(pathname)) && route.matchMethod(method)) {
            matchedRoute = route;
            return true;
          }
          return false;
        });

        if (matchedRoute) {
          matchedMiddleware = matchedMiddleware.concat((req, res, next) => {
            // 可能已存在的参数
            const { params } = req;
            req.params = matchedRoute.params(captures, params);
            return next();
          }, matchedRoute.middleware);
        }

        const req = new Request({
          url,
          method,
          headers: config.headers,
          path: pathname,
          _body: config.data
        });
        const res = new Response({
          req,
          headers: {},
          end(chunk) {
            if (!this.get('Content-Type').indexOf('application/json') > -1) {
              try {
                chunk = JSON.parse(chunk);
              } catch (e) { }
            }
            resolve({
              data: chunk,
              statusText: 'OK',
              status: this.statusCode,
              config,
              req
            });
          }
        });

        const { timeout } = opts;
        setTimeout(() => {
          reject(createError(`Timeout of ${timeout}ms exceeded`, {
            code: ECONNRESET,
            config,
            request: req
          }));
        }, timeout || 60000);

        compose(matchedMiddleware)(req, res, (err) => {
          if (err) {
            err.code = 'EMOCK';
            err.config = config;
            err.request = req;
            reject(err);
          }
        });
      });
    };
  }

}

export default Mock;
