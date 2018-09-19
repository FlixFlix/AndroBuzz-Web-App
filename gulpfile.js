/* eslint-env node */
(function() {
	'use strict';

	var gulp = require( 'gulp' );
	var gutil = require( 'gulp-util' );
	var livereload = require( 'gulp-livereload' );

	var onError = function( err ) {
		console.log( 'An error ocurred: ', gutil.colors.magenta( err.message ) );
		this.emit( 'end' );
	};

	function notifyLiveReload( event ) {
		console.log(event.path);
		var fileName = require( 'path' ).relative( __dirname, event.path );
		livereload.changed( fileName );
	}

	gulp.task( 'watch', [], function() {

		// livereload.listen();
		gulp.watch( '*.css', notifyLiveReload() );
		gulp.watch( '*.php', notifyLiveReload() );
		gulp.watch( '*.js', notifyLiveReload() );

	} );
	gulp.task( 'default', ['watch'] );
}());

