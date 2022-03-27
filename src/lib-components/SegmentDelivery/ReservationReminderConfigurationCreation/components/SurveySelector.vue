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
    <v-col class="py-2 px-4" cols="auto">
      <label>帳票</label>
    </v-col>
    <v-col cols="10">
      <v-autocomplete
        v-model="selected"
        :items="surveyTitles"
        :disabled="isLoadingSurveyConfigs"
        outlined
        dense
        hide-details>
      </v-autocomplete>
    </v-col>
    <v-col class="mx-2" cols="auto">
      <v-btn text fab small :ripple="false" :disabled="isLoadingSurveyConfigs" @click="fetchAllSurveyConfigs()">
        <v-icon color="primary"> {{ isLoadingSurveyConfigs ? "mdi-cached mdi-spin" : "mdi-cached" }}</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapMutations, } from 'vuex';

import { FETCH_ALL_SURVEY_CONFIGS, FETCH_REMINDER_CONFIGURATION } from '@/store/action-types';
import { SET_SELECTED_SURVEY_ID, SET_SELECTED_CATEGORY } from '@/store/mutation-types';

export default Vue.extend({
  computed: {
    ...mapState({
      allSurveyConfigs: (state)  => state.segments.allSurveyConfigs,
      isFetchingAllSurveyConfigs: (state)  => state.segments.isFetchingAllSurveyConfigs,
      selectedSurveyId: (state)  => state.segments.selectedSurveyId,
      selectedCategoryId: (state) => state.segments.selectedCategoryId,
    }),
    isLoadingSurveyConfigs() {
      return this.isFetchingAllSurveyConfigs;
    },
    selected: {
      get() {
        return this.selectedSurveyId || null;
      },
      async set(value) {
        this.setSelectedSurveyId(value);
        this.setSelectedCategoryId(null);
        if (value) {
          await this.fetchRemindConfig({
            surveyId: this.selectedSurveyId,
            categoryId: this.selectedCategoryId
          });
        }
      },
    },
    surveyTitles() {
      // 「予約型帳票」のみにフィルタリング
      const filterdConfigs = this.allSurveyConfigs.filter(config => {
        const reservationItem = config.surveySchema.find(item => item.type === 'reservation');
        return reservationItem;
      });
      const options = [
        {
          value: null,
          text: 'ーー',
        },
      ];
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
  methods: {
    ...mapActions({
      fetchAllSurveyConfigs: FETCH_ALL_SURVEY_CONFIGS,
      fetchRemindConfig: FETCH_REMINDER_CONFIGURATION,
    }),
    ...mapMutations({
      setSelectedSurveyId: SET_SELECTED_SURVEY_ID,
      setSelectedCategoryId: SET_SELECTED_CATEGORY,
    }),
  },
});
</script>
