import tammy from './index';
import oauth from './oauth';
import xsrf from './xsrf';
import resHeaders from './res-headers';

tammy
  .use(oauth)
  .use(xsrf)
  .use(resHeaders);

tammy.plugins = { oauth, xsrf, resHeaders };

export default tammy;
