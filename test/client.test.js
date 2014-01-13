/**!
 * sfs-client - test/client.test.js
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

var should = require('should');
var crypto = require('crypto');
var fs = require('fs');
var client = require('../').create(require('./config'));
require('./support/server');

describe('client.test.js', function () {
  var sha1;

  before(function (done) {
    var shasum = crypto.createHash('sha1');
    var s = fs.ReadStream(__filename);
    s.on('data', function(d) {
      shasum.update(d);
    });

    s.on('end', function() {
      sha1 = shasum.digest('hex');
      setTimeout(done, 1000);
    });
  });

  describe('upload()', function () {
    it('should upload a file', function (done) {
      client.upload(__filename, {key: '/sfs-client/client.test.js', shasum: sha1}, function (err, result) {
        should.not.exist(err);
        result.should.eql({key: '/sfs-client/client.test.js'});
        done();
      });
    });
  });

  describe('uploadBuffer()', function () {
    it('should upload a buffer as file', function (done) {
      client.uploadBuffer(new Buffer('foo'),
        {key: '/sfs-client/buffer.test.js', shasum: '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33'},
      function (err, result) {
        should.not.exist(err);
        result.should.eql({key: '/sfs-client/buffer.test.js'});
        done();
      });
    });
  });

  describe('download()', function () {
    it('should download a file 1', function (done) {
      client.download('/sfs-client/buffer.test.js', '/tmp/sfs-buffer.test.js', function (err) {
        should.not.exist(err);
        fs.readFileSync('/tmp/sfs-buffer.test.js', 'utf8').should.equal('foo');
        done();
      });
    });

    it('should download a file 2', function (done) {
      client.download('sfs-client/buffer.test.js', '/tmp/sfs-buffer2.test.js', function (err) {
        should.not.exist(err);
        fs.readFileSync('/tmp/sfs-buffer2.test.js', 'utf8').should.equal('foo');
        done();
      });
    });
  });

  describe('downloadStream()', function () {
    it('should download a file stream', function (done) {
      var ws = fs.createWriteStream('/tmp/sfs-client.test.js');
      client.downloadStream('/sfs-client/client.test.js', ws, function (err) {
        should.not.exist(err);
        fs.statSync('/tmp/sfs-client.test.js').size.should.equal(fs.statSync(__filename).size);
        done();
      });
    });
  });

  describe('remove()', function () {
    it('should remove a file success', function (done) {
      client.remove('/sfs-client/client.test.js', function (err, result) {
        should.not.exist(err);
        result.should.eql({ok: true});
        done();
      });
    });
  });
});
