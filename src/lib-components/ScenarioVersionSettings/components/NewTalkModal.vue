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
.modal-contents {
  padding-bottom: 0em !important;
}
</style>

<template>
  <v-dialog scrollable v-model="show" max-width="600">
    <v-card>
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title class="blue-grey--text text--darken-4 font-weight-bold">
          メッセージ作成
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text class="modal-contents">
        <v-row>
          <v-col cols="12">
            <div class="body-2 blue-grey--text font-weight-bold">
              トーク名
            </div>
            <v-text-field
              outlined
              single-line
              hide-details
              dense
              v-model="talkName"
              @input="validateTalkName"
              maxlength="120"
              :class="{'error--text v-input--is-focused' : talkErrorMessage}"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <div v-if="talkErrorMessage.length > 0" class="v-text-field__details">
          <div class="v-messages theme--light error--text" role="alert">
            <div class="v-messages__wrapper">
              <div class="v-messages__message">{{ talkErrorMessage }}</div>
            </div>
          </div>
        </div>
        <v-row>
          <v-col cols="12">
            <div class="body-2 blue-grey--text font-weight-bold">
              開始メッセージを入力
            </div>
            <v-text-field
              outlined
              single-line
              hide-details
              dense
              v-model="textMapping"
              @input="validateTextMapping"
              maxlength="120"
              :class="{'error--text v-input--is-focused' : mappingErrorMessage}"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <div v-if="mappingErrorMessage.length > 0" class="v-text-field__details">
          <div class="v-messages theme--light error--text" role="alert">
            <div class="v-messages__wrapper">
              <div class="v-messages__message">{{ mappingErrorMessage }}</div>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="pa-4 d-flex justify-end">
        <template>
          <v-btn
              class="blue-grey--text"
              outlined
              @click="cancelCreate"
          >
            キャンセル
          </v-btn>
          <v-btn
              class="ml-2"
              color="primary"
              :disabled="!canSubmit"
              @click="createTalkInState"
          >
            作成
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import {mapState, mapMutations, mapActions} from "vuex";
import { cloneDeep } from "lodash";
import { generateUUID } from "@/utils/uuidUtils";
import { SET_SCENARIO_MINDMAP_MESSAGES } from "@/store/mutation-types";
import { CREATE_SCENARIO_TALK } from "@/store/action-types";

interface LocalState {
  talkErrorMessage: string;
  mappingErrorMessage: string;
  canSubmit: boolean;
  talkName: string;
  talkNameValid: boolean;
  textMapping: string;
  textMappingValid: boolean;
  defaultMessage: any;
  rules: any;
}

