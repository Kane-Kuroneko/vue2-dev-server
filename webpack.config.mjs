const cssLoaderOptions = {
	sourceMap: true,
	modules: {
		exportLocalsConvention: 'dashes',
		localIdentName: '[local]--[hash:base64:4]',
	},
};
const { ProvidePlugin} = webpack;
import { fileURLToPath } from 'url';
import _ from 'lodash';
import path from 'path';
import webpack from 'webpack';
import { babelConfigFn } from './babel.config.fn.mjs';

/*项目根目录绝对路径*/
const absRootPath = path.join(path.dirname(fileURLToPath(import.meta.url)) , "./");
const node_env = "development";
export default {
	entry : path.join(absRootPath,'src/main.ts'),
	mode: node_env,
	output: {
		filename: node_env === 'development' ? '[name].bundle.js' : '[name].bundle.[contenthash:6].js',
		path : path.join(absRootPath , 'dist'),
		// publicPath : path.resolve(rootPath , 'dist') ,
	},
	resolve: {
		aliasFields: ['browser'],
		alias: {
			
		},
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
	},
	devtool: 'cheap-source-map',
	module: {
		rules: [
			{
				test: /\.m?js$/,
				resolve: {
					fullySpecified: false,
				},
			},
			{
				test: /\.(jsx?|tsx?)$/i,
				use: {
					loader: 'babel-loader',
					options : {
						...babelConfigFn('vue2'),
					},
				},
				exclude: [
					/node_modules/,
				],
			},
			{
				test : /\.vue$/i,
				loader : "vue-loader"
			},
			{
				test: /\.module\.less$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
						options: cssLoaderOptions,
					},
					{
						loader: 'less-loader',
						options: {
							sourceMap: true,
							lessOptions: {
								javascriptEnabled: true,
							},
						},
					},
				],
			},
			{
				test: /(?<!(\.module|\.theme))\.less$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
						options: _.pick(cssLoaderOptions, ['sourceMap']),
					},
					{
						loader: 'less-loader',
						options: {
							sourceMap: true,
							lessOptions: {
								javascriptEnabled: true,
							},
						},
					},
				],
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
						options: cssLoaderOptions,
					},
				],
			},
			{
				test: /\.module\.css$/,
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
						options: cssLoaderOptions,
					},
				],
			},
			{
				test: /\.(png|jpe?g|te?xt|gif|woff|woff2|eot|ttf|otf|bmp|swf|mp4)$/,
				type: 'asset/resource',
				generator: {
					filename: 'static/[hash][ext][query]',
				},
				parser: {
					dataUrlCondition: {
						maxSize: 20 * 1024,
					},
				},
			},
			{
				test: /\.component\.svg$/,
				use: ['@svgr/webpack'],
			},
			{
				test: /(?<!\.component)\.svg$/,
				type: 'asset/resource',
			},
		],
	},
	optimization: {
		minimize : false ,
	},
	performance: {
		maxEntrypointSize: 10000000,
		maxAssetSize: 30000000,
	},
	devServer : {
		static : {
			// directory : path.resolve(rootPath , 'dist')
		} ,
		compress : false ,
		port : 3000 ,
		server : "http" ,
		hot : true ,
		open : false ,
		allowedHosts: "all",
		historyApiFallback : true ,
	} ,
	plugins: [
		new VueLoaderPlugin(),
		new HtmlWebpackPlugin({
			template: path.join(absRootPath ,'index.template.ejs'),
			filename: 'index.html',
			minify: false,
			hash: true,
			excludeChunks: [],
			inject: false,
		}),
	],
};
import HtmlWebpackPlugin from 'html-webpack-plugin';


import { VueLoaderPlugin } from 'vue-loader';

