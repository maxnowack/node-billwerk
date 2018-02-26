import fetch from 'node-fetch';
import qs from 'qs';
import basicAuth from 'basic-auth-header';

export default (url, options) => {
  const method = (options.method || 'GET').toUpperCase();
  const queryString = method === 'GET' && options.query ? `?${qs.stringify(options.query)}` : '';

  return fetch(`${url}${queryString}`, {
    method,
    headers: Object.assign({}, options.headers, options.auth && {
      Authorization: basicAuth(options.auth.user, options.user.pass),
    }),
    body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
  }).then(res => res.json());
};
