///////////
//Require//
///////////
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var html_replace = require('gulp-html-replace');
var pump = require('pump');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var htmlmin = require('gulp-htmlmin');
const gutil = require('gulp-util');
const $ = require("gulp-load-plugins")();

////////////////
//Publish Task//
////////////////

gulp.task('publish',function(){
	gulp.src(['public_html/sources/Peinata/js/*.js']) // public_html/sources/**/**/*.js E:\Coding\GitHub\Peinata-Helper\public_html\sources\Peinata\js
	.pipe(rename({suffix:'.min'}))
	.pipe(uglify())
	.pipe(gulp.dest('Publish'));
	
	

	
});

gulp.task('index',function(){
	gulp.src('public_html/index.html')
  .pipe(htmlmin({collapseWhitespace: true}))
.pipe(gulp.dest('Publish'));
	
});


$.uglify().on('error', function (err) {
    gutil.log(gutil.colors.red('[Error]'), err.toString());
    this.emit('end');
})


gulp.task('scripts', function() {
		return gulp.src('public_html/sources/Peinata/js/*.js')
				.pipe(concat('application.js'))
				.pipe(gulp.dest('Publish'))
				.pipe(plumber(console.log("hello")))
				.pipe(uglify())
				.pipe(gulp.dest('Publish'))
				.pipe(notify({
						title: 'Gulp',
						message: 'Scripts Done'
				}));
	});

// gulp.task('uglify-error-debugging', function (cb) {
  // pump([
    // gulp.src(['public_html/sources/Peinata/js/*.js']), // public_html/sources/**/**/*.js E:\Coding\GitHub\Peinata-Helper\public_html\sources\Peinata\js
	
	// pipe(uglify()),
	// (gulp.dest('Publish'))
  // ], cb);
// });


gulp.task('default',['publish']);