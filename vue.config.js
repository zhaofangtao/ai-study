const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  transpileDependencies: ['@dcloudio/uni-ui'],
  
  // 微信小程序特定配置
  chainWebpack: config => {
    // 处理小程序的特殊需求
    if (process.env.UNI_PLATFORM === 'mp-weixin') {
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      })
    }
  }
}