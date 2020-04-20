const { series, src, dest, watch } = require("gulp");
const sass = require("gulp-sass");
const fs = require("fs");
const browserSync = require("browser-sync").create();

// Build Twig Templates
function buildTemplates(cb) {
  // Create Twing environment
  const { TwingEnvironment, TwingLoaderFilesystem } = require("twing");
  let loader = new TwingLoaderFilesystem("./");
  let twing = new TwingEnvironment(loader);

  fs.readFile("./data/data.json", (err, data) => {
    if (err) {
      throw err;
    }

    fs.mkdir("dist", { recursive: true }, (err) => {
      if (err) {
        throw err;
      }

      twing.render("index.twig", JSON.parse(data)).then((output) => {
        // Write to html file
        fs.writeFile("dist/index.html", output, function (err) {
          if (err) {
            console.log("error", err);
          }
        });
      });
    });
  });

  cb();
}

function buildStyles() {
  return src("scss/style.scss")
    .pipe(
      sass({
        includePaths: ["./node_modules/breakpoint-sass/stylesheets"],
      }).on("error", sass.logError)
    )
    .pipe(dest("./dist/css"))
    .pipe(browserSync.stream());
}

function devBrowser(cb) {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });
  cb();
}

function watchFiles() {
  watch(["scss/**/*.scss"], { usePolling: true, interval: 1500 }, buildStyles);
  watch(["templates/**/*.twig", "index.twig"]).on(
    "change",
    series(buildTemplates)
  );

  watch("dist/*.html").on("change", browserSync.reload);
}

exports.watchFiles = watchFiles;
exports.devBrowser = devBrowser;
exports.buildTemplates = buildTemplates;
exports.buildStyles = buildStyles;
exports.default = series(buildTemplates, buildStyles, devBrowser, watchFiles);
