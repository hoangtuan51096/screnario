<template>
  <div>
    <div>
      <v-row justify="space-between">
        <v-col cols="auto" md="auto">
          <v-toolbar-title class="font-weight-bold">
            シナリオ一覧
          </v-toolbar-title>
        </v-col>
        <v-col cols="auto">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div
                  style="display: inline-block"
                  v-bind="attrs"
                  v-on="tableSelected.length > 0 && disableDeleteButton && on"
              >
                <v-btn
                    color="error"
                    :disabled="hasActionPermission('disableButton', 'ScenarioSettings_DeleteVersion_Click') || disableDeleteButton"
                    @click="onDeleteClick"
                >
                  <v-icon left>mdi-trash-can</v-icon>選択項目を削除
                </v-btn>
              </div>
            </template>
            <span>
            適用中のシナリオを選択している場合は削除できません
          </span>
          </v-tooltip>
          <v-btn
              class="ml-2"
              color="primary"
              :disabled="hasActionPermission('disableButton', 'ScenarioSettings_CreateVersion_Click')"
              @click="onCreateClick"
          >
            <v-icon left>mdi-plus</v-icon>新規作成
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <div style="margin: 0 -16px;">
      <v-toolbar :elevation="0">
        <v-autocomplete
            class="mr-3"
            v-model="localSearchAttribute"
            :items="searchOptions"
            flat
            outlined
            dense
            clearable
            background-color="white"
            hide-details
            :placeholder="'検索項目'"
        ></v-autocomplete>
        <v-row no-gutters v-if="localSearchAttribute === 'production'">
          <v-autocomplete
              v-model="localSearchKeyword"
              :items="productionStatus"
              outlined
              dense
              clearable
              hide-details
              placeholder="本番ステータス"
              :disabled="!searchAttribute"
          ></v-autocomplete>
        </v-row>
        <v-row no-gutters v-else-if="localSearchAttribute === 'sandbox'">
          <v-autocomplete
              v-model="localSearchKeyword"
              :items="sandboxStatus"
              outlined
              dense
              clearable
              hide-details
              placeholder="サンドボックスステータス"
              :disabled="!searchAttribute"
          ></v-autocomplete>
        </v-row>
        <v-text-field
            v-else-if="localSearchAttribute === 'name'"
            v-model="localSearchKeyword"
            hide-details
            outlined
            dense
            clearable
            placeholder="キーワード"
            :disabled="!searchAttribute"
        ></v-text-field>
        <v-text-field
            v-else
            v-model="localSearchKeyword"
            hide-details
            outlined
            dense
            clearable
            placeholder="キーワード"
            :disabled="true"
        ></v-text-field>
        <v-btn
            class="mx-3"
            height="40"
            color="primary"
            elevation="0"
            @click="handleSearch"
        > 検索 </v-btn>
        <v-btn
            height="40"
            color="blue-grey"
            outlined
            :disabled="isClearDisabled"
            @click="handleClearAllSearchCriteria"
        > 条件クリア </v-btn>
      </v-toolbar>
    </div>
    <Pagination @change="handleSearch"/>
    <v-data-table
        class="scenario-table"
        :headers="tableHeaders"
        :items="filteredTableItems"
        :show-select="true"
        :single-select="false"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :custom-sort="customSort"
        item-key="id"
        hide-default-footer
        v-model="tableSelected"
    >
      <template v-slot:item.data-table-select="{ isSelected, select, item }">
        <v-simple-checkbox
            color="gray"
            :value="tableSelected.map((selected) => selected.id).includes(item.id)"
            @input="select($event)"
        />
      </template>
      <template v-slot:item._productionButton="{ item }">
        <v-btn
            color="secondary"
            :disabled="hasActionPermission('disableButton', 'ScenarioSettings_EnableVersion_Click') || settings ? (settings.envMapping.production === item.id) : false"
            @click="onActivate(item, 'production')"
        >
          <template v-if="settings ? (settings.envMapping.production === item.id) : false">
            適用中
          </template>
          <template v-else>
            適用
          </template>
        </v-btn>
      </template>
      <template v-slot:item._sandboxButton="{ item }">
        <v-btn
            color="secondary"
            :disabled="hasActionPermission('disableButton', 'ScenarioSettings_EnableVersion_Click') || settings ? (settings.envMapping.sandbox === item.id) : false"
            @click="onActivate(item, 'sandbox')"
        >
          <template v-if="settings ? (settings.envMapping.sandbox === item.id) : false">
            適用中
          </template>
          <template v-else>
            適用
          </template>
        </v-btn>
      </template>
      <template v-slot:item._editButton="{ item }">
        <v-btn color="primary" @click="toEdit(item)">
          編集
        </v-btn>
      </template>
    </v-data-table>
    <Pagination @change="handleSearch"/>

    <div style="margin-top: 20px;">
      <v-btn
          class="mr-2"
          color="primary"
          outlined
          @click="onExportClick"
          :loading="showLoadingExport"
          :disabled="hasActionPermission('disableButton', 'ScenarioSettings_ExportVersion_Click') || tableSelected.length !== 1"
      >
        LBDエクスポート
      </v-btn>
      <v-btn
          color="primary"
          outlined
          @click="onImportClick"
          :disabled="hasActionPermission('disableButton', 'ScenarioSettings_ImportVersion_Click') || tableSelected.length !== 0"
      >
        LBDインポート
      </v-btn>
    </div>

    <VersionChangeModal
        :visible="showVersionChange"
        :scenarioId="activeScenario.scenarioId"
        :currentVersion="currentVersion"
        :newVersion="selectedVersion"
        :environment="selectedEnv"
        @onChangeConfirm="clickChange"
        @close="showVersionChange = false"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import DatetimeFormatter from "@/mixins/DatetimeFormatter";
