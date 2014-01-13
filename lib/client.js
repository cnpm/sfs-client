/**!
 * sfs-client - lib/client.js
 *
 * Copyright(c) 2014
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var debug = require('debug')('sfs-client');
var urllib = require('urllib');
var formstream = require('formstream');
var fs = require('fs');

function Client(options) {
  this._nodes = options.nodes;
  this._nodeIndex = 0;
  this._credentials = new Buffer(options.credentials.join(':')).toString('base64');
  this._timeout = options.timeout || 600000;
}

Client.prototype._request = function (url, args, callback) {
  var node = this._nodes[this._nodeIndex++];
  if (this._nodeIndex >= this._nodes.length) {
    this._nodeIndex = 0;
  }
  url = 'http://' + node.ip + ':' + node.port + url;
  debug('%s %s', args.type, url);
  args.headers = args.headers || {};
  args.headers.Authorization = 'Basic ' + this._credentials;
  args.timeout = args.timeout || this._timeout;
  urllib.request(url, args, callback);
};

Client.prototype.upload = function (filepath, options, callback) {
  var url = '/store';
  var form = formstream();
  form.file('file', filepath);
  form.field('filename', options.key)
    .field('shasum', options.shasum);
  var args = {
    type: 'POST',
    headers: form.headers(),
    stream: form,
    dataType: 'json',
  };
  this._request(url, args, function (err, result) {
    if (err) {
      return callback(err);
    }
    result = result || {};
    if (!result.ok) {
      err = new Error('Upload ' + filepath + ' to ' + options.key + ' fail: ' + result.message);
      return callback(err);
    }
    callback(null, {key: options.key});
  });
};

Client.prototype.uploadBuffer = function (buf, options, callback) {
  var url = '/store';
  var form = formstream();
  form.buffer('file', buf, options.key);
  form.field('filename', options.key)
    .field('shasum', options.shasum);
  var args = {
    type: 'POST',
    headers: form.headers(),
    stream: form,
    dataType: 'json',
  };
  this._request(url, args, function (err, result) {
    if (err) {
      return callback(err);
    }
    result = result || {};
    if (!result.ok) {
      err = new Error('Upload buffer to ' + options.key + ' fail: ' + result.message);
      return callback(err);
    }
    callback(null, {key: options.key});
  });
};

Client.prototype.download = function (key, savePath, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};
  if (key[0] === '/') {
    key = key.substring(1);
  }
  var url = '/file/' + key;
  var ws = fs.createWriteStream(savePath);
  var args = {
    type: 'GET',
    writeStream: ws,
    timeout: options.timeout,
  };
  this._request(url, args, callback);
};

Client.prototype.downloadStream = function (key, writeStream, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  options = options || {};
  if (key[0] === '/') {
    key = key.substring(1);
  }
  var url = '/file/' + key;
  var args = {
    type: 'GET',
    writeStream: writeStream,
    timeout: options.timeout,
  };
  this._request(url, args, callback);
};

Client.prototype.remove = function (key, callback) {
  return process.nextTick(callback);

  // TODO: need to support remove
  if (key[0] === '/') {
    key = key.substring(1);
  }
  var url = '/file/' + key;
  var args = {
    type: 'DELETE',
    dataType: 'json',
  };
  this._request(url, args, callback);
};

exports.create = function (options) {
  return new Client(options);
};
