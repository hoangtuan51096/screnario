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
  <v-dialog v-model="isShow" scrollable max-width="800">
    <v-overlay :opacity="0.2" v-if="isRegisting">
      <content-loading :size="50" />
    </v-overlay>
    <v-card>
      <v-system-bar color="primary" dark height="5"></v-system-bar>
      <v-card-title class="pa-2">
        <v-toolbar flat>
          <v-toolbar-title>日付リマインド配信</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="$emit('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card-title>
      <v-card-text class="px-8">
        <!-- 帳票選択 -->
        <SurveySelector
          :isFetchingSurveyConfigsProp="isFetchingSurveyConfigs"
          :selectedSurveyIdProp="selectedSurveyId"
          :surveyConfigsProp="surveyConfigs"
          @selectSurvey="selectSurvey"
          @getSurveyConfigs="handleFetchSurveyConfigs"
        />
        <!-- アイテム選択 -->
        <ItemSelector
          :selectedItemKeyProp="selectedItemKey"
          :selectedSurveyIdProp="selectedSurveyId"
          :surveySchemaProp="surveySchema"
          @selectItem="selectItem"
        />
        <!-- ファイル選択 -->
        <CsvImporter
          :canSelectFileProp="canSelectFile"
          :fileDataProp="fileData"
          :selectedSurveyIdProp="selectedSurveyId"
          @setDateRelativeReminderSettingsList="setDateRelativeReminderSettingsList"
          @setFileData="setFileData"
        />
        <!-- インポートデータ表示テーブル -->
        <CsvContentsViewer :contentsProp="localDateRelativeReminderSettingsList"/>
        <!-- サンプルファイルダウンロード -->
        <v-row justify="center" class="pt-4">
          <span class="caption caption-text">ファイル形式：CSV</span>
        </v-row>
        <v-row justify="center">
          <SampleDownloader />
        </v-row>
        <!-- 登録ボタン -->
        <v-row justify="center" class="pt-4">
          <v-btn
            color="primary"
            class="px-6 mr-2"
            elevation="4"
            :disabled="!canRegist"
            @click="showRegistConfirm"
          >
            登録する
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import { REGIST_RELATIVE_REMINDER_SETTINGS } from '@/store/action-types';
import {
  CsvContent,
  DateRelativeReminderSettings,
} from '@/store/modules/segments/segments.types';
import { REMINDER_TYPES } from '@/store/modules/segments/segments.constants';
import { sortSurveyConfigsByUpdatedAtDesc } from '@/store/modules/segments/segments-utils';
import { GetAndStockSurveyList } from '@/services/form.service';

import CsvContentsViewer from './CsvContentsViewer.vue';
import CsvImporter from './CsvImporter.vue'
import ItemSelector from './ItemSelector.vue';
import SampleDownloader from './SampleDownloader.vue';
import SurveySelector from './SurveySelector.vue';

