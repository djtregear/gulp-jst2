
'use strict';

var _       = require('lodash'),
    printf  = require('util').format,
    gutil   = require('gulp-util'),
    through = require('through2'),

    compile = _.template;


var PLUGIN_NAME = 'gulp-jst2';

module.exports = function(_options) {

  var defaults = {
        useFilePath: ['^.*/(.+?)(\.[^.]*$|$)', '$1'],
        prepend: false
      },
      options = _.extend({}, defaults, _options);

  var stream = through.obj(function(file, enc, cb) {


    if (file.isNull()) {
      this.push(file);
      return cb();
    }


    if (file.isBuffer()) {
      try {
        var prependString = '';

        if (options.prepend) {
          prependString = printf(options.prepend, file.path.replace(new RegExp(options.useFilePath[0]), options.useFilePath[1]));
        }

        file.contents = new Buffer(prependString + compile(file.contents.toString(), null, options).source);

        file.path = gutil.replaceExtension(file.path, ".js");
      } catch(err) {
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
      }

      this.push(file);
      return cb();
    }


    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported.'));
      return cb();
    }


  });


  return stream;


};
