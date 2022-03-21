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
  <div >
    <v-dialog content-class="composite-message-modal" scrollable v-model="show" width="96%">
      <v-card>
        <v-system-bar color="primary" dark height="5"> </v-system-bar>
        <v-toolbar flat style="flex: 0">
          <v-toolbar-title class="blue-grey--text text--darken-4 font-weight-bold">
            複合メッセージ
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="flex-1">
          <v-row class="d-flex flex-1">
            <v-col cols="8" class="d-flex flex-column flex-1">
              <v-col style="flex: 0">
                <div class="body-2 blue-grey--text font-weight-bold">
                  メッセージ名
                </div>
                <v-text-field
                    dense
                    outlined
                    hide-details="auto"
                    v-model="compositeMessageName"
                />
              </v-col>
              <v-col style="flex: 0">
                <p class="composite-create-instructions">
                  選択数：{{ selectedMessages.length }} / 5
                  <span class="ml-4 blue-grey--text">メッセージは最大5つまで選択できます。</span>
                </p>
                <p class="composite-error-message" v-if="!allSameSpecialTalk">
                  テンプレートのメッセージを選択した場合、すべて同じテンプレートのメッセージである必要があります
                </p>
              </v-col>
              <v-col cols="8" style="flex: 0" class="mt-6">
                <v-select
                    :items="displayTalkOptions"
                    v-model="selectedTalk"
                    label="トーク名"
                    outlined
                    background-color="white"
                    dense
                    clearable
                    hide-details
                    @change="selectTalk"
                />
              </v-col>
              <v-col class="flex-1">
                <v-data-table
                    v-model="selectedMessages"
                    :headers="headers"
                    :items="dataToDisplay"
                    :items-per-page="10"
                    show-select
                    fixed-header
                    item-key="dataId"
                >
                  <template v-slot:item.nameLBD="{ item }">
                    <v-icon class="mr-2">{{ typeIcon(item.dataType) }}</v-icon>
                    {{ item.nameLBD }}
                  </template>
                </v-data-table>
              </v-col>
            </v-col>
            <v-col cols="4">
              <MessagePreview :messages="this.selectedMessages" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <template>
            <v-spacer/>
            <v-btn outlined class="blue-grey--text" @click="closeComponent">
              キャンセル
            </v-btn>
            <v-btn
                color="primary"
                elevation="4"
                class="ml-2"
                @click="hasActionPermission('click', 'backendRequest') ? clickAdd() : showActionPermissionError()"
                :disabled="
              selectedMessages.length === 0 ||
              selectedMessages.length > 5 ||
              compositeMessageName === '' ||
              !allSameSpecialTalk
            "
            >
              追加
            </v-btn>
          </template>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { ADD_COMPOSITE_MESSAGE } from "@/store/action-types";
import { BOT_ITEM_TYPES } from "@/store/modules/scenarios/scenarios.constants";
import MessagePreview from "./MessagePreview.vue";
import { generateUUID } from "@/utils/uuidUtils";

interface LocalState {
  selectedMessages: Array<any>;
  selectedTalk: any;
  allSameSpecialTalk: boolean;
  dataToDisplay: any;
  compositeMessageName: string;
  supportedMessages: Array<string>;
  headers: Array<any>;
}

