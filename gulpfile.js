const gulp = require('gulp')
const git = require('gulp-git')
const clean = require('gulp-clean')

const TOOLS_DIRECTORY = 'D:/dsalexan/Code/rpg/TheGiddyLimit.github.io'
const TOOLS_DATA_DIRECTORY = TOOLS_DIRECTORY + '/data'
const TOOLS_IMG_DIRECTORY = TOOLS_DIRECTORY + '/img'

function pull(cb) {
  git.pull('origin', 'master', { cwd: TOOLS_DIRECTORY }, function(err) {
    if (err) throw err
    cb()
  })
}

function clear_data() {
  return gulp.src('static/data/*', { read: false }).pipe(clean())
}

function clear_img() {
  return gulp.src('static/img/*', { read: false }).pipe(clean())
}

function sync_data() {
  return gulp.src([TOOLS_DATA_DIRECTORY + '/**/*']).pipe(gulp.dest('static/data'))
}

function sync_img() {
  return gulp.src([TOOLS_IMG_DIRECTORY + '/**/*']).pipe(gulp.dest('static/img'))
}

const clear = gulp.parallel(clear_data, clear_img)
const sync = gulp.parallel(sync_data, sync_img)

exports.clear = clear
exports.sync = gulp.series(clear, sync)
exports.update = gulp.series(gulp.parallel(pull, clear), sync)
