import {
  SET_SCENARIOS,
  SET_ACTIVE_SCENARIO,
  SET_ACTIVE_SCENARIO_DATA,
  SET_IS_FETCHING_SCENARIOS,
  SET_FETCH_SCENARIOS_ERROR,
  SET_SELECTED_SCENARIO,
  SET_SCENARIO_MESSAGES,
  SET_SCENARIO_MINDMAP,
  SET_SCENARIO_MINDMAP_MESSAGES,
  SET_SCENARIO_MINDMAP_SPECIAL_TALK,
  SET_SCENARIO_TEXTMAP,
  SET_IS_FETCHING_SCENARIO_DETAIL,
  SET_FETCH_SCENARIO_DETAIL_ERROR,
  SET_IMPORTING_SCENARIO_DATA_ERROR,
  SET_IMPORTING_SCENARIO_DATA_WARNING,
  SET_IS_IMPORTING_SCENARIO_DATA,
  SET_EXPORTING_SCENARIO_DATA_ERROR,
  SET_EXPORTING_SCENARIO_DATA_WARNING,
  SET_IS_EXPORTING_SCENARIO_DATA,
  IMPORT_FINISH_SUCCESS,
  EXPORT_FINISH_SUCCESS,
  SET_SCENARIO_TALKS,
  SET_TOTAL_TALK,
  SET_DELETING_SCENARIO_VERSION_ERROR,
  SET_IS_DELETING_SCENARIO_VERSION,
  DELETE_FINISH_SUCCESS,
  DISPLAY_MESSAGES,
  SET_USER_MESSAGES,
  SET_SELECTED_EDIT_SCENARIO,
  SET_IS_SAVING_ACTIVE_SCENARIO,
  DELETE_SCENARIO_TALK_SUCCESS,
  SET_IS_CREATING_RICH_MENU,
  SET_IS_CREATING_RICH_MENU_ERROR,
  SET_IS_FETCHING_RICH_MENU,
  SET_IS_FETCHING_RICH_MENU_ERROR,
  RICH_MENUS_DATA,
  SET_IS_DELETING_RICH_MENU,
  SET_ERROR_DELETING_RICH_MENU,
  SET_ACTIVE_PRODUCTION_RICHMENU,
  SET_ACTIVE_SANDBOX_RICHMENU,
  SET_DEFAULT_PRODUCTION_RICHMENU,
  SET_DEFAULT_SANDBOX_RICHMENU,
  SET_PRODUCTION_RICHMENUS,
  SET_SANDBOX_RICHMENUS,
  REMOVE_FROM_PRODUCTION_RICHMENUS,
  REMOVE_FROM_SANDBOX_RICHMENUS,
  SET_IS_FETCHING_RICHMENU_INFO,
  SET_ERROR_FETCHING_RICHMENU_INFO,
  SET_ERROR_SETTING_RICHMENU,
  SET_BOSAI_PRODUCTION_RICHMENU,
  SET_BOSAI_SANDBOX_RICHMENU,
  SET_IS_FETCHING_ALL_RICHMENUS,
  SET_ERROR_FETCHING_ALL_RICHMENUS,
  SET_SCENARIO_IS_IN_BOSAI_MODE,
  SET_SCENARIO_ACTIVE_RICHMENU,
  SET_BOSAI_SETTINGS_SUCCESS,
  SET_IS_FETCHING_ZIP_CODES,
  SET_IS_FETCHING_ZIP_CODES_ERROR,
  SET_ZIP_CODES,
  SET_IS_SAVING_TALK_NODES,
  SET_SAVE_TALK_NODES_ERROR,
  SAVE_TALK_NODES_SUCCESS,
  CREATE_FINISH_SUCCESS,
  SET_IS_CHANGING_TALK_NAME,
  CHANGING_TALK_NAME_ERROR,
  UPDATE_DATA_FOR_SCENARIO_TALK_NAME_CHANGE,
  SET_AGGREGATE_TALK_LOG,
  SET_FETCH_TALK_LOG_LISTS,
  SET_AGGREGATE_TALK_LOG_ERROR,
  SET_FETCH_TALK_LOG_LISTS_ERROR,
  UPDATE_CHANGED_SCENARIO_VERSION_NAME,
  SET_IS_CHANGING_DISPLAY_VERSION_NAME,
  CHANGING_VERSION_NAME_ERROR,
  SET_TALK_DATATABLE_OPTION,
  SET_TALK_SEARCH_VALUE,
  SET_TALK_SEARCH_ATTRIBUTE,
  SET_TALK_SEARCH_STARTDATE, SET_TALK_SEARCH_ENDDATE,
} from "@/store/mutation-types";

