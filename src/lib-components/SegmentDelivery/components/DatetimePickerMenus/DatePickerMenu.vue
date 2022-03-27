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
  <v-menu v-model="menu_date" :close-on-content-click="false" transition="scale-transition" offset-y min-width="290px">
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="date"
        :rules="dateRules"
        readonly
        outlined
        dense
        hide-details="auto"
        clearable
        :filled="!enablePicker"
        :disabled="!enablePicker"
        v-bind="attrs"
        v-on="on"
        style="max-width: 150px"
      ></v-text-field>
    </template>
    <v-date-picker v-model="date" :type="datetype" color="primary" no-title show-current @input="menu_date = false">
    </v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import { SET_DISTRIBUTION_DETAIL, SET_RECURRING_SETTINGS } from "@/store/mutation-types";

import DatetimeFormatter from "@/mixins/DatetimeFormatter";

export default Vue.extend({
  props: {
    field: String,
    isEndDate: Boolean,
    enablePicker: Boolean,
  },
  data() {
    return {
      menu_date: false,
      fromDateString: "",
      toDateString: "",
    };
  },
  components: {},
  mixins: [DatetimeFormatter],
  computed: {
    ...mapState({
      distributionDetail: (state) => state.segments.distributionDetail,
    }),
    date: {
      get()  {
        if (this.field == "recurringSettings") {
          if (this.distributionDetail.recurringSettings.period == "LastDay") {
            return this.isEndDate
              ? this.distributionDetail.recurringSettings.toDate
                ? this.formatToYYYYMM(this.distributionDetail.recurringSettings.toDate)
                : null
              : this.distributionDetail.recurringSettings.fromDate
              ? this.formatToYYYYMM(this.distributionDetail.recurringSettings.fromDate)
              : null;
          } else {
            return this.isEndDate
              ? this.distributionDetail.recurringSettings.toDate
                ? this.formatToYYYYMMDD(this.distributionDetail.recurringSettings.toDate)
                : null
              : this.distributionDetail.recurringSettings.fromDate
              ? this.formatToYYYYMMDD(this.distributionDetail.recurringSettings.fromDate)
              : null;
          }
        } else {
          return this.distributionDetail.scheduledStartDate;
        }
      },
      set(value) {
        if (this.field == "recurringSettings") {
          this.isEndDate ? this.handleUpdate({ toDate: value }) : this.handleUpdate({ fromDate: value });
        } else {
          this.handleUpdate({ scheduledStartDate: value });
        }
      },
    },
    datetype: {
      get()  {
        if (this.field == "recurringSettings" && this.distributionDetail.recurringSettings.period == "LastDay") {
          return "month";
        }
        return "date";
      },
    },
    startType: {
      get()  {
        return this.distributionDetail.startType;
      },
    },
    dateRules: {
      get()  {
        if (this.enablePicker) {
          return [(v) => !!v || "日付は必須入力です。"];
        }
        return [];
      },
    },
  },
  watch: {},
  methods: {
    ...mapMutations({
      updateDistributionDetail: SET_DISTRIBUTION_DETAIL,
      updateRecurringSettings: SET_RECURRING_SETTINGS,
    }),
    handleUpdate(value) {
      if (this.field == "recurringSettings") {
        this.updateRecurringSettings({ ...this.distributionDetail.recurringSettings, ...value });
      } else {
        this.updateDistributionDetail({ ...this.distributionDetail, ...value });
      }
    },
  },
  created() {},
});
</script>
