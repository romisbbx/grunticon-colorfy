module.exports = function(grunt) {
	var gruntConfig = {
			app: {
				svg: {
					src: 'svg',
					min: '_build/svg/min',
					tmp: '_build/svg/tmp',
					sprite: '_build/svg/sprite',
					compiled: '_build/css/icons'
				}
			},

			clean: {
				options: {
					force: true
				},
				build: [ '_build' ],
				svgtmp: [ '_build/svg' ]
			},

			watch: {
				svg: {
					files: '<%= app.svg.src %>/**/*.svg',
					tasks: 'svgBuild'
				}
			},

			copynoncoloring: {
				copy: {
					options: {
						src: '<%= app.svg.src %>',
						dest: '<%= app.svg.sprite %>'
					}
				}
			},

			svgcoloring: {
				svg: {
					options: {
						src: '<%= app.svg.src %>',
						dest: '<%= app.svg.tmp %>',
						options: {
							dynamicColorOnly: true,
							separateFolder: true,
							indexFileName: true,
							colors: {
								base:       '#999999',
								link:       '#23c1cd',
								hover:      '#c2135c',
								red:        '#f74304'
							}
						}
					}
				}
			},

			svgspriteconfig: {
				config: {
					options: {
						src: '<%= app.svg.tmp %>',
						dest: '<%= app.svg.sprite %>'
					}
				}
			},

			svgsprite: {
				options: {
					render: {
						css: false
					},
					padding: 10,
					spritedir: ''
				}
			},

			svgmin: {
				options: {
					plugins: [
						{ removeViewBox: true },               // don't remove the viewbox atribute from the SVG
						{ removeUselessStrokeAndFill: true },  // don't remove Useless Strokes and Fills
						{ removeEmptyAttrs: true }             // don't remove Empty Attributes from the SVG
					]
				},
				dist: {
					files: [{
						expand: true,
						cwd: '<%= app.svg.sprite %>',
						src: ['**/*.svg'],
						dest: '<%= app.svg.min %>',
						ext: '.svg'
					}]
				}
			},

			grunticon: {
				svg: {
					files: [{
						expand: true,
						cwd: '<%= app.svg.min %>',
						src: ['*.svg'],
						dest: '<%= app.svg.compiled %>'
					}],
					options: {
						pngfolder: '../../img/icons/'
					}
				}
			}
		};

	grunt.initConfig(gruntConfig);

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-svgmin');
	grunt.loadNpmTasks('grunt-svg-sprite');
	grunt.loadNpmTasks('grunt-grunticon');

	var path = require( 'path'),
		fs = require('fs'),
		_ = require( 'lodash' );

	// копирует SVG у которых не заданы цвета в имени файла во временную директорию
	grunt.registerMultiTask('copynoncoloring', 'Copy non color files', function() {
		grunt.log.writeln('Copy non color files');

		var options = this.options(),
			files = fs.readdirSync(options.src);

		var transferFiles = files.filter( function( f ){
			return !f.match( /\.colors/ );
		});

		transferFiles.forEach( function( f ){
			grunt.file.copy( path.join(options.src, f), path.join( options.dest, f ) );
		});
	});

	// создает разноцветные SVG
	grunt.registerMultiTask('svgcoloring', 'Coloring SVG files', function() {
		var options = this.options();

		grunt.log.writeln('Coloring SVG files');

		var DirectoryColorfy = require('directory-colorfy'),
			dc = new DirectoryColorfy(options.src, options.dest, options.options);

		// тут используется кастомизированный модуль 'directory-colorfy'
		// url расположения модуля указан в package.json

		dc.convert();
	});

	//  создает конфиг для svgsprite
	grunt.registerMultiTask('svgspriteconfig', 'Create SVG config', function() {
		grunt.log.writeln('Create coloring SVG config for sprites');

		var options = this.options(),
			spriteOptions = grunt.config.get('svgsprite'),
			files = fs.readdirSync(options.src);

		files.forEach(function (file) {
			var filePath = path.join(options.src, file);

			if (fs.statSync(filePath).isDirectory()) {
				spriteOptions[file] = {
					src: filePath,
					dest: options.dest,
					options: {
						sprite: file
					}
				}
			}
		});

		grunt.config.set('svgsprite', spriteOptions);
	});

	// Кастомные задачи
	grunt.registerTask('svgBuild', ['copynoncoloring', 'svgcoloring', 'svgspriteconfig', 'svgsprite', 'svgmin', 'grunticon:svg', 'clean:svgtmp']);

	// Как работает задача svgBuild:

	// В имени svg могут быть заданы цвета или константы цветов.
	// Например: 'fileName.colors-link-hover.svg' или 'fileName.colors-#fff-#000.svg'
	// Константы задаются в этом файле в объекте gruntConfig.
	// Из таких svg будет создан спрайт содержаший копии иконки заданных цветов.
	// В результате работы этой задачи создается css файл содержаший svg закодированные в base64.
	//
	// copynoncoloring - копирует SVG у которых не заданы цвета в имени файла во временную директорию
	// svgcoloring - создает разноцветные SVG
	// svgspriteconfig - создает конфиг для svgsprite
	// svgsprite - из раскрашенных SVG делает спрайты
	// svgmin - оптимизирует все SVG
	// grunticon:svg - создает css файл с содержаший svg закодированные в base64,
	//                 а так же png картинки каждой иконки и css для них (для старых версий IE)
	// clean:svgtmp - чистит пременные директории

	grunt.registerTask('build', ['clean:build', 'svgBuild']);
	grunt.registerTask('default', ['build', 'watch']);
};