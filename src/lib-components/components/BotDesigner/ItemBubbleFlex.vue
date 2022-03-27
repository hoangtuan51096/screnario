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
  src: url("../../assets/fonts/LUCON.TTF");
}
.json-edit-area {
  white-space: nowrap;
  font-family: lucidaConsole, monospace;
}
</style>

<template>
  <div>
    <label>JSONを貼り付ける</label>
    <h4 v-show="errorText">
      <span class="red--text"><v-icon>mdi-alert</v-icon>JSONに誤字があるため保存できません!</span>
    </h4>
    <v-textarea
      outlined
      class="json-edit-area"
      background-color="white lighten-2"
      rows="15"
      :value="localParam"
      @input="onChangeText($event)"
    ></v-textarea>
    <span><a href="https://developers.line.biz/flex-simulator/" target="_blank">Flex Message Simulator</a>を使用して、テンプレートのJSONを作成することができます。</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { render } from "@/services/flexRender.ts";

export default Vue.extend({
  name: "ItemBubbleFlex",
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      text: "",
      errorText: false,
      localParam: JSON.stringify({"type": "bubble"}, undefined, 4),
    };
  },
  watch: {
    params: {
      deep: true,
      handler: function (val) {
        if (val) {
          this.errorText = false;
          this.localParam = JSON.stringify(val, undefined, 4);
        }
      }
    }
  },
  mounted() {
    this.errorText = false;
    this.localParam = JSON.stringify(this.params, undefined, 4)
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemBubbleFlex`, value: true });
  },
  methods: {
    onChangeText(value) {
      let validateResult = this.validateJSON(value);
      this.reportValidation(validateResult);
      if (validateResult) {
        this.$emit("updateModelParams", JSON.parse(value));
      }
    },
    reportValidation(result) {
      this.$emit("updateSaveStatus", { key: `ItemBubbleFlex`, value: result });
    },
    validateJSON(value) {
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
});
</script>
