/* eslint-env node */
(function() {
	'use strict';

	var gulp = require( 'gulp' );
	var sass = require( 'gulp-sass' );
	var plumber = require( 'gulp-plumber' );
	var rename = require( 'gulp-rename' );
	var gutil = require( 'gulp-util' );
	var sourcemaps = require( 'gulp-sourcemaps' );
	var postcss = require( 'gulp-postcss' );
	var autoprefixer = require( 'autoprefixer' );
	var cssnano = require( 'cssnano' );
	var gulpStylelint = require( 'gulp-stylelint' );
	var livereload = require( 'gulp-livereload' );
	var kss = require( 'kss' );
	var pump = require( 'pump' );
	var modernizr = require( 'gulp-modernizr' );
	var cssdeclsort = require( 'css-declaration-sorter' );
	var atImport = require( 'postcss-import' );
	var svgmin = require( 'gulp-svgmin' );
	var svgstore = require( 'gulp-svgstore' );
	var eslint = require( 'gulp-eslint' );
	var webpack = require( 'webpack' );
	var webpackStream = require( 'webpack-stream' );
	var webpackDevConfig = require( './webpack.dev.js' );
	var webpackProdConfig = require( './webpack.prod.js' );
	var imageInliner = require( 'postcss-image-inliner' );
	var named = require( 'vinyl-named' );

	var onError = function( err ) {
		// eslint-disable-next-line no-console
		console.log( 'An error ocurred: ', gutil.colors.magenta( err.message ) );
		gutil.beep();
		this.emit( 'end' );
	};

	function notifyLiveReload( event ) {
		var fileName = require( 'path' ).relative( __dirname, event.path );
		livereload.changed( fileName );
	}

	gulp.task( 'js-dev', ['lint-js'], function() {
		return gulp.src( ['js/src/main.js'] )
			.pipe( named() )
			.pipe( webpackStream( webpackDevConfig, webpack ) )
			.pipe( gulp.dest( './js' ) )
			.pipe( livereload() );
	} );

	gulp.task( 'lint-js', function() {
		return gulp.src( ['./js/src/**.js'] )
			.pipe( plumber( {
				errorHandler: function() {
					gutil.beep();
				}
			} ) )
			.pipe( eslint( { fix: true } ) )
			.pipe( eslint.format() )
			.pipe( eslint.failAfterError() )
			.pipe( gulp.dest( './js/src' ) )
			;
	} );

	gulp.task( 'sass-site-prod', ['lint-sass'], function() {
		var processors = [
			imageInliner( { assetPaths: ['css/'], maxFileSize: 1024 } ),
			autoprefixer( { stats: ['> 1%'] } ),
			atImport(),
			cssdeclsort( { order: 'alphabetically' } ),
			cssnano(),
		];
		return gulp.src( './sass/main.scss' )
			.pipe( plumber( { errorHandler: onError } ) )
			.pipe( sourcemaps.init() )
			.pipe( sass( { outputStyle: 'nested' } ) )
			.pipe( postcss( processors ) )
			.pipe( rename( 'main.prod.css' ) )
			.pipe( gulp.dest( './css/' ) );
	} );

	gulp.task( 'watch', ['sass', 'js'], function() {
		livereload.listen();
		gulp.watch( 'sass/**/*.scss', ['sass'] );
		gulp.watch( '**/*.php', notifyLiveReload );
		gulp.watch( 'js/src/*.js', ['js'] );
	} );

	gulp.task( 'sass-site', ['sass-site-dev', 'sass-site-prod'] );
	gulp.task( 'sass', ['sass-site', 'sass-editor', 'sass-admin'] );
	gulp.task( 'js', [/*'js-dev', 'js-prod'*/] );
	gulp.task( 'default', ['sass'/*, 'js'*/] );
}());

