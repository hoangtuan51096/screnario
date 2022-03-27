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
      <v-col v-if="!isPremadeMessage">
        <p class="font-weight-bold text-center">
          カルセルフレックスメッセージ編集するメッセージを10っこまで選択します。選択数：{{ checkedMessages.length }}
        </p>
      </v-col>
      <v-col v-if="isPremadeMessage">
        <p class="font-weight-bold text-center">カルセルフレックスメッセージ内容</p>
      </v-col>
    </v-row>
    <v-row v-if="!isPremadeMessage">
      <v-data-table
        v-model="checkedMessages"
        :headers="headers"
        :items="filteredMessages"
        :items-per-page="5"
        show-select
        fixed-header
        :height="400"
        item-key="dataId"
      >
        <template v-slot:header.data-table-select="{ props, on }">
          <v-simple-checkbox
            :value="props.value"
            @input="on.input($event), reportValidation($event)"
          ></v-simple-checkbox>
        </template>
        <template v-slot:item.data-table-select="{ isSelected, select }">
          <v-simple-checkbox :value="isSelected" @input="reportValidation($event), select($event)"></v-simple-checkbox>
        </template>
        <template v-slot:item.dataType="{ item }">
          <div>{{ typeTitle(item.dataType) }}</div>
        </template>
      </v-data-table>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { BOT_ITEM_TYPES } from "@/store/modules/scenarios/scenarios.constants";
import { mapState, mapActions, mapMutations } from "vuex";
export default Vue.extend({
  name: "ItemCarouselFlex",
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  watch: {
    checkedMessages() {
      var listOfMessagePostbackIds = [];
      this.checkedMessages.forEach((message) => {
        listOfMessagePostbackIds.push(message.dataId);
      });
      this.$emit("updateModelBubbles", listOfMessagePostbackIds);
    },
    params() {
      this.checkedMessages = this.alreadySelectedMessages;
      this.isPremadeMessage = this.isSpecialPremadeTalk();
    },
  },
  data() {
    return {
      checkedMessages: (this).alreadySelectedMessages,
      isPremadeMessage: (this).isSpecialPremadeTalk(),
      headers: [
        {
          text: "メッセージID",
          sortable: false,
          value: "dataId",
          width: "30%",
        },
        {
          text: "名前",
          sortable: true,
          value: "nameLBD",
          width: "30%",
        },
        {
          text: "種別",
          sortable: true,
          value: "dataType",
          width: "30%",
        },
      ],
    };
  },
  components: {},
  computed: {
    ...mapState({
      scenarioMessages: (state) => (state).scenarios.scenarioMessages,
    }),
    alreadySelectedMessages() {
      var result = [];
      if (this.params) {
        this.params.bubbleParam.forEach((messageId) => {
          var msg = !this.isSpecialPremadeTalk()
            ? this.filteredMessages.find((message) => {
                return message.dataId === messageId;
              })
            : this.scenarioMessages.find((message) => {
                return message.dataId === messageId;
              });
          if (msg) result.push(msg);
        });
      }
      return result;
    },
    filteredMessages() {
      if (this.scenarioMessages) {
        return this.scenarioMessages.filter((message) => {
          return message.dataType == "bubbleFlex" && !("specialScenarioTalk" in message.params);
        });
      } else return [];
    },
  },
  methods: {
    isSpecialPremadeTalk() {
      return "params" in this.params && "specialScenarioTalk" in this.params.params;
    },
    typeTitle(value) {
      return BOT_ITEM_TYPES[value] ? BOT_ITEM_TYPES[value].text : "";
    },
    runValidation() {
      setTimeout(() => this.reportValidation(), 100);
    },
    reportValidation() {
      this.$emit("updateSaveStatus", {
        key: `ItemCarouselFlex`,
        value: this.checkedMessages.length > 0 && this.checkedMessages.length < 11,
      });
    },
  },
  created() {
    this.checkedMessages = this.alreadySelectedMessages;
  },
  mounted() {
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemCarouselFlex`, value: true });
  },
});
</script>

<style scoped>
.v-data-footer {
  padding: inherit !important;
  padding-right: 1.5em !important;
  margin-right: 0px !important;
}
th:first-child {
  z-index: 100000001 !important;
}
th > tr {
  z-index: 100000000 !important;
}
.composite-message-edit-display {
  display: contents !important;
}
</style>
