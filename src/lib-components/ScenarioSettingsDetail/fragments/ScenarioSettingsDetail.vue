<!--
Copyright 2021 LINE Fukuoka Corporation

LINE Corporation licenses this file to you under the Apache License,
version 2.0 (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at:

  https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations
under the License.
-->
<style scoped>
.user-input {
  text-decoration: underline;
  cursor: pointer;
}
.user-input .text-show {
  word-wrap: break-word;
  white-space: normal;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.tooltip-text-show {
  max-width: 90vw;
  word-wrap: break-word;
  white-space: normal;
  display: inline-block;
}
.user-text {
  word-break: break-word;
}
.preview-image {
  max-width: 50px;
  max-height: 50px;
}
</style>
<style>
.scenario-table.v-data-table tbody tr:hover {
  cursor: initial !important;
}
</style>
<template>
  <v-container>
  <div @click="clickOnMainContent">
    <v-card outlined class="my-4">
      <v-container fluid>
        <v-container fluid>
          <v-alert
              v-if="this.activeScenarioData.envMapping && $route.params.versionId === this.activeScenarioData.envMapping.production"
              class="red--text text--darken-4"
              color="red darken-4"
              icon="mdi-alert"
              dismissible
              text
          >
            <div class="text-center">
              このバージョンは公開中です。編集後すぐに変更内容が反映されますのでご注意ください。
            </div>
          </v-alert>
          <v-row justify="space-between">
            <v-col cols="auto" md="auto">
              <h2
                  v-if="hasActionPermission('disableButton', 'ScenarioSettings_ChangeTalkName_Click')"
                  class="active-talk-name"
              >
                {{ getTalkNameFromId }}
              </h2>
              <h2
                  v-else
                  class="active-talk-name clickable"
                  @click="showTalkNameChangeModal = true"
              >
                {{ getTalkNameFromId }}
              </h2>
            </v-col>
            <v-col cols="auto">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span
                      v-bind="attrs"
                      v-on="$route.params.talkId === 'DAMAGE_REPORT_TALK' && on"
                  >
                    <v-btn
                        color="error"
                        :disabled="hasActionPermission('disableButton', 'ScenarioSettings_DeleteMessage_Click') || disableDeleteButton()"
                        @click="hasActionPermission('click', 'backendRequest') ? (showDeleteModal = true) : showActionPermissionError()"
                    >
                      選択項目を削除
                    </v-btn>
                  </span>
                </template>
                <span>
                  "{{ getTalkNameFromId }}" はメッセージを削除できません
                </span>
              </v-tooltip>

              <span v-if="fmVisible">
                <v-btn
                    class="ml-2"
                    color="primary"
                    :disabled="hasActionPermission('disableButton', 'ScenarioSettings_CreateCompositeMessage_Click')"
                    @click="openCompositeMessage">
                  複合メッセージを追加
                </v-btn>
              </span>
              <span v-if="isVisible">
                <v-btn
                    class="ml-2"
                    color="primary"
                    :disabled="hasActionPermission('disableButton', 'ScenarioSettings_ImportGarbageCsv_Click')"
                    @click="createSpecialScenarios('ゴミ分別')"
                >
                  CSVインポート
                </v-btn>
                <v-btn
                    class="ml-2"
                    color="primary"
                    :loading="showLoadingExport"
                    @click="exportTrashCSV()"
                >
                  CSVエクスポート
                </v-btn>
              </span>
              <span v-if="csvVisible">
                <v-btn
                    class="ml-2"
                    color="primary"
                    :disabled="hasActionPermission('disableButton', 'ScenarioSettings_ImportZipCodeCsv_Click')"
                    @click="openZipCodeCSVUploader"
                >
                  郵便番号CSVインポート
                </v-btn>
                <v-btn
                    class="ml-2"
                    color="primary"
                    @click="openZipCodeList"
                >
                  郵便番号リスト
                </v-btn>
              </span>
            </v-col>
          </v-row>
          <div style="margin: 0 -16px;">
            <v-toolbar :elevation="0">
              <v-autocomplete
                  class="mr-3"
                  v-model="localSearchAttribute"
                  :items="searchOptions"
                  flat
                  outlined
                  dense
                  clearable
                  background-color="white"
                  hide-details
                  :placeholder="'検索項目'"
              ></v-autocomplete>
              <v-row no-gutters v-if="localSearchAttribute === 'type'">
                <v-autocomplete
                    v-model="localSearchKeyword"
                    :items="messageType"
                    outlined
                    dense
                    clearable
                    hide-details
                    placeholder="種別"
                    :disabled="!searchAttribute"
                ></v-autocomplete>
              </v-row>
              <v-text-field
                  v-else-if="localSearchAttribute === 'name'"
                  v-model="localSearchKeyword"
                  hide-details
                  outlined
                  dense
                  clearable
                  placeholder="メッセージ名"
                  :disabled="!searchAttribute"
              ></v-text-field>
              <v-text-field
                  v-else-if="localSearchAttribute === 'text'"
                  v-model="localSearchKeyword"
                  hide-details
                  outlined
                  dense
                  clearable
                  placeholder="テキスト"
                  :disabled="!searchAttribute"
              ></v-text-field>
              <v-text-field
                  v-else-if="localSearchAttribute === 'user_input'"
                  v-model="localSearchKeyword"
                  hide-details
                  outlined
                  dense
                  clearable
                  placeholder="ユーザー入力"
                  :disabled="!searchAttribute"
              ></v-text-field>
              <v-text-field
                  v-else
                  v-model="localSearchKeyword"
                  hide-details
                  outlined
                  dense
                  clearable
                  placeholder="キーワード"
                  :disabled="true"
              ></v-text-field>
              <v-btn
                  class="mx-3"
                  height="40"
                  color="primary"
                  elevation="0"
                  @click="handleSearch"
              > 検索 </v-btn>
              <v-btn
                  height="40"
                  color="blue-grey"
                  outlined
                  :disabled="isClearDisabled"
                  @click="handleClearAllSearchCriteria"
              > 条件クリア </v-btn>
            </v-toolbar>
          </div>
          <v-data-table
              class="scenario-table"
              :headers="headers"
              :items="filteredTableItems"
              :items-per-page="tableItemsPerPage"
              :show-select="true"
              :single-select="false"
              :loading="loadingMessageSearch"
              :footer-props="{
                'items-per-page-options': [20, 50, 100],
              }"
              sort-by="nameLBD"
              :sort-desc="false"
              item-key="id"
              v-model="tableSelected"
          >
            <template v-slot:item.data-table-select="{ isSelected, select, item }">
              <v-simple-checkbox
                  color="gray"
                  :value="tableSelected.map((selected) => selected.id).includes(item.id)"
                  @input="select($event)"
              />
            </template>
            <template v-slot:item.nameLBD="{ item }">
              <div class="d-flex align-center">
                <span
                    v-if="svgIconConstants[item.dataType]"
                    v-html="svgIconConstants[item.dataType]"
                    style="display: inline-flex"
                    class="mr-2"
                />
                <v-icon v-else class="mr-2">{{ item.previewIcon }}</v-icon>
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <span class="text-show" v-bind="attrs" v-on="on">{{ item.nameLBD || "-" }}</span>
                  </template>
                  <span class="tooltip-text-show">{{ item.nameLBD || "-" }}</span>
                </v-tooltip>
              </div>
            </template>
            <template v-slot:item.userInput="{ item }">
              <div
                  v-if="
                    hideTextMapping.includes(item.dataType) ||
                    (item.params &&
                      'specialScenarioTalk' in item.params &&
                      !specialTalkScenariosToDisplay.includes(item.params.specialScenarioTalk))
                  "
              >
                -
              </div>
              <div v-else>
                <div v-if="item.userInput.length > 1" class="user-input primary--text">
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <span class="text-show" v-bind="attrs" v-on="on" @click="onEditUserText(item)">{{ item.userInput[0] }} (+{{ item.userInput.length - 1 }})</span>
                    </template>
                    <span class="tooltip-text-show">{{ item.userInput[0] }} (+{{ item.userInput.length - 1 }})</span>
                  </v-tooltip>
                </div>
                <div v-else-if="item.userInput.length === 1" class="user-input primary--text">
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <span class="text-show" v-bind="attrs" v-on="on" @click="onEditUserText(item)">{{ item.userInput[0] }}</span>
                    </template>
                    <span class="tooltip-text-show">{{ item.userInput[0] }}</span>
                  </v-tooltip>
                </div>
                <div v-else>
                  <v-icon @click="onEditUserText(item)">mdi-plus</v-icon>
                </div>
              </div>
            </template>
            <template v-slot:item.dataId="{ item }">
              <v-btn color="primary" @click="onEditProperties(item)">編集</v-btn>
            </template>
            <template v-slot:item.previewValue="{ item }">
              <div v-if="item && item.previewType === 'text'">
                {{ item.previewValue }}
              </div>
              <div v-if="item && item.previewType === 'icon'">
                <v-icon>{{ item.previewValue }}</v-icon>
              </div>
              <div v-if="item && item.previewType === 'image'">
                <img v-bind:src="item.previewValue" class="preview-image" />
              </div>
            </template>
            <template v-slot:item.dataType="{ item }">
              <div>{{ typeTitle(item.dataType) }}</div>
            </template>
          </v-data-table>
        </v-container>
      </v-container>
    </v-card>
  </div>

  <ItemProperties
    :visible="showItemProperties"
    :model="selectedItem"
    :messages="tableItems"
    :scenarioId="scenarioId"
    :versionId="versionId"
    :talkName="selectedTalk"
    :parentClicked="cardClicked"
    @updateTextMapping="save"
    @close="onCloseEditProperties"
  />
  <UserTextModal :visible="showUserTextEdit" :message="selectedItem" @save="save" @close="showUserTextEdit = false" />
  <CompositeMessageModal
      :visible="showCompositeMessage"
      :scenarioId="scenarioId"
      :versionId="versionId"
      :displayTalkOptions="displayTalkOptions"
      @close="showCompositeMessage = false"
  />
  <SpecialTalkModal
      :visible="showSpecialTalk"
      :existingTalks="displayTalkOptions"
      :versionName="versionId"
      @onCreateTalks="createSpecialScenarios"
      @onDeleteTalks="deleteSpecialScenarios"
      @toggleTalkState="toggleSpecialScenarios"
      @close="showSpecialTalk = false"
  />
  <TalkNameChangeModal
    :visible="showTalkNameChangeModal"
    :existingTalks="displayTalkOptions"
    :talkId="$route.params.talkId"
    :originalTalkName="getTalkNameFromId"
    @updateTalk="updateTalkName"
    @close="showTalkNameChangeModal = false"
  />
  <TrashCSVImportModal
      :visible="showImportTalk"
      :existingTalks="displayTalkOptions"
      :versionName="versionId"
      :scenarioName="scenarioId"
      :isLocationCSV="isLocationCSV"
      @close="showImportTalk = false"
  />
  <ZipCodeList
      :visible="showZipCodeModal"
      :scenarioName="scenarioId"
      :versionName="versionId"
      @close="showZipCodeModal = false"
  />
  <DeleteMessageModal
      :visible="showDeleteModal"
      :tableSelected="tableSelected"
      @onDeleteItem="onDeleteItem"
      @close="showDeleteModal = false"
  />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import {
  FETCH_SCENARIO_DETAIL,
  UPDATE_TEXT_MAPPING,
  SAVE_ACTIVE_SCENARIO,
  FETCH_ALL_SCENARIOS,
  FETCH_ACTIVE_SCENARIO_DATA,
  CREATE_SIMPLE_SPECIAL_SCENARIO,
  DELETE_SPECIAL_SCENARIO,
  DOWNLOAD_CSV_FILE,
  GET_ZIP_CODES,
  DELETE_TALK, DELETE_SCENARIO_MESSAGE,
  UPDATE_SCENARIO_TALK_NAME,
} from "@/store/action-types";
import { mapState, mapActions, mapMutations } from "vuex";
import {
  DELETE_SCENARIO_TALK_SUCCESS,
  EXPORT_FINISH_SUCCESS, SET_IS_SAVING_ACTIVE_SCENARIO,
  SET_SCENARIO_MINDMAP_MESSAGES
} from "@/store/mutation-types";
import ItemProperties from "../../components/BotDesigner/ItemProperties.vue";
import UserTextModal from "../components/UserTextModal.vue";
import CompositeMessageModal from "../components/CompositeMessageModal.vue";
import SpecialTalkModal from "../components/SpecialTalkModal.vue";
import TrashCSVImportModal from "../components/TrashCSVImportModal.vue";
import TalkNameChangeModal from "../components/TalkNameChangeModal.vue";
import ZipCodeList from "../components/ZipCodeList.vue";
import {
  BOT_ITEM_TYPES,
  SCENARIO_ENV_TYPES, SCENARIO_SEARCH_PRODUCTION_OPTIONS, SCENARIO_SETTING_SEARCH_TYPE_OPTIONS,
  SCENARIO_SETTING_SEARCH_ATTRIBUTE_OPTIONS,
  SPECIAL_TALK_TYPES_MAPPING,
  SVG_ICON_CONSTANTS,
} from "@/store/modules/scenarios/scenarios.constants";
import { cloneDeep } from "lodash";
import { DISPLAY_MESSAGES, SET_USER_MESSAGES } from "@/store/mutation-types";
import { SPECIAL_TALK_TYPES } from "@/store/modules/scenarios/scenarios.constants";
import DeleteMessageModal from "../components/DeleteMessageModal.vue";

interface LocalState {
  scenarioId: any;
  versionId: any;
  basicPayload: any;
  hideTextMapping: Array<any>;
  displayTalkOptions: any;
  isVisible: boolean;
  fmVisible: boolean;
  csvVisible: boolean;
  isLocationCSV: boolean;
  showLoadingExport: boolean;
  showItemProperties: boolean;
  showCompositeMessage: boolean;
  showUserTextEdit: boolean;
  showSpecialTalk: boolean;
  showImportTalk: boolean;
  showZipCodeModal: boolean;
  showDeleteModal: boolean;
  showTalkNameChangeModal: boolean;
  selectedItem: any;
  selectedTalk: any;
  searchCriteriaLocal: any;
  tableItems: Array<any>;
  tableItemsPerPage: number;
  filteredTableItems: Array<any>;
  tableSelected: Array<any>;
  searchContentsPhrase: any;
  searchContentsPhraseLowercase: any;
  loadingMessageSearch: boolean;
  textPreviews: Array<string>;
  iconPreviews: Array<string>;
  imagePreviews: Array<string>;
  specialTalks: Array<string>;
  specialTalkScenariosToDisplay: Array<string>;
  headers: Array<any>;
  showSearch: boolean;
  svgIconConstants: any;
  cardClicked: boolean;
  localSearchAttribute: string;
  localSearchKeyword: string;
  searchOptions: Array<any>;
}

export default Vue.extend({
  props: {
    searchCriteria: Object,
  },
  data(): LocalState {
    return {
      scenarioId: null,
      versionId: null,
      basicPayload: {
        scenarioId: null,
        versionId: null,
      },
      hideTextMapping: ["jsonTemplate"],
      displayTalkOptions: null,
      isVisible: false,
      fmVisible: true,
      csvVisible: false,
      isLocationCSV: false,
      showLoadingExport: false,
      showItemProperties: false,
      showCompositeMessage: false,
      showUserTextEdit: false,
      showSpecialTalk: false,
      showImportTalk: false,
      showZipCodeModal: false,
      showDeleteModal: false,
      showTalkNameChangeModal: false,
      selectedItem: null,
      selectedTalk: null,
      searchCriteriaLocal: null,
      tableItems: [],
      tableItemsPerPage: 20,
      filteredTableItems: [],
      tableSelected: [],
      searchContentsPhrase: null,
      searchContentsPhraseLowercase: null,
      loadingMessageSearch: false,
      textPreviews: ["text"],
      iconPreviews: [
        "video",
        "audio",
        "file",
        "sticker",
        "location",
        "pie",
        "compositeMessage",
        "carousel",
        "confirm",
        "bubbleFlex",
        "carouselFlex",
        "buttons",
        "jsonTemplate",
      ],
      imagePreviews: ["image", "imagemap"],
      specialTalks: ["損傷報告", "ゴミ分別", "防災", "防災検索"],
      specialTalkScenariosToDisplay: ["ゴミ分別"],
      headers: [
        {
          text: "メッセージ名",
          sortable: true,
          value: "nameLBD",
          width: "30%",
        },
        {
          text: "ユーザー入力",
          sortable: false,
          value: "userInput",
          width: "30%",
        },
        {
          text: "メッセージプレビュー",
          sortable: false,
          value: "previewValue",
          width: "30%",
        },
        {
          text: "",
          sortable: false,
          value: "dataId",
          width: "10%",
        },
      ],
      showSearch: false,
      svgIconConstants: SVG_ICON_CONSTANTS,
      cardClicked: false,
      localSearchAttribute: "",
      localSearchKeyword: "",
      searchOptions: SCENARIO_SETTING_SEARCH_ATTRIBUTE_OPTIONS,
    };
  },
  watch: {
    scenarioTextMap() {
      if (this.selectedTalk) {
        this.selectTalk(this.selectedTalk);
      } else {
        this.tableItems = this.displayScenarioMessages;
      }
    },
    isExportingScenarioData(value) {
      if (!value) {
        this.showLoadingExport = false;
      }
    },
    scenarioTalks() {
      this.displayTalkOptions = this.talkOptions();
    },
    scenarioMessages() {
      if (this.selectedTalk) {
        this.selectTalk(this.selectedTalk);
      } else {
        this.tableItems = this.displayScenarioMessages;
      }
    },
    searchCriteria(val) {
      this.searchCriteriaLocal = val;
      this.filterTableItems();
    },
    tableItems() {
      this.tableSelected = [];
      this.filterTableItems();

      this.saveTextMappingIntoMindMap();
      this.saveScenarioMessagesIntoMindMap();
    },
    filteredTableItems(val) {
      this.$store.commit(DISPLAY_MESSAGES, cloneDeep(val));
    },
    fetchScenarioDetailError(val) {
      if (val) {
        if (val instanceof String) {
          this.$snackbar.show({ text: val, type: "error" });
        } else {
          this.$snackbar.show({ text: val.message, type: "error" });
        }
      }
    },
    exportingScenarioDataError(val) {
      if (val) {
        if (val instanceof String) {
          this.$snackbar.show({ text: val, type: "error" });
        } else {
          this.$snackbar.show({ text: val.message, type: "error" });
        }
      }
    },
    changingTalkNameError(val) {
      if (val) {
        this.$snackbar.show({ text: val, type: "error" });
      }
    },
    searchContentsPhrase(val) {
      if (val != null) {
        this.searchContentsPhraseLowercase = val.toLowerCase();
      }
    },
    deleteScenarioTalkSuccess(val) {
      if (val) {
        this.setDeleteScenarioTalkSuccess(null);
        this.selectTalk(null);
        this.selectedTalk = null;
      }
    },
  },
  components: {
    DeleteMessageModal,
    ItemProperties,
    CompositeMessageModal,
    UserTextModal,
    SpecialTalkModal,
    TrashCSVImportModal,
    ZipCodeList,
    TalkNameChangeModal,
  },
  computed: {
    ...mapState({
      scenarioMessages: (state: any) => state.scenarios.scenarioMessages,
      scenarioMindmap: (state: any) => state.scenarios.scenarioMindmap,
      isExportingScenarioData: (state: any) => state.scenarios.isExportingScenarioData,
      scenarioTextMap: (state: any) => state.scenarios.scenarioTextmap,
      activeScenario: (state: any) => state.scenarios.activeScenario,
      scenarioTalks: (state: any) => state.scenarios.scenarioTalks,
      userMessages: (state: any) => state.scenarios.userMessages,
      activeScenarioData: (state: any) => state.scenarios.activeScenarioData,
      isFetchingScenarioDetail: (state: any) => state.scenarios.isFetchingScenarioDetail,
      fetchScenarioDetailError: (state: any) => state.scenarios.fetchScenarioDetailError,
      isSavingActiveScenario: (state: any) => state.scenarios.isSavingActiveScenario,
      exportingScenarioDataError: (state: any) => state.scenarios.exportingScenarioDataError,
      deleteScenarioTalkSuccess: (state: any) => state.scenarios.deleteScenarioTalkSuccess,
      changingTalkNameError: (state: any) => state.scenarios.changingTalkNameError,
    }),
    getTalkNameFromId(): any {
      const talk = this.scenarioTalks.find(elem => elem.id == this.$route.params.talkId);
      return talk ? talk.params.name : "トーク名";
    },
    getTalkDataIdFromId(): any {
      const talk = this.scenarioTalks.find(elem => elem.id == this.$route.params.talkId);
      return talk ? talk.dataId : "トーク名";
    },
    getTalkDataById(): any {
      const talk = this.scenarioTalks.find(elem => elem.id == this.$route.params.talkId);
      return talk;
    },
    displayScenarioMessages(): any {
      const displayData = cloneDeep(this.scenarioMessages);
      displayData.forEach((message) => {
        const idToFind = message.dataId;
        const listOfTexts = this.scenarioTextMap.textMapping || {};
        const userText = [];
        Object.keys(listOfTexts).forEach((key) => {
          if (listOfTexts[key] === idToFind) {
            userText.push(key);
          }
        });
        message["userInput"] = userText;
        this.setMessagePreviewItems(message);
      });
      return displayData;
    },
    environment(): any {
      return SCENARIO_ENV_TYPES[this.$route.params.env.toLowerCase()].text;
    },
    productionStatus() {
      return SCENARIO_SEARCH_PRODUCTION_OPTIONS;
    },
    messageType() {
      return SCENARIO_SETTING_SEARCH_TYPE_OPTIONS;
    },
    searchAttribute() {
      return this.localSearchAttribute
    },
    isClearDisabled(): void {
      return (!this.searchAttribute && !this.searchKeyword) || this.isFetchingUserList;
    }
  },
  methods: {
    ...mapActions({
      getDataForDetails: FETCH_SCENARIO_DETAIL,
      updateTextMapping: UPDATE_TEXT_MAPPING,
      createScenarioTalk: CREATE_SIMPLE_SPECIAL_SCENARIO,
      deleteMessagesForSpecialScenario: DELETE_SPECIAL_SCENARIO,
      deleteMessagesScenario: DELETE_TALK,
      updateActiveScenario: SAVE_ACTIVE_SCENARIO,
      downloadCSVFile: DOWNLOAD_CSV_FILE,
      exportFinishSuccess: EXPORT_FINISH_SUCCESS,
      fetchZipCodes: GET_ZIP_CODES,
      deleteScenarioMessage: DELETE_SCENARIO_MESSAGE,
      updateScenarioTalkName: UPDATE_SCENARIO_TALK_NAME,
    }),
    ...mapMutations({
      updateMindMapMessages: SET_SCENARIO_MINDMAP_MESSAGES,
      setDeleteScenarioTalkSuccess: DELETE_SCENARIO_TALK_SUCCESS,
      setIsSavingActiveScenario: SET_IS_SAVING_ACTIVE_SCENARIO,
    }),
    clickOnMainContent(): void {
      if (this.showItemProperties) {
        this.cardClicked = !this.cardClicked;
      }
    },
    saveTextMappingIntoMindMap(): void {
      const payload = {
        versionName: this.versionId,
        valueName: "textMapping",
        value: this.scenarioTextMap.textMapping,
      };
      this.updateMindMapMessages(payload);
    },
    saveScenarioMessagesIntoMindMap(): void {
      const payload = {
        versionName: this.versionId,
        valueName: this.selectedTalk,
        value: this.tableItems,
      };
      this.updateMindMapMessages(payload);
    },
    setMessagePreviewItems(message: any): void {
      if (this.textPreviews.includes(message.dataType)) {
        message["previewType"] = "text";
        message["previewValue"] =
            message.params.text.length > 20 ? message.params.text.slice(0, 20) + "..." : message.params.text;
      } else if (this.imagePreviews.includes(message.dataType)) {
        message["previewType"] = "image";
        message["previewValue"] = message.params[BOT_ITEM_TYPES[message.dataType].image];
        if (message.dataType === "imagemap") {
          message["previewValue"] = message["previewValue"] + "/240";
        }
      } else {
        message["previewType"] = "text";
        message["previewValue"] = "-";
      }
      if (BOT_ITEM_TYPES[message.dataType] && BOT_ITEM_TYPES[message.dataType].icon) {
        message["previewIcon"] = BOT_ITEM_TYPES[message.dataType].icon;
      } else {
        message["previewIcon"] = "mdi-border-none-variant";
      }
    },
    talkOptions(): any {
      return this.scenarioTalks ? this.scenarioTalks.map((a) => a.params.name).sort() : [];
    },
    isLbdWebTalk(talkName: any): any {
      if (!this.scenarioTalks) {
        return false;
      }
      return (
          this.scenarioTalks.findIndex((talk) => talk.params.name === talkName && talk.params.editor === "lbd-web") !== -1
      );
    },
    specialScenarioTalkSelected(selectedTalk: any): any {
      return selectedTalk === null || SPECIAL_TALK_TYPES.includes(selectedTalk);
    },
    onEditProperties(item: any): void {
      this.selectedItem = cloneDeep(item);
      this.showItemProperties = true;
    },
    onCloseEditProperties(): void {
      this.showItemProperties = false;
      this.selectedItem = {};
    },
    onEditPropertiesById(itemId: any): void {
      let _item = this.scenarioMessages.find((obj) => obj.dataId === itemId);
      if (_item) {
        this.selectedItem = _item;
        this.showItemProperties = true;
      }
    },
    onEditUserText(item: any): void {
      this.selectedItem = item;
      this.showUserTextEdit = true;
    },
    onExportFinishSuccess(): void {
      //this.showScenarioVersion = true;
      this.exportFinishSuccess(false);
    },
    openCompositeMessage(): void {
      this.showCompositeMessage = true;
    },
    openZipCodeCSVUploader(): void {
      this.isLocationCSV = true;
      this.showImportTalk = true;
    },
    typeTitle(value: any): void {
      return BOT_ITEM_TYPES[value] ? BOT_ITEM_TYPES[value].text : "";
    },
    save(result: any, originalInput: any): void {
      const payload = {
        dataId: result.dataId,
        userInput: result.userInput,
        textMappingData: this.scenarioTextMap,
        talkName: this.getTalkNameFromId,
      };

      //Replace the existing userMessage in talks if editing over
      let existingTalkChange = false;
      const userMessageEdit = cloneDeep(this.userMessages);
      this.scenarioTalks.forEach((talk) => {
        talk.params.messages.forEach((msg) => {
          if (
              this.userMessages.params &&
              msg.messageId in this.userMessages.params &&
              originalInput.includes(this.userMessages.params[msg.messageId].params.text)
          ) {
            existingTalkChange = true;
            const indexOfNewValue = originalInput.indexOf(this.userMessages.params[msg.messageId].params.text);
            if (indexOfNewValue !== -1 && !(indexOfNewValue >= result.userInput.length)) {
              userMessageEdit.params[msg.messageId].params.text = result.userInput[indexOfNewValue];
            }
          }
        });
      });
      if (existingTalkChange) {
        payload["userMessages"] = userMessageEdit;
        this.$store.commit(SET_USER_MESSAGES, userMessageEdit);
      }

      this.updateTextMapping(payload);
    },
    selectTalk(talk: any): any {
      if (talk) {
        const result = this.scenarioTalks.filter((obj) => {
          return obj.params.name === talk;
        });
        this.isVisible = this.getTalkDataIdFromId === "TRASH_SEPARATION_TALK";
        this.fmVisible = !(this.getTalkDataIdFromId === "DAMAGE_REPORT_TALK" || this.getTalkDataIdFromId === "TRASH_SEPARATION_TALK");
        this.csvVisible = this.getTalkDataIdFromId === "DAMAGE_REPORT_TALK";

        const talkValue = result[0];
        const listOfIds = [];
        talkValue.params.messages.forEach((message) => {
          if (message.sender === "BOT") {
            listOfIds.push(message.messageId);
          }
        });
        this.displayScenarioMessages.forEach((message) => {
          if ("talk" in message && message.talk === talk) {
            listOfIds.push(message.dataId);
          }
        });
        this.tableItems = this.displayScenarioMessages.filter((message) => {
          return listOfIds.includes(message.dataId);
        });
      } else {
        this.tableItems = this.displayScenarioMessages;
      }
    },
    createSpecialScenarios(talk: any): void {
      const payload = cloneDeep(this.basicPayload);
      payload.talkName = talk;
      switch (talk) {
        case "ゴミ分別":
          this.showSpecialTalk = false;
          this.isLocationCSV = false;
          this.showImportTalk = true;
          break;
        default:
          this.createScenarioTalk(payload);
          break;
      }
      this.setScenarioSpecialTalkData(talk, true);
    },
    toggleSpecialScenarios(talk: any): void {
      const value = this.activeScenario["versions"][this.versionId]["specialTalks"][SPECIAL_TALK_TYPES_MAPPING[talk]];
      this.setScenarioSpecialTalkData(talk, !value);
    },
    deleteSpecialScenarios(talk: any): void {
      if (talk === this.selectedTalk) {
        this.selectedTalk = null;
        this.selectTalk(null);
      }
      const payload = cloneDeep(this.basicPayload);
      payload["specialTalkName"] = talk;
      this.$dialog.show({
        title: "特別なシナリオトーク削除確認",
        text: "この特別なシナリオトークを削除してもよろしいですか？",
        type: "error",
        btnConfirmTitle: "はい",
        onConfirm: async () => {
          this.deleteMessagesForSpecialScenario(payload);
          this.setScenarioSpecialTalkData(talk, false);
          if (talk === "ゴミ分別") this.isVisible = false;
        },
      });
    },
    setScenarioSpecialTalkData(talk: any, valueToSet: any): void {
      const talkName = SPECIAL_TALK_TYPES_MAPPING[talk];
      const scenarioDataToSave = cloneDeep(this.activeScenario);
      if (talkName != null) {
        if ("specialTalks" in this.activeScenario["versions"][this.versionId]) {
          scenarioDataToSave["versions"][this.versionId]["specialTalks"][talkName] = valueToSet;
        } else {
          const data = {};
          data[talkName] = valueToSet;
          scenarioDataToSave["versions"][this.versionId]["specialTalks"] = data;
        }
        this.updateActiveScenario(scenarioDataToSave);
      }
    },
    exportTrashCSV(): void {
      this.showLoadingExport = true;
      if (this.getTalkDataById.params?.path) {
        var filename = this.getTalkDataById.params?.path.replace(/.*\//, "");
        var url = this.getTalkDataById.params?.path.replace(filename, "");
        const link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("download", filename);
        link.href = this.getTalkDataById.params?.path;
        link.click();
        this.$emit("onExportFinishSuccess");
        this.showLoadingExport = false;
      }
    },
    filterTableItems(): void {
      this.loadingMessageSearch = true;

      const {
        messageName,
        userInput,
        text,
        messageType,
      } = this.searchCriteriaLocal || {};

      let results = [...this.tableItems];

      if (messageName) {
        results = results.filter((item) => {
          return item.nameLBD.includes(messageName);
        });
      }
      if (userInput) {
        results = results.filter((item) => {
          if (!item.userInput) {
            return false;
          }
          return item.userInput.findIndex((input) => input.includes(userInput)) > -1;
        });
      }
      if (text) {
        results = results.filter((item) => {
          const { params } = item || {};
          const keys = Object.keys(params).filter((key) => key.startsWith("text"));
          for (const key of keys) {
            const value = params[key];
            if (value.includes(text)) {
              return true;
            }
          }
          return false;
        });
      }
      if (messageType) {
        results = results.filter((item) => item.dataType === messageType);
      }
      if (this.localSearchAttribute && this.localSearchKeyword) {
        switch (this.localSearchAttribute) {
          case "name":
            results = results.filter((item) => (item.nameLBD !== null ? (item.nameLBD.search(this.localSearchKeyword) !== -1) : false));
            break
          case "user_input":
            results = results.filter((item) => {
              let check = item.userInput.filter((item) => (item !== null ? (item.search(this.localSearchKeyword) !== -1) : false));
              return check.length > 0
            });
            break
          case "text":
            results = results.filter((item) => {
              const { params } = item || {};
              const keys = Object.keys(params).filter((key) => key.startsWith("text"));
              for (const key of keys) {
                const value = params[key];
                if (value.includes(this.localSearchKeyword)) {
                  return true;
                }
              }
              return false;
            });
            break
          case "type":
            results = results.filter((item) => (this.localSearchKeyword === 'all') || (item.dataType === this.localSearchKeyword));
            break
        }
      }
      this.filteredTableItems = results;

      this.loadingMessageSearch = false;
    },
    checkTextComponentSearchMatch(item: any, textProperty: any): any {
      return (
          item.params &&
          item.params[textProperty] &&
          item.params[textProperty].toLowerCase().includes(this.searchContentsPhraseLowercase)
      );
    },
    checkNameLBDSearchMatch(item: any): any {
      return item.nameLBD && item.nameLBD.toLowerCase().includes(this.searchContentsPhraseLowercase);
    },
    checkActionComponentSearchMatch(action: any): any {
      return action && action.label && action.label.toLowerCase().includes(this.searchContentsPhraseLowercase);
    },
    checkButtonActionsSearchMatch(item: any): boolean {
      let actionsMatch = false;
      if (item.params && item.params.actionCount) {
        for (let index = 0; index < item.params.actionCount; index++) {
          const tempAction = item.params["actions." + index];
          if (this.checkActionComponentSearchMatch(tempAction)) {
            actionsMatch = true;
            break;
          }
        }
      }
      return actionsMatch;
    },
    checkCarouselActionsSearchMatch(item: any): boolean {
      let actionsMatch = false;
      if (item.params && item.params.columnCount && item.params.actionCount) {
        const columnCount = item.params.columnCount;
        const actionCount = item.params.actionCount;
        for (let j = 0; j < columnCount; j++) {
          if (actionsMatch) {
            break;
          } else {
            for (let k = 0; k < actionCount; k++) {
              const tempAction = item.params["action." + j + "." + k];
              if (this.checkActionComponentSearchMatch(tempAction)) {
                actionsMatch = true;
                break;
              }
            }
          }
        }
      }
      return actionsMatch;
    },
    checkBubbleFlexSearchMatch(item: any): boolean {
      let foundInBody = false;
      if (item.params && item.params.body) {
        if (item.params.body.contents) {
          for (let index = 0; index < item.params.body.contents.length; index++) {
            foundInBody = this.componentSearchMatch(item.params.body.contents[index]);
            if (foundInBody) {
              break;
            }
          }
        }
      }
      let foundInHeader = false;
      if (item.params && item.params.header) {
        if (item.params.header.contents) {
          for (let index = 0; index < item.params.header.contents.length; index++) {
            foundInHeader = this.componentSearchMatch(item.params.header.contents[index]);
            if (foundInHeader) {
              break;
            }
          }
        }
      }
      let foundInFooter = false;
      if (item.params && item.params.footer) {
        if (item.params.footer.contents) {
          for (let index = 0; index < item.params.footer.contents.length; index++) {
            foundInFooter = this.componentSearchMatch(item.params.footer.contents[index]);
            if (foundInFooter) {
              break;
            }
          }
        }
      }
      return foundInBody || foundInHeader || foundInFooter;
    },
    componentContentsSearchMatch(contents: any): boolean {
      let tempResult = false;
      for (let index = 0; index < contents.length; index++) {
        if (this.componentSearchMatch(contents[index])) {
          tempResult = true;
          break;
        }
      }
      return tempResult;
    },
    componentSearchMatch(component: any): any {
      if (!component.type) {
        return false;
      }
      if (component.type === "span") {
        return component.text && component.text.toLowerCase().includes(this.searchContentsPhraseLowercase);
      } else if (component.type === "button") {
        return this.checkActionComponentSearchMatch(component.action);
      } else if (component.type === "text") {
        if (component.text && component.text.toLowerCase().includes(this.searchContentsPhraseLowercase)) {
          return true;
        } else if (component.contents) {
          return this.componentContentsSearchMatch(component.contents);
        }
      } else if (component.contents) {
        return this.componentContentsSearchMatch(component.contents);
      } else {
        return false;
      }
    },
    checkCarouselTextSearchMatch(item: any): boolean {
      let foundMatch = false;
      if (item.params) {
        for (let index = 0; index < item.params.columnCount; index++) {
          if (
              item.params["text." + index] &&
              item.params["text." + index].toLowerCase().includes(this.searchContentsPhraseLowercase)
          ) {
            foundMatch = true;
            break;
          }
        }
      }
      return foundMatch;
    },
    checkCarouselTitleSearchMatch(item: any): boolean {
      let foundMatch = false;
      if (item.params && item.params.useTitle) {
        for (let index = 0; index < item.params.columnCount; index++) {
          if (
              item.params["title." + index] &&
              item.params["title." + index].toLowerCase().includes(this.searchContentsPhraseLowercase)
          ) {
            foundMatch = true;
            break;
          }
        }
      }
      return foundMatch;
    },
    openZipCodeList(): void {
      this.showZipCodeModal = true;
      //other data to be added
    },
    disableDeleteButton(): any {
      if (this.tableSelected.length === 0) {
        return true;
      }

      return this.tableSelected.some((modelLocal) => {
        //Check for message being part of special scenario talk
        if (modelLocal.params && "specialScenarioTalk" in modelLocal.params) {
          if (!("userCreatedSpecialTalkComposite" in this.modelLocal.params)) {
            return true;
          }
        }

        //Check for message in other composite messages
        let modelInCompositeMessage = false;
        this.scenarioMessages.forEach((msg) => {
          if (msg.dataType === "compositeMessage") {
            msg.messages.forEach((dataId) => {
              if (modelLocal.dataId === dataId) {
                modelInCompositeMessage = true;
              }
            });
          }
        });
        return modelInCompositeMessage;
      });
    },
    async onDeleteItem(): Promise<void> {
      this.setIsSavingActiveScenario(true);
      try {
        let text = []
        for (const modelLocal of this.tableSelected) {
          const payload = {
            dataId: modelLocal.dataId,
            dataType: modelLocal.dataType,
            scenarioId: this.scenarioId,
            versionId: this.versionId,
            id: modelLocal.id,
            itemParams: modelLocal.params,
          };
          text.push(modelLocal.nameLBD || 'メッセージ名未設定')
          await this.deleteScenarioMessage(payload);

          // Update text mapping
          modelLocal.userInput = [];
          await this.updateTextMapping({
            ...modelLocal,
            textMappingData: this.scenarioTextMap
          });
        }
        this.showDeleteModal = false;
        let textDelete = text.join(" と ")
        this.$snackbar.show({ text: `"${textDelete}"を削除しました。`, type: "success" });
      } finally {
        this.setIsSavingActiveScenario(false);
      }
    },
    async updateTalkName(newTalkName: any): Promise<void> {
      this.setIsSavingActiveScenario(true);
      try {
        let response = await this.updateScenarioTalkName({
          scenarioId: this.$route.params.scenarioId,
          versionId: this.$route.params.versionId,
          talkObject: this.scenarioTalks.find((talk) =>
            talk.params && talk.params.name === this.getTalkNameFromId
          ),
          newTalkName: newTalkName,
        });
        if (response) {
          this.selectedTalk = newTalkName;
        }
        this.$snackbar.show({ text: `トーク名を更新しました。` });
      } finally {
        this.setIsSavingActiveScenario(false);
      }
    },
    async setUpTalkData(): Promise<void> {
      await this.getDataForDetails(this.basicPayload);

      this.selectedTalk = this.getTalkNameFromId;
      this.selectTalk(this.getTalkNameFromId);
    },
    async handleSearch() {
      this.filterTableItems()
    },
    handleClearAllSearchCriteria(): void {
      this.localSearchAttribute = ""
      this.localSearchKeyword = ""
      this.handleSearch()
    },
  },
  created() {
    this.scenarioId = this.$route.params.scenarioId;
    this.versionId = this.$route.params.versionId;
    this.basicPayload = {
      scenarioId: this.$route.params.scenarioId,
      versionId: this.$route.params.versionId,
    };
    this.displayTalkOptions = this.talkOptions();
    this.searchCriteriaLocal = this.searchCriteria;

    if (!this.activeScenario.scenarioId) {
      this.$store.dispatch(FETCH_ALL_SCENARIOS);
    }
    if (!this.activeScenarioData.activeScenarioId) {
      this.$store.dispatch(FETCH_ACTIVE_SCENARIO_DATA);
    }

    this.setUpTalkData();

    this.fetchZipCodes(this.basicPayload);
  },
});
</script>

<style scoped>
.active-talk-name {
  font-size: 20px;
  font-weight: bold;
}
.active-talk-name.clickable {
  text-decoration: underline;
  cursor: pointer;
}
</style>

<style>
.scenario-table.v-data-table tbody tr {
  height: 64px;
}
</style>
