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
  <v-row no-gutters v-if="contentsProp.length > 0">
    <v-card>
      <v-data-table
        fixed-header
        hide-default-footer
        :headers="headers"
        :height="tableHeight"
        :items="contentsProp"
        :items-per-page="-1"
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
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { DateRelativeReminderSettings } from '@/store/modules/segments/segments.types';

interface LocalState {
  headers: any[];
  maxMessageLength: number;
}


export default Vue.extend({
  data(): LocalState {
    return {
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
      maxMessageLength: 500,
    };
  },
  props: {
    contentsProp: {
      type: Array as PropType<DateRelativeReminderSettings[]>,
      required: true,
    },
  },
  computed: {
    tableHeight(): number | undefined {
      const maxHeight = 350;
      const excessiveMessageItem = this.contentsProp.find(({ message1, message2 }) => {
        return message1.length > this.maxMessageLength || message2.length > this.maxMessageLength;
      });
      if (excessiveMessageItem) {
        return maxHeight;
      } else {
        return this.contentsProp.length >= 10 ? maxHeight : undefined;
      }
    },
  },
  methods: {
    omitMessage(message) {
      if (typeof message === 'string' && message.length > this.maxMessageLength) {
        return message.substring(0, this.maxMessageLength).concat('...');
      }
      return message;
    }
  }
});
</script>
