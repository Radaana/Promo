'use strict';

const gulp = require('gulp');

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const groupMediaQueries = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-cleancss');
const autoprefixer = require('gulp-autoprefixer');

const concat = require('gulp-concat');
const del = require('del');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin'); //Minify PNG, JPEG, GIF and SVG images with imagemin
const pug = require('gulp-pug'); // PUG
var csscomb = require('gulp-csscomb');

// Пути 
const paths =  {
  src: './src/',              // paths.src
  build: './build/'           // paths.build
};

const images = 
  paths.src + '/images/*.{gif,png,jpg,jpeg,svg,ico}'
;

// задачи

function styles() { // CSS
  return gulp.src(paths.src + 'scss/style.scss')
    .pipe(plumber())
    // .pipe(sassGlob())
    .pipe(sass()) // { outputStyle: 'compressed' }
    .pipe( autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
        }))
    .pipe(groupMediaQueries())
    .pipe(cleanCSS())
    .pipe(csscomb())
    .pipe(gulp.dest(paths.build + 'css/'))
}

function scripts() { //JS
  return gulp.src(paths.src + 'js/*.js')
    .pipe(plumber())
    .pipe(concat('script.js'))
    .pipe(gulp.dest(paths.build + 'js/'))
}

// function htmls() { //HTML
//   return gulp.src(paths.src + '*.html')
//     .pipe(plumber())
//     .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
//     .pipe(gulp.dest(paths.build));
// }

function pugs() {  // PUG
  return gulp.src([
    paths.src + '*.pug' 
    // '!' + dirs.source + '/mixins.pug',
    ])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(paths.build));
};

function copyImg() { //IMG
  if(images.length) {
    return gulp.src(images)
      .pipe(imagemin()) //minify images
      .pipe(gulp.dest(paths.build + '/images'));
  }
  else {
    console.log('Изображения не обрабатываются.');
    callback();
  }
};

function clean() {
  return del('build/')
}

function watch() {
  gulp.watch(paths.src + 'scss/**/*.scss', styles);
  gulp.watch(paths.src + 'js/*.js', scripts);
  gulp.watch(paths.src + 'images/*.{gif,png,jpg,jpeg,svg,ico}', copyImg);
  gulp.watch(paths.src + '*.pug', pugs);
}

function serve() {
  browserSync.init({
    server: {
      baseDir: paths.build
    }
  });
  browserSync.watch(paths.build + '**/*.*', browserSync.reload);
}

// Сборка

exports.styles = styles;
exports.scripts = scripts;
exports.pugs = pugs;
exports.clean = clean;
exports.watch = watch;
exports.copyImg = copyImg;

gulp.task('build', gulp.series(
  clean,
  copyImg,
  gulp.parallel(styles, scripts, pugs)
));

gulp.task('default', gulp.series(
  clean,
  gulp.parallel(styles, scripts, pugs),
  gulp.parallel(copyImg),
  gulp.parallel(watch, serve)
));
