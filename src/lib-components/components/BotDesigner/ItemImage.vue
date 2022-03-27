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
  <div class="py-4">
    <v-row>
      <v-col>
        <label>現在元画像</label>
        <v-row>
          <v-col align="center" justify="center">
            <img
              v-bind:src="params.originalContentUrl + '?x-request=html'"
              height="150px"
              onclick="window.open(this.src)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-switch v-model="editOriginalFiles" label="元画像を変更する"> </v-switch>
          </v-col>
        </v-row>
        <template v-if="editOriginalFiles">
          <label>元画像</label>
          <v-row class="select-image-type-row">
            <v-select v-model="params.originalImageLocal" :items="imageOptions" single-line outlined dense hide-details>
            </v-select>
          </v-row>
          <v-row>
            <v-text-field
              v-if="!params.originalImageLocal"
              outlined
              single-line
              hide-details
              label="URL"
              dense
              v-model="tempOriginalUrl"
              @change="onChangeValue($event, 'originalContentUrl')"
            >
            </v-text-field>
            <template v-else>
              <v-file-input
                v-model="fileModels[0]"
                @change="fileDataChanged($event, 1)"
                label="新しい画像を選択"
                accept=".jpg,.jpeg,.png"
                :rules="[rules.fileType, rules.fileSizeOriginal]"
              >
              </v-file-input>
            </template>
          </v-row>
          <v-row>
            <v-col align="center" justify="center">
              <img
                v-if="!params.originalImageLocal && this.tempOriginalUrl"
                v-bind:src="this.tempOriginalUrl + '?x-request=html'"
                height="150px"
                onclick="window.open(this.src)"
              />
              <img
                v-if="params.originalImageLocal && this.tempOriginalFile"
                v-bind:src="this.tempOriginalFile"
                height="150px"
                onclick="window.open(this.src)"
              />
            </v-col>
          </v-row>
        </template>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <label>現在プレビュー画像</label>
        <v-row>
          <v-col>
            <v-switch v-model="editPreviewFiles" label="プレビュー画像を変更する"> </v-switch>
          </v-col>
        </v-row>
        <template v-if="editPreviewFiles">
          <label>プレビュー画像</label>
          <v-row class="select-image-type-row">
            <v-select v-model="params.previewImageLocal" :items="imageOptions" single-line outlined dense hide-details>
            </v-select>
          </v-row>
          <v-row>
            <v-text-field
              v-if="!params.previewImageLocal"
              outlined
              single-line
              hide-details
              dense
              label="URL"
              v-model="tempPreviewUrl"
              @change="onChangeValue($event, 'previewImageUrl')"
            >
            </v-text-field>
            <template v-else>
              <v-file-input
                v-model="fileModels[1]"
                @change="fileDataChanged($event, 2)"
                label="新しい画像を選択"
                accept=".jpg,.jpeg,.png"
                :rules="[rules.fileType, rules.fileSizeOriginal]"
              >
              </v-file-input>
            </template>
          </v-row>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { cloneDeep } from "lodash";

