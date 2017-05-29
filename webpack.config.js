const path = require('path')
const webpack = require('webpack')

module.exports = {
	entry : {
		filllogo : './src/index.js',
		'example.bundle' : './src/example.js'
	},
	output : {
		filename: '[name].js',
		path: path.resolve('./','dist/') + '/',
	},
	module : {
		loaders : [
			{ test : /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {
          presets: [
            [
              'es2015',
              {'modules':false}
            ]
          ]
        }
      }
		]
	},
	plugins : [
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.CommonsChunkPlugin({children: true, async: true}),
		new webpack.optimize.UglifyJsPlugin({sourceMap:false,compress: {warnings: false, drop_console: true}})
	]
}
