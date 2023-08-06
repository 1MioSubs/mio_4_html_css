const { src, dest, watch, parallel, series } = require("gulp");

const scss          = require("gulp-sass")(require("sass"));
const concat        = require("gulp-concat");
const autoprefixer  = require("gulp-autoprefixer");
const uglify        = require("gulp-uglify");
const imagemin      = require("gulp-imagemin");
const clean         = require("gulp-clean");
const browserSync   = require("browser-sync").create();

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",
    },
    notofy: false,
  })
}

function styles() {
  return src("app/scss/style.scss")
    .pipe(scss({ outputStyle: "expanded" })) //compressed -  expanded
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 versions"],
        add: true,
        grid: false,
      })
    )
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

function scripts() {
  return src([
    "node_modules/jquery/dist/jquery.js",
    "node_modules/slick-carousel/slick/slick.js",
    "node_modules/rateyo/src/jquery.rateyo.js",
    "node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js",
    "app/js/main.js",
  ])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
  }
  
  function cleadDist() {
    return src('dist')
      .pipe(clean())
  }

  function images() {
  src("app/images/**/*.*")
    .pipe(imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            { removeViewBox: true }, 
            { cleanupIDs: false }
          ],
        }),
      ]))
    .pipe(dest("dist/images"))
}

function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js',
  ], {base: 'app'})
    .pipe(dest('dist'))
}

function watching() {
  watch(["app/scss/**/*.scss"], styles);
  watch(["app/js/**/*.js", "!app/js/main.min.js"], scripts);
  watch(["app/**/*.html"]).on("change", browserSync.reload);
}

exports.browsersync = browsersync;
exports.styles      = styles;
exports.scripts     = scripts;
exports.cleadDist   = cleadDist;
exports.images      = images;
exports.watching    = watching;
exports.builds      = build;

exports.build       = series(cleadDist, parallel(images, build));
exports.default     = parallel(styles, scripts, browsersync, watching);
