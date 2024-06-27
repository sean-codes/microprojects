var path = require('path')
var fs = require('fs')
var gulp = require('gulp')
var pug = require('gulp-pug')
const sass = require('gulp-sass')(require('sass'));
var babel = require('gulp-babel')
var prefix = require('gulp-autoprefixer')
var gutil = require('gulp-util')
var data = require('gulp-data')
var watch = require('gulp-watch')
var concat = require('gulp-concat')
var tape = require('gulp-tape')
var tapSpec = require('tap-spec')
var run = require('tape-run')
var shell = require('gulp-shell')
var mpconfig = require('./mpconfig.json')
var express = require('express')

// wish there was a simple readlineSync function built into node :(
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const rl = readline.createInterface({ input, output });
const readlineQuestion = async function(question) {
   return await new Promise((yay, nay) => {
      rl.question(question, (answer) => {
         rl.close();
         yay(answer)
      });
   })
}



gulp.task('test', function() {
   test('projects/**/test/*.js')
});

gulp.task('watch', function() {
   build()
   var projectFolders = GulpFolders('projects')
   var unlinked = {}

   GulpInception(projectFolders, function(projectFolder) {
      var paths = [
         path.join(projectFolder, '/test/*.js'),
         path.join(projectFolder, '/src/**/*'),
         path.join(projectFolder, '/index.pug')
      ]
      
      gulp.watch(paths, function watch_project_change (done) {
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

   gulp.watch(['./mpconfig.json', './autoreload.js'], function watch_config(done) {
      build(done)
   })


   var app = express()
   app.use('/microprojects', express.static(__dirname))
   app.listen('4455', () => {
      console.log('-------------------------------')
      console.log('Serving: http://localhost:4455/microprojects')
   })

})

gulp.task('new', gulp.series(async function(done) {
   var projectName = await readlineQuestion('Project Title: ')
   var projectPath = path.join(__dirname, 'projects', projectName)

   // exit project exists
   if (fs.existsSync(projectPath)) {
      console.log('Project Exists!')
      return
   }
   
   // create it
   console.log('Creating project..')
   await new Promise((yay, nay) => {
      gulp.src('template/**/*').pipe(gulp.dest(projectPath).on('finish', function() {
         console.log('Project created!')
         yay()
      }))
   })
   
   done()
}, 'watch'));

gulp.task('default', build)

function test(path) {
   shell.task([`browserify "${path}" | tape-run | tap-spec`])()
}

function build(done) {
   var projectFolders = GulpFolders('projects')
   updateWWWJSON(projectFolders)

   GulpInception(projectFolders, microBuild)
   microBuild(path.join(__dirname, 'template'))
   microBuild(path.join(__dirname, 'www'), done)
}

function updateWWW() {
   var projectFolders = GulpFolders('projects')
   updateWWWJSON(projectFolders)
   microBuild(path.join(__dirname, 'www'), done)
}

function updateIndex() {
   gulp.src('www/index.html').pipe(gulp.dest(__dirname))
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

      var relativePath = projectFolder.replace(__dirname, '').replaceAll('\\', '/').replace('\/', '')
      return {
         title: path.basename(projectFolder),
         path: relativePath,
         ...projectConfig,
         hash: relativePath
              .replace('projects', '')
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

   fs.writeFileSync(path.join(__dirname, 'www.json'), JSON.stringify(wwwJSON, null, '   ').replace(/\r\n/g, "\n"))
}

function microBuild(pathSite, done) {
   var cleanPath = pathSite
      .replace(__dirname, '') // start
      .replaceAll('\\', '\/') // // to /
      .replace('/', '') // first slash

   console.log('Building: ' + cleanPath)
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
      var pathFolder = path.join(__dirname, pathFolders, fileName)
      if (fs.statSync(pathFolder).isDirectory()) {
         arrFolders.push(pathFolder)
      }
   }
   return arrFolders
}