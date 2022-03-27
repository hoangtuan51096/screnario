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
<template>
  <div class="action-property-area">
    <v-row>
      <v-col cols="6">
        <v-icon @click="expand = !expand">{{ expand ? "mdi-chevron-down" : "mdi-chevron-right" }}</v-icon>
        <label>アクション {{ number }}</label>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="5">
        <span class="text-decoration-underline clickable-action-component" @click="resetAction">リセット</span>
        <v-icon
          @click="firstAction ? false : moveAction(false)"
          :class="!firstAction ? 'clickable-action-component' : 'inactive-action-component'"
          :color="firstAction ? 'grey' : 'lightgrey'">{{ "mdi-arrow-up" }}</v-icon>
        <v-icon
          @click="lastAction? false : moveAction(true)"
          :class="!lastAction ? 'clickable-action-component' : 'inactive-action-component'"
          :color="lastAction ? 'grey' : 'lightgrey'">{{ "mdi-arrow-down" }}</v-icon>
      </v-col>
    </v-row>
    <div v-if="expand">
      <v-row no-gutters v-if="hasArea">
        <v-col cols="3" class="text-right pr-4">
          <label class="grey--text">エリア</label>
        </v-col>
        <v-col cols="9">
          <label>{{ areaString }}</label>
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-3">
        <v-col cols="3" class="text-right pr-4">
          <label class="grey--text pt-2">タイプ</label>
        </v-col>
        <v-col cols="9">
          <v-select
            v-model="action.type"
            :items="actionTypesOptions"
            single-line
            outlined
            hide-details="auto"
            background-color="white"
            dense
            :rules="[rules.validType]"
            :disabled="(premadeMessage != null || of == 'richmenu') && !overrideDisable"
          ></v-select>
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-3" v-if="of != 'imagemap'">
        <v-col cols="3" class="text-right pr-4">
          <label class="grey--text pt-2">ラベル</label>
        </v-col>
        <v-col cols="9">
          <v-text-field
            outlined
            hide-details="auto"
            background-color="white"
            single-line
            v-model="action.label"
            :disabled="((premadeMessage != null && action.type != 'postback') || of == 'richmenu') && !overrideDisable"
            dense
            :rules="[rules.validTextLength, rules.validTextChar]"
            @input="validate($event, 'label')"
          />
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-3" v-if="['message', 'postback'].includes(action.type)">
        <v-col cols="3" class="text-right pr-4">
          <label class="grey--text pt-2">テキスト</label>
        </v-col>
        <v-col cols="9">
          <v-text-field
            outlined
            hide-details="auto"
            background-color="white"
            single-line
            v-model="action.text"
            :disabled="((premadeMessage != null && action.type != 'postback') || of == 'richmenu') && !overrideDisable"
            dense
            :rules="[rules.validTextLength, rules.validTextChar]"
            @input="validate($event, 'text')"
          />
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-3" v-if="['uri'].includes(action.type)">
        <v-col cols="3" class="text-right pr-4">
          <label class="grey--text pt-2">URL</label>
        </v-col>
        <v-col cols="9">
          <v-text-field
            outlined
            hide-details="auto"
            background-color="white"
            single-line
            v-model="action.uri"
            :disabled="(premadeMessage != null || of == 'richmenu') && !overrideDisable"
            dense
            :rules="[rules.validTextLength, rules.validTextChar, rules.validUrl]"
            @input="validate($event, 'uri')"
          />
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-3" v-if="['postback'].includes(action.type)">
        <v-col cols="3" class="text-right pr-4">
          <label class="grey--text pt-2">データ</label>
        </v-col>
        <v-col cols="9">
          <v-combobox
            class="dataId_input"
            v-model="postbackData"
            :items="postBackIdOptions"
            item-value="dataId"
            item-text="dataId"
            :filter="postBackDataFilter"
            :return-object="false"
            outlined
            hide-details="auto"
            background-color="white"
            dense
            clearable
            :disabled="(of == 'richmenu') && !overrideDisable"
            :persistent-hint="true"
            :hint="specialTalk ? '' : '未指定の場合は後続アクションのメッセージIDを自動的に設定します'"
            @update:search-input="onChangePostbackData"
            @input="validate($event, 'data')"
          >
            <template slot="item" slot-scope="data">
              {{ data.item.name }}
              <span v-if="data.item.name"> ｜ </span>
              {{ data.item.userInput }}
              <span v-if="data.item.userInput"> ｜ </span>
              {{ data.item.textPreview }}
              <span v-if="data.item.textPreview"> ｜ </span>
              {{ data.item.msgType }}
            </template>
          </v-combobox>
        </v-col>
        <template v-if="showCategory">
          <v-col cols="12">
            <v-checkbox
                class="category-checkbox"
                label="カテゴリを使用する"
                value="user_comment_msg_id"
                v-model="specialCategory"
            />
          </v-col>
            <template v-if="specialCategory === 'user_comment_msg_id'">
              <v-col cols="3" class="text-right pr-4">
                <label class="grey--text pt-2">名前</label>
              </v-col>
              <v-col cols="9">
                <v-text-field
                    outlined
                    hide-details="auto"
                    background-color="white"
                    single-line
                    dense
                    v-model="categoryName"
                    :rules="[rules.validTextLength, rules.validCategory]"
                    :error="!rules.validTextLength(categoryName) || !rules.validCategory(categoryName)"
                />
              </v-col>
            </template>
          <v-col cols="12">
            <v-checkbox
                class="category-checkbox"
                label="サブカテゴリを使用する"
                value="sub_category_msg_id"
                v-model="specialCategory"
            />
          </v-col>
          <template v-if="specialCategory === 'sub_category_msg_id'">
            <v-col cols="3" class="text-right pr-4">
              <label class="grey--text pt-2">名前</label>
            </v-col>
            <v-col cols="9">
              <v-text-field
                  outlined
                  hide-details="auto"
                  background-color="white"
                  single-line
                  dense
                  v-model="subCategoryName"
                  :rules="[rules.validTextLength, rules.validCategory]"
                  :error="!rules.validTextLength(subCategoryName) || !rules.validCategory(subCategoryName)"
              />
            </v-col>
          </template>
        </template>
      </v-row>
      <v-row no-gutters class="mb-3" v-if="['datetimepicker'].includes(action.type)">
        <v-col cols="3" class="text-right pr-4">
          <label class="grey--text pt-2">データ</label>
        </v-col>
        <v-col cols="9">
          <v-text-field
            outlined
            hide-details="auto"
            background-color="white"
            single-line
            v-model="action.data"
            dense
            :disabled="(premadeMessage != null || of == 'richmenu') && !overrideDisable"
            :rules="[rules.validTextLength, rules.validTextChar]"
            @input="validate($event, 'data')"
          />
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-3" v-if="['datetimepicker'].includes(action.type)">
        <v-col cols="3" class="text-right pr-4">
          <label class="grey--text pt-2">モード</label>
        </v-col>
        <v-col cols="9">
          <v-select
            v-model="action.mode"
            :items="datetimePickerOptions"
            single-line
            outlined
            hide-details="auto"
            background-color="white"
            dense
            :disabled="(premadeMessage != null || of == 'richmenu') && !overrideDisable"
          ></v-select>
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-3" v-if="['webapp'].includes(action.type)">
        <v-col cols="3" class="text-right pr-4">
          <label class="grey--text pt-2">Webアプリ</label>
        </v-col>
        <v-col cols="9">
          <v-text-field
            outlined
            hide-details="auto"
            background-color="white"
            single-line
            v-model="action.webapp"
            dense
            :disabled="(premadeMessage != null || of == 'richmenu') && !overrideDisable"
            :rules="[rules.validTextLength, rules.validTextChar]"
            @input="validate($event, 'webapp')"
          />
        </v-col>
      </v-row>
      <template v-for="datetimeType in datetimeTypes">
        <div :key="datetimeType" v-if="['datetimepicker'].includes(action.type) && action[datetimeType]">
          <DatetimeProperty
            :type="datetimeType"
            :mode="action.mode"
            :disabledPremade="(premadeMessage != null || of == 'richmenu') && !overrideDisable"
            :value="action[datetimeType]"
            @updateDateTime="updateDateTime"
            :key="componentId"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import { mapState } from "vuex";
