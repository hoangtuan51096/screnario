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
  <div class="px-4">
    <v-overlay :opacity="0.2" v-if="isDeleting">
      <content-loading :size="50" />
    </v-overlay>
    <v-row class="mb-4" justify="end">
      <v-btn
        class="mr-2"
        color="error"
        :disabled="!isSelectedSettings"
        @click="showDeleteConfirm()"
      >
        選択項目を削除
      </v-btn>
      <v-btn
        color="primary"
        @click="showRegisterModal()"
      >
        設定登録
      </v-btn>
    </v-row>
    <!-- table -->
    <v-row justify="center">
      <v-card>
        <v-data-table
          fixed-header
          item-key="reminderId"
          show-select
          v-model="selectedSettingsList"
          :headers="headers"
          :height="tableHeight"
          :items="dateRelativeReminderSettingsList"
          :loading="isFetching"
        >
          <template v-slot:[`item.message1`]="{ item }">
          {{ omitMessage(item.message1) }}
          </template>
          <template v-slot:[`item.message2`]="{ item }">
            {{ omitMessage(item.message2) }}
          </template>
        </v-data-table>
      </v-card>
    </v-row>
    <!-- 日付リマインド配信モーダル -->
    <DateRelativeReminderRegisterModal
      :isShowProp="isShowRegisterModal"
      @close="isShowRegisterModal = false"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import {
  DELETE_DATE_RELATIVE_REMINDER_SETTINGS,
  FETCH_ALL_RELATIVE_REMINDER_SETTINGS,
} from '@/store/action-types';
import { DateRelativeReminderSettings } from '@/store/modules/segments/segments.types';

import DateRelativeReminderRegisterModal from '../components/DateRelativeReminderRegisterModal/index.vue';

interface LocalState {
  isFetching: boolean;
  isDeleting: boolean;
  isShowRegisterModal: boolean;
  headers: any[];
  selectedSettingsList: DateRelativeReminderSettings[];
  maxMessageLength: number;
}

export default Vue.extend({
  data(): LocalState {
    return {
      isFetching: false,
      isDeleting: false,
      isShowRegisterModal: false,

      headers: [
        {
          text: '帳票名',
          sortable: true,
          value: 'surveyName',
          width: '200px',
        },
        {
          text: '質問項目',
          sortable: true,
          value: 'dateItemName',
          width: '160px',
        },
        {
          text: '経過年数',
          sortable: true,
          value: 'yearsAfter',
          width: '120px',
        },
        {
          text: '経過日数',
          sortable: true,
          value: 'daysAfter',
          width: '120px',
        },
        {
          text: 'メッセージ1',
          sortable: true,
          value: 'message1',
          width: '300px',
        },
        {
          text: 'メッセージ2',
          sortable: true,
          value: 'message2',
          width: '300px',
        },
      ],
      selectedSettingsList: [],
      maxMessageLength: 500,
    };
  },
  components: {
    DateRelativeReminderRegisterModal,
  },
  computed: {
    ...mapState({
      dateRelativeReminderSettingsList: (state) =>
        (state as any).segments.dateRelativeReminderSettingsList as DateRelativeReminderSettings[],
    }),
    isSelectedSettings(): boolean {
      return this.selectedSettingsList.length > 0;
    },
    tableHeight(): number | undefined {
      const maxHeight = 550;
      const excessiveMessageItem = this.dateRelativeReminderSettingsList.find(({ message1, message2 }) => {
        return message1.length > this.maxMessageLength || message2.length > this.maxMessageLength;
      });
      if (excessiveMessageItem) {
        return maxHeight;
      } else {
        return this.dateRelativeReminderSettingsList.length >= 10 ? maxHeight : undefined;
      }
    },
  },
  async created() {
    try {
      this.isFetching = true;
      await this.fetchReminderSettings();
    } catch (error) {
      this.$snackbar.show({
        text: error,
        type: 'error',
      });
    } finally {
      this.isFetching = false;
    }
  },
  methods: {
    ...mapActions({
      deleteReminderSettings: DELETE_DATE_RELATIVE_REMINDER_SETTINGS,
      fetchReminderSettings: FETCH_ALL_RELATIVE_REMINDER_SETTINGS,
    }),
    omitMessage(message) {
      if (typeof message === 'string' && message.length > this.maxMessageLength) {
        return message.substring(0, this.maxMessageLength).concat('...');
      }
      return message;
    },
    showDeleteConfirm(): void {
      this.$dialog.show({
        title: '確認',
        text: '選択中の項目を全て削除してもよろしいですか？\nこの操作は取り消せません。',
        type: 'error',
        btnConfirmTitle: '削除',
        onConfirm: () => this.handleDeleteSettings(),
      });
    },
    showRegisterModal(): void {
      this.isShowRegisterModal = true;
    },
    async handleDeleteSettings(): Promise<void> {
      try {
        this.isDeleting = true;
        await this.deleteReminderSettings(this.selectedSettingsList);
        this.selectedSettingsList = [];
        this.$snackbar.show({ text: '削除が完了しました。' });
      } catch (error) {
        if (typeof error !== 'string' && error.errorMessage && error.data) {
          this.selectedSettingsList = error.data;
          const errorText = `${error.errorMessage}\n${JSON.stringify(error.data, undefined, 2)}`;
          this.$snackbar.show({
            text: errorText,
            type: 'error',
          });
        } else {
          this.$snackbar.show({
            text: error,
            type: 'error',
          });
        }
      } finally {
        this.isDeleting = false;
      }
    }
  },
});
</script>
