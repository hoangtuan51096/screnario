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
.edit-image-file-row {
  display: inline;
}
</style>

<template>
  <div class="py-4">
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <v-switch v-model="editOriginalFiles" label="動画を変更する"> </v-switch>
          </v-col>
        </v-row>
        <template v-if="editOriginalFiles">
          <label>動画</label>
          <v-row class="select-image-type-row">
            <v-select
              v-model="params.originalContentLocal"
              :items="contentOptions"
              single-line
              outlined
              dense
              hide-details
            >
            </v-select>
          </v-row>
          <v-row class="edit-image-file-row">
            <v-text-field
              v-if="!params.originalContentLocal"
              outlined
              single-line
              hide-details
              dense
              label="URL"
              v-model="tempOriginalUrl"
              @change="onChangeValue($event, 'originalContentUrl')"
            >
            </v-text-field>
            <template v-else>
              <v-file-input
                v-model="fileModels[0]"
                @change="fileDataChanged($event, 1)"
                label="新しい動画を選択"
                accept=".mp4"
                :rules="[rules.fileTypeOriginal, rules.fileSizeOriginal]"
              >
              </v-file-input>
            </template>
          </v-row>
        </template>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <label>現在プレビュー画像</label>
        <v-row>
          <v-col align="center" justify="center">
            <img
              v-bind:src="params.previewImageUrl + '?x-request=html'"
              height="150px"
              onclick="window.open(this.src)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-switch v-model="editPreviewFiles" label="プレビュー画像を変更する"> </v-switch>
          </v-col>
        </v-row>
        <template v-if="editPreviewFiles">
          <label>動画</label>
          <v-row class="select-image-type-row">
            <v-select
              v-model="params.previewImageLocal"
              :items="contentOptions"
              single-line
              outlined
              dense
              hide-details
            >
            </v-select>
          </v-row>
          <v-row class="edit-image-file-row">
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
                :rules="[rules.fileTypePreview, rules.fileSizePreview]"
              >
              </v-file-input>
            </template>
          </v-row>
          <v-row>
            <v-col align="center" justify="center">
              <img
                v-if="!params.previewImageLocal && this.tempPreviewUrl"
                v-bind:src="this.tempPreviewUrl + '?x-request=html'"
                height="150px"
                onclick="window.open(this.src)"
              />
              <img
                v-if="params.previewImageLocal && this.tempPreviewFile"
                v-bind:src="this.tempPreviewFile"
                height="150px"
                onclick="window.open(this.src)"
              />
            </v-col>
          </v-row>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { cloneDeep } from "lodash";

interface LocalState {
  fileModels: Array<any>;
  allowedContentType: Array<any>;
  contentOptions: Array<any>;
  sizeLimitOriginal: number;
  allowedContentTypePreview: Array<string>;
  sizeLimitPreview: number;
  editOriginalFiles: boolean;
  editPreviewFiles: boolean;
  tempOriginalUrl: any;
  tempOriginalFile: any;
  validTempOriginalUrl: boolean;
  validTempOriginalFile: boolean;
  tempPreviewUrl: any;
  tempPreviewFile: any;
  validTempPreviewUrl: boolean;
  validTempPreviewFile: boolean;
  rules: any;
  isValidSize: Array<boolean>;
  isValidType: Array<boolean>;
  originalContentUrlBackUp: any;
}

