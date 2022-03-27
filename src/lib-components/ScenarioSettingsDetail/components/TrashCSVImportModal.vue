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
.gomi-import-instruction-line {
  background: linear-gradient(#000, #000) no-repeat center/1px 100%;
}
.gomi-import-instruction-bubble {
  text-align: center;
}
</style>
<template>
  <v-dialog scrollable persistent v-model="show" :max-width="maxWidthDialog">
    <v-card>
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title v-if="!isLocationCSV"> ゴミ分別</v-toolbar-title>
        <v-toolbar-title v-else> 郵便番号のcsv登録</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon　@click="endImport">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text v-if="!isLocationCSV && !existingTalks.includes('ゴミ分別')">
        <div>
          <p class="text-h5 primary--text">まだゴミ分別についての情報が追加されていないようです。</p>
          <p>以下の手順に治って、3ステップでゴミの情報をご登録いただけます。</p>
          <v-row>
            <v-col class="gomi-import-instruction-bubble text-center" cols="1">
              <v-icon size="35" color="secondary">mdi-numeric-1-circle</v-icon>
            </v-col>
            <v-col>
              <p class="font-weight-bold">ゴミ分別登録用のテンプレート・ファイルをダウンロード</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="1" class="gomi-import-instruction-line" style="background: linear-gradient(#000, #000) no-repeat center/1px 100%;"> </v-col>
            <v-col>
              <p>CSVファイルにて、ゴミ分別登録用のテンプレートをご用意しております。</p>
              <p>以下のボタンよりダウンロードいただき、ご記入を進めてください。</p>
              <v-btn :href="baseSampleFileUrl + sampleFileName" target="_blank" download>
                <v-icon>mdi-file-delimited</v-icon>テンプレートをダウンロードする
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col class="gomi-import-instruction-bubble text-center" cols="1">
              <v-icon size="35" color="secondary">mdi-numeric-2-circle</v-icon>
            </v-col>
            <v-col>
              <p class="font-weight-bold">テンプレートにゴミ情報を記載する</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="1" class="gomi-import-instruction-line" style="background: linear-gradient(#000, #000) no-repeat center/1px 100%;"> </v-col>
            <v-col cols="4">
              <v-img
                @click="imageDisplay(require('../../assets/scenario-assets/gomiSample.jpg'))"
                :src="require('../../assets/scenario-assets/gomiSample.jpg')"
                max-width="250"
              >
              </v-img>
            </v-col>
            <v-col>
              <p>テンプレートはエクセルやNumbersで開くことができます。</p>
              <p>記載の方法にしたがって、記入を行って下さい。</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="gomi-import-instruction-bubble text-center" cols="1">
              <v-icon size="35" color="secondary">mdi-numeric-3-circle</v-icon>
            </v-col>
            <v-col>
              <p class="font-weight-bold">記載したファイルをアップロードする</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="1" class="gomi-import-instruction-line" style="background: linear-gradient(#000, #000) no-repeat center/1px 100%;"> </v-col>
            <v-col cols="10">
              <p>テンプレートをこちらにアップロードすると、ゴミの種類の登録が完了します。</p>
              <v-file-input v-model="fileData" accept=".csv"> </v-file-input>
            </v-col>
          </v-row>
          <v-row class="justify-center">
            <span class="caption caption-text">ファイル形式：CSV</span>
          </v-row>
        </div>
      </v-card-text>
      <v-card-text v-else-if="isLocationCSV && !hasZipCodes">
        <div>
          <p class="text-h5 primary--text">まだ郵便番号が追加されていないようです。</p>
          <p>以下の手順に治って、3ステップで郵便番号をご登録いただけます。</p>
          <v-row>
            <v-col class="gomi-import-instruction-bubble text-center" cols="1">
              <v-icon size="35" color="secondary">mdi-numeric-1-circle</v-icon>
            </v-col>
            <v-col>
              <p class="font-weight-bold">郵便番号登録用のテンプレート・ファイルをダウンロード</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="1" class="gomi-import-instruction-line" style="background: linear-gradient(#000, #000) no-repeat center/1px 100%;"> </v-col>
            <v-col>
              <p>CSVファイルにて、郵便番号登録用のテンプレートをご用意しております。</p>
              <p>以下のボタンよりダウンロードいただき、ご記入を進めてください。</p>
              <v-btn :href="baseSampleFileUrl + sampleZipCodeFileName" target="_blank" download>
                <v-icon>mdi-file-delimited</v-icon>テンプレートをダウンロードする
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col class="gomi-import-instruction-bubble text-center" cols="1">
              <v-icon size="35" color="secondary">mdi-numeric-2-circle</v-icon>
            </v-col>
            <v-col>
              <p class="font-weight-bold">テンプレートに郵便番号を記載する</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="1" class="gomi-import-instruction-line" style="background: linear-gradient(#000, #000) no-repeat center/1px 100%;"> </v-col>
            <v-col>
              <p>テンプレートはエクセルやNumbersで開くことができます。</p>
              <p>各行は1つの郵便番号に対応します。また、ヘッダーはありません。</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="gomi-import-instruction-bubble text-center" cols="1">
              <v-icon size="35" color="secondary">mdi-numeric-3-circle</v-icon>
            </v-col>
            <v-col>
              <p class="font-weight-bold">記載したファイルをアップロードする</p>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="1" class="gomi-import-instruction-line" style="background: linear-gradient(#000, #000) no-repeat center/1px 100%;"> </v-col>
            <v-col cols="10">
              <p>テンプレートをこちらにアップロードすると、郵便番号の登録が完了します。</p>
              <v-file-input v-model="fileData" accept=".csv"> </v-file-input>
            </v-col>
          </v-row>
          <v-row class="justify-center">
            <span class="caption caption-text">ファイル形式：CSV</span>
          </v-row>
        </div>
      </v-card-text>
      <v-card-text v-else>
        <v-row>
          <v-col>
            <v-file-input v-model="fileData" accept=".csv"> </v-file-input>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="pa-4">
        <template>
          <v-row class="justify-center">
            <v-btn
              color="primary"
              elevation="4"
              class="px-6 mr-2"
              @click="importFile"
              :loading="isFetchingScenarioDetail"
              :disabled="!fileData"
            >
              <v-icon left>mdi-import</v-icon>
              登録する
            </v-btn>
            <v-btn elevation="4" class="px-6 mr-2" @click="endImport">
              <v-icon left>mdi-cancel</v-icon>
              キャンセル
            </v-btn>
          </v-row>
        </template>
      </v-card-actions>
    </v-card>
    <ImageDisplayModal :visible="showImageDisplay" :imgSrc="imageSource" @close="showImageDisplay = false" />
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions } from "vuex";
import {UPLOAD_CSV_FILE, UPLOAD_LOCATION_CSV_FILE} from "@/store/action-types";
import ImageDisplayModal from "../../components/common/ImageDisplayModal.vue";

