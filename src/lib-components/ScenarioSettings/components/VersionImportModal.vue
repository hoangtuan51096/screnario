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
  <v-dialog scrollable persistent v-model="show" max-width="600">
    <v-card max-width="100%" style="overflow-x: hidden">
      <v-system-bar color="primary" dark height="5"></v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title class="blue-grey--text text--darken-4 font-weight-bold">
          LBDインポート
        </v-toolbar-title>
      </v-toolbar>
      <template v-if="!isImportingScenarioData">
        <v-row class="mx-2">
          <v-col cols="12">
            <v-file-input v-model="fileData" accept=".lbd,.zip,application/zip"></v-file-input>
          </v-col>
        </v-row>
        <v-row class="mx-2">
          <v-col cols="6">
            シナリオ
            <v-text-field v-model="scenarioName" label="シナリオ" single-line :disabled="true"> </v-text-field>
          </v-col>
          <v-col cols="6">
            バージョン
            <v-text-field
                v-model="scenarioVersion"
                label="バージョン"
                single-line
                ref="scenarioVersion"
                :rules="[rules.isValidVersionName]"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <v-row class="mx-2">
          <v-col cols="6">
            <v-checkbox
                :style="hasActionPermission(
                    'hideButton',
                    'ScenarioSettings_VersionImportModal_SetAsActive'
                    ) ? displayNoneButtonPermissionStyle()
                      : ''"
                v-model="setAsActive"
                label="有効にする"
            />
          </v-col>
        </v-row>
      </template>
      <template v-if="isImportingScenarioData">
        <v-row justify="center" align="center">
          <v-col md="1">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
          </v-col>
        </v-row>
      </template>
      <v-card-actions class="pa-4 d-flex justify-end" v-if="!isImportingScenarioData">
        <template>
          <v-btn class="blue-grey--text" outlined @click="cancelImport">
            キャンセル
          </v-btn>
          <v-btn
              color="primary"
              elevation="4"
              class="ml-2"
              :disabled="disableImport"
              @click="hasActionPermission('click', 'backendRequest') ? importFile() : showActionPermissionError()"
          >
            実行
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import {mapActions, mapMutations, mapState} from "vuex";
import {UPLOAD_IMPORT_FILE} from "@/store/action-types";
import {SET_IMPORTING_SCENARIO_DATA_ERROR} from "@/store/mutation-types";
import JSZip from "jszip";

export default Vue.extend({
  props: {
    visible: Boolean,
    scenario: Object,
    versionList: Array,
  },
  watch: {
    fileData() {
      if (!this.fileData) {
        this.scenarioName = "";
      }
      if (this.fileData) {
        JSZip.loadAsync(this.fileData)
          .then((result) => {
            result
              .file("model.json")
              .async("string")
              .then((data) => {
                var jsonResponse = JSON.parse(data);
                var temp = jsonResponse["meta"]["name"];
                if (
                  this.activeScenarioData &&
                  this.activeScenarioData.activeScenarioId !== undefined &&
                  this.activeScenarioData.activeScenarioId !== null &&
                  this.activeScenarioData.activeScenarioId !== "" &&
                  temp != this.activeScenarioData.activeScenarioId
                ) {
                  this.fileData = undefined;
                  this.setImportingScenarioDataError(
                    new Error(
                      "インポートするLBDファイルのBot名は `" +
                        this.activeScenarioData.activeScenarioId +
                        "` でなければなりません"
                    )
                  );
                }
                var talks = jsonResponse["chats"];
                talks.forEach((tlk) => {
                  if (this.specialScenarios.includes(tlk["name"])) {
                    this.fileData = undefined;
                    this.setImportingScenarioDataError(
                      new Error(
                        `"${tlk["name"]}" はシステムで予約されているトーク名です。インポートするには、LBDファイルのトークを削除してください。`
                      )
                    );
                  }
                });
                this.scenarioName = temp;
              })
              .catch((err) => {
                this.fileData = undefined;
                this.setImportingScenarioDataError(err);
              });
          })
          .catch((err) => {
            this.fileData = undefined;
            this.setImportingScenarioDataError(err);
          });
      }

      if (this.fileData && this.scenarioVersion) {
        this.disableImport = false;
      } else {
        this.disableImport = true;
      }

      const temp = this.scenarioVersion;
      this.scenarioVersion = "";
      this.$nextTick(() => {
        this.scenarioVersion = temp;
        this.$refs.scenarioVersion.focus();
      });
    },
    scenarioVersion() {
      this.disableImport = !(this.fileData && this.scenarioVersion && this.checkValidVersionName(this.scenarioVersion));
    },
    importingScenarioDataError: function (val) {
      if (val) {
        if (val instanceof String) {
          this.$snackbar.show({text: val, type: "error"});
        } else {
          this.$snackbar.show({text: val.message, type: "error"});
        }
      }
    },
    importFinishSuccess: function (val) {
      if (val) {
        this.$emit("onImportFinishSuccess");
        this.fileData = undefined;
      }
    },
    visible: function (val) {
      if (val) {
        this.scenarioVersion = this.getAutoScenarioVersion();

        this.scenarioName = "";
      }
    },
  },
  data() {
    return {
      fileData: undefined,
      scenarioName: "",
      disableImport: true,
      scenarioVersion: "",
      setAsActive: false,
      specialScenarios: ["損傷報告"],
      rules: null
    };
  },
  components: {},
  computed: {
    ...mapState({
      isImportingScenarioData: (state) => state.scenarios.isImportingScenarioData,
      importingScenarioDataError: (state) => state.scenarios.importingScenarioDataError,
      importFinishSuccess: (state) => state.scenarios.importFinishSuccess,
      activeScenarioData: (state) => state.scenarios.activeScenarioData,
      activeScenario: (state) => state.scenarios.activeScenario,
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
    activeScenarioName() {
      if (this.activeScenarioData && this.activeScenarioData.activeScenarioId) {
        return this.activeScenarioData.activeScenarioId;
      }
      return '';
    }
  },
  methods: {
    ...mapActions({
      uploadImportFile: UPLOAD_IMPORT_FILE,
    }),
    ...mapMutations({
      setImportingScenarioDataError: SET_IMPORTING_SCENARIO_DATA_ERROR,
    }),
    getAutoScenarioVersion() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      return "ver" + yyyy + mm + dd;
    },
    cancelImport() {
      this.show = false;
      this.fileData = undefined;
      this.scenarioName = "";
      this.scenarioVersion = "";
      this.setAsActive = false;
    },
    importFile() {
      if (!this.checkValidVersionName(this.scenarioVersion)) {
        this.$snackbar.show({
          text: "同名のバージョンが存在しています。別のバージョン名を指定してください。",
          type: "error",
        });
        this.disableImport = true;
        this.$refs.scenarioVersion.focus();
        return;
      }

      let setAsActiveValue = this.setAsActive;
      if (
          !this.activeScenarioData ||
          this.activeScenarioData.activeScenarioId === "" ||
          this.activeScenarioData.activeScenarioId == null
      ) {
        setAsActiveValue = true;
      }
      const payload = {
        fileData: this.fileData,
        scenarioName: this.scenarioName,
        scenarioVersion: this.scenarioVersion,
        setAsActive: setAsActiveValue,
        activeScenario: this.activeScenarioData,
      };
      this.uploadImportFile(payload);
    },
    checkValidVersionName(value) {
      return !this.versionList.includes(value); // valid === not in the version list
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
