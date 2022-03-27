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
  <v-dialog scrollable persistent v-model="show" max-width="600">
    <v-card max-width="100%" style="overflow-x: hidden">
      <v-system-bar color="error" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title class="blue-grey--text text--darken-4 font-weight-bold">
          選択項目を削除
        </v-toolbar-title>
      </v-toolbar>
      <template>
        <v-row class="mx-2">
          <v-col class="text-break" cols="auto">
            <MultiLine>
              {{ tableSelected.map((item) => `"${item.nameLBD || 'メッセージ名未設定'}"`).join(" と ") }} を削除します。
              削除したら元に戻すことはできません。
            </MultiLine>
          </v-col>
        </v-row>
        <v-card-actions class="pa-4 d-flex justify-end">
          <v-btn class="blue-grey--text" outlined @click="show = false">
            キャンセル
          </v-btn>
          <v-btn
              color="error"
              elevation="4"
              class="ml-2"
              @click="$emit('onDeleteItem')"
          >
            削除
          </v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import MultiLine from "../../components/common/MultiLine.vue";

export default Vue.extend({
  components: {MultiLine},
  props: {
    visible: Boolean,
    tableSelected: Array,
  },
  watch: {
  },
  data() {
    return {
    };
  },
  computed: {
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
        }
      },
    },
  },
  methods: {
  },
});
</script>
