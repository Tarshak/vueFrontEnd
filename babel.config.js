const prodPlugins=[]
if(process.env.NODE_ENV==='production'){
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  "presets": [
    "@vue/cli-plugin-babel/preset"
  ],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ],
    //判断当前是否是发布阶段，如果是则把移除console第三方插件push进数组
    ...prodPlugins
  ]
}