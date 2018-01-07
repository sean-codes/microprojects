var gulp = require('gulp')
var path = require('path')
var fs = require('fs')
var gulp = require('gulp')
var pug = require('gulp-pug')
var sass = require('gulp-sass')
var babel = require('gulp-babel')
var prefix = require('gulp-autoprefixer')
var readLine = require('readline-sync')
var gutil = require('gulp-util')
var data = require('gulp-data')
var watch = require('gulp-watch')

gulp.task('new', function() {
   var projectName = readLine.question('Project Title: ')
   var projectPath = path.join(__dirname, 'projects', projectName)
   if(!fs.existsSync(projectPath)) {
      console.log('Creating project..')
      gulp.src('template/**/*').pipe(gulp.dest(projectPath).on('finish', function(){
         gulp.start('watch')
      }))
      return
   }

   console.log('Project Exists!')
});

gulp.task('watch', function() {
   build()
   var projectFolders = GulpFolders('projects')
   var unlinked = {}
   GulpInception(projectFolders, function(projectFolder) {
      gulp.watch([projectFolder + '/src/*', projectFolder + '/index.pug'], function(){ microBuild(projectFolder) })

      var wat = watch([projectFolder]).on('unlink', function(filename) {
         if(!unlinked[projectFolder]){ build() }
         unlinked[projectFolder] = true;
      })
   })
   gulp.watch(['template/**/src/*', 'template/**/src/*'], function(){ microBuild('template') })
   gulp.watch(['www/**/src/*', 'www/**/src/*'], function(){ microBuild('www') })
})

gulp.task('default', build)

function build() {
   var projectFolders = GulpFolders('projects')
   updateWWWJSON(projectFolders)

   GulpInception(projectFolders, microBuild)
   microBuild('template')
   microBuild('www')
}

function updateIndex() {
   gulp.src('www/index.html').pipe(gulp.dest(''))
}

function updateWWWJSON(projectFolders) {
   var wwwJSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'www.json')))
   wwwJSON.projectsList = projectFolders.map(function(folderPath) {
      return { title: path.basename(folderPath), path: folderPath }
   })
   fs.writeFileSync(path.join(__dirname, 'www.json'), JSON.stringify(wwwJSON, null, '\t'))
}

function microBuild(pathSite) {
   console.log('Building: ' + pathSite)
   var pathDev = path.join(pathSite, 'src')
   var pathDist = path.join(pathSite, 'bin')

   // JS
   gulp.src(path.join(pathDev, '*.js'))
      .pipe(babel({ presets: ['env'] }).on('error', gutil.log))
      .pipe(gulp.dest(pathDist))

   // CSS
   gulp.src(path.join(pathDev, '*.scss'))
    .pipe(sass().on('error', gutil.log))
    .pipe(prefix({ browsers: ['last 2 versions'], cascade: false }).on('error', gutil.log))
    .pipe(gulp.dest(pathDist))

   // HTML
   gulp.src(path.join(pathDev, '*.pug'))
      .pipe(gulp.dest(pathDist))
   gulp.src(path.join(pathSite, 'index.pug'))
      .pipe(data(function(file) {
         return JSON.parse(fs.readFileSync(path.join(__dirname, 'www.json')));
      }))
      .pipe(pug({ pretty: true }).on('error', gutil.log))
      .pipe(gulp.dest(pathSite)).on('finish', function() { updateIndex() })
}

// Might work. Wish we just knew how gulp worked
function GulpInception(arrPaths, callBack) {
   for(var pathSite of arrPaths) {
      callBack(pathSite)
   }
}

function GulpFolders(pathFolders, absolute) {
   var arrFolders = []
   //var pathFolders = absolute ? pathFolders : path.join(__dirname, pathFolders)
   var pathFolders = pathFolders
   for(var fileName of fs.readdirSync(pathFolders)) {
      var pathFolder = path.join(pathFolders, fileName)
      if(fs.statSync(pathFolder).isDirectory()) {
         arrFolders.push(pathFolder)
      }
   }
   return arrFolders
}
