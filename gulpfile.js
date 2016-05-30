var gulp = require('gulp');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-minify-html');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');


// JavaScript linting task
gulp.task('jshint', function() {
  return gulp.src('public/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
}); 

// Compile Sass task
gulp.task('sass', function() {
  return gulp.src('public/scss/*.scss')
    .pipe(sass({
      includePaths: require('node-bourbon', 'node-neat').includePaths,
      includePaths: require('node-neat').includePaths
    }))
    .pipe(gulp.dest('./public/css/'))
}); 

// Watch task
gulp.task('watch', function() {
  gulp.watch(['public/js/*.js'], ['jshint']);
  gulp.watch(['public/scss/**/*.scss'], ['sass']);
}); 

// Styles build task, concatenates all the files
gulp.task('styles', function() {
  return gulp.src('public/css/*.css')
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('./public/build/css'))
}); 

// Default task
gulp.task('default', ['jshint', 'sass', 'watch', 'styles']);


