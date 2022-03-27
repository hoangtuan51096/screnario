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
    <InputTextArea
        label="テキスト"
        rows="5"
        :value="params.text"
        maxlength="2000"
        :rules="[rules.validTextLength, rules.validTextChar]"
        @input="onChangeText"
        :required="true"
        @change="(value) => { this.params.text = value }"
        ref="textarea">
    </InputTextArea>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import InputTextArea from "./InputTextArea.vue";

export default {
  name: "ItemTextMessage",
  components: {InputTextArea},
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
  data() {
    return {
      rules: {
        validTextLength: (value) => {
          if (!value) {
            return "テキストは空白のみは使用できません。";
          }
          if (value.length > 2000) {
            return "テキストは2000文字以内にしてください。";
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
    scrollToAction(branchIndex) {
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
    onChangeText(value) {
      this.validateText(value);
      this.$emit("updateParams", { key: "text", value: value });
    },
    validateText(value) {
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