export default Vue.extend({
  props: {
    visible: Boolean,
    scenarioId: String,
    versionId: String,
  },
  watch: {
    talkNameValid() {
      this.canSubmit = this.talkNameValid && this.textMappingValid;
    },
    textMappingValid() {
      this.canSubmit = this.talkNameValid && this.textMappingValid;
    },
  },
  data(): LocalState {
    return {
      talkErrorMessage: "",
      mappingErrorMessage: "",
      canSubmit: false,
      talkName: "",
      talkNameValid: false,
      textMapping: "",
      textMappingValid: false,
      defaultMessage: {
        dataType: "__INITIAL__",
        nameLBD: "",
        params: {
          text: "",
        },
      },
      rules: {
        notEmpty: (value) => {
          return value !== "" || "は必須入力です。";
        },
        notStartsWhiteSpace: (value) => {
          return !value.match(/^\s+.*$/) || "先頭に空白を指定することはできません。";
        },
        notEndsWhiteSpace: (value) => {
          return !value.match(/^.*?\s+$/) || "末尾に空白を指定することはできません。";
        },
      },
    };
  },
  components: {},
  computed: {
    ...mapState({
      scenarioMindmap: (state: any) => state.scenarios.scenarioMindmap,
      activeScenario: (state: any) => state.scenarios.activeScenario,
      scenarioTextMap: (state: any) => state.scenarios.scenarioTextmap,
      scenarioTalks: (state: any) => state.scenarios.scenarioTalks,
    }),
    show: {
      get(): boolean {
        return this.visible;
      },
      set(value: boolean): void {
        if (!value) {
          this.$emit("close");
          this.talkErrorMessage = "";
          this.mappingErrorMessage = "";
          this.canSubmit = false;
          this.talkName = "";
          this.talkNameValid = false;
          this.textMapping = "";
          this.textMappingValid = false;
        }
      },
    },
  },
  methods: {
    ...mapMutations({
      updateMindMap: SET_SCENARIO_MINDMAP_MESSAGES,
    }),
    ...mapActions({
      createTalkData: CREATE_SCENARIO_TALK,
    }),
    validateTalkName(): void {
      this.talkErrorMessage = "";
      let validValue = true;
      const notEmpty = this.rules.notEmpty(this.talkName);
      if (notEmpty !== true) {
        validValue = false;
        this.talkErrorMessage = 'トーク名'+notEmpty;
      }
      const notStartsWhiteSpace = this.rules.notStartsWhiteSpace(this.talkName);
      if (notStartsWhiteSpace !== true) {
        validValue = false;
        this.talkErrorMessage = notStartsWhiteSpace;
      }
      const notEndsWhiteSpace = this.rules.notEndsWhiteSpace(this.talkName);
      if (notEndsWhiteSpace !== true) {
        validValue = false;
        this.talkErrorMessage = notEndsWhiteSpace;
      }
      const mappedNames = this.scenarioTalks.map((a) => a.params.name);
      if (mappedNames.includes(this.talkName)) {
        validValue = false;
        this.talkErrorMessage = "トーク名を既存のトークと同じにすることはできません。";
      }
      this.talkNameValid = validValue && this.talkName.length > 0;
    },
    validateTextMapping(): void {
      this.mappingErrorMessage = "";
      let validValue = true;
      const notEmpty = this.rules.notEmpty(this.textMapping);
      if (notEmpty !== true) {
        validValue = false;
        this.mappingErrorMessage = '開始メッセージを入力'+notEmpty;
      }
      const notStartsWhiteSpace = this.rules.notStartsWhiteSpace(this.textMapping);
      if (notStartsWhiteSpace !== true) {
        validValue = false;
        this.mappingErrorMessage = notStartsWhiteSpace;
      }
      const notEndsWhiteSpace = this.rules.notEndsWhiteSpace(this.textMapping);
      if (notEndsWhiteSpace !== true) {
        validValue = false;
        this.mappingErrorMessage = notEndsWhiteSpace;
      }
      if (this.scenarioTextMap && this.scenarioTextMap.textMapping) {
        if (this.textMapping in this.scenarioTextMap.textMapping) {
          validValue = false;
          this.mappingErrorMessage = "トーク名を既存のユーザーテキストマッピングと同じにすることはできません。";
        }
      }
      this.textMappingValid = validValue && this.textMapping.length > 0;
    },
    createTalkInState(): void {
      const tempBotReply = {
        ...cloneDeep(this.defaultMessage),
        talk: this.talkName,
        dataId: generateUUID(),
        scenario: this.scenarioId + "#" + this.versionId,
        newMessage: true,
      };

      const talkPayload = {
        versionName: this.versionId,
        valueName: this.talkName,
        value: [tempBotReply],
      };
      this.updateMindMap(talkPayload);

      let tempTextMapping =
        "textMapping" in this.scenarioMindmap[this.versionId]
          ? cloneDeep(this.scenarioMindmap[this.versionId].textMapping)
          : cloneDeep(this.scenarioTextMap.textMapping);
      if (!tempTextMapping) {
        tempTextMapping = {};
      }
      tempTextMapping[this.textMapping] = tempBotReply.dataId;
      const textMappingPayload = {
        versionName: this.versionId,
        valueName: "textMapping",
        value: tempTextMapping,
      };
      this.updateMindMap(textMappingPayload);
      let data = {
        messages: tempBotReply,
        textMapping: new Map(Object.entries(tempTextMapping)),
        idTextMapping: tempBotReply.dataId,
        talkName: this.talkName,
        startMessage: this.textMapping,
        scenario_id: this.versionId
      }
      this.createTalkData(data);
      this.$emit("close");
      this.$router.push({
        name: "ScenarioMindmapPage",
        params: {
          scenarioId: this.scenarioId,
          versionId: this.versionId,
          talkName: this.talkName,
        },
      });
    },
    cancelCreate(): void {
      this.show = false;
    },
  },
});
</script>
