import Vue from 'vue';
import Dev from './serve.vue';
import storeScenario from '../src/store'
// To register individual components where they are used (serve.vue) instead of using the
// library as a whole, comment/remove this import and it's corresponding "Vue.use" call
import Scenario from '@/entry.esm';
Vue.use(Scenario);

Vue.config.productionTip = false;

new Vue({
  storeScenario,
  render: (h) => h(Dev),
}).$mount('#app');