export default Vue.extend({
  props: {
    visible: Boolean,
    close: Function,
    scenarioId: String,
    versionId: String,
    displayTalkOptions: Array,
  },
  data(): LocalState {
    return {
      selectedMessages: [],
      selectedTalk: null,
      allSameSpecialTalk: true,
      dataToDisplay: null,
      compositeMessageName: "",
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
          text: "メッセージ名",
          sortable: true,
          value: "nameLBD",
          width: "100%",
        },
      ],
    };
  },
  watch: {
    selectedMessages() {
      this.allSameSpecialTalk = true;
      var partOfSpecialTalk = false;
      var specialTalkName = null;
      var numMessages = 0;
      this.selectedMessages.forEach((msg) => {
        if (partOfSpecialTalk && !("specialScenarioTalk" in msg.params)) {
          //found LBD message after Special Talk message
          this.allSameSpecialTalk = false;
        }
        if ("specialScenarioTalk" in msg.params && numMessages > 0 && !partOfSpecialTalk) {
          //found Special Talk message after LBD message
          this.allSameSpecialTalk = false;
        }
        if ("specialScenarioTalk" in msg.params) {
          if (specialTalkName && specialTalkName != msg.params.specialScenarioTalk) {
            //found different Special Talk message after Special Talk message
            this.allSameSpecialTalk = false;
          } else {
            partOfSpecialTalk = true;
            specialTalkName = msg.params.specialScenarioTalk;
          }
        }
        numMessages++;
      });
    },
    visible() {
      this.selectedTalk = null;
      this.dataToDisplay = this.filteredMessages;
      this.allSameSpecialTalk = true;
    },
  },
  components: { MessagePreview },
  computed: {
    ...mapState({
      scenarioMessages: (state: any) => state.scenarios.scenarioMessages,
      scenarioTalks: (state: any) => state.scenarios.scenarioTalks,
    }),
    filteredMessages(): any {
      if (this.scenarioMessages) {
        return this.scenarioMessages.filter((message) => {
          return this.supportedMessages.includes(message.dataType) && message.params["specialScenarioTalk"] == null;
        });
      } else {
        return [];
      }
    },
    show: {
      get(): boolean {
        return this.visible;
      },
      set(value: boolean): void {
        if (!value) {
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    ...mapActions({
      addCompositeMessage: ADD_COMPOSITE_MESSAGE,
    }),
    typeIcon(value: any): any {
      if (BOT_ITEM_TYPES[value] && BOT_ITEM_TYPES[value].icon) {
        return BOT_ITEM_TYPES[value].icon;
      }
      return "mdi-border-none-variant";
    },
    getTalkNameFromId(): void {
      const talk = this.scenarioTalks.find(elem => elem.dataId === this.$route.params.talkId);
      return talk && talk.params ? talk.params.name : '';
    },
    clickAdd(): void {
      const listOfMessagePostbackIds = [];
      this.selectedMessages.forEach((message) => {
        listOfMessagePostbackIds.push(message.dataId);
      });
      const payload = {
        scenario: this.scenarioId + "#" + this.versionId,
        scenario_id: this.versionId,
        scenario_talk_id: this.$route.params.talkId,
        nameLBD: this.compositeMessageName,
        dataId: generateUUID(),
        dataType: "compositeMessage",
        messages: listOfMessagePostbackIds,
        talkName: this.getTalkNameFromId(),
        talk: this.getTalkNameFromId(),
      };
      if ("specialScenarioTalk" in this.selectedMessages[0]["params"]) {
        payload["params"] = {
          specialScenarioTalk: this.selectedMessages[0]["params"]["specialScenarioTalk"],
          userCreatedSpecialTalkComposite: true,
        };
      }
      this.addCompositeMessage(payload);
      this.closeComponent();
      this.$emit("close");
    },
    closeComponent(): void {
      this.show = false;
      this.compositeMessageName = "";
      this.selectedMessages = [];
    },
    selectTalk(talk: any): void {
      if (talk) {
        var result = this.scenarioTalks.filter((obj) => {
          return obj.params.name === talk;
        });
        var talkValue = result[0];
        var listOfIds = [];
        talkValue.params.messages.forEach((message) => {
          if (message.sender === "BOT") {
            listOfIds.push(message.messageId);
          }
        });
        this.dataToDisplay = this.filteredMessages.filter((message) => {
          return listOfIds.includes(message.dataId);
        });
      } else {
        this.dataToDisplay = this.filteredMessages;
      }
    },
  },
  created() {
    this.dataToDisplay = this.filteredMessages;
  },
});
</script>

<style lang="less">
.composite-message-modal {
  height: calc(100vh - 4vw) !important;
  max-height: calc(100vh - 4vw) !important;
}
.composite-message-modal .v-data-footer {
  padding: inherit !important;
}

.composite-create-instructions {
  margin-bottom: 0.2em !important;
}
.composite-error-message {
  margin-bottom: 0em !important;
  font-size: 8pt;
  color: darkred;
  padding-left: 1em;
  padding-right: 1em;
}
</style>