export default Vue.extend({
  name: "ItemImage",
  props: {
    params: {
      type: Object,
      required: true,
    },
    canSave: Boolean,
  },
  watch: {
    params(value) {
      this.fileModels = [undefined, undefined];
      this.editOriginalFiles = false;
      this.editPreviewFiles = false;
      this.tempOriginalUrl = null;
      this.tempOriginalFile = null;
      this.validTempOriginalUrl = false;
      this.validTempOriginalFile = false;
      this.tempPreviewUrl = null;
      this.tempPreviewFile = null;
      this.validTempPreviewUrl = false;
      this.validTempPreviewFile = false;
      this.previewImageUrlOriginal = cloneDeep(value.previewImageUrl);
    },
    "params.originalImageLocal"(value) {
      if (this.tempOriginalUrl == null) {
        this.validTempOriginalUrl = false;
      }
      if (this.tempOriginalFile == null) {
        this.validTempOriginalFile = false;
      }
      this.reportValidation();
    },
    "params.previewImageLocal"(value) {
      if (this.tempPreviewUrl == null) {
        this.validTempPreviewUrl = false;
      }
      if (this.tempPreviewFile == null) {
        this.validTempPreviewFile = false;
      }
      this.reportValidation();
    },
    editOriginalFiles(value) {
      if (value == false && this.editPreviewFiles == false) {
        this.$emit("updateSaveStatus", { key: `ItemImage`, value: false });
        this.$emit("updateParams", { key: "editingOriginalImage", value: value });
      } else {
        this.$emit("updateParams", { key: "editingOriginalImage", value: value });
        this.reportValidation();
      }
    },
    editPreviewFiles(value) {
      if (value === false) {
        this.params.previewImageUrl = this.previewImageUrlOriginal;
        this.tempPreviewUrl = null;
        this.fileModels[1] = undefined;
      }
      if (value == false && this.editOriginalFiles == false) {
        this.$emit("updateSaveStatus", { key: `ItemImage`, value: false });
        this.$emit("updateParams", { key: "editingPreviewImage", value: value });
      } else {
        this.$emit("updateParams", { key: "editingPreviewImage", value: value });
        this.reportValidation();
      }
    },
    canSave(val) {
      if (val) {
        for (var i = 0; i < 2; i++) {
          this.isValidSize[i] = true;
          this.isValidType[i] = true;
        }
      }
    },
  },
  data() {
    return {
      fileModels: [undefined, undefined],
      imageOptions: [
        { text: "URL", value: false },
        { text: "ローカルファイル", value: true },
      ],
      allowedContentType: ["image/jpg", "image/jpeg", "image/png"],
      sizeLimitOriginal: 10000000,
      sizeLimitPreview: 1000000,
      editOriginalFiles: false,
      editPreviewFiles: false,
      tempOriginalUrl: null,
      tempOriginalFile: null,
      validTempOriginalUrl: false,
      validTempOriginalFile: false,
      tempPreviewUrl: null,
      tempPreviewFile: null,
      validTempPreviewUrl: false,
      validTempPreviewFile: false,
      rules: {
        fileSizeOriginal: (file) =>
          file === undefined || !(file.size > 10000000) || "10MB以下の画像ファイルをアップロードして下さい",
        fileSizePreview: (file) =>
          file === undefined || !(file.size > 1000000) || "1MB以下の画像ファイルをアップロードして下さい",
        fileType: (file) =>
          file === undefined ||
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          "画像は .jpg .jpeg .png しか出来ません",
      },
      isValidSize: [true, true],
      isValidType: [true, true],
      previewImageUrlOriginal: cloneDeep((this).params.previewImageUrl) || {},
    };
  },
  mounted() {
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemImage`, value: true });
  },
  methods: {
    onChangeValue(event , keyValue) {
      if (keyValue == "originalContentUrl" || keyValue == "previewImageUrl") {
        if (event !== "") {
          const response = fetch(event, {
            method: "HEAD",
            cache: "no-cache",
          })
            .then((response) => {
              if (response.status == 200 && this.allowedContentType.includes(response.headers.get("Content-Type"))) {
                if (
                  keyValue == "originalContentUrl" &&
                  response.headers.get("Content-Length") > this.sizeLimitOriginal
                ) {
                  this.tempOriginalUrl = null;
                  this.validTempOriginalUrl = false;
                  this.reportValidation();
                  this.$snackbar.show({ text: "ファイルサイズは10MB以下にしてください。", type: "error" });
                } else if (
                  keyValue == "previewImageUrl" &&
                  response.headers.get("Content-Length") > this.sizeLimitPreview
                ) {
                  this.tempPreviewUrl = null;
                  this.validTempPreviewUrl = false;
                  this.reportValidation();
                  this.$snackbar.show({ text: "ファイルサイズは1MB以下にしてください。", type: "error" });
                } else {
                  if (keyValue == "originalContentUrl") {
                    this.validTempOriginalUrl = true;
                    this.$emit("updateParams", { key: "tempOriginalImage", value: event });
                  } else {
                    this.params.previewImageUrl = this.tempPreviewUrl;
                    this.validTempPreviewUrl = true;
                    this.$emit("updateParams", { key: "tempPreviewImage", value: event });
                  }
                  this.reportValidation();
                }
              } else {
                if (keyValue == "originalContentUrl") {
                  this.tempOriginalUrl = null;
                  this.validTempOriginalUrl = false;
                } else {
                  this.params.previewImageUrl = this.previewImageUrlOriginal;
                  this.tempPreviewUrl = null;
                  this.validTempPreviewUrl = false;
                }
                this.reportValidation();
                this.$snackbar.show({ text: "URL形式が正しくありません。", type: "error" });
              }
              return response;
            })
            .catch((error) => {
              if (keyValue == "originalContentUrl") {
                this.tempOriginalUrl = null;
                this.validTempOriginalUrl = false;
              } else {
                this.params.previewImageUrl = this.previewImageUrlOriginal;
                this.tempPreviewUrl = null;
                this.validTempPreviewUrl = false;
              }
              this.reportValidation();
              this.$snackbar.show({
                text: "このURLの内容を読み込めない。URLの内容をダウンロードしてLBDでローカルファイル使ってください。",
                type: "error",
              });
              return error;
            });
        } else {
          if (keyValue === "previewImageUrl") {
            this.params.previewImageUrl = this.previewImageUrlOriginal;
          }
          keyValue == "originalContentUrl" ? (this.validTempOriginalUrl = false) : (this.validTempPreviewUrl = false);
          this.reportValidation();
        }
      } else {
        this.$emit("updateParams", { key: keyValue, value: event });
      }
    },
    fileDataChanged(event , index) {
      if (index - 1 === 0) {
        if (event) {
          let reader = new FileReader();
          reader.onload = (e) => {
            this.tempOriginalFile = e.target.result;
            this.validTempOriginalFile = true;
            this.$emit("updateParams", { key: "tempOriginalImage", value: event });
            this.reportValidation();
          };
          reader.readAsDataURL(event);
        } else {
          this.tempOriginalFile = null;
          this.validTempOriginalFile = false;
        }
        this.isValidSize[index - 1] = !(event !== undefined && event.size > 10000000);
      } else {
        if (event) {
          let reader = new FileReader();
          reader.onload = (e) => {
            this.tempPreviewFile = e.target.result;
            this.validTempPreviewFile = true;
            this.params.previewImageUrl = this.tempPreviewFile;
            this.$emit("updateParams", { key: "tempPreviewImage", value: event });
            this.reportValidation();
          };
          reader.readAsDataURL(event);
        } else {
          this.tempPreviewFile = null;
          this.validTempPreviewFile = false;

          this.params.previewImageUrl = this.previewImageUrlOriginal;
        }
        this.isValidSize[index - 1] = !(event !== undefined && event.size > 1000000);
      }
      this.isValidType[index - 1] = !(event !== undefined && event.type !== "image/jpeg" && event.type !== "image/png");
      this.reportValidation();

      this.fileModels[index - 1] = event;
      this.$emit("fileImageDataUpdate", this.fileModels);
    },
    reportValidation() {
      for (const item of this.isValidSize) {
        if (!item) {
          this.$emit("updateSaveStatus", { key: `ItemImage`, value: false });
          return;
        }
      }
      for (const item of this.isValidType) {
        if (!item) {
          this.$emit("updateSaveStatus", { key: `ItemImage`, value: false });
          return;
        }
      }
      if (this.editOriginalFiles && this.params.originalImageLocal) {
        if (!this.validTempOriginalFile) {
          this.$emit("updateSaveStatus", { key: `ItemImage`, value: false });
          return;
        }
      }
      if (this.editOriginalFiles && !this.params.originalImageLocal) {
        if (!this.validTempOriginalUrl) {
          this.$emit("updateSaveStatus", { key: `ItemImage`, value: false });
          return;
        }
      }
      if (this.editPreviewFiles && this.params.previewImageLocal) {
        if (!this.validTempPreviewFile) {
          this.$emit("updateSaveStatus", { key: `ItemImage`, value: false });
          return;
        }
      }
      if (this.editPreviewFiles && !this.params.previewImageLocal) {
        if (!this.validTempPreviewUrl) {
          this.$emit("updateSaveStatus", { key: `ItemImage`, value: false });
          return;
        }
      }
      this.$emit("updateSaveStatus", { key: `ItemImage`, value: true });
    },
  },
});
</script>

<style scoped>
.select-image-type-row {
  padding-bottom: 0.5em !important;
}
</style>
