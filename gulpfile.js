const gulp = require('gulp')
const git = require('gulp-git')
const clean = require('gulp-clean')

const TOOLS_DIRECTORY = 'D:/dsalexan/Code/rpg/TheGiddyLimit.github.io'
const TOOLS_DATA_DIRECTORY = TOOLS_DIRECTORY + '/data'

function pull(cb) {
  git.pull('origin', 'master', { cwd: TOOLS_DIRECTORY }, function(err) {
    if (err) throw err
    cb()
  })
}

function clear() {
  return gulp.src('data/*', { read: false }).pipe(clean())
}

function sync() {
  return gulp.src([TOOLS_DATA_DIRECTORY + '/**/*']).pipe(gulp.dest('static/data'))
}

exports.clear = clear
exports.sync = gulp.series(clear, sync)
exports.update = gulp.series(gulp.parallel(pull, clear), sync)