export default Vue.extend({
  props: {
    visible: Boolean,
    scenario: Object,
    scenarioName: String,
    versionName: String,
    versionList: Array,
    isLocationCSV: Boolean,
    existingTalks: Array,
  },
  watch: {
    scenarioVersion() {
      if (this.fileData && this.scenarioVersion && this.checkValidVersionName(this.scenarioVersion)) {
        this.disableImport = false;
      } else {
        this.disableImport = true;
      }
    },
    importFinishSuccess(val) {
      if (val) {
        this.$emit("onImportFinishSuccess");
        this.fileData = undefined;
      }
    },
  },
  data() {
    return {
      fileData: undefined,
      disableImport: true,
      scenarioVersion: "",
      rules: null,
      showImageDisplay: false,
      imageSource: null,
      sampleFileName: "gomibunbetsu-template.csv",
      sampleZipCodeFileName: "damage_report_zipcodes_template.csv",
      baseSampleFileUrl: process.env.BASE_URL,
    };
  },
  components: { ImageDisplayModal },
  computed: {
    ...mapState({
      isFetchingScenarioDetail: (state) => state.scenarios.isFetchingScenarioDetail,
      importingScenarioDataError: (state) => state.scenarios.importingScenarioDataError,
      importFinishSuccess: (state) => state.scenarios.importFinishSuccess,
      activeScenarioData: (state) => state.scenarios.activeScenarioData,
      activeScenario: (state) => state.scenarios.activeScenario,
      zipCodes: (state) => state.scenarios.zipCodes,
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
      if (this.isLocationCSV && this.hasZipCodes) return 700;
      else if (this.existingTalks.includes("ゴミ分別")) return 700;
      return 1000;
    },
    hasZipCodes() {
      return this.zipCodes.length > 0;
    },
  },
  methods: {
    ...mapActions({
      uploadCSVFile: UPLOAD_CSV_FILE,
      uploadLocationCSV: UPLOAD_LOCATION_CSV_FILE,
    }),
    endImport() {
      this.show = false;
      this.fileData = undefined;
    },
    async importFile() {
      var payload = {
        fileData: this.fileData,
        scenarioId: this.scenarioName,
        versionId: this.versionName,
        fetchData: false,
      };
      if (this.fileData.name.split(".").pop() != 'csv') {
        this.$snackbar.show({
          text: "Error: CSVファイルのデコード中にエラーが発生しました。次のコーデックがサポートされています。「shift_jis」「shift_jis_2004」「shift_jisx0213」「utf_8」'",
          type: "error",
        });
        return;
      }
      if (this.isLocationCSV) {
        await this.uploadLocationCSV(payload);
      } else {
        await this.uploadCSVFile(payload);
      }
      this.endImport();
      this.checkError(this.importingScenarioDataError, "保存しました");
    },
    checkValidVersionName(value) {
      return !this.versionList.includes(value); // valid === not in the version list
    },
    imageDisplay(src) {
      this.imageSource = src;
      this.showImageDisplay = true;
    },
    checkError(errorMessage , successMessage) {
      if (errorMessage) {
        this.$snackbar.show({
          text: errorMessage,
          type: "error",
        });
      } else {
        this.$snackbar.show({
          text: successMessage,
        });
      }
    },
  },
  created() {
    this.rules = {
      isValidVersionName: (value) => {
        return this.checkValidVersionName(value) || "同名のバージョンが存在しています";
      }
    };
  }
});
</script>
