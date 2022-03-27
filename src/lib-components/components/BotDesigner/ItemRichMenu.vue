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
        <label>ベース幅</label>
        <v-select
          v-model="params.width"
          :items="baseWidthOptions"
          single-line
          outlined
          disabled
          dense
          hide-details
        ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <label>ベース高さ</label>
        <v-select
          v-model="params.height"
          :items="baseHeightOptions"
          single-line
          outlined
          disabled
          dense
          hide-details
        ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <label>デフォルトでメニューを表示</label>
        <v-select
          v-model="params.selected"
          :items="yesNoOptions"
          single-line
          outlined
          dense
          disabled
          hide-details
        ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <label>チャットバーのタイトル</label>
        <v-text-field outlined single-line :value="params.chatBarText" disabled dense hide-details />
      </v-col>
    </v-row>
    <template v-for="(area, index) in params.actionCount">
      <v-divider :key="`divide_${area + params._name}`" class="mt-4"></v-divider>
      <ActionProperty
        of="richmenu"
        :key="area"
        :number="area"
        :action="getActionByNumber(index)"
        hasArea
        v-bind:ref="'action.' + index"
        :specialTalk="specialTalk"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ActionProperty from "./CommonProperties/ActionProperty.vue";

export default Vue.extend({
  name: "ItemRichMenu",
  props: {
    params: {
      type: Object,
      required: true,
    },
    branchIndex: Number,
    specialTalk: Boolean,
  },
  watch: {
    branchIndex(val) {
      this.branchIndex = val;
      this.scrollToAction(val);
    },
  },
  components: { ActionProperty },
  data() {
    return {
      baseWidthOptions: [2500],
      baseHeightOptions: [1686, 843],
      yesNoOptions: [
        { text: "はい", value: true },
        { text: "いいえ", value: false },
      ],
    };
  },
  mounted() {
    const { branchIndex } = this;
    if (!Number.isInteger(branchIndex)) {
      return;
    }
    this.scrollToAction(branchIndex);
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
    getActionByNumber(number) {
      let actionObj = this.params[`area.${number}`];
      return actionObj;
    },
  },
});
</script>
