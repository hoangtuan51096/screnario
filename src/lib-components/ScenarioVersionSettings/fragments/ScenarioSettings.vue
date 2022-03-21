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
  <v-container fluid>
    <v-overlay :opacity="0.2" z-index="9999" v-if="isFetchingScenarioDetail">
      <content-loading :size="50" text="" />
    </v-overlay>
    <div v-if="!fetchScenariosError">
      <template v-if="isFetchingScenarios">
        <v-row justify="center" align="center">
          <v-col md="1">
            <v-progress-circular :size="50" color="primary" indeterminate> </v-progress-circular>
          </v-col>
        </v-row>
      </template>
      <TalkTable
        v-if="!isFetchingScenarios"
        :key="$route.params.versionId"
        environment="sandbox"
        :searchCriteria="searchCriteriaLocal"
        @onTemplateClick="onTemplateClick"
        @onCreateClick="onCreateClick"
        @onDeleteTrigger="onDeleteTrigger"
      />
    </div>
    <div class="pb4" v-if="fetchScenariosError">
      <ContentLoadError class="mt-10" :error="fetchScenariosError" />
    </div>
    <NewTalkModal
        :visible="showCreateModal"
        :scenarioId="$route.params.scenarioId"
        :versionId="$route.params.versionId"
        @close="showCreateModal = false"
    />
    <DeleteTalkModal
      :visible="showDeleteModal"
      :scenarioId="$route.params.scenarioId"
      :versionId="$route.params.versionId"
      :payload="deletePayload"
      @close="showDeleteModal = false"
    />
    <SpecialTalkModal
        :visible="showSpecialTalkModal"
        :existingTalks="scenarioTalks"
        :versionName="$route.params.versionId"
        :selected="selectedSpecialTalk"
        @onCreateTalks="createSpecialScenarios"
        @onDeleteTalks="deleteSpecialScenarios"
        @toggleTalkState="toggleSpecialScenarios"
        @close="showSpecialTalkModal = false"
    />
    <TrashCSVImportModal
        :visible="showImportTalkModal"
        :existingTalks="scenarioTalkNames"
        :scenarioName="$route.params.scenarioId"
        :versionName="$route.params.versionId"
        :isLocationCSV="false"
        @close="showImportTalkModal = false"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import {
  CREATE_SIMPLE_SPECIAL_SCENARIO, DELETE_SPECIAL_SCENARIO, DELETE_TALK,
  FETCH_ALL_SCENARIOS,
  FETCH_SCENARIO_DETAIL_TALK,
  SAVE_ACTIVE_SCENARIO,
} from "@/store/action-types";
import {
  SET_ACTIVE_SCENARIO_DATA,
  SET_ACTIVE_SCENARIO,
} from "@/store/mutation-types";
import { mapState, mapActions, mapMutations } from "vuex";
import TalkTable from "../components/TalkTable.vue";
import NewTalkModal from "../components/NewTalkModal.vue";
import ContentLoadError from "@/components/common/ContentLoadError.vue";
import DeleteTalkModal from "../components/DeleteTalkModal.vue";
import SpecialTalkModal from "../components/SpecialTalkModal.vue";
import TrashCSVImportModal from "../components/TrashCSVImportModal.vue";
import {cloneDeep} from "lodash";
import {SPECIAL_TALK_TYPES_MAPPING} from "@/store/modules/scenarios/scenarios.constants";

interface LocalState {
  showScenarioVersion: boolean;
  showSpecialTalkModal: boolean;
  selectedSpecialTalk: number;
  showImportTalkModal: boolean;
  showCreateModal: boolean;
  showDeleteModal: boolean;
  basicPayload: any;
  deletePayload: any;
  showVisualizationModal: boolean;
  previousSelection: Array<any>;
  resetSelection: boolean;
  headers: Array<any>;
  searchCriteriaLocal: any;
}

