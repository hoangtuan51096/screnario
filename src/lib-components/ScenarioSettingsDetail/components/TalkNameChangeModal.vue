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
        <v-toolbar-title class="ml-2">トーク名変更</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="show = false">
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
              label="トーク名"
              v-model="newTalkName"
              @input="validateTalkName"
              :class="{'error--text v-input--is-focused' : newTalkName != originalTalkName && talkErrorMessage.length}"
            >
            </v-text-field>
            <div v-if="newTalkName != originalTalkName && talkErrorMessage.length > 0" class="v-text-field__details">
              <div class="v-messages theme--light error--text" role="alert">
                <div class="v-messages__wrapper">
                  <div class="v-messages__message">{{ talkErrorMessage }}</div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
<!--        <div style="color: black; font-size: 0.8em;" v-if="!isTemplateTalk">-->
<!--        ※このトーク名を変更すると、このトークに対するトーク配信設定が解除されます。<br>-->
<!--        トーク配信設定を維持する場合、トーク配信設定を再度設定し直してください。-->
<!--        </div>-->
      </v-card-text>
      <v-card-actions class="pa-4 ml-5">
        <template>
          <v-row>
            <v-btn
                color="primary"
                elevation="4"
                class="px-6 mr-2"
                :disabled="saveDisabled"
                @click="updateTalkName"
            >
              <v-icon left>mdi-import</v-icon>
              変更
            </v-btn>
            <v-btn elevation="4" class="px-6 mr-2" @click="show = false">
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
import { mapState, mapMutations } from "vuex";
import { cloneDeep } from "lodash";
import { isNullOrEmpty } from "@/utils/stringUtils";
import { TEMPLATE_TALK_IDS } from "@/store/modules/scenarios/scenarios.constants.ts";

export default Vue.extend({
  props: {
    visible: Boolean,
    existingTalks: Array,
    talkId: String,
    originalTalkName: String,
  },
  watch: {
    visible(value) {
      if (value) {
        this.newTalkName = cloneDeep(this.originalTalkName);
      }
    }
  },
  data() {
    return {
      talkErrorMessage: "",
      newTalkName: null,
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
      scenarioMindmap: (state) => state.scenarios.scenarioMindmap,
      activeScenario: (state) => state.scenarios.activeScenario,
      scenarioTextMap: (state) => state.scenarios.scenarioTextmap,
      scenarioTalks: (state) => state.scenarios.scenarioTalks,
    }),
    isTemplateTalk() {
      return TEMPLATE_TALK_IDS.includes(this.talkId);
    },
    inputAlreadyExists() {
        return this.existingTalks.includes(this.newTalkName);
    },
    saveDisabled() {
        return isNullOrEmpty(this.newTalkName) ||
            this.newTalkName === this.originalTalkName ||
            this.talkErrorMessage.length > 0;
    },
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    ...mapMutations({
    }),
    validateTalkName() {
      this.talkErrorMessage = "";
      const notEmpty = this.rules.notEmpty(this.newTalkName);
      if (notEmpty !== true) {
        this.talkErrorMessage = 'トーク名'+notEmpty;
      }
      const notStartsWhiteSpace = this.rules.notStartsWhiteSpace(this.newTalkName);
      if (notStartsWhiteSpace !== true) {
        this.talkErrorMessage = notStartsWhiteSpace;
      }
      const notEndsWhiteSpace = this.rules.notEndsWhiteSpace(this.newTalkName);
      if (notEndsWhiteSpace !== true) {
        this.talkErrorMessage = notEndsWhiteSpace;
      }

      if (this.existingTalks.includes(this.newTalkName)) {
        this.talkErrorMessage = "トーク名を既存のトークと同じにすることはできません。";
      }
    },
    updateTalkName() {
        this.$emit("updateTalk", this.newTalkName);
        this.show = false;
    },
  },
  created() {
    this.newTalkName = cloneDeep(this.originalTalkName);
  }
});
</script>
