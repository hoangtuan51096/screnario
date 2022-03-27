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
    <div class="text-right ma-4 row">
      <v-btn-toggle tile dense mandatory color="primary" v-model="selectedCategoryToggleIndex">
        <v-btn min-width="80" v-for="(value, index) in categoryList" :key="index" @click="categoryClicked = true">
          {{ convertCategoryToJapanese(value) }}
        </v-btn>
      </v-btn-toggle>
      <v-spacer></v-spacer>
      <router-link :to="{ name: 'DistributionCreatePage' }" class="list-item-link">
        <v-btn color="primary">
          <v-icon left>mdi-email-plus-outline</v-icon>
          新規手動配信
        </v-btn>
      </router-link>
    </div>
    <!-- search box -->
    <v-btn text @click="showSearchBox = !showSearchBox">
      <v-icon left large color="primary">
        {{ showSearchBox ? "mdi-chevron-up" : "mdi-chevron-down" }}
      </v-icon>
      条件検索
    </v-btn>
    <v-expand-transition>
      <v-container v-if="showSearchBox" fluid>
        <v-form ref="form" v-model="validSearchForm">
          <v-row>
            <v-col cols="2">
              <v-subheader class="justify-end">配信名</v-subheader>
            </v-col>
            <v-col>
              <v-autocomplete
                :items="initialDistributionListPerCategory.map((a) => a.name)"
                v-model="selectedName"
                outlined
                dense
                clearable
                hide-details
              >
              </v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2">
              <v-subheader class="justify-end">配信者</v-subheader>
            </v-col>
            <v-col>
              <v-autocomplete
                :items="initialDistributionListPerCategory.map((a) => a.createdBy)"
                v-model="selectedCreatedBy"
                flat
                outlined
                dense
                clearable
                hide-details
                :disabled="!canIncludeCreatedBy"
                :filled="!canIncludeCreatedBy"
              >
              </v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2">
              <v-subheader class="justify-end">
                {{ selectedCategory === "ALL" ? "期間" : selectedCategory === "DRAFT" ? "作成期間" : "配信期間" }}
              </v-subheader>
            </v-col>
            <v-col cols="auto">
              <v-menu
                v-model="fromDateMenu"
                :close-on-content-click="true"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="fromDateText"
                    readonly
                    outlined
                    dense
                    prepend-inner-icon="mdi-calendar-outline"
                    placeholder="YYYY-MM-DD"
                    clearable
                    hide-details
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="selectedFromDate" no-title color="primary" :allowed-dates="allowedFromDates">
                </v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="auto"><v-subheader>~</v-subheader></v-col>
            <v-col cols="auto">
              <v-menu
                v-model="toDateMenu"
                :close-on-content-click="true"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="toDateText"
                    readonly
                    outlined
                    dense
                    prepend-inner-icon="mdi-calendar-outline"
                    placeholder="YYYY-MM-DD"
                    clearable
                    hide-details
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="selectedToDate" no-title color="primary" :allowed-dates="allowedToDates">
                </v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2">
              <v-subheader class="justify-end">種別</v-subheader>
            </v-col>
            <v-col class="my-auto" cols="2">
              <v-checkbox
                v-model="selectedType"
                label="手動配信"
                value="MANUAL"
                hide-details
                :disabled="
                  selectedCategory === 'SCHEDULED' || selectedCategory === 'RECURRING' || selectedCategory === 'DRAFT'
                "
              ></v-checkbox>
            </v-col>
            <v-col
              v-if="
                selectedCategory !== 'SCHEDULED' && selectedCategory !== 'RECURRING' && selectedCategory !== 'DRAFT'
              "
              class="my-auto"
              cols="2"
            >
              <v-checkbox v-model="selectedType" label="外部配信" value="EXTERNAL" hide-details></v-checkbox>
            </v-col>
            <v-col
                v-if="
                selectedCategory !== 'SCHEDULED' && selectedCategory !== 'RECURRING' && selectedCategory !== 'DRAFT'
              "
                class="my-auto"
                cols="2"
            >
              <v-checkbox v-model="selectedType" label="ホームからの配信" value="HOME" hide-details></v-checkbox>
            </v-col>
          </v-row>
          <v-row v-if="selectedCategory !== 'DRAFT'">
            <v-col cols="2">
              <v-subheader class="justify-end">ステータス</v-subheader>
            </v-col>
            <v-col class="my-auto">
              <v-chip-group v-model="selectedState" mandatory active-class="primary--text">
                <v-chip v-for="(state, index) of stateList[selectedCategory]" :key="index" :value="state" active small>
                  {{ convertStateToJapanese(state) }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>

          <v-row>
            <v-col align="center">
              <v-btn color="primary" @click="doSearch" :disabled="!validSearchForm" min-width="200"> 検索 </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-expand-transition>
    <!-- end of search box -->
    <v-divider></v-divider>
    <!-- table -->
    <v-container class="my-4" fluid>
      <v-row no-gutters>
        <v-col cols="auto">
          <span class="display-1">{{ items.length }}</span>
          <span>件</span>
        </v-col>
        <v-divider vertical class="mx-4"></v-divider>
        <v-btn color="primary" :loading="isFetchingDistributionList" @click="onFetchList">
          <v-icon left>mdi-reload</v-icon>
          データ更新
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="clearSearch" :disabled="!canClearSearch" color="gray"> 条件をクリアする </v-btn>
      </v-row>
    </v-container>
    <v-data-table
      class="table-cursor"
      :headers="headers"
      :items="items"
      single-select
      :loading="isFetchingDistributionList"
      :items-per-page="perOnPage"
      :footer-props="{ 'items-per-page-options': [10, 20, 50, 100, -1] }"
      :page.sync="currentPage"
    >
      <!-- templates for data in table (for each column) -->
      <template v-slot:[`item.id`]="{ item }">
        <div>
          <router-link v-if="item.id" :to="onDistributionDetail(item)" style="text-decoration: none">
            {{ item.id }}
          </router-link>
        </div>
      </template>
      <template v-slot:[`item.date`]="{ item }">
        {{ item.date ? formatUnixToYYYYMMDDHHmmss(item.date) : "ーー" }}
      </template>
      <template v-slot:[`item.type`]="{ item }">
        {{ convertTypeToJapanese(item.type) }}
      </template>
      <template v-slot:[`item.state`]="{ item }">
        <div :class="stateColor(item.state)">
          {{ convertStateToJapanese(item.state) }}
        </div>
      </template>
    </v-data-table>
    <!-- end of table -->
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";

import { FETCH_DISTRIBUTION_LIST } from "@/store/action-types";
import { UPDATE_DISTRIBUTION_LIST_FILTER } from "@/store/mutation-types";

import DatetimeFormatter from "@/mixins/DatetimeFormatter";

export default Vue.extend({
  data() {
    return {
      showSearchBox: true,

      categoryList: ["ALL", "SCHEDULED", "RECURRING", "DRAFT"],
      categoryClicked: false,
      selectedCategoryToggleIndex: 0,

      selectedName: null,
      selectedCreatedBy: null,
      selectedFromDate: null,
      selectedToDate: null,
      selectedType: [],
      selectedState: null,

      stateList: {
        ALL: ["ALL", "PROCESSING", "FINISHED", "ERROR", "IGNORED"],
        SCHEDULED: ["ALL", "PROCESSING", "FINISHED", "ERROR", "IGNORED"],
        RECURRING: ["ALL", "PROCESSING", "FINISHED", "ERROR", "IGNORED"], // ["ALL", "ERROR", "IGNORED"],
        DRAFT: [],
      },
      fromDateMenu: false,
      toDateMenu: false,
      canClearSearch: true, // false,

      items: [],
      currentPage: 1,
      perOnPage: 10,
    };
  },
  mixins: [DatetimeFormatter],
  computed: {
    ...mapState({
      distributionList: (state) => state.segments.distributionList,
      isFetchingDistributionList: (state) => state.segments.isFetchingDistributionList,
      fetchDistributionListError: (state) => state.segments.fetchDistributionListError,
      distributionListFilters: (state) => state.segments.distributionListFilters,

      userStore: (state) => state.auth.user,
    }),
    ...mapGetters({
      filteredDistributionList: "filteredDistributionList",
      initialDistributionListPerCategory: "initialDistributionListPerCategory",
    }),
    headers() {
      return [
        { text: "配信ID", value: "id" },
        { text: "配信名", value: "name" },
        { text: "配信者", value: "createdBy" },
        { text: "日時", value: "date" },
        { text: "種別", value: "type" },
        { text: "ステータス", value: "state" },
        { text: "合計配信数", value: "deliveryRate" },
      ];
    },
    selectedCategory: {
      get() {
        return this.categoryList[this.selectedCategoryToggleIndex];
      },
      set(value) {
        if (value && this.categoryList.indexOf(value) !== -1) {
          this.selectedCategoryToggleIndex = this.categoryList.indexOf(value);
        } else {
          this.selectedCategoryToggleIndex = 0;
        }
      },
    },
    fromDateText: {
      get() {
        return this.selectedFromDate;
      },
      set(value) {
        if (!value) {
          this.selectedFromDate = null;
        }
      },
    },
    toDateText: {
      get() {
        return this.selectedToDate;
      },
      set(value) {
        if (!value) {
          this.selectedToDate = null;
        }
      },
    },
    searchFilters() {
      return {
        category: this.selectedCategory,
        name: this.selectedName,
        createdBy: this.selectedCreatedBy,
        dateFrom: this.selectedFromDate ? this.formatYYYYMMDDToUnix(this.selectedFromDate) : null,
        dateTo: this.selectedToDate ? this.addOneDayToUNIX(this.formatYYYYMMDDToUnix(this.selectedToDate)) : null,
        type: this.selectedType,
        state: this.selectedState,
      };
    },
    validSearchForm: {
      get() {
        return true;
        /*
        if(this.selectedName || this.selectedCreatedBy || this.selectedFromDate || this.selectedToDate) {
          return true;
        }
        if(this.selectedType.length > 0) {
          return true;
        }
        if(this.selectedState && this.selectedState !== "ALL") {
          return true;
        }
        return false;
        */
      },
      set(value) {},
    },
    canIncludeCreatedBy() {
      return !(this.selectedType.length === 1 && this.selectedType[0] === "EXTERNAL");
    },
  },
  watch: {
    distributionList(value) {
      this.items = value;
    },
    filteredDistributionList(value) {
      this.items = value;
    },
    selectedCategory(newValue, oldValue) {
      if (this.categoryClicked && oldValue !== newValue) {
        this.clearSearch();
        this.categoryClicked = false;
      }
      if (newValue === "SCHEDULED" || newValue === "RECURRING" || newValue === "DRAFT") {
        this.selectedType = ["MANUAL"];
      }
      this.updateDistributionListFilter(this.searchFilters);
    },
    selectedType(newValue, oldValue) {
      if (newValue && newValue.length === 1 && newValue[0] === "EXTERNAL") {
        this.selectedCreatedBy = "ーー";
      } else if (oldValue && oldValue.length === 1 && oldValue[0] === "EXTERNAL") {
        this.selectedCreatedBy = null;
      }
    },
  },
  methods: {
    ...mapActions({
      fetchDistributionList: FETCH_DISTRIBUTION_LIST,
    }),
    ...mapMutations({
      updateDistributionListFilter: UPDATE_DISTRIBUTION_LIST_FILTER,
    }),
    doSearch() {
      this.canClearSearch = true;
      this.updateDistributionListFilter(this.searchFilters);
      this.currentPage = 1;
    },
    stateColor(value) {
      switch (value) {
        case "FINISHED":
          return "primary--text";
        case "ERROR":
          return "red--text";
        case "TALK":
          return "black--text";
        default:
          return "orange--text";
      }
    },
    clearSearch() {
      this.selectedName = null;
      this.selectedCreatedBy = null;
      this.selectedFromDate = null;
      this.selectedToDate = null;
      this.selectedType =
        this.selectedCategory === "SCHEDULED" ||
        this.selectedCategory === "RECURRING" ||
        this.selectedCategory === "DRAFT"
          ? ["MANUAL"]
          : [];
      this.selectedState = null;

      this.updateDistributionListFilter(this.searchFilters);
      // this.canClearSearch = false;
      this.currentPage = 1;
    },
    async onFetchList() {
      await this.fetchDistributionList();
    },
    onDistributionDetail(item) {
      return {
        name: "DistributionDetail",
        params: {
          distributionId: item.id,
        },
      };
    },
    getTodayDate() {
      var today = new Date();
      return today.toISOString().substr(0, 10);
    },
    allowedFromDates(value) {
      var allowed = true;
      if (this.selectedCategory === "DRAFT") {
        allowed = allowed && value <= this.getTodayDate();
      }
      if (this.selectedToDate) {
        allowed = allowed && value <= this.toDateText;
      }
      return allowed;
    },
    allowedToDates(value) {
      var allowed = true;
      if (this.selectedCategory === "DRAFT") {
        allowed = allowed && value <= this.getTodayDate();
      }
      if (this.selectedFromDate) {
        allowed = allowed && this.fromDateText <= value;
      }
      return allowed;
    },
    convertStateToJapanese(value) {
      if (value === "ALL") {
        return "すべて";
      }
      if (value === "PROCESSING") {
        return "処理中";
      }
      if (value === "FINISHED") {
        return "完了";
      }
      if (value === "ERROR") {
        return "エラー";
      }
      if (value === "IGNORED") {
        return "送信対象者無し";
      }
      if (value === "TALK") {
        return "ーー";
      }
      // TODO: this part might be bad for UI (confusing)
      if (value === "SCHEDULED") {
        return "予約";
      }
      if (value === "DRAFT") {
        return "下書き";
      }
      //
      return value;
    },
    convertCategoryToJapanese(value) {
      if (value === "ALL") {
        return "すべて";
      }
      if (value === "RECURRING") {
        return "繰り返し予約";
      }
      if (value === "SCHEDULED") {
        return "予約";
      }
      if (value === "DRAFT") {
        return "下書き";
      }
      return value;
    },
    convertTypeToJapanese(value) {
      if (value === "MANUAL") {
        return "手動配信";
      }
      if (value === "EXTERNAL") {
        return "外部配信";
      }
      if (value === "HOME") {
        return "ホームからの配信"
      }
      return value;
    },
  },
  created() {
    // this.clearSearch();
    this.selectedCategory = this.distributionListFilters.category;
    this.selectedName = this.distributionListFilters.name;
    this.selectedCreatedBy = this.distributionListFilters.createdBy;
    this.selectedFromDate = this.distributionListFilters.dateFrom
      ? this.formatUnixToYYYYMMDD(this.distributionListFilters.dateFrom)
      : null;
    this.selectedToDate = this.distributionListFilters.dateTo
      ? this.formatUnixToYYYYMMDD(this.minusOneDayFromUNIX(this.distributionListFilters.dateTo))
      : null;
    this.selectedType = this.distributionListFilters.type;
    this.selectedState = this.distributionListFilters.state;
    this.onFetchList();
  },
});
</script>
