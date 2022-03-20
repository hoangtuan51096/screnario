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
  <v-row no-gutters class="mb-4">
    <v-col class="py-2" cols="2">
      <label>帳票</label>
    </v-col>
    <v-col cols="10">
      <v-autocomplete 
        dense
        hide-details
        outlined
        v-model="selectedSurveyId"
        :disabled="isFetchingSurveyConfigsProp"
        :items="surveyTitles"
        :loading="isFetchingSurveyConfigsProp"
        >
      </v-autocomplete>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    isFetchingSurveyConfigsProp: {
      type: Boolean,
      required: true,
    },
    selectedSurveyIdProp: {
      required: true
    },
    surveyConfigsProp: {
      type: Array,
      required: true,
    },
  },
  computed: {
    selectedSurveyId: {
      get(): any {
        return this.selectedSurveyIdProp;
      },
      set(surveyId: string | null): void {
        this.$emit('selectSurvey', surveyId);
      },
    },
    surveyTitles() {
      const options = [
        {
          value: null,
          text: 'ーー',
        },
      ];
      options.push(
        ...this.surveyConfigsProp.map((config) => {
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
    async getSurveyConfigs(): Promise<void> {
      this.$emit('getSurveyConfigs');
    },
  },
});
</script>