export default Vue.extend({
  props: {
    searchCriteria: Object,
  },
  data(): LocalState {
    return {
      showScenarioVersion: false,
      showSpecialTalkModal: false,
      selectedSpecialTalk: -1,
      showImportTalkModal: false,
      showCreateModal: false,
      showDeleteModal: false,
      basicPayload: {
        scenarioId: (this as any).$route.params.scenarioId,
        versionId: (this as any).$route.params.versionId,
        talkNames: null,
      },
      deletePayload: {},
      showVisualizationModal: false,
      previousSelection: [],
      resetSelection: true,
      headers: [
        {
          text: "シナリオバージョン",
          sortable: false,
          value: "dataId",
          width: "30%",
        },
      ],
      searchCriteriaLocal: (this as any).searchCriteria,
    };
  },
  watch: {
    importingScenarioDataWarning(val) {
      if (val) {
        this.$snackbar.show({ text: val, type: "warning" });
      }
    },
    fetchScenariosError(val) {
      if (val) {
        if (val instanceof String) {
          this.$snackbar.show({ text: val, type: "error" });
        } else {
          this.$snackbar.show({ text: val.message, type: "error" });
        }
      }
    },
    searchCriteria(val) {
      this.searchCriteriaLocal = val;
    }
  },
  components: {
    DeleteTalkModal,
    TalkTable,
    NewTalkModal,
    SpecialTalkModal,
    TrashCSVImportModal,
    ContentLoadError,
  },
  computed: {
    ...mapState({
      isFetchingScenarios: (state: any) => state.scenarios.isFetchingScenarios,
      fetchScenariosError: (state: any) => state.scenarios.fetchScenariosError,
      isFetchingScenarioDetail: (state: any) => state.scenarios.isFetchingScenarioDetail,
      activeScenario: (state: any) => state.scenarios.activeScenario,
      scenarioTalks: (state: any) => state.scenarios.scenarioTalks,
    }),
    scenarioTalkNames() {
      return this.scenarioTalks.map((talk) => talk.params ? talk.params.name || '' : '');
    }
  },
  methods: {
    ...mapMutations({
      setActiveScenarioData: SET_ACTIVE_SCENARIO_DATA,
      setActiveScenario: SET_ACTIVE_SCENARIO,
    }),
    ...mapActions({
      fetchScenarioTalk: FETCH_SCENARIO_DETAIL_TALK,
      createScenarioTalk: CREATE_SIMPLE_SPECIAL_SCENARIO,
      updateActiveScenario: SAVE_ACTIVE_SCENARIO,
      deleteMessagesForSpecialScenario: DELETE_SPECIAL_SCENARIO,
      deleteTalk: DELETE_TALK,
    }),
    onImportTrigger(): void {
      this.showImportModal = true;
      this.showScenarioVersion = false;
    },
    onImportFinishSuccess(): void {
      this.showImportModal = false;
      this.importFinishSuccess(false);
      this.$store.dispatch(FETCH_ALL_SCENARIOS);
    },
    onCreateFinishSuccess(): void {
      this.showCreateModal = false;
      this.createFinishSuccess(false);
      this.$store.dispatch(FETCH_ALL_SCENARIOS);
    },
    onCreateClick(): void {
      this.resetSelection = true;
      this.showCreateModal = true;
    },
    onTemplateClick(val: any): void {
      this.showSpecialTalkModal = true;
      this.selectedSpecialTalk = val;
    },
    onDeleteTrigger(val: any): void {
      this.deletePayload = {
        ...this.basicPayload,
        talkNames: val.map((selected) => selected._name),
        talkIds: val.map((selected) => selected.id),
      };
      this.showDeleteModal = true;
      this.showScenarioVersion = false;
    },
    onDeleteFinishSuccess(): void {
      this.showDeleteModal = false;
      this.showScenarioVersion = false;
      this.deleteFinishSuccess(false);
      this.$store.dispatch(FETCH_ALL_SCENARIOS);
    },
    createSpecialScenarios(talk: any): void {
      const payload = cloneDeep(this.basicPayload);
      payload.talkName = talk;
      switch (talk) {
        case "ゴミ分別":
          this.showSpecialTalkModal = false;
          this.showImportTalkModal = true;
          break;
        default:
          this.createScenarioTalk(payload);
          break;
      }
    },
    toggleSpecialScenarios(talk: any): void {
      const value = this.activeScenario["versions"][this.$route.params.versionId]["specialTalks"][SPECIAL_TALK_TYPES_MAPPING[talk.displayName]];
      this.setScenarioSpecialTalkData(talk.displayName, !value);
    },
    deleteSpecialScenarios(template: any): void {
      const payload = cloneDeep(this.basicPayload);
      delete payload.talkName;
      payload["specialTalkName"] = template.displayName;
      payload["talkIds"] =[template.talkId];
      this.$dialog.show({
        title: "テンプレート トーク削除確認",
        text: `"${template.displayName}" を削除します。\n削除したら元に戻すことはできません。`,
        type: "warning",
        btnConfirmTitle: "OK",
        onConfirm: async () => {
          await this.deleteTalk(payload);
          if (template.displayName === "ゴミ分別") this.isVisible = false;
          this.showSpecialTalkModal = false;
          this.$snackbar.show({ text: `"${template.displayName}" を削除しました。` });
        },
      });
    },
    setScenarioSpecialTalkData(talk: any, valueToSet: any): void {
      const talkName = SPECIAL_TALK_TYPES_MAPPING[talk];
      if (talkName != null) {
        let param = {
          scenarioId: this.$route.params.versionId,
          value: valueToSet,
        }
        this.updateActiveScenario(param);
      }
    },
  },
  created() {
    if (this.scenariosList && this.scenariosList.length === 0) {
      this.$store.dispatch(FETCH_ALL_SCENARIOS);
    }
  },
});
</script>


