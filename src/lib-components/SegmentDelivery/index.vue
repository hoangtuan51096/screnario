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
    <SubAppBar>
      <template>
        <div style="display: flex; justify-content: space-between">
          <div>
            <v-btn-toggle v-model="tab" dense mandatory color="primary">
              <v-btn value="distribution-list">
                配信一覧
              </v-btn>
              <v-btn value="outer-distribution-settings">
                外部配信設定
              </v-btn>
              <v-btn value="remind-delivery">
                リマインド配信
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </template>
    </SubAppBar>


    <v-card outlined class="my-4">
      <v-tabs-items v-model="tab">
        <v-tab-item value="distribution-list">
          <v-container fluid>
            <DistributionListFragment />
          </v-container>
        </v-tab-item>
        <v-tab-item value="outer-distribution-settings">
          <v-container fluid>
            <SearchFragment class="ma-2" :surveyConfigs="surveyConfigs" :searchStyle="outerDistTab"/>
            <v-divider></v-divider>
            <OuterDistributionSettingsFragment @outerSegmentTabChange="setOuterDistTab"/>
          </v-container>
        </v-tab-item>
        <v-tab-item value="remind-delivery">
          <v-container fluid>
            <RemindDeliveryFragment />
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { FETCH_SURVEY_CONFIGS, FETCH_ALL_SEGMENT_DELIVERIES } from "@/store/action-types";
import { mapState, mapActions, mapGetters } from "vuex";
import SearchFragment from "./fragments/SearchFragment.vue";
import DistributionListFragment from "./fragments/DistributionListFragment.vue";
import OuterDistributionSettingsFragment from "./fragments/OuterDistributionSettingsFragment.vue";
import SubAppBar from '@/components/common/SubAppBar.vue';
import RemindDeliveryFragment from "./fragments/RemindDeliveryFragment.vue";

interface LocalState {
  tab: string;
  outerDistTab: string;
}

export default {
  data(): LocalState {
    return {
      tab: "status",
      outerDistTab: "mail-delivery-list",
    };
  },
  components: {
    SearchFragment,
    DistributionListFragment,
    OuterDistributionSettingsFragment,
    SubAppBar,
    RemindDeliveryFragment,
  },
  computed: {
    ...mapState({
      fetchSurveyConfigsListTypeError: (state: any) => state.forms.fetchSurveyConfigsListTypeError,
      isSegmentFetching: (state: any) => state.segments.isFetchingSegments,
      fetchSegmentsError: (state: any) => state.segments.fetchSegmentssError,
    }),
    ...mapGetters({
      surveyConfigs: "surveyConfigsWithoutAppendType",
    }),
  },
  methods: {
    ...mapActions({
      fetchSurveyConfigs: FETCH_SURVEY_CONFIGS,
      fetchSegmentDeliveries: FETCH_ALL_SEGMENT_DELIVERIES,
    }),
    setOuterDistTab(value: any): void {
      this.outerDistTab = value;
    }
  },
  created() {
    if (!this.surveyConfigs || this.surveyConfigs.length === 0) {
      this.fetchSurveyConfigs("list");
    }
    if (this.$route.params.tab) {
      this.tab = this.$route.params.tab;
    }
  },
};
</script>
