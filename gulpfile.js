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
var concat = require('gulp-concat')
var tape = require('gulp-tape')
var tapSpec = require('tap-spec')
var run = require('tape-run')
var shell = require('gulp-shell')
var ava = require('gulp-ava')

gulp.task('test', function() {
   test('projects/**/test/*.js')
});


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
      gulp.watch([projectFolder + '/test/*.js', projectFolder + '/src/**/*', projectFolder + '/index.pug'], function(){
         microBuild(projectFolder)
         if(fs.existsSync(projectFolder + '/test/test.js')) {
            test(projectFolder + '/test/test.js')
         }
      })


      var wat = watch([projectFolder]).on('unlink', function(filename) {
         if(!unlinked[projectFolder]){ build() }
         unlinked[projectFolder] = true;
      })
   })
   gulp.watch(['template/**/src/*', 'template/**/src/*'], function(){ microBuild('template') })
   gulp.watch(['www/**/src/*', 'www/**/src/*'], function(){ microBuild('www') })
})

gulp.task('default', build)

function test(path) {
   console.log('Testing: ' + path)
   //var test = require('./projects/Cursor Watch/test/test')
   //var tape = require("tape");
   //var tapSpec = require("tap-spec");

   //var htest = tape.createHarness();

   //htest.createStream().pipe(tapSpec()).pipe(process.stdout);

   //var f = require('./projects/Cursor Watch/test/test.js');
   //f(htest);

   	// gulp.src(path)
   	// 	 //`gulp-ava` needs filepaths, so you can't have any plugins before it
   	// 	.pipe(ava({verbose: true}))

   shell.task([`browserify "${path}" | tape-run | tap-spec`])()
   //shell.task([`browserify "${path}" | testling`])()
   // return gulp.src(path)
   //  .pipe(tape({
   //    reporter: tapSpec()
   //  }));
}

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
   gulp.src(['autoreload.js', path.join(pathDev, '*.js')])
      .pipe(concat('js.js'))
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

   fs.writeFileSync(path.join(__dirname, 'reload.json'), JSON.stringify({ changed: Date.now() }))
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
