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
    <label>{{ title }}</label>
    <v-row no-gutters v-if="value.type" class="mb-3">
      <v-col cols="3" class="text-right pr-4">
        <label class="grey--text pt-2">タイプ</label>
      </v-col>
      <v-col cols="9">
        <v-select v-model="value.type" :items="fileTypesOptions" single-line outlined dense hide-details></v-select>
      </v-col>
    </v-row>
    <v-row no-gutters v-if="value.type === 'url'">
      <v-col cols="3" class="text-right pr-4">
        <label class="grey--text pt-2">URL</label>
      </v-col>
      <v-col cols="9">
        <v-text-field outlined single-line v-model="value.url" dense hide-details />
      </v-col>
    </v-row>
    <v-row no-gutters v-if="value.type === 'file'">
      <v-col cols="3" class="text-right pr-4">
        <label class="grey--text pt-2">ファイル</label>
      </v-col>
      <v-col cols="9">
        <v-file-input
          outlined
          dense
          single-line
          append-icon="mdi-folder"
          prepend-icon=""
          :label="value.file"
          counter
          counter-string="ファイルを選択してください"
        ></v-file-input>
      </v-col>
    </v-row>
    <v-row no-gutters v-if="!value.type" class="mb-3">
      <v-col cols="3" class="text-right pr-4">
        <label class="grey--text pt-2">S3のURL</label>
      </v-col>
      <v-col cols="9">
        <v-text-field outlined single-line v-model="value" :readonly="true" dense hide-details />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    title: String,
    value: Object,
  },
  data() {
    return {
      fileTypesOptions: [
        { value: "url", text: "URL" },
        { value: "file", text: "ローカルファイル" },
      ],
    };
  },
});
</script>
