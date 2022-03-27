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
    <v-row>
      <v-col>
        <label>テキスト</label>
        <v-textarea
          auto-grow
          outlined
          single-line
          dense
          rows="5"
          counter
          :counter-value="(value) => `文字数：${value.length} / 240`"
          :value="params.text"
          :rules="[rules.validTextLength, rules.validTextChar]"
          hide-details="auto"
          @input="onChangeValue($event, 'text')"
        >
        </v-textarea>
        <span style="font-size: 12px; color: #646464"
          >確認型テンプレートメッセージには高さに制限があり、240文字以内であっても完全に表示されない可能性があります。実環境で表示を確認してください。</span
        >
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <template v-for="(action, index) in 2">
          <ActionProperty
            of="template"
            :key="action"
            :number="action"
            :firstAction="action == 1"
            :lastAction="action == 2"
            :premadeMessage="isSpecialPremadeTalk"
            :action="getActionByNumber(index)"
            :isValidAction="isValidActionList[index]"
            @validateAction="validateAction($event, index)"
            @resetAction="resetAction($event, index)"
            @moveAction="moveAction($event, index)"
            v-bind:ref="'action.' + index"
            :botMessages="botMessages"
            :specialTalk="specialTalk"
          />
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { cloneDeep } from "lodash";
import ActionProperty from "./CommonProperties/ActionProperty.vue";

export default Vue.extend({
  name: "ItemConfirmTemplate",
  props: {
    params: {
      type: Object,
      required: true,
    },
    canSave: Boolean,
    branchIndex: Number,
    botMessages: Array,
    specialTalk: Boolean,
  },
  components: {
    ActionProperty,
  },
  watch: {
    canSave(val) {
      if (val) {
        for (const section of this.textSections) {
          this.isValidText[section] = true;
        }
        for (const actionIndex in 2) {
          this.isValidActionList[actionIndex] = true;
        }
      }
    },
    branchIndex(val) {
      this.branchIndex = val;
      this.scrollToAction(val);
    },
  },
  data() {
    return {
      rules: {
        validTextLength: (value) => {
          if (value.length <= 0) {
            return "必須";
          }

          if (value.length > 240) {
            return "テキストの最大長は240文字です";
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
      textSections: ["text"],
      isValidText: {
        text: true,
      },
      isValidActionList: [true, true],
    };
  },
  mounted() {
    const { branchIndex } = this;
    if (!Number.isInteger(branchIndex)) {
      return;
    }
    this.scrollToAction(branchIndex);
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemConfirmTemplate`, value: true });
  },
  computed: {
    isSpecialPremadeTalk() {
      return "specialScenarioTalk" in this.params ? this.params["specialScenarioTalk"] : null;
    },
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
    onChangeValue(event, keyValue) {
      if (this.textSections.includes(keyValue)) {
        this.validateText(event, keyValue);
        this.reportValidation();
      }
      this.$emit("updateParams", { key: keyValue, value: event });
    },
    getActionByNumber(number) {
      let situation = "Right";
      if (number == 0) {
        situation = "Left";
      }
      let actionObj = this.params[`action${situation}`];
      return actionObj;
    },
    validateText(event, keyValue) {
      if (typeof event !== "undefined" && event.length > 0 && event.length <= 240) {
        for (var ch of event) {
          if (ch !== "\n" && ch !== " " && ch !== "　") {
            this.isValidText[keyValue] = true;
            return;
          }
        }
      }
      this.isValidText[keyValue] = false;
    },
    validateAction(value, index) {
      this.isValidActionList[index] = value;
      this.reportValidation();
    },
    reportValidation() {
      for (const section of this.textSections) {
        if (!this.isValidText[section]) {
          this.$emit("updateSaveStatus", { key: `ItemConfirmTemplate`, value: false });
          return;
        }
      }
      for (var i = 0; i < 2; i++) {
        if (!this.isValidActionList[i]) {
          this.$emit("updateSaveStatus", { key: `ItemConfirmTemplate`, value: false });
          return;
        }
      }
      this.$emit("updateSaveStatus", { key: `ItemConfirmTemplate`, value: true });
    },
    resetAction(oldAction, actionToResetIndex) {
      if (actionToResetIndex === 0) {
        this.params.actionLeft = cloneDeep(oldAction);
      } else {
        this.params.actionRight = cloneDeep(oldAction);
      }
    },
    moveAction(movePositionUp, indexToMove) {
      //In the case of confirm, there are only two actions.
      //Literally just need to switch them
      const tempPosition = cloneDeep(this.params.actionRight);
      this.params.actionRight = cloneDeep(this.params.actionLeft);
      this.params.actionLeft = cloneDeep(tempPosition);
    }
  },
});
</script>
