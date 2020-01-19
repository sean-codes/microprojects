# microprojects
> a static site generator

#### [open example site](https://sean-codes.github.io/microprojects)
![open](./example.gif?v=5)

# What it does
Makes it easy to rapid develop frontend projects, and host them on github pages.

## Features
- Builds a searchable list of projects
- Autoreload
- Pug, SCSS/Autoprefixer, Babel
- Test individual projects

# How to use
![open](./howtouse.png)

### Viewing
All projects can be viewed from the index.html in the root directory. Each individual project also has an index.html. Using a browser plugin for Atom works well here.

### Creating a new projects
> Don't forget to use `npm install`!

`npm run gulp:new Duplicates the boilerplate, builds the site, and starts `gulp watch`
![open](./new.gif)

### Editing existing projects

``npm run gulp:watch`` Watches for changes to existing projects

# Project structure
> Make changes to the `src` folder
```.js
   project/
   ├── index.html // view your project
   ├── index.pug // add plugins here if you like
   ├── bin/
   │   ├── css.css // compiled sass and autoprefixed
   │   ├── js.js // compiled used babel
   │   └── html.pug // only a copy from src
   └── src/
       ├── css.scss // SASS
       ├── js.js // BABEL
       └── html.pug // PUG/JADE/HTML
```
