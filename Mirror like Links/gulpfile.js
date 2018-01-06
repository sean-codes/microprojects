var gulp = require('gulp')
var pug = require('gulp-pug')
var sass = require('gulp-sass')
var babel = require('gulp-babel')
var prefix = require('gulp-autoprefixer')

gulp.task('default', ['html', 'css', 'script'])
gulp.task('watch', function() {
   gulp.watch(['dev/*', 'index.pug'], ['default'])
})

gulp.task('html', function() {
   gulp.src('./index.pug')
      .pipe(pug({ pretty: true }))
      .pipe(gulp.dest('./'))

   return gulp.src('./dev/html.pug')
      .pipe(pug({ pretty: true }))
      .pipe(gulp.dest('./dist'))
})

gulp.task('css', function() {
   return gulp.src('./dev/css.scss')
    .pipe(sass())
    .pipe(prefix({
         browsers: ['last 2 versions'],
         cascade: false
     }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('script', function() {
   gulp.src('dev/js.js')
      .pipe(babel({ presets: ['env'] }))
      .pipe(gulp.dest('dist'))
})
