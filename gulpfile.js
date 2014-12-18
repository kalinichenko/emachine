'use strict';

var gulp = require('gulp'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  watch = require('gulp-watch'),
  runSequence = require('run-sequence'),
  minifyCSS = require('gulp-minify-css'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  vendors = ['jquery', 'backbone', 'underscore', 'backbone.marionette', 'howler', 'bootstrap'],
  gzip = require('gulp-gzip');


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
        // Start piping stream to tasks!
        // .pipe(gzip())
        .pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('watch:css', function () {
  gulp.watch('./css/*.css', ['minify-css']);
});

gulp.task('watch', function () {
  // gulp.watch('./js/*.js', ['uglify']);
  gulp.watch('./js/**/*.js', ['browserify:app']);
});

// gulp.task('watch', ['watch:css', 'watch:js']);

gulp.task('default', ['watch']);

