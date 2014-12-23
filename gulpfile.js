'use strict';

var vendors = ['jquery', 'backbone', 'underscore', 'backbone.marionette', 'backbone.localstorage', 'howler', 'bootstrap', 'rivets', 'swipeout', 'hammerjs'];

var gulp = require('gulp'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  minifyCSS = require('gulp-minify-css'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  notify = require('gulp-notify');



gulp.task('uglify', function() {
  gulp.src('./js/*.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('minify-css', function() {
  gulp.src('./css/*.css')
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public/stylesheets/'));
});

gulp.task('browserify:vendor', function() {
  return browserify()
        .require(vendors)
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('vendor.js'))
        .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
        .pipe(uglify())
        // Start piping stream to tasks!
        .pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('browserify:app', function() {
    return browserify('./js/main.js')
        .external(vendors)
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('main.js'))
        .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
        .pipe(uglify())
        .pipe(notify('main.js is bundled'))
        .pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('watch:css', function () {
  gulp.watch('./css/*.css', ['minify-css']);
});

gulp.task('watch', function () {
  gulp.watch('./js/**/*.js', ['browserify:app']);
});


gulp.task('default', ['watch']);