export default Vue.extend({
  data() {
    return {
      localDateRelativeReminderSettingsList: [],
      fileData: null,

      isFetchingSurveyConfigs: false,
      isRegisting: false,

      selectedItemKey: null,
      selectedItemTitle: null,
      selectedSurveyId: null,
      selectedSurveyTitle: null,
      surveyConfigs: [],

      dateItemTypes: ['date', 'birthday'],
    };
  },
  props: {
    isShowProp: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    CsvContentsViewer,
    CsvImporter,
    ItemSelector,
    SampleDownloader,
    SurveySelector,
  },
  computed: {
    isShow: {
      get() {
        return this.isShowProp;
      },
      set() {
        this.$emit('close');
      },
    },
    surveySchema() {
      if (this.selectedSurveyId) {
        const surveyConfig = this.surveyConfigs.find(item => item.surveyId === this.selectedSurveyId);
        return surveyConfig.surveySchema;
      } else {
        return [];
      }
    },
    canSelectFile() {
      return !!this.selectedSurveyId && !!this.selectedItemKey;
    },
    canRegist() {
      return this.localDateRelativeReminderSettingsList.length > 0;
    },
  },
  async created() {
    await this.handleFetchSurveyConfigs();
  },
  methods: {
    ...mapActions({
      registReminderSettings: REGIST_RELATIVE_REMINDER_SETTINGS,
    }),
    attachRequiredParamsToContents(contents: CsvContent[]): DateRelativeReminderSettings[] {
      const attachedContents = contents.map(content => {
        const { daysAfter, yearsAfter } = content;
        const attachedContent = {
          ...content,
          daysAfter: Number(daysAfter),
          yearsAfter: Number(yearsAfter),
          dateItemName: this.selectedItemTitle,
          dateItemKey: this.selectedItemKey,
          reminderType: REMINDER_TYPES.DATE_RELATIVE,
          surveyName: this.selectedSurveyTitle,
          surveyId: this.selectedSurveyId,
        } as DateRelativeReminderSettings;
        return attachedContent;
      });
      return attachedContents;
    },
    filterConfgisByNonReservedAndHasDateItem(configs)[] {
      return configs.filter(config => {
        const reservationItem = config.surveySchema.find(item => item.type === 'reservation');
        const dateTypeItem = config.surveySchema.find(item => this.dateItemTypes.includes(item.type));
        return !reservationItem && dateTypeItem;
      });
    },
    filterSchemaByDateItem(config) {
      config.surveySchema = config.surveySchema.filter(item => this.dateItemTypes.includes(item.type));
    },
    async handleFetchSurveyConfigs() {
      try {
        this.isFetchingSurveyConfigs = true;
        const surveyConfigs = await GetAndStockSurveyList('all');
        const filteredConfigs = this.filterConfgisByNonReservedAndHasDateItem(surveyConfigs);
        filteredConfigs
          .sort(sortSurveyConfigsByUpdatedAtDesc)
          .forEach(config => this.filterSchemaByDateItem(config));
        this.surveyConfigs = filteredConfigs;
      } catch (error) {
        this.$snackbar.show({
          text: error,
          type: 'error',
        });
      } finally {
        this.isFetchingSurveyConfigs = false;
      }
    },
    async handleRegistReminderSettings() {
      try {
        this.isRegisting = true;
        await this.registReminderSettings(this.localDateRelativeReminderSettingsList);
        this.$snackbar.show({ text: '登録が完了しました。' });
        this.$emit('close');
      } catch (error) {
        this.$snackbar.show({
          text: error,
          type: 'error',
        });
      } finally {
        this.isRegisting = false;
      }
    },
    initAll() {
      this.initImportData();
      this.initSelectedItem();
      this.initSelectedSurvey();
    },
    initImportData() {
      this.localDateRelativeReminderSettingsList = [];
      this.fileData = null;
    },
    initSelectedItem() {
      this.selectedItemKey = null;
      this.selectedItemTitle = null;
    },
    initSelectedSurvey() {
      this.selectedSurveyId = null;
      this.selectedSurveyTitle = null;
    },
    selectSurvey(surveyId) {
      const surveyConfig = this.surveyConfigs.find(config => config.surveyId === surveyId);
      if (surveyId === null || !surveyConfig) {
        this.initSelectedSurvey();
      } else {
        this.selectedSurveyId = surveyConfig.surveyId;
        this.selectedSurveyTitle = surveyConfig.surveyTitle;
      }
    },
    selectItem(itemKey) {
      const selectedItem = this.surveySchema.find(item => item.itemKey === itemKey);
      if (itemKey === null || !selectedItem) {
        this.initSelectedItem();
      } else {
        this.selectedItemKey = selectedItem.itemKey;
        this.selectedItemTitle = selectedItem.title;
      }
    },
    setDateRelativeReminderSettingsList(contents: CsvContent[]) {
      this.localDateRelativeReminderSettingsList = this.attachRequiredParamsToContents(contents);
    },
    setFileData(file: File | null) {
      this.fileData = file;
    },
    showRegistConfirm() {
      this.$dialog.show({
        title: '確認',
        text: 'この内容で登録してもよろしいですか？',
        onConfirm: () => this.handleRegistReminderSettings(),
      });
    },
  },
  watch: {
    isShowProp() {
      this.initAll();
    },
    selectedItemKey() {
      this.initImportData();
    },
    selectedSurveyId() {
      this.initSelectedItem();
      this.initImportData();
    },
  },
});
</script>

<style scoped>
.caption-text {
  color: gray;
}
</style>
