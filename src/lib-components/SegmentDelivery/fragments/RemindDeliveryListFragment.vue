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
    <div class="text-right mr-4 row">
      <v-spacer></v-spacer>
      <router-link :to="{ name: 'ReservationReminderConfigurationCreation' }" class="list-item-link">
        <v-btn color="primary">
          <v-icon left>mdi-email-plus-outline</v-icon>
          予約リマインド配信作成
        </v-btn>
      </router-link>
    </div>
    <!-- search box -->
    <v-btn text @click="isShowSearchBox = !isShowSearchBox">
      <v-icon left large color="primary">
        {{ isShowSearchBox ? "mdi-chevron-up" : "mdi-chevron-down" }}
      </v-icon>
      条件検索
    </v-btn>
    <v-expand-transition>
      <v-container v-if="isShowSearchBox" fluid>
        <v-form ref="form">
          <v-row>
            <v-col cols="2">
              <v-subheader class="justify-end">帳票</v-subheader>
            </v-col>
            <v-col cols="9">
              <v-autocomplete
                dense
                hide-details
                outlined
                v-model="selectedSurvey" 
                :disabled="isFetchingAllSurveyConfigs"
                :items="surveyNames"
              ></v-autocomplete>
            </v-col>
            <v-col cols="auto">
              <v-btn text fab small :ripple="false" :disabled="isFetchingAllSurveyConfigs" @click="fetchAllSurveyConfigs()">
                <v-icon color="primary"> {{ isFetchingAllSurveyConfigs ? "mdi-cached mdi-spin" : "mdi-cached" }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-show="false">
            <v-col cols="2">
              <v-subheader class="justify-end">質問項目</v-subheader>
            </v-col>
            <v-col cols="9">
              <v-autocomplete
                dense
                hide-details
                outlined
                v-model="selectedItem"
                :items="itemNames"
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2">
              <v-subheader class="justify-end">分類</v-subheader>
            </v-col>
            <v-col cols="9">
              <v-autocomplete
                dense
                hide-details
                outlined
                v-model="selectedCategory" 
                :disabled="isLoadingCategories"
                :items="categoryNames"
              ></v-autocomplete>
            </v-col>
            <v-col cols="auto">
              <v-btn text fab small :ripple="false" :disabled="isLoadingCategories" @click="fetchAllReminderCategories()">
                <v-icon color="primary"> {{ isLoadingCategories ? "mdi-cached mdi-spin" : "mdi-cached" }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2">
              <v-subheader class="justify-end">配信月</v-subheader>
            </v-col>
            <v-col cols="auto">
              <v-menu
                v-model="isShowMonthMenu"
                :close-on-content-click="true"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="selectedMonthText"
                    readonly
                    outlined
                    dense
                    prepend-inner-icon="mdi-calendar-outline"
                    placeholder="YYYY-MM"
                    hide-details
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="selectedMonth"
                  no-title color="primary"
                  type="month"
                >
                </v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-row v-show="false">
            <v-col cols="2">
              <v-subheader class="justify-end">種別</v-subheader>
            </v-col>
            <v-col class="my-auto">
              <v-chip-group v-model="selectedReminderType" mandatory active-class="primary--text">
                <v-chip v-for="key in Object.keys(reminderTypeList)" :key="key" :value="key" active small>
                  {{ reminderTypeList[key] }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2">
              <v-subheader class="justify-end">ステータス</v-subheader>
            </v-col>
            <v-col class="my-auto">
              <v-chip-group v-model="selectedStatus" mandatory active-class="primary--text">
                <v-chip v-for="key in Object.keys(statusList)" :key="key" :value="key" active small>
                  {{ statusList[key] }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
          <v-row>
            <v-col align="center">
              <v-btn color="primary" @click="searchReminderExecutionHistories" min-width="200">検索</v-btn>
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
        <v-spacer></v-spacer>
        <v-btn @click="clearSearchFilters" color="gray">検索条件をクリアする</v-btn>
      </v-row>
    </v-container>
    <v-data-table
      class="table-cursor"
      single-select
      :headers="headers"
      :items="items"
      :items-per-page="perOnPage"
      :footer-props="{ 'items-per-page-options': [10, 20, 50, 100, -1] }"
      :loading="isFetchingReminderExecutionHistories"
      :page.sync="currentPage"
    >
      <!-- templates for data in table (for each column) -->
      <template v-slot:[`item.sortKey`]="{ item }">
        <div>
          <router-link
            v-if="item.sortKey"
            :to="onClickReminderExecutionHistory(item)"
            style="text-decoration: none"
          >
            {{ item.sortKey }}
          </router-link>
        </div>
      </template>
      <template v-slot:[`item.surveyName`]="{ item }">
        {{ item.surveyName || "ーー" }}
      </template>
      <template v-slot:[`item.categoryNames`]="{ item }">
        {{ item.categoryNames ? formatCategoryNames(item.categoryNames) : "ーー" }}
      </template>
      <template v-slot:[`item.itemName`]="{ item }">
        {{ item.itemName ||  "ーー" }}
      </template>
      <template v-slot:[`item.reminderType`]="{ item }">
        {{ item.reminderType ? convertReminderTypeToJapanese(item.reminderType) : "ーー" }}
      </template>
      <template v-slot:[`item.scheduledSendAt`]="{ item }">
        {{ item.scheduledSendAt ? formatUnixToYYYYMMDDHHmmss(item.scheduledSendAt) : "ーー" }}
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <div :class="stateColor(item.status)">
          {{ convertStateToJapanese(item.status) }}
        </div>
      </template>
    </v-data-table>
    <!-- end of table -->
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapState, } from 'vuex';

import {
  FETCH_ALL_REMIND_CATEGORIES,
  FETCH_REMINDER_EXECUTION_HISTORIES,
  FETCH_ALL_SURVEY_CONFIGS,
} from '@/store/action-types';
import { REMINDER_TYPES } from '@/store/modules/segments/segments.constants';

import DatetimeFormatter from '@/mixins/DatetimeFormatter';

import moment from 'moment';

interface LocalState {
  isShowSearchBox: boolean;
  categoryNames: Array<any>;
  itemNames: Array<any>;
  selectedMonth: string | null;
  isShowMonthMenu: boolean;
  selectedReminderType: string;
  selectedStatus: string;
  selectedCategory: any;
  selectedSurvey: string | null;
  selectedItem: string | null;
  statusList: any;
  reminderTypeList: any;
  items: Array<any>;
  currentPage: number;
  perOnPage: number;
}

export default Vue.extend({
  data(): LocalState {
    return {
      isShowSearchBox: true,

      categoryNames: [{ value: null, text: 'ーー',}],
      itemNames: [{ value: null, text: 'ーー',}],
      selectedMonth: moment().format('YYYY-MM'),
      selectedReminderType: 'ALL',
      selectedStatus: 'ALL',
      selectedCategory: null,
      selectedSurvey: null,
      selectedItem: null,

      statusList: {
        ALL: '全て',
        RUNNING: '処理中',
        SUCCESS: '完了',
        ERROR: 'エラー',
      },
      reminderTypeList: {
        'ALL': '全て',
        [REMINDER_TYPES.APPOINTMENT]: '予約リマインド',
        [REMINDER_TYPES.DATE_RELATIVE]: '日付リマインド',
      },

      isShowMonthMenu: false,

      items: [],
      currentPage: 1,
      perOnPage: 10,
    };
  },
  mixins: [DatetimeFormatter],
  computed: {
    ...mapState({
      allCategories: (state: any) => state.segments.allReminderCategories,
      isFetchingAllRemindCategories: (state: any) => state.segments.isFetchingAllRemindCategories,
      reminderExecutionHistories: (state: any) => state.segments.reminderExecutionHistories,
      isFetchingReminderExecutionHistories: (state: any) => state.segments.isFetchingReminderExecutionHistories,
      fetchReminderExecutionHistoriesError: (state: any) => state.segments.fetchReminderExecutionHistoriesError,
      surveyConfigs: (state: any)  => state.segments.allSurveyConfigs,
      isFetchingAllSurveyConfigs: (state: any)  => state.segments.isFetchingAllSurveyConfigs,
    }),
    headers(): any {
      return [
        { text: '配信ID', value: 'sortKey' },
        { text: '帳票', value: 'surveyName' },
        { text: '分類', value: 'categoryNames' },
        { text: '日時', value: 'scheduledSendAt' },
        { text: 'ステータス', value: 'status' },
        { text: '合計配信数', value: 'deliveryRate' },
      ];
    },
    selectedMonthText: {
      get(): string | null {
        return this.selectedMonth;
      },
      set(value: any) :void {
        !value && (this.selectedMonth = null);
      }
    },
    searchFilters(): any {
      return {
        surveyId: this.selectedSurvey,
        categoryId: this.selectedCategory,
        month: this.selectedMonth ? moment(this.selectedMonth).format('YYYYMM') : null,
        reminderType: this.selectedReminderType,
        status: this.selectedStatus,
        itemName: this.selectedItem
      };
    },
    isLoadingCategories(): any {
      return this.isFetchingAllRemindCategories;
    },
    surveyNames(): any {
      // 「予約型帳票」or「非予約型帳票かつ日付アイテムを持つ帳票」のみにフィルタリング
      const filterdConfigs = this.surveyConfigs.filter(config => {
        const reservationItem = config.surveySchema.find(item => item.type === 'reservation');
        const dateItem = config.surveySchema.find(item => ['date', 'birthday'].includes(item.type));
        return reservationItem || (!reservationItem && dateItem);
      });
      const options = [{ value: null, text: 'ーー' }];
      options.push(
        ...filterdConfigs.map((config) => {
          const { surveyId, surveyTitle } = config;
          return {
            value: surveyId,
            text: surveyTitle
          }
        })
      );
      return options;
    },
  },
  watch: {
    allCategories() {
      this.setCategoryNames(this.selectedSurvey);
    },
    reminderExecutionHistories(newValue) {
      this.items = newValue;
    },
    selectedSurvey(value) {
      if (value !== null) {
        this.selectedCategory = null;
        this.selectedItem = null;
      }
      this.setCategoryNames(value);
      this.setItemNames(value);
    }
  },
  methods: {
    ...mapActions({
      fetchAllReminderCategories: FETCH_ALL_REMIND_CATEGORIES,
      fetchReminderExecutionHistories: FETCH_REMINDER_EXECUTION_HISTORIES,
      fetchAllSurveyConfigs: FETCH_ALL_SURVEY_CONFIGS,
    }),
    async searchReminderExecutionHistories(): Promise<void> {
      const {
        surveyId,
        categoryId,
        reminderType,
        status,
        itemName,
      } = this.searchFilters;
      
      const result = await this.handleFetchReminderExecutionHistories();
      if (!result) {
        return;
      }

      const filterdHistories = this.reminderExecutionHistories.filter(history => {
        const isMatchSurvey = surveyId ? history.surveyId === surveyId : true;
        const isMatchCategory = categoryId ? history.categoryId === categoryId : true;
        const isMatchReminderType = reminderType !== 'ALL' ? history.reminderType === reminderType : true;
        const isMatchStatus = status !== 'ALL' ? history.status === status : true;
        const isMatchItemName = itemName ? history.itemName === itemName : true;
        return isMatchSurvey
          && isMatchCategory
          && isMatchReminderType
          && isMatchStatus
          && isMatchItemName;
      });
      this.items = filterdHistories;
      this.currentPage = 1;
    },
    stateColor(value: any): string {
      switch (value) {
        case 'FINISHED':
        case 'SUCCESS':
          return 'primary--text';
        case 'ERROR':
          return 'red--text';
        default:
          return 'orange--text';
      }
    },
    async clearSearchFilters(): Promise<void> {
      this.selectedSurvey = null;
      this.selectedCategory = null;
      this.selectedReminderType = 'ALL';
      this.selectedStatus = 'ALL';
      this.selectedMonth = moment().format('YYYY-MM');
      this.selectedItem = null;
      await this.handleFetchReminderExecutionHistories();
      this.items = this.reminderExecutionHistories;
      this.currentPage = 1;
    },
    convertStateToJapanese(value: any): any {
      return this.statusList[value] || value;
    },
    convertReminderTypeToJapanese(value: string): string {
      return this.reminderTypeList[value] || value;
    },
    formatCategoryNames(categoryNames: string[]): string {
      return categoryNames.length > 0 ? categoryNames.join(' > ') : 'ーー';
    },
    async handleFetchReminderExecutionHistories() {
      const { month } = this.searchFilters;
      await this.fetchReminderExecutionHistories(month);
      if (this.fetchReminderExecutionHistoriesError) {
        this.$snackbar.show({
          text: 'リマインド配信一覧の取得に失敗しました。管理者にお問い合わせください。',
          type: 'error'
        });
        return false;
      } else {
        return true;
      }
    },
    onClickReminderExecutionHistory(item: any): any {
      return {
        name: 'ReminderExecutionHistory',
        params: {
          partitionKey: item.partitionKey,
          sortKey: item.sortKey,
        },
      };
    },
    setCategoryNames(selectedSurveyId): void {
      const options = [{ value: null, text: 'ーー',}];
      let categories = [];
      const selectedSurveyConfig = this.surveyConfigs.find(config => config.surveyId === selectedSurveyId);

      if (!selectedSurveyConfig) {
        categories = this.allCategories;
      } else {
        const reservationItem = selectedSurveyConfig.surveySchema.find(item => item.type === 'reservation');
        if (!reservationItem) {
          this.categoryNames = options;
          return;
        }

        const { selectedLargeCategory, selectedMediumCategory } = reservationItem;
        categories = this.allCategories.filter(category => {
          if (!selectedLargeCategory) {
            return true;
          }
          if (!selectedMediumCategory) {
            return category.tag1 === selectedLargeCategory.name;
          }
          return category.tag1 === selectedLargeCategory.name && category.tag2 === selectedMediumCategory.name;
        });
      }

      options.push(
        ...categories.map((category) => {
          const { id, tag1, tag2, tag3 } = category;
          let displayCategoryName = `${tag1} > ${tag2}`;
          if (tag3) {
            displayCategoryName += ` > ${tag3}`;
          }
          return {
            value: id,
            text: displayCategoryName.length <= 50
              ? displayCategoryName
              : displayCategoryName.substring(0, 50).concat('...'),
          }
        })
      );
      this.categoryNames = options;
    },
    setItemNames(surveyId): void {
      const options = [{ value: null, text: 'ーー',}];
      const selectedSurveyConfig = this.surveyConfigs.find(config => config.surveyId === surveyId);
      if (selectedSurveyConfig) {
        // 予約型帳票が選択された場合は初期値をセット
        const reservationItem = selectedSurveyConfig.surveySchema.find(item => item.type === 'reservation');
        if (reservationItem) {
          this.itemNames = options;
          return;
        }
        // 非予約型帳票かつ日付アイテムが存在する帳票が選択された場合は日付アイテムをセットする
        selectedSurveyConfig.surveySchema.forEach(item => {
          if (['date', 'birthday'].includes(item.type)) {
            options.push({
              value: item.itemKey,
              text: item.title
            });
          }
        });
      }
      this.itemNames = options;
    },
  },
  created() {
    this.fetchAllReminderCategories();
    this.fetchAllSurveyConfigs();
    this.handleFetchReminderExecutionHistories();
  }
});
</script>