import { CHANGE_ACTIVE_SCENARIO, DOWNLOAD_EXPORT_FILE } from "@/store/action-types";
import { mapState, mapActions } from "vuex";
import {
  SCENARIO_ENV_TYPES,
  SCENARIO_LANG_TYPES,
  SCENARIO_SEARCH_ATTRIBUTE_OPTIONS,
  SCENARIO_SEARCH_SANDBOX_OPTIONS,
  SCENARIO_SEARCH_PRODUCTION_OPTIONS
} from "@/store/modules/scenarios/scenarios.constants";
import VersionChangeModal from "./VersionChangeModal.vue";
import Pagination from "./Pagination.vue";
import { SET_SELECTED_EDIT_SCENARIO } from "@/store/mutation-types";
import moment from 'moment';
import { get } from 'lodash';
import cloneDeep from "lodash/cloneDeep";
import {FETCH_SCENARIOS_LIST, FETCH_SCENARIOS_SETTING} from "@/store/modules/scenarios/mutations-types";
import {trim} from "../../../utils/stringUtils";

export default Vue.extend({
  props: {
    environment: String,
    fetchDataList: Boolean,
    searchCriteria: Object,
  },
  data() {
    return {
      versionList: [],
      environmentInfo: {},
      scenarioInfo: null,
      selectedVersion: null,
      selectedId: null,
      selectedEnv: null,
      activeScenarioExists: null,
      showLoadingExport: false,
      showVersionChange: false,
      sortBy: '',
      sortDesc: '',
      tableHeaders: [
        {
          text: "シナリオバージョン",
          sortable: true,
          value: "displayVersionName",
          width: "40%",
        },
        {
          text: "本番",
          sortable: true,
          value: "_productionButton",
          align: "center",
        },
        {
          text: "サンドボックス",
          sortable: true,
          value: "_sandboxButton",
          align: "center",
        },
        {
          text: "",
          sortable: false,
          value: "_editButton",
        },
      ],
      searchOptions: SCENARIO_SEARCH_ATTRIBUTE_OPTIONS,
      localSearchAttribute: "",
      localSearchKeyword: "",
      tableItems: [],
      tableItemsPerPage: 10,
      filteredTableItems: [],
      tableSelected: [],
      searchCriteriaLocal: null
    };
  },
  watch: {
    localSearchAttribute() {
      this.localSearchKeyword = ""
    },
    sortBy() {
      this.handleSearch()
    },
    sortDesc() {
      this.handleSearch()
    },
    fetchDataList() {
      this.fetchData()
    },
    scenario(value) {
      if (value) {
        this.versionList = this.populateVersionsList();
        const payload = {
          environment: this.environment,
          value: this.selectedVersion,
        };
        this.$store.commit(SET_SELECTED_EDIT_SCENARIO, payload);
      }
    },
    isExportingScenarioData(value) {
      if (!value) {
        this.showLoadingExport = false;
      }
    },
    scenariosListPaginate(value) {
      this.filterTableItems();
    },
    activeScenarioData() {
      this.activeScenarioExists = this.checkActiveScenario;
      this.tableItems = this.populateTableItems();
      this.filterTableItems();
    },
    selectedVersion(val) {
      const payload = {
        environment: this.environment,
        value: val,
      };
      this.$store.commit(SET_SELECTED_EDIT_SCENARIO, payload);
    },
    selectedEditScenario: {
      deep: true,

      handler(val) {
        this.selectedVersion = val[this.environment];
      },
    },
    exportingScenarioDataError(val) {
      if (val) {
        if (val instanceof String) {
          this.$snackbar.show({ text: val, type: "error" });
        } else {
          this.$snackbar.show({ text: val.message, type: "error" });
        }
      }
    },
    fetchScenarioDetailError(val) {
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
      this.filterTableItems();
    },
    deleteFinishSuccess(val) {
      if (val) {
        this.tableSelected = [];
      }
    }
  },
  mixins: [DatetimeFormatter],
  components: { VersionChangeModal, Pagination },
  computed: {
    ...mapState({
      settings: (state) => state.scenarios.settings,
      activeScenario: (state) => state.scenarios.activeScenario,
      activeScenarioData: (state) => state.scenarios.activeScenarioData,
      scenariosListPaginate: (state) => state.scenarios.scenariosListPaginate,
      isExportingScenarioData: (state) => state.scenarios.isExportingScenarioData,
      selectedEditScenario: (state) => state.scenarios.selectedEditScenario,
      exportingScenarioDataError: (state) => state.scenarios.exportingScenarioDataError,
      fetchScenarioDetailError: (state) => state.scenarios.fetchScenarioDetailError,
      deleteFinishSuccess: (state) => state.scenarios.deleteFinishSuccess,
      dataTableOptions: (state) => state.scenarios.dataTableOptions,
    }),
    options: {
      get() {
        return this.dataTableOptions;
      },
      async set(value) {
        if (value) {
          await this.setUserListDataTableOptions(value);
          await this.fetchData();
        }
      },
    },
    onDetail() {
      return {
        name: "ScenarioVersionSettingsPage",
        params: {
          env: this.environment,
          scenarioId: this.activeScenario ? this.activeScenario.scenarioId : "",
          versionId: this.selectedVersion,
        },
      };
    },
    disableDeleteButton() {
      if (this.tableSelected.length === 0) {
        return true;
      }

      const selectedVersions = this.tableSelected.map((selected) => selected.id);
      if (selectedVersions.includes(this.settings.envMapping.production)) {
        return true;
      }
      return selectedVersions.includes(this.settings.envMapping.sandbox);
    },
    currentVersion() {
      return get(this.activeScenarioData, `envMapping.${this.selectedEnv}`, '');
    },
    searchAttribute() {
      return this.localSearchAttribute
    },
    productionStatus() {
      return SCENARIO_SEARCH_PRODUCTION_OPTIONS;
    },
    sandboxStatus() {
      return SCENARIO_SEARCH_SANDBOX_OPTIONS;
    },
    isClearDisabled() {
      return (!this.searchAttribute && !this.searchKeyword) || this.isFetchingUserList;
    }
  },
  methods: {
    ...mapActions({
      changeActiveScenario: CHANGE_ACTIVE_SCENARIO,
      downloadExportFile: DOWNLOAD_EXPORT_FILE,
    }),
    getScenarioInfo() {
      const value =
        "envMapping" in this.activeScenarioData ? this.activeScenarioData.envMapping[this.environment] : null;
      if (value) {
        if (this.activeScenario && this.activeScenario.versions) {
          return this.activeScenario.versions[value];
        } else {
          return null;
        }
      } else {
        return null;
      }
    },
    getDefaultSelectedVersion() {
      if (this.activeScenarioData && "envMapping" in this.activeScenarioData) {
        return this.activeScenarioData.envMapping[this.environment];
      } else {
        return null;
      }
    },
    populateTableItems() {
      if (this.activeScenario && this.activeScenario.versions) {
        const items = Object.keys(this.activeScenario.versions).map((version) => {
          const item = this.activeScenario.versions[version];
          return {
            ...item,
            _version: version,
            _displayVersion: ((item.displayVersionName ? item.displayVersionName : version) || "").trim(),
            _productionButton: version === this.activeScenarioData.envMapping.production ? 1 : 0,
            _sandboxButton: version === this.activeScenarioData.envMapping.sandbox ? 1 : 0,
            _updateDate: DatetimeFormatter.methods.formatToPrettyYYYYMMDHHmmss(item.updateDate),
            _updateUnix: DatetimeFormatter.methods.formatYYYYMMDDToUnix(item.updateDate),
            _editButton: null,
          };
        });
        return items;
      } else {
        return [];
      }
    },
    customSort(items , index , isDesc) {
      items.sort((a, b) => {
        if (index[0] === "_productionButton" || index[0] === "_sandboxButton") {
          if (!isDesc[0]) {
            return b[index] - a[index];
          } else {
            return a[index] - b[index];
          }
        } else {
          if (!isDesc[0]) {
            return a[index] < b[index] ? -1 : 1;
          } else {
            return b[index] < a[index] ? -1 : 1;
          }
        }
      });
      return items;
    },
    checkActiveScenario() {
      if (this.activeScenarioData) {
        return this.activeScenarioData.activeScenarioId;
      }
      return false;
    },
    onChangeVersion() {
      this.$emit("onChangeVersion", this.type);
    },
    convToJapanese(value) {
      return SCENARIO_LANG_TYPES[value.substring(0, 2)] ? SCENARIO_LANG_TYPES[value.substring(0, 2)].text : value;
    },
    onImportClick() {
      this.$emit("onImportTrigger", this.versionList);
    },
    onCreateClick() {
      this.$emit("onCreateClick", this.versionList);
    },
    onDeleteClick() {
      if (this.disableDeleteButton) {
        return;
      }
      this.$emit("onDeleteTrigger", { name: this.tableSelected.map((selected) => selected.displayVersionName), id: this.tableSelected.map((selected) => selected.id)});
    },
    onActivate(item , env) {
      this.selectedVersion = item.id;
      this.selectedId = item.id;
      this.selectedEnv = env;
      if (this.hasActionPermission('click', 'backendRequest')) {
        this.showVersionChange = true;
      } else {
        this.showActionPermissionError();
      }
    },
    async clickChange() {
      const payload = {
        activeScenarioData: this.activeScenarioData,
        scenarioName: this.activeScenarioData.activeScenarioId,
        versionName: this.selectedVersion,
        id: this.selectedId,
        environment: this.selectedEnv,
      };
      this.changeActiveScenario(payload);
      await this.$store.dispatch(FETCH_SCENARIOS_SETTING)
      this.handleSearch()
    },
    onExportClick() {
      this.showLoadingExport = true;
      const payload = {
        scenario: this.activeScenarioData.activeScenarioId + "#" + this.tableSelected[0]._version,
        environment: this.environmentInfo.value,
      };
      this.downloadExportFile(payload);
      this.$emit("onExportFinishSuccess");
    },
    toEdit(item) {
      this.$router.push({
        name: "ScenarioVersionSettingsPage",
        params: {
          env: this.environment,
          scenarioId: this.settings ? this.settings.id : "",
          versionId: item.id,
        },
      });
    },
    filterTableItems() {
      this.filteredTableItems = this.scenariosListPaginate.data;
    },
    handleClearAllSearchCriteria() {
      this.localSearchAttribute = ""
      this.localSearchKeyword = ""
      this.handleSearch()
    },
    async handleSearch() {
      let dataSearch = cloneDeep(this.dataTableOptions)
      this.localSearchKeyword = trim(this.localSearchKeyword)
      if (this.localSearchAttribute && this.localSearchKeyword) {
        switch (this.localSearchAttribute) {
          case "name":
            dataSearch['filters[displayVersionName][like]'] = (this.localSearchKeyword ? encodeURIComponent(this.localSearchKeyword.trim()) : encodeURIComponent(this.localSearchKeyword))
            break
          case "production":
            dataSearch['filtersProduction'] = this.localSearchKeyword
            break
          case "sandbox":
            dataSearch['filtersSandbox'] = this.localSearchKeyword
            break
        }
      }
      dataSearch['sortBy'] = 'updated_at'
      if (this.sortBy) {
        switch (this.sortBy) {
          case "displayVersionName":
            dataSearch['sortBy'] = 'displayVersionName'
            break
          case "_productionButton":
            dataSearch['sortBy'] = 'production'
            break
          case "_sandboxButton":
            dataSearch['sortBy'] = 'sandbox'
            break
        }
      }
      dataSearch['sortType'] = (this.sortDesc === false) ? 'asc' : 'desc'
      await this.$store.dispatch(FETCH_SCENARIOS_LIST, dataSearch)
      return
    },
    async fetchData() {
      try {
        await this.$store.dispatch(FETCH_SCENARIOS_SETTING)
      } catch (e) {
        console.log(e)
      }
      await this.handleSearch()
    }
  },
  async created() {
    await this.fetchData();
    this.filterTableItems();
  },
});
</script>

<style scoped>
.active-bot {
  font-size: 12px;
}
.active-bot-name {
  font-size: 20px;
  font-weight: bold;
}
</style>

<style>
.scenario-table.v-data-table tbody tr {
  height: 64px;
}
.scenario-table.v-data-table tbody tr:hover {
  cursor: initial !important;
}
</style>
