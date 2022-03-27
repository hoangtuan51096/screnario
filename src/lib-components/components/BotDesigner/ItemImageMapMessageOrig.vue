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
    <v-row>
      <v-col>
        <v-switch v-model="editFiles" label="画像を変更する"> </v-switch>
      </v-col>
    </v-row>

    <template v-if="editFiles">
      <v-row class="select-image-type-row">
        <v-select v-model="params.imageLocalFile" :items="imageOptions" single-line outlined dense hide-details>
        </v-select>
      </v-row>
      <div v-if="params.imageLocalFile">
        <v-row>
          <v-col>
            <span>全て５つファイルを選んでください。</span>
          </v-col>
        </v-row>
        <template v-for="index in 5">
          <v-row :key="`row_${index}`">
            <v-col>
              画像横 {{ baseWidthSizes[index - 1] }}
              <v-file-input
                v-model="fileModels[index - 1]"
                @change="fileDataChanged($event, index)"
                accept=".jpg,.jpeg,.png"
                :rules="[rules.fileType, rules.fileSize]"
              >
              </v-file-input>
            </v-col>
          </v-row>
        </template>
        <v-divider class="mt-4"></v-divider>
      </div>
      <div v-if="!params.imageLocalFile">
        <v-row>
          <v-col>
            <v-text-field
              type="text"
              outlined
              single-line
              label="URL"
              v-model="tempOriginalUrl"
              dense
              @change="updateImageUrl"
            />
          </v-col>
        </v-row>
      </div>
    </template>

    <v-row>
      <v-col>
        <label>横</label>
        <v-select
          v-model="params.baseWidth"
          :items="baseWidthOptions"
          single-line
          outlined
          dense
          hide-details
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <label>縦</label>
        <v-text-field type="number" outlined single-line v-model="params.autoDetectedBaseHeight" dense hide-details />
      </v-col>
    </v-row>

    <template v-for="(action, index) in params.actionCount">
      <v-divider :key="`divide_${action}`" class="mt-4"></v-divider>
      <ActionProperty
        of="imagemap"
        :key="action"
        :number="action"
        :action="getActionByNumber(index)"
        hasArea
        :isValidAction="isValidActionList[index]"
        @validateAction="validateAction($event, index)"
        v-bind:ref="'action.' + index"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import ActionProperty from "./CommonProperties/ActionProperty.vue";
import { cloneDeep } from "lodash";

