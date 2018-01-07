# microprojects
> Microproject and Prototypes creation tool [static site builder]

![open](./example.gif)
demo: [open](https://sean-codes.github.io/microprojects)


## How it works
> Don't forget to use `npm install`!

This project is built using gulp. Use `gulp new` to start a new project or `gulp watch` to edit existing ones.

Making changes to a projects src pug(html), scss(css), and js files causes the indidividual project to be built.

Each project can be demoed from its own `project/index.html`.

A project list is kept in the `www.json` and is used to build the `index.html` in the root of this repository.

## Folder structure
> Make changes for the `src`
```.js
   project/
   ├── index.html // view your project
   ├── index.pug // add plugins here
   ├── bin/
   │   ├── css.css // compiled sass and autoprefixed
   │   ├── js.js // compiled used babel
   │   └── html.pug // only a copy from src
   └── src/
       ├── css.scss // SASS
       ├── js.js // BABEL
       └── html.pug // PUG/JADE/HTML
```


## new project
Duplicates the boilerplate, builds the site, and starts `gulp watch`
![open](./new.gif)

```.js
gulp new
>> Project Title: Project Title
```

## watch
continue working on a project
```.js
   gulp watch
```
