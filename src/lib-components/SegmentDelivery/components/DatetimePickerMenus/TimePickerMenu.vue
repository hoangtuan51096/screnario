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
  <v-menu
    ref="menu"
    v-model="menu_time"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="time"
        :rules="timeRules"
        readonly
        outlined
        dense
        hide-details="auto"
        clearable
        :filled="!enablePicker"
        :disabled="!enablePicker"
        v-bind="attrs"
        v-on="on"
        style="max-width: 120px"
      ></v-text-field>
    </template>
    <v-time-picker v-if="menu_time" v-model="time" full-width></v-time-picker>
  </v-menu>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import { SET_DISTRIBUTION_DETAIL, SET_RECURRING_SETTINGS } from "@/store/mutation-types";

interface LocalState {
  menu_time: any;
}

export default Vue.extend({
  props: {
    field: String,
    enablePicker: Boolean,
  },
  data(): LocalState {
    return {
      menu_time: false,
    };
  },
  components: {},
  mixins: [],
  computed: {
    ...mapState({
      distributionDetail: (state: any) => state.segments.distributionDetail,
    }),
    time: {
      get(): any {
        return this.field == "recurringSettings"
          ? this.distributionDetail.recurringSettings.fromTime
          : this.distributionDetail.scheduledStartTime;
      },
      set(value: any): void {
        this.field == "recurringSettings"
          ? this.handleUpdate({ fromTime: value })
          : this.handleUpdate({ scheduledStartTime: value });
      },
    },
    startType: {
      get(): any {
        return this.distributionDetail.startType;
      },
    },
    timeRules: {
      get(): any {
        if (this.enablePicker) {
          return [(v) => !!v || "時間は必須入力です。"];
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
    handleUpdate(value: any): void {
      this.field == "recurringSettings"
        ? this.updateRecurringSettings({ ...this.distributionDetail.recurringSettings, ...value })
        : this.updateDistributionDetail({ ...this.distributionDetail, ...value });
    },
  },
  created() {},
});
</script>
