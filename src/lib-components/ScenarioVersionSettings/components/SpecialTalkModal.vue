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
        <v-toolbar-title class="blue-grey--text text--darken-4 font-weight-bold">
          テンプレートを利用
        </v-toolbar-title>
      </v-toolbar>
      <template v-for="(item, index) in specialTalks">
        <v-container
            fluid
            :style="selected === index ? 'background: #eee' : ''"
            :key="item.talkId + `.row`"
            class="pb-0"
        >
          <v-row class="align-center px-6">
            <v-col class="pa-0">
              <label class="special-talk-label">{{ prefix[index] }} {{ item.displayName }}</label>
            </v-col>
            <!-- for trash disposal we don't need toggle active state button -->
            <v-col class="ml-2 pa-0" md="2" v-if="inActiveMap(item.displayName)">
              <v-btn
                  v-if="canSetAsActive(item.displayName)"
                  color="primary"
                  outlined
                  block
                  class="special-talk-modal-button pa-0"
                  @click="
                  hasActionPermission('click', 'backendRequest') ? toggleActiveState(item) : showActionPermissionError()
                "
                  :disabled="hasActionPermission('disableButton', 'ScenarioSettings_EnableTemplate_Click') || !templateExists(item.talkId)"
              >
                有効
              </v-btn>
              <v-btn
                  v-else
                  color="warning"
                  outlined
                  block
                  class="special-talk-modal-button pa-0"
                  @click="toggleActiveState(item)"
                  :disabled="hasActionPermission('disableButton', 'ScenarioSettings_DeleteTemplate_Click') || !templateExists(item.talkId)"
              >
                無効
              </v-btn>
            </v-col>
            <!-- spacer -->
            <v-col class="ml-2 pa-0" md="2" v-else/>
            <v-col class="ml-2 pa-0" md="2" v-if="!templateExists(item.talkId)">
              <v-btn
                  block
                  class="special-talk-modal-button pa-0"
                  color="primary"
                  :dark="!hasActionPermission('disableButton', 'ScenarioSettings_CreateTemplate_Click')"
                  :disabled="hasActionPermission('disableButton', 'ScenarioSettings_CreateTemplate_Click')"
                  @click="
                    hasActionPermission('click', 'backendRequest') ? createSpecialTalk(item.displayName) : showActionPermissionError()
                  "
              >
                <div>
                  作成
                </div>
              </v-btn>
            </v-col>
            <v-col class="ml-2 pa-0" md="2" v-else>
              <v-btn
                block
                class="special-talk-modal-button pa-0"
                color="error"
                @click="
                  hasActionPermission('click', 'backendRequest') ? deleteSpecialTalk(item) : showActionPermissionError()
                "
                :disabled="hasActionPermission('disableButton', 'ScenarioSettings_DeleteTemplate_Click') || !templateExists(item.talkId)"
              >
                削除
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-divider class="blue-grey lighten-4 mt-3 mx-6"/>
          </v-row>
        </v-container>
      </template>
      <v-card-actions class="pa-4 d-flex justify-end">
        <template>
          <v-btn outlined class="px-6 mr-2" @click="cancelCreate">
            閉じる
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import { TEMPLATE_TALKS, SPECIAL_TALK_TYPES_MAPPING } from "@/store/modules/scenarios/scenarios.constants";

interface LocalState {
  specialTalks: any;
  prefix: Array<string>;
}

export default Vue.extend({
  props: {
    visible: Boolean,
    existingTalks: Array,
    versionName: String,
    selected: Number,
  },
  watch: {},
  data(): LocalState {
    return {
      specialTalks: TEMPLATE_TALKS,
      prefix: [
          "①",
          "②",
          "③",
          "④",
          "⑤",
          "⑥",
      ]
    };
  },
  components: {},
  computed: {
    ...mapState({
      activeScenario: (state: any) => state.scenarios.activeScenario,
    }),
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
    createSpecialTalk(tlk: any): void {
      this.$emit("onCreateTalks", tlk);
      this.show = false;
    },
    deleteSpecialTalk(template: any): void {
      this.$emit("onDeleteTalks", template);
    },
    cancelCreate(): void {
      this.show = false;
    },
    toggleActiveState(tlk: any): void {
      this.$emit("toggleTalkState", tlk);
      this.show = false;
    },
    inActiveMap(tlk: any): boolean {
      return Object.keys(SPECIAL_TALK_TYPES_MAPPING).includes(tlk);
    },
    canSetAsActive(tlk: any): boolean {
      if ("versions" in this.activeScenario) {
        const versionData = this.activeScenario["versions"][this.versionName];
        const talkName = SPECIAL_TALK_TYPES_MAPPING[tlk];
        return "specialTalks" in versionData && versionData.specialTalks != 'null' && talkName in versionData["specialTalks"]
          ? !versionData["specialTalks"][talkName]
          : false;
      } else {
        return false;
      }
    },
    templateExists(templateId: any): boolean {
      return !!this.existingTalks.find(talk => talk.dataId === templateId);
    }
  },
});
</script>
