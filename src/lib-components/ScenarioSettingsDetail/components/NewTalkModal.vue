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
        <v-toolbar-title>新規トークを作成する</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="cancelCreate">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="modal-contents">
        <v-row>
          <v-col cols="10">
            <v-text-field
              outlined
              single-line
              hide-details
              dense
              label="トーク名を入力してください"
              v-model="talkName"
              @input="validateTalkName"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="talkErrorMessage.length > 0">
          <span class="red--text">{{ talkErrorMessage }}</span>
        </v-row>
        <v-row>
          <v-col cols="10">
            <v-text-field
              outlined
              single-line
              hide-details
              dense
              label="メッセージアクション用テキストを入力してください"
              v-model="textMapping"
              @input="validateTextMapping"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="mappingErrorMessage.length > 0">
          <span class="red--text">{{ mappingErrorMessage }}</span>
        </v-row>
      </v-card-text>
      <v-card-actions class="pa-4">
        <template>
          <v-row>
            <v-btn color="primary" elevation="4" class="px-6 mr-2" :disabled="!canSubmit" @click="createTalkInState">
              <v-icon left>mdi-import</v-icon>
              作成
            </v-btn>
            <v-btn elevation="4" class="px-6 mr-2" @click="cancelCreate">
              <v-icon left>mdi-cancel</v-icon>
              キャンセル
            </v-btn>
          </v-row>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import { cloneDeep } from "lodash";
import { generateUUID } from "@/utils/uuidUtils";
import { SET_SCENARIO_MINDMAP_MESSAGES } from "@/store/mutation-types";

interface LocalState {
  talkErrorMessage: string;
  mappingErrorMessage: string;
  canSubmit: boolean;
  talkName: string;
  talkNameValid: boolean;
  textMapping: string;
  textMappingValid: boolean;
  defaultMessage: any;
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
    validateTalkName(): void {
      this.talkErrorMessage = "";
      var validValue = true;
      var mappedNames = this.scenarioTalks.map((a) => a.params.name);
      if (mappedNames.includes(this.talkName)) {
        validValue = false;
        this.talkErrorMessage = "トーク名を既存のトークと同じにすることはできません。";
      }
      this.talkNameValid = validValue && this.talkName.length > 0;
    },
    validateTextMapping(): void {
      this.mappingErrorMessage = "";
      var validValue = true;
      if (this.scenarioTextMap && this.scenarioTextMap.textMapping) {
        if (this.textMapping in this.scenarioTextMap.textMapping) {
          validValue = false;
          this.mappingErrorMessage = "メッセージアクション用テキストを既存のトークと同じにすることはできません。";
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

      var talkPayload = {
        versionName: this.versionId,
        valueName: this.talkName,
        value: [tempBotReply],
      };
      this.updateMindMap(talkPayload);

      var tempTextMapping =
        "textMapping" in this.scenarioMindmap[this.versionId]
          ? cloneDeep(this.scenarioMindmap[this.versionId].textMapping)
          : cloneDeep(this.scenarioTextMap.textMapping);
      if (!tempTextMapping) {
        tempTextMapping = {};
      }
      tempTextMapping[this.textMapping] = tempBotReply.dataId;
      var textMappingPayload = {
        versionName: this.versionId,
        valueName: "textMapping",
        value: tempTextMapping,
      };
      this.updateMindMap(textMappingPayload);

      this.$router.push({
        name: "ScenarioMindmapPage",
        params: {
          scenarioId: this.scenarioId,
          versionId: this.versionId,
          talkName: this.talkName,
        },
        query: {
          new: "true",
        },
      });
    },
    cancelCreate(): void {
      this.show = false;
    },
  },
});
</script>
