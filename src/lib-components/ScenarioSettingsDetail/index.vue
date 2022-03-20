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
    <v-overlay :opacity="0.2" v-if="isFetchingScenarioDetail || isSavingActiveScenario" z-index="1000">
      <content-loading :size="50" text="" />
    </v-overlay>
    <SubAppBar>
      <template>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div class="body-2">
            <router-link color="primary" :to="{name: 'ScenarioSettingsPage'}">シナリオ一覧</router-link>
            <span class="blue-grey--text" style="opacity: 0.6">
            -
            </span>
            <router-link
                color="primary"
                :to="{ name: 'ScenarioVersionSettingsPage', env: this.$route.params.env, scenarioId: this.$route.params.scenarioId, versionId: this.$route.params.versionId }"
            >
              {{ activeScenario.versions ? activeScenario.versions[$route.params.versionId].displayVersionName : $route.params.versionId }}
            </router-link>
            <span class="blue-grey--text" style="opacity: 0.6">
            -
            </span>
            <span class="blue-grey--text">
              {{ getTalkNameFromId }}
            </span>
          </div>
          <div class="d-flex">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div
                    style="display: inline-block"
                    v-bind="attrs"
                    v-on="$route.params.talkId === 'TRASH_SEPARATION_TALK' && on"
                >
                  <v-btn @click="onMindMap" class="ml-2" :disabled="$route.params.talkId === 'TRASH_SEPARATION_TALK'">
                    マップ表示
                  </v-btn>
                </div>
              </template>
              <span>
                "ゴミ分別" トークはマップ表示に対応していません
              </span>
            </v-tooltip>
          </div>
        </div>
        <div v-if="showSearch" class="mt-4">
          <v-divider class="mb-4" />
          <v-form @submit.prevent>
            <v-row>
              <v-col class="col-12 col-lg-6">
                <div class="body-2 blue-grey--text font-weight-bold">
                  メッセージ名
                </div>
                <v-text-field
                    dense
                    outlined
                    hide-details="auto"
                    clearable
                    v-model="messageName"
                />
              </v-col>
              <v-col class="col-12 col-lg-6">
                <div class="body-2 blue-grey--text font-weight-bold">
                  ユーザー入力
                </div>
                <v-text-field
                    dense
                    outlined
                    hide-details="auto"
                    clearable
                    v-model="userInput"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col class="col-12 col-lg-6">
                <div class="body-2 blue-grey--text font-weight-bold">
                  テキスト
                </div>
                <v-text-field
                    dense
                    outlined
                    hide-details="auto"
                    clearable
                    v-model="text"
                />
              </v-col>
              <v-col class="col-12 col-lg-6">
                <div class="body-2 blue-grey--text font-weight-bold">
                  種別
                </div>
                <v-select
                    dense
                    outlined
                    hide-details="auto"
                    :items="messageTypes"
                    v-model="messageType"
                />
              </v-col>
            </v-row>
            <div class="d-flex justify-end py-4">
              <v-btn
                  outlined
                  color="warning"
                  @click="clearSearchCriteria()"
              >
                検索条件をクリア
              </v-btn>
              <v-btn
                  class="ml-2"
                  color="primary"
                  type="submit"
                  @click="onClickSearch()"
              >
                この条件で検索
              </v-btn>
            </div>
          </v-form>
        </div>
      </template>
    </SubAppBar>
    <ScenarioSettingsDetail
        :searchCriteria="searchCriteria"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import SubAppBar from '../components/common/SubAppBar.vue';
import ScenarioSettingsDetail from "./fragments/ScenarioSettingsDetail.vue";
import {mapState} from "vuex";
import {BOT_ITEM_TYPES} from "@/store/modules/scenarios/scenarios.constants";
import {FETCH_ALL_SCENARIOS} from "@/store/action-types";

interface LocalState {
  showSearch: boolean;
  searchCriteria: any;
  messageTypes: Array<any>;
  messageTypeValues: any;
  messageName: string;
  userInput: string;
  text: string;
  messageType: any;
}

const emptySelectValue = "－－－－－";
const excludeMessageType = [
  "richmenu",
  "jsonTemplate",
  "webapp",
  "pie",
];

export default Vue.extend({
  props: {
    scenario: Object,
  },
  components: {
    ScenarioSettingsDetail,
    SubAppBar,
  },
  data(): LocalState {
    return {
      showSearch: false,
      searchCriteria: {},

      messageTypes: [
        emptySelectValue,
        ...Object
            .keys(BOT_ITEM_TYPES)
            .filter((key) => !excludeMessageType.includes(key))
            .map((key) => BOT_ITEM_TYPES[key].text),
      ],
      messageTypeValues: Object.keys(BOT_ITEM_TYPES).reduce((obj, key) => {
        const value = BOT_ITEM_TYPES[key];
        obj[value.text] = key;
        return obj;
      }, {}),

      messageName: "",
      userInput: "",
      text: "",
      messageType: emptySelectValue,
    };
  },
  watch: {
  },
  computed: {
    ...mapState({
      isFetchingScenarioDetail: (state: any) => state.scenarios.isFetchingScenarioDetail,
      isSavingActiveScenario: (state: any) => state.scenarios.isSavingActiveScenario,
      scenarioTalks: (state: any) => state.scenarios.scenarioTalks,
      activeScenario: (state: any) => state.scenarios.activeScenario,
    }),
    getTalkNameFromId(): any {
      const talk = this.scenarioTalks.find(elem => elem.dataId == this.$route.params.talkId);
      return talk ? talk.params.name : "トーク名";
    },
  },
  methods: {
    onMindMap(): void {
      const {
        scenarioId,
        versionId,
      } = this.$route.params;
      const talkName = this.getTalkNameFromId;

      this.$router.push({
        name: "ScenarioMindmapPage",
        params: {
          scenarioId,
          versionId,
          talkName,
        },
      });
    },
    toggleShowSearch(show: any): void {
      this.showStartDateMenu = false;
      this.showEndDateMenu = false;
      if (show != null) {
        this.showSearch = show;
      } else {
        this.showSearch = !this.showSearch;
      }
    },
    clearSearchCriteria(): void {
      this.messageName = "";
      this.userInput = "";
      this.text = "";
      this.messageType = emptySelectValue;
      this.onClickSearch();
    },
    onClickSearch(): void {
      const {
        messageName,
        userInput,
        text,
        messageType,
      } = this;

      this.searchCriteria = {
        messageName,
        userInput,
        text,
        messageType: messageType !== emptySelectValue ? this.messageTypeValues[messageType] : undefined,
      }
    },
  },
  created() {
    if (!this.activeScenario.scenarioId) {
      this.$store.dispatch(FETCH_ALL_SCENARIOS);
    }
  }
});
</script>
