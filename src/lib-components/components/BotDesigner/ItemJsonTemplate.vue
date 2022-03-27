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
</style>

<template>
  <div class="py-4">
    <label>JSONデータ</label>
    <h4 v-show="errorText">
      <span class="red--text"><v-icon>mdi-alert</v-icon>JSONに誤字があるため保存できません!</span>
    </h4>
    <v-textarea
      outlined
      background-color="grey lighten-2"
      rows="15"
      :value="JSON.stringify(params, undefined, 4)"
      ref="textarea"
      @input="onChangeText"
    ></v-textarea>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ItemJsonTemplate",
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      errorText: false,
    };
  },
  methods: {
    onChangeText(value) {
      if (this.validateJSON(value)) {
        this.$emit("updateModelParams", JSON.parse(value));
      }
      this.reportValidation(value);
    },
    reportValidation(value) {
      let target = value;
      if (target === "") {
        target = this.$refs.textarea.$el.value();
      }
      this.$emit("updateSaveStatus", { key: `ItemJsonTemplate`, value: this.validateJSON(target) });
    },
    validateJSON(value) {
      try {
        if (value) {
          JSON.parse(value);
        }
        this.errorText = false;
        return true;
      } catch (error) {
        this.errorText = true;
      }
    },
  },
  mounted() {
    this.$refs.textarea.$refs.input.style.cssText = "white-space:nowrap;font-family:lucidaConsole, monospace;";
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemJsonTemplate`, value: true });
  },
});
</script>
