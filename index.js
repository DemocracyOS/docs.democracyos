var options = require('commander')
var metalsmith = require('metalsmith')
var browserSync = require('metalsmith-browser-sync')
var branch = require('metalsmith-branch')
var markdown = require('metalsmith-markdown')
var fingerprint = require('metalsmith-fingerprint')
var layouts = require('metalsmith-layouts')
var stylus = require('metalsmith-stylus')
var navigation = require('metalsmith-navigation')
var nib = require('nib')
var addFiles = require('./plugins/add-files')
var assets = require('metalsmith-assets')

options
  .option('-w, --watch', 'Serve and watch files.')
  .option('-P, --pretty', 'Compile pretty assets.')
  .parse(process.argv)

// Add stylus css Files, fingerprinted to bust cache.
var css = branch()
  .use(addFiles('assets/css/index.styl'))
  .pattern('assets/css/index.styl')
  .use(stylus({
    compress: !options.pretty,
    use: [nib()]
  }))
  .use(fingerprint({pattern: ['assets/css/index.css']}))

var img = branch()
  .use(assets({
    source: './assets/img',
    destination: './assets/img'
  }))

var fonts = branch()
  .use(assets({
    source: './assets/css/fonts',
    destination: './assets/css/fonts'
  }))

// Proccess Docs files and add the layout
var views = branch('**/*.md')
  .use(markdown({
    smartypants: true,
    gfm: true,
    tables: true
  }))
  .use(navigation({
    sidebar: {
      includeDirs: true
    }
  }))
  .use(layouts({
    engine: 'jade',
    pretty: options.pretty,
    directory: './assets',
    default: 'layout.jade'
  }))

var build = metalsmith(__dirname)
  .source('app/docs')
  .destination('build')
  .use(css)
  .use(img)
  .use(views)

if (options.watch) build
  .destination('.tmp')
  .use(browserSync({
    server: '.tmp',
    files: ['app/docs/**/*', 'assets/**/*']
  }))

build.build(function(err){ if (err) throw err; })
