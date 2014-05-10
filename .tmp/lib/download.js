// Generated by LiveScript 1.2.0
var fs, path, request, EventEmitter, version, progress, join, dirname, ref$, next, env, isWin, isArray, once, platform, arch, mk, rm, exists, clone, extend, discoverPkg, httpStatus, download, defaultDest, apply, getProxy;
fs = require('fs');
path = require('path');
request = require('request');
EventEmitter = require('events').EventEmitter;
version = require('../package.json').version;
progress = require('request-progress');
join = path.join, dirname = path.dirname;
ref$ = require('./utils'), next = ref$.next, env = ref$.env, isWin = ref$.isWin, isArray = ref$.isArray, once = ref$.once, platform = ref$.platform, arch = ref$.arch, mk = ref$.mk, rm = ref$.rm, exists = ref$.exists, clone = ref$.clone, extend = ref$.extend, discoverPkg = ref$.discoverPkg, httpStatus = ref$.httpStatus;
module.exports = download = function(options){
  var ref$, url, dest, filename, auth, emitter, errored, output, createDest, clean, onError, onDownload, onEnd, onProgress, handler, doDownload;
  ref$ = options = apply(
  options), url = ref$.url, dest = ref$.dest, filename = ref$.filename, auth = ref$.auth;
  emitter = new EventEmitter;
  errored = false;
  output = join(dest, filename);
  createDest = function(){
    if (!exists(
    dest)) {
      return mk(dest);
    }
  };
  clean = function(){
    try {
      return rm(output);
    } catch (e$) {}
  };
  onError = once(function(err, code){
    errored = true;
    clean();
    if (err) {
      return emitter.emit('error', err, code);
    }
  });
  onDownload = function(){
    return emitter.emit(
    'download');
  };
  onEnd = once(function(){
    if (!errored) {
      return emitter.emit('end', output);
    }
  });
  onProgress = function(it){
    return emitter.emit('progress', it);
  };
  handler = function(err, res, data){
    if (err) {
      return onError(
      err);
    } else if (res.statusCode >= 400) {
      return onError(new Error("Invalid response code: " + httpStatus(res.statusCode)), res.statusCode);
    } else if (!data) {
      return onError(
      new Error('Empty response'));
    }
  };
  doDownload = function(){
    return next(function(){
      var stream, http;
      createDest();
      stream = fs.createWriteStream(
      output);
      stream.on('error', onError);
      emitter.emit('download', onDownload);
      http = request(options, handler);
      http.on('error', onError);
      return progress(http, {
        delay: 500
      }).on('progress', onProgress).pipe(stream).on('close', onEnd);
    });
  };
  doDownload();
  return emitter;
};
defaultDest = function(){
  var dest;
  dest = discoverPkg();
  if (dest) {
    return dirname(
    dest);
  } else {
    return '.';
  }
};
apply = function(options){
  return options = {
    url: options.url,
    auth: options.auth || null,
    filename: options.filename || 'archive.nar',
    dest: options.dest || defaultDest(),
    timeout: options.timeout || 10000,
    strictSSL: options.strictSSL || false,
    proxy: options.proxy || getProxy(),
    headers: {
      'User-Agent': "node nar " + version + " (" + platform + "-" + arch + ")"
    }
  };
};
getProxy = function(){
  return env(
  'http_proxy');
};
