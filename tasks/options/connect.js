var auth = require('../helpers/auth');
var proxy = require('../helpers/proxy');

var config = {
  /**
   * --------- ADD YOUR UAA CONFIGURATION HERE ---------
   *
   * This uaa helper object simulates NGINX uaa integration using Grunt allowing secure cloudfoundry service integration in local development without deploying your application to cloudfoundry.
   * Please update the following uaa configuration for your solution
   * You'll need to update clientId, serverUrl, and base64ClientCredential.
   */
       
  uaa: {
    clientId: 'nam',
    serverUrl: 'https://64617d19-5675-4dfb-b563-147cd48e40a3.predix-uaa.run.asv-pr.ice.predix.io',
    defaultClientRoute: '/about',
    base64ClientCredential: 'bmFtOkFiYzEyZGVm'
  },
  /**
   * --------- ADD YOUR SECURE ROUTES HERE ------------
   *
   * Please update the following object add your secure routes
   *
   * Note: Keep the /api in front of your services here to tell the proxy to add authorization headers.
   * You'll need to update the url and instanceId.
   */
  proxy: {
    '/api/view-service': {
      url: 'https://predix-views.run.asv-pr.ice.predix.io',
      instanceId: '83ce4512-b72e-40f5-915c-144a07f7b4ed',
      pathRewrite: { '^/api/view-service': '/'}
    },
    '/api/ts-service': {
      url: 'https://tsqs.ice.predix.io/v1/datapoints',
      instanceId: '1744986e-0991-4f12-afdf-3d4ebae63523'      
    }
  }
};

module.exports = {
  server: {
    options: {
      port: 9000,
      base: 'public',
      open: true,
      hostname: 'localhost',
      middleware: function (connect, options) {
        var middlewares = [];

        //add predix services proxy middlewares
        middlewares = middlewares.concat(proxy.init(config.proxy));

        //add predix uaa authentication middlewaress
        middlewares = middlewares.concat(auth.init(config.uaa));

        if (!Array.isArray(options.base)) {
          options.base = [options.base];
        }

        var directory = options.directory || options.base[options.base.length - 1];
        options.base.forEach(function (base) {
          // Serve static files.
          middlewares.push(connect.static(base));
        });

        // Make directory browse-able.
        middlewares.push(connect.directory(directory));

        return middlewares;
      }
    }
  }
};
