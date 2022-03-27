import Vue from "vue";
import Vuex from "vuex";
import scenarios from "./modules/scenarios";
import { LOADING_START, LOADING_STOP, CHANGE_LANGUAGE } from "./action-types";
import { CHANGE_LOADING_STATUS, SET_LANGUAGE } from "./mutation-types";
import {helpers} from "chart.js";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

const LANG_KEY = "language";
const initLang = (() => {
  let lang = window.window.sessionStorage.getItem(LANG_KEY) || "ja";
  return lang || "ja";
})();

export default new Vuex.Store({
  state: {
    isLoading: false,
    lang: initLang,
  },
  actions: {
    [LOADING_START]({ commit }) {
      commit(CHANGE_LOADING_STATUS, true);
    },
    [LOADING_STOP]({ commit }) {
      commit(CHANGE_LOADING_STATUS, false);
    },
    [CHANGE_LANGUAGE]({ commit }, payload) {
      commit(SET_LANGUAGE, payload);
    },
  },
  mutations: {
    [CHANGE_LOADING_STATUS](state, loadingStatus) {
      state.isLoading = loadingStatus;
    },
    [SET_LANGUAGE](state, payload) {
      window.window.sessionStorage.setItem(LANG_KEY, payload.lang);
      payload.i18n.locale = payload.lang;
      state.lang = payload.lang;
    },
  },
  getters: {
    isLoading: (state) => state.isLoading,
  },
  modules: {
    scenarios
  },
  strict: debug,
});
