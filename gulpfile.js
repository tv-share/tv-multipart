var gulp = require('gulp');
var babel = require('gulp-babel');
var clean = require('gulp-clean-dest');
var pump = require('pump');


gulp.task('default', function(cb) {

    const tasks = [
      gulp.src('src/**/*.js'),
      clean('dist'),
      babel(),
      gulp.dest('dist')
    ];
  
    pump(tasks, cb);
});