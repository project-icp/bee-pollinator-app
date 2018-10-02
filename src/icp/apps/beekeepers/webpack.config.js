const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PRODUCTION = 'production';
const DEVELOPMENT = 'development';

const outputPath = '/usr/dist';

module.exports = ({ production }) => {
    const common = {
        mode: production ? PRODUCTION : DEVELOPMENT,
        entry: {
            app: ['babel-polyfill', './js/src/main.jsx'],
            vendor: [
                'axios',
                'immutability-helper',
                'leaflet',
                'react',
                'react-dom',
                'react-leaflet',
                'react-redux',
                'react-router',
                'react-router-dom',
                'redux',
                'redux-act',
                'redux-logger',
                'redux-thunk',
            ],
        },
        output: {
            path: outputPath,
            publicPath: '/',
            filename: '[name].bundle.[hash].js',
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Project Name',
                template: 'template.html',
            }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map',
                exclude: ['vendor.bundle.[hash].js'],
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(production ? PRODUCTION : DEVELOPMENT),
                },
            }),
            new webpack.LoaderOptionsPlugin(production ? { minimize: true } : { debug: true }),
        ],
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules|lib)/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['env', 'react'],
                        plugins: [
                            'react-hot-loader/babel',
                            'transform-object-assign',
                            'transform-object-rest-spread',
                            'syntax-dynamic-import',
                        ],
                    },
                },
                {
                    test: /\.jsx?/,
                    exclude: /(node_modules|lib|json)/,
                    loader: 'eslint-loader',
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'resolve-url-loader',
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                // eslint-disable-next-line global-require
                                plugins: () => [require('autoprefixer')],
                            },
                        },
                        {
                            loader: 'sass-loader?sourceMap',
                        },
                    ],
                },
                {
                    test: /fonts.*\.(woff|woff2|ttf|eot|svg)($|\?)/,
                    loader: 'url-loader?limit=25000&name=font/[name].[ext]',
                },
                {
                    test: /(img|images).*\.(jpg|png|gif|svg)$/,
                    loader: 'url-loader?limit=25000&name=img/[name].[ext]',
                },
                {
                    test: /.*\.(json)$/,
                    exclude: /node_modules/,
                    loader: 'json-loader',
                },
                {
                    test: /\.(html)$/,
                    loader: 'html-loader?name=[name].[ext]',
                },
                {
                    test: require.resolve('leaflet'),
                    use: [
                        'expose-loader?L',
                        'expose-loader?leaflet',
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx'],
            modules: ['common', 'node_modules', 'img', 'js'],
        },
        node: {
            fs: 'empty',
        },
        devServer: {
            disableHostCheck: true,
            historyApiFallback: {
                index: '/',
            },
        },
    };

    if (!production) {
        return Object.assign({}, common, {
            watchOptions: {
                poll: 1000,
                ignored: /node_modules/,
            },
        });
    }

    return Object.assign({}, common, {
        optimization: {
            minimize: true,
        },
    });
};
