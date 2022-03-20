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
  <div>
    <v-alert
        v-if="this.activeScenarioData.envMapping && $route.params.versionId === this.activeScenarioData.envMapping.production"
        class="red--text text--darken-4"
        color="red darken-4"
        icon="mdi-alert"
        dismissible
        text
    >
      <div class="text-center">
        このバージョンは公開中です。編集後すぐに変更内容が反映されますのでご注意ください。
      </div>
    </v-alert>
    <v-row justify="space-between" class="ml-1 mr-1">
      <v-col cols="auto" md="auto">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <h2 v-bind="attrs" v-on="on" class="active-talk-name clickable" style=" white-space: nowrap;
    text-overflow: ellipsis; overflow: hidden; max-width: 400px;  font-size: 20px;font-weight: bold;" @click="showVersionNameChangeModal = true">
              <v-icon>mdi-pencil</v-icon>
              {{ getDisplayVersionName }}
            </h2>
          </template>
          <span>{{ getDisplayVersionName }}</span>
        </v-tooltip>
      </v-col>
      <v-col cols="auto">
        <v-btn
            color="error"
            outlined
            :disabled="hasActionPermission('disableButton', 'ScenarioSettings_DeleteTalk_Click') || disableDeleteButton"
            @click="onDeleteClick"
        >
          選択項目を削除
        </v-btn>
        <v-btn class="ml-2" color="primary" outlined @click="onTemplateClick()">
          テンプレートを利用
        </v-btn>
        <v-btn
            class="ml-2"
            color="primary"
            :disabled="hasActionPermission('disableButton', 'ScenarioSettings_CreateTalk_Click')"
            @click="onCreateClick"
        >
          新規作成
        </v-btn>
      </v-col>
    </v-row>
    <v-toolbar :elevation="0">
      <v-autocomplete
          class="mr-3"
          v-model="localSearchAttribute"
          :items="searchAttributeOptions"
          flat
          outlined
          dense
          clearable
          background-color="white"
          hide-details
          :placeholder="'検索項目'"
      ></v-autocomplete>
      <v-row no-gutters style="margin-top: 7px !important;" v-if="localSearchAttribute === 'updated_at'">
        <v-col>
          <v-menu
              v-model="showStartDateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="localSearchStartDate"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  dense
                  outlined
                  hide-details="auto"
                  clearable
                  v-bind="attrs"
                  v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
                v-model="localSearchStartDate"
                @input="showStartDateMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-container style="display: inline-flex; width: inherit; padding-left: 0; padding-right: 0">
          <div class="body-2 blue-grey--text font-weight-bold" style="visibility: hidden;">
            |
          </div>
          <div class="d-flex" style="height: 100%; align-items: center">
            ～
          </div>
        </v-container>
        <v-col>
          <v-menu
              v-model="showEndDateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="localSearchEndDate"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  dense
                  outlined
                  hide-details="auto"
                  clearable
                  v-bind="attrs"
                  v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
                v-model="localSearchEndDate"
                @input="showEndDateMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-text-field
          v-else
          v-model="localSearchKeyword"
          hide-details
          outlined
          dense
          clearable
          placeholder="キーワード"
          :disabled="!searchAttribute"
      ></v-text-field>
      <v-btn
          class="mx-3"
          height="40"
          color="primary"
          elevation="0"
          @click="handleSearch"
          :loading="isSearching && isFetchingScenarioDetail"
          :disabled="isSearchDisabled"
      > 検索 </v-btn>
      <v-btn
          height="40"
          color="blue-grey"
          outlined
          :disabled="isClearDisabled"
          @click="handleClearAllSearchCriteria"
      > 条件クリア </v-btn>
    </v-toolbar>
    <v-alert type="error" color="#B71C1C" class="ml-4 mr-4" v-if="errorDatePicker">
      最終更新日の開始日と終了日が逆です
    </v-alert>
    <v-divider class="my-4"></v-divider>
    <v-data-table
        class="scenario-table"
        :headers="tableHeaders"
        :items="filteredTableItems"
        :items-per-page="tableItemsPerPage"
        :show-select="true"
        :single-select="false"
        :loading="isFetchingScenarioDetail"
        :footer-props="{ 'items-per-page-options': [10, 20, 50, 100, -1] }"
        :server-items-length="totalTalks"
        :options.sync="optionTalks"
        v-model="tableSelected"
    >
      <template v-slot:item.data-table-select="{ isSelected, select, item }">
        <v-simple-checkbox
            v-if="specialTalkTypes.includes(item.dataId)"
            color="gray"
            indeterminate
            :disabled="true"
        />
        <v-simple-checkbox
            v-else
            color="gray"
            :value="tableSelected.map((selected) => selected._name).includes(item._name)"
            @input="select($event)"
        />
      </template>
      <template v-slot:item.numberOfMessage="{ item }">
        {{ item.numberOfMessage ? item.numberOfMessage : item._messageCount}}
      </template>
      <template v-slot:item.displayName="{ item }">
        <!-- 空白を消すためなので、spanを改行していないのは意図したもの -->
        <template v-if="suffix[item.dataId]">{{ item.displayName }}</template>
        <v-tooltip top v-else>
          <template v-slot:activator="{ on, attrs }">
            <div class="item_user_name"
                 v-bind="attrs"
                 v-on="on">
              {{ item.displayName }}
            </div>
          </template>
          <span>{{ item.displayName }}</span>
        </v-tooltip>

        <span
            v-if="suffix[item.dataId]"
            class="template-link blue-grey--text"
        >{{ suffix[item.dataId] }}</span>
      </template>
      <template v-slot:item.startMessage="{ item }" style="vertical-align: inherit">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <div class="item_user_name"
                 v-bind="attrs"
                 v-on="on">
              {{ item._startMessage }}
            </div>
          </template>
          <span>{{ item.startMessage }}</span>
        </v-tooltip>
      </template>
      <template v-slot:item._editButton="{ item }">
        <v-btn color="primary" @click="toEdit(item)">
          編集
        </v-btn>
      </template>
    </v-data-table>
    <VersionNameChangeModal
      :visible="showVersionNameChangeModal"
      :versionId="$route.params.versionId"
      :originalVersionName="getDisplayVersionName"
      :existingVersions="versionList"
      @updateVersion="updateVersionName"
      @close="showVersionNameChangeModal = false"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import DatetimeFormatter from "@/mixins/DatetimeFormatter";
