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
  <v-row no-gutters>
    <v-col cols="12">
      <v-file-input
        accept=".csv"
        :disabled="!canSelectFileProp"
        :error-messages="csvFileImportError"
        :loading="isLoadingCsv"
        :placeholder="placeholder"
        :value="fileDataProp"
        @change="onChangeFile"
      >
      </v-file-input>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import Encoding from 'encoding-japanese';
import Papa from 'papaparse';
import { isEqual } from 'lodash';

import { CsvContent, DateRelativeReminderSettings } from '@/store/modules/segments/segments.types';
import { SettingItemInDateRelativeReminderSetting } from '@/store/modules/segments/segments.model';

type ValidateResult = string | null;

export default Vue.extend({
  data() {
    return {
      csvFileImportError: '',
      isLoadingCsv: false,
    };
  },
  props: {
    canSelectFileProp: {
      type: Boolean,
      required: true,
    },
    fileDataProp: {
      required: true,
    },
    selectedSurveyIdProp: {
      required: true,
    },
  },
  computed: {
    ...mapState({
      dateRelativeReminderSettingsList: (state) => (state).segments.dateRelativeReminderSettingsList as DateRelativeReminderSettings[],
    }),
    placeholder() {
      return this.canSelectFileProp ? 'ファイルを選択' : '帳票と質問項目を選択してください'
    },
    settingsListBySelectedSurvey()[] {
      if (!this.selectedSurveyIdProp) {
        return [];
      }
      return this.dateRelativeReminderSettingsList.filter(settings => settings.surveyId === this.selectedSurveyIdProp);
    }
   },
  methods: {
    detectEncodingAndReadCsv(file: File) {
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onerror = () => {
          reader.abort();
          reject('ファイルの読み取りエラーが発生しました。');
        };

        reader.onload = (e) => {
          const codes = new Uint8Array(e.target.result);
          const csvEncoding = Encoding.detect(codes);
          resolve(csvEncoding);
        };

        reader.readAsArrayBuffer(file);
      });
    },
    formatCsvContentToObj(content[]): CsvContent {
      const [yearsAfter, daysAfter, message1, message2] = content;
      return {
        yearsAfter,
        daysAfter,
        message1,
        message2,
      };
    },
    formatAndValidationCsvContents(csvData): SettingItemInDateRelativeReminderSetting[] {
      const [header, ...contents] = csvData;
      // フォーマット
      const formatContents: CsvContent[] = contents.map(content => this.formatCsvContentToObj(content));

      // CSVの入力件数と設定可能数のバリデーション
      const validateContentsLengthResult: ValidateResult = this.validateContentsLength(formatContents.length);
      if (validateContentsLengthResult !== null) {
        throw validateContentsLengthResult;
      }

      // ヘッダーのバリデーション
      const validateHeaderResult: ValidateResult = this.validateCsvHeader(header);
      if (validateHeaderResult !== null) {
        throw `[1行目] ${validateHeaderResult}`;
      }

      // 1行毎のバリデーション
      const settingContents: SettingItemInDateRelativeReminderSetting[] = formatContents.map((content, i) => {
        try {
          return new SettingItemInDateRelativeReminderSetting(content);
        } catch(e) {
          // iが0から始まるのとヘッダーの行数はカウントしないのでiに2加算した値を行数とする
          const lineNumber = i + 2;
          throw `[${lineNumber}行目] ${e}`;
        }
      });

      // 既存設定データとformatData両方を参照して、同じ年数・日数の設定が存在しないかバリデーション
      const validateSameYearsAndDaysWithExistDataResult: ValidateResult = this.validateSameYearsAndDaysWithExistData(formatContents);
      if (validateSameYearsAndDaysWithExistDataResult !== null) {
        throw validateSameYearsAndDaysWithExistDataResult;
      }

      return settingContents;
    },
    getSameYearsAndDaysLineNumbers(
      contents1: CsvContent[],
      contents2: CsvContent[] | DateRelativeReminderSettings[]
    )[] {
      const isSameContents = isEqual(contents1, contents2);
      const duplicateLineNumbers = contents1.reduce((numbers, content1, index1) => {
        const { yearsAfter: yearsAfter1, daysAfter: daysAfter1 } = content1;
        const isDuplicate = contents2.some((content2, index2) => {
          const { yearsAfter: yearsAfter2, daysAfter: daysAfter2 } = content2;
          // contents1とcontents2が同じなら同じindexのデータは重複していないとみなす
          if (index1 === index2 && isSameContents) {
            return false;
          }
          return Number(yearsAfter1) === Number(yearsAfter2) && Number(daysAfter1) === Number(daysAfter2);
        });

        if (isDuplicate) {
          // index1が0から始まるのとヘッダーの行数はカウントしないのでindex1に2加算した値を行数とする
          const lineNumber = index1 + 2;
          numbers.push(lineNumber);
        }

        return numbers;
      }, []);

      return duplicateLineNumbers;
    },
    async onChangeFile(file: File | null) {
      this.$emit('setFileData', file);
      this.csvFileImportError = '';
      if (file) {
        try {
          this.isLoadingCsv = true;
          const readResult = await this.readCsv(file);
          const formatContents: SettingItemInDateRelativeReminderSetting[] = this.formatAndValidationCsvContents(readResult.data);
          this.$emit('setDateRelativeReminderSettingsList', formatContents);
        } catch (error) {
          this.csvFileImportError = error;
        } finally {
          this.isLoadingCsv = false;
        }
      } else {
        this.$emit('setDateRelativeReminderSettingsList', []);
      }
    },
    async readCsv(file: File) {
      const validateExtentionResult: ValidateResult = this.validateExtention(file);
      if (validateExtentionResult !== null) {
        throw validateExtentionResult;
      }
      const csvEncoding = await this.detectEncodingAndReadCsv(file);

      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: false,
          skipEmptyLines: true,
          delimiter: ',',
          encoding: csvEncoding,
          complete(result) {
            resolve(result);
          },
          error() {
            reject('ファイルの読み取りエラーが発生しました。');
          },
        });
      });
    },
    validateContentsLength(contentsLength): ValidateResult {
      if (contentsLength === 0) {
        return '最低でも1行以上は設定データを入力してください。';
      }

      const allowedMaxLengthBySurvey = 20;
      const lengthWithSelectedSurvey = this.settingsListBySelectedSurvey.length + contentsLength;
      if (lengthWithSelectedSurvey > allowedMaxLengthBySurvey) {
        const diff = lengthWithSelectedSurvey - allowedMaxLengthBySurvey;
        return `帳票毎に設定できる件数は20件までです。${diff}件オーバーしています。`;
      }

      const allowedMaxLengthOfAll = 100;
      const lengthWithAll = this.dateRelativeReminderSettingsList.length + contentsLength;
      if (lengthWithAll > allowedMaxLengthOfAll) {
        const diff = lengthWithAll - allowedMaxLengthOfAll;
        return `既存の設定と合わせて設定可能な数は100件までです。${diff}件オーバーしています。`
      }

      return null;
    },
    validateCsvHeader(csvHeader): ValidateResult {
      const header = ['経過年数', '経過日数', 'メッセージ1', 'メッセージ2'];
      const isValid = isEqual(header, csvHeader);
      return isValid ? null : 'CSVファイルの1行目は「経過年数」「経過日数」「メッセージ1」「メッセージ2」を入力してください。';
    },
    validateExtention(file: File): ValidateResult {
      const { name } = file;
      const extention = name
        .split('.')
        .pop();
      const isCsv = extention && extention.toLowerCase() === 'csv';
      return isCsv ? null : 'CSVファイルを選択してください。';
    },
    validateSameYearsAndDaysWithExistData(contents: CsvContent[] | DateRelativeReminderSettings[]): ValidateResult {
      // CSVデータ内で重複しているかチェック
      const duplicateLineNumbersWithCsv = this.getSameYearsAndDaysLineNumbers(contents, contents);
      if (duplicateLineNumbersWithCsv.length > 0) {
        return `CSVの${duplicateLineNumbersWithCsv.join(', ')}行目の年数と日数が重複しています。`;
      }

      // 既存データとCSVデータとで重複しているかチェック
      const duplicateLineNumbersWithExistData = this.getSameYearsAndDaysLineNumbers(contents, this.settingsListBySelectedSurvey);
      if (duplicateLineNumbersWithExistData.length > 0) {
        return `CSVの${duplicateLineNumbersWithExistData.join(', ')}行目の年数と日数が既存データと重複しています。`;
      }

      return null;
    },
  },
  watch: {
    fileDataProp(file: File | null) {
      if (file === null) {
        this.csvFileImportError = '';
      }
    },
  }
});
</script>
