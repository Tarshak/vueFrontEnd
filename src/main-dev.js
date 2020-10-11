import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1'//配置请求的根路径
axios.interceptors.request.use(config => {
// Do something before request is sent
//通过拦截器在发送请求之前添加token预处理，拥有获取数据的权限
//为请求头对象添加token验证的authorization字段
NProgress.start()
config.headers.Authorization=window.sessionStorage.getItem('token')
return config;
},error => {
// Do something with request error
return Promise.reject(error);
});
//第三方进度条库，通过拦截器在发起request和返回response时分别开启进度条和隐藏进度条

axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http=axios//将axios挂载到Vue原型链中，这样每个vue组件都可以通过this使用axios
Vue.config.productionTip = false
//在cate.vue中需要使用的树形组件，对他进行全局注册
Vue.component('tree-table',TreeTable)
//注册用于格式化时间的全局过滤器
Vue.filter('dateFormat',originVal=>{
  const dt=new Date(originVal)
  const y=dt.getFullYear()
  //该函数从0开始,因此需要加一，并拼接空字符串转换类型，再调用函数如果不足两位用0填充
  const m=(dt.getMonth()+1+'').padStart(2,'0')
  const d= (dt.getDate()+'').padStart(2,'0')
  const hh= (dt.getHours()+'').padStart(2,'0')
  const mm= (dt.getMinutes()+'').padStart(2,'0')
  const ss= (dt.getSeconds()+'').padStart(2,'0')
  
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
//全局注册富文本编辑器
Vue.use(VueQuillEditor, /* { default global options } */)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
