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
  <div>
    <v-navigation-drawer
        v-model="show"
        fixed
        hide-overlay
        right
        ref="property-drawer"
        transition="scroll-x-transition"
        :style="`width: calc(${35}% + 38px); z-index: 8`"
    >
    <v-card :max-width="maxWidthDialog" style="height: 100%; display: flex; flex-direction: row; overflow: hidden">
      <div style="display: flex; align-items: center">
        <div class="drawer-shrink-toggle-icon">
          <v-btn style="min-width: 0; padding: 0 0.5em" text rounded @click="onClickOutside">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    <div style="flex: 1; display: flex; height: 100%; flex-direction: column; overflow: hidden">
      <v-toolbar flat style="flex: 0">
        <v-spacer/>
        <v-btn style="margin-right: 1em" outlined color="primary" @click="closeModal"> キャンセル </v-btn>
        <v-btn
          :disabled="!canSave"
          color="primary"
          @click="
            hasActionPermission('click', 'backendRequest') ? onUpdateItemProperties() : showActionPermissionError()
          "
          :style="
            hasActionPermission('hideButton', 'Components_BotDesigner_ItemProperties_Save')
              ? hideButtonPermissionStyle()
              : ''
          "
        >
          適用する
        </v-btn>
      </v-toolbar>
      <div id="drawer-content" style="flex: 1; overflow-y: auto; padding-right: 1em;">
        <label>メッセージID</label>
        <v-row>
          <v-col cols="8" style="padding-top: 0">
            <v-text-field v-model="modelLocal.dataId" outlined single-line hide-details dense disabled style="background-color: lightgrey" >
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
              outlined
              single-line
              dense
              hide-details="auto"
              v-model="modelLocal.nameLBD"
              @input="onChangeName($event)"
              @change="(value) => { this.modelLocal.nameLBD = value }"
              :maxlength="120"
              :rules="[rules.validTextLength, rules.notStartsWhiteSpace, rules.notEndsWhiteSpace, rules.isValidVersionName]"
            >
            </InputText>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-switch-case :value="modelLocal.dataType || ''">
              <template #text>
                <ItemTextMessage
                  :params="modelLocal.params"
                  @updateParams="updateParams"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #buttons>
                <ItemButtonTemplate
                  :params="modelLocal.params"
                  @updateParams="updateParams"
                  :canSave="canSave"
                  :specialTalk="isSpecialTalk"
                  @updateSaveStatus="updateSaveStatus"
                  :dataId="modelLocal.dataId"
                  :botMessages="messages"
                />
              </template>
              <template #richmenu>
                <ItemRichMenu :params="modelLocal.params" @updateSaveStatus="updateSaveStatus" :specialTalk="isSpecialTalk" />
              </template>
              <template #imagemap>
                <ItemImageMapMessage
                  :webAppId="modelLocal.dataId"
                  :params="modelLocal.params"
                  @updateParams="updateModelParams"
                  @fileImageMapDataUpdate="fileImageMapDataUpdate"
                  :canSave="canSave"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #sticker>
                <ItemSticker
                  :webAppId="modelLocal.dataId"
                  :params="modelLocal.params"
                  @updateParams="updateParams"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #location>
                <ItemLocation
                  :webAppId="modelLocal.dataId"
                  :params="modelLocal.params"
                  @updateParams="updateParams"
                  :canSave="canSave"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #confirm>
                <ItemConfirmTemplate
                  :webAppId="modelLocal.dataId"
                  :params="modelLocal.params"
                  @updateParams="updateParams"
                  :canSave="canSave"
                  :specialTalk="isSpecialTalk"
                  @updateSaveStatus="updateSaveStatus"
                  :botMessages="messages"
                />
              </template>
              <template #image>
                <ItemImage
                  :webAppId="modelLocal.dataId"
                  :params="modelLocal.params"
                  @updateParams="updateParams"
                  @fileImageDataUpdate="fileImageDataUpdate"
                  :canSave="canSave"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #audio>
                <ItemAudio
                  :webAppId="modelLocal.dataId"
                  :params="modelLocal.params"
                  @updateParams="updateParams"
                  @fileAudioDataUpdate="fileAudioDataUpdate"
                  :canSave="canSave"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #video>
                <ItemVideo
                  :webAppId="modelLocal.dataId"
                  :params="modelLocal.params"
                  @updateParams="updateParams"
                  @fileVideoDataUpdate="fileVideoDataUpdate"
                  :canSave="canSave"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #carousel>
                <ItemCarouselTemplate
                  :webAppId="modelLocal.dataId"
                  :params="modelLocal.params"
                  @updateParams="updateParams"
                  :show="show"
                  :specialTalk="isSpecialTalk"
                  @updateSaveStatus="updateSaveStatus"
                  :botMessages="messages"
                />
              </template>
              <template #compositeMessage>
                <ItemCompositeMessage
                  :params="modelLocal"
                  @updateMessages="updateMessages"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #bubbleFlex>
                <ItemBubbleFlex
                  :params="modelLocal.params"
                  @updateModelParams="updateModelParams"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #carouselFlex>
                <ItemCarouselFlex
                  :params="modelLocal.params"
                  @updateModelBubbles="updateModelBubbles"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #jsonTemplate>
                <ItemJsonTemplate
                  :params="modelLocal.params"
                  @updateModelParams="updateModelParams"
                  @updateSaveStatus="updateSaveStatus"
                />
              </template>
              <template #__INITIAL__>
                <div class="my-5 pl-6">ノードのタイプをシナリオマップで選択してください。</div>
              </template>
              <template #default>
                <div class="my-5 pl-6">{{ modelLocal.dataType || '' }} は未対応です。</div>
              </template>
            </v-switch-case>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-if="!hidePreviewDisplay.includes(modelLocal.dataType)">
            <MessagePreview :messages="[this.modelLocal]" />
          </v-col>
        </v-row>
      </div>
    </div>
    </v-card>
  </v-navigation-drawer>

  <v-dialog v-model="showLeaveConfirm" persistent width="500">
    <v-card>
        <v-card-title>メッセージの編集を終了してもよろしいですか？</v-card-title>
        <v-card-text>行った変更は破棄されます。</v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <template>
            <v-spacer/>
            <v-btn
                color="primary"
                @click="closeModal"
            >
              はい
            </v-btn>
            <v-btn outlined color="primary" @click="cancelLeave">
              キャンセル
            </v-btn>
          </template>
        </v-card-actions>
      </v-card>
  </v-dialog>

  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { UPDATE_SCENARIO_DATA, DELETE_SCENARIO_MESSAGE } from "@/store/action-types";
import { mapState, mapActions, mapGetters } from "vuex";
import VSwitchCase from "../common/VSwitchCase.vue";
import ItemTextMessage from "./ItemTextMessage.vue";
import ItemImageMapMessage from "./ItemImageMapMessage.vue";
import ItemRichMenu from "./ItemRichMenu.vue";
import ItemButtonTemplate from "./ItemButtonTemplate.vue";
import ItemSticker from "./ItemSticker.vue";
import ItemLocation from "./ItemLocation.vue";
import ItemConfirmTemplate from "./ItemConfirmTemplate.vue";
import ItemImage from "./ItemImage.vue";
import ItemAudio from "./ItemAudio.vue";
import ItemVideo from "./ItemVideo.vue";
import ItemCarouselTemplate from "./ItemCarouselTemplate.vue";
import ItemCompositeMessage from "./ItemCompositeMessage.vue";
import MessagePreview from "../../ScenarioSettingsDetail/components/MessagePreview.vue";
import ItemBubbleFlex from "./ItemBubbleFlex.vue";
import ItemCarouselFlex from "./ItemCarouselFlex.vue";
import ItemJsonTemplate from "./ItemJsonTemplate.vue";
import InputText from "./InputText.vue";

import { cloneDeep } from "lodash";
import { SPECIAL_TALK_TYPES } from "@/store/modules/scenarios/scenarios.constants";

export default Vue.extend({
  props: {
    visible: Boolean,
    close: Function,
    model: Object,
    messages: Array,
    scenarioId: String,
    versionId: String,
    talkName: String,
    parentClicked: Boolean,
  },
  data() {
    return {
      modelLocal: {},
      hidePreviewDisplay: ["jsonTemplate", "compositeMessage"],
      originalModel: {},
      imageMapFiles: [],
      audioFiles: [],
      imageFiles: [],
      videoFiles: [],
      canSave: false,
      contentRendered: false,
      showLeaveConfirm: false,
      rules: {
        validTextLength: (value) => {
          if (!value) {
            return "メッセージ名は必須入力です。";
          }
          if (value && value.length > 120) {
            return "メッセージ名は120文字以内にしてください。";
          } else {
            return true;
          }
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
      },
    };
  },
  watch: {
    model(value) {
      this.canSave = false;
      this.modelLocal = cloneDeep(value);
    },
    visible(value) {
      this.canSave = false;
      if (value) {
        this.originalModel = cloneDeep(this.modelLocal);
        let $this = this;
        setTimeout(function(){ $this.contentRendered = true }, 100);
      }
    },
    parentClicked(value) {
      this.onClickOutside();
    }
  },
  components: {
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
    InputText
  },
  computed: {
    ...mapState({
      activeScenario: (state) => (state).scenarios.activeScenario,
      activeScenarioData: (state) => (state).scenarios.activeScenarioData,
      scenarioMessages: (state) => (state).scenarios.scenarioMessages,
    }),
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
        }
      },
    },
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
    isSpecialTalk() {
      if (!this.modelLocal.params || !this.modelLocal.params.specialScenarioTalk) {
        return false;
      }
      return SPECIAL_TALK_TYPES.includes(this.modelLocal.params.specialScenarioTalk);
    },
    listMessages() {
      const talk = this.scenarioMessages.filter(elem => ((elem.scenario_talk_id === this.$route.params.talkId) && (elem.id !== this.modelLocal.id)));
      if (talk.length) {
        return talk.map(data => data.nameLBD)
      }
      return [];
    }
  },
  methods: {
    ...mapActions({
      saveScenarioData: UPDATE_SCENARIO_DATA,
      deleteScenarioMessage: DELETE_SCENARIO_MESSAGE,
    }),
    closeModal() {
      this.contentRendered = false;
      this.show = false;
      this.showLeaveConfirm = false;
      this.modelLocal = this.originalModel;
      this.$emit("updateSaveState", false);
    },
    onUpdateItemProperties() {
      if (this.modelLocal.nameLBD && this.modelLocal.nameLBD.length == 0) {
        delete this.modelLocal.nameLBD;
      }
      var payload = {
        model: this.modelLocal,
        scenario: {
          scenarioId: this.scenarioId,
          versionId: this.versionId,
        },
      };
      switch (this.model.dataType) {
        case "imagemap":
          payload["files"] = this.imageMapFiles;
          break;
        case "audio":
          payload["files"] = this.audioFiles;
          break;
        case "image":
          payload["files"] = this.imageFiles;
          break;
        case "video":
          payload["files"] = this.videoFiles;
          break;
        default:
      }

      this.saveScenarioData(payload);
      this.closeModal();
      this.$emit("close");
      this.$emit("updateSaveStatus", { value: false });
    },
    updateModelParams(value) {
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
    updateSaveStatus({ value }) {
      this.canSave = value;
    },
    onChangeName(event) {
      this.updateSaveStatus({ value: event.length <= 120 });
    },
    copyIdToClipboard() {
      navigator.clipboard.writeText(this.modelLocal.dataId)
        .then(() => { this.$snackbar.show({ text: "クリップボードにコピーしました。" }) })
    },
    cancelLeave() {
        let $this = this;
        setTimeout(function(){ $this.showLeaveConfirm = false }, 100);
    },
    onClickOutside() {
      if(this.show && this.contentRendered && !this.showLeaveConfirm){
        this.showLeaveConfirm = true;
      }
    }
  },
  mounted() {
    this.modelLocal = cloneDeep((this).model) || {};
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
