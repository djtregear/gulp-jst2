gulp-jst2
=========

Compile [lodash templates](http://lodash.com/docs#template) to a JST file using [gulp](https://github.com/wearefractal/gulp); allow customisation of the prepended text while optionally using a RegEx of the file.path (full path, name and extension).

Based on [gulp-jst](https://github.com/rdmurphy/gulp-jst).

Install
-------

Install using [npm](https://npmjs.org/package/gulp-jst2).

```
npm install gulp-jst2 --save-dev
```

Options
-------

### jst(options)

`prepend` string to prepend before the function returned.  Will be used in `printf` so can include `%s` to insert the string returned from the `useFilePath` option. Default: `false`.

`useFilePath` array containing [`RegEx`, `string`] to return all or part of the current file's path. Default returns filename without extension. Default: `['^.*/(.+?)(\.[^.]*$|$)', '$1']`

`gulp-jst2` also accepts the same [_.template](http://lodash.com/docs#template) options and passes them on to the [lodash](http://lodash.com/) library.


Usage
-----

Defaults will simply return the lodash function:
```js
var gulp = require('gulp'),
    jst  = require('gulp-jst2');


gulp.task('jst', function() {

    gulp.src('input/*.ejs')
        .pipe(jst())
        .pipe(gulp.dest('./output'));

});


gulp.task('default', ['jst']);
```

You can `prepend` a simple string before the function to produce a variable assignment like so:
```js
var gulp = require('gulp'),
    jst  = require('gulp-jst2');


gulp.task('jst', function() {

    gulp.src('input/*.ejs')
        .pipe(jst({ prepend: 'var mySuperDuperApp["template"] = ' }))
        .pipe(gulp.dest('./output'));

});


gulp.task('default', ['jst']);
```

You can `prepend` with the `%s` option to include the default filename of the current file within your string before the function to produce a variable assignment like so:
```js
var gulp = require('gulp'),
    jst  = require('gulp-jst2');


gulp.task('jst', function() {

    gulp.src('input/*.ejs')
        .pipe(jst({ prepend: 'var mySuperDuperApp["templates"]["%s"] = ' }))
        .pipe(gulp.dest('./output'));
});


gulp.task('default', ['jst']);
```

You can `prepend` with the `%s` option to include the `RegEx` of the `file.path` of the current file within your string before the function to produce a variable assignment like so:
```js
var gulp = require('gulp'),
    jst  = require('gulp-jst2');


gulp.task('jst', function() {

    gulp.src('input/*.ejs')
        .pipe(jst({
                    prepend: 'var mySuperDuperApp["templates"]["%s"] = ',
                    useFilePath: ['.*', '$&']
                  }))
        .pipe(gulp.dest('./output'));
});


gulp.task('default', ['jst']);
```


Really Useful Usage
-------------------

Create a single javaScript file containing a `custom global object` with a key `templates` whose subkeys are the `filename` of templates from a single directory and their values are the templates.  Also minify the HTML and uglify the javaScript, like so:

```js

var gulp    = require('gulp'),
    htmlmin = require('gulp-htmlmin'),
    jst     = require('gulp-jst2'),
    concat  = require('gulp-concat'),
    insert  = require('gulp-insert'),
    uglify  = require('gulp-uglify');


gulp.task('jst', function() {

  gulp.src(['./templates/*.ejs'])

    // Minify the HTML prior to converting to JST
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, removeCommentsFromCDATA: true }))

    // Convert to JST and assign to app.templates which we'll define once all files are concatenated in
    .pipe(jst({ prepend: 'app.templates["%s"] = ' }))

    // Concatenate all files together and insert a comma before each newLine
    .pipe(concat('jst.js', { newLine: ',\n' }))

    // Insert the start of an `IIFE` and variable declarations at the beginning of the file
    .pipe(insert.prepend('var mySuperDuperApp = (function(app) {\n  app.templates = app.templates || {};\n\n'))

    // Insert the end of an `IIFE` and return the object at the end of the file (also the last function from the jst call will not end with a semicolon, so add one here)
    .pipe(insert.append(';\n\n  return app;\n})(mySuperDuperApp || {});\n'))

    // Uglify the JS
    .pipe(uglify( { mangle: true, reserved: "mySuperDuperApp" } ))

    .pipe(gulp.dest('./views/public/j'));
    
});


gulp.task('default', ['jst']);

```
