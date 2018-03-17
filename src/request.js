import fetch from 'node-fetch';
import basicAuth from 'basic-auth-header';

export default (url, options) => fetch(url, {
  method: options.method,
  headers: Object.assign({}, options.headers, options.auth && {
    Authorization: basicAuth(options.auth.user, options.auth.pass),
  }),
  body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
}).then(res => res.json());
