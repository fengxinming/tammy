import tammy from './index';
import auth from './plugins/auth';
import xsrf from './plugins/xsrf';
import resHeaders from './plugins/res-headers';

tammy
  .use(auth)
  .use(xsrf)
  .use(resHeaders);

tammy.plugins = { auth, xsrf, resHeaders };

export default tammy;
