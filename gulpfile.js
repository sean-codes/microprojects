var gulp = require('gulp')
var path = require('path')
var fs = require('fs')
var gulp = require('gulp')
var pug = require('gulp-pug')
var sass = require('gulp-sass')
var babel = require('gulp-babel')
var prefix = require('gulp-autoprefixer')
var copy = require('gulp-copy')
var prompt = require('gulp-prompt')

gulp.task('new', function() {

})

gulp.task('watch', function() {
   gulp.watch(['projects/**/dev/*'], ['default'])
})

gulp.task('default', function() {
   new GulpInception('projects').each(function(pathSite) {
      console.log('Building: ' + pathSite)
      var pathDev = path.join(pathSite, 'dev')
      var pathDist = path.join(pathSite, 'dist')

      // JS
      gulp.src(path.join(pathDev, '*.js'))
         .pipe(babel({ presets: ['env'] }))
         .pipe(gulp.dest(pathDist))

      // CSS
      gulp.src(path.join(pathDev, '*.scss'))
       .pipe(sass())
       .pipe(prefix({ browsers: ['last 2 versions'], cascade: false }))
       .pipe(gulp.dest(pathDist))

      // HTML
      gulp.src(path.join(pathDev, '*.pug'))
         .pipe(gulp.dest(pathDist))
      gulp.src(path.join(pathSite, 'index.pug'))
         .pipe(pug({ pretty: true }))
         .pipe(gulp.dest(pathSite))
   })
})


// Might work. Wish we just knew how gulp worked
function GulpInception(options) {
   if(typeof options === 'string'){ options = { path: options }}
   this.siteList = []
   this.path = options.path
   this.pathSites = options.absolute ? this.path : path.join(__dirname, this.path)
   for(var fileName of fs.readdirSync(this.pathSites)) {
      var pathSite = path.join(this.pathSites, fileName)
      if(fs.statSync(pathSite).isDirectory()) {
         this.siteList.push(pathSite)
      }
   }
   this.each = function(callBack) {
      for(var pathSite of this.siteList) {
         callBack(pathSite)
      }
   }
}
