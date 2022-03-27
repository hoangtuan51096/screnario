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
  <v-dialog scrollable v-model="show" max-width="600">
    <v-card>
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title>特別なシナリオトークを利用する</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="cancelCreate">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <span class="special-talk-modal-legend"><v-icon>mdi-comment-check</v-icon>の意味は有効です</span>
      <v-divider></v-divider>
      <template v-for="item in specialTalks">
        <v-container fluid :key="item + `.row`">
          <v-row>
            <v-col md="3">
              <label class="special-talk-label">{{ item }}</label>
              <v-icon v-if="existingTalks.includes(item) && !canSetAsActive(item)">mdi-comment-check</v-icon>
            </v-col>
            <v-col md="3">
              <v-btn
                block
                class="mx-1 px-6"
                :color="existingTalks.includes(item) ? '#fff176' : 'primary'"
                @click="
                  hasActionPermission('click', 'backendRequest') ? createSpecialTalk(item) : showActionPermissionError()
                "
              >
                <div v-if="existingTalks.includes(item)">
                  <v-icon left>mdi-cog-refresh</v-icon>
                  更新
                </div>
                <div v-else>
                  <v-icon left>mdi-plus-box</v-icon>
                  作成
                </div>
              </v-btn>
            </v-col>
            <!-- for trash disposal we don't need toggle active state button -->
            <v-col md="3" v-if="inActiveMap(item)">
              <v-btn
                v-if="canSetAsActive(item)"
                block
                class="mx-1 px-6"
                color="primary"
                @click="
                  hasActionPermission('click', 'backendRequest') ? toggleActiveState(item) : showActionPermissionError()
                "
                :disabled="!existingTalks.includes(item)"
              >
                <v-icon left>mdi-plus-circle</v-icon>
                有効にする
              </v-btn>
              <v-btn
                v-else
                block
                class="mx-1 px-6"
                color="secondary"
                @click="
                  hasActionPermission('click', 'backendRequest') ? toggleActiveState(item) : showActionPermissionError()
                "
                :disabled="!existingTalks.includes(item)"
              >
                <v-icon left>mdi-close-circle</v-icon>
                無効にする
              </v-btn>
            </v-col>
            <v-col md="3">
              <v-btn
                block
                class="mx-1 px-6"
                color="error"
                @click="
                  hasActionPermission('click', 'backendRequest') ? deleteSpecialTalk(item) : showActionPermissionError()
                "
                :disabled="!existingTalks.includes(item)"
              >
                <v-icon left>mdi-delete</v-icon>
                削除
              </v-btn>
            </v-col>
          </v-row>
          <v-divider></v-divider>
        </v-container>
      </template>
      <v-card-actions class="pa-4">
        <template>
          <v-btn elevation="4" class="px-6 mr-2" @click="cancelCreate">
            <v-icon left>mdi-cancel</v-icon>
            キャンセル
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import { SPECIAL_TALK_TYPES, SPECIAL_TALK_TYPES_MAPPING } from "@/store/modules/scenarios/scenarios.constants";
import { cloneDeep } from "lodash";

export default Vue.extend({
  props: {
    visible: Boolean,
    existingTalks: Array,
    versionName: String,
  },
  watch: {},
  data() {
    return {
      specialTalks: SPECIAL_TALK_TYPES,
    };
  },
  components: {},
  computed: {
    ...mapState({
      activeScenario: (state) => state.scenarios.activeScenario,
    }),
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
    createSpecialTalk(tlk) {
      this.$emit("onCreateTalks", tlk);
      this.show = false;
    },
    deleteSpecialTalk(tlk) {
      this.$emit("onDeleteTalks", tlk);
      this.show = false;
    },
    cancelCreate() {
      this.show = false;
    },
    toggleActiveState(tlk) {
      this.$emit("toggleTalkState", tlk);
      this.show = false;
    },
    inActiveMap(tlk) {
      return Object.keys(SPECIAL_TALK_TYPES_MAPPING).includes(tlk);
    },
    canSetAsActive(tlk) {
      if ("versions" in this.activeScenario) {
        var versionData = this.activeScenario["versions"][this.versionName];
        var talkName = SPECIAL_TALK_TYPES_MAPPING[tlk];
        return "specialTalks" in versionData && talkName in versionData["specialTalks"]
          ? !versionData["specialTalks"][talkName]
          : false;
      } else {
        return false;
      }
    },
  },
});
</script>

<style scoped>
.special-talk-label {
  vertical-align: sub;
}
.special-talk-modal-legend {
  padding-left: 0.5em !important;
  padding-bottom: 0.5em !important;
}
</style>
