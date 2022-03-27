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
            <v-switch v-model="editSoundFile" label="音声を変更する"> </v-switch>
          </v-col>
        </v-row>
        <template v-if="editSoundFile">
          <label>音声</label>
          <v-row class="select-image-type-row">
            <v-select v-model="params.audioFileLocal" :items="audioOptions" single-line outlined dense hide-details>
            </v-select>
          </v-row>
          <v-row class="edit-image-file-row">
            <v-text-field
              v-if="!params.audioFileLocal"
              outlined
              single-line
              hide-details
              dense
              label="URL"
              v-model="tempAudioUrl"
              @change="onChangeValue($event, 'originalContentUrl')"
            >
            </v-text-field>
            <template v-else>
              <v-file-input
                v-model="fileModels[0]"
                @change="fileDataChanged($event, 1)"
                label="新しい音声を選択"
                accept=".m4a"
                :rules="[rules.fileType, rules.fileSize]"
              >
              </v-file-input>
            </template>
          </v-row>
        </template>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <label>期間（秒）</label>
        <v-text-field
          type="number"
          outlined
          single-line
          hide-details
          dense
          :value="params.duration / 1000"
          @input="onChangeValue($event * 1000, 'duration')"
        >
        </v-text-field>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { cloneDeep } from "lodash";

export default Vue.extend({
  name: "ItemAudio",
  props: {
    params: {
      type: Object,
      required: true,
    },
    canSave: Boolean,
  },
  watch: {
    params(value) {
      this.fileModels = [undefined];
      this.editSoundFile = false;
      this.tempAudioUrl = null;
      this.tempAudioFile = null;
      this.validTempAudioUrl = false;
      this.validTempAudioFile = false;
      this.originalContentUrlBackUp = cloneDeep(value.originalContentUrl);
    },
    "params.audioFileLocal"(value) {
      if (this.tempAudioUrl == null) {
        this.validTempAudioUrl = false;
      }
      if (this.tempAudioFile == null) {
        this.validTempAudioFile = false;
      }
      this.reportValidation();
    },
    editSoundFile(value) {
      if (value === false) {
        this.params.originalContentUrl = this.originalContentUrlBackUp;
        this.tempAudioUrl = null;
        this.fileModels = [undefined];
      }
      this.$emit("updateParams", { key: "editingSoundFile", value: value });
      this.reportValidation();
    },
    canSave(value) {
      if (value) {
        this.isValidSize[0] = true;
        this.isValidType[0] = true;
      }
    },
  },
  data() {
    return {
      editSoundFile: false,
      tempAudioUrl: null,
      tempAudioFile: null,
      validTempAudioUrl: false,
      validTempAudioFile: false,
      fileModels: [undefined],
      audioOptions: [
        { text: "URL", value: false },
        { text: "ローカルファイル", value: true },
      ],
      allowedContentType: ["audio/x-m4a", "audio/m4a"],
      sizeLimitOriginal: 200000000,
      rules: {
        fileSize: (file) =>
          file === undefined || !(file.size > 200000000) || "200MB以下の音声ファイルをアップロードして下さい",
        fileType: (file) => file === undefined || file.type === "audio/x-m4a" || "音声は .m4a しか出来ません",
      },
      isValidSize: [true],
      isValidType: [true],
      originalContentUrlBackUp: cloneDeep((this).params.originalContentUrl) || {},
    };
  },
  mounted() {
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemAudio`, value: true });
  },
  methods: {
    onChangeValue(event, keyValue) {
      if (keyValue == "originalContentUrl") {
        if (event !== "") {
          const response = fetch(event, {
            method: "HEAD",
            cache: "no-cache",
          })
            .then((response) => {
              if (response.status == 200 && this.allowedContentType.includes(response.headers.get("Content-Type"))) {
                if (response.headers.get("Content-Length") > this.sizeLimitOriginal) {
                  this.params.originalContentUrl = this.originalContentUrlBackUp;
                  this.tempAudioUrl = null;
                  this.validTempAudioUrl = false;
                  this.reportValidation();
                  this.$snackbar.show({ text: "ファイルサイズは200MB以下にしてください。", type: "error" });
                } else {
                  this.params.originalContentUrl = this.tempAudioUrl;
                  this.validTempAudioUrl = true;
                  this.reportValidation();
                  this.$emit("updateParams", { key: "tempAudioFile", value: event });
                }
              } else {
                this.params.originalContentUrl = this.originalContentUrlBackUp;
                this.tempAudioUrl = null;
                this.validTempAudioUrl = false;
                this.reportValidation();
                this.$snackbar.show({ text: "URL形式が正しくありません。", type: "error" });
              }
              return response;
            })
            .catch((error) => {
              this.params.originalContentUrl = this.originalContentUrlBackUp;
              this.tempAudioUrl = null;
              this.validTempAudioUrl = false;
              this.reportValidation();
              this.$snackbar.show({
                text: "このURLの内容を読み込めない。URLの内容をダウンロードしてLBDでローカルファイル使ってください。",
                type: "error",
              });
              return error;
            });
        } else {
          this.params.originalContentUrl = this.originalContentUrlBackUp;
          this.validTempAudioUrl = false;
          this.reportValidation();
        }
      } else {
        this.params.originalSeconds = event;
        this.$emit("updateParams", { key: keyValue, value: event });
        this.reportValidation();
      }
    },
    fileDataChanged(event, index) {
      this.isValidSize[index - 1] = !(event !== undefined && event.size > 200000000);
      this.isValidType[index - 1] = !(event !== undefined && event.type !== "audio/x-m4a");
      if (event) {
        var reader = new FileReader();
        reader.onload = (e) => {
          this.tempAudioFile = e.target.result;
          this.params.originalContentUrl = this.tempAudioFile;
          this.validTempAudioFile = true;
          this.$emit("updateParams", { key: "tempAudioFile", value: event });
          this.reportValidation();
        };
        reader.readAsDataURL(event);
      } else {
        this.params.originalContentUrl = this.originalContentUrlBackUp;
        this.tempAudioFile = null;
        this.validTempAudioFile = false;
      }
      this.reportValidation();

      this.fileModels[index - 1] = event;
      this.$emit("fileAudioDataUpdate", this.fileModels);
    },
    reportValidation() {
      if (this.editSoundFile && this.params.audioFileLocal) {
        if (!this.validTempAudioFile) {
          this.$emit("updateSaveStatus", { key: `ItemAudio`, value: false });
          return;
        }
      }
      if (this.editSoundFile && !this.params.audioFileLocal) {
        if (!this.validTempAudioUrl) {
          this.$emit("updateSaveStatus", { key: `ItemAudio`, value: false });
          return;
        }
      }
      if (this.isValidSize[0] && this.isValidType[0]) {
        this.$emit("updateSaveStatus", { key: `ItemAudio`, value: true });
      } else {
        this.$emit("updateSaveStatus", { key: `ItemAudio`, value: false });
      }
    },
  },
});
</script>
