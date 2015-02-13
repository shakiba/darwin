/*
 * Darwin
 * Copyright (c) 2015 Ali Shakiba and other contributors
 * Available under the MIT license
 * @license
 */

var p = require('path');
var fs = require('fs-extra');
var glob = require("globby");
var DNA = require("dna-js");

var noisy = false;

function Dir(base) {
  noisy && console.log('Dir', base);

  this.path = function() {
    return base;
  };

  this.cd = function(dir) {
    noisy && console.log('base', dir);
    return new Dir(p.resolve(base, dir));
  };

  this.file = function(name) {
    return new File(base, name);
  };

  this.select = function(files) {
    if (typeof files === 'string') {
      files = [ files ];
    }
    return new Selection(base, files.map(function(file) {
      return new File(base, file);
    }));
  };

  this.glob = function(pattern, options) {
    noisy && console.log('glob', base, pattern, options);
    options || (options = {});
    options.cwd = base;

    files = glob.sync(pattern, options).map(function(file) {
      return new File(base, file);
    });

    return new Selection(base, files);
  };

  this.toString = function() {
    return base;
  };
}

function Selection(base, files) {
  noisy && console.log('Selection', base, files.length);

  this.each = function(fn) {
    files.forEach(fn);
    return this;
  };

  this.text = function(enoding) {
    if (files.length) {
      return files[0].text(enoding);
    } else {
      return '';
    }
  };

  this.json = function(enoding) {
    return JSON.parse(this.text(enoding));
  };

  this.dna = function(enoding) {
    return DNA.parse(this.text(enoding));
  };

  this.join = function(joiner, enoding) {
    return files.map(function(file) {
      return file.text(enoding);
    }).join(joiner);
  };

  this.copyTo = function(dest) {
    return new Selection(dest.path(), files.map(function(file) {
      return file.copyTo(dest);
    }));
  };

  this.toString = function() {
    return base + '+' + files;
  };
}

function File(base, file) {
  var path = p.resolve(base, file);

  this.name = function() {
    return file;
  };

  this.read = function(enoding) {
    return fs.readFileSync(path, enoding);
  };

  this.write = function(content, enoding) {
    noisy && console.log(this.toString());
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
    var copy = dest.file(file);
    copy.write(this.read());
    return copy;
  };

  this.toString = function() {
    return base + '+' + file;
  };
}

module.exports = new Dir(process.cwd());