export default Vue.extend({
  name: "ItemVideo",
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
      this.tempOriginalUrl = null;
      this.tempOriginalFile = null;
      this.validTempOriginalUrl = false;
      this.validTempOriginalFile = false;
      this.editPreviewFiles = false;
      this.tempPreviewUrl = null;
      this.tempPreviewFile = null;
      this.validTempPreviewUrl = false;
      this.validTempPreviewFile = false;
      this.originalContentUrlBackUp = cloneDeep(value.originalContentUrl);
    },
    "params.originalContentLocal"(value) {
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
      if (value === false) {
        this.params.originalContentUrl = this.originalContentUrlBackUp;
        this.tempOriginalUrl = null;
        this.fileModels[0] = undefined;
      }
      this.$emit("updateParams", { key: "editingOriginalVideo", value: value });
      this.reportValidation();
    },
    editPreviewFiles(value) {
      this.$emit("updateParams", { key: "editingPreviewImage", value: value });
      this.reportValidation();
    },
    canSave(value) {
      if (value) {
        for (var i = 0; i < 2; i++) {
          this.isValidSize[i] = true;
          this.isValidType[i] = true;
        }
      }
    },
  },
  data(): LocalState {
    return {
      fileModels: [undefined, undefined],
      allowedContentType: ["video/mp4"],
      contentOptions: [
        { text: "URL", value: false },
        { text: "ローカルファイル", value: true },
      ],
      sizeLimitOriginal: 200000000,
      allowedContentTypePreview: ["image/jpg", "image/jpeg", "image/png"],
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
          file === undefined || !(file.size > 200000000) || "200MB以下の動画ファイルをアップロードして下さい",
        fileSizePreview: (file) =>
          file === undefined || !(file.size > 1000000) || "1MB以下の画像ファイルをアップロードして下さい",
        fileTypeOriginal: (file) => file === undefined || file.type === "video/mp4" || "動画は .mp4 しか出来ません",
        fileTypePreview: (file) =>
          file === undefined ||
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          "画像は .jpg .jpeg .png しか出来ません",
      },
      isValidSize: [true, true],
      isValidType: [true, true],
      originalContentUrlBackUp: cloneDeep((this as any).params.originalContentUrl) || {},
    };
  },
  methods: {
    onChangeValue(event: any, keyValue: any): void {
      if (keyValue == "originalContentUrl") {
        if (event !== "") {
          const response = fetch(event, {
            method: "HEAD",
          })
            .then((response) => {
              if (response.status == 200 && this.allowedContentType.includes(response.headers.get("Content-Type"))) {
                if (response.headers.get("Content-Length") > this.sizeLimitOriginal) {
                  this.params.originalContentUrl = this.originalContentUrlBackUp;
                  this.tempOriginalUrl = null;
                  this.validTempOriginalUrl = false;
                  this.reportValidation();
                  this.$snackbar.show({ text: "ファイルサイズは200MB以下にしてください。", type: "error" });
                } else {
                  this.params.originalContentUrl = this.tempOriginalUrl;
                  this.validTempOriginalUrl = true;
                  this.reportValidation();
                  this.$emit("updateParams", { key: "tempOriginalVideo", value: event });
                }
              } else {
                this.params.originalContentUrl = this.originalContentUrlBackUp;
                this.tempOriginalUrl = null;
                this.validTempOriginalUrl = false;
                this.reportValidation();
                this.$snackbar.show({ text: "URL形式が正しくありません。", type: "error" });
              }
              return response;
            })
            .catch((error) => {
              this.params.originalContentUrl = this.originalContentUrlBackUp;
              this.tempOriginalUrl = null;
              this.validTempOriginalUrl = false;
              this.reportValidation();
              this.$snackbar.show({
                text: "このURLの内容を読み込めない。URLの内容をダウンロードしてLBDでローカルファイル使ってください。",
                type: "error",
              });
              return error;
            });
        } else {
          this.params.originalContentUrl = this.originalContentUrlBackUp;
          this.validTempOriginalUrl = false;
          this.reportValidation();
        }
      } else if (keyValue == "previewImageUrl") {
        if (event !== "") {
          const response = fetch(event, {
            method: "HEAD",
          })
            .then((response) => {
              if (
                response.status == 200 &&
                this.allowedContentTypePreview.includes(response.headers.get("Content-Type"))
              ) {
                if (response.headers.get("Content-Length") > this.sizeLimitPreview) {
                  this.tempPreviewUrl = null;
                  this.validTempPreviewUrl = false;
                  this.reportValidation();
                  this.$snackbar.show({ text: "ファイルサイズは1MB以下にしてください。", type: "error" });
                } else {
                  this.validTempPreviewUrl = true;
                  this.reportValidation();
                  this.$emit("updateParams", { key: "tempPreviewImage", value: event });
                }
              } else {
                this.tempPreviewUrl = null;
                this.validTempPreviewUrl = false;
                this.reportValidation();
                this.$snackbar.show({ text: "URL形式が正しくありません。", type: "error" });
              }
              return response;
            })
            .catch((error) => {
              this.tempPreviewUrl = null;
              this.validTempPreviewUrl = false;
              this.reportValidation();
              this.$snackbar.show({
                text: "このURLの内容を読み込めない。URLの内容をダウンロードしてLBDでローカルファイル使ってください。",
                type: "error",
              });
              return error;
            });
        } else {
          this.validTempPreviewUrl = false;
          this.reportValidation();
        }
      } else {
        this.$emit("updateParams", { key: keyValue, value: event });
      }
    },
    fileDataChanged(event: any, index: any): void {
      if (index - 1 === 0) {
        this.isValidSize[index - 1] = !(event !== undefined && event.size > 200000000);
        this.isValidType[index - 1] = !(event !== undefined && event.type !== "video/mp4");
        if (event) {
          let reader = new FileReader();
          reader.onload = (e) => {
            this.tempOriginalFile = e.target.result;
            this.params.originalContentUrl = this.tempOriginalFile;
            this.validTempOriginalFile = true;
            this.$emit("updateParams", { key: "tempOriginalVideo", value: event });
            this.reportValidation();
          };
          reader.readAsDataURL(event);
        } else {
          this.params.originalContentUrl = this.originalContentUrlBackUp;
          this.tempOriginalFile = null;
          this.validTempOriginalFile = false;
        }
      } else {
        this.isValidSize[index - 1] = !(event !== undefined && event.size > 1000000);
        this.isValidType[index - 1] = !(
          event !== undefined &&
          event.type !== "image/jpeg" &&
          event.type !== "image/png"
        );
        if (event) {
          let reader = new FileReader();
          reader.onload = (e) => {
            this.tempPreviewFile = e.target.result;
            this.validTempPreviewFile = true;
            this.$emit("updateParams", { key: "tempPreviewImage", value: event });
            this.reportValidation();
          };
          reader.readAsDataURL(event);
        } else {
          this.tempPreviewFile = null;
          this.validTempPreviewFile = false;
        }
      }
      this.reportValidation();

      this.fileModels[index - 1] = event;
      this.$emit("fileVideoDataUpdate", this.fileModels);
    },
    reportValidation(): void {
      for (const item of this.isValidSize) {
        if (!item) {
          this.$emit("updateSaveStatus", { key: `ItemVideo`, value: false });
          return;
        }
      }

      for (const item of this.isValidType) {
        if (!item) {
          this.$emit("updateSaveStatus", { key: `ItemVideo`, value: false });
          return;
        }
      }

      if (this.editOriginalFiles && this.params.originalContentLocal) {
        if (!this.validTempOriginalFile) {
          this.$emit("updateSaveStatus", { key: `ItemVideo`, value: false });
          return;
        }
      }
      if (this.editOriginalFiles && !this.params.originalContentLocal) {
        if (!this.validTempOriginalUrl) {
          this.$emit("updateSaveStatus", { key: `ItemVideo`, value: false });
          return;
        }
      }

      if (this.editPreviewFiles && this.params.previewImageLocal) {
        if (!this.validTempPreviewFile) {
          this.$emit("updateSaveStatus", { key: `ItemVideo`, value: false });
          return;
        }
      }
      if (this.editPreviewFiles && !this.params.previewImageLocal) {
        if (!this.validTempPreviewUrl) {
          this.$emit("updateSaveStatus", { key: `ItemVideo`, value: false });
          return;
        }
      }
      this.$emit("updateSaveStatus", { key: `ItemVideo`, value: true });
    },
  },
});
</script>
