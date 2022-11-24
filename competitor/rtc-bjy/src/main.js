import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './global.less'

import * as BRTC from './lib/BRTC'
Vue.config.productionTip = false

window.BRTC = BRTC

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