import { cloneDeep } from "lodash";
import { BOT_ITEM_TYPES, ALLOW_FREE_ACTION_CHANGE } from "@/store/modules/scenarios/scenarios.constants";
import DatetimeProperty from "./DatetimeProperty.vue";

export default Vue.extend({
  props: {
    of: String,
    action: Object,
    number: Number,
    hasArea: Boolean,
    isLimitTypes: Boolean,
    isValidAction: Boolean,
    premadeMessage: {
      type: String,
      default: null,
    },
    firstAction: {
      type: Boolean,
      default: false,
    },
    lastAction: {
      type: Boolean,
      default: false,
    },
    specialTalk: Boolean,
    botMessages: Array,
    dataId: String,
  },
  components: { DatetimeProperty },
  data() {
    return {
      actionTypes: [
        {
          showIf: ["richmenu", "template", "imagemap"],
          text: "メッセージアクション",
          value: "message",
        },
        {
          showIf: ["richmenu", "template", "imagemap"],
          text: "URIアクション",
          value: "uri",
        },
        {
          showIf: ["richmenu", "template"],
          text: "ポストバックアクション",
          value: "postback",
        },
        {
          showIf: [],
          text: "ウェブアプリアクション",
          value: "webapp",
        },
        {
          showIf: [() => ({ showIf: ["richmenu", "template"], filterType: "datetimepicker" })],
          text: "日時ピッカーアクション",
          value: "datetimepicker",
        },
      ],
      datetimePickerOptions: [
        { text: "日時", value: "datetime" },
        { text: "日付", value: "date" },
        { text: "時間", value: "time" },
      ],
      datetimeTypes: ["initial", "max", "min"],
      componentId: 0,
      rules: {
        validType: (value) => value !== undefined,
        validTextLength: (value) => (typeof value !== "undefined" && value && value.length > 0) || "必須",
        validTextChar: (value) => {
          if (typeof value !== "undefined" && value) {
            for (var ch of value) {
              if (ch !== "\n" && ch !== " " && ch !== "　") {
                return true;
              }
            }
          }
          return "空白または改行のみは保存出来ません";
        },
        validUrl: (value) => {
          return (
            (typeof value !== "undefined" && (value.startsWith("https://") || value.startsWith("http://"))) ||
            "URLはhttp/https型しか対応出来ません"
          );
        },
        validCategory: (value) => {
          if (value.includes('&') || value.includes('=')) {
            return "'&' と '=' は使用できません";
          }
          return true;
        }
      },
      textSections: ["text", "webapp", "uri", "label"],
      isValidText: {
        text: true,
        webapp: true,
        uri: true,
        label: true,
      },
      urlSections: ["uri"],
      isValidUrl: {
        uri: true,
      },
      specialCategory: '',
      showCategory: false,
      categoryName: '',
      subCategoryName: '',
      postbackData: '',
      expand: true,
      originalAction: null,
      updatingCategory: false,
    };
  },
  watch: {
    botMessages(value) {
      this.botMessages = value;
    },
    premadeMessage() {
      this.messageItems = this.postBackIdOptions;
    },
    "action.type": {
      deep: true,
      handler(val) {
        for (const section of this.textSections) {
          this.isValidText[section] = true;
        }
        for (const section of this.urlSections) {
          this.isValidUrl[section] = true;
        }
        switch (val) {
          case "datetimepicker":
            if (!this.action["mode"]) {
              Vue.set(this.action, "mode", "datetime");
              this.datetimeTypes.forEach((type) => {
                if (!this.action[type]) {
                  this.action[type] = moment().format("YYYY-MM-DDTHH:mm").toString();
                }
              });
            }
            this.isValidText["label"] = this.validateText(this.action.label);
            this.isValidText["data"] = this.validateText(this.action.data);
            break;
          case "message":
            if (!this.hasArea) {
              this.isValidText["label"] = this.validateText(this.action.label);
            }
            this.isValidText["text"] = this.validateText(this.action.text);
            break;
          case "uri":
            if (!this.hasArea) {
              this.isValidText["label"] = this.validateText(this.action.label);
            }
            this.isValidText["uri"] = this.validateText(this.action.label);

            this.isValidUrl["uri"] = this.validateUrl(this.action.uri);
            break;
          case "postback":
            if (this.originalAction.type !== this.action.type) {
              this.action.data = "";
            }
            this.isValidText["label"] = this.validateText(this.action.label);
            this.isValidText["text"] = this.validateText(this.action.text);
            this.isValidText["data"] = this.validateText(this.action.data);
            break;
          case "webapp":
            if (!this.hasArea) {
              this.isValidText["label"] = this.validateText(this.action.label);
            }
            this.isValidText["webapp"] = this.validateText(this.action.webapp);
            break;
          default:
            break;
        }
        this.reportValidation();
      },
    },
    "action.mode": {
      deep: true,
      immediate: true,
      handler(val) {
        switch (val) {
          case "datetime":
            this.datetimeTypes.forEach((type) => {
              if (!this.action[type] || !this.action[type].includes("T")) {
                this.action[type] = moment().format("YYYY-MM-DDTHH:mm");
              }
              this.action[type] = moment(this.action[type]).format("YYYY-MM-DDTHH:mm");
            });
            break;
          case "date":
            this.datetimeTypes.forEach((type) => {
              if (!this.action[type] || moment(this.action[type]).format("YYYY-MM-DD") === "Invalid date") {
                this.action[type] = moment().format("YYYY-MM-DD");
              }
              this.action[type] = moment(this.action[type]).format("YYYY-MM-DD");
            });
            break;
          case "time":
            this.datetimeTypes.forEach((type) => {
              if (
                !this.action[type] ||
                moment(this.action[type]).format("HH:mm") === "00:00" ||
                this.action[type].includes("T")
              ) {
                this.action[type] = moment().format("HH:mm");
              }
            });
            break;
          default:
            break;
        }
      },
    },
    "action.data": {
      deep: true,
      immediate: true,
      handler(val) {
        if (this.postbackData !== val) {
          this.postbackData = val;
        }
      }
    },
    displayMessages(value) {
      if (value) {
        this.messageItems = this.postBackIdOptions;
      }
    },
    isValidAction(val) {
      if (val) {
        for (const section of this.textSections) {
          this.isValidText[section] = true;
        }
        for (const section of this.urlSections) {
          this.isValidUrl[section] = true;
        }
      }
    },
    dataId(val) {
      this.showCategory = this.specialTalk && this.isDamageReport && val.dataId === 'CATEGORY_NORMAL_BUTTON';
    },
    postbackData(val) {
      this.action.data = val;
      this.reportValidation();
    },
    categoryName() {
      this.onChangePostbackData(this.postbackData);
      this.updatingCategory = true;
    },
    subCategoryName() {
      this.onChangePostbackData(this.postbackData);
      this.updatingCategory = true;
    },
    specialCategory() {
      this.onChangePostbackData(this.postbackData);
      this.updatingCategory = true;
    }
  },
  computed: {
    ...mapState({
      scenarioMindmap: (state) => (state).scenarios.scenarioMindmap,
      scenarioMessages: (state) => (state).scenarios.scenarioMessages,
      displayMessages: (state) => (state).scenarios.displayMessages,
      scenarioTalks: (state) => (state).scenarios.scenarioTalks,
    }),
    versionId() {
      return this.$route.params.versionId;
    },
    isDamageReport() {
      const talk = this.scenarioTalks.find((elem) =>
        elem.params && elem.params.name === this.$route.params.talkName
      )
      return talk && talk.dataId === 'DAMAGE_REPORT_TALK';
    },
    messageItems() {
      return this.botMessages;
    },
    postBackIdOptions() {
      var messagesToDisplay = [];
      // NOTE: 下のコメントアウトを外すとトーク全体のアクションが表示されるようになる
      // if(this.displayMessages){
      //   this.displayMessages.forEach(msg => {
      //     if(this.premadeMessage && "params" in msg && "specialScenarioTalk" in msg.params
      //       && msg.params["specialScenarioTalk"] == this.premadeMessage){
      //       messagesToDisplay.push({
      //         dataId: msg.dataId,
      //         name: msg.nameLBD? msg.nameLBD : "",
      //         userInput: msg.userInput? msg.userInput : "",
      //         textPreview: msg.dataType === "text"? msg.previewValue : "",
      //         msgType: this.typeTitle(msg.dataType)
      //       });
      //     }
      //     else if(!("params" in msg && "specialScenarioTalk" in msg.params) && !this.premadeMessage && msg.dataType != "richmenu" && msg.dataType !== "__INITIAL__"){
      //       messagesToDisplay.push({
      //         dataId: msg.dataId,
      //         name: msg.nameLBD? msg.nameLBD : "",
      //         userInput: msg.userInput? msg.userInput : "",
      //         textPreview: msg.dataType === "text"? msg.previewValue : "",
      //         msgType: this.typeTitle(msg.dataType)
      //       });
      //     }
      //   });
      // }
      console.log("this.botMessages:", this.botMessages);
      if (this.botMessages) {
        this.botMessages.forEach((msg) => {
          if (!messagesToDisplay.find((m) => m.dataId === msg.dataId) && msg.dataType !== "__INITIAL__") {
            messagesToDisplay.push({
              ...msg,
              name: msg.nameLBD || "",
              textPreview: msg.dataType === "text" ? msg.previewValue : "",
              msgType: this.typeTitle(msg.dataType),
            });
          }
        });
      }
      console.log("messagesToDisplay:", messagesToDisplay);
      return messagesToDisplay;
    },
    actionTypesOptions() {
      console.log("this.scenarioMessages", this.scenarioMessages);
      console.log("this.scenarioMindmap[this.versionId]", this.scenarioMindmap[this.versionId]);
      const result = this.actionTypes.filter(
        (obj) =>
          obj.showIf.filter((item) => typeof item === "string").includes(this.of) ||
          !!obj.showIf
            .filter((item) => typeof item === "function")
            .find(
              (item) =>
                item().showIf.includes(this.of) &&
                this.scenarioMessages
                  .map((msg) => msg.params)
                  .filter((params) => !!params)
                  .filter((params) => params.actionCount || params.actionLeft || params.actionRight)
                  .find(
                    (params) =>
                      !!(
                        (params.actionCount &&
                          [...Array(params.actionCount).keys()]
                            .map((i) => params[`actions.${i}`])
                            .flat()
                            .filter((action) => !!action)
                            .map((action) => action.type)
                            .includes(item().filterType)) ||
                        (params.actionLeft && params.actionLeft.type === item().filterType)
                      ) ||
                      (params.actionRight && params.actionRight.type === item().filterType)
                  )
            )
      );
      console.log("result", result);
      return result;
    },
    areaString() {
      return `x=${this.action.x},
              y=${this.action.y},
              横=${this.action.width},
              縦=${this.action.height}`;
    },
    datetimeTypeStyle() {
      return `grey--text ${this.action.mode === "datetime" ? "pt-8" : "pt-2"}`;
    },
    overrideDisable() {
      return ALLOW_FREE_ACTION_CHANGE.includes(this.dataId);
    }
  },
  methods: {
    updateDateTime({ type, value }) {
      console.log("updating datetime");
      if (this.action["mode"] === "date") {
        this.action[type] = value.date;
      } else if (this.action["mode"] === "time") {
        this.action[type] = value.time;
      } else {
        var valueToReplace = this.action[type];
        this.action[type] = value.date
          ? value.date + "T" + valueToReplace.split("T")[1]
          : valueToReplace.split("T")[0] + "T" + value.time;
      }
      this.forceRender();
    },
    typeTitle(value) {
      return BOT_ITEM_TYPES[value] ? BOT_ITEM_TYPES[value].text : "";
    },
    forceRender() {
      this.componentId++;
    },
    postBackDataFilter(item , queryText , itemText) {
      console.log("postBackDataFilter:", item);
      return (
        (item.name && item.name.toLowerCase().includes(queryText.toLowerCase())) ||
        (item.userInput &&
          item.userInput.map((userInput) => userInput.toLowerCase()).includes(queryText.toLowerCase())) ||
        (item.textPreview && item.textPreview.toLowerCase().includes(queryText.toLowerCase())) ||
        (item.msgType && item.msgType.toLowerCase().includes(queryText.toLowerCase()))
      );
    },
    validate(event , keyValue) {
      if (this.textSections.includes(keyValue)) {
        this.isValidText[keyValue] = this.validateText(event);
      }
      if (this.urlSections.includes(keyValue)) {
        this.isValidUrl[keyValue] = this.validateUrl(event);
      }
      this.reportValidation();
    },
    reportValidation() {
      for (const section of this.textSections) {
        if (!this.isValidText[section]) {
          this.$emit("validateAction", false);
          return;
        }
      }
      for (const section of this.urlSections) {
        if (!this.isValidUrl[section]) {
          this.$emit("validateAction", false);
          return;
        }
      }
      switch (this.specialCategory) {
        case 'user_comment_msg_id':
          if (this.categoryName === '') {
            this.$emit("validateAction", false);
            return;
          }
          break;
        case 'sub_category_msg_id':
          if (this.subCategoryName === '') {
            this.$emit("validateAction", false);
            return;
          }
          break;
      }
      this.$emit("validateAction", true);
    },
    validateText(value) {
      if (typeof value !== "undefined" && value && value.length > 0) {
        for (var ch of value) {
          if (ch !== "\n" && ch !== " " && ch !== "　") {
            return true;
          }
        }
      }
      return false;
    },
    validateUrl(value) {
      return typeof value !== "undefined" && (value.startsWith("https://") || value.startsWith("http://"));
    },
    onChangePostbackData(value) {
      if (this.updatingCategory) {
        this.updatingCategory = false;
        return;
      }
      this.postbackData = value;
      let nextActionData;
      switch (this.specialCategory) {
        case 'user_comment_msg_id':
          let msgId = value.split('&user_comment_msg_id=')[1]
          if (msgId === undefined){
            let tempList = value.split('=');
            msgId = tempList[tempList.length - 1];
          }
          nextActionData = `category=${this.categoryName}&user_comment_msg_id=${msgId ? msgId : value}`
          break;
        case 'sub_category_msg_id':
          let subId = value.split('&sub_category_msg_id=')[1]
          if (subId === undefined){
            let tempSubList = value.split('=');
            subId = tempSubList[tempSubList.length - 1];
          }
          nextActionData = `category=${this.subCategoryName}&sub_category_msg_id=${subId ? subId : value}`
          break;
        default:
          nextActionData = value;
          break;
      }
      this.action.data = nextActionData;

      this.reportValidation();
    },
    parsePostbackData(value) {
      if (!this.showCategory || !value.includes('category=')) {
        this.postbackData = value;
        return;
      }

      // NOTE: 損傷報告用拡張postbackペイロードとみなす
      const urlSearchParams = new URLSearchParams(value);
      const { category, user_comment_msg_id, sub_category_msg_id } = Object.fromEntries(urlSearchParams.entries());
      this.postbackData = user_comment_msg_id || sub_category_msg_id;
      if (user_comment_msg_id) {
        this.specialCategory = 'user_comment_msg_id';
        this.categoryName = category;
      }
      if (sub_category_msg_id) {
        this.specialCategory = 'sub_category_msg_id';
        this.subCategoryName = category;
      }
    },
    resetAction() {
      this.$emit("resetAction", this.originalAction);
    },
    moveAction(incrementPosition) {
      this.$emit("moveAction", incrementPosition);
    },
  },
  mounted() {
    this.originalAction = cloneDeep(this.action);
    this.messageItems = this.postBackIdOptions;
    this.showCategory = this.specialTalk && this.isDamageReport && this.dataId === 'CATEGORY_NORMAL_BUTTON';
    this.parsePostbackData(this.action.data);
  },
});
</script>

<style scoped>
.dataId_input .v-messages__message {
  margin-top: 4px;
}

.category-checkbox label {
  margin-bottom: 0 !important;
}

.action-property-area {
  background-color: #F2F2F2 !important;
  border-radius: 5px !important;
  padding-right: 1em !important;
  margin-bottom: 1em !important;
  padding-bottom: 1em !important;
}

.inactive-action-component {
  cursor: default !important;
}

.clickable-action-component {
  cursor: pointer !important;
}
</style>
