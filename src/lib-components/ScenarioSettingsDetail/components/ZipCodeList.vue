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
  <v-dialog scrollable v-model="show" max-width="900">
    <v-card>
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title>郵便番号リスト</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="processZipCodes"
          :items-per-page="5"
          :height="300"
          :loading="isFetchingZipCodes"
        >
        </v-data-table>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-row>
          <v-btn
            color="primary"
            elevation="4"
            class="px-6 ml-2 mr-2"
            @click="downloadCSV()"
            :loading="isExportingScenarioData"
            :disabled="zipCodes.length == 0"
          >
            <v-icon left>mdi-file-delimited</v-icon>
            CSV出力
          </v-btn>
          <v-btn
            color="error"
            elevation="4"
            class="px-6 ml-2 mr-2"
            @click="deleteCodes()"
            :loading="isFetchingZipCodes"
            :disabled="zipCodes.length == 0"
          >
            <v-icon left>mdi-delete-forever</v-icon>
            削除
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn elevation="4" class="px-6 ml-2 mr-2" @click="show = false"
            ><v-icon left>mdi-cancel</v-icon>キャンセル</v-btn
          >
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions } from "vuex";
import { GET_ZIP_CODES, DELETE_ZIP_CODES, DOWNLOAD_ZIP_CSV } from "@/store/action-types";
import { cloneDeep } from "lodash";

interface LocalState {
  headers: Array<any>;
}

export default Vue.extend({
  data(): LocalState {
    return {
      headers: [
        {
          text: "ID",
          sortable: true,
          value: "id",
          width: "40%",
        },
        {
          text: "郵便番号",
          sortable: true,
          value: "zipCode",
          width: "30%",
        },
      ],
    };
  },
  watch: {},
  props: {
    visible: Boolean,
    scenarioName: String,
    versionName: String,
    close: Function,
  },
  computed: {
    ...mapState({
      isFetchingZipCodes: (state: any) => state.scenarios.isFetchingZipCodes,
      fetchZipCodeError: (state: any) => state.scenarios.fetchZipCodeError,
      zipCodes: (state: any) => state.scenarios.zipCodes,
      isExportingScenarioData: (state: any) => state.scenarios.isExportingScenarioData,
      exportingScenarioDataError: (state: any) => state.scenarios.exportingScenarioDataError,
      exportingScenarioDataWarning: (state: any) => state.scenarios.exportingScenarioDataWarning,
    }),
    show: {
      get(): boolean {
        return this.visible;
      },
      set(value: boolean): void {
        if (!value) {
          this.$emit("close");
        }
      },
    },
    processZipCodes(): Array<any> {
      var zipCodeData = cloneDeep(this.zipCodes);
      var filteredData = [];
      for (var index = 0; index < zipCodeData.length; index++) {
        var item = {
          id: index + 1,
          zipCode: zipCodeData[index],
        };
        filteredData.push(item);
      }
      filteredData.splice(filteredData.length);
      return filteredData;
    },
  },
  methods: {
    ...mapActions({
      fetchZipCodes: GET_ZIP_CODES,
      deleteZipcodes: DELETE_ZIP_CODES,
      downloadZipCSV: DOWNLOAD_ZIP_CSV,
    }),
    async deleteCodes(): Promise<void> {
      this.$dialog.show({
        title: "郵便番号削除",
        text: "郵便番号削除リストを削除してもよろしいですか？",
        type: "warning",
        btnConfirmTitle: "はい",
        onConfirm: async () => {
          var payload = {
            scenarioId: this.scenarioName,
            versionId: this.versionName,
          };
          await this.deleteZipcodes(payload);
          this.checkError(this.fetchZipCodeError, "データを削除しました");
        },
      });
    },
    async downloadCSV(): Promise<void> {
      var payload = {
        scenario: this.versionName,
      };
      await this.downloadZipCSV(payload);
      this.checkError(this.exportingScenarioDataError, "CSVエクスポートしました");
    },
    checkError(errorMessage: any, successMessage: any): void {
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
  created() {},
});
</script>
