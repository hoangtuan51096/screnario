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
.column-display-carousel {
  background-color: #F2F2F2 !important;
  border-radius: 5px !important;
  margin-bottom: 1em !important;
  padding: 0.5em !important;
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
        <label>列数</label>
        <v-select outlined single-line hide-details :items="columns" v-model="params.columnCount" dense> </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <label>アクション数</label>
        <v-select outlined single-line hide-details :items="actions" v-model="params.actionCount" dense> </v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <label>サムネイル画像を使用する</label>
        <v-select outlined single-line hide-details :items="useThumbnailImage" v-model="params.useThumbnailImage" dense>
        </v-select>
      </v-col>
    </v-row>
    <v-row v-if="params.useThumbnailImage">
      <v-col>
        <label>画像の表示形式</label>
          <v-select outlined single-line hide-details :items="templateImageOptions" v-model="params.imageSize" dense
              @input="onChangeValue($event, 'imageSize')"></v-select>
          <span class="caption-text">＊カバー: 画像領域全体に画像を表示します。画像領域に収まらない部分は切り詰められます。
          <br/>＊コンテイン: 画像領域に画像全体を表示します。縦長の画像では左右に、横長の画像では上下に余白が表示されます。</span>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <label>タイトルを使用する</label>
        <v-select outlined single-line hide-details :items="useThumbnailImage" v-model="params.useTitle" dense>
        </v-select>
      </v-col>
    </v-row>
    <template v-for="ind in params.columnCount">
      <div class="column-display-carousel" :key="`row_${ind}`">
        <v-row>
          <v-col cols="6">
          <v-icon @click="setExpandColumn(ind - 1)">{{ expandColumn[ind - 1] ? "mdi-chevron-down" : "mdi-chevron-right" }}</v-icon>
          <label>列{{ ind }}</label>
          </v-col>
        </v-row>
        <div v-if="expandColumn[ind - 1]">
          <template v-if="params.useThumbnailImage">
            <v-row>
              <v-col>
                サムネイル画像
                <v-checkbox
                  v-model="editThumbnailFile[`${ind - 1}`]"
                  label="サムネイル画像を変更する"
                  @change="editingThumbnailImage($event, ind - 1)"
                >
                </v-checkbox>
              </v-col>
            </v-row>
          </template>

          <template v-if="editThumbnailFile[`${ind - 1}`] && params.useThumbnailImage">
            <v-row>
              <v-col cols="3" style="padding-right: 0">
                <v-subheader style="padding: 0" v-text="'タイプ'"/>
              </v-col>
              <v-col>
                <v-select
                  v-model="newImageLocal[`${ind - 1}`]"
                  :items="imageOptions"
                  single-line
                  outlined
                  dense
                  hide-details
                  background-color="white"
                  @change="thumbnailImageLocal($event, ind - 1)"
                >
                </v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="3" style="padding-right: 0">
                <v-subheader style="padding: 0" v-text="'ファイル'"/>
              </v-col>
              <v-col>
                <v-text-field
                  v-if="!newImageLocal[`${ind - 1}`]"
                  outlined
                  single-line
                  hide-details
                  background-color="white"
                  dense
                  label="https://example.com"
                  v-model="tempThumbnailUrl[`${ind - 1}`]"
                  @change="inputThumbnailUrl($event, ind - 1)"
                >
                </v-text-field>
                <v-file-input
                  v-else
                  v-model="tempThumbnailFile[`${ind - 1}`]"
                  @change="inputThumbnailFile($event, ind - 1)"
                  prepend-icon=""
                  prepend-inner-icon="mdi-import"
                  hide-details="auto"
                  outlined
                  dense
                  background-color="white"
                  placeholder="ファイルを選択"
                  accept=".jpg,.jpeg,.png"
                >
                </v-file-input>
              </v-col>
            </v-row>
          </template>

          <v-row v-if="params.useTitle">
            <v-col>
              <label>タイトル</label>
              <v-text-field
                outlined
                single-line
                dense
                hide-details="auto"
                background-color="white"
                :value="params[`title.${ind - 1}`]"
                @input="onChangeValue($event, `title.${ind - 1}`)"
                :rules="[rules.validTextLength, rules.validTextChar]"
              >
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <label>テキスト</label>
              <v-text-field
                outlined
                single-line
                dense
                hide-details="auto"
                background-color="white"
                :value="params[`text.${ind - 1}`]"
                @input="onChangeValue($event, `text.${ind - 1}`)"
                :rules="[rules.validTextLength, rules.validTextChar]"
              >
              </v-text-field>
            </v-col>
          </v-row>

          <template v-for="(action, index) in params.actionCount">
            <ActionProperty
              of="template"
              :key="action"
              :number="action"
              :firstAction="action == 1"
              :lastAction="action == params.actionCount"
              :premadeMessage="isSpecialPremadeTalk()"
              :action="getActionByNumber(ind, index)"
              @validateAction="validateAction($event)"
              @resetAction="resetAction($event, (ind - 1), index)"
              @moveAction="moveAction($event, (ind - 1), index)"
              v-bind:ref="'action.' + index"
              :botMessages="botMessages"
              :specialTalk="specialTalk"
            />
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ActionProperty from "./CommonProperties/ActionProperty.vue";
import { cloneDeep } from "lodash";

export default Vue.extend({
  name: "ItemCarouselTemplate",
  props: {
    params: {
      type: Object,
      required: true,
    },
    show: Boolean,
    branchIndex: Number,
    botMessages: Array,
    specialTalk: Boolean,
  },
  watch: {
    params(val) {
      this.displayThumbnails = this.setDisplayThumbnails();
      this.isPremadeMessage = this.isSpecialPremadeTalk();
      this.actionsAreValid = true;
      this.editThumbnailFile = [false, false, false, false, false, false, false, false, false, false];
      this.newImageLocal = [false, false, false, false, false, false, false, false, false, false];
      this.expandColumn = [true, true, true, true, true, true, true, true, true, true];
      this.tempThumbnailUrl = [null, null, null, null, null, null, null, null, null, null];
      this.tempThumbnailFile = [null, null, null, null, null, null, null, null, null, null];
      this.tempThumbnailFileDisplay = [null, null, null, null, null, null, null, null, null, null];
      this.paramsOriginal = cloneDeep(val);
      this.setDefaultValues();
    },
    show(val) {
      if (val) {
        for (let i = 0; i < 10; i++) {
          this.isValidText["title." + i.toString()] = true;
        }
        for (let i = 0; i < 10; i++) {
          this.isValidText["text." + i.toString()] = true;
        }
      }
    },
    "params.useTitle"(val) {
      this.reportValidation();
    },
    "params.useThumbnailImage"(val) {
      this.reportValidation();
    },
    "params.columnCount"(val) {
      this.reportValidation();
    },
    "params.actionCount"(newVal, oldVal) {
      if (newVal > oldVal && this.isPremadeMessage) {
        for (var col = 1; col <= this.params.columnCount; col++) {
          for (var x = oldVal; x < newVal; x++) {
            var tempAction = this.getActionByNumber(col, x);
            tempAction["type"] = "postback";
          }
        }
      }
    },
    branchIndex(val) {
      this.branchIndex = val;
      this.scrollToAction(val);
    },
  },
  data() {
    var temp = [];
    for (var i = 0; i < 10; i++) {
      temp["title." + i.toString()] = true;
      temp["text." + i.toString()] = true;
    }
    return {
      columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      editThumbnailFile: [false, false, false, false, false, false, false, false, false, false],
      newImageLocal: [false, false, false, false, false, false, false, false, false, false],
      expandColumn: [true, true, true, true, true, true, true, true, true, true],
      tempThumbnailUrl: [null, null, null, null, null, null, null, null, null, null],
      tempThumbnailFile: [null, null, null, null, null, null, null, null, null, null],
      tempThumbnailFileDisplay: [null, null, null, null, null, null, null, null, null, null],
      imageOptions: [
        { text: "URL", value: false },
        { text: "ローカルファイル", value: true },
      ],
      actions: [1, 2, 3],
      useThumbnailImage: [
        { text: "はい", value: true },
        { text: "いいえ", value: false },
      ],
      templateImageOptions: [
        { text: "カバー", value: 'cover' },
        { text: "コンテイン", value: 'contain' },
      ],
      actionsAreValid: true,
      allowedContentType: ["image/jpg", "image/jpeg", "image/png"],
      displayThumbnails: null,
      isPremadeMessage: null,
      sizeLimitThumbnail: 1000000,
      rules: {
        validTextLength: (value) => value.length > 0 || "必須",
        validTextChar: (value) => {
          for (var ch of value) {
            if (ch !== "\n" && ch !== " " && ch !== "　") {
              return true;
            }
          }
          return "空白または改行のみは保存出来ません";
        },
      },
      isValidText: temp,

      paramsOriginal: {},
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
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemCarouselTemplate`, value: true });
  },
  created() {
    this.setDefaultValues();
    this.displayThumbnails = this.setDisplayThumbnails();
  },
  methods: {
    setDefaultValues() {
      if(this.params && !this.params.imageSize) {
        this.params.imageSize = 'cover';
      }
    },
    scrollToAction(branchIndex) {
      if (!Number.isInteger(branchIndex)) {
        return;
      }

      const targetRef = this.$refs[`action.${branchIndex}`];
      if (targetRef && targetRef.length > 0) {
        this.$nextTick(() =>
          targetRef[0].$el.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          })
        );
      }
    },
    isSpecialPremadeTalk() {
      return "specialScenarioTalk" in this.params ? this.params["specialScenarioTalk"] : null;
    },
    onChangeValue(event, keyValue) {
      if (keyValue.includes("thumbnail.")) {
        var thumbnailNumber = keyValue.split(".")[1];
        const response = fetch(event, {
          method: "HEAD",
          cache: "no-cache",
        })
          .then((response) => {
            if (response.status == 200 && this.allowedContentType.includes(response.headers.get("Content-Type"))) {
              if (response.headers.get("Content-Length") > this.sizeLimitThumbnail) {
                this.displayThumbnails["thumbnail." + thumbnailNumber] = this.params["thumbnail." + thumbnailNumber];
                this.$snackbar.show({ text: "ファイルサイズは1MB以下にしてください。", type: "error" });
              } else {
                this.$emit("updateParams", { key: keyValue, value: event });
              }
            } else {
              this.displayThumbnails["thumbnail." + thumbnailNumber] = this.params["thumbnail." + thumbnailNumber];
              this.$snackbar.show({ text: "URL形式が正しくありません。", type: "error" });
            }
            return response;
          })
          .catch((error) => {
            this.displayThumbnails["thumbnail." + thumbnailNumber] = this.params["thumbnail." + thumbnailNumber];
            this.$snackbar.show({
              text: "このURLの内容を読み込めない。URLの内容をダウンロードしてLBDでローカルファイル使ってください。",
              type: "error",
            });
            return error;
          });
      } else {
        if (keyValue.startsWith("title.") || keyValue.startsWith("text.")) {
          this.validateText(event, keyValue);
        }
        this.reportValidation();
        this.$emit("updateParams", { key: keyValue, value: event });
      }
    },
    getActionByNumber(index, number) {
      let actionObj = this.params[`action.${index - 1}.${number}`];
      return actionObj;
    },
    setDisplayThumbnails() {
      var result = {};
      for (var x = 0; x < 10; x++) {
        result["thumbnail." + x] = this.params["thumbnail." + x];
      }
      return result;
    },
    validateText(event, keyValue) {
      if (event.length > 0) {
        for (var ch of event) {
          if (ch !== "\n" && ch !== " " && ch !== "　") {
            this.isValidText[keyValue] = true;
            return;
          }
        }
      }
      this.isValidText[keyValue] = false;
    },
    validateAction(value) {
      this.actionsAreValid = value;
      this.reportValidation();
    },
    editingThumbnailImage(event, index) {
      if (event === false) {
        this.params["thumbnail." + index] = this.paramsOriginal["thumbnail." + index];
        this.$set(this.tempThumbnailUrl, index, null);
        this.$set(this.tempThumbnailFile, index, null);
      }
      this.$emit("updateParams", { key: "editingThumbnailImage." + index, value: event });
      this.reportValidation();
    },
    thumbnailImageLocal(event, index) {
      this.$emit("updateParams", { key: "thumbnailImageEditLocal." + index, value: event });
      this.reportValidation();
    },
    inputThumbnailUrl(event, index) {
      this.$emit("updateParams", { key: "tempThumbnailUrl." + index, value: event });
      this.checkValidImage(event, index);
      this.reportValidation();
    },
    inputThumbnailFile(event, index) {
      this.$emit("updateParams", { key: "tempThumbnailFile." + index, value: event });
      this.checkValidFile(event, index);
      this.reportValidation();
    },
    checkValidFile(file, columnIndex) {
      if (file) {
        var reader = new FileReader();
        reader.onload = (e) => {
          this.$set(this.tempThumbnailFileDisplay, columnIndex, e.target.result);
          this.params["thumbnail." + columnIndex] = this.tempThumbnailFileDisplay[columnIndex];
          this.reportValidation();
        };
        if (file.size > this.sizeLimitThumbnail || (file.type != "image/jpeg" && file.type != "image/png")) {
          this.params["thumbnail." + columnIndex] = this.paramsOriginal["thumbnail." + columnIndex];
          this.$set(this.tempThumbnailFileDisplay, columnIndex, null);
          this.$set(this.tempThumbnailFile, columnIndex, null);
          this.$snackbar.show({
            text: "ファイルサイズが1MB以上で、ファイル形式がJPEGまたはPNGではない。このファイルは使用できません。",
            type: "error",
          });
          this.reportValidation();
        } else {
          reader.readAsDataURL(file);
        }
      } else {
        this.params["thumbnail." + columnIndex] = this.paramsOriginal["thumbnail." + columnIndex];
        this.$set(this.tempThumbnailFileDisplay, columnIndex, null);
        this.$set(this.tempThumbnailFile, columnIndex, null);
        this.reportValidation();
      }
    },
    checkValidImage(url, columnIndex) {
      const response = fetch(url, {
        method: "HEAD",
        cache: "no-cache",
      })
        .then((response) => {
          if (response.status == 200 && this.allowedContentType.includes(response.headers.get("Content-Type"))) {
            if (response.headers.get("Content-Length") > this.sizeLimitThumbnail) {
              this.params["thumbnail." + columnIndex] = this.paramsOriginal["thumbnail." + columnIndex];
              this.$set(this.tempThumbnailUrl, columnIndex, null);
              this.reportValidation();
              this.$snackbar.show({ text: "ファイルサイズは1MB以下にしてください。", type: "error" });
              return response;
            }
          } else {
            this.params["thumbnail." + columnIndex] = this.paramsOriginal["thumbnail." + columnIndex];
            this.$set(this.tempThumbnailUrl, columnIndex, null);
            this.reportValidation();
            this.$snackbar.show({ text: "URL形式が正しくありません。", type: "error" });
            return response;
          }
          this.params["thumbnail." + columnIndex] = url;
          return response;
        })
        .catch((error) => {
          this.params["thumbnail." + columnIndex] = this.paramsOriginal["thumbnail." + columnIndex];
          this.$set(this.tempThumbnailUrl, columnIndex, null);
          this.reportValidation();
          this.$snackbar.show({
            text: "このURLの内容を読み込めない。URLの内容をダウンロードしてLBDでローカルファイル使ってください。",
            type: "error",
          });
          return error;
        });
    },
    reportValidation() {
      for (var i = 0; i < this.params.columnCount; i++) {
        if (this.params.useTitle && !this.isValidText["title." + i.toString()]) {
          this.$emit("updateSaveStatus", { key: `ItemCarouselTemplate`, value: false });
          return;
        }
        if (!this.isValidText["text." + i.toString()]) {
          this.$emit("updateSaveStatus", { key: `ItemCarouselTemplate`, value: false });
          return;
        }

        if (this.params.useThumbnailImage) {
          if (this.newImageLocal[i]) {
            if (this.tempThumbnailFile[i] == null) {
              this.$emit("updateSaveStatus", { key: `ItemCarouselTemplate`, value: false });
              return;
            }
          } else {
            if (
              this.params["thumbnail." + i] === "" &&
              (this.tempThumbnailUrl[i] === null || this.tempThumbnailUrl[i] === "")
            ) {
              this.$emit("updateSaveStatus", { key: `ItemCarouselTemplate`, value: false });
              return;
            }
          }
        }
      }

      if (!this.actionsAreValid) {
        this.$emit("updateSaveStatus", { key: `ItemCarouselTemplate`, value: false });
        return;
      }
      this.$emit("updateSaveStatus", { key: `ItemCarouselTemplate`, value: true });
    },
    setExpandColumn(indexOfColumn) {
      this.$set(this.expandColumn, indexOfColumn, !this.expandColumn[indexOfColumn]);
    },
    resetAction(oldAction, columnIndex, actionToResetIndex) {
      console.log("in reset action");
      console.log(columnIndex);
      console.log(actionToResetIndex);
      this.params['action.' + columnIndex + '.' + actionToResetIndex] = cloneDeep(oldAction);
    },
    moveAction(movePositionUp, columnIndex, indexToMove) {
      let positionDelta = movePositionUp ? 1 : -1;
      const originalAction = cloneDeep(this.params['action.' + columnIndex + '.' + indexToMove]);
      this.params['action.' + columnIndex + '.' + indexToMove] =
        cloneDeep(this.params['action.' + columnIndex + '.' + (indexToMove + positionDelta)]);
      this.params['action.' + columnIndex + '.' + (indexToMove + positionDelta)] = cloneDeep(originalAction);
    }
  },
});
</script>
