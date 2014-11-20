'use strict';

var gulp = require('gulp'),
  rename = require("gulp-rename"),
  uglify = require('gulp-uglify'),
  watch = require('gulp-watch'),
  runSequence = require('run-sequence'),
  minifyCSS = require('gulp-minify-css');


gulp.task('uglify', function() {
  gulp.src('./js/*.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public/javascripts/'))
});

gulp.task('minify-css', function() {
  gulp.src('./css/*.css')
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public/stylesheets/'))
});

gulp.task('watch:css', function () {
  gulp.watch('./css/*.css', ['minify-css']);
});

gulp.task('watch:js', function () {
  gulp.watch('./js/*.js', ['uglify']);
});

gulp.task('watch', ['watch:css', 'watch:js']);

