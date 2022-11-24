module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  ignore: [/lib\/recorder\/brecorder.js$/, './src/lib/BRTC.js'],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ]
}