import {
  CHANGE_ACTIVE_SCENARIO,
  DOWNLOAD_EXPORT_FILE,
  FETCH_ACTIVE_SCENARIO_DATA, FETCH_SCENARIO_TALK,
  UPDATE_DISPLAY_SCENARIO_VERSION_NAME,
} from "@/store/action-types";
import {
  SET_IS_SAVING_ACTIVE_SCENARIO,
  SET_TALK_DATATABLE_OPTION,
  SET_TALK_SEARCH_ATTRIBUTE, SET_TALK_SEARCH_ENDDATE, SET_TALK_SEARCH_STARTDATE, SET_TALK_SEARCH_VALUE
} from "@/store/mutation-types";
import { mapState, mapActions, mapMutations } from "vuex";
import { SCENARIO_ENV_TYPES } from "@/store/modules/scenarios/scenarios.constants";
import { SET_SELECTED_EDIT_SCENARIO } from "@/store/mutation-types";
import {TEMPLATE_TALK_IDS} from '@/store/modules/scenarios/scenarios.constants';
import VersionNameChangeModal from "../../ScenarioSettingsDetail/components/VersionNameChangeModal.vue";
import cloneDeep from "lodash/cloneDeep";
import moment from "moment";

interface LocalState {
  versionList: Array<any>;
  environmentInfo: any;
  scenarioInfo: any;
  selectedVersion: any;
  selectedEnv: any;
  activeScenarioExists: any;
  tableHeaders: Array<any>;
  tableItems: Array<any>;
  tableItemsPerPage: number;
  filteredTableItems: Array<any>;
  tableSelected: Array<any>;
  showNewTalkModal: boolean;
  specialTalkTypes: any;
  suffix: any;
  showVersionNameChangeModal: boolean;
  isSearching: boolean;
  searchAttributeOptions: Array<any>;
  showStartDateMenu: boolean;
  showEndDateMenu: boolean;
}

const suffixNumbers = [
  "①",
  "②",
  "③",
  "④",
  "⑤",
  "⑥",
];

