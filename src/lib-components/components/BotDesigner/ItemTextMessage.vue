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
    <label>テキスト</label>
    <v-textarea
      auto-grow
      outlined
      single-line
      hide-details="auto"
      rows="5"
      :value="params.text"
      :rules="[rules.validTextLength, rules.validTextChar]"
      @input="onChangeText"
      ref="textarea"
      id="action.0"
    ></v-textarea>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

interface LocalState {
  rules: any;
}

export default {
  name: "ItemTextMessage",
  props: {
    params: {
      type: Object,
      required: true,
    },
    branchIndex: Number,
  },
  watch: {
    branchIndex(val) {
      this.branchIndex = val;
      this.scrollToAction(val);
    },
  },
  data(): LocalState {
    return {
      rules: {
        validTextLength: (value) => {
          if (value.length <= 0) {
            return "必須";
          }

          if (value.length > 5000) {
            return "テキストの最大長は5000文字です";
          }

          return true;
        },
        validTextChar: (value) => {
          for (var ch of value) {
            if (ch !== "\n" && ch !== " " && ch !== "　") {
              return true;
            }
          }
          return "空白または改行のみは保存出来ません";
        },
      },
    };
  },
  mounted() {
    const { branchIndex } = this;
    if (!Number.isInteger(branchIndex)) {
      return;
    }
    this.scrollToAction(branchIndex);
    this.validateText(this.params.text);
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemTextMessage`, value: true });
  },
  methods: {
    scrollToAction(branchIndex: any): void {
      if (!Number.isInteger(branchIndex)) {
        return;
      }

      const targetRef = this.$refs[`action.${branchIndex}`];
      if (targetRef && targetRef.length > 0) {
        this.$nextTick(() =>
          targetRef[0].$el.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          })
        );
      }
    },
    onChangeText(value: any): void {
      this.validateText(value);
      this.$emit("updateParams", { key: "text", value: value });
    },
    validateText(value: any): void {
      if (value.length > 0 && value.length <= 5000) {
        for (var ch of value) {
          if (ch !== "\n" && ch !== " " && ch !== "　") {
            this.$emit("updateSaveStatus", { key: `ItemTextMessage`, value: true });
            return;
          }
        }
      }
      this.$emit("updateSaveStatus", { key: `ItemTextMessage`, value: false });
    },
  },
};
</script>
