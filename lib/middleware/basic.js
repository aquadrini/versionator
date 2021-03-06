var
  url = require('url'),
  path = require('path');

module.exports = function(version) {

  if (!version) {
    throw new Error('version is required');
  }

  function versionSinglePath(urlPath) {
    urlPath = urlPath.toString();
    var pos = urlPath.lastIndexOf('/');
    if (pos !== -1) {
      return path.normalize(urlPath.substring(0, pos) + '/' + version + urlPath.substring(pos));
    } else {
      return urlPath;
    }
  }

  return {

    /**
     * This is intended to be exported as a helper for the view layer
     */
    versionPath: function(urlPath) {

      if (!Array.isArray(urlPath)) {
        return versionSinglePath(urlPath);
      }

      return urlPath.map(function(singleUrl) {
        return versionSinglePath(singleUrl);
      });

    },

    middleware: function(req, res, next) {
      if (req.method !== 'GET') {
        return next();
      }

      // Ensure version is a string
      version = '' + version;

      var
        urlParts = url.parse(req.url),
        basename = path.basename(urlParts.pathname),
        dirname = path.dirname(urlParts.pathname),
        vPos = dirname.length - version.length;

      // If version isn't in path then move on.
      if (dirname.substring(vPos, vPos + version.length) !== version) {
        return next();
      }

      // Rebuild the URL without the version and set the request url.
      urlParts.pathname = path.join(dirname.substring(0, vPos), basename);
      req.url = url.format(urlParts);

      next();
    }
  };
};