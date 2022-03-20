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
      <label>分類</label>
    </v-col>
    <v-col cols="10">
      <v-autocomplete 
        v-model="selected" 
        :items="categoryNames"
        :disabled="isLoadingCategories || !isSelectedSurveyId"
        outlined 
        dense 
        hide-details>
      </v-autocomplete>
    </v-col>
    <v-col class="mx-2" cols="auto">
      <v-btn text fab small :ripple="false" :disabled="isLoadingCategories" @click="fetchAllReminderCategories()">
        <v-icon color="primary"> {{ isLoadingCategories ? "mdi-cached mdi-spin" : "mdi-cached" }}</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapMutations, } from 'vuex';

import { FETCH_ALL_REMIND_CATEGORIES, FETCH_REMINDER_CONFIGURATION } from '@/store/action-types';
import { SET_SELECTED_CATEGORY } from '@/store/mutation-types';

export default Vue.extend({
  computed: {
    ...mapState({
      allReminderCategories: (state: any) => state.segments.allReminderCategories,
      isFetchingAllRemindCategories: (state: any) => state.segments.isFetchingAllRemindCategories,
      selectedSurveyId: (state: any)  => state.segments.selectedSurveyId,
      selectedCategoryId: (state: any) => state.segments.selectedCategoryId,
      surveyConfigs: (state: any)  => state.segments.allSurveyConfigs,
    }),
    isLoadingCategories(): boolean {
      return this.isFetchingAllRemindCategories;
    },
    isSelectedSurveyId(): boolean {
      return this.selectedSurveyId !== null;
    },
    selected: {
      get(): any {
        return this.selectedCategoryId || null;
      },
      async set(value: any): Promise<void> {
        this.setSelectedCategory(value);
        await this.fetchReminderConfig({
          surveyId: this.selectedSurveyId,
          categoryId: this.selectedCategoryId
        });
      },
    },
    categoryNames(): any {
      const options = [
        {
          value: null,
          text: 'ーー',
        },
      ];
      const selectedSurveyConfig = this.surveyConfigs.find(config => config.surveyId === this.selectedSurveyId);
      if (!selectedSurveyConfig) {
        return options;
      }

      const reservationItem = selectedSurveyConfig.surveySchema.find(item => item.type === 'reservation');
      if (!reservationItem) {
        return options;
      }

      const { selectedLargeCategory, selectedMediumCategory } = reservationItem;
      const categoriesBySelected = this.allReminderCategories.filter(category => {
        if (!selectedLargeCategory) {
          return true;
        }
        if (!selectedMediumCategory) {
          return category.tag1 === selectedLargeCategory.name;
        }
        return category.tag1 === selectedLargeCategory.name && category.tag2 === selectedMediumCategory.name;
      });

      options.push(
        ...categoriesBySelected.map((category) => {
          const { id, tag1, tag2, tag3 } = category;
          let displayCategoryName = `${tag1} > ${tag2}`;
          if (tag3) {
            displayCategoryName += ` > ${tag3}`;
          }
          return {
            value: id,
            text: displayCategoryName.length <= 50
              ? displayCategoryName
              : displayCategoryName.substring(0, 50).concat('...'),
          }
        })
      );

      return options;
    },
  },
  methods: {
    ...mapActions({
      fetchAllReminderCategories: FETCH_ALL_REMIND_CATEGORIES,
      fetchReminderConfig: FETCH_REMINDER_CONFIGURATION,
    }),
    ...mapMutations({
      setSelectedCategory: SET_SELECTED_CATEGORY,
    }),
  },
});
</script>