export default Vue.extend({
  name: "ItemImageMapMessage",
  props: {
    params: {
      type: Object,
      required: true,
    },
    canSave: Boolean,
    branchIndex: Number,
  },
  watch: {
    params(value) {
      this.fileModels = [undefined, undefined, undefined, undefined, undefined];
      this.fileDisplay = [undefined, undefined, undefined, undefined, undefined];
      this.editFiles = false;
      this.urlForImages = value.baseUrl;
      this.tempOriginalUrl = null;
      this.validTempOriginalUrl = false;
      this.baseUrlOriginal = cloneDeep(value.baseUrl);
    },
    "params.imageLocalFile"(value) {
      if (this.tempOriginalUrl == null) {
        this.validTempOriginalUrl = false;
      }
      this.reportValidation();
    },
    editFiles(value) {
      if (value === false) {
        this.params.baseUrl = this.baseUrlOriginal;
        this.tempOriginalUrl = null;
        this.fileModels = [undefined, undefined, undefined, undefined, undefined];
      }
      this.$emit("updateParams", { key: "itemImageMapMessage", value: value });
      this.reportValidation();
    },
    canSave(value) {
      if (value) {
        for (var i = 0; i < 5; i++) {
          this.isValidFileSize[i] = true;
          this.isValidFileType[i] = true;
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
    for (var i = 0; i < (this).params.actionCount; i++) {
      temp.push(true);
    }
    return {
      editFiles: false,
      fileModels: [undefined, undefined, undefined, undefined, undefined],
      fileDisplay: [undefined, undefined, undefined, undefined, undefined],
      imageOptions: [
        { text: "URL", value: false },
        { text: "ローカルファイル", value: true },
      ],
      allowedContentType: ["image/jpg", "image/jpeg", "image/png"],
      urlForImages: (this).params.baseUrl,
      validTempOriginalUrl: false,
      tempOriginalUrl: null,
      fileSizes: [240, 300, 460, 700, 1040],
      baseWidthSizes: [240, 300, 460, 700, 1040],
      baseWidthOptions: [
        { value: 240, text: "240" },
        { value: 300, text: "300" },
        { value: 460, text: "460" },
        { value: 700, text: "700" },
        { value: 1040, text: "1040" },
      ],
      rules: {
        fileSize: (file) =>
          file === undefined || !(file.size > 10000000) || "10MB以下の画像ファイルをアップロードして下さい",
        fileType: (file) =>
          file === undefined ||
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          "画像は .jpg .jpeg .png しか出来ません",
      },
      isValidActionList: temp,
      fileSizeLimit: 10000000,
      isValidFileSize: [true, true, true, true, true],
      isValidFileType: [true, true, true, true, true],
      imageIndex: -1,

      baseUrlOriginal: cloneDeep((this).params.baseUrl) || {},
    };
  },
  components: { ActionProperty },
  computed: {},
  mounted() {
    const { branchIndex } = this;
    if (!Number.isInteger(branchIndex)) {
      return;
    }
    this.scrollToAction(branchIndex);
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemImageMapMessage`, value: true });
  },
  methods: {
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
    onChangeText(value) {
      this.$emit("updateParams", { key: "text", value: value });
    },
    updateImageUrl(update) {
      var correctCounter = 0;
      if (update !== "") {
        for (var x = 0; x < this.fileSizes.length; x++) {
          const response = fetch(update + "/" + this.fileSizes[x], {
            method: "HEAD",
            cache: "no-cache",
          })
            .then((response) => {
              if (response.status == 200 && this.allowedContentType.includes(response.headers.get("Content-Type"))) {
                if (response.headers.get("Content-Length") > this.fileSizeLimit) {
                  this.params.baseUrl = this.baseUrlOriginal;
                  this.tempOriginalUrl = null;
                  this.validTempOriginalUrl = false;
                  this.reportValidation();
                  this.$snackbar.show({ text: "ファイルサイズは10MB以下にしてください。", type: "error" });
                } else {
                  correctCounter++;
                  if (correctCounter == 5) {
                    this.params.baseUrl = this.tempOriginalUrl;
                    this.validTempOriginalUrl = true;
                    this.reportValidation();
                    this.$emit("updateParams", { key: "tempBaseUrl", value: update });
                  }
                }
              } else {
                this.params.baseUrl = this.baseUrlOriginal;

                this.tempOriginalUrl = null;
                this.validTempOriginalUrl = false;
                this.reportValidation();
                this.$snackbar.show({ text: "URL形式が正しくありません。", type: "error" });
              }
              return response;
            })
            .catch((error) => {
              this.params.baseUrl = this.baseUrlOriginal;

              this.tempOriginalUrl = null;
              this.validTempOriginalUrl = false;
              this.reportValidation();
              this.$snackbar.show({
                text: "このURLの内容を読み込めない。URLの内容をダウンロードしてLBDでローカルファイル使ってください。",
                type: "error",
              });
              return error;
            });
        }
      } else {
        this.params.baseUrl = this.baseUrlOriginal;

        this.tempOriginalUrl = null;
        this.validTempOriginalUrl = false;
        this.reportValidation();
      }
    },
    getActionByNumber(number) {
      let actionObj = this.params[`action.${number}`];
      return actionObj;
    },
    fileDataChanged(event, index) {
      this.validateImage(event, index);
      this.isValidFileSize[index - 1] = !(event !== undefined && event.size > 10000000);
      this.isValidFileType[index - 1] = !(
        event !== undefined &&
        event.type !== "image/jpeg" &&
        event.type !== "image/png"
      );
      this.reportValidation();
    },
    validateAction(value, index) {
      this.isValidActionList[index] = value;
      this.reportValidation();
    },
    validateImage(value, index) {
      if (value === undefined) {
        this.params.baseUrl = this.baseUrlOriginal;

        this.$set(this.fileModels, index - 1, undefined);
        this.$set(this.fileDisplay, index - 1, undefined);
        this.$emit("fileImageMapDataUpdate", this.fileModels);
        this.reportValidation();
        return;
      }
      var reader = new FileReader();
      reader.readAsDataURL(value);

      reader.onload = (evt) => {
        var img = new Image();
        img.onload = (val) => {
          if (img.width !== this.baseWidthOptions[index - 1].value) {
            this.$snackbar.show({
              text: "横：" + this.baseWidthOptions[index - 1].value + "pxの画像をアップロードして下さい",
              type: "error",
            });
            this.$set(this.fileModels, index - 1, undefined);
            this.$set(this.fileDisplay, index - 1, undefined);
            this.$emit("fileImageMapDataUpdate", this.fileModels);
            this.reportValidation();
          } else {
            if (index >= this.imageIndex) {
              this.imageIndex = index;
            }
            this.params.baseUrl = evt.target.result;

            this.$set(this.fileModels, index - 1, value);
            this.$set(this.fileDisplay, index - 1, evt.target.result);
            this.$emit("fileImageMapDataUpdate", this.fileModels);
            this.reportValidation();
          }
        };
        img.src = evt.target.result;
      };
      reader.onerror = (evt) => {
        this.$set(this.fileModels, index - 1, undefined);
        this.$set(this.fileDisplay, index - 1, undefined);
        this.$emit("fileImageMapDataUpdate", this.fileModels);
        this.$snackbar.show({ text: "ファイルが読み込めません" });
        this.reportValidation();
      };
    },
    nullValueInFiles() {
      return (
        this.fileModels[0] == undefined ||
        this.fileModels[1] == undefined ||
        this.fileModels[2] == undefined ||
        this.fileModels[3] == undefined ||
        this.fileModels[4] == undefined
      );
    },
    reportValidation() {
      for (let i = 0; i < this.params.actionCount; i++) {
        if (!this.isValidActionList[i]) {
          this.$emit("updateSaveStatus", { key: `ItemImageMapMessage`, value: false });
          return;
        }
      }
      for (let i = 0; i < 5; i++) {
        if (!this.isValidFileSize[i]) {
          this.$emit("updateSaveStatus", { key: `ItemImageMapMessage`, value: false });
          return;
        }
      }
      for (let i = 0; i < 5; i++) {
        if (!this.isValidFileType[i]) {
          this.$emit("updateSaveStatus", { key: `ItemImageMapMessage`, value: false });
          return;
        }
      }
      if (this.editFiles && !this.params.imageLocalFile) {
        if (!this.validTempOriginalUrl) {
          this.$emit("updateSaveStatus", { key: `ItemImageMapMessage`, value: false });
          return;
        }
      }
      if (this.editFiles && this.params.imageLocalFile) {
        if (this.nullValueInFiles()) {
          this.$emit("updateSaveStatus", { key: `ItemImageMapMessage`, value: false });
          return;
        }
      }
      this.$emit("updateSaveStatus", { key: `ItemImageMapMessage`, value: true });
    },
  },
});
</script>

<style>
.preview-upload-image {
  max-height: 150px;
  max-width: 150px;
}
</style>
