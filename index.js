var p = require('path');
var fs = require('fs-extra');
var glob = require("globby");

var noisy = false;

function Dir(base) {
  noisy && console.log('Dir', base);

  this.cd = function(dir) {
    noisy && console.log('base', dir);
    return new Dir(p.resolve(base, dir));
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

  this.file = function(name) {
    return new File(base, name);
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

  this.first = function() {
    if (files.length) {
      return files[0];
    }
  };

  this.last = function() {
    if (files.length) {
      return files[files.length - 1];
    }
  };

  this.text = function(enoding) {
    if (files.length) {
      return files[0].text(enoding);
    }
  };

  this.json = function(enoding) {
    return JSON.parse(this.text(enoding));
  };

  this.join = function(joiner, enoding) {
    return files.map(function(file) {
      return file.text(enoding);
    }).join(joiner);
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

  this.text = function(enoding) {
    return fs.readFileSync(path, enoding).toString();
  };

  this.json = function(enoding) {
    return JSON.parse(this.text(enoding));
  };

  this.write = function(content, enoding) {
    noisy && console.log(this.toString());
    fs.outputFileSync(path, content, enoding);
  };

  this.toString = function() {
    return base + '+' + file;
  };
}

module.exports = new Dir(process.cwd());