import { cloneDeep } from "lodash";
import Vue from "vue";
import {
  SET_SEARCH_ATTRIBUTE_SCENARIO,
  SET_SEARCH_KEYWORD_SCENARIO,
  SET_SETTING_SCENARIOS,
  SET_TABLE_OPTION_SCENARIO,
  SET_LIST_SCENARIOS,
  SET_SCENARIOS_TALK_PAGINATE
} from "@/store/modules/scenarios/mutations-types";

export default {
  [SET_SCENARIOS]: (state, value) => (state.scenariosList = value),
  [SET_LIST_SCENARIOS]: (state, value) => (state.scenariosListPaginate = value),
  [SET_ACTIVE_SCENARIO_DATA]: (state, value) => (state.activeScenarioData = value),
  [SET_ACTIVE_SCENARIO]: (state, value) => (state.activeScenario = value),
  [SET_IS_FETCHING_SCENARIOS]: (state, value) => (state.isFetchingScenarios = value),
  [SET_FETCH_SCENARIOS_ERROR]: (state, value) => (state.fetchScenariosError = value),
  [SET_SELECTED_SCENARIO]: (state, scenarioId) => {
    let selectedScenario = state.scenariosList.find((obj) => obj.scenarioId === scenarioId);
    state.selectedScenario = selectedScenario;
  },
  [SET_IS_FETCHING_SCENARIO_DETAIL]: (state, value) => (state.isFetchingScenarioDetail = value),
  [SET_FETCH_SCENARIO_DETAIL_ERROR]: (state, value) => (state.fetchScenarioDetailError = value),
  [SET_IMPORTING_SCENARIO_DATA_ERROR]: (state, value) => (state.importingScenarioDataError = value),
  [SET_IMPORTING_SCENARIO_DATA_WARNING]: (state, value) => (state.importingScenarioDataWarning = value),
  [SET_IS_IMPORTING_SCENARIO_DATA]: (state, value) => (state.isImportingScenarioData = value),
  [IMPORT_FINISH_SUCCESS]: (state, value) => (state.importFinishSuccess = value),
  [CREATE_FINISH_SUCCESS]: (state, value) => (state.createFinishSuccess = value),
  [SET_EXPORTING_SCENARIO_DATA_ERROR]: (state, value) => (state.exportingScenarioDataError = value),
  [SET_EXPORTING_SCENARIO_DATA_WARNING]: (state, value) => (state.exportingScenarioDataWarning = value),
  [SET_IS_EXPORTING_SCENARIO_DATA]: (state, value) => (state.isExportingScenarioData = value),
  [EXPORT_FINISH_SUCCESS]: (state, value) => (state.exportFinishSuccess = value),
  [SET_SCENARIO_MESSAGES]: (state, value) =>
      (state.scenarioMessages = value.filter((item) => item.dataType != "richmenu")),
  [SET_SCENARIO_MINDMAP_MESSAGES]: (state, payload) => {
    if (payload.versionName in state.scenarioMindmap) {
      state.scenarioMindmap[payload.versionName][payload.valueName] = payload.value;
    } else {
      state.scenarioMindmap[payload.versionName] = {};
      state.scenarioMindmap[payload.versionName][payload.valueName] = payload.value;
    }
  },
  [SET_SCENARIO_MINDMAP]: (state, value) => {
    state.scenarioMindmap = value;
  },
  [SET_SCENARIO_MINDMAP_SPECIAL_TALK]: (state, payload) => {
    state.scenarioMindmap[payload.listName][payload.talkName] = payload.value;
  },
  [SET_SCENARIO_TEXTMAP]: (state, value) => (state.scenarioTextmap = value),
  [SET_SCENARIO_TALKS]: (state, value) => (state.scenarioTalks = value),
  [SET_TOTAL_TALK]: (state, value) => (state.totalTalks = value),
  [SET_TALK_DATATABLE_OPTION]: (state, value) => (state.talkDataTableOptions = value),
  [SET_TALK_SEARCH_ATTRIBUTE]: (state, value) => (state.searchTalkAttribute = value),
  [SET_TALK_SEARCH_VALUE]: (state, value) => (state.searchTalkKeyword = value),
  [SET_TALK_SEARCH_STARTDATE]: (state, value) => (state.searchTalkStartDate = value),
  [SET_TALK_SEARCH_ENDDATE]: (state, value) => (state.searchTalkEndDate = value),
  [DELETE_SCENARIO_TALK_SUCCESS]: (state, value) => (state.deleteScenarioTalkSuccess = value),
  [SET_DELETING_SCENARIO_VERSION_ERROR]: (state, value) => (state.deletingScenarioVersionError = value),
  [SET_IS_DELETING_SCENARIO_VERSION]: (state, value) => (state.isDeletingScenarioVersion = value),
  [DELETE_FINISH_SUCCESS]: (state, value) => (state.deleteFinishSuccess = value),
  [DISPLAY_MESSAGES]: (state, value) => (state.displayMessages = value),
  [SET_USER_MESSAGES]: (state, value) => (state.userMessages = value),
  [SET_SELECTED_EDIT_SCENARIO]: (state, payload) => {
    if (payload.environment == "both") {
      state.selectedEditScenario.production = payload.value;
      state.selectedEditScenario.sandbox = payload.value;
    } else {
      state.selectedEditScenario[payload.environment] = payload.value;
    }
  },
  [SET_IS_SAVING_ACTIVE_SCENARIO]: (state, value) => (state.isSavingActiveScenario = value),
  [SET_IS_CREATING_RICH_MENU]: (state, value) => (state.isCreatingRichMenu = value),
  [SET_IS_CREATING_RICH_MENU_ERROR]: (state, value) => (state.isCreatingRichMenuError = value),
  [SET_IS_FETCHING_RICH_MENU]: (state, value) => (state.isFetchingRichMenu = value),
  [SET_IS_FETCHING_RICH_MENU_ERROR]: (state, value) => (state.isFetchingRichMenuError = value),
  [RICH_MENUS_DATA]: (state, value) => (state.richMenus = value),
  [SET_IS_DELETING_RICH_MENU]: (state, value) => (state.isDeletingRichMenu = value),
  [SET_ERROR_DELETING_RICH_MENU]: (state, value) => (state.errorDeletingRichMenu = value),
  [SET_ACTIVE_PRODUCTION_RICHMENU]: (state, value) => (state.activeProductionRichMenu = value),
  [SET_ACTIVE_SANDBOX_RICHMENU]: (state, value) => (state.activeSandboxRichMenu = value),
  [SET_DEFAULT_PRODUCTION_RICHMENU]: (state, value) => (state.defaultProductionRichMenu = value),
  [SET_DEFAULT_SANDBOX_RICHMENU]: (state, value) => (state.defaultSandboxRichMenu = value),
  [SET_BOSAI_PRODUCTION_RICHMENU]: (state, value) => (state.bosaiProductionRichMenu = value),
  [SET_BOSAI_SANDBOX_RICHMENU]: (state, value) => (state.bosaiSandboxRichMenu = value),
  [SET_PRODUCTION_RICHMENUS]: (state, value) => {
    state.productionRichMenuList = value.sort((a, b) => {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });
  },
  [REMOVE_FROM_PRODUCTION_RICHMENUS]: (state, idToRemove) => {
    const indexToSplice = state.productionRichMenuList.map((elem) => elem.richMenuId).indexOf(idToRemove);
    state.productionRichMenuList.splice(indexToSplice, 1);
  },
  [SET_SANDBOX_RICHMENUS]: (state, value) => {
    state.sandboxRichMenuList = value.sort((a, b) => {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });
  },
  [REMOVE_FROM_SANDBOX_RICHMENUS]: (state, idToRemove) => {
    const indexToSplice = state.sandboxRichMenuList.map((elem) => elem.richMenuId).indexOf(idToRemove);
    state.sandboxRichMenuList.splice(indexToSplice, 1);
  },
  [SET_IS_FETCHING_RICHMENU_INFO]: (state, value) => (state.isFetchingRichMenuInfo = value),
  [SET_ERROR_FETCHING_RICHMENU_INFO]: (state, value) => (state.errorFetchingRichMenuInfo = value),
  [SET_IS_FETCHING_ALL_RICHMENUS]: (state, value) => (state.isFetchingAllRichMenus = value),
  [SET_ERROR_FETCHING_ALL_RICHMENUS]: (state, value) => (state.errorFetchingAllRichMenus = value),
  [SET_ERROR_SETTING_RICHMENU]: (state, value) => (state.errorSettingRichMenu = value),
  [SET_SCENARIO_ACTIVE_RICHMENU]: (state, value) => (state.isSettingScenarioRichMenu = value),
  [SET_SCENARIO_IS_IN_BOSAI_MODE]: (state, value) => (state.scenarioInBosaiMode = value),
  [SET_BOSAI_SETTINGS_SUCCESS]: (state, value) => (state.settingBosaiSettingsSuccess = value),
  [SET_IS_FETCHING_ZIP_CODES]: (state, value) => (state.isFetchingZipCodes = value),
  [SET_IS_FETCHING_ZIP_CODES_ERROR]: (state, value) => (state.fetchZipCodeError = value),
  [SET_ZIP_CODES]: (state, value) => (state.zipCodes = value),

  [SET_IS_SAVING_TALK_NODES]: (state, value) => (state.isSavingTalkNodes = value),
  [SET_SAVE_TALK_NODES_ERROR]: (state, value) => (state.saveTalkNodesError = value),
  [SAVE_TALK_NODES_SUCCESS]: (state, value) => (state.saveTalkNodesSuccess = value),
  [SET_AGGREGATE_TALK_LOG]: (state, value) => (state.agregateTalkLog = value),
  [SET_AGGREGATE_TALK_LOG_ERROR]: (state, value) => (state.agregateTalkLogError = value),
  [SET_FETCH_TALK_LOG_LISTS]: (state, value) => (state.isFetchingTalkLogLists = value),
  [SET_FETCH_TALK_LOG_LISTS_ERROR]: (state, value) => (state.isFetchingTalkLogListsError = value),

  [SET_IS_CHANGING_TALK_NAME]: (state, value) => (state.isChangingTalkName = value),
  [CHANGING_TALK_NAME_ERROR]: (state, value) => (state.changingTalkNameError = value),
  [UPDATE_DATA_FOR_SCENARIO_TALK_NAME_CHANGE]: (state, value) => {
    const scenarioVersionId = value.versionId;
    const newTalkName = value.newTalkName;
    const oldTalkId = value.talkObject.dataId;
    const oldTalkName = value.talkObject.params.name;
    state.displayMessages.forEach(elem => {
      elem.talk = newTalkName;
    });
    state.scenarioMessages.forEach(elem => {
      if (elem.talk === oldTalkName) {
        elem.talk = newTalkName;
      }
    });
    state.scenarioTalks.forEach(elem => {
      if(elem.dataId === oldTalkId) {
        elem.params.name = newTalkName;
      }
    });
    if (scenarioVersionId in state.scenarioMindmap &&
        oldTalkName in state.scenarioMindmap[scenarioVersionId]) {
      state.scenarioMindmap[scenarioVersionId][newTalkName] = cloneDeep(state.scenarioMindmap[scenarioVersionId][oldTalkName]);
      state.scenarioMindmap[scenarioVersionId][newTalkName].forEach(elem => {
        elem.talk = newTalkName;
      });
      delete state.scenarioMindmap[scenarioVersionId][oldTalkName];
    }
  },
  [SET_IS_CHANGING_DISPLAY_VERSION_NAME]: (state, value) => (state.isChangingVersionName = value),
  [CHANGING_VERSION_NAME_ERROR]: (state, value) => (state.changingVersionNameError = value),
  [UPDATE_CHANGED_SCENARIO_VERSION_NAME]: (state, value) => {
    const scenarioVersionId = value.versionId;
    Vue.set(state.activeScenario.versions[scenarioVersionId], "displayVersionName", value.newDisplayVersionName);
  },
  [SET_SEARCH_ATTRIBUTE_SCENARIO]: (state, value) => (state.searchAttribute = value),
  [SET_SEARCH_KEYWORD_SCENARIO]: (state, value) => (state.searchAttribute = value),
  [SET_TABLE_OPTION_SCENARIO]: (state, value) => (state.dataTableOptions = value),
  [SET_SETTING_SCENARIOS]: (state, value) => (state.settings = value),
  [SET_SCENARIOS_TALK_PAGINATE]: (state, value) => (state.scenarioTalksPaginate = value)
};
