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
var mpconfig = require('./mpconfig.json')

gulp.task('test', function() {
   test('projects/**/test/*.js')
});


gulp.task('new', function() {
   var projectName = readLine.question('Project Title: ')
   var projectPath = path.join(__dirname, 'projects', projectName)
   if (!fs.existsSync(projectPath)) {
      console.log('Creating project..')
      gulp.src('template/**/*').pipe(gulp.dest(projectPath).on('finish', function() {
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
      gulp.watch([projectFolder + '/test/*.js', projectFolder + '/src/**/*', projectFolder + '/index.pug'], function watch_project_change (done) {
         microBuild(projectFolder, done)
         if (fs.existsSync(projectFolder + '/test/test.js')) {
            test(projectFolder + '/test/test.js')
         }
      })

      gulp.watch([projectFolder + '/config.json'], function watch_project_config(done) {
         microBuild(projectFolder, done) // incase we want to use config in the project in future
         updateWWW()
      })


      var wat = watch([projectFolder]).on('unlink', function watch_project_deleted(filename) {
         if (!unlinked[projectFolder]) {
            build()
         }
         unlinked[projectFolder] = true;
      })
   })

   gulp.watch(['template/**/src/*', 'template/**/index.pug'], function watch_template(done) {
      console.log('rebuilding template')
      microBuild('template', done)
   })

   gulp.watch(['www/**/src/*', 'www/**/index.pug'], function watch_www(done) {
      microBuild('www', done)
   })

   gulp.watch(['./mpconfig.json'], function watch_mpconfig(done) {
      build(done)
   })
})

gulp.task('default', build)

function test(path) {
   shell.task([`browserify "${path}" | tape-run | tap-spec`])()
}

function build(done) {
   var projectFolders = GulpFolders('projects')
   updateWWWJSON(projectFolders)

   GulpInception(projectFolders, microBuild)
   microBuild('template')
   microBuild('www', done)
}

function updateWWW() {
   var projectFolders = GulpFolders('projects')
   updateWWWJSON(projectFolders)
   microBuild('www')
}

function updateIndex() {
   gulp.src('www/index.html').pipe(gulp.dest('./'))
}

function updateWWWJSON(projectFolders) {
   var wwwJSON = {
      title: 'Microprojects Site',
      description: 'A site built using microprojects!',
      links: {
         icon: 'github',
         url: 'https://github.com/sean-codes/microprojects',
         text: 'github.com/sean-codes/microprojects'
      }
   }

   wwwJSON = { ...wwwJSON, ...mpconfig }
   wwwJSON.projectsList = projectFolders.map(function(projectFolder) {
      var projectConfig = {}

      try {
         configPath = path.join(projectFolder, 'config.json')
         projectConfig = JSON.parse(fs.readFileSync(configPath))
      } catch (e) {
         // that is okay we dont need a config
         // console.log("ERROR: CONFIG COULD NOT BE READ", projectFolder)
      }

      return {
         title: path.basename(projectFolder),
         path: projectFolder,
         ...projectConfig,
         hash: projectFolder.toString()       // Convert to string
              .normalize('NFD')               // Change diacritics
              .replace(/[\u0300-\u036f]/g,'') // Remove illegal characters
              .replace(/\s+/g,'-')            // Change whitespace to dashes
              .toLowerCase()                  // Change to lowercase
              .replace(/&/g,'-and-')          // Replace ampersand
              .replace(/[^a-z0-9\-]/g,'')     // Remove anything that is not a letter, number or dash
              .replace(/-+/g,'-')             // Remove duplicate dashes
              .replace(/^-*/,'')              // Remove starting dashes
              .replace(/-*$/,'')              // Remove trailing dashes
      }
   })

   fs.writeFileSync(path.join(__dirname, 'www.json'), JSON.stringify(wwwJSON, null, '   '))
}

function microBuild(pathSite, done) {
   console.log('Building: ' + pathSite)
   var pathDev = path.join(pathSite, 'src')
   var pathDist = path.join(pathSite, 'bin')

   // JS
   gulp.src([path.join(pathDev, '**/*.js')])
      .pipe(concat('js.js'))
      //.pipe(babel({ presets: ['env'] }).on('error', gutil.log))
      .pipe(gulp.dest(pathDist))

   // CSS
   gulp.src(path.join(pathDev, '*.scss'))
      .pipe(sass().on('error', gutil.log))
      .pipe(prefix({
         browsers: ['last 2 versions'],
         cascade: false
      }).on('error', gutil.log))
      .pipe(gulp.dest(pathDist))

   // HTML
   gulp.src(path.join(pathDev, '*.pug'))
      .pipe(gulp.dest(pathDist).on('finish', function() {
            gulp.src(path.join(pathSite, 'index.pug'))
            .pipe(data(function(file) {
               return JSON.parse(fs.readFileSync(path.join(__dirname, 'www.json')));
            }))
            .pipe(pug({
               pretty: true
            }).on('error', (args) => {
               gutil.log(args)
               done && done()
            }))
            .pipe(gulp.dest(pathSite)).on('finish', function() {
               updateIndex()

               fs.writeFileSync(path.join(__dirname, 'reload.json'), JSON.stringify({
                  changed: Date.now()
               }))

               done && done()
            })
         })
      )
}

// Might work. Wish we just knew how gulp worked
function GulpInception(arrPaths, callBack) {
   for (var pathSite of arrPaths) {
      callBack(pathSite)
   }
}

function GulpFolders(pathFolders, absolute) {
   var arrFolders = []
   //var pathFolders = absolute ? pathFolders : path.join(__dirname, pathFolders)
   var pathFolders = pathFolders
   for (var fileName of fs.readdirSync(pathFolders)) {
      var pathFolder = path.join(pathFolders, fileName)
      if (fs.statSync(pathFolder).isDirectory()) {
         arrFolders.push(pathFolder)
      }
   }
   return arrFolders
}
