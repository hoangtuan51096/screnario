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
    <v-row>
      <v-col cols="12" md="4 pt-4">
        <v-autocomplete
          v-model="selectedDeliveryTitle"
          :items="deliveryTitleOptions"
          label="配信名"
          outlined
          dense
          clearable
          hide-details
        >
        </v-autocomplete>
      </v-col>
      <v-col cols="12" md="5 pt-4">
        <v-autocomplete
          v-if="searchStyle === 'mail-delivery-list'"
          v-model="selectedFormConfig"
          :items="surveyConfigOptions"
          label="帳票"
          outlined
          dense
          clearable
          hide-details
        ></v-autocomplete>
        <v-autocomplete
          v-else
          v-model="selectedTalkName"
          :items="talkNameOptions"
          label="トーク名"
          outlined
          dense
          clearable
          hide-details
        ></v-autocomplete>
      </v-col>
      <v-col cols="12" md="3 pt-4">
        <v-autocomplete
          v-model="selectedEnabled"
          :items="enabledTags"
          label="有効/無効"
          outlined
          dense
          clearable
          hide-details
        ></v-autocomplete>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations, mapGetters } from "vuex";
import { UPDATE_SEGMENT_FILTER } from "@/store/mutation-types";

interface TextValuePair {
  text;
  value;
}

export default Vue.extend({
  name: "SearchFrament",
  props: {
    surveyConfigs: Array,
    searchStyle: {
      type: String,
      default: "mail-delivery-list",
    }
  },
  data() {
    return {
      enabledTags: [
        { text: "有効", value: true },
        { text: "無効", value: false },
      ],
    };
  },
  watch: {
    searchStyle(value) {
      this.updateData({ segmentSearchStyle: value });
    },
  },
  computed: {
    ...mapState({
      mailDeliveryList: (state) => state.segments.mailDeliveryList,
      talkDeliveryList: (state) => state.segments.talkDeliveryList,
      filters: (state) => state.segments.filters,
    }),
    selectedEnabled: {
      get() {
        return this.filters.enabled;
      },
      set(value) {
        this.updateData({ enabled: value === null ? 0 : value });
      },
    },
    selectedDeliveryTitle: {
      get() {
        return this.filters.deliveryTitle;
      },
      set(value) {
        this.updateData({ deliveryTitle: value });
      },
    },
    selectedFormConfig: {
      get() {
        return this.filters.surveyId;
      },
      set(value) {
        this.updateData({ surveyId: value });
      },
    },
    selectedTalkName: {
      get() {
        return this.filters.talkName;
      },
      set(value) {
        this.updateData({ talkName: value });
      },
    },
    deliveryTitleOptions() {
      let options = [];

      if (this.searchStyle === "mail-delivery-list") {
        options.push(
          ...this.mailDeliveryList.map((item) => {
            return {
              value: item.deliveryTitle,
              text: item.deliveryTitle,
            };
          })
        );
      } else {
        options.push(
          ...this.talkDeliveryList.map((item) => {
            return {
              value: item.deliveryTitle,
              text: item.deliveryTitle,
            };
          })
        );
      }

      return options;
    },
    surveyConfigOptions() {
      let options = [];

      options.push(
        ...this.surveyConfigs.map((obj) => {
          return {
            value: obj.surveyId,
            text: "[ " + obj.surveyTitle + " ] " + obj.surveyId,
          };
        })
      );

      return options;
    },
    talkNameOptions() {
      let options = [];

      options.push(
        ...this.talkDeliveryList.map((obj) => {
          return {
            value: obj.talkName,
            text: obj.talkName,
          };
        })
      );

      return options;
    },
  },
  methods: {
    ...mapMutations({
      updateSegmentFilter: UPDATE_SEGMENT_FILTER,
    }),
    updateData(value) {
      this.updateSegmentFilter(Object.assign({}, this.filters, value));
    },
  },
});
</script>
