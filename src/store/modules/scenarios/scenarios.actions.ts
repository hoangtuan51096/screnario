/*
 * Copyright 2021 LINE Fukuoka Corporation
 *
 * LINE Corporation licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
import {
  GetAllScenarios,
  GetAllScenarioMessages,
  GetScenarioDataByDataType,
  GetActiveScenarioData,
  UploadFile,
  DownloadFile,
  SetActiveScenarioData,
  UpdateTextMapping,
  UpdateScenarioDataMessage,
  UploadImageToS3,
  AddCompositeMessage,
  GetAllUnfilteredScenarioMessages,
  RemoveVersionFromScenario,
  UpdateVersionDisplayName,
  DeleteScenarioVersion,
  BatchWriteItem,
  CreateSpecialScenarioTalk,
  SetDefaultScenarioRichMenu,
  SetScenarioData,
  DeleteScenarioDetailMessage,
  UploadCSV,
  UploadLocationCSV,
  DeleteTrashScenario,
  DownloadCSVFile,
  CreateRichMenu,
  FetchAllRichMenus,
  DeleteRichMenu,
  GetActiveRichMenu,
  GetRichMenuById,
  LoadRichMenuImage,
  SetRichMenuImage,
  CreateRichMenuAlias,
  SetActiveRichMenu,
  CopyRichMenuImage,
  SetBosaiModeForEnv,
  fetchZipCodes,
  deleteZipCodes,
  downloadZipCSV,
  GetSpecialScenarioRootNode,
  AddVersionToScenario,
  CreateScenario,
  UpdateScenarioTalkName,
  FetchAllRichMenusAliasList,
  UploadImagemapImageToS3,
  AggregateTalkLog,
  FetchTalkLogLists,
  GetScenarioTalkList,
  GetScenarioTextMapping,
  SaveScenarioTalk,
  deleteTalkByIds,
  GetSettingScenarios,
  DeleteScenarios,
  CreateSettingScenarios,
  GetListScenarios, SetActiveDamageReportScenarioData
} from "@/services/scenarios.service";

import {
  FETCH_ALL_SCENARIOS,
  FETCH_SCENARIO_DETAIL,
  UPLOAD_IMPORT_FILE,
  DOWNLOAD_EXPORT_FILE,
  CHANGE_ACTIVE_SCENARIO,
  UPDATE_TEXT_MAPPING,
  UPDATE_SCENARIO_DATA,
  DELETE_SCENARIO_VERSION,
  ADD_COMPOSITE_MESSAGE,
  FETCH_ACTIVE_SCENARIO_DATA,
  CREATE_SIMPLE_SPECIAL_SCENARIO,
  SET_DEFAULT_RICH_MENU,
  DELETE_SPECIAL_SCENARIO,
  SAVE_ACTIVE_SCENARIO,
  DELETE_SCENARIO_MESSAGE,
  UPLOAD_CSV_FILE,
  UPLOAD_LOCATION_CSV_FILE,
  DOWNLOAD_CSV_FILE,
  FETCH_SCENARIO_DETAIL_TALK,
  CREATE_RICH_MENU,
  COPY_RICH_MENU,
  DELETE_RICH_MENU,
  FETCH_DEFAULT_RICHMENUS,
  SET_ACTIVE_RICH_MENU,
  FETCH_ACTIVE_RICHMENUS,
  FETCH_ALL_RICHMENUS,
  TOGGLE_BOSAI_MODE,
  SAVE_BOSAI_SETTINGS_ITEM,
  GET_ZIP_CODES,
  DELETE_ZIP_CODES,
  DOWNLOAD_ZIP_CSV,
  FETCH_SPECIAL_TALK_FLOW_START,
  SAVE_TALK_NODES,
  CREATE_SCENARIO_VERSION,
  DELETE_TALK,
  UPDATE_TALK_UPDATED_TIME,
  FETCH_SCENARIO_SPECIFIC_TALKS,
  UPDATE_SCENARIO_TALK_NAME,
  UPDATE_DISPLAY_SCENARIO_VERSION_NAME,
  FETCH_ALL_RICHMENUS_ALIAS_LIST,
  AGGREGATE_TALK_LOG,
  FETCH_TALK_LOG_LISTS,
  FETCH_SCENARIO_TALK,
  CREATE_SCENARIO_TALK
} from "@/store/action-types";

import {
  SET_SCENARIOS,
  SET_ACTIVE_SCENARIO_DATA,
  SET_ACTIVE_SCENARIO,
  SET_IS_FETCHING_SCENARIOS,
  SET_FETCH_SCENARIOS_ERROR,
  SET_SELECTED_SCENARIO,
  SET_SCENARIO_MESSAGES,
  SET_SCENARIO_TEXTMAP,
  SET_IS_FETCHING_SCENARIO_DETAIL,
  SET_FETCH_SCENARIO_DETAIL_ERROR,
  SET_USER_MESSAGES,
  SET_IMPORTING_SCENARIO_DATA_ERROR,
  SET_IS_IMPORTING_SCENARIO_DATA,
  IMPORT_FINISH_SUCCESS,
  SET_SELECTED_EDIT_SCENARIO,
  SET_EXPORTING_SCENARIO_DATA_ERROR,
  SET_IS_EXPORTING_SCENARIO_DATA,
  EXPORT_FINISH_SUCCESS,
  SET_SCENARIO_MINDMAP_SPECIAL_TALK,
  SET_SCENARIO_TALKS,
  SET_IMPORTING_SCENARIO_DATA_WARNING,
  SET_EXPORTING_SCENARIO_DATA_WARNING,
  SET_DELETING_SCENARIO_VERSION_ERROR,
  SET_IS_DELETING_SCENARIO_VERSION,
  DELETE_FINISH_SUCCESS,
  SET_IS_SAVING_ACTIVE_SCENARIO,
  SET_IS_CREATING_RICH_MENU,
  SET_IS_CREATING_RICH_MENU_ERROR,
  SET_ERROR_DELETING_RICH_MENU,
  SET_ACTIVE_PRODUCTION_RICHMENU,
  SET_ACTIVE_SANDBOX_RICHMENU,
  SET_DEFAULT_PRODUCTION_RICHMENU,
  SET_DEFAULT_SANDBOX_RICHMENU,
  SET_BOSAI_PRODUCTION_RICHMENU,
  SET_BOSAI_SANDBOX_RICHMENU,
  SET_PRODUCTION_RICHMENUS,
  SET_SANDBOX_RICHMENUS,
  REMOVE_FROM_PRODUCTION_RICHMENUS,
  REMOVE_FROM_SANDBOX_RICHMENUS,
  SET_IS_FETCHING_RICHMENU_INFO,
  SET_ERROR_FETCHING_RICHMENU_INFO,
  SET_IS_FETCHING_ALL_RICHMENUS,
  SET_ERROR_FETCHING_ALL_RICHMENUS,
  SET_ERROR_SETTING_RICHMENU,
  SET_SCENARIO_IS_IN_BOSAI_MODE,
  SET_BOSAI_SETTINGS_SUCCESS,
  SET_IS_FETCHING_ZIP_CODES,
  SET_IS_FETCHING_ZIP_CODES_ERROR,
  SET_ZIP_CODES,
  SET_IS_SAVING_TALK_NODES,
  SET_SAVE_TALK_NODES_ERROR,
  SAVE_TALK_NODES_SUCCESS,
  CREATE_FINISH_SUCCESS,
  DELETE_SCENARIO_TALK_SUCCESS,
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
  SET_TOTAL_TALK,
  SET_TALK_DATATABLE_OPTION,
  SET_TALK_SEARCH_ATTRIBUTE,
  SET_TALK_SEARCH_VALUE, SET_TALK_SEARCH_STARTDATE, SET_TALK_SEARCH_ENDDATE,
} from "@/store/mutation-types";

import cloneDeep from "lodash/cloneDeep";
import moment from "moment";
import { generateUUID } from "@/utils/uuidUtils";
import { BOSAI_RICH_MENU_PARAM, NORMAL_RICH_MENU_PARAM, TEMPLATE_TALKS, TEMPLATE_TALK_IDS } from "./scenarios.constants";
import isNumber from "lodash/isNumber";
import {
  FETCH_SCENARIOS_LIST,
  FETCH_SCENARIOS_SETTING,
  SET_SETTING_SCENARIOS,
  SET_LIST_SCENARIOS,
  SET_SCENARIOS_TALK_PAGINATE
} from "@/store/modules/scenarios/mutations-types";

const ERR_SKELETON = (commit, type, err) => {
  if (err.toString() == "Error: Network Error") {
    err = new String(
        "ページの再読み込み実施を実施してください。それでも表示されない場合は、\n" +
        "サーバへアクセスが混み合っているか、メンテナンス中の可能性があります。\n" +
        "しばらく時間をおいてから、もう一度アクセスしてください。"
    );
  } else {
    if (err.response && err.response.status === 403) {
      err = new String("この操作を行う場合は、権限を管理者にお問い合わせください。");
    }
  }
  commit(type, err);
};

async function verifyOrDownloadRichMenuImage(richMenuId, environment) {
  var richMenuImageUrl =
      "https://" + process.env.VUE_APP_SCENARIO_CLOUDFRONT_DOMAIN_NAME + "/resources/richmenus/" + richMenuId;
  const response = await fetch(richMenuImageUrl, {
    method: "HEAD",
    cache: "no-cache",
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  if (response.status && response.status == 403) {
    await LoadRichMenuImage(richMenuId, environment);
  }
}

async function settingScenarioData(commit, param, env, menu) {
  const responseJson = await GetActiveScenarioData();
  var activeScenarioData = responseJson.item;
  var newScenarioData = cloneDeep(activeScenarioData);
  var valueToSet = param[env];
  var richMenusToSet = {};
  richMenusToSet[valueToSet] = menu.richMenuId;
  if (newScenarioData) {
    if (newScenarioData.richMenus) {
      newScenarioData.richMenus[valueToSet] = menu.richMenuId;
    } else {
      newScenarioData["richMenus"] = richMenusToSet;
    }
  } else {
    newScenarioData = {
      scenarioId: "settings",
      richMenus: richMenusToSet,
    };
  }
  await SetScenarioData(newScenarioData);
  if (newScenarioData.scenarioId == "settings") {
    commit(SET_ACTIVE_SCENARIO_DATA, newScenarioData);
  } else {
    commit(SET_ACTIVE_SCENARIO, newScenarioData);
  }
  if (param[env] == "bosaiProduction") commit(SET_BOSAI_PRODUCTION_RICHMENU, menu);
  else if (param[env] == "bosaiSandbox") commit(SET_BOSAI_SANDBOX_RICHMENU, menu);
  else if (param[env] == "defaultProduction") commit(SET_DEFAULT_PRODUCTION_RICHMENU, menu);
  else commit(SET_DEFAULT_SANDBOX_RICHMENU, menu);
}


async function uploadAndReplaceMedia(payload) {
  if (payload.model.dataType === "imagemap") {
    if (payload.model.params["baseUrl"] && payload.model.params["baseUrl"].startsWith("data:")) {
      const { baseUrl, generatedUUID } = await UploadImagemapImageToS3(payload.model.params["baseUrl"]);
      payload.model.params["baseUrl"] = baseUrl;
      payload.model.params["image2"]["file"]["id"] = generatedUUID;
    }
    delete payload["files"];
    delete payload.model.params.editingBaseImage;
    delete payload.model.params.tempBaseUrl;
  }
  if (payload.model.dataType === "image") {
    var fileData = payload["files"];
    delete payload["files"];
    if ("editingOriginalImage" in payload.model.params && payload.model.params.editingOriginalImage) {
      if (payload.model.params.originalImageLocal) {
        var generatedUUID = generateUUID();
        const s3Response = await UploadImageToS3(fileData[0], generatedUUID, "resources");
        payload.model.params["originalContentUrl"] =
            "https://" + s3Response["cloudFrontDist"] + "/resources/" + generatedUUID;
      } else {
        payload.model.params["originalContentUrl"] = payload.model.params.tempOriginalImage;
      }
    }
    if ("editingPreviewImage" in payload.model.params && payload.model.params.editingPreviewImage) {
      if (payload.model.params.previewImageLocal) {
        let generatedUUID = generateUUID();
        const s3Response = await UploadImageToS3(fileData[1], generatedUUID, "resources");
        payload.model.params["previewImageUrl"] =
            "https://" + s3Response["cloudFrontDist"] + "/resources/" + generatedUUID;
      } else {
        payload.model.params["previewImageUrl"] = payload.model.params.tempPreviewImage;
      }
    }
    delete payload.model.params.tempOriginalImage;
    delete payload.model.params.tempPreviewImage;
    delete payload.model.params.editingOriginalImage;
    delete payload.model.params.editingPreviewImage;
  }
  if (payload.model.dataType === "video") {
    let fileData = payload["files"];
    delete payload["files"];
    if ("editingOriginalVideo" in payload.model.params && payload.model.params.editingOriginalVideo) {
      if (payload.model.params.originalContentLocal) {
        let generatedUUID = generateUUID();
        generatedUUID += ".mp4";
        const s3Response = await UploadImageToS3(fileData[0], generatedUUID, "resources");
        payload.model.params["originalContentUrl"] =
            "https://" + s3Response["cloudFrontDist"] + "/resources/" + generatedUUID;
      } else {
        payload.model.params["originalContentUrl"] = payload.model.params.tempOriginalVideo;
      }
    }
    if ("editingPreviewImage" in payload.model.params && payload.model.params.editingPreviewImage) {
      if (payload.model.params.previewImageLocal) {
        let generatedUUID = generateUUID();
        const s3Response = await UploadImageToS3(fileData[1], generatedUUID, "resources");
        payload.model.params["previewImageUrl"] =
            "https://" + s3Response["cloudFrontDist"] + "/resources/" + generatedUUID;
      } else {
        payload.model.params["previewImageUrl"] = payload.model.params.tempPreviewImage;
      }
    }
    delete payload.model.params.tempOriginalVideo;
    delete payload.model.params.tempPreviewImage;
    delete payload.model.params.editingOriginalVideo;
    delete payload.model.params.editingPreviewImage;
  }
  if (payload.model.dataType === "audio") {
    let fileData = payload["files"];
    delete payload["files"];
    if ("editingSoundFile" in payload.model.params && payload.model.params.editingSoundFile) {
      if (payload.model.params.audioFileLocal) {
        let generatedUUID = generateUUID();
        generatedUUID += ".m4a";
        const s3Response = await UploadImageToS3(fileData[0], generatedUUID, "resources");
        payload.model.params["originalContentUrl"] =
            "https://" + s3Response["cloudFrontDist"] + "/resources/" + generatedUUID;
      } else {
        payload.model.params["originalContentUrl"] = payload.model.params.tempAudioFile;
      }
    }
    delete payload.model.params.tempAudioFile;
    delete payload.model.params.editingSoundFile;
  }
  if (payload.model.dataType === "buttons") {
    if ("editingThumbnailImage" in payload.model.params && payload.model.params.editingThumbnailImage) {
      if (payload.model.params.editingThumbnailImageLocal) {
        let generatedUUID = generateUUID();
        const s3Response = await UploadImageToS3(payload.model.params.tempThumbnailUrl, generatedUUID, "resources");
        payload.model.params["thumbnailImageUrl"] =
            "https://" + s3Response["cloudFrontDist"] + "/resources/" + generatedUUID;
      } else {
        payload.model.params["thumbnailImageUrl"] = payload.model.params.tempThumbnailUrl;
      }
    }
    delete payload.model.params.tempThumbnailUrl;
    delete payload.model.params.editingThumbnailImageLocal;
    delete payload.model.params.editingThumbnailImage;
  }
  if (payload.model.dataType === "carousel") {
    for (var x = 0; x < 10; x++) {
      if (payload.model.params["editingThumbnailImage." + x]) {
        if (payload.model.params["thumbnailImageEditLocal." + x]) {
          let generatedUUID = generateUUID();
          const s3Response = await UploadImageToS3(
              payload.model.params["tempThumbnailFile." + x],
              generatedUUID,
              "resources"
          );
          payload.model.params["thumbnail." + x] =
              "https://" + s3Response["cloudFrontDist"] + "/resources/" + generatedUUID;
        } else {
          payload.model.params["thumbnail." + x] = payload.model.params["tempThumbnailUrl." + x];
        }
      }
    }
    //deleting unnecessary temp variables
    for (var y = 0; y < 10; y++) {
      delete payload.model.params["editingThumbnailImage." + y];
      delete payload.model.params["thumbnailImageEditLocal." + y];
      delete payload.model.params["tempThumbnailUrl." + y];
      delete payload.model.params["tempThumbnailFile." + y];
    }
  }
  return payload;
}

function transformActionIfNeed(scenarioMessages, payload) {
  const { model } = payload;
  const { params } = model || {};

  const shouldCreate = [];
  const shouldDelete = [];
  switch (model.dataType) {
    case "confirm":
      const { actionLeft, actionRight } = params;
      if (actionLeft.type === "postback" || actionRight.type === "postback") {
        if (actionLeft.type === "postback" && (!actionLeft.data || actionLeft.data === "")) {
          const uuid = generateUUID();
          shouldCreate.push(uuid);
          actionLeft.data = uuid;
        }
        if (actionRight.type === "postback" && (!actionRight.data || actionRight.data === "")) {
          const uuid = generateUUID();
          shouldCreate.push(uuid);
          actionRight.data = uuid;
        }
      } else {
        const deleteActionUuid = extractDeleteActionUuid(scenarioMessages, model, "confirm");
        if (deleteActionUuid) {
          shouldDelete.push(...deleteActionUuid);
        }
      }
      break;
    case "buttons":
      for (let i = 0; i < params.actionCount; i++) {
        const action = params[`actions.${i}`];
        if (action.type === "postback") {
          if (!action.data || action.data === "") {
            const uuid = generateUUID();
            shouldCreate.push(uuid);
            action.data = uuid;
          }
        } else {
          const deleteActionUuid = extractDeleteActionUuid(scenarioMessages, action, "other");
          if (deleteActionUuid) {
            shouldDelete.push(...deleteActionUuid);
          }
        }
      }
      break;
    case "carousel":
      for (let j = 0; j < params.columnCount; j++) {
        for (let i = 0; i < params.actionCount; i++) {
          const action = params[`action.${j}.${i}`];
          if (action.type === "postback") {
            if (!action.data || action.data === "") {
              const uuid = generateUUID();
              shouldCreate.push(uuid);
              action.data = uuid;
            }
          } else {
            const deleteActionUuid = extractDeleteActionUuid(scenarioMessages, action, "other");
            if (deleteActionUuid) {
              shouldDelete.push(...deleteActionUuid);
            }
          }
        }
      }
      break;
  }
  return { shouldCreate, shouldDelete };
}

function extractDeleteActionUuid(scenarioMessages, target, actionType) {
  const targetMessages = scenarioMessages.filter((message) => {
    if (message.dataType !== "__INITIAL__") {
      return false;
    }
    switch (actionType) {
      case "confirm":
        return message.dataId === target.actionLeft.data || message.dataId === target.actionRight.data;
      default:
        return message.dataId === target.data;
    }
  });
  return targetMessages.map((message) => message.dataId);
}

async function asyncSleep(timeout) {
  return new Promise((resolve) => setTimeout(() => resolve(), timeout));
}
async function retryableBatchWriteItem(putItems, deleteItems, maxRetry = 3) {
  let cnt = 0;
  for (; cnt < maxRetry; cnt++) {
    try {
      const resp = await BatchWriteItem(putItems, deleteItems);
      if (resp && resp.result && resp.result.toLowerCase && resp.result.toLowerCase() === "ok") {
        return true;
      }
    } catch (err) {
      console.error("retryableBatchWriteItem", "error:", err);
    }
    let sleepTimeout = Math.pow(2, maxRetry) * 1000;
    if (sleepTimeout > 8000) {
      sleepTimeout = 8000;
    }
    console.warn("retryableBatchWriteItem", `count:${cnt + 1}/${maxRetry + 1}`, `retry after ${sleepTimeout} sec.`);
    await asyncSleep(sleepTimeout);
  }
  console.error("retryableBatchWriteItem", `count:${cnt}/${maxRetry}`, "cant keep up!");
  return false;
}

function messageIdInRenderedMindmap(idOfMessage, mindMap) {
  let messageInMindmap = false;
  for(let gen = 0; gen < mindMap.length; gen++) {
    if (gen % 2 === 1) {
      for(const msg of mindMap[gen]) {
        if (msg.dataId === idOfMessage) {
          messageInMindmap = true;
          break;
        }
      }
      if (messageInMindmap) {
        break;
      }
    }
  }
  return messageInMindmap;
}

export default {
  [FETCH_ACTIVE_SCENARIO_DATA]: async ({ commit }) => {
    try {
      commit(SET_IS_FETCHING_SCENARIOS, true);
      commit(SET_FETCH_SCENARIOS_ERROR, null);

      const responseJson = await GetActiveScenarioData();
      var activeScenarioData = responseJson.item;

      commit(SET_ACTIVE_SCENARIO_DATA, activeScenarioData);
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIOS_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIOS, false);
    }
  },
  [FETCH_ALL_SCENARIOS]: async ({ commit }) => {
    try {
      commit(SET_IS_FETCHING_SCENARIOS, true);
      commit(SET_FETCH_SCENARIOS_ERROR, null);

      const responseJson = await GetAllScenarios();
      if (responseJson.result == "ERROR") {
        throw new Error(responseJson.error_message);
      }
      const responseJson2 = await GetActiveScenarioData();
      if (responseJson2.result == "ERROR") {
        throw new Error(responseJson2.error_message);
      }
      var allScenarios = responseJson.items;
      if (allScenarios) {
        allScenarios.splice(
            allScenarios.findIndex((item) => item.scenarioId === "settings"),
            1
        );
      }
      var activeScenarioData = responseJson2.item;
      commit(SET_SCENARIOS, allScenarios);
      commit(SET_ACTIVE_SCENARIO_DATA, activeScenarioData);
      commit(SET_ACTIVE_SCENARIO, activeScenarioData);
      if (allScenarios && allScenarios.length > 0) {
        commit(SET_SELECTED_SCENARIO, allScenarios[0].scenarioId);
      }
    } catch (err) {
      console.log(err)
      ERR_SKELETON(commit, SET_FETCH_SCENARIOS_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIOS, false);
    }
  },
  [FETCH_SCENARIOS_LIST]: async ({ commit }, params) => {
    try {
      commit(SET_IS_FETCHING_SCENARIOS, true);
      commit(SET_FETCH_SCENARIOS_ERROR, null);
      const responseJson = await GetListScenarios(params);

      commit(SET_LIST_SCENARIOS, responseJson);
    } catch (err) {
      console.log(err)
      ERR_SKELETON(commit, SET_FETCH_SCENARIOS_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIOS, false);
    }
  },
  [FETCH_SCENARIOS_SETTING]: async ({ commit }, params) => {
    try {
      const responseJson = await GetSettingScenarios();
      if (responseJson.item) {
        commit(SET_SETTING_SCENARIOS, responseJson.item);
        commit(SET_ACTIVE_SCENARIO, responseJson.item);
        commit(SET_ACTIVE_SCENARIO_DATA, responseJson.item);
      }
    } catch (err) {
      console.log(err)
      ERR_SKELETON(commit, SET_FETCH_SCENARIOS_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIOS, false);
    }
  },
  [FETCH_SCENARIO_DETAIL]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);
      const responseJson = await GetAllScenarioMessages(payload.scenarioId, payload.versionId);
      const responseJson2 = await GetScenarioDataByDataType(payload.scenarioId, payload.versionId, "textMapping");
      var textMapping = responseJson2.items && responseJson2.items.length > 0 ? responseJson2.items[0] : [];
      const responseJson3 = await GetScenarioDataByDataType(payload.scenarioId, payload.versionId, "talk");
      const responseJson4 = await GetScenarioDataByDataType(payload.scenarioId, payload.versionId, "userMessage");
      var userMessage = responseJson4.items && responseJson4.items.length > 0 ? responseJson4.items[0] : {};

      commit(SET_SCENARIO_MESSAGES, responseJson.items);
      commit(SET_SCENARIO_TEXTMAP, textMapping);
      commit(SET_SCENARIO_TALKS, responseJson3.items);
      commit(SET_USER_MESSAGES, userMessage);
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [FETCH_SCENARIO_TALK]: async ({ commit, state }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      const dataTableOption = state.talkDataTableOptions;
      const searchKeyword = state.searchTalkKeyword;
      const searchTalkAttribute = state.searchTalkAttribute;
      const searchStartDate = state.searchTalkStartDate;
      const searchEndDate = state.searchTalkEndDate;
      let param = {
        perPage: dataTableOption.itemsPerPage,
        page: dataTableOption.page,
        sortBy: dataTableOption.sortBy[0],
        sortType: dataTableOption.sortDesc[0] ? 'desc' : 'asc',
        'filters[scenario_id][equal]': payload.versionId,
      };
      let obj = {}
      if (searchTalkAttribute && searchTalkAttribute != '') {
        if(searchTalkAttribute !== 'updated_at') {
          obj['filters['+searchTalkAttribute+'][like]'] =  searchKeyword;
        } else {
          if (searchStartDate) {
            obj['filters[updated_at][greater_or_equal]'] =  searchStartDate + ' 00:00:00';
          }
          if (searchEndDate) {
            obj['filters[updated_at][less_or_equal]'] =  searchEndDate + ' 23:59:59';
          }
        }
      }
      let params = {
        ...param,
        ...obj,
      }
      const responseJson = await GetScenarioTalkList(params);
      const responseJson2 = await GetScenarioTextMapping(payload.versionId);
      const textMapping = responseJson2.items && responseJson2.items.length > 0 ? responseJson2.items[0] : [];
      commit(SET_SCENARIOS_TALK_PAGINATE, responseJson);
      commit(SET_SCENARIO_TALKS, responseJson.data);
      commit(SET_TOTAL_TALK, responseJson.meta.total);
      commit(SET_SCENARIO_TEXTMAP, textMapping);
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR,  new String('シナリオが見つかりません。'));
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [CREATE_SCENARIO_TALK]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      await SaveScenarioTalk(payload);
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [CREATE_SIMPLE_SPECIAL_SCENARIO]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      const {scenarioId, versionId} = payload
      await CreateSpecialScenarioTalk(payload.scenarioId, payload.versionId, payload.talkName);
      commit(SET_TALK_DATATABLE_OPTION, {
        groupBy: [],
        groupDesc: [],
        itemsPerPage: 10,
        multiSort:false,
        mustSort:false,
        page: 1,
        sortBy: ["updated_at"],
        sortDesc: [true],
      });
      commit(SET_TALK_SEARCH_ATTRIBUTE, null);
      commit(SET_TALK_SEARCH_VALUE, null);
      commit(SET_TALK_SEARCH_STARTDATE, null);
      commit(SET_TALK_SEARCH_ENDDATE, null);
      dispatch(FETCH_SCENARIO_TALK, {
        scenarioId,
        versionId,
      });
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [DELETE_SCENARIO_MESSAGE]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      await DeleteScenarioDetailMessage(payload.id, payload.scenarioId + "#" + payload.versionId);

      const responseJson2 = await GetAllScenarioMessages(payload.scenarioId, payload.versionId);

      commit(SET_SCENARIO_MESSAGES, responseJson2.items);
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [CHANGE_ACTIVE_SCENARIO]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIOS, true);
      commit(SET_FETCH_SCENARIOS_ERROR, null);
      const responseJson = await SetActiveScenarioData(
          payload.id,
          payload.versionName,
          payload.activeScenarioData,
          payload.environment
      );
      if (responseJson.item) {
        commit(SET_SETTING_SCENARIOS, responseJson.item);
        commit(SET_ACTIVE_SCENARIO, responseJson.item);
      }

    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIOS_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIOS, false);
    }
  },
  [UPLOAD_IMPORT_FILE]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_IMPORTING_SCENARIO_DATA, true);
      commit(IMPORT_FINISH_SUCCESS, false);
      commit(SET_IMPORTING_SCENARIO_DATA_ERROR, null);
      commit(SET_IMPORTING_SCENARIO_DATA_WARNING, null);

      const response = await UploadFile(payload.fileData, payload.scenarioVersion, payload.setAsActive);

      if (response.result === "SUCCESS" && payload.setAsActive) {
        const setActiveResponse = await SetActiveScenarioData(
            payload.scenarioName,
            payload.scenarioVersion,
            payload.activeScenario,
            null
        );
        var selectedScenarioPayload = {
          environment: "both",
          value: payload.scenarioVersion,
        };
        commit(SET_SELECTED_EDIT_SCENARIO, selectedScenarioPayload);
        if (setActiveResponse.result === "ERROR") {
          throw new Error(setActiveResponse.error_message);
        }
      }
      if (response.warning && response.warning.length > 0) {
        var warnings = "これらの警告でインポートは正常に終了しました：";
        response.warning.forEach((element) => {
          warnings += element + ",";
        });
        warnings = warnings.slice(0, -1);
        commit(SET_IMPORTING_SCENARIO_DATA_WARNING, warnings);
      }

      const responseJson = await GetAllScenarios();
      var allScenarios = responseJson.items;
      allScenarios.splice(
          allScenarios.findIndex((item) => item.scenarioId === "settings"),
          1
      );
      const responseJson2 = await GetActiveScenarioData();
      var activeScenarioData = responseJson2.item;

      commit(SET_SCENARIOS, allScenarios);
      commit(SET_ACTIVE_SCENARIO_DATA, activeScenarioData);

      commit(
          SET_ACTIVE_SCENARIO,
          allScenarios.find((x) => x.scenarioId === activeScenarioData.activeScenarioId)
      );
      commit(SET_SELECTED_SCENARIO, allScenarios.find((x) => x.scenarioId === payload.scenarioName).scenarioId);

      commit(IMPORT_FINISH_SUCCESS, true);
    } catch (err) {
      if (err instanceof ProgressEvent) {
        commit(
            SET_IMPORTING_SCENARIO_DATA_ERROR,
            new String(
                "要求されたファイルを読み取ることができませんでした。" +
                "通常、ファイルへの参照が取得された後に発生した権限の問題が原因です。ファイルの選択消しても一回選んでください。"
            )
        );
      } else {
        ERR_SKELETON(commit, SET_IMPORTING_SCENARIO_DATA_ERROR, err);
      }
    } finally {
      commit(SET_IS_IMPORTING_SCENARIO_DATA, false);
    }
  },
  [UPLOAD_CSV_FILE]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_IMPORTING_SCENARIO_DATA_ERROR, null);
      const trashid = payload.versionId;
      const {scenarioId, versionId} = payload;
      await UploadCSV(payload.fileData, trashid);
      if (payload.fetchData) {
        commit(SET_TALK_DATATABLE_OPTION, {
          groupBy: [],
          groupDesc: [],
          itemsPerPage: 10,
          multiSort:false,
          mustSort:false,
          page: 1,
          sortBy: ["updated_at"],
          sortDesc: [true],
        });
        commit(SET_TALK_SEARCH_ATTRIBUTE, null);
        commit(SET_TALK_SEARCH_VALUE, null);
        commit(SET_TALK_SEARCH_STARTDATE, null);
        commit(SET_TALK_SEARCH_ENDDATE, null);
        dispatch(FETCH_SCENARIO_TALK, {
          scenarioId,
          versionId,
        });
      } else {
        dispatch(FETCH_SCENARIO_DETAIL, {
          scenarioId,
          versionId,
        });
      }
    } catch (err) {
        commit(SET_IMPORTING_SCENARIO_DATA_ERROR, new String("CSVアップロードにエラーが発生しました。"));
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [DOWNLOAD_CSV_FILE]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_EXPORTING_SCENARIO_DATA, true);
      commit(SET_EXPORTING_SCENARIO_DATA_ERROR, null);
      commit(SET_EXPORTING_SCENARIO_DATA_WARNING, null);

      const response = await DownloadCSVFile(payload.scenario);

      if (response.result === "SUCCESS") {
        var filename = response.csv_url.replace(/.*\//, "");
        var url = response.csv_url.replace(filename, "");
        const link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("download", filename);
        link.href = response.csv_url;
        link.click();
      }

      if (response.warning && response.warning.length > 0) {
        var warnings = "これらの警告でエクスポートは正常に終了しました：";
        response.warning.forEach((element) => {
          warnings += element + ",";
        });
        warnings = warnings.slice(0, -1);
        commit(SET_EXPORTING_SCENARIO_DATA_WARNING, warnings);
      }

      if (response.result === "ERROR") {
        var exception = "エクスポート中エラー発生しました：";
        if (typeof response.exception == "string") {
          exception += response.exception;
        } else {
          response.exception.forEach((element) => {
            exception += element + ",";
          });
          exception = exception.slice(0, -1);
        }
        commit(SET_EXPORTING_SCENARIO_DATA_ERROR, exception);
      }

      commit(EXPORT_FINISH_SUCCESS, true);
    } catch (err) {
      ERR_SKELETON(commit, SET_EXPORTING_SCENARIO_DATA_ERROR, err);
    } finally {
      commit(SET_IS_EXPORTING_SCENARIO_DATA, false);
    }
  },
  [DOWNLOAD_EXPORT_FILE]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_EXPORTING_SCENARIO_DATA, true);
      commit(SET_EXPORTING_SCENARIO_DATA_ERROR, null);
      commit(SET_EXPORTING_SCENARIO_DATA_WARNING, null);

      const response = await DownloadFile(payload.scenario, payload.environment);
      if (response.result === "SUCCESS") {
        var filename = response.url.replace(/.*\//, "");
        var url = response.url.replace(filename, "");
        const link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("download", filename);
        link.href = response.url;
        link.click();
      }

      if (response.warning && response.warning.length > 0) {
        var warnings = "これらの警告でエクスポートは正常に終了しました：";
        response.warning.forEach((element) => {
          warnings += element + ",";
        });
        warnings = warnings.slice(0, -1);
        commit(SET_EXPORTING_SCENARIO_DATA_WARNING, warnings);
      }

      if (response.result === "ERROR") {
        var exception = "エクスポートながらエラー発生しました：";
        if (typeof response.exception == "string") {
          exception += response.exception;
        } else {
          response.exception.forEach((element) => {
            exception += element + ",";
          });
          exception = exception.slice(0, -1);
        }
        commit(SET_EXPORTING_SCENARIO_DATA_ERROR, exception);
      }

      commit(EXPORT_FINISH_SUCCESS, true);
    } catch (err) {
      ERR_SKELETON(commit, SET_EXPORTING_SCENARIO_DATA_ERROR, err);
    } finally {
      commit(SET_IS_EXPORTING_SCENARIO_DATA, false);
    }
  },
  [UPDATE_TEXT_MAPPING]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      const response = await UpdateTextMapping(payload.dataId, payload.userInput, payload.textMappingData, payload);

      commit(SET_SCENARIO_TEXTMAP, response);

      const scenario = payload.textMappingData.scenario;

      const scenarioParams = scenario.split("#");
      const scenarioId = scenarioParams[0];
      const versionId = scenarioParams[1];
      const { talkName } = payload;
      dispatch(UPDATE_TALK_UPDATED_TIME, {
        scenario,
        scenarioId,
        versionId,
        talkName,
      });
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [UPDATE_SCENARIO_DATA]: async ({ commit, dispatch, state }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      payload = await uploadAndReplaceMedia(payload);
      const { shouldCreate, shouldDelete } = transformActionIfNeed(state.scenarioMessages, payload);
      const newActions = shouldCreate.map((uuid) => ({
        dataId: uuid,
        dataType: "__INITIAL__",
        nameLBD: "",
        newMessage: true,
        params: {
          text: "",
        },
        scenario: payload.model.scenario,
        talk: payload.model.talk,
      }));
      const removeActions = shouldDelete.map((uuid) => ({
        dataId: uuid,
        scenario: payload.model.scenario,
      }));
      console.log("UPDATE_SCENARIO_DATA:", payload, newActions);

      const responseUpdateScenarioDataMessage = await UpdateScenarioDataMessage(payload.model);
      if (newActions.length > 0) {
        const responseRetryableBatchWriteItem = await retryableBatchWriteItem(newActions, []);
        console.log("newActions", "responseRetryableBatchWriteItem:", responseRetryableBatchWriteItem);
      }
      if (removeActions.length > 0) {
        const responseRetryableBatchWriteItem = await retryableBatchWriteItem([], removeActions);
        console.log("removeActions", "responseRetryableBatchWriteItem:", responseRetryableBatchWriteItem);
      }
      const responseGetAllScenarioMessages = await GetAllScenarioMessages(payload.scenario.scenarioId, payload.scenario.versionId);
      console.log("responseUpdateScenarioDataMessage:", responseUpdateScenarioDataMessage);
      console.log("responseGetAllScenarioMessages:", responseGetAllScenarioMessages);
      commit(SET_SCENARIO_MESSAGES, responseGetAllScenarioMessages.items);
      dispatch(UPDATE_TALK_UPDATED_TIME, {
        scenario: payload.model.scenario,
        scenarioId: payload.scenario.scenarioId,
        versionId: payload.scenario.versionId,
        talkName: payload.model.talk,
      });
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [DELETE_SCENARIO_VERSION]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_DELETING_SCENARIO_VERSION, true);
      commit(SET_DELETING_SCENARIO_VERSION_ERROR, null);
      const deleteAction = await DeleteScenarios(payload);
      if (deleteAction.result === "ERROR") {
        throw new Error(deleteAction.error_message);
      }
      commit(DELETE_FINISH_SUCCESS, true);
    } catch (err) {
      ERR_SKELETON(commit, SET_DELETING_SCENARIO_VERSION_ERROR, err);
    } finally {
      commit(SET_IS_DELETING_SCENARIO_VERSION, false);
    }
  },
  [ADD_COMPOSITE_MESSAGE]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      const scenarioParams = payload.scenario.split("#");
      const scenarioId = scenarioParams[0];
      const versionId = scenarioParams[1];

      const response = await AddCompositeMessage(payload);
      const response2 = await GetAllScenarioMessages(scenarioId, versionId);

      commit(SET_SCENARIO_MESSAGES, response2.items);
      dispatch(UPDATE_TALK_UPDATED_TIME, {
        scenario: payload.scenario,
        scenarioId,
        versionId,
        talkName: payload.talkName,
      });
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [SET_DEFAULT_RICH_MENU]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_FETCHING_RICHMENU_INFO, true);
      commit(SET_ERROR_SETTING_RICHMENU, null);

      const response = await SetDefaultScenarioRichMenu(payload.richMenu.richMenuId, payload.environment);
      if (response.result == "ERROR") {
        commit(
            SET_ERROR_SETTING_RICHMENU,
            "リッチメニューを表示されたながらエラーを発生しました。LINEチャンネル情報かリッチメニューの設定は正しくない。"
        );
      } else {
        if (payload.environment == "production") {
          commit(SET_ACTIVE_PRODUCTION_RICHMENU, payload.richMenu);
        } else {
          commit(SET_ACTIVE_SANDBOX_RICHMENU, payload.richMenu);
        }
      }
    } catch (err) {
      commit(
          SET_ERROR_SETTING_RICHMENU,
          "リッチメニューを表示されたながらエラーを発生しました。LINEチャンネル情報かリッチメニューの設定は正しくない。"
      );
    } finally {
      commit(SET_IS_FETCHING_RICHMENU_INFO, false);
    }
  },
  [DELETE_TALK]: async ({ commit, dispatch }, payload) => {
    let result;
    try {
      commit(DELETE_SCENARIO_TALK_SUCCESS, null);
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      const { scenarioId, versionId } = payload;

       await deleteTalkByIds(payload);

      commit(DELETE_SCENARIO_TALK_SUCCESS, true);
      result = true;
      commit(SET_TALK_DATATABLE_OPTION, {
        groupBy: [],
        groupDesc: [],
        itemsPerPage: 10,
        multiSort:false,
        mustSort:false,
        page: 1,
        sortBy: ["updated_at"],
        sortDesc: [true],
      });
      commit(SET_TALK_SEARCH_ATTRIBUTE, null);
      commit(SET_TALK_SEARCH_VALUE, null);
      commit(SET_TALK_SEARCH_STARTDATE, null);
      commit(SET_TALK_SEARCH_ENDDATE, null);
      dispatch(FETCH_SCENARIO_TALK, {
        scenarioId,
        versionId,
      });
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
      result = false;
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
    return result;
  },
  [DELETE_SPECIAL_SCENARIO]: async ({ commit }, payload) => {
    try {
      if (payload["specialTalkName"] == "ゴミ分別") {
        commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
        commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);
        await DeleteTrashScenario(payload.scenarioId, payload.versionId);
      } else {
        commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
        commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

        const responseJsonScenario = await GetAllUnfilteredScenarioMessages(payload.scenarioId, payload.versionId);
        var putItems = [];
        var deleteItems = [];
        for (const item of responseJsonScenario.items) {
          if (
              ("params" in item &&
                  "specialScenarioTalk" in item["params"] &&
                  item["params"]["specialScenarioTalk"] == payload.specialTalkName) ||
              (item["dataType"] == "talk" && item["dataId"] == payload.talkId)
          ) {
            deleteItems.push({
              scenario: item.scenario,
              dataId: item.dataId,
            });
          }
        }
        await BatchWriteItem(putItems, deleteItems);
      }
      const responseJson2 = await GetAllScenarioMessages(payload.scenarioId, payload.versionId);
      const responseJson3 = await GetScenarioDataByDataType(payload.scenarioId, payload.versionId, "talk");

      commit(SET_SCENARIO_MESSAGES, responseJson2.items);
      commit(SET_SCENARIO_TALKS, responseJson3.items);
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [SAVE_ACTIVE_SCENARIO]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_SAVING_ACTIVE_SCENARIO, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      const response = await SetActiveDamageReportScenarioData(payload);
      commit(SET_ACTIVE_SCENARIO_DATA, response.item);
      commit(SET_ACTIVE_SCENARIO, response.item);
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_SAVING_ACTIVE_SCENARIO, false);
    }
  },
  [SAVE_BOSAI_SETTINGS_ITEM]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_SAVING_ACTIVE_SCENARIO, true);
      commit(SET_BOSAI_SETTINGS_SUCCESS, false);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);

      await SetScenarioData(payload);

      if (payload.scenarioId == "settings") {
        commit(SET_ACTIVE_SCENARIO_DATA, payload);
      } else {
        commit(SET_ACTIVE_SCENARIO, payload);
      }
      commit(SET_BOSAI_SETTINGS_SUCCESS, true);
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_SAVING_ACTIVE_SCENARIO, false);
    }
  },
  [FETCH_SCENARIO_DETAIL_TALK]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_FETCH_SCENARIO_DETAIL_ERROR, null);
      const responseJson = await GetScenarioDataByDataType(payload.scenarioId, payload.versionId, "talk");
      const responseJson2 = await GetAllScenarioMessages(payload.scenarioId, payload.versionId);
      commit(SET_SCENARIO_TALKS, responseJson.items);
      commit(SET_SCENARIO_MESSAGES, responseJson2.items);
    } catch (err) {
      ERR_SKELETON(commit, SET_FETCH_SCENARIO_DETAIL_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [FETCH_SCENARIO_SPECIFIC_TALKS]: async ({ commit }, payload) => {
    try {
      const talkResponse = await GetScenarioDataByDataType(payload.scenarioId, payload.versionId, "talk");
      if (talkResponse.result === "OK") {
        return {
          result: "OK",
          talks: talkResponse.items,
        };
      } else {
        return {
          result: "ERROR",
          error_message: talkResponse.error_message,
        };
      }
    } catch (err) {
      return {
        result: "ERROR",
        error_message: err.message,
      };
    }
  },
  [UPDATE_SCENARIO_TALK_NAME]: async ({ commit, dispatch }, payload) => {
    commit(SET_IS_CHANGING_TALK_NAME, true);
    commit(CHANGING_TALK_NAME_ERROR, null);
    try {
      let response = await UpdateScenarioTalkName(payload.scenarioId, payload.versionId, payload.talkObject.dataId, payload.newTalkName);
      if (response.result === "ERROR") {
        commit(CHANGING_TALK_NAME_ERROR, response.error_message);
        return false;
      } else {
        commit(UPDATE_DATA_FOR_SCENARIO_TALK_NAME_CHANGE, payload);
        return true;
      }
    } catch(err) {
      commit(CHANGING_TALK_NAME_ERROR, err.message);
      return false;
    } finally {
      commit(SET_IS_CHANGING_TALK_NAME, false);
    }
  },
  [UPDATE_DISPLAY_SCENARIO_VERSION_NAME]: async ({ commit, dispatch }, payload) => {
    commit(SET_IS_CHANGING_DISPLAY_VERSION_NAME, true);
    commit(CHANGING_VERSION_NAME_ERROR, null);
    try {
      let response = await UpdateVersionDisplayName(payload.scenarioId, payload.versionId, payload.originalVersion, payload.newDisplayVersionName);
      if (response.result === "ERROR") {
        commit(CHANGING_VERSION_NAME_ERROR, response.error_message);
        return false;
      } else {
        commit(UPDATE_CHANGED_SCENARIO_VERSION_NAME, payload);
        return true;
      }
    } catch(err) {
      commit(CHANGING_VERSION_NAME_ERROR, err.message);
      return false;
    } finally {
      commit(SET_IS_CHANGING_DISPLAY_VERSION_NAME, false);
    }
  },
  [CREATE_RICH_MENU]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_CREATING_RICH_MENU, true);
      commit(SET_IS_CREATING_RICH_MENU_ERROR, null);
      const response = await CreateRichMenu(payload.richMenu);
      if (response.result == "ERROR") {
        commit(SET_IS_CREATING_RICH_MENU_ERROR, response.exception);
      } else {
        let production_id = response.productionRichMenuId;
        let sandbox_id = response.sandboxRichMenuId;
        if (payload.richMenuImage) {
          //upload image for prod
          if (production_id) {
            const s3response = await UploadImageToS3(payload.richMenuImage, production_id, "resources/richmenus");
            if (s3response.status == 204) {
              const setimg_pr_resp = await SetRichMenuImage(
                  production_id,
                  "production",
                  "resources/richmenus/" + production_id
              );
              if (setimg_pr_resp.result == "ERROR") {
                commit(SET_IS_CREATING_RICH_MENU_ERROR, "リッチメニュー画像設定に失敗しました！");
              }
            } else {
              commit(SET_IS_CREATING_RICH_MENU_ERROR, "リッチメニュー画像アップロードに失敗しました！");
            }
          }
          //upload image for sandbox
          if (response.sandboxRichMenuId) {
            const s3responseSand = await UploadImageToS3(
                payload.richMenuImage,
                response.sandboxRichMenuId,
                "resources/richmenus"
            );
            if (s3responseSand.status == 204) {
              const setimg_pr_resp_sand = await SetRichMenuImage(
                  response.sandboxRichMenuId,
                  "sandbox",
                  "resources/richmenus/" + response.sandboxRichMenuId
              );
              if (setimg_pr_resp_sand.result == "ERROR") {
                commit(SET_IS_CREATING_RICH_MENU_ERROR, "リッチメニュー画像設定に失敗しました！");
              }
            } else {
              commit(SET_IS_CREATING_RICH_MENU_ERROR, "リッチメニュー画像アップロードに失敗しました！");
            }
          }
        } else {
          let setimg_pr_resp_sand;
          const setimg_pr_resp = await SetRichMenuImage(
              production_id,
              "production",
              "resources/richmenus/" + payload.richMenuId
          );
          if (response.sandboxRichMenuId) {
            setimg_pr_resp_sand = await SetRichMenuImage(
                response.sandboxRichMenuId,
                "sandbox",
                "resources/richmenus/" + payload.richMenuId
            );
          }
          if (setimg_pr_resp.result == "ERROR" || (setimg_pr_resp_sand && setimg_pr_resp_sand.result == "ERROR")) {
            commit(SET_IS_CREATING_RICH_MENU_ERROR, "リッチメニュー画像設定に失敗しました！");
          }
        }

        if (response.productionRichMenuId) {
          const setimg_pr_resp = await CreateRichMenuAlias(
              response.productionRichMenuId,
              payload.environment == "production" ? payload.richMenuId : payload.oldRichMenuId,
              null,
              "production",
          );
          if (response.sandboxRichMenuId) {
            const setimg_pr_resp_sand = await CreateRichMenuAlias(
                response.sandboxRichMenuId,
                payload.environment == "sandbox" ? payload.richMenuId : payload.oldRichMenuId,
                setimg_pr_resp.richMenuAliasId,
                "sandbox",
            );
          }
        }

        //flag check for editing rich menu and its 3 related flags
        if (payload.editable) {
          let deleteResponse = await DeleteRichMenu(payload.richMenuId, payload.environment);
          if (payload.oldRichMenuId != null) {
            if (payload.environment == "production") {
              if (!deleteResponse.sandbox_equals_prod) {
                await DeleteRichMenu(payload.oldRichMenuId, "sandbox");
              }
              if (payload.oppositeEnvironmentBosaiFlag) {
                const menuToSet = await GetRichMenuById(response.sandboxRichMenuId, "sandbox");
                await settingScenarioData(commit, BOSAI_RICH_MENU_PARAM, "sandbox", JSON.parse(menuToSet.item));
              } else if (payload.oppositeEnvironmentNormalFlag) {
                const menuToSet = await GetRichMenuById(response.sandboxRichMenuId, "sandbox");
                await settingScenarioData(commit, NORMAL_RICH_MENU_PARAM, "sandbox", JSON.parse(menuToSet.item));
              }
              if (payload.oppositeEnvironmentActiveFlag) {
                const menuToSet = await GetRichMenuById(response.sandboxRichMenuId, "sandbox");
                dispatch("SET_ACTIVE_RICH_MENU", {
                  richMenu: JSON.parse(menuToSet.item),
                  environment: "sandbox",
                  runLoad: false,
                });
              }
            } else {
              if (!deleteResponse.sandbox_equals_prod) {
                await DeleteRichMenu(payload.oldRichMenuId, "production");
              }
              if (payload.oppositeEnvironmentBosaiFlag) {
                const menuToSet = await GetRichMenuById(response.productionRichMenuId, "production");
                await settingScenarioData(commit, BOSAI_RICH_MENU_PARAM, "production", JSON.parse(menuToSet.item));
              } else if (payload.oppositeEnvironmentNormalFlag) {
                const menuToSet = await GetRichMenuById(response.productionRichMenuId, "production");
                await settingScenarioData(commit, NORMAL_RICH_MENU_PARAM, "production", JSON.parse(menuToSet.item));
              }
              if (payload.oppositeEnvironmentActiveFlag) {
                const menuToSet = await GetRichMenuById(response.productionRichMenuId, "production");
                dispatch("SET_ACTIVE_RICH_MENU", {
                  richMenu: JSON.parse(menuToSet.item),
                  environment: "production",
                  runLoad: false,
                });
              }
            }
          }
        }
      }
      //flag check for new rich menu's 3 related flags
      if (payload.bosaiFlag) {
        if (payload.environment == "production") {
          const menuToSet = await GetRichMenuById(response.productionRichMenuId, "production");
          await settingScenarioData(commit, BOSAI_RICH_MENU_PARAM, payload.environment, JSON.parse(menuToSet.item));
        } else {
          const menuToSet = await GetRichMenuById(response.sandboxRichMenuId, "sandbox");
          await settingScenarioData(commit, BOSAI_RICH_MENU_PARAM, payload.environment, JSON.parse(menuToSet.item));
        }
      }
      if (payload.normalFlag) {
        if (payload.environment == "production") {
          const menuToSet = await GetRichMenuById(response.productionRichMenuId, "production");
          await settingScenarioData(commit, NORMAL_RICH_MENU_PARAM, payload.environment, JSON.parse(menuToSet.item));
        } else {
          const menuToSet = await GetRichMenuById(response.sandboxRichMenuId, "sandbox");
          await settingScenarioData(commit, NORMAL_RICH_MENU_PARAM, payload.environment, JSON.parse(menuToSet.item));
        }
      }
      if (payload.activeFlag) {
        if (payload.environment == "production") {
          const menuToSet = await GetRichMenuById(response.productionRichMenuId, "production");
          dispatch("SET_ACTIVE_RICH_MENU", {
            richMenu: JSON.parse(menuToSet.item),
            environment: payload.environment,
            runLoad: false,
          });
          // SET_ACTIVE_RICH_MENU(JSON.parse(menuToSet.item), payload.environment);
        } else {
          const menuToSet = await GetRichMenuById(response.sandboxRichMenuId, "sandbox");
          dispatch("SET_ACTIVE_RICH_MENU", {
            richMenu: JSON.parse(menuToSet.item),
            environment: payload.environment,
            runLoad: false,
          });
          // SET_ACTIVE_RICH_MENU(JSON.parse(menuToSet.item), payload.environment);
        }
      }
      //generating response for frontend (to be generated using dispatch in future)
      const allMenusResponse = await FetchAllRichMenus();
      let ProdRichMenusToSet = [];
      let SandRichMenusToSet = [];
      if (allMenusResponse.result == "ERROR") {
        commit(SET_ERROR_FETCHING_ALL_RICHMENUS, allMenusResponse.exception);
      } else {
        if (allMenusResponse.sandbox_equals_prod) {
          let RichMenus = [];
          let RawProdMenus = allMenusResponse.production_menus;
          for (const elem in RawProdMenus) {
            let prodMenu = JSON.parse(RawProdMenus[elem]);
            if (prodMenu.richMenuId == response.productionRichMenuId) {
              await verifyOrDownloadRichMenuImage(prodMenu.richMenuId, "production");
            }
            RichMenus.push(prodMenu);
          }
          ProdRichMenusToSet = RichMenus;
          SandRichMenusToSet = RichMenus;
        } else {
          let ProdRichMenus = [];
          let RawProdMenus = allMenusResponse.production_menus;
          for (const elem in RawProdMenus) {
            let prodMenu = JSON.parse(RawProdMenus[elem]);
            if (prodMenu.richMenuId == response.productionRichMenuId) {
              await verifyOrDownloadRichMenuImage(prodMenu.richMenuId, "production");
            }
            ProdRichMenus.push(prodMenu);
          }
          ProdRichMenusToSet = ProdRichMenus;

          let SandRichMenus = [];
          let RawSandMenus = allMenusResponse.sandbox_menus;
          for (const elem in RawSandMenus) {
            let sandMenu = JSON.parse(RawSandMenus[elem]);
            if (sandMenu.richMenuId == response.sandboxRichMenuId) {
              await verifyOrDownloadRichMenuImage(sandMenu.richMenuId, "sandbox");
            }
            SandRichMenus.push(sandMenu);
          }
          SandRichMenusToSet = SandRichMenus;
        }
        commit(SET_PRODUCTION_RICHMENUS, ProdRichMenusToSet);
        commit(SET_SANDBOX_RICHMENUS, SandRichMenusToSet);
      }

      return response;
    } catch (error) {
      ERR_SKELETON(commit, SET_IS_CREATING_RICH_MENU_ERROR, error);
    } finally {
      commit(SET_IS_CREATING_RICH_MENU, false);
    }
  },
  [COPY_RICH_MENU]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_CREATING_RICH_MENU, true);
      commit(SET_IS_CREATING_RICH_MENU_ERROR, null);

      const response = await CreateRichMenu(payload.richMenuToCopy, payload.environmentToCreate);

      if (response.result == "ERROR") {
        commit(SET_IS_CREATING_RICH_MENU_ERROR, response.exception);
      } else {
        const allMenusResponse = await FetchAllRichMenus();
        let ProdRichMenusToSet = [];
        let SandRichMenusToSet = [];
        if (allMenusResponse.result == "ERROR") {
          commit(SET_ERROR_FETCHING_ALL_RICHMENUS, allMenusResponse.exception);
        } else {
          if (allMenusResponse.sandbox_equals_prod) {
            let RichMenus = [];
            let RawProdMenus = allMenusResponse.production_menus;
            for (const elem in RawProdMenus) {
              let prodMenu = JSON.parse(RawProdMenus[elem]);
              RichMenus.push(prodMenu);
            }
            ProdRichMenusToSet = RichMenus;
            SandRichMenusToSet = RichMenus;
          } else {
            let ProdRichMenus = [];
            let RawProdMenus = allMenusResponse.production_menus;
            for (const elem in RawProdMenus) {
              let prodMenu = JSON.parse(RawProdMenus[elem]);
              ProdRichMenus.push(prodMenu);
            }
            ProdRichMenusToSet = ProdRichMenus;

            let SandRichMenus = [];
            let RawSandMenus = allMenusResponse.sandbox_menus;
            for (const elem in RawSandMenus) {
              let sandMenu = JSON.parse(RawSandMenus[elem]);
              SandRichMenus.push(sandMenu);
            }
            SandRichMenusToSet = SandRichMenus;
          }
        }
        let imageCopyPayload = {
          newRichMenuEnv: payload.environmentToCreate,
          oldRichMenuEnv: payload.environmentToCreate == "production" ? "sandbox" : "production",
          newRichMenuId:
              payload.environmentToCreate == "production" ? response.productionRichMenuId : response.sandboxRichMenuId,
          oldRichMenuId: payload.richMenuToCopy.richMenuId,
        };

        const imageResponse = await CopyRichMenuImage(imageCopyPayload);

        if (imageResponse.result == "ERROR") {
          ERR_SKELETON(commit, SET_IS_CREATING_RICH_MENU_ERROR, imageResponse.exception);
        } else {
          await verifyOrDownloadRichMenuImage(imageCopyPayload.newRichMenuId, imageCopyPayload.newRichMenuEnv);
          commit(SET_PRODUCTION_RICHMENUS, ProdRichMenusToSet);
          commit(SET_SANDBOX_RICHMENUS, SandRichMenusToSet);
        }
      }
    } catch (error) {
      ERR_SKELETON(commit, SET_IS_CREATING_RICH_MENU_ERROR, error);
    } finally {
      commit(SET_IS_CREATING_RICH_MENU, false);
    }
  },
  [FETCH_ALL_RICHMENUS]: async ({ commit }) => {
    try {
      commit(SET_IS_FETCHING_ALL_RICHMENUS, true);
      commit(SET_ERROR_FETCHING_ALL_RICHMENUS, null);

      const response = await FetchAllRichMenus();
      if (response.result == "ERROR") {
        commit(SET_ERROR_FETCHING_ALL_RICHMENUS, response.exception);
      } else if (response.result == "SUCCESS") {
        if (response.sandbox_equals_prod) {
          let RichMenus = [];
          let RawProdMenus = response.production_menus;
          for (const elem in RawProdMenus) {
            let prodMenu = JSON.parse(RawProdMenus[elem]);
            await verifyOrDownloadRichMenuImage(prodMenu.richMenuId, "production");
            RichMenus.push(prodMenu);
          }
          commit(SET_PRODUCTION_RICHMENUS, RichMenus);
          commit(SET_SANDBOX_RICHMENUS, RichMenus);
          return RichMenus
        } else {
          let ProdRichMenus = [];
          let RawProdMenus = response.production_menus;
          for (const elem in RawProdMenus) {
            let prodMenu = JSON.parse(RawProdMenus[elem]);
            await verifyOrDownloadRichMenuImage(prodMenu.richMenuId, "production");
            ProdRichMenus.push(prodMenu);
          }
          commit(SET_PRODUCTION_RICHMENUS, ProdRichMenus);

          let SandRichMenus = [];
          let RawSandMenus = response.sandbox_menus;
          for (const elem in RawSandMenus) {
            let sandMenu = JSON.parse(RawSandMenus[elem]);
            await verifyOrDownloadRichMenuImage(sandMenu.richMenuId, "sandbox");
            SandRichMenus.push(sandMenu);
          }
          commit(SET_SANDBOX_RICHMENUS, SandRichMenus);
          return ProdRichMenus
        }
      }
    } catch (error) {
      ERR_SKELETON(commit, SET_ERROR_FETCHING_ALL_RICHMENUS, error);
    } finally {
      commit(SET_IS_FETCHING_ALL_RICHMENUS, false);
    }
  },
  [DELETE_RICH_MENU]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_FETCHING_ALL_RICHMENUS, true);
      const response = await DeleteRichMenu(payload.richMenuId, payload.environment);
      if (response.result == "OK") {
        if (response.sandbox_equals_prod === true) {
          commit(REMOVE_FROM_PRODUCTION_RICHMENUS, payload.richMenuId);
          commit(REMOVE_FROM_SANDBOX_RICHMENUS, payload.richMenuId);
        } else if (payload.environment == "production") {
          commit(REMOVE_FROM_PRODUCTION_RICHMENUS, payload.richMenuId);
        } else {
          commit(REMOVE_FROM_SANDBOX_RICHMENUS, payload.richMenuId);
        }
      } else {
        commit(SET_ERROR_DELETING_RICH_MENU, response.exception);
      }
      return response;
    } catch (error) {
      ERR_SKELETON(commit, SET_ERROR_DELETING_RICH_MENU, error);
    } finally {
      commit(SET_IS_FETCHING_ALL_RICHMENUS, false);
    }
  },
  [FETCH_ALL_RICHMENUS_ALIAS_LIST]: async ({ commit } , params) => {
    try {
      commit(SET_IS_FETCHING_ALL_RICHMENUS, true);
      commit(SET_ERROR_FETCHING_ALL_RICHMENUS, null);

      const response = await FetchAllRichMenusAliasList(params.richMenuId,params.environment);
      if (response.result == "ERROR") {
        commit(SET_ERROR_FETCHING_ALL_RICHMENUS, response.exception);
        return false;
      } else if (response.result == "OK") {
        if (response.sandbox_equals_prod) {
          let RichMenus = [];
          let RawProdMenus = response.production_menus;
          for (const elem in RawProdMenus) {
            let prodMenu = JSON.parse(RawProdMenus[elem]);
            await verifyOrDownloadRichMenuImage(prodMenu.richMenuId, "production");
            RichMenus.push(prodMenu);
          }
          commit(SET_PRODUCTION_RICHMENUS, RichMenus);
          commit(SET_SANDBOX_RICHMENUS, RichMenus);
        } else {
          let ProdRichMenus = [];
          let RawProdMenus = JSON.parse(response.item).aliases
          for (const elem in RawProdMenus) {
            let prodMenu = RawProdMenus[elem];
            await verifyOrDownloadRichMenuImage(prodMenu.richMenuId, "production");
            ProdRichMenus.push(prodMenu);
          }

          let SandRichMenus = [];
          let RawSandMenus = JSON.parse(response.item).aliases;
          for (const elem in RawSandMenus) {
            let sandMenu = RawSandMenus[elem];
            await verifyOrDownloadRichMenuImage(sandMenu.richMenuId, "sandbox");
            SandRichMenus.push(sandMenu);
          }
          return JSON.parse(response.item).aliases;
        }
      }
    } catch (error) {
      ERR_SKELETON(commit, SET_ERROR_FETCHING_ALL_RICHMENUS, error);
    } finally {
      commit(SET_IS_FETCHING_ALL_RICHMENUS, false);
    }
  },
  [FETCH_DEFAULT_RICHMENUS]: async ({ commit }) => {
    try {
      commit(SET_IS_FETCHING_RICHMENU_INFO, true);
      commit(SET_ERROR_FETCHING_RICHMENU_INFO, null);

      const activeScenarioResponse = await GetActiveScenarioData();
      if (activeScenarioResponse.result == "ERROR") {
        throw new Error(activeScenarioResponse.exception);
      }

      if (activeScenarioResponse.item && activeScenarioResponse.item.bosaiMode) {
        commit(SET_SCENARIO_IS_IN_BOSAI_MODE, activeScenarioResponse.item.bosaiMode);
      }

      if (activeScenarioResponse.item && activeScenarioResponse.item.richMenus) {
        var richMenus = activeScenarioResponse.item.richMenus;
        const activeProd = await GetActiveRichMenu("production");
        const activeSand = await GetActiveRichMenu("sandbox");

        if (activeProd.result == "ERROR") {
          commit(SET_ACTIVE_PRODUCTION_RICHMENU, null);
        } else {
          var activeProdMenu = JSON.parse(activeProd.item);
          if (activeProdMenu) {
            await verifyOrDownloadRichMenuImage(activeProdMenu.richMenuId, "production");
          }
          commit(SET_ACTIVE_PRODUCTION_RICHMENU, activeProdMenu);
        }

        if (activeSand.result == "ERROR") {
          commit(SET_ACTIVE_SANDBOX_RICHMENU, null);
        } else {
          var activeSandMenu = JSON.parse(activeSand.item);
          if (activeSandMenu) {
            await verifyOrDownloadRichMenuImage(activeSandMenu.richMenuId, "sandbox");
          }
          commit(SET_ACTIVE_SANDBOX_RICHMENU, activeSandMenu);
        }

        if (richMenus.defaultProduction) {
          const defaultProd = await GetRichMenuById(richMenus.defaultProduction, "production");
          if (defaultProd.result == "ERROR") {
            commit(SET_DEFAULT_PRODUCTION_RICHMENU, null);
          } else {
            var defaultProdMenu = JSON.parse(defaultProd.item);
            if (defaultProdMenu) {
              await verifyOrDownloadRichMenuImage(defaultProdMenu.richMenuId, "production");
            }
            commit(SET_DEFAULT_PRODUCTION_RICHMENU, defaultProdMenu);
          }
        } else {
          commit(SET_DEFAULT_PRODUCTION_RICHMENU, null);
        }

        if (richMenus.defaultSandbox) {
          const defaultSand = await GetRichMenuById(richMenus.defaultSandbox, "sandbox");
          if (defaultSand.result == "ERROR") {
            commit(SET_DEFAULT_SANDBOX_RICHMENU, null);
          } else {
            var defaultSandMenu = JSON.parse(defaultSand.item);
            if (defaultSandMenu) {
              await verifyOrDownloadRichMenuImage(defaultSandMenu.richMenuId, "sandbox");
            }
            commit(SET_DEFAULT_SANDBOX_RICHMENU, defaultSandMenu);
          }
        } else {
          commit(SET_DEFAULT_SANDBOX_RICHMENU, null);
        }

        if (richMenus.bosaiProduction) {
          const bosaiProd = await GetRichMenuById(richMenus.bosaiProduction, "production");
          if (bosaiProd.result == "ERROR") {
            commit(SET_BOSAI_PRODUCTION_RICHMENU, null);
          } else {
            var bosaiProdMenu = JSON.parse(bosaiProd.item);
            if (bosaiProdMenu) {
              await verifyOrDownloadRichMenuImage(bosaiProdMenu.richMenuId, "production");
            }
            commit(SET_BOSAI_PRODUCTION_RICHMENU, bosaiProdMenu);
          }
        } else {
          commit(SET_BOSAI_PRODUCTION_RICHMENU, null);
        }

        if (richMenus.bosaiSandbox) {
          const bosaiSand = await GetRichMenuById(richMenus.bosaiSandbox, "sandbox");
          if (bosaiSand.result == "ERROR") {
            commit(SET_BOSAI_SANDBOX_RICHMENU, null);
          } else {
            var bosaiSandMenu = JSON.parse(bosaiSand.item);
            if (bosaiSandMenu) {
              await verifyOrDownloadRichMenuImage(bosaiSandMenu.richMenuId, "production");
            }
            commit(SET_BOSAI_SANDBOX_RICHMENU, bosaiSandMenu);
          }
        } else {
          commit(SET_BOSAI_SANDBOX_RICHMENU, null);
        }
      } else {
        commit(SET_DEFAULT_PRODUCTION_RICHMENU, null);
        commit(SET_DEFAULT_SANDBOX_RICHMENU, null);
        commit(SET_BOSAI_PRODUCTION_RICHMENU, null);
        commit(SET_BOSAI_SANDBOX_RICHMENU, null);
      }
    } catch (err) {
      ERR_SKELETON(commit, SET_ERROR_FETCHING_RICHMENU_INFO, err);
    } finally {
      commit(SET_IS_FETCHING_RICHMENU_INFO, false);
    }
  },
  [FETCH_ACTIVE_RICHMENUS]: async ({ commit }) => {
    try {
      commit(SET_IS_FETCHING_RICHMENU_INFO, true);
      commit(SET_ERROR_FETCHING_RICHMENU_INFO, null);

      const activeProd = await GetActiveRichMenu("production");
      const activeSand = await GetActiveRichMenu("sandbox");

      if (activeProd.result == "ERROR") {
        commit(SET_ACTIVE_PRODUCTION_RICHMENU, null);
      } else {
        var activeProdMenu = JSON.parse(activeProd.item);
        if (activeProdMenu) {
          await verifyOrDownloadRichMenuImage(activeProdMenu.richMenuId, "production");
        }
        commit(SET_ACTIVE_PRODUCTION_RICHMENU, activeProdMenu);
      }

      if (activeSand.result == "ERROR") {
        commit(SET_ACTIVE_SANDBOX_RICHMENU, null);
      } else {
        var activeSandMenu = JSON.parse(activeSand.item);
        if (activeSandMenu) {
          await verifyOrDownloadRichMenuImage(activeSandMenu.richMenuId, "sandbox");
        }
        commit(SET_ACTIVE_SANDBOX_RICHMENU, activeSandMenu);
      }
    } catch (err) {
      ERR_SKELETON(commit, SET_ERROR_FETCHING_RICHMENU_INFO, err);
    } finally {
      commit(SET_IS_FETCHING_RICHMENU_INFO, false);
    }
  },
  [SET_ACTIVE_RICH_MENU]: async ({ commit }, payload) => {
    try {
      if (!("runLoad" in payload) || payload["runLoad"]) {
        commit(SET_IS_FETCHING_RICHMENU_INFO, true);
      }
      commit(SET_ERROR_SETTING_RICHMENU, null);
      var response = null;
      if (payload.richMenu) {
        response = await SetActiveRichMenu(payload.richMenu.richMenuId, payload.environment);
      } else {
        response = await SetActiveRichMenu(null, payload.environment);
      }

      if (response.result == "ERROR") {
        ERR_SKELETON(commit, SET_ERROR_SETTING_RICHMENU, response.exception);
      } else {
        if (payload.environment == "production") {
          commit(SET_ACTIVE_PRODUCTION_RICHMENU, payload.richMenu);
        } else {
          commit(SET_ACTIVE_SANDBOX_RICHMENU, payload.richMenu);
        }
      }
    } catch (error) {
      ERR_SKELETON(commit, SET_ERROR_SETTING_RICHMENU, error);
    } finally {
      if (!("runLoad" in payload) || payload["runLoad"]) {
        commit(SET_IS_FETCHING_RICHMENU_INFO, false);
      }
    }
  },
  [TOGGLE_BOSAI_MODE]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_FETCHING_RICHMENU_INFO, true);

      await SetBosaiModeForEnv(payload.environment, payload.activeSetting, payload.selectedTalk);

      const activeScenarioResponse = await GetActiveScenarioData();
      if (activeScenarioResponse.result == "ERROR") {
        throw new Error(activeScenarioResponse.error_message);
      }
      commit(SET_ACTIVE_SCENARIO_DATA, activeScenarioResponse.item);
      if (activeScenarioResponse.item.bosaiMode) {
        commit(SET_SCENARIO_IS_IN_BOSAI_MODE, activeScenarioResponse.item.bosaiMode);
      }

      const activeMenu = await GetActiveRichMenu(payload.environment);
      var richMenuToSet = activeMenu.result == "ERROR" ? null : JSON.parse(activeMenu.item);
      if (payload.environment == "production") {
        commit(SET_ACTIVE_PRODUCTION_RICHMENU, richMenuToSet);
      } else {
        commit(SET_ACTIVE_SANDBOX_RICHMENU, richMenuToSet);
      }
    } catch (error) {
      if (error.response && error.response.status == 500) {
        commit(
            SET_ERROR_FETCHING_RICHMENU_INFO,
            "リクエストの処理中にエラーが発生しました。" +
            "ページの再読み込み実施を実施してください。それでも表示されない場合は、" +
            "システム管理者に連絡してください。"
        );
      } else {
        ERR_SKELETON(commit, SET_ERROR_FETCHING_RICHMENU_INFO, error);
      }
    } finally {
      commit(SET_IS_FETCHING_RICHMENU_INFO, false);
    }
  },
  [UPLOAD_LOCATION_CSV_FILE]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, true);
      commit(SET_IMPORTING_SCENARIO_DATA_ERROR, null);
      const scenarioId = payload.versionId;
      await UploadLocationCSV(payload.fileData, scenarioId);
      dispatch("GET_ZIP_CODES", { scenarioId: payload.scenarioId, versionId: payload.versionId });
    } catch (err) {
        commit(SET_IMPORTING_SCENARIO_DATA_ERROR, "CSVアップロードにエラーが発生しました。");
    } finally {
      commit(SET_IS_FETCHING_SCENARIO_DETAIL, false);
    }
  },
  [GET_ZIP_CODES]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_FETCHING_ZIP_CODES, true);
      const response = await fetchZipCodes(payload.versionId);
      if (response.result == "Success") commit(SET_ZIP_CODES, response.zipcodes);
      else commit(SET_IS_FETCHING_ZIP_CODES_ERROR, response.exception);
    } catch (err) {
      ERR_SKELETON(commit, SET_IS_FETCHING_ZIP_CODES_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_ZIP_CODES, false);
    }
  },
  [DELETE_ZIP_CODES]: async ({ commit, dispatch }, payload) => {
    try {
      commit(SET_IS_FETCHING_ZIP_CODES, true);
      const scenario = payload.versionId;
      await deleteZipCodes(scenario);
      dispatch("GET_ZIP_CODES", { scenarioId: payload.scenarioId, versionId: payload.versionId });
    } catch (err) {
      ERR_SKELETON(commit, SET_IS_FETCHING_ZIP_CODES_ERROR, err);
    } finally {
      commit(SET_IS_FETCHING_ZIP_CODES, false);
    }
  },
  [DOWNLOAD_ZIP_CSV]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_EXPORTING_SCENARIO_DATA, true);
      commit(SET_EXPORTING_SCENARIO_DATA_ERROR, null);
      commit(SET_EXPORTING_SCENARIO_DATA_WARNING, null);

      const response = await downloadZipCSV(payload.scenario);

      if (response.result === "SUCCESS") {
        var filename = response.csv_url.replace(/.*\//, "");
        var url = response.csv_url.replace(filename, "");
        const link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("download", filename);
        link.href = response.csv_url;
        link.click();
      }

      if (response.warning && response.warning.length > 0) {
        var warnings = "これらの警告でエクスポートは正常に終了しました：";
        response.warning.forEach((element) => {
          warnings += element + ",";
        });
        warnings = warnings.slice(0, -1);
        commit(SET_EXPORTING_SCENARIO_DATA_WARNING, warnings);
      }

      if (response.result === "ERROR") {
        var exception = "エクスポート中エラー発生しました：";
        if (typeof response.exception == "string") {
          exception += response.exception;
        } else {
          response.exception.forEach((element) => {
            exception += element + ",";
          });
          exception = exception.slice(0, -1);
        }
        commit(SET_EXPORTING_SCENARIO_DATA_ERROR, exception);
      }

      commit(EXPORT_FINISH_SUCCESS, true);
    } catch (err) {
      ERR_SKELETON(commit, SET_EXPORTING_SCENARIO_DATA_ERROR, err);
    } finally {
      commit(SET_IS_EXPORTING_SCENARIO_DATA, false);
    }
  },
  [FETCH_SPECIAL_TALK_FLOW_START]: async ({ commit }, payload) => {
    try {
      const {
        talkId,
        scenario
      } = payload;

      const template_talk = TEMPLATE_TALKS.find(elem => elem.talkId === talkId);
      const response = await GetSpecialScenarioRootNode({
        name: template_talk.displayName,
        scenario: scenario
      });
      if (response.result == "SUCCESS") {
        var tempRootNode = {
          mindmapId: 0,
          type: response.event.type == "text_message" ? "message" : response.event.type,
          value: response.event.type == "text_message" ? response.event.data : "ポストバック",
        };
        if (response.event.type == "postback") {
          tempRootNode["postbackId"] = response.event.data;
        }

        var tempPayload = {
          listName: "specialTalkRootNodes",
          talkName: talkId,
          value: tempRootNode,
        };
        commit(SET_SCENARIO_MINDMAP_SPECIAL_TALK, tempPayload);

        var firstMessage = cloneDeep(response.event.message);
        firstMessage["mindmapId"] = 1;
        firstMessage["parentId"] = 0;

        tempPayload.listName = "specialTalkFirstBotReply";
        tempPayload.value = firstMessage;

        commit(SET_SCENARIO_MINDMAP_SPECIAL_TALK, tempPayload);
      }
    } catch (err) {
      console.log(err);
    }
  },
  [SAVE_TALK_NODES]: async ({ commit }, payload) => {
    try {
      console.log("SAVE_TALK_NODES", "payload:", payload);
      commit(SET_IS_SAVING_TALK_NODES, true);
      commit(SET_SAVE_TALK_NODES_ERROR, null);
      commit(SAVE_TALK_NODES_SUCCESS, null);

      const { scenarioId, versionId, name, scenario, messages, generations, onSaveDeleteTargetIds, newTalkId } = payload;

      if (messages.length === 0) {
        // NOTE: nop
        // TODO: log error message
      } else {
        const putItems = [];
        const deleteItems = [];
        const deleteMessageIds = [];

        // 非表示かつ未設定かつメッセージ名が空のメッセージを削除
        messages.forEach((msg) => {
          if(!messageIdInRenderedMindmap(msg.dataId, generations) && msg.dataType === "__INITIAL__" && !msg.nameLBD) {
            deleteItems.push(msg);
            deleteMessageIds.push(msg.dataId);
          } else {
            putItems.push(msg);
          }
        });

        // Filter item params
        putItems.forEach((item, index) => {
          if (item.branchIndex != null) {
            delete putItems[index].branchIndex;
          }
          const { actionCount, columnCount } = item.params || {};
          if (item.dataType === "carousel" && isNumber(actionCount) && isNumber(columnCount)) {
            for (let column = 0; column < 10; column++) {
              const startActionIndex = columnCount <= column ? 0 : actionCount;
              for (let action = startActionIndex; action < 3; action++) {
                const key = `action.${column}.${action}`;
                if (item.params[key] && deleteMessageIds.includes(item.params[key].data)) {
                  item.params[key].data = "";
                }
              }
            }
          } else if (item.dataType === "buttons" && isNumber(actionCount)) {
            for (let action = actionCount; action < 4; action++) {
              const key = `actions.${action}`;
              if (item.params[key] && deleteMessageIds.includes(item.params[key].data)) {
                item.params[key].data = "";
              }
            }
          }
        });

        const userMessageResult = await GetScenarioDataByDataType(payload.scenarioId, payload.versionId, "userMessage");
        let userMessage;
        if (userMessageResult && userMessageResult.items && userMessageResult.items.length === 1) {
          userMessage = userMessageResult.items[0];
        } else {
          userMessage = {
            dataId: "userMessage",
            dataType: "userMessage",
            params: {},
            scenario,
          };
        }

        const textMappingResult = await GetScenarioDataByDataType(payload.scenarioId, payload.versionId, "textMapping");
        let textMapping;
        if (textMappingResult && textMappingResult.items && textMappingResult.items.length === 1) {
          textMapping = textMappingResult.items[0];
        } else {
          textMapping = {
            scenario: `${payload.scenarioId}#${payload.versionId}`,
            dataId: "textMapping",
            dataType: "textMapping",
            textMapping: {},
          };
        }

        Object.keys(textMapping.textMapping).forEach((key) => {
          if (onSaveDeleteTargetIds.includes(textMapping.textMapping[key])) {
            delete textMapping.textMapping[key];
          }
        });

        onSaveDeleteTargetIds.forEach((targetId) => {
          deleteItems.push({
            scenario,
            dataId: targetId,
          });
        });

        const talks = await GetScenarioDataByDataType(scenarioId, versionId, "talk");
        const talkItem = talks.items.find((item) => name === item.params.name);
        if (talkItem && !TEMPLATE_TALK_IDS.includes(talkItem.dataId)) {
          deleteItems.push({
            scenario,
            dataId: talkItem.dataId,
          });
        }

        const newTalk = {
          scenario,
          dataId: talkItem && TEMPLATE_TALK_IDS.includes(talkItem.dataId) ? talkItem.dataId : newTalkId,
          dataType: "talk",
          params: {
            name,
            messages: [],
            selectedRichMenuId: null,
            webAppList: [],
            displayNumber: talks.items.length + 1,
            editor: "lbd-web",
            updateDate: moment().unix(),
          },
        };
        generations.forEach((generation, index) => {
          const isUser = index % 2 === 0;
          generation.forEach((node) => {
            const messageId = isUser ? generateUUID() : node.dataId;
            newTalk.params.messages.push({
              sender: isUser ? "USER" : "BOT",
              messageId: messageId,
              time: new Date().getTime(),
            });
            if (isUser && node.type === "message") {
              userMessage.params[messageId] = {
                type: "text",
                params: {
                  text: node.value,
                },
                id: messageId,
              };

              if (generations[index + 1] && generations[index + 1].length > 0) {
                if (index === 0) {
                  // NOTE: root node
                  textMapping.textMapping[node.value] = generations[1][0].dataId;
                } else {
                  generations[index + 1]
                      .filter((childNode) => childNode.parentId === node.mindmapId)
                      .forEach((childNode) => {
                        // FIXME: 本当に上書きしてもいい？
                        textMapping.textMapping[node.value] = childNode.dataId;
                      });
                }
              }
            }
          });
        });

        //For Template Talks, make sure the talk contains all of the required messages by copying the existing talks
        if (talkItem && TEMPLATE_TALK_IDS.includes(talkItem.dataId)) {
          for(const message of talkItem.params.messages) {
            if (message.sender !== 'BOT') {
              continue;
            }
            const messageInNewTalk = newTalk.params.messages.find(elem => elem.messageId == message.messageId);
            if (messageInNewTalk === undefined) {
              newTalk.params.messages.push(message);
            }
          }
        }

        putItems.push(newTalk);
        putItems.push(userMessage);
        putItems.push(textMapping);

        for (let i = 0; i < putItems.length; i++) {
          const item = putItems[i];
          if (item.dataId !== "userMessage" || item.dataId !== "textMapping") {
            // NOTE: maybe scenario node. we should be replace base64 image url
            let pseudoPayload = {
              model: item,
            };
            pseudoPayload = await uploadAndReplaceMedia(pseudoPayload);
            putItems[i] = pseudoPayload.model;
          }
        }

        messages.forEach((message) => {
          deleteItems.push({
            scenario: message.scenario,
            dataId: message.dataId,
          });
        });

        console.log("SAVE_TALK_NODES", "deleteItems:", deleteItems);
        console.log("SAVE_TALK_NODES", "putItems:", putItems);

        const messageClearResponse = await retryableBatchWriteItem([], deleteItems);
        if (!messageClearResponse) {
          throw new Error("batch clear error");
        }
        const messagesSaveResponse = await retryableBatchWriteItem(putItems, []);
        if (!messagesSaveResponse) {
          throw new Error("batch save error");
        }
      }
      commit(SAVE_TALK_NODES_SUCCESS, true);
    } catch (err) {
      ERR_SKELETON(commit, SET_SAVE_TALK_NODES_ERROR, err);
    } finally {
      commit(SET_IS_SAVING_TALK_NODES, false);
    }
  },
  [CREATE_SCENARIO_VERSION]: async ({ commit }, payload) => {
    const { scenarioName } = payload;
    const scenarioVersion = generateUUID();
    const displayVersionName = payload.scenarioVersion;

    try {
      commit(SET_IS_IMPORTING_SCENARIO_DATA, true);
      commit(CREATE_FINISH_SUCCESS, false);
      commit(SET_IMPORTING_SCENARIO_DATA_ERROR, null);
      commit(SET_IMPORTING_SCENARIO_DATA_WARNING, null);

      const responseJson = await AddVersionToScenario(scenarioName, scenarioVersion, displayVersionName);

      commit(CREATE_FINISH_SUCCESS, true);
      if (responseJson.item) {
        commit(SET_SETTING_SCENARIOS, responseJson.item);
        commit(SET_ACTIVE_SCENARIO, responseJson.item);
      }
    } catch (err) {
      console.error("CREATE_SCENARIO_VERSION", "error:", err);
      if (err instanceof ProgressEvent) {
        commit(SET_IMPORTING_SCENARIO_DATA_ERROR, "バージョンの新規作成に失敗しました");
      } else {
        ERR_SKELETON(commit, SET_IMPORTING_SCENARIO_DATA_ERROR, err);
      }
    } finally {
      commit(SET_IS_IMPORTING_SCENARIO_DATA, false);
    }
  },
  [UPDATE_TALK_UPDATED_TIME]: async ({ commit }, payload) => {
    try {
      commit(SET_IS_SAVING_TALK_NODES, true);
      commit(SET_SAVE_TALK_NODES_ERROR, null);
      commit(SAVE_TALK_NODES_SUCCESS, null);

      const { scenarioId, versionId, scenario, talkName } = payload;

      const putItems = [];
      const deleteItems = [];

      const talks = await GetScenarioDataByDataType(scenarioId, versionId, "talk");
      const talkItem = talks.items.find((item) => talkName === item.params.name);
      if (!talkItem) {
        throw new Error("missing talk item");
      }

      deleteItems.push({
        scenario,
        dataId: talkItem.dataId,
      });

      const newTalk = {
        ...talkItem,
        params: {
          ...talkItem.params,
          updateDate: moment().unix(),
        },
      };
      putItems.push(newTalk);
      commit(SAVE_TALK_NODES_SUCCESS, true);
    } catch (err) {
      ERR_SKELETON(commit, SET_SAVE_TALK_NODES_ERROR, err);
    } finally {
      commit(SET_IS_SAVING_TALK_NODES, false);
    }
  },

  [AGGREGATE_TALK_LOG]: async ({ commit }, payload) => {
    try {
      commit(SET_AGGREGATE_TALK_LOG, true);
      commit(SET_AGGREGATE_TALK_LOG_ERROR, null);
      await AggregateTalkLog(payload.startDate, payload.endDate, payload.user);
    } catch (error) {
      commit(SET_AGGREGATE_TALK_LOG_ERROR, error);
    }
  },

  [FETCH_TALK_LOG_LISTS]: async ({commit}, payload) => {
    try {
      const response = await FetchTalkLogLists();

      let currentDate = moment();
      for(let i=0; response.item.length > i  ;i++){
        let momentItemDate = moment(response.item[i].Date);
        momentItemDate.add(900, "s");
        response.item[i].isExpired = currentDate.isAfter(momentItemDate);
        response.item[i].s3expiryDite = momentItemDate;
        response.item[i].rowNum = i;
      }
      commit(SET_FETCH_TALK_LOG_LISTS, response);
    } catch (error) {
      commit(SET_FETCH_TALK_LOG_LISTS_ERROR, error);
    }
  },
};
