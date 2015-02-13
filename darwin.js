/*
 * Darwin
 * Copyright (c) 2015 Ali Shakiba and other contributors
 * Available under the MIT license
 * @license
 */

var p = require('path');
var fs = require('fs-extra');
var glob = require("globby");
var DNA = require("dna.js");

var noisy = false;

function Dir(base) {
  noisy && console.log('Dir:', base);

  this.path = function() {
    return base;
  };

  this.cd = function(dir) {
    noisy && console.log('Dir.cd', base, dir);
    return new Dir(p.resolve(base, dir));
  };

  this.select = function(select) {
    noisy && console.log('Dir.select', base, select);
    if (typeof select === 'string') {
      return new File(base, select);
    } else {
      return new List(base, select.map(function(file) {
        return new File(base, file);
      }));
    }
  };

  this.glob = function(pattern, options) {
    noisy && console.log('glob', base, pattern, options);
    options || (options = {});
    options.cwd = base;
    files = glob.sync(pattern, options).map(function(file) {
      return new File(base, file);
    });
    return new List(base, files);
  };

  this.toString = function() {
    return base;
  };
}

function List(base, files) {
  noisy && console.log('List:', base, files.length);

  this.each = function(fn) {
    files.forEach(fn);
    return this;
  };

  this.map = function(fn) {
    return files.map(fn);
  };

  this.read = function(enoding) {
    return this.map(function(file) {
      return file.text(enoding);
    });
  };

  this.text = function(enoding) {
    return this.map(function(file) {
      return file.text(enoding);
    });
  };

  this.json = function(enoding) {
    return this.map(function(file) {
      return file.json(enoding);
    });
  };

  this.dna = function(enoding) {
    return this.map(function(file) {
      return DNA.parse(file.text(enoding));
    });
  };

  this.copyTo = function(dest) {
    return new List(dest.path(), files.map(function(file) {
      return file.copyTo(dest);
    }));
  };

  this.toString = function() {
    return base + '+' + files;
  };
}

function File(base, file) {
  noisy && console.log('File:', base, file);

  var path = p.resolve(base, file);

  this.path = function(resolved) {
    return resolved ? path : file;
  };

  this.read = function(enoding) {
    noisy && console.log('File.read: ' + this);
    return fs.readFileSync(path, enoding);
  };

  this.write = function(content, enoding) {
    noisy && console.log('File.write: ' + this);
    fs.outputFileSync(path, content, enoding);
  };

  this.text = function(enoding) {
    return fs.readFileSync(path, enoding).toString();
  };

  this.json = function(enoding) {
    return JSON.parse(this.text(enoding));
  };

  this.dna = function(enoding) {
    return DNA.parse(this.text(enoding));
  };

  this.copyTo = function(dest) {
    var copy = dest.select(file);
    copy.write(this.read());
    return copy;
  };

  this.toString = function() {
    return base + '+' + file;
  };
}

module.exports = new Dir(process.cwd());
