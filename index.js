var p = require('path');
var fs = require('fs-extra');
var glob = require("globby");

var noisy = false;

function Darwin(base, files) {
  noisy && console.log('Darwin', base, files && files.length);
  base = base || process.cwd();
  files = files || [];

  this.cd = function(newbase) {
    noisy && console.log('base', newbase);
    return new Darwin(p.resolve(base, newbase));
  };

  this.glob = function(pattern, options) {
    noisy && console.log('glob', base, pattern, options);
    options || (options = {});
    options.cwd = base;

    files = glob.sync(pattern, options).map(function(file) {
      return new File(base, file);
    });

    return new Darwin(base, files);
  };

  this.each = function(fn) {
    files.forEach(fn);
    return this;
  };

  this.file = function(name) {
    return new File(base, name);
  };

  this.read = function() {
    if (files.length) {
      return files[0].read();
    }
  };

  this.text = function() {
    if (files.length) {
      return files[0].text();
    }
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

  this.write = function(content, enoding) {
    noisy && console.log(this.toString());
    fs.outputFileSync(path, content, enoding);
  };

  this.toString = function() {
    return base + '+' + file + '=' + path;
  };
}

module.exports = new Darwin();
