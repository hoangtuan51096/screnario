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
    <v-col class="py-2" cols="2">
      <label>質問項目</label>
    </v-col>
    <v-col cols="10">
      <v-autocomplete
        dense
        hide-details
        outlined
        v-model="selectedItemKey"
        :disabled="!selectedSurveyIdProp"
        :items="itemTitles"
        >
      </v-autocomplete>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    selectedItemKeyProp: {
      required: true
    },
    selectedSurveyIdProp: {
      required: true
    },
    surveySchemaProp: {
      type: Array,
      required: true,
    },
  },
  computed: {
    selectedItemKey: {
      get() {
        return this.selectedItemKeyProp;
      },
      set(itemKey) {
        this.$emit('selectItem', itemKey);
      },
    },
    itemTitles() {
      const options = [
        {
          value: null,
          text: 'ーー',
        },
      ];
      options.push(
        ...this.surveySchemaProp.map((item) => {
          const { itemKey, title } = item;
          return {
            value: itemKey,
            text: title,
          }
        })
      );
      return options;
    },
  },
});
</script>
