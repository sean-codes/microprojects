const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer');

gulp.task('watch', function(){
   gulp.watch('./projects/**/*.scss', ['sass'])
})

gulp.task('sass', function(){
   gulp.src('./projects/**/*.scss')
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(gulp.dest('./projects'))
})
