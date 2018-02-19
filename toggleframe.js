
         // Setup
         var asar = require('asar')
         var fs = require('fs')
         var appAsarPath = './resources/app.asar'
         var appAsarUnpackedPath = './resources/app.asar.unpacked'
         var atomWindowPath = appAsarUnpackedPath + '/src/main-process/atom-window.js'

         console.log('Unpacking ASAR...')
         asar.extractAll(appAsarPath, appAsarUnpackedPath)

         fs.readFile(atomWindowPath, 'UTF-8', function(err, contents){
            // What we are changing
            var changeOff = "if (this.shouldHideTitleBar())"
            var changeOn = "/* (this.shouldHideTitleBar(*/"

            // Check if changed before
            var on = contents.indexOf(changeOn) > 0
            console.log('Toggling Frame...' + on)
            on  ? fs.writeFile(atomWindowPath, contents.replace(changeOn, changeOff), 'UTF-8', function(){})
                : fs.writeFile(atomWindowPath, contents.replace(changeOff, changeOn), 'UTF-8', function(){})

            console.log('Repacking ASAR...')
            asar.createPackage(appAsarUnpackedPath, appAsarPath, function(){})

            console.log('done! Reopen Atom!')
         })
      