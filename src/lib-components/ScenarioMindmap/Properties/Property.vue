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
 .no-padding-top {
   padding-top: 0 !important;
 }
</style>
<template>
  <v-card :max-width="maxWidthDialog" style="height: 100%; display: flex; flex-direction: row; overflow: hidden">
    <div style="display: flex; align-items: center">
      <div class="drawer-shrink-toggle-icon">
        <v-btn style="min-width: 0; padding: 0 0.5em" text rounded @click="onClickToggleButton()">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>
    <div style="flex: 1; display: flex; height: 100%; flex-direction: column; overflow: hidden">
      <v-toolbar flat style="flex: 0">
        <v-spacer/>
        <v-btn style="margin-right: 1em" outlined color="primary" @click="closeModal"> キャンセル </v-btn>
        <v-btn
          :disabled="hasActionPermission('disableButton', 'ScenarioSettings_ApplyMapAction_Click') || !canSave"
          color="primary"
          @click="
            hasActionPermission('click', 'backendRequest') ? onUpdateItemProperties() : showActionPermissionError()
          "
        >
          適用する
        </v-btn>
      </v-toolbar>
      <div id="drawer-content" style="flex: 1; overflow-y: auto">
        <v-card class="px-3" elevation="0">
          <span>メッセージタイプ</span>
          <v-select
            v-model="modelLocal.dataType"
            :items="actionTypesOptions"
            dense
            hide-details
            item-text="text"
            item-value="value"
            :placeholder="modelLocal.dataType === '__INITIAL__' ? 'メッセージの種類を選択してください' : ''"
            outlined
            single-line
            @change="changeInLocalModelType(modelLocal.dataType)"
          >
            <template v-slot:item="{ item }">
              <v-icon>{{item.icon}}</v-icon> {{item.text}}
            </template>
          </v-select>
        </v-card>
        <v-card-text class="ma-0 px-3 bot-designer-item-properties">
            <label>メッセージID</label>
            <v-row>
              <v-col cols="8" style="padding-top: 0">
                <v-text-field id="message-id"
                  v-model="modelLocal.dataId"
                  dense
                  disabled
                  style="background-color: lightgrey"
                  hide-details
                  outlined
                  readonly
                  single-line>
                </v-text-field>
              </v-col>
              <v-col style="padding-top: 0">
                <v-btn color="primary" @click="copyIdToClipboard">コピー</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <label>メッセージ名</label>
                <InputText
                  id="textNameLBD"
                  v-model="modelLocal.nameLBD"
                  :error="modelLocal.nameLBD === ''"
                  :rules="[rules.validNonEmpty, rules.validTextLength, rules.notStartsWhiteSpace, rules.notEndsWhiteSpace, rules.isValidVersionName]"
                  dense
                  outlined
                  maxlength="120"
                  hide-details="auto"
                  single-line
                  @input="onChangeName($event)"
                  @change="(value) => { this.modelLocal.nameLBD = value }"
                >
                </InputText>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-switch-case :value="modelLocal.dataType">
                  <template #text>
                    <ItemTextMessage
                      :branchIndex="branchIndex"
                      :params="checkMessageType"
                      @updateParams="updateParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #buttons>
                    <ItemButtonTemplate
                      :botMessages="botMessages"
                      :branchIndex="branchIndex"
                      :canSave="canSave"
                      :params="checkMessageType"
                      :specialTalk="isSpecialTalk"
                      @updateParams="updateParams"
                      @updateSaveStatus="updateSaveStatus"
                      :dataId="modelLocal.dataId"
                    />
                  </template>
                  <template #richmenu>
                    <ItemRichMenu
                      :branchIndex="branchIndex"
                      :params="modelLocal.params"
                      :specialTalk="isSpecialTalk"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #imagemap>
                    <ItemImageMapMessage
                      :branchIndex="branchIndex"
                      :canSave="canSave"
                      :params="modelLocal.params"
                      :webAppId="modelLocal.dataId"
                      @fileImageMapDataUpdate="fileImageMapDataUpdate"
                      @updateParams="updateModelParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #sticker>
                    <ItemSticker
                      :branchIndex="branchIndex"
                      :params="modelLocal.params"
                      :webAppId="modelLocal.dataId"
                      @updateParams="updateParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #location>
                    <ItemLocation
                      :branchIndex="branchIndex"
                      :canSave="canSave"
                      :params="modelLocal.params"
                      :webAppId="modelLocal.dataId"
                      @updateParams="updateParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #confirm>
                    <ItemConfirmTemplate
                      :botMessages="botMessages"
                      :branchIndex="branchIndex"
                      :canSave="canSave"
                      :params="checkMessageType"
                      :webAppId="modelLocal.dataId"
                      :specialTalk="isSpecialTalk"
                      @updateParams="updateParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #image>
                    <ItemImage
                      :branchIndex="branchIndex"
                      :canSave="canSave"
                      :params="modelLocal.params"
                      :webAppId="modelLocal.dataId"
                      @fileImageDataUpdate="fileImageDataUpdate"
                      @updateParams="updateParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #audio>
                    <ItemAudio
                      :branchIndex="branchIndex"
                      :canSave="canSave"
                      :params="modelLocal.params"
                      :webAppId="modelLocal.dataId"
                      @fileAudioDataUpdate="fileAudioDataUpdate"
                      @updateParams="updateParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #video>
                    <ItemVideo
                      :branchIndex="branchIndex"
                      :canSave="canSave"
                      :params="modelLocal.params"
                      :webAppId="modelLocal.dataId"
                      @fileVideoDataUpdate="fileVideoDataUpdate"
                      @updateParams="updateParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #carousel>
                    <ItemCarouselTemplate
                      :botMessages="botMessages"
                      :branchIndex="branchIndex"
                      :params="modelLocal.params"
                      :webAppId="modelLocal.dataId"
                      :specialTalk="isSpecialTalk"
                      @updateParams="updateParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #compositeMessage>
                    <ItemCompositeMessage
                      :branchIndex="branchIndex"
                      :params="modelLocal"
                      :messagesToDisplay="botMessages"
                      @updateMessages="updateMessages"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #bubbleFlex>
                    <ItemBubbleFlex
                      :branchIndex="branchIndex"
                      :params="modelLocal.params"
                      @updateModelParams="updateModelParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #carouselFlex>
                    <ItemCarouselFlex
                      :branchIndex="branchIndex"
                      :params="modelLocal.params"
                      @updateModelBubbles="updateModelBubbles"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #jsonTemplate>
                    <ItemJsonTemplate
                      :branchIndex="branchIndex"
                      :params="modelLocal.params"
                      @updateModelParams="updateModelParams"
                      @updateSaveStatus="updateSaveStatus"
                    />
                  </template>
                  <template #__INITIAL__>
                    <div />
                  </template>
                  <template #default>
                    <div class="my-5 pl-6">{{ modelLocal.dataType }} は未対応です</div>
                  </template>
                </v-switch-case>
              </v-col>
            </v-row>
            <v-row>
              <v-col v-if="!hidePreviewDisplay.includes(modelLocal.dataType)" cols="12">
                <MessagePreview :messages="[previewMessage]" />
              </v-col>
            </v-row>
        </v-card-text>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import { cloneDeep, isEqual } from "lodash";
import { isNullOrEmpty } from "@/utils/stringUtils";
import { DELETE_SCENARIO_MESSAGE, UPDATE_SCENARIO_DATA } from "@/store/action-types";
import { SET_SCENARIO_MINDMAP_MESSAGES } from "@/store/mutation-types";
import { mapActions, mapMutations, mapState } from "vuex";
import VSwitchCase from "../../components/common/VSwitchCase.vue";
import ItemTextMessage from "../../components/BotDesigner/ItemTextMessage.vue";
import ItemImageMapMessage from "../../components/BotDesigner/ItemImageMapMessage.vue";
import ItemRichMenu from "../../components/BotDesigner/ItemRichMenu.vue";
import ItemButtonTemplate from "../../components/BotDesigner/ItemButtonTemplate.vue";
import ItemSticker from "../../components/BotDesigner/ItemSticker.vue";
import ItemLocation from "../../components/BotDesigner/ItemLocation.vue";
import ItemConfirmTemplate from "../../components/BotDesigner/ItemConfirmTemplate.vue";
import ItemImage from "../../components/BotDesigner/ItemImage.vue";
import ItemAudio from "../../components/BotDesigner/ItemAudio.vue";
import ItemVideo from "../../components/BotDesigner/ItemVideo.vue";
import ItemCarouselTemplate from "../../components/BotDesigner/ItemCarouselTemplate.vue";
import ItemCompositeMessage from "../../components/BotDesigner/ItemCompositeMessage.vue";
import MessagePreview from "../../ScenarioSettingsDetail/components/MessagePreview.vue";
import ItemBubbleFlex from "../../components/BotDesigner/ItemBubbleFlex.vue";
import ItemCarouselFlex from "../../components/BotDesigner/ItemCarouselFlex.vue";
import ItemJsonTemplate from "../../components/BotDesigner/ItemJsonTemplate.vue";
import {BOT_ITEM_TYPES, SPECIAL_TALK_TYPES} from "@/store/modules/scenarios/scenarios.constants";
import { default_messages } from "@/constants/default_messages";
import {
  addElementToBubbleFlexPostbackActions,
} from "@/services/MindMapService.ts";
import InputText from "../../components/BotDesigner/InputText.vue";

export default Vue.extend({
  props: {
    model: Object,
    originModel: Object,
    talkName: String,
    scenarioId: String,
    versionId: String,
    onClickToggleButton: Function,
    botMessages: Array,
  },
  data() {
    return {
      modelLocal: null,
      hidePreviewDisplay: ["jsonTemplate", "compositeMessage", "__INITIAL__"],
      originModelLocal: null,
      imageMapFiles: [],
      audioFiles: [],
      imageFiles: [],
      videoFiles: [],
      validLocalState: {},
      childComponentValidation: {},
      rules: {},
      default_messages: default_messages,
      branchIndex: null,
    };
  },
  watch: {
    model(value) {
      this.modelLocal = cloneDeep(value);
    },
    originModel(value) {
      this.originModelLocal = cloneDeep(value);
      this.branchIndex = value.branchIndex;
    },
    botMessages(value) {
      this.botMessages = value;
    },
  },
  components: {
    InputText,
    VSwitchCase,
    ItemTextMessage,
    ItemRichMenu,
    ItemImageMapMessage,
    ItemButtonTemplate,
    ItemSticker,
    ItemLocation,
    ItemConfirmTemplate,
    ItemImage,
    ItemAudio,
    ItemVideo,
    ItemCarouselTemplate,
    ItemCompositeMessage,
    MessagePreview,
    ItemBubbleFlex,
    ItemCarouselFlex,
    ItemJsonTemplate,
  },
  computed: {
    ...mapState({
      activeScenario: (state) => state.scenarios.activeScenario,
      activeScenarioData: (state) => state.scenarios.activeScenarioData,
      scenarioMessages: (state) => state.scenarios.scenarioMessages,
      scenarioMindmap: (state) => state.scenarios.scenarioMindmap,
      scenarioTalks: (state) => state.scenarios.scenarioTalks,
    }),
    maxWidthDialog() {
      if (
        this.modelLocal.dataType == "compositeMessage" ||
        this.modelLocal.dataType == "carouselFlex" ||
        this.modelLocal.dataType == "bubbleFlex"
      ) {
        return 1500;
      }
      return 800;
    },
    actionTypesOptions() {
      // return Object.keys(BOT_ITEM_TYPES);
      return ["text", "imagemap", "buttons", "carousel", "confirm", "bubbleFlex", "compositeMessage"].map((key) => ({
        ...BOT_ITEM_TYPES[key],
        value: key,
      }));
    },
    actionTypesValues() {
      return this.actionTypesOptions.map((option) => BOT_ITEM_TYPES[option]);
    },
    previewMessage() {
      var newModelLocal = this.modelLocal;
      newModelLocal["params"] = this.checkMessageType;
      return newModelLocal;
    },
    checkMessageType() {
      if (this.updatingMessageForceRender) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.updatingMessageForceRender = false;
        return this.modelLocal.params;
      }
      if (this.modelLocal.dataType === this.model.dataType) {
        if (this.modelLocal !== this.originModelLocal) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.modelLocal.params = cloneDeep(this.originModelLocal.params);
        }
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.modelLocal.params = cloneDeep(this.default_messages[this.modelLocal.dataType]);
      }
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.updatingMessageForceRender = false;
      return this.modelLocal.params;
    },
    canSave() {
      if (
        this.modelLocal.params &&
        this.modelLocal.params.thumbnailImageUrl &&
        typeof this.modelLocal.params.thumbnailImageUrl !== "string" &&
        Object.keys(this.modelLocal.params.thumbnailImageUrl).length === 0
      ) {
        // FIXME: thumbnailImageUrlにObjectが渡ってきてしまうからdirtyに直す
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.modelLocal.params.thumbnailImageUrl = "";
      }

      const isSameModel =
        isEqual(this.modelLocal.nameLBD, this.originModelLocal.nameLBD) &&
        isEqual(this.modelLocal.params, this.originModelLocal.params) &&
        isEqual(this.modelLocal.messages, this.originModelLocal.messages);
      if (isSameModel) {
        this.$emit("updateEditState", false);
        return false;
      }

      const isValid =
        !Object.values(this.childComponentValidation[this.modelLocal.dataType] || {}).includes(false) &&
        !Object.values(this.validLocalState || {}).includes(false);
      this.$emit("updateEditState", isValid);
      return isValid;
    },
    isSpecialTalk() {
      return SPECIAL_TALK_TYPES.includes(this.talkName);
    },
    listMessages() {
      const talk = this.botMessages.filter(elem => ((elem.scenario_talk_id === this.talkId) && (elem.id !== this.originModel.id)));
      if (talk.length) {
        return talk.map(data => data.nameLBD)
      }
      return [];
    },
    talkId() {
      const talk = this.scenarioTalks.find(elem => elem.params.name === this.$route.params.talkName);
      return talk ? talk.dataId : '';
    },
  },
  mounted() {
    this.onChangeName(this.modelLocal.nameLBD);
    const input = document.getElementById('textNameLBD');
    input.addEventListener('input', updateValue);

    function updateValue(event) {
      let value = event.target.value;
      event.target.value = value;
    }
  },
  methods: {
    ...mapActions({
      saveScenarioData: UPDATE_SCENARIO_DATA,
      deleteScenarioMessage: DELETE_SCENARIO_MESSAGE,
    }),
    ...mapMutations({
      updateMindMapMessages: SET_SCENARIO_MINDMAP_MESSAGES,
    }),
    copyIdToClipboard() {
      navigator.clipboard.writeText(this.modelLocal.dataId)
        .then(() => { this.$snackbar.show({ text: "クリップボードにコピーしました。" }) })
    },
    disableDeleteButton() {
      //Check for message being part of special scenario talk
      if (this.modelLocal.params && "specialScenarioTalk" in this.modelLocal.params) {
        if (!("userCreatedSpecialTalkComposite" in this.modelLocal.params)) {
          return true;
        }
      }

      //Check for message in other composite messages
      var modelInCompositeMessage = false;
      this.scenarioMessages.forEach((msg) => {
        if (msg.dataType == "compositeMessage") {
          msg.messages.forEach((dataId) => {
            if (this.modelLocal.dataId == dataId) {
              modelInCompositeMessage = true;
            }
          });
        }
      });
      if (modelInCompositeMessage) {
        return true;
      }

      return false;
    },
    closeModal() {
      this.modelLocal = cloneDeep(this.originModelLocal);
      this.updateSaveStatus(false);
      this.$emit("stopProperties", false);
      this.updatingMessageForceRender = false;
    },
    onUpdateItemProperties() {
      const oldState = this.scenarioMindmap[this.versionId][this.talkName];
      const newState = oldState.map((obj) => {
        if (obj.dataId === this.modelLocal.dataId) {
          const newState = {
            ...obj,
            dataType: this.modelLocal.dataType,
            nameLBD: this.modelLocal.nameLBD,
            params: this.modelLocal.params,
          };
          if (newState.dataType === "compositeMessage") {
            newState.messages = this.modelLocal.messages;
          }
          if (newState.dataType === "bubbleFlex") {
            addElementToBubbleFlexPostbackActions(newState.params);
          }
          if (newState.params && newState.params.actionCount) {
            if (newState.dataType === "buttons") {
              for (let i = 0; i < newState.params.actionCount; i++) {
                if (
                  newState.params[`actions.${i}`].type === "postback" &&
                  isNullOrEmpty(newState.params[`actions.${i}`].data)
                ) {
                  newState.params[`actions.${i}`]._shouldSetDataId = true;
                }
              }
            }
            if (newState.dataType === "carousel") {
              for (let j = 0; j < newState.params.columnCount; j++) {
                for (let i = 0; i < newState.params.actionCount; i++) {
                  if (
                    newState.params[`action.${j}.${i}`].type === "postback" &&
                    isNullOrEmpty(newState.params[`action.${j}.${i}`].data)
                  ) {
                    newState.params[`action.${j}.${i}`]._shouldSetDataId = true;
                  }
                }
              }
            }
          }
          if (newState.params && newState.params.actionLeft) {
            if (newState.params.actionLeft.type === "postback" && isNullOrEmpty(newState.params.actionLeft.data)) {
              newState.params.actionLeft._shouldSetDataId = true;
            }
          }
          if (newState.params && newState.params.actionRight) {
            if (newState.params.actionRight.type === "postback" && isNullOrEmpty(newState.params.actionRight.data)) {
              newState.params.actionRight._shouldSetDataId = true;
            }
          }
          delete newState.newMessage;
          return newState;
        } else {
          return obj;
        }
      });
      const payload = {
        versionName: this.versionId,
        valueName: this.talkName,
        value: newState,
      };
      // switch(this.model.dataType){
      //   case("imagemap"):
      //     payload["files"] = this.imageMapFiles;
      //   break;
      //   case("audio"):
      //     payload["files"] = this.audioFiles;
      //   break;
      //   case("image"):
      //     payload["files"] = this.imageFiles;
      //   break;
      //   case("video"):
      //     payload["files"] = this.videoFiles;
      //   break;
      //   default:
      // }
      this.updateMindMapMessages(payload);

      const updatedModel = { ...this.modelLocal };
      delete updatedModel.newMessage;
      this.$emit("updateScenarioMessage", oldState, newState, updatedModel);
      this.$emit("stopProperties", false);
    },
    onDeleteItem() {
      var payload = {
        dataId: this.modelLocal.dataId,
        dataType: this.modelLocal.dataType,
        scenarioId: this.scenarioId,
        versionId: this.versionId,
        itemParams: this.modelLocal.params,
      };
      this.deleteScenarioMessage(payload);

      // Update text mapping
      this.modelLocal.userInput = [];
      this.$emit("updateTextMapping", this.modelLocal);

      this.$emit("close");
    },
    updateModelParams(value) {
      this.modelLocal.params = value;
      this.updatingMessageForceRender = true;
      this.modelLocal.params = value;
    },
    updateModelBubbles(value) {
      this.modelLocal.params.bubbleParam = value;
    },
    updateParams({ key, value }) {
      if (key === "__REPLACE__") {
        this.modelLocal.params = value;
      } else {
        this.modelLocal.params[key] = value;
      }
    },
    updateMessages(value) {
      this.modelLocal.messages = value;
    },
    fileImageMapDataUpdate(value) {
      this.imageMapFiles = value;
    },
    fileAudioDataUpdate(value) {
      this.audioFiles = value;
    },
    fileImageDataUpdate(value) {
      this.imageFiles = value;
    },
    fileVideoDataUpdate(value) {
      this.videoFiles = value;
    },
    updateSaveStatus({ key, value }) {
      if (!this.childComponentValidation[this.modelLocal.dataType]) {
        this.childComponentValidation[this.modelLocal.dataType] = {};
      }

      // NOTE: run computed method
      this.childComponentValidation = {
        ...this.childComponentValidation,
        [this.modelLocal.dataType]: {
          [key]: value,
        },
      };
    },
    onChangeName(event) {
      this.validLocalState.name = ![this.isValidNonEmpty(event), this.isValidTextLength(event)].includes(false);
    },
    isValidNonEmpty(value) {
      if (value === null) {
        return false
      }
      return value.replace(/\n/g, "").replace(/\s/g, "").length !== 0;
    },
    isValidTextLength(value) {
      return value && value.length <= 120;
    },
    changeInLocalModelType(dataType) {
      this.updatingMessageForceRender = false;
      this.$emit("localDataTypeUpdate", dataType);
    },
    onlyNumber($event) {
      if (this.modelLocal.nameLBD.length >= 120) {
        $event.preventDefault()
      }
    }
  },
  created() {
    this.modelLocal = cloneDeep(this.model) || {};
    this.originModelLocal = cloneDeep(this.originModel) || {};

    this.rules = {
      validNonEmpty: (value) => {
        if (this.isValidNonEmpty(value)) {
          return true;
        }
        return "メッセージ名は空白のみは使用できません。";
      },
      validTextLength: (value) => {
        if (this.isValidTextLength(value)) {
          return true;
        }
        return "メッセージ名は120文字以内にしてください。";
      },
      notStartsWhiteSpace: (value) => {
        if (value) {
          return !value.match(/^\s+.*$/) || "先頭に空白を指定することはできません。";
        }
        return true
      },
      notEndsWhiteSpace: (value) => {
        if (value) {
          return !value.match(/^.*?\s+$/) || "末尾に空白を指定することはできません。";
        }
        return true
      },
      isValidVersionName: (value) => {
        return !this.listMessages.includes(value) || "メッセージ名が存在しています。";
      },
    };

    this.branchIndex = (this.originModel && this.originModel.branchIndex) || -1;
  }
});
</script>

<style lang="less">
.bot-designer-item-properties {
  label {
    margin-bottom: 5px;
    display: inline-block;
  }
}
</style>
