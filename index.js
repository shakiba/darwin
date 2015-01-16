var p = require('path');
var fs = require('fs-extra');
var glob = require("globby");

var noisy = false;
function darwin(base, files) {
  noisy && console.log('darwin', base, files && files.length);
  base = base || process.cwd();
  files = files || [];

  this.cd = function(newbase) {
    noisy && console.log('base', newbase);
    return new darwin(p.resolve(base, newbase));
  };

  this.glob = function(pattern, options) {
    noisy && console.log('glob', base, pattern, options);
    options || (options = {});
    options.cwd = base;

    files = glob.sync(pattern, options).map(function(file) {
      return new File(base, file);
    });

    return new darwin(base, files);
  };

  this.each = function(fn) {
    files.forEach(fn);
    return this;
  };

  this.file = function(name) {
    return new File(base, name);
  };

  this.get = function() {
    return files.length && files[0].get();
  };

}

function File(base, file) {
  var path = p.resolve(base, file);

  var content = null;

  this.name = function() {
    return file;
  };

  this.get = function() {
    noisy && console.log(this.toString());
    if (content == null) {
      content = fs.readFileSync(path, 'UTF-8');
    }
    return content;
  };

  this.set = function(str) {
    content = str;
    return this;
  };

  this.write = function() {
    noisy && console.log(this.toString());
    if (content != null) {
      fs.outputFileSync(path, content, 'UTF-8');
    }
  };

  this.toString = function() {
    return base + '+' + file + '=' + path;
  };
}

module.exports = new darwin();