export default Vue.extend({
  props: {
    environment: String,
  },
  data(): LocalState {
    return {
      showStartDateMenu: false,
      showEndDateMenu: false,
      isSearching: false,
      versionList: [],
      environmentInfo: {},
      scenarioInfo: null,
      selectedVersion: null,
      selectedEnv: null,
      activeScenarioExists: (this as any).checkActiveScenario,
      tableHeaders: [
        {
          text: "トーク名",
          sortable: true,
          value: "displayName",
          width: "30%",
        },
        {
          text: "メッセージ数",
          sortable: true,
          value: "numberOfMessage",
          align: "center",
          width: "15%",
        },
        {
          text: "開始メッセージ",
          sortable: true,
          value: "startMessage",
          width: "25%",
        },
        {
          text: "更新日時",
          sortable: true,
          value: "updated_at",
          width: "20%",
        },
        {
          text: "",
          sortable: false,
          value: "_editButton",
        },
      ],
      tableItems: [],
      tableItemsPerPage: 10,
      filteredTableItems: [],
      tableSelected: [],
      showVersionNameChangeModal: false,
      showNewTalkModal: false,
      specialTalkTypes: TEMPLATE_TALK_IDS,
      suffix: TEMPLATE_TALK_IDS.reduce((obj, name, index) => {
        obj[name] = `(テンプレート ${suffixNumbers[index]})`;
        return obj;
      }, {}),
      searchAttributeOptions: [
        { text: "トーク名", value: "displayName" },
        { text: "開始メッセージ", value: "startMessage" },
        { text: "最終更新日", value: "updated_at" },
      ],
    };
  },
  watch: {
    searchAttribute: {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          this.updateSearchKeyword(null);
        }
      },
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
    scenarioTalks() {
      this.tableSelected = [];
      this.tableItems = this.scenarioTalks;
      this.filterTableItems();
    },
    scenarioTextMap() {
      this.tableSelected = [];
      this.tableItems = this.scenarioTalks;
      this.filterTableItems();
    },
    scenarioMessages() {
      this.tableSelected = [];
      this.tableItems = this.scenarioTalks;
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
    changingVersionNameError(val) {
      if (val) {
        this.$snackbar.show({ text: val, type: "error" });
      }
    },
  },
  mixins: [DatetimeFormatter],
  components: {
    VersionNameChangeModal,
  },
  computed: {
    ...mapState({
      activeScenario: (state: any) => state.scenarios.activeScenario,
      activeScenarioData: (state: any) => state.scenarios.activeScenarioData,
      isExportingScenarioData: (state: any) => state.scenarios.isExportingScenarioData,
      selectedEditScenario: (state: any) => state.scenarios.selectedEditScenario,
      exportingScenarioDataError: (state: any) => state.scenarios.exportingScenarioDataError,
      fetchScenarioDetailError: (state: any) => state.scenarios.fetchScenarioDetailError,
      isFetchingScenarioDetail: (state: any) => state.scenarios.isFetchingScenarioDetail,
      totalTalks: (state: any) => state.scenarios.totalTalks,
      scenarioTalks: (state: any) => state.scenarios.scenarioTalks,
      scenarioTextMap: (state: any) => state.scenarios.scenarioTextmap,
      scenarioMessages: (state: any) => state.scenarios.scenarioMessages,
      isSavingActiveScenario: (state: any) => state.scenarios.isSavingActiveScenario,
      changingVersionNameError: (state: any) => state.scenarios.changingVersionNameError,
      dataTableOptions: (state: any) => state.scenarios.talkDataTableOptions,
      searchAttribute: (state: any) => state.scenarios.searchTalkAttribute,
      searchKeyword: (state: any) => state.scenarios.searchTalkKeyword,
      startDate: (state: any) => state.scenarios.searchTalkStartDate,
      endDate: (state: any) => state.scenarios.searchTalkEndDate,
    }),
    errorDatePicker(): boolean {
      return moment(this.startDate).unix() > moment(this.endDate).unix();
    },
    isSearchDisabled(): void {
      return this.isFetchingScenarioDetail || this.errorDatePicker;
    },
    localSearchAttribute: {
      get() {
        return this.searchAttribute;
      },
      set(value) {
        this.updateSearchAttribute(value);
      },
    },
    localSearchKeyword: {
      get() {
        return this.searchKeyword;
      },
      set(value) {
        this.updateSearchKeyword(value);
      },
    },
    localSearchStartDate: {
      get() {
        return this.startDate;
      },
      set(value) {
        this.updateSearchStartDate(value);
      },
    },
    localSearchEndDate: {
      get() {
        return this.endDate;
      },
      set(value) {
        this.updateSearchEndDate(value);
      },
    },
    isClearDisabled(): boolean {
      return (!this.searchAttribute && !this.searchKeyword) || this.isFetchingScenarioDetail;
    },
    disableDeleteButton(): boolean {
      return this.tableSelected.length === 0;
    },
    isApplyingVersion(): boolean {
      return this.selectedVersion === this.$route.params.versionId;
    },
    getDisplayVersionName(): any {
      const version = this.activeScenario.versions[this.$route.params.versionId];
      return (version && version.displayVersionName)
        ? version.displayVersionName
        : this.$route.params.versionId;
    },
    optionTalks: {
      get(): any {
        return this.dataTableOptions;
      },
      async set(value: any): Promise<void> {
        if (value) {
          await this.updateDatatableOptions(value);
          await this.fetchScenarioTalk({
            scenarioId: this.$route.params.scenarioId,
            versionId: this.$route.params.versionId,
          });
        }
      },
    },
  },
  methods: {
    ...mapActions({
      changeActiveScenario: CHANGE_ACTIVE_SCENARIO,
      downloadExportFile: DOWNLOAD_EXPORT_FILE,
      updateDisplayScenarioVersionName: UPDATE_DISPLAY_SCENARIO_VERSION_NAME,
      fetchScenarioTalk: FETCH_SCENARIO_TALK,
    }),
    ...mapMutations({
      setIsSavingActiveScenario: SET_IS_SAVING_ACTIVE_SCENARIO,
      updateDatatableOptions: SET_TALK_DATATABLE_OPTION,
      updateSearchAttribute: SET_TALK_SEARCH_ATTRIBUTE,
      updateSearchKeyword: SET_TALK_SEARCH_VALUE,
      updateSearchStartDate: SET_TALK_SEARCH_STARTDATE,
      updateSearchEndDate: SET_TALK_SEARCH_ENDDATE,
    }),
    async handleSearch(): Promise<void> {
      this.isSearching = true;
      this.updateDatatableOptions({
        groupBy: [],
        groupDesc: [],
        itemsPerPage: 10,
        multiSort:false,
        mustSort:false,
        page: 1,
        sortBy: ["updated_at"],
        sortDesc: [true],
      });
      await this.fetchScenarioTalk({
        scenarioId: this.$route.params.scenarioId,
        versionId: this.$route.params.versionId,
      });
      let searchKeyword = cloneDeep(this.searchKeyword);
      this.updateSearchKeyword(searchKeyword.trim());
      this.isSearching = false;
    },
    async handleClearAllSearchCriteria(): void {
      this.showStartDateMenu = false;
      this.showEndDateMenu = false;
      await this.updateSearchKeyword(null);
      await this.updateSearchAttribute(null);
      await this.updateSearchStartDate(null);
      await this.updateSearchEndDate(null);
      await this.handleSearch();
    },
    getScenarioInfo(): any {
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
    getDefaultSelectedVersion(): any {
      if (this.activeScenarioData && "envMapping" in this.activeScenarioData) {
        return this.activeScenarioData.envMapping[this.environment];
      } else {
        return null;
      }
    },
    checkActiveScenario(): any {
      if (this.activeScenarioData) {
        return this.activeScenarioData.activeScenarioId;
      }
      return false;
    },
    onCreateClick(): void {
      this.$emit("onCreateClick");
    },
    onTemplateClick(index: any = -1): void {
      this.$emit("onTemplateClick", index);
    },
    onDeleteClick(): void {
      this.$emit("onDeleteTrigger", this.tableSelected);
    },
    toEdit(item: any): void {
      this.$router.push({
        name: "ScenarioSettingsDetailPage",
        params: {
          env: this.environment,
          scenarioId: this.$route.params.scenarioId,
          versionId: this.$route.params.versionId,
          talkId: item.id,
        },
      });
    },
    filterTableItems(): void {
      this.filteredTableItems = this.scenarioTalks;
    },
    async updateVersionName(newVersionName: any): Promise<void> {
      this.setIsSavingActiveScenario(true);
      try {
        const check = await this.updateDisplayScenarioVersionName({
          scenarioId: this.$route.params.scenarioId,
          versionId: this.$route.params.versionId,
          originalVersion: this.activeScenario.versions[this.$route.params.versionId],
          newDisplayVersionName: newVersionName,
        });
        if (check) {
          this.$snackbar.show({ text: "シナリオバージョン名を更新しました。", type: "success" });
        }
      } finally {
        this.setIsSavingActiveScenario(false);
      }
    },
    populateVersionsList(): Array<any> {
      if (this.activeScenario && this.activeScenario.versions) {
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
      } else {
        return [];
      }
    },
  },
  created() {
    this.environmentInfo = SCENARIO_ENV_TYPES[this.environment];
    if (!this.activeScenarioData || !this.activeScenarioData.activeScenarioId) {
      this.$store.dispatch(FETCH_ACTIVE_SCENARIO_DATA);
    }
    if (this.activeScenarioData && this.activeScenarioData.envMapping) {
      this.scenarioInfo = this.getScenarioInfo();
    } else {
      this.scenarioInfo = null;
    }
    this.versionList = this.populateVersionsList();
    this.filteredTableItems = this.scenarioTalks;
    if (this.selectedVersion == null) {
      if (this.selectedEditScenario[this.environment] != null) {
        this.selectedVersion = this.selectedEditScenario[this.environment];
      } else {
        this.selectedVersion = this.getDefaultSelectedVersion();
      }
    }
  },
});
</script>

<style>
.active-talk-name {
  font-size: 20px;
  font-weight: bold;
}
.active-talk-name.clickable {
  cursor: pointer;
}
.template-link {
  margin-left: 0.5em;
  user-select: none;
}
 .item_user_name {
   white-space: nowrap;
   text-overflow: ellipsis;
   width: 230px;
   overflow: hidden;
 }
 .tooltip-talk-name {
   white-space: nowrap;
   text-overflow: ellipsis;
   width: 400px;
   overflow: hidden;
 }
.item_user_message {
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 230px;
  overflow: hidden;
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
