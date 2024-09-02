import Vue from 'vue';
import App from './App.vue';
import router from './router';
import KeylessAccountProvider from '@/context/KeylessAccountProvider.vue';

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(KeylessAccountProvider, [h(App)]),
}).$mount('#app');