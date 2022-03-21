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
.change-thumbnail-check label {
  margin-bottom: 0px !important;
}
.caption-text {
  font-size: 12px !important;
  color: #646464 !important;
}
</style>

<template>
  <div>
    <v-row>
      <v-col>
        <label>画像タイプ</label>
        <v-select outlined single-line hide-details :items="buttonTemplateUrlOptions" v-model="buttonTemplateUrl" dense>
        </v-select>
      </v-col>
    </v-row>

    <div v-if="buttonTemplateUrl">
    <v-row>
      <v-col>
        <label>画像の表示形式</label>
          <v-select outlined single-line hide-details :items="templateImageOptions" v-model="params.imageSize" dense
              @input="onChangeValue($event, 'imageSize')"></v-select>
          <span class="caption-text">＊カバー: 画像領域全体に画像を表示します。画像領域に収まらない部分は切り詰められます。
          <br/>＊コンテイン: 画像領域に画像全体を表示します。縦長の画像では左右に、横長の画像では上下に余白が表示されます。</span>
      </v-col>
    </v-row>
    <v-row>
      <v-col style="display: inline">
        <v-checkbox class="change-thumbnail-check" v-model="editImageFile" hide-details style="margin-top: 0;" label="サムネイル画像を変更する"/>
      </v-col>
    </v-row>
    <template v-if="editImageFile">
      <v-row>
        <v-col cols="3" style="padding-right: 0">
          <v-subheader style="padding: 0" v-text="'タイプ'"/>
        </v-col>
        <v-col>
          <v-select 
            v-model="newImageLocal" 
            :items="imageOptions" 
            single-line 
            outlined 
            dense 
            hide-details> 
          </v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="3" style="padding-right: 0">
          <v-subheader style="padding: 0" v-text="'ファイル'"/>
        </v-col>
        <v-col>
          <v-text-field
            v-if="!newImageLocal"
            outlined
            single-line
            hide-details
            dense
            placeholder="https://example.com"
            v-model="tempThumbnailUrl"
            @change="onChangeValue($event, 'thumbnailImageUrl')"
          >
          </v-text-field>
          <v-file-input
            v-else
            v-model="tempThumbnailFile"
            @change="fileDataChanged($event)"
            prepend-icon=""
            prepend-inner-icon="mdi-import"
            hide-details="auto"
            outlined
            dense
            placeholder="ファイルを選択"
            accept=".jpg,.jpeg,.png"
            @click:clear="$emit('updateSaveStatus', { key: `itemButtonTemplate`, value: false })"
            :rules="[isValidFileType, isValidFileSize]"
          >
          </v-file-input>
        </v-col>
      </v-row>
    </template>
    </div>

    <v-form ref="titleTextForm">
      <v-row>
        <v-col>
          <label>タイトル</label>
          <v-text-field
              outlined
              single-line
              dense
              v-model="params.title"
              hide-details="auto"
              :rules="[isValidTitleLength, isValidTextChar]"
              @input="onChangeValue($event, 'title')"
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <label>テキスト</label>
          <v-textarea
              auto-grow
              outlined
              single-line
              dense
              rows="5"
              counter
              hide-details="auto"
              :counter-value="(value) => `文字数：${value.length} / ${this.maxTextLength}`"
              v-model="params.text"
              :rules="[isValidTextLength, isValidTextChar]"
              @input="onChangeValue($event, 'text')"
          >
          </v-textarea>
          <span class="caption-text"
          >ボタン型テンプレートメッセージには高さに制限があり、{{maxTextLength}}文字以内であっても完全に表示されない可能性があります。実際の環境で表示を確認してください。</span
          >
        </v-col>
      </v-row>
    </v-form>

    <v-row>
      <v-col>
        <label>アクション数</label>
        <v-select outlined single-line hide-details :items="actions" v-model="params.actionCount" dense> </v-select>

        <template v-for="(action, index) in params.actionCount">
          <v-divider :key="`divide_${action}`" class="mt-4"></v-divider>
          <ActionProperty
            of="template"
            :key="action"
            :number="action"
            :firstAction="action == 1"
            :lastAction="action == params.actionCount"
            :premadeMessage="isPremadeMessage"
            :action="getActionByNumber(index)"
            :isValidAction="isValidActionList[index]"
            @validateAction="validateAction($event, index)"
            @resetAction="resetAction($event, index)"
            @moveAction="moveAction($event, index)"
            v-bind:ref="'actions.' + index"
            v-bind:class="'actions.' + index"
            :botMessages="botMessages"
            :specialTalk="specialTalk"
            :dataId="dataId"
          />
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ActionProperty from "@/components/BotDesigner/CommonProperties/ActionProperty.vue";
import { cloneDeep } from "lodash";

interface LocalState {
  actions: Array<number>;
  editImageFile: boolean;
  newImageLocal: boolean;
  imageOptions: Array<any>;
  tempThumbnailFile: any;
  validTempThumbnailFile: boolean;
  validTempThumbnailUrl: boolean;
  tempThumbnailFileDisplay: any;
  tempThumbnail: any;
  tempThumbnailUrl: any;
  isPremadeMessage: any;
  buttonTemplateUrlOptions: Array<any>;
  templateImageOptions: Array<any>;
  buttonTemplateUrl: any;
  textSections: Array<string>;
  isValidText: any;
  urlSections: Array<string>;
  isValidUrl: any;
  isValidActionList: Array<boolean>;
  allowedContentType: Array<string>;
  sizeLimitThumbnail: number;
  thumbnailImageUrlOriginal: any;
}

export default Vue.extend({
  name: "ItemButtonTemplate",
  props: {
    params: {
      type: Object,
      required: true,
    },
    branchIndex: Number,
    canSave: Boolean,
    botMessages: Array,
    specialTalk: Boolean,
    dataId: String,
  },
  watch: {
    buttonTemplateUrl(val) {
      var updateValue = val ? this.tempThumbnail : "";
      //this.tempThumbnail = val ? this.params.thumbnailImageUrl : "none";
      if (!val) {
        this.editImageFile = false;
        this.$emit("updateParams", { key: "editingThumbnailImage", value: false });
      }

      this.validateText(updateValue, "thumbnailImageUrl");
      if (val) {
        this.validateUrl(updateValue, "thumbnailImageUrl");
        this.reportValidation();
      } else {
        for (const section of this.urlSections) {
          this.isValidUrl[section] = true;
        }
        this.reportValidation();
      }
      this.$emit("updateParams", { key: "thumbnailImageUrl", value: updateValue });
    },
    tempThumbnail(val) {
      this.validateText(val, "thumbnailImageUrl");
      this.reportValidation();
    },
    editImageFile(val) {
      if (val === false) {
        this.params.thumbnailImageUrl = this.thumbnailImageUrlOriginal;
      }
      this.$emit("updateParams", { key: "editingThumbnailImage", value: val });
      this.tempThumbnailUrl = null;
      this.validTempThumbnailUrl = false;
      this.tempThumbnailFile = null;
      this.validTempThumbnailFile = false;
      this.reportValidation();
    },
    newImageLocal(val) {
      this.$emit("updateParams", { key: "editingThumbnailImageLocal", value: val });
      if (this.tempThumbnailUrl == null) {
        this.validTempThumbnailUrl = false;
      }
      if (this.tempThumbnailFile == null) {
        this.validTempThumbnailFile = false;
      }
      this.reportValidation();
    },
    params(val) {
      this.tempThumbnail = val.thumbnailImageUrl;
      this.buttonTemplateUrl = this.isUrlSet();
      this.isPremadeMessage = this.isSpecialPremadeTalk();
      this.editImageFile = false;
      this.newImageLocal = false;
      this.tempThumbnailFile = null;
      this.tempThumbnailFileDisplay = null;
      this.validTempThumbnailFile = false;
      this.validTempThumbnailUrl = false;
      this.thumbnailImageUrlOriginal = cloneDeep(val.thumbnailImageUrl);
      this.setDefaultValues();
    },
    canSave(val) {
      if (val) {
        for (const section of this.textSections) {
          this.isValidText[section] = true;
        }
        for (const section of this.urlSections) {
          this.isValidUrl[section] = true;
        }
        for (const actionIndex in this.params.actionCount) {
          this.isValidActionList[actionIndex] = true;
        }
      }
    },
    "params.actionCount"(newVal, oldVal) {
      if (newVal > oldVal && this.isPremadeMessage) {
        for (var x = oldVal; x < newVal; x++) {
          var tempAction = this.getActionByNumber(x);
          tempAction["type"] = "postback";
        }
      }
      this.reportValidation();
    },
    branchIndex(val) {
      this.branchIndex = val;
      this.scrollToAction(val);
    },
    botMessages(val) {
      this.botMessages = val;
    },
  },
  computed: {
    maxTextLength() {
      if (
          !this.buttonTemplateUrl &&
          (!this.params.title || this.params.title === "")
      ) {
        return 160;
      }
      return 60;
    }
  },
  data(): LocalState {
    return {
      actions: [1, 2, 3, 4],
      editImageFile: false,
      newImageLocal: false,
      imageOptions: [
        { text: "URL", value: false },
        { text: "ローカルファイル", value: true },
      ],
      tempThumbnailFile: null,
      validTempThumbnailFile: false,
      validTempThumbnailUrl: false,
      tempThumbnailFileDisplay: null,
      tempThumbnail: (this as any).params ? cloneDeep((this as any).params.thumbnailImageUrl) : null,
      tempThumbnailUrl: null,
      isPremadeMessage: null,
      buttonTemplateUrlOptions: [
        { text: "画像あり", value: true },
        { text: "画像なし", value: false },
      ],
      templateImageOptions: [
        { text: "カバー", value: 'cover' },
        { text: "コンテイン", value: 'contain' },
      ],
      buttonTemplateUrl: null,
      textSections: ["thumbnailImageUrl", "title", "text", "imageSize"],
      isValidText: {
        thumbnailImageUrl: true,
        title: true,
        text: true,
        imageSize: true,
      },
      urlSections: ["thumbnailImageUrl"],
      isValidUrl: {
        thumbnailImageUrl: true,
      },
      isValidActionList: [true, true, true, true],
      allowedContentType: ["image/jpg", "image/jpeg", "image/png"],
      sizeLimitThumbnail: 1000000,
      thumbnailImageUrlOriginal: null,
    };
  },
  components: {
    ActionProperty,
  },
  mounted() {
    this.setDefaultValues();
    const { branchIndex } = this;
    if (!Number.isInteger(branchIndex)) {
      return;
    }
    this.scrollToAction(branchIndex);
    this.reportValidation();
  },
  created() {
    this.setDefaultValues();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemButtonTemplate`, value: true });
  },
  methods: {
    setDefaultValues(): void {
      if (this.params && !this.params.imageSize) {
        this.params.imageSize = 'cover';
      }
      this.buttonTemplateUrl = this.isUrlSet();
    },
    scrollToAction(branchIndex: any): void {
      if (!Number.isInteger(branchIndex)) {
        return;
      }

      this.$nextTick(() => {
        const targetRef = this.$refs[`action.${branchIndex}`];
        if (targetRef && targetRef.length > 0) {
          targetRef[0].$el.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      });
    },
    isSpecialPremadeTalk(): any {
      return "specialScenarioTalk" in this.params ? this.params["specialScenarioTalk"] : null;
    },
    fileDataChanged(event: any): void {
      if (event) {
        var reader = new FileReader();
        reader.onload = (e) => {
          this.tempThumbnailFileDisplay = e.target.result;
          this.validTempThumbnailFile = true;
          this.params.thumbnailImageUrl = e.target.result;
          this.$emit("updateParams", { key: "tempThumbnailUrl", value: event });
          if (
            event.size <= 10000000 &&
            (event.type === "image/jpg" || event.type === "image/jpeg" || event.type === "image/png")
          ) {
            this.reportValidation();
          }
        };
        reader.readAsDataURL(event);
      } else {
        this.params.thumbnailImageUrl = this.thumbnailImageUrlOriginal;

        this.tempThumbnailFileDisplay = null;
        this.validTempThumbnailFile = false;
      }
    },
    onChangeValue(event: any, keyValue: any): void {
      this.$nextTick(() => {
        // NOTE: タイトルとテキストで相互にvalidateし合う必要があるので、親formのvalidateを叩き直す
        this.$refs.titleTextForm.validate();
      })
      console.log("ItemButtonTemplate", "onChangeValue:", event, keyValue);
      if (this.textSections.includes(keyValue)) {
        this.validateText(event, keyValue);
        this.reportValidation();
      }
      if (this.urlSections.includes(keyValue)) {
        this.validateUrl(event, keyValue);
        this.reportValidation();
      }
      if (keyValue == "thumbnailImageUrl") {
        const response = fetch(event, {
          method: "HEAD",
          cache: "no-cache",
        })
          .then((response) => {
            if (response.status == 200 && this.allowedContentType.includes(response.headers.get("Content-Type"))) {
              if (response.headers.get("Content-Length") > this.sizeLimitThumbnail) {
                this.params.thumbnailImageUrl = this.thumbnailImageUrlOriginal;
                this.tempThumbnailUrl = null;
                this.validTempThumbnailUrl = false;
                this.reportValidation();
                this.$snackbar.show({ text: "ファイルサイズは1MB以下にしてください。", type: "error" });
              } else {
                this.params.thumbnailImageUrl = this.tempThumbnailUrl;
                this.validTempThumbnailUrl = true;
                this.reportValidation();
                this.$emit("updateParams", { key: "tempThumbnailUrl", value: event });
              }
            } else {
              this.params.thumbnailImageUrl = this.thumbnailImageUrlOriginal;
              this.tempThumbnailUrl = null;
              this.validTempThumbnailUrl = false;
              this.reportValidation();
              this.$snackbar.show({ text: "URL形式が正しくありません。", type: "error" });
            }
            return response;
          })
          .catch((error) => {
            this.params.thumbnailImageUrl = this.thumbnailImageUrlOriginal;
            this.tempThumbnailUrl = null;
            this.validTempThumbnailUrl = false;
            this.reportValidation();
            this.$snackbar.show({
              text: "このURLの内容を読み込めない。URLの内容をダウンロードしてLBDでローカルファイル使ってください。",
              type: "error",
            });
            return error;
          });
      } else {
        this.$emit("updateParams", { key: keyValue, value: event });
      }
    },
    getActionByNumber(number: any): any {
      let actionObj = this.params[`actions.${number}`];
      return actionObj;
    },
    isUrlSet(): boolean {
      if (this.params) {
        return this.params["thumbnailImageUrl"] != "none" && this.params["thumbnailImageUrl"] !== "";
      } else {
        return false;
      }
    },
    validateText(event: any, keyValue: any): void {
      if (keyValue == "thumbnailImageUrl" && !this.buttonTemplateUrl) {
        this.isValidText[keyValue] = true;
        return;
      }
      if (typeof event === "string") {
        if (keyValue === "text" || keyValue === "title") {
          const title = keyValue === "title" ? event : this.params.title;
          const text = keyValue === "text" ? event : this.params.text;
          this.isValidText["title"] = this.isValidTextChar(title) === true && this.isValidTitleLength(title) === true;
          this.isValidText["text"] = this.isValidTextChar(text) === true && this.isValidTextLength(text) === true;
          return;
        }

        this.isValidText[keyValue] = this.isValidTextChar(event) === true;
        return;
      }

      this.isValidText[keyValue] = false;
    },
    validateUrl(event: any, keyValue: any): void {
      if (this.urlSections.includes(keyValue)) {
        if (event && (event.startsWith("https://") || event.startsWith("http://"))) {
          this.isValidUrl[keyValue] = true;
        } else {
          this.isValidUrl[keyValue] = false;
        }
      }
    },
    validateAction(value: any, index: any): void {
      this.isValidActionList[index] = value;
      this.reportValidation();
    },
    reportValidation(): void {
      console.log(
        "ItemButtonTemplate",
        "reportValidation:",
        this.isValidText,
        this.isValidUrl,
        this.isValidActionList,
        this.validTempThumbnailFile,
        this.validTempThumbnailUrl
      );
      if (this.isValidText["title"] === false) {
        this.$emit("updateSaveStatus", { key: `ItemButtonTemplate`, value: false });
        return;
      }
      if (this.isValidText["text"] === false) {
        this.$emit("updateSaveStatus", { key: `ItemButtonTemplate`, value: false });
        return;
      }
      for (const section of this.textSections) {
        if (!this.isValidText[section] && !this.newImageLocal) {
          this.$emit("updateSaveStatus", { key: `ItemButtonTemplate`, value: false });
          return;
        }
      }
      for (const section of this.urlSections) {
        if (!this.isValidUrl[section] && !this.newImageLocal) {
          this.$emit("updateSaveStatus", { key: `ItemButtonTemplate`, value: false });
          return;
        }
      }
      for (var i = 0; i < this.params.actionCount; i++) {
        if (!this.isValidActionList[i]) {
          this.$emit("updateSaveStatus", { key: `ItemButtonTemplate`, value: false });
          return;
        }
      }
      if (this.editImageFile && this.newImageLocal) {
        if (!this.validTempThumbnailFile) {
          this.$emit("updateSaveStatus", { key: `ItemButtonTemplate`, value: false });
          return;
        }
      }
      if (this.editImageFile && !this.newImageLocal) {
        if (!this.validTempThumbnailUrl) {
          this.$emit("updateSaveStatus", { key: `ItemButtonTemplate`, value: false });
          return;
        }
      }
      this.$emit("updateSaveStatus", { key: `ItemButtonTemplate`, value: true });
    },
    isValidTitleLength(value: any): any {
      let result_val: any = true;

      if (value !== undefined && value.length > 40) {
        result_val = "タイトルの最大長は40文字です";
      }

      return result_val;
    },
    isValidTextLength(value: any): any {
      let return_val: any = true;
      // Text is required for button template
      // If title or image is present, max size is 60
      if (value !== undefined) {
        if (value.length <= 0) {
          return_val = "必須";
        } else if (value.length > this.maxTextLength) {
          return_val = `テキストの最大長は${this.maxTextLength}文字です`;
        }
      } else {
        return_val = "必須";
      }

      return return_val;
    },
    isValidTextChar(value: any): any {
      if (value === undefined || value.length <= 0) {
        return true;
      }

      for (var ch of value) {
        if (ch !== "\n" && ch !== " " && ch !== "　") {
          return true;
        }
      }
      return "空白または改行のみは保存出来ません";
    },
    isValidFileSize(value: any): any {
      let return_val: any = true;
      if (value !== null && value.size > 10000000) {
        return_val = "10MB以下の画像ファイルをアップロードして下さい";
      }

      return return_val;
    },
    isValidFileType(value: any): any {
      let return_val: any = true;
      let validTypeExtensions = ["image/jpg", "image/jpeg", "image/png"]
      if (value !== null && !validTypeExtensions.includes(value.type)) {
        return_val = "画像は .jpg .jpeg .png しか出来ません";
      }
      return return_val;
    },
    resetAction(oldAction: any, actionToResetIndex: number): void {
      this.params['actions.' + actionToResetIndex] = cloneDeep(oldAction);
    },
    moveAction(movePositionUp: boolean, indexToMove: number): void {
      let positionDelta: number = movePositionUp ? 1 : -1;
      const originalAction = cloneDeep(this.params['actions.' + indexToMove]);
      this.params['actions.' + indexToMove] = cloneDeep(this.params['actions.' + (indexToMove + positionDelta)]);
      this.params['actions.' + (indexToMove + positionDelta)] = cloneDeep(originalAction);
    }
  },
});
</script>
