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
  <div class="py-4">
    <v-row>
      <v-col>
        <label>パッケージID</label>
        <v-text-field type="number" outlined single-line v-model="params.sticker.packageId" dense hide-details />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <label>スタンプID</label>
        <v-text-field type="number" outlined single-line v-model="params.sticker.stickerId" dense hide-details />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ItemSticker",
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  watch: {
    "params.sticker.packageId"(val) {
      this.reportValidation(val, undefined);
    },
    "params.sticker.stickerId"(val) {
      this.reportValidation(undefined, val);
    },
  },
  methods: {
    reportValidation(packageId: any, stickerId: any): void {
      if ((packageId || this.params.sticker.packageId) && (stickerId || this.params.sticker.stickerId)) {
        this.$emit("updateSaveStatus", { key: `ItemSticker`, value: true });
      } else {
        this.$emit("updateSaveStatus", { key: `ItemSticker`, value: false });
      }
    },
  },
  mounted() {
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemSticker`, value: true });
  },
});
</script>