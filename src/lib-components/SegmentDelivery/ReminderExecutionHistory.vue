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
    <v-overlay :opacity="0.2" v-if="isFetchingSingleReminderExecutionHistory">
      <content-loading :size="50" text="" />
    </v-overlay>
    <div>
      <div class="text-right mt-4 row">
        <router-link :to="{ name: 'SegmentDeliveryPage' }" class="list-item-link">
          <v-btn color="primary" class="mx-4" text>
            <v-icon left>mdi-arrow-left-circle</v-icon>
            配信一覧に戻る
          </v-btn>
        </router-link>
        <v-spacer></v-spacer>
        <v-btn
          class="mr-3"
          color="primary"
          elevation="1"
          v-show="isAppointmentType"
          @click="moveToReservationReminderConfigurationCreation()"
        >設定ページ</v-btn>
      </div>
      <v-card outlined class="mt-4 mb-4">
        <v-toolbar flat dense>
          <v-toolbar-title>リマインド配信詳細</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-divider></v-divider>
        <template v-for="(value, name) in objectNames">
          <v-row no-gutters class="my-3" :key="'row-' + name">
            <v-col :key="'col-' + name" :cols="3">
              <v-subheader>
                <strong>{{ value }}</strong>
              </v-subheader>
            </v-col>
            <v-col :key="'col-item-' + name">
              <div class="body-2 py-2 px-4">
                <div v-if="item && name === 'sortKey'">
                  {{ item.sortKey ? item.sortKey : 'ーー' }}
                </div>
                <div v-if="item && name === 'scheduledSendAt'">
                  {{ item.scheduledSendAt ? formatUnixToYYYYMMDHHmmss(item.scheduledSendAt) : 'ーー' }}
                </div>
                <div v-if="item && name === 'status'">
                  <div :class="statusColor(item.status)">
                    {{ item.status ? convertStatusToJapanese(item.status) : 'ーー' }}
                  </div>
                </div>
                <div v-if="item && name === 'reminderType'">
                  <div>
                    {{ item.reminderType ? convertReminderTypeToJapanese(item.reminderType) : 'ーー' }}
                  </div>
                </div>
                <div v-if="item && name === 'surveyName'">
                  {{ item.surveyName ? item.surveyName : 'ーー' }}
                </div>
                <div v-if="item && name === 'categoryNames'">
                  {{ item.categoryNames ? formatCategoryNames(item.categoryNames) : 'ーー' }}
                </div>
                <div v-if="item && name === 'itemName'">
                  {{ item.itemName || 'ーー' }}
                </div>
                <div v-if="item && name === 'successCount'">
                  {{ item.successCount || item.successCount === 0 ? item.successCount : 'ーー' }}
                </div>
                <div v-if="item && name === 'errorCount'">
                  {{ item.errorCount || item.errorCount === 0 ? item.errorCount : "ーー" }}
                </div>
                <div v-if="item && name === 'deliveryCount'">
                  {{ item.deliveryCount || item.deliveryCount === 0 ? item.deliveryCount : 'ーー' }}
                </div>
              </div>
            </v-col>
          </v-row>
        </template>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapState } from 'vuex';

import {
  FETCH_ONE_REMINDER_EXECUTION_HISTORY,
} from '@/store/action-types';
import { REMINDER_TYPES } from '@/store/modules/segments/segments.constants';

import DatetimeFormatter from '@/mixins/DatetimeFormatter';

export default Vue.extend({
  data() {
    return {
      statusList: {
        RUNNING: '処理中',
        SUCCESS: '完了',
        ERROR: 'エラー',
      },
      reminderTypeList: {
        [REMINDER_TYPES.APPOINTMENT]: '予約リマインド',
        [REMINDER_TYPES.DATE_RELATIVE]: '日付リマインド',
      },
      item: {}
    };
  },
  mixins: [DatetimeFormatter],
  computed: {
    ...mapState({
      reminderExecutionHistory: (state) => state.segments.reminderExecutionHistory,
      isFetchingSingleReminderExecutionHistory: (state) => state.segments.isFetchingSingleReminderExecutionHistory,
      fetchSingleReminderExecutionHistoryError: (state) => state.segments.fetchSingleReminderExecutionHistoryError,
    }),
    isAppointmentType() {
      return this.item.reminderType === REMINDER_TYPES.APPOINTMENT;
    },
    objectNames() {
      const objectNames = {
        sortKey: '配信ID',
        scheduledSendAt: '送信日時',
        status: '状況',
        reminderType: '種別',
        surveyName: '対象帳票',
        itemName: '質問項目',
        categoryNames: '対象カテゴリー',
        successCount: '配信成功の数',
        errorCount: '配信失敗の数',
        deliveryCount: '合計配信数'
      };
      if (this.isAppointmentType) {
        delete objectNames.itemName;
      } else {
        delete objectNames.categoryNames;
      }
      return objectNames;
    },
  },
  watch: {
    reminderExecutionHistory(newValue) {
      this.item = newValue;
    }
  },
  methods: {
    ...mapActions({
      fetchReminderExecutionHistory: FETCH_ONE_REMINDER_EXECUTION_HISTORY
    }),
    statusColor(value) {
      if (!value) {
        return;
      }
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
    formatCategoryNames(categoryNames[]) {
      return categoryNames.join(' > ');
    },
    convertStatusToJapanese(value) {
      return this.statusList[value] || value;
    },
    convertReminderTypeToJapanese(value) {
      return this.reminderTypeList[value] || value;
    },
    async handleFetchReminderExecutionHistory() {
      const { partitionKey, sortKey } = this.$route.params;
      await this.fetchReminderExecutionHistory({ partitionKey, sortKey });
      if (this.fetchSingleReminderExecutionHistoryError) {
        this.$snackbar.show({
          text: '予約リマインド配信詳細の取得に失敗しました。管理者にお問い合わせください。',
          type: 'error'
        });
      }
    },
    moveToReservationReminderConfigurationCreation() {
      const { surveyId, categoryId } = this.item;
      if (this.isAppointmentType) {
        this.$router.push({
          name: 'ReservationReminderConfigurationCreation',
          params: {
            surveyId,
            categoryId,
          },
        });
      }
    },
  },
  async created() {
    window.scrollTo(0, 0);
    await this.handleFetchReminderExecutionHistory();
  },
});
</script>

<style scoped>
.mail-body-format {
  white-space: pre-line;
}
</style>
