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
.composite-message-padding table .text-start {
  padding: 0 6px !important;
}

.v-data-footer {
  border-top: 0px !important;
  justify-content: flex-end !important;
}

.v-data-table:last-child {
  border: 1px lightgray solid !important;
  border-radius: 5px !important;
}

</style>
<template>
  <div>
      <v-row>
        <v-col class="composite-message-padding">
          <span>編集するメッセージを5つまで選択します。</span>
          <v-data-table
            v-model="selectedMessages"
            :headers="headers"
            :items="filteredMessages"
            :items-per-page="20"
            show-select
            :height="300"
            hide-default-header
            hide-default-footer
            item-key="dataId"
          >
            <template v-slot:top="{ pagination, options, updateOptions}">
              <v-data-footer
              :pagination="pagination"
              :options="options"
              @update:options="updateOptions"
              :disable-items-per-page="true"
              :items-per-page-text="''"
              :items-per-page-options="[-1]"
              :page-text="'選択数：' + selectedMessages.length + '/5'"/>
            </template>
            <template v-slot:header.data-table-select="{ props, on }">
              <v-simple-checkbox
                :value="props.value"
                @input="on.input($event), runValidation($event)"
              ></v-simple-checkbox>
            </template>
            <template v-slot:item.data-table-select="{ isSelected, select }">
              <v-simple-checkbox :value="isSelected" @input="runValidation($event), select($event)"></v-simple-checkbox>
            </template>
            <template v-slot:item.nameLBD="{ item }">
              <div style="display: inline-flex">
                <v-icon>{{ getIconFromItemType(item.dataType) }}</v-icon>
                <span>{{ !_isNullOrEmpty(item.nameLBD) ? item.nameLBD : item.dataId }}</span>
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <MessagePreview :messages="this.selectedMessages" />
        </v-col>
      </v-row>
      </div>
</template>

<script lang="ts">
import Vue from "vue";
import { BOT_ITEM_TYPES } from "@/store/modules/scenarios/scenarios.constants";
import MessagePreview from "../../ScenarioSettingsDetail/components/MessagePreview.vue";
import { mapState, mapActions, mapMutations } from "vuex";
import { isNullOrEmpty } from "@/utils/stringUtils";

export default Vue.extend({
  name: "ItemCompositeMessage",
  props: {
    params: {
      type: Object,
      required: true,
    },
    messagesToDisplay: {
      type: Array,
      required: false,
    }
  },
  watch: {
    selectedMessages() {
      var listOfMessagePostbackIds = [];
      this.selectedMessages.forEach((message) => {
        listOfMessagePostbackIds.push(message.dataId);
      });
      this.$emit("updateMessages", listOfMessagePostbackIds);
    },
    params() {
      this.selectedMessages = this.alreadySelectedMessages;
    },
  },
  data() {
    return {
      selectedIndex: 0,
      selectedMessages: [],
      supportedMessages: [
        "text",
        "sticker",
        "buttons",
        "imagemap",
        "carousel",
        "bubbleFlex",
        "carouselFlex",
        "image",
        "audio",
        "video",
        "confirm",
        "location",
      ],
      headers: [
        {
          text: "名前",
          sortable: true,
          value: "nameLBD",
          width: "30%",
        },
      ],
      rules: {
        validTextLength: (value) => value.length > 0 || "必須",
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
  components: {
    MessagePreview,
  },
  computed: {
    ...mapState({
      scenarioMessages: (state) => (state).scenarios.scenarioMessages,
    }),
    alreadySelectedMessages() {
      var result = [];
      if (this.params && this.params.messages) {
        this.params.messages.forEach((messageId) => {
          var msg = !this.isSpecialPremadeTalk()
            ? this.filteredMessages.find((message) => {
                return message.dataId === messageId;
              })
            : this.scenarioMessages.find((message) => {
                return message.dataId === messageId;
              });
          if (msg) {
            result.push(msg);
          }
        });
      }
      return result;
    },
    filteredMessages() {
      if (this.messagesToDisplay) {
        return this.messagesToDisplay.filter((message) => {
          return this.supportedMessages.includes(message.dataType);
        });
      }
      if (this.scenarioMessages) {
        return this.scenarioMessages.filter((message) => {
          return this.supportedMessages.includes(message.dataType) && !("specialScenarioTalk" in message.params) && (message.dataId !== this.params.dataId);
        });
      } else {
        return [];
      }
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
        key: `ItemCompositeMessage`,
        value: this.selectedMessages.length > 0 && this.selectedMessages.length < 6,
      });
    },
    getIconFromItemType(dataType) {
      return dataType in BOT_ITEM_TYPES && BOT_ITEM_TYPES[dataType].icon ? BOT_ITEM_TYPES[dataType].icon : ""
    },
    _isNullOrEmpty(name) {
      return isNullOrEmpty(name);
    }
  },
  created() {
    this.selectedMessages = this.alreadySelectedMessages;
  },
  mounted() {
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemCompositeMessage`, value: true });
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
