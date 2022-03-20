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
  <v-dialog scrollable v-model="show" max-width="700">
    <v-card>
      <v-system-bar color="error" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title>シナリオ削除</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-spacer></v-spacer>

      <v-card-subtitle> 削除したいシナリオバージョンを選択してください </v-card-subtitle>
      <v-card-text>
        <v-data-table
          v-model="selectedVersion"
          :headers="headers"
          :items="scenarioVersions"
          show-select
          item-key="name"
          fixed-header
          :items-per-page="20"
          :footer-props="{
            'items-per-page-options': [20, 50, 100],
          }"
          :height="380"
        ></v-data-table>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-btn
          color="error"
          elevation="4"
          class="px-6 mr-2"
          :disabled="selectedVersion.length === 0"
          @click="onDeleteClick"
        >
          <v-icon left>mdi-delete</v-icon>
          削除
        </v-btn>
        <v-btn color="" elevation="4" class="px-6 mr-2" @click="show = false">
          <v-icon left>mdi-cancel</v-icon>
          キャンセル
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { SCENARIO_LANG_TYPES } from "@/store/modules/scenarios/scenarios.constants";
import { CHANGE_ACTIVE_SCENARIO, DOWNLOAD_EXPORT_FILE } from "@/store/action-types";
import { cloneDeep } from "lodash";
import moment from "moment";

interface LocalState {
  selectedVersion: Array<any>;
  scenarioVersions: Array<any>;
  headers: Array<any>;
}

export default Vue.extend({
  props: {
    visible: Boolean,
    close: Function,
    previousSelection: Array,
    resetSelection: Boolean,
  },
  data(): LocalState {
    return {
      selectedVersion: [],
      scenarioVersions: [],
      headers: [
        {
          text: "シナリオバージョン",
          value: "name",
          width: "40%",
        },
        /*{
          text: "対応言語",
          sortable: false,
          value: "languages",
        },*/
        {
          text: "更新日付",
          value: "updateDate",
          width: "50%",
        },
      ],
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.scenarioVersions = this.activeScenario ? this.mapVersionData(this.activeScenario.versions) : [];

        if (!this.resetSelection) {
          for (var i = 0; i < this.scenarioVersions.length; i++) {
            if (this.previousSelection.includes(this.scenarioVersions[i].name)) {
              this.selectedVersion.push(this.scenarioVersions[i]);
            }
          }
        } else {
          this.resetSelectedVersion();
        }
      }
    },
  },
  components: {},
  computed: {
    ...mapState({
      scenariosList: (state: any) => state.scenarios.scenariosList,
      selectedScenario: (state: any) => state.scenarios.selectedScenario,
      activeScenario: (state: any) => state.scenarios.activeScenario,
      activeScenarioData: (state: any) => state.scenarios.activeScenarioData,
    }),
    show: {
      get(): boolean {
        // this.resetSelectedVersion();
        return this.visible;
      },
      set(value: boolean): void {
        if (!value) {
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    mapVersionData(data: any): Array<any> {
      var mappedVersions = [];
      for (const value in data) {
        var translatedLangArray = [];
        for (const lang of data[value]["languages"]) {
          translatedLangArray.push(this.convToJapanese(lang));
        }
        //converting utc time to local time for displaying it in client side
        var dateReplace = data[value]["updateDate"].replace("T", " ").replace("Z", "");
        var clientDate = moment.utc(dateReplace).local().format("YYYY-MM-DD HH:mm:ss");

        mappedVersions.push({
          name: value,
          languages: translatedLangArray,
          updateDate: clientDate,
        });
      }
      return mappedVersions;
    },
    convToJapanese(value: any): any {
      return SCENARIO_LANG_TYPES[value.substring(0, 2)] ? SCENARIO_LANG_TYPES[value.substring(0, 2)].text : value;
    },
    onDeleteClick(): void {
      var payload = {
        scenarioName: this.activeScenario.scenarioId,
        versionNames: this.selectedVersion.map((a) => a.name),
        lengthOfScenarioVersions: this.scenarioVersions.length,
      };
      this.$emit("onDeleteTrigger", payload);
    },
    resetSelectedVersion(): void {
      this.selectedVersion = [];
    },
  },
});
</script>
