<template>
  <v-container fluid>
    <v-overlay :opacity="0.2" v-if="isFetchingScenarios || isFetchingScenarioDetail">
      <content-loading :size="50" text="" />
    </v-overlay>
    <div v-if="!fetchScenariosError">
      <ScenarioEnvironmentTable
        :fetchDataList="fetchDataList"
        environment="sandbox"
        :searchCriteria="searchCriteriaLocal"
        @onChangeVersion="onChangeVersion"
        @onImportTrigger="onImportTrigger"
        @onDeleteTrigger="onDeleteTrigger"
        @onCreateClick="onCreateClick"
        @onShowVisualization="onShowVisualization('sandbox')"/>
    </div>
    <div class="pb4" v-if="fetchScenariosError">
      <ContentLoadError class="mt-10" :error="fetchScenariosError" />
    </div>
    <VisualizationModal
      :visible="showVisualizationModal"
      @close="showVisualizationModal = false"
      :selectedTalk="null"
    />
    <VersionImportModal
      :visible="showImportModal"
      :versionList="versionList"
      @close="showImportModal = false"
      @onImportFinishSuccess="onImportFinishSuccess"
    />
    <VersionCreateModal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      @onCreateFinishSuccess="onCreateFinishSuccess"
    />
    <VersionDeleteModal
      :visible="showDeleteModal"
      :scenario="checkmarkedScenario"
      :active="activeScenarioData"
      @close="showDeleteModal = false"
      @backToSelect="backToSelect"
      @on-delete-finish-success="onDeleteFinishSuccess"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { FETCH_ALL_SCENARIOS, FETCH_SCENARIO_DETAIL_TALK } from "@/store/action-types";
import {
  SET_ACTIVE_SCENARIO_DATA,
  SET_ACTIVE_SCENARIO,
  IMPORT_FINISH_SUCCESS,
  EXPORT_FINISH_SUCCESS,
  DELETE_FINISH_SUCCESS,
  CREATE_FINISH_SUCCESS,
} from "@/store/mutation-types";
import { mapState, mapActions, mapMutations } from "vuex";
import ScenarioEnvironmentTable from "../components/ScenarioEnvironmentTable.vue";
import VersionImportModal from "../components/VersionImportModal.vue";
import VersionCreateModal from "../components/VersionCreateModal.vue";
import VersionDeleteModal from "../components/VersionDeleteModal.vue";
import ContentLoadError from "../../components/common/ContentLoadError.vue";
import VisualizationModal from "../../ScenarioSettingsDetail/components/VisualizationModal.vue";

export default Vue.extend({
  props: {
    searchCriteria: Object,
  },
  data() {
    return {
      showScenarioVersion: false,
      showImportModal: false,
      showCreateModal: false,
      showDeleteModal: false,
      checkmarkedScenario: {
        scenarioName: "default_scenario",
        versionNames: ["default_version"],
        lengthOfScenarioVersions: 0,
      },
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
      searchCriteriaLocal: null,
      fetchDataList: false
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
    ScenarioEnvironmentTable,
    VersionImportModal,
    VersionCreateModal,
    VersionDeleteModal,
    ContentLoadError,
    VisualizationModal,
  },
  computed: {
    ...mapState({
      scenariosList: (state) => state.scenarios.scenariosList,
      isFetchingScenarios: (state) => state.scenarios.isFetchingScenarios,
      activeScenarioData: (state) => state.scenarios.activeScenarioData,
      activeScenario: (state) => state.scenarios.activeScenario,
      fetchScenariosError: (state) => state.scenarios.fetchScenariosError,
      importingScenarioDataWarning: (state) => state.scenarios.importingScenarioDataWarning,
      exportingScenarioDataWarning: (state) => state.scenarios.exportingScenarioDataWarning,
      isFetchingScenarioDetail: (state) => state.scenarios.isFetchingScenarioDetail,
    }),
    scenariosItems() {
      return this.scenariosList.map((obj) => {
        return {
          value: obj.scenarioId,
          text: obj.scenarioId,
        };
      });
    },
    versionList() {
      if (!this.activeScenario || !this.activeScenario.versions) {
        return [];
      }

      const verList = Object.keys(this.activeScenario.versions).reduce((array, version) => {
        array.push(this.activeScenario.versions[version].displayVersionName || version);
        return array;
      }, []);
      const compare = (a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      }
      return verList.sort(compare);
    }
  },
  methods: {
    ...mapMutations({
      setActiveScenarioData: SET_ACTIVE_SCENARIO_DATA,
      setActiveScenario: SET_ACTIVE_SCENARIO,
      importFinishSuccess: IMPORT_FINISH_SUCCESS,
      createFinishSuccess: CREATE_FINISH_SUCCESS,
      exportFinishSuccess: EXPORT_FINISH_SUCCESS,
      deleteFinishSuccess: DELETE_FINISH_SUCCESS,
    }),
    ...mapActions({
      fetchScenarioTalk: FETCH_SCENARIO_DETAIL_TALK,
    }),
    onChangeVersion() {
      this.showScenarioVersion = true;
    },
    onImportTrigger() {
      this.showImportModal = true;
      this.showScenarioVersion = false;
    },
    onImportFinishSuccess() {
      this.showImportModal = false;
      this.importFinishSuccess(false);
      this.fetchDataList = !this.fetchDataList
    },
    onCreateFinishSuccess() {
      this.showCreateModal = false;
      this.createFinishSuccess(false);
      this.$snackbar.show({ text: "新規シナリオを作成しました。", type: "success" });
      this.fetchDataList = !this.fetchDataList
    },
    onExportFinishSuccess() {
      this.showScenarioVersion = true;
      this.exportFinishSuccess(false);
    },
    onCreateClick() {
      this.resetSelection = true;
      this.showCreateModal = true;
    },
    onDeleteTrigger(val) {
      this.checkmarkedScenario = {
        ...this.checkmarkedScenario,
        scenarioName: this.activeScenario?.scenarioId,
        versionNames: val.name,
        versionIds: val.id,
        lengthOfScenarioVersions: this.versionList.length,
      };
      this.showDeleteModal = true;
      this.showScenarioVersion = false;
    },
    onDeleteFinishSuccess() {
      this.showDeleteModal = false;
      this.showScenarioVersion = false;
      this.deleteFinishSuccess(false);
      let text = this.checkmarkedScenario.versionNames.map((versionName) =>
          `"${(
              (
                  this.activeScenario.versions
                  && this.activeScenario.versions[versionName]
                  && this.activeScenario.versions[versionName].displayVersionName
              )
                  ? this.activeScenario.versions[versionName].displayVersionName
                  : versionName).trim()
          }"`).join(" と ")
      this.$snackbar.show({ text: `"${text}"を削除しました。`, type: "success" });
      this.fetchDataList = !this.fetchDataList
    },
    backToSelect() {
      this.previousSelection = this.checkmarkedScenario.versionNames;
      this.resetSelection = false;
      this.showDeleteModal = false;
      this.showScenarioVersion = true;
    },
    async onShowVisualization(env) {
      await this.fetchScenarioTalk({
        scenarioId: this.activeScenarioData.activeScenarioId,
        versionId: this.activeScenarioData.envMapping[env],
      });
      this.showVisualizationModal = true;
    },
  },
  created() {
    this.searchCriteriaLocal = this.searchCriteria;
  },
});
</script>


