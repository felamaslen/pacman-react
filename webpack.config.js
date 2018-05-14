const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const __DEV__ = process.env.NODE_ENV === 'development';
const __PROD__ = process.env.NODE_ENV === 'production';

function sassLoader() {
    const common = ['css-loader', 'sass-loader'];

    if (__DEV__) {
        return ['style-loader', ...common];
    }

    return [MiniCssExtractPlugin.loader, ...common];
}

function getPlugins() {
    const common = [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: './index.html'
        })
    ];

    if (__DEV__) {
        return common;
    }

    return [
        ...common,
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ];
}

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'html-loader',
                        options: { minimize: true }
                    }
                ]
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: sassLoader()
            }
        ]
    },
    plugins: getPlugins()
};

