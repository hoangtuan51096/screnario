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
<style scoped>
@font-face {
  font-family: lucidaConsole;
  src: url("../../../../../assets/fonts/LUCON.TTF");
}
.json-edit-area {
  white-space: nowrap;
  font-family: lucidaConsole, monospace;
}
</style>

<template>
  <div>
    <h4 v-show="errorText">
      <span class="red--text"><v-icon>mdi-alert</v-icon>データ形式が不正なため保存できません</span>
    </h4>
    <v-textarea
      outlined
      class="json-edit-area"
      background-color="white lighten-2"
      rows="15"
      :value="JSON.stringify(params, undefined, 2)"
      @input="onChangeText($event)"
    ></v-textarea>
    <v-row :elevation="0">
      <v-col sm="8">
        <v-autocomplete
          v-model="selectedTemplate"
          :items="teamSearchCriteriaOptions"
          flat
          outlined
          dense
          background-color="white"
          hide-details="auto"
          :placeholder="'テンプレート'"
        ></v-autocomplete>
      </v-col>
      <v-col sm="4">
        <v-btn class ="white--text" color="primary" elevation="0" @click="setTemplate">
          反映
        </v-btn>
      </v-col>
    </v-row>
    <span><a href="https://developers.line.biz/flex-simulator/" target="_blank">Flex Message Simulator</a>を使用して、テンプレートのJSONを作成することができます。</span><br>
    <span>フレックスメッセージのサンプルは<a href="https://docs.line-smartcity.org/flex-sample" target="_blank">こちら</a>を参照してください。</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { render } from "@/services/flexRender.ts";
import { FLEXMESSAGE_TEMPLATE_ITEMS } from "@/store/modules/segments/segments.constants";

interface LocalState {
  text: string;
  errorText: boolean;
  selectedTemplate: any;
}

export default Vue.extend({
  name: "ItemBubbleFlex",
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  data(): LocalState {
    return {
      text: "",
      errorText: false,
      selectedTemplate: {}
    };
  },
  mounted() {
    let validateResult = this.validateJSON((JSON.stringify(this.params)));
    this.reportValidation(validateResult);
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemBubbleFlex`, value: true });
  },
  methods: {
    onChangeText(value: string): void {
      let validateResult = this.validateJSON(value);
      this.reportValidation(validateResult);
      if (validateResult) {
        this.$emit("updateModelParams", {
          payload: JSON.parse(value)
        });
      }
    },
    setTemplate(): void {
      if (this.selectedTemplate) {
        this.onChangeText(JSON.stringify(this.selectedTemplate));
      }
    },
    reportValidation(result: any): void {
      this.$emit("updateSaveStatus", { validateResult: result });
    },
    validateJSON(value: string): boolean {
      try {
        let parsedInput = JSON.parse(value);
        render(parsedInput)
        this.errorText = false;
        return true;
      } catch (error) {
        this.errorText = true;
        return false;
      }
    },
  },
  computed: {
    teamSearchCriteriaOptions() {
      return FLEXMESSAGE_TEMPLATE_ITEMS;
    },
  },
});
</script>
