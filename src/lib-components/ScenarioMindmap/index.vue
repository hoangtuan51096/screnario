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
  <div id="mindmap-root">
    <div id="mindmap-wrapper">
      <v-overlay v-if="loadingMindMap" :opacity="0.2">
        <content-loading :size="50" text="" />
      </v-overlay>
      <SubAppBar dense>
        <div style=" display: flex; align-items: center; padding: 0 12px">
          <v-row style="flex-wrap: nowrap">
            <div class="body-2" style="display: inline-flex; align-items: center">
              <router-link color="primary" :to="{name: 'ScenarioSettingsPage'}">シナリオ一覧</router-link>
              <span class="blue-grey--text mx-1" style="opacity: 0.6">
              -
              </span>
                <router-link
                    color="primary"
                    :to="{ name: 'ScenarioVersionSettingsPage', env: this.$route.params.environment, scenarioId: this.$route.params.scenarioId, versionId: this.$route.params.versionId }"
                >
                  {{ activeScenario.versions ? activeScenario.versions[$route.params.versionId].displayVersionName : $route.params.versionId }}
                </router-link>
                <span class="blue-grey--text mx-1" style="opacity: 0.6">
              -
              </span>
              <router-link
                  color="primary"
                  :to="onScenarioSettings">
                <span class="blue-grey--text">
                  {{ $route.params.talkName }}
                </span>
              </router-link>
            </div>
            <v-spacer />
            <v-col class="editor-buttons" cols="auto" style="padding-left: 0;padding-right: 0; display: flex; align-items: center;">
              <v-sheet class="combined-buttons" elevation="2" rounded>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          class="editor-button"
                          tile
                          :elevation="0"
                          :disabled="!previousState"
                          @click="onClickUndoButton()"
                      >
                        <v-icon> mdi-undo </v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>戻る</span>
                  (
                    <span v-if="isMacOS"> ⌘Z </span>
                    <span v-else> Ctrl+Z </span>
                  )
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          class="editor-button"
                          tile
                          :elevation="0"
                          :disabled="!nextState"
                          @click="onClickRedoButton()"
                      >
                        <v-icon> mdi-redo </v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>進む</span>
                  (
                    <span v-if="isMacOS"> ⌘Y </span>
                    <span v-else> Ctrl+Y </span>
                  )
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          class="editor-button"
                          tile
                          :elevation="0"
                          :disabled="!editItem || (editItem && editItem.dataType === '__INITIAL__')"
                          @click="onCopy()"
                      >
                        <v-icon> mdi-content-copy </v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>コピー</span>
                  (
                  <span v-if="isMacOS"> ⌘C </span>
                  <span v-else> Ctrl+C </span>
                  )
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          class="editor-button"
                          :disabled="!copiedItems || !editItem || (editItem && editItem.dataType !== '__INITIAL__')"
                          tile
                          :elevation="0"
                          @click="onPaste()"
                      >
                        <v-icon> mdi-content-paste </v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>ペースト</span>
                  (
                    <span v-if="isMacOS"> ⌘V </span>
                    <span v-else> Ctrl+V </span>
                  )
                </v-tooltip>
              </v-sheet>
              <v-sheet class="combined-buttons" elevation="2" rounded>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          class="editor-button"
                          tile
                          :elevation="0"
                          @click="recenterMap(0)"
                      >
                        <v-icon>mdi-crosshairs-gps</v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>ホーム</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          class="editor-button"
                          tile
                          :elevation="0"
                          :disabled="scale >= maxScale"
                          @click="onClickEnlargeButton()"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>ズームオン</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          class="editor-button"
                          tile
                          :elevation="0"
                          :disabled="scale === 100"
                          @click="onClickResetButton()"
                      >
                      <v-icon>mdi-magnify-remove-outline</v-icon>
                    </v-btn>
                    </span>
                  </template>
                  <span>ズームリセット</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          class="editor-button"
                          tile
                          :elevation="0"
                          :disabled="scale <= minScale"
                          @click="onClickShrinkButton()"
                      >
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>ズームオフ</span>
                </v-tooltip>
              </v-sheet>
              <div
                  class="mr-4"
                  style="display: inline-flex; justify-content: center; margin: 0 0.5rem"
              >
                <span v-if="scale < 100" style="visibility: hidden">0</span>
                {{ scale }} %
              </div>
              <v-sheet class="combined-buttons combined-buttons-split" elevation="2" rounded>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          color="error"
                          class="editor-button"
                          tile
                          :elevation="0"
                          :disabled="hasActionPermission('disableButton', 'ScenarioSettings_DeleteNode_Click') || activeItem == null || activeItem.mindmapId === 0"
                          @click="onClickDeleteButton()"
                      >
                        <v-icon>mdi-trash-can</v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>削除</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <v-btn
                          class="editor-button"
                          tile
                          :elevation="0"
                          :disabled="hasActionPermission('disableButton', 'ScenarioSettings_SaveMap_Click') || editProperties"
                          @click="onClickSaveButton()"
                      >
                        <v-icon>mdi-content-save</v-icon>
                      </v-btn>
                    </span>
                  </template>
                  <span>保存</span>
                </v-tooltip>
              </v-sheet>
            </v-col>
            <v-spacer />
            <v-col class="d-flex justify-end">
              <router-link :to="onScenarioSettings" class="button-link">
                <v-btn>
                  リスト表示
                </v-btn>
              </router-link>
            </v-col>
          </v-row>
        </div>
      </SubAppBar>
      <div id="mindmap-inner">
        <v-row
          ref="svgContainer"
          style="background-color: #f2f2f2; position: absolute; top: 0; bottom: 0; left: 0; right: 0"
          v-on:click="onClickSVGContainer"
        >
          <svg
            id="svgElem"
            :height="svgHeight"
            baseProfile="full"
            style="background-color: #f2f2f2; position: absolute; outline: none; height: 100%"
            version="1.1"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="linkhighlight" height="10000%" width="10000%" x="-5000%" y="-5000%">
              <feFlood flood-color="#e53935" flood-opacity="1" result="flood"></feFlood>
              <feComposite in="flood" in2="SourceGraphic" operator="in" result="mask"></feComposite>
              <feMorphology in="mask" operator="dilate" radius="2" result="dilated"></feMorphology>
              <feGaussianBlur in="dilated" result="blurred" stdDeviation="5"></feGaussianBlur>
              <feMerge>
                <feMergeNode in="blurred"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>
            <filter id="botnode" height="10000%" width="10000%" x="-5000%" y="-5000%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
              <feOffset dx="0" dy="0" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA slope="0.05" type="linear" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="activenode" height="10000%" width="10000%" x="-5000%" y="-5000%">
              <feFlood flood-color="#F2F2F2" result="padding"></feFlood>
              <feMorphology in="SourceAlpha" operator="dilate" radius="2"></feMorphology>
              <feComposite in="padding" operator="in" result="padding-stroke"></feComposite>
              <feFlood flood-color="#2C9AD8" result="border"></feFlood>
              <feMorphology in="SourceAlpha" operator="dilate" radius="4"></feMorphology>
              <feComposite in="border" operator="in" result="border-stroke"></feComposite>
              <feMerge>
                <feMergeNode in="border-stroke"></feMergeNode>
                <feMergeNode in="padding-stroke"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>
            <filter id="linknode" height="10000%" width="10000%" x="-5000%" y="-5000%">
              <feFlood flood-color="#F2F2F2" result="padding"></feFlood>
              <feMorphology in="SourceAlpha" operator="dilate" radius="2"></feMorphology>
              <feComposite in="padding" operator="in" result="padding-stroke"></feComposite>
              <feFlood flood-color="#2C9AD8" result="border"></feFlood>
              <feMorphology in="SourceAlpha" operator="dilate" radius="4"></feMorphology>
              <feComposite in="border" operator="in" result="border-stroke"></feComposite>
              <feMerge>
                <feMergeNode in="border-stroke"></feMergeNode>
                <feMergeNode in="padding-stroke"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>
            <g id="mindMapSVG"></g>
          </svg>
        </v-row>
      </div>
    </div>
    <v-navigation-drawer
        v-model="showDrawer"
        fixed
        hide-overlay
        right
        ref="property-drawer"
        transition="scroll-x-transition"
        :style="`width: calc(${propertyTabWidth}% + 38px); z-index: 8`"
    >
      <Property
          v-if="showPropertyDrawer"
          :model="editItem"
          :originModel="editItem"
          :scenarioId="scenarioId"
          :talkName="talkName"
          :versionId="versionId"
          :botMessages="scenarioMindmapMessages"
          :on-click-toggle-button="togglePropertyDrawer"
          @stopProperties="stopProperties"
          @updateScenarioMessage="updateScenarioMessage"
          @updateEditState="updateEditState"
          @localDataTypeUpdate="localDataTypeUpdate"
      />
      <RootMessage
          v-if="showRootMessageDrawer"
          :model="editItem"
          :scenarioId="scenarioId"
          :versionId="versionId"
          :on-click-toggle-button="toggleRootMessageDrawer"
          @redrawFromRoot="redrawFromRoot"
          @stopProperties="stopProperties"
          @updateEditState="updateEditState"
      />
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapMutations, mapState } from "vuex";
import { cloneDeep, isEqual } from "lodash";
import { generateUUID } from "@/utils/uuidUtils";
import Property from "./Properties/Property.vue";
import RootMessage from "./Properties/RootMessage.vue";
import { TEMPLATE_TALK_IDS } from "@/store/modules/scenarios/scenarios.constants";
import {
  createSVGNode,
  deleteElements,
  drawBackGroundForCarouselGroup,
  drawExpandElement,
  drawIconForLinkedNode,
  drawIconForNode,
  drawSVGConnection,
  filterOutUnnecessaryTextMappings,
  findTheRootNode,
  generateMindMap,
  getCollapsedMindmapForDrawing,
  LINKED_NODE_DELETE_ERROR,
  replaceFirstIncompletePostbackActionInBubble,
  deletePostbackActionFromBubbleFlexParams,
} from "@/services/MindMapService.ts";
import {
  FETCH_ALL_SCENARIOS,
  FETCH_SCENARIO_DETAIL,
  FETCH_SPECIAL_TALK_FLOW_START,
  SAVE_TALK_NODES
} from "@/store/action-types";
import { SET_SCENARIO_MINDMAP, SET_SCENARIO_MINDMAP_MESSAGES, SET_SCENARIO_TEXTMAP } from "@/store/mutation-types";
import PanZoom from "panzoom";
import SubAppBar from "../components/common/SubAppBar.vue";

const DOUBLE_CLICK_TIMEOUT_MILLI_SEC = 333;

const ALLOW_LINK_DATA_TYPES = ["buttons"];

export default Vue.extend({
  data() {
    return {
      talkName: "",
      panzoom: null,
      scenarioId: null,
      versionId: null,
      validTextMappings: [],
      mindMapGenerations: [],
      tempMindMapForDrawing: [],
      scenarioMindmapMessages: [],
      rootNode: null,
      mindMapErrorMessage: null,
      loadingMindMap: true,
      svgNS: "http://www.w3.org/2000/svg",
      svgHeight: 0,
      highlightedNodes: [],
      // properties
      editProperties: false,
      activeItem: null,
      editItem: null,
      linkItem: null,
      saved: false,
      scale: 100,
      minScale: 20,
      maxScale: 200,
      nodeClickHandler: null,
      deleteTargets: [],
      displayTalkOptions: null,
      lastClickPosition: null,
      previousState: null,
      nextState: null,
      onSaveDeleteTargetIds: [],
      validScenarioTextMap: null,
      copiedItems: null,
      isChangingEditItem: false,
      scenarioMindmapSnapshot: null,
      editMenuDummyModel: {},
      editItemDataType: null,
      newTalkUUID: null,
    };
  },
  components: {
    SubAppBar,
    Property,
    RootMessage,
  },
  watch: {
    $route() {
      this.onMount(true);
    },
    mindMapErrorMessage(val) {
      this.$snackbar.show({ text: val, type: "error" });
    },
    isSavingTalkNodes(val) {
      this.loadingMindMap = val;
      if (!val && this.saveTalkNodesSuccess) {
        this.scenarioMindmapSnapshot = cloneDeep(this.scenarioMindmap);

        if (this.$route.query.new === "true") {
          this.$router.replace({
            name: "ScenarioMindmapPage",
            params: {
              scenarioId: this.scenarioId,
              versionId: this.versionId,
              talkName: this.talkName,
            },
          });
        } else if(this.getTalkIdFromName()){
          this.$router.push({
            name: "ScenarioSettingsDetailPage",
            params: {
              env: "sandbox",
              scenarioId: this.$route.params.scenarioId,
              versionId: this.$route.params.versionId,
              talkId: this.newTalkUUID,
            },
          });
        } else {
          this.$router.push({
            name: "ScenarioSettingsPage",
          });
        }
      }
    },
    saveTalkNodesError(val) {
      this.$snackbar.show({ text: val, type: "error" });
    },
    scenarioTalks() {
      this.displayTalkOptions = this.talkOptions();
    },
    scenarioMindmapMessages(val) {
      this.scenarioMindmapMessages = val;
    },
    scenarioMindmap(val) {
      this.scenarioMindmap = val;
    },
    editItem(val) {
      this.editItemDataType = val ? val.dataType : null;
    },
    fetchScenarioDetailError(val) {
      if (val) {
        if (val instanceof String) {
          this.$snackbar.show({ text: val, type: "error" });
        } else {
          if (val.message === 'シナリオが見つかりません。') {
            this.$router.push({name: 'ScenarioSettingsPage'})
          }
          this.$snackbar.show({ text: val.message, type: "error" });
        }
      }
    }
  },
  computed: {
    ...mapState({
      scenarioMindmap: (state) => state.scenarios.scenarioMindmap,
      scenarioTextMap: (state) => state.scenarios.scenarioTextmap,
      scenarioMessages: (state) => state.scenarios.scenarioMessages,
      scenarioTalks: (state) => state.scenarios.scenarioTalks,
      userMessages: (state) => state.scenarios.userMessages,
      isSavingTalkNodes: (state) => state.scenarios.isSavingTalkNodes,
      saveTalkNodesSuccess: (state) => state.scenarios.saveTalkNodesSuccess,
      saveTalkNodesError: (state) => state.scenarios.saveTalkNodesError,
      activeScenario: (state) => state.scenarios.activeScenario,
      fetchScenarioDetailError: (state) => state.scenarios.fetchScenarioDetailError,
    }),
    onScenarioSettings() {
      if (this.getTalkIdFromName()) {
        return {
          name: "ScenarioSettingsDetailPage",
          params: {
            env: "sandbox",
            scenarioId: this.scenarioId,
            versionId: this.versionId,
            talkId: this.getTalkIdFromName(),
          },
        };
      } else {
        return {
          name: "ScenarioSettingsPage",
        }
      }
    },
    onScenarioHome() {
      return {
        name: "ScenarioSettingsPage",
      };
    },
    filteredScenarioTextMap() {
      const nextScenarioTextMap = cloneDeep(this.scenarioTextMap);
      const { textMapping } = cloneDeep(nextScenarioTextMap);
      const filteredTextMap = {};
      Object.keys(textMapping || {}).forEach((key) => {
        if (!this.onSaveDeleteTargetIds.includes(textMapping[key])) {
          filteredTextMap[key] = textMapping[key];
        }
      });
      return { ...nextScenarioTextMap, textMapping: filteredTextMap };
    },
    showDrawer: {
      get() {
        return !!(this.editProperties && this.editItem);
      },
      set() {},
    },
    showRootMessageDrawer: {
      get() {
        return !!(this.editProperties && this.editItem && !this.editItem.dataId);
      },
      set() {},
    },
    showPropertyDrawer: {
      get() {
        return !!(this.editProperties && this.editItem && this.editItem.dataId);
      },
      set() {},
    },
    isMacOS() {
      return navigator.platform.toLowerCase().includes("mac");
    },
    propertyTabWidth() {
      return ["bubbleFlex"].includes(this.editItemDataType) ? 35 : 25;
    }
  },
  methods: {
    ...mapActions({
      getDataForDetails: FETCH_SCENARIO_DETAIL,
      getSpecialTalkFlowStart: FETCH_SPECIAL_TALK_FLOW_START,
      saveTalkNodes: SAVE_TALK_NODES,
      setScenarioTextMap: SET_SCENARIO_TEXTMAP,
    }),
    ...mapMutations({
      updateMindMapMessages: SET_SCENARIO_MINDMAP_MESSAGES,
      updateMindMap: SET_SCENARIO_MINDMAP,
    }),
    onMount(force = false) {
      this.fetchProperties(force);
    },
    talkOptions() {
      return this.scenarioTalks ? this.scenarioTalks.map((a) => a.params.name).sort() : [];
    },
    getTalkIdFromName() {
      const talk = this.scenarioTalks.find(elem => elem.params.name === this.talkName);
      return talk ? talk.dataId : '';
    },
    selectTalk(talk) {
      this.loadingMindMap = true;
      this.$router.replace({
        name: "ScenarioMindmapPage",
        params: {
          scenarioId: this.scenarioId,
          versionId: this.versionId,
          talkName: talk,
        },
      });
    },
    //================================================================
    // Main mindmap functions
    //================================================================
    //Run this method whenever a new talk is selected
    async buildMindMapFromNewTalk() {
      this.scenarioMindmapMessages = cloneDeep(this.scenarioMindmap[this.versionId][this.talkName]);
      this.validTextMappings = cloneDeep(this.scenarioMindmap[this.versionId].textMapping);
      this.mindMapGenerations = [];
      this.deleteMindMapChildren();
      await this.buildTheMindMap();

      if (this.$route.query.new === "true") {
        this.onClickSaveButton();
      }

      this.panzoom = PanZoom(document.getElementById("mindMapSVG"), {
        maxZoom: this.maxScale / 100,
        minZoom: this.minScale / 100,
        initialX: 50,
        initialZoom: this.scale / 100,
        zoomSpeed: 0.666, // これはトラックパッド（マウスホイールには効かない）
        pinchSpeed: 1, // これはiPadとかの2本指ズーム
        smoothScroll: false,
        zoomDoubleClickSpeed: 1,
      });
      this.panzoom.on("zoom", () => this.onZoom());

      this.recenterMap(0);
    },
    onZoom() {
      if (!this.panzoom) {
        return;
      }
      const { scale } = this.panzoom.getTransform();
      this.scale = Math.round(scale * 100);
    },
    onClickEnlargeButton() {
      if (!this.panzoom) {
        return;
      }
      const { x, y } = this.panzoom.getTransform();
      let next = Math.ceil(this.scale / 10) * 10;
      if (next % 20 !== 0) {
        next += 10;
      }
      if (Math.abs(this.scale - next) === 0) {
        next += 20;
      }
      if (next >= this.maxScale) {
        next = this.maxScale;
      }
      this.scale = next;
      this.panzoom.smoothZoomAbs(x, y, next / 100);
    },
    onClickShrinkButton() {
      if (!this.panzoom) {
        return;
      }
      const { x, y } = this.panzoom.getTransform();
      let next = Math.floor(this.scale / 10) * 10;
      if (next % 20 !== 0) {
        next -= 10;
      }
      if (Math.abs(this.scale - next) === 0) {
        next -= 20;
      }
      if (next <= this.minScale) {
        next = this.minScale;
      }
      this.scale = next;
      this.panzoom.smoothZoomAbs(x, y, next / 100);
    },
    onClickResetButton() {
      if (!this.panzoom) {
        return;
      }
      const { x, y } = this.panzoom.getTransform();
      this.panzoom.smoothZoomAbs(x, y, 1);
    },
    onInputZoomLevel(event) {
      if (!this.panzoom || event.inputType) {
        return;
      }
      const { x, y } = this.panzoom.getTransform();
      this.panzoom.smoothZoomAbs(x, y, this.scale / 100);
    },
    async buildTheMindMap() {
      this.rootNode = null;
      this.mindMapErrorMessage = null;
      this.mindMapGenerations = [];
      this.loadingMindMap = true;
      try {
        //Filter out messages for this specific talk
        this.validTextMappings = filterOutUnnecessaryTextMappings(this.validTextMappings, this.scenarioMindmapMessages);

        //Find the root node of the map
        let rootNodeFound = null;
        let alreadyAddedRoot = false;

        //Processing for template scenarios
        const talkData = this.scenarioTalks.find((obj) => {
          return obj.params.name === this.talkName;
        });

        if (talkData && TEMPLATE_TALK_IDS.includes(talkData.dataId)) {
          if (talkData.dataId in this.scenarioMindmap.specialTalkRootNodes) {
            alreadyAddedRoot = true;
            rootNodeFound = this.scenarioMindmap.specialTalkRootNodes[talkData.dataId];
            this.rootNode = rootNodeFound;
            this.mindMapGenerations.push([this.rootNode]);
            this.mindMapGenerations.push([this.scenarioMindmap.specialTalkFirstBotReply[talkData.dataId]]);
          } else {
            //Call the backend for the root node and save into state
            const payload = {
              talkId: talkData.dataId,
              scenario: this.scenarioId + "#" + this.versionId,
            };
            await this.getSpecialTalkFlowStart(payload);

            if (talkData.dataId in this.scenarioMindmap.specialTalkRootNodes) {
              alreadyAddedRoot = true;
              rootNodeFound = this.scenarioMindmap.specialTalkRootNodes[talkData.dataId];
              this.rootNode = rootNodeFound;
              this.mindMapGenerations.push([this.rootNode]);
              this.mindMapGenerations.push([this.scenarioMindmap.specialTalkFirstBotReply[talkData.dataId]]);
            }
          }
        } else {
          rootNodeFound = findTheRootNode(
            this.validTextMappings,
            this.scenarioMindmapMessages,
            this.scenarioTalks,
            this.talkName,
            this.userMessages
          );
        }

        if (rootNodeFound == null) {
          this.mindMapErrorMessage = "ルートノードが見つけられませんでした。";
        } else if ("errorMessage" in rootNodeFound) {
          this.mindMapErrorMessage = rootNodeFound.errorMessage;
        } else {
          if (!alreadyAddedRoot) {
            this.rootNode = rootNodeFound;
            //push the root node as the generation 0 of the mindmap
            this.mindMapGenerations.push([this.rootNode]);
          }

          const filteredScenarioMessages = cloneDeep(this.scenarioMessages).filter(
            (messages) => !this.onSaveDeleteTargetIds.includes(messages.dataId)
          );
          this.mindMapGenerations = await generateMindMap(
            this.rootNode,
            this.mindMapGenerations,
            this.scenarioMindmapMessages,
            this.validTextMappings,
            this.filteredScenarioTextMap,
            this.scenarioTalks,
            this.talkName,
            this.scenarioId + "#" + this.versionId,
            filteredScenarioMessages
          );

          this.tempMindMapForDrawing = cloneDeep(this.mindMapGenerations);
          this.createTheSVGNodes();
          this.drawTheSVGConnections();
          this.drawParentSVGIcons();
        }
      } catch (error) {
        console.log(error);
        this.mindMapErrorMessage = "予期せぬエラーが発生しました。";
      } finally {
        this.loadingMindMap = false;
        //Saving from state into messages for new messages that were created during mindmap building
        this.scenarioMindmapMessages = cloneDeep(this.scenarioMindmap[this.versionId][this.talkName]);
        this.validTextMappings = cloneDeep(this.scenarioMindmap[this.versionId].textMapping);
      }
    },
    //================================================================
    // Small helper functions for mindmap (visual processing)
    //================================================================
    //recenter the map using panzoom on a certain node
    // id: id of the node to center the map on
    // to center on root node, send 0 to method
    recenterMap(id) {
      const elem = document.getElementById("node." + id);
      if (elem) {
        this.panzoom.centerOn(elem);
      }
    },
    //delete the children of the svg group
    //effectively deleting the mindmap
    //call this whenever redrawing
    deleteMindMapChildren() {
      const myNode = document.getElementById("mindMapSVG");
      while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
      }
    },
    //================================================================
    // Helper functions for drawing on the map
    //================================================================
    createTheSVGNodes() {
      const mindmapNodes = cloneDeep(this.mindMapGenerations).flat();
      const drawBackGroundForCarouselGroupTargets = [];
      this.tempMindMapForDrawing.forEach((gen, genCounter) => {
        gen.forEach((elem, index) => {
          const parentElement = "parentId" in elem ? document.getElementById("node." + elem.parentId) : null;
          if (parentElement != null || genCounter === 0) {
            const tempTalk = cloneDeep(this.scenarioMindmap[this.versionId][this.talkName]);
            const nodeGroup = createSVGNode(elem, genCounter, this.tempMindMapForDrawing, parentElement);
            ["dataId", "mindmapId", "parentId", "postbackId", "generation", "branchIndex", "carouselIndex", "carouselKey"].forEach(
              (key) => {
                if (elem[key] != null) {
                  // NOTE: not ( null || undefined ) 0がfalsyなので回避
                  nodeGroup.setAttribute(`data-${key}`, elem[key]);
                }
              }
            );

            //This is a new message generated automatically by mindmap algorithm
            //Save the message to mindmap state
            if ("newMessage" in elem && !("dataId" in elem)) {
              const parentNode = this.tempMindMapForDrawing[genCounter - 1].find(
                (obj) => obj.mindmapId === elem.parentId
              );

              elem["scenario"] = this.scenarioId + "#" + this.versionId;
              this.setValueOfNodeInMindmap(elem, "scenario", elem["scenario"]);
              elem["dataId"] = generateUUID();
              this.setValueOfNodeInMindmap(elem, "dataId", elem["dataId"]);
              elem["talk"] = this.talkName;
              this.setValueOfNodeInMindmap(elem, "talk", elem["talk"]);

              if (parentNode && parentNode.type === "postback") {
                //If parent is a postback node with empty data and _shouldSetDataId, we set postback data to parent action
                const parentBotNodeIndex = this.tempMindMapForDrawing[genCounter - 2].findIndex(
                  (node) => node.mindmapId === parentNode.parentId
                );
                if (parentBotNodeIndex > -1 && this.tempMindMapForDrawing[genCounter - 2][parentBotNodeIndex].params) {
                  const { dataType, params } = this.tempMindMapForDrawing[genCounter - 2][parentBotNodeIndex];
                  let targetKey;
                  //Replace dataId in bubbleFlex if necessary
                  if (dataType == "bubbleFlex") {
                    replaceFirstIncompletePostbackActionInBubble(params, elem["dataId"])
                  }
                  if (params.columnCount) {
                    try {
                      console.log("parentNode:", parentNode);
                      console.log("carouselIndex:", parentNode.carouselIndex);
                      console.log("branchIndex:", parentNode.branchIndex);
                      console.log("columnCount:", params.columnCount);
                      console.log("actionCount:", params.actionCount);
                      console.log(
                        "targetKey:",
                        `action.${parentNode.carouselIndex}.${
                          parentNode.branchIndex - params.actionCount * parentNode.carouselIndex
                        }`
                      );
                    } catch (e) {}
                  }
                  if (
                    params.columnCount &&
                    params[
                      `action.${parentNode.carouselIndex}.${
                        parentNode.branchIndex - params.actionCount * parentNode.carouselIndex
                      }`
                    ] &&
                    params[
                      `action.${parentNode.carouselIndex}.${
                        parentNode.branchIndex - params.actionCount * parentNode.carouselIndex
                      }`
                    ]._shouldSetDataId
                  ) {
                    targetKey = `action.${parentNode.carouselIndex}.${
                      parentNode.branchIndex - params.actionCount * parentNode.carouselIndex
                    }`;
                  } else if (
                    params.actionCount &&
                    params[`actions.${parentNode.branchIndex}`] &&
                    params[`actions.${parentNode.branchIndex}`]._shouldSetDataId
                  ) {
                    targetKey = `actions.${parentNode.branchIndex}`;
                  } else if (params.actionLeft && params.actionLeft._shouldSetDataId) {
                    targetKey = "actionLeft";
                  } else if (params.actionRight && params.actionRight._shouldSetDataId) {
                    targetKey = "actionRight";
                  }
                  if (targetKey) {
                    delete this.tempMindMapForDrawing[genCounter - 2][parentBotNodeIndex].params[targetKey]
                      ._shouldSetDataId;
                    this.tempMindMapForDrawing[genCounter - 2][parentBotNodeIndex].params[targetKey].data =
                      elem["dataId"];
                  }

                  const tempParentBotNode = cloneDeep(this.tempMindMapForDrawing[genCounter - 2][parentBotNodeIndex]);
                  delete tempParentBotNode.mindmapId;
                  delete tempParentBotNode.parentId;
                  const targetScenarioMindmapIndex = tempTalk.findIndex(
                    (talk) => talk.dataId === tempParentBotNode.dataId
                  );
                  if (targetScenarioMindmapIndex > -1) {
                    tempTalk[targetScenarioMindmapIndex] = tempParentBotNode;
                  }

                  // NOTE: we should write back to keep replaced state
                  this.mindMapGenerations[genCounter - 2][parentBotNodeIndex] = cloneDeep(
                    this.tempMindMapForDrawing[genCounter - 2][parentBotNodeIndex]
                  );
                }
              }

              // delete elem.newMessage;
              // this.deleteValueOfNodeInMindmap(elem, "newMessage");

              //Save this message to scenarioMindMap[this.talkName] state
              //copy and get rid of the mind map only stuff
              const tempElem = cloneDeep(elem);
              delete tempElem.mindmapId;
              delete tempElem.parentId;
              // delete tempElem.newMessage;

              tempTalk.push(tempElem);
              const payload = {
                versionName: this.versionId,
                value: tempTalk,
                valueName: this.talkName,
              };
              this.updateMindMapMessages(payload);

              if (parentNode && parentNode.type === "message") {
                //If parent is a text node, then save text mapping to scenarioMindMap.textMapping state
                const tempTextMapping = cloneDeep(this.scenarioMindmap[this.versionId].textMapping);
                tempTextMapping[parentNode.value] = elem.dataId;
                const textMappingPayload = {
                  versionName: this.versionId,
                  value: tempTextMapping,
                  valueName: "textMapping",
                };
                this.updateMindMapMessages(textMappingPayload);
              }
            }

            //If carouselIndex exists then drawing the actions of a carousel message
            //Only need to draw the base rectangle when drawing the first action of each
            //Individual bubble in the carousel
            if ("carouselIndex" in elem && elem.firstActionOfCarouselGroup) {
              // NOTE: 最終的なノード間の距離を考慮する必要があるので、計算を遅延させる
              drawBackGroundForCarouselGroupTargets.push({
                elem,
                genCounter,
                nodeGroup,
              });
            }

            //If messageLinkToOtherTalk in element, then this element has a relation to another talk
            //Create the talk icon, append to mindMapSVG and add event listener
            if ("messageLinkToOtherTalk" in elem) {
              const talkLink = drawIconForNode(nodeGroup, "messageLinkToOtherTalk");
              talkLink.addEventListener("click", this.moveToTalk.bind(null, elem.linkedTalk), false);

              nodeGroup.appendChild(talkLink);
            }

            //If linkToAncestor in element, then this element is a looped scenario
            //Create the icon, append to mindMapSVG and add event listener
            if ("linkToAncestor" in elem) {
              const childNode = mindmapNodes.find((node) => node.parentId === elem.mindmapId);
              const hasToggleButton = childNode && childNode.expandNode != null;
              const ancestorItem = drawIconForLinkedNode(nodeGroup, "linkToAncestor", hasToggleButton);
              let highlightList = [elem.linkedNode, elem.mindmapId];
              ancestorItem.setAttribute("data-links", JSON.stringify(highlightList));
              ancestorItem.addEventListener(
                "click",
                this.highlightListOfElems.bind(null, highlightList, highlightList.length - 1),
                false
              );
              nodeGroup.appendChild(ancestorItem);
            }

            //If linkInsideTree in element, then this element is already displayed in mindmap
            //Create the icon, append to mindMapSVG and add event listener
            if ("linkInsideTree" in elem) {
              const childNode = mindmapNodes.find((node) => node.parentId === elem.mindmapId);
              const hasToggleButton = childNode && childNode.expandNode != null;
              const linkedItem = drawIconForLinkedNode(nodeGroup, "linkInsideTree", hasToggleButton);
              let highlightList = [elem.linkedNode, elem.mindmapId];
              linkedItem.setAttribute("data-links", JSON.stringify(highlightList));
              linkedItem.addEventListener(
                "click",
                this.highlightListOfElems.bind(null, highlightList, highlightList.length - 1),
                false
              );
              nodeGroup.appendChild(linkedItem);
            }

            nodeGroup.addEventListener("click", this.onClickNode.bind(null, elem), false);
            document.getElementById("mindMapSVG").appendChild(nodeGroup);

            //Check if the node has multiple children
            if ("expandNode" in elem) {
              if (elem.dataType === "text") {
                this.deleteValueOfNodeInMindmap(elem, "expandNode");
              } else {
                const expandBox = drawExpandElement(nodeGroup, elem, genCounter);
                expandBox.addEventListener("click", this.toggleExpand.bind(null, elem), false);
                nodeGroup.appendChild(expandBox);
              }
            } else if (genCounter !== this.tempMindMapForDrawing.length - 1) {
              const childGen = this.tempMindMapForDrawing[genCounter + 1];
              const children = childGen.filter((obj) => obj.parentId === elem.mindmapId);
              if (children.length > 1) {
                this.setValueOfNodeInMindmap(elem, "expandNode", true);
                elem["expandNode"] = true;
                const expandBox = drawExpandElement(nodeGroup, elem, genCounter);
                expandBox.addEventListener("click", this.toggleExpand.bind(null, elem), false);
                nodeGroup.appendChild(expandBox);
              }
            }
          }
        });
        genCounter++;
      });
      drawBackGroundForCarouselGroupTargets.forEach((target) => {
        const { elem, genCounter, nodeGroup } = target;
        const background = drawBackGroundForCarouselGroup(elem, genCounter, this.tempMindMapForDrawing, nodeGroup);
        const svg = document.getElementById("mindMapSVG");
        if (svg && svg.firstChild && background) {
          svg.insertBefore(background, svg.firstChild);
        }
      });
    },
    drawTheSVGConnections() {
      for (let x = this.tempMindMapForDrawing.length - 1; x > 0; x--) {
        const currentGenNodes = this.tempMindMapForDrawing[x];
        const parentGenNodes = this.tempMindMapForDrawing[x - 1];
        currentGenNodes.forEach((childNode) => {
          const parentNode = parentGenNodes.find((obj) => {
            return obj.mindmapId === childNode.parentId;
          });
          if (childNode && parentNode) {
            const childElement = document.getElementById("node." + childNode.mindmapId);
            const parentElement = document.getElementById("node." + parentNode.mindmapId);
            if (!childElement || !parentElement) {
              // NOTE: may be collapsed element.
              return;
            }
            const line = drawSVGConnection(childElement.children[0], parentElement.children[0], parentNode, childNode);
            document.getElementById("mindMapSVG").appendChild(line);
          }
        });
      }
    },
    //Draw icons on the linked nodes (ancestor or previously drawn on map)
    drawParentSVGIcons() {
      const listOfNodesWithLinks = [];
      const listOfNodesWithLoops = [];
      const listOfLinkedNodes = [];
      const listOfLoopedNodes = [];
      const mindmapNodes = cloneDeep(this.mindMapGenerations).flat();
      this.mindMapGenerations.forEach((gen) => {
        gen.forEach((node) => {
          if ("linkInsideTree" in node) {
            listOfNodesWithLinks.push(node);
            if (!listOfLinkedNodes.includes(node.linkedNode)) {
              listOfLinkedNodes.push(node.linkedNode);
            }
          }
          if ("linkToAncestor" in node) {
            listOfNodesWithLoops.push(node);
            if (!listOfLoopedNodes.includes(node.linkedNode)) {
              listOfLoopedNodes.push(node.linkedNode);
            }
          }
        });
      });
      listOfLinkedNodes.forEach((linkNodeId) => {
        const nodeGroup = document.getElementById("node." + linkNodeId);
        if (nodeGroup) {
          const currentNode = mindmapNodes.find((node) => node.mindmapId === linkNodeId);
          const hasToggleButton = currentNode && currentNode.expandNode != null;
          const linkIcon = drawIconForLinkedNode(nodeGroup, "linkInsideTree", hasToggleButton);
          let mappedNodeIds = listOfNodesWithLinks
            .filter((obj) => {
              return obj.linkedNode === linkNodeId;
            })
            .map((node) => {
              return node.mindmapId;
            });
          mappedNodeIds.push(linkNodeId);
          linkIcon.setAttribute("data-links", JSON.stringify(mappedNodeIds));
          linkIcon.addEventListener(
            "click",
            this.highlightListOfElems.bind(null, mappedNodeIds, mappedNodeIds.length - 1),
            false
          );
          nodeGroup.appendChild(linkIcon);
        }
      });
      listOfLoopedNodes.forEach((linkNodeId) => {
        const nodeGroup = document.getElementById("node." + linkNodeId);
        if (nodeGroup) {
          const currentNode = mindmapNodes.find((node) => node.mindmapId === linkNodeId);
          const hasToggleButton = currentNode && currentNode.expandNode != null;
          const linkIcon = drawIconForLinkedNode(nodeGroup, "linkToAncestor", hasToggleButton);
          let mappedNodeIds = listOfNodesWithLoops
            .filter((obj) => {
              return obj.linkedNode === linkNodeId;
            })
            .map((node) => {
              return node.mindmapId;
            });
          mappedNodeIds.push(linkNodeId);
          linkIcon.setAttribute("data-links", JSON.stringify(mappedNodeIds));
          linkIcon.addEventListener(
            "click",
            this.highlightListOfElems.bind(null, mappedNodeIds, mappedNodeIds.length - 1),
            false
          );
          nodeGroup.appendChild(linkIcon);
        }
      });
    },
    //================================================================
    // General helper functions for component
    //================================================================
    setValueOfNodeInMindmap(elem, attribute, value) {
      //helper function to set an attribute in mindmap using clone deep
      let genCounter = 0;
      this.mindMapGenerations.some((gen) => {
        let mappedGen = gen.map((node) => {
          return node.mindmapId;
        });
        let indexOfToggledNode = mappedGen.indexOf(elem.mindmapId);
        if (indexOfToggledNode >= 0) {
          const tempNode = cloneDeep(this.mindMapGenerations[genCounter][indexOfToggledNode]);
          tempNode[attribute] = value;
          this.mindMapGenerations[genCounter][indexOfToggledNode] = cloneDeep(tempNode);
          return true;
        }
        genCounter++;
      });
    },
    deleteValueOfNodeInMindmap(elem, attribute) {
      //helper function to delete an attribute in mindmap using clone deep
      let genCounter = 0;
      this.mindMapGenerations.some((gen) => {
        let mappedGen = gen.map((node) => {
          return node.mindmapId;
        });
        let indexOfToggledNode = mappedGen.indexOf(elem.mindmapId);
        if (indexOfToggledNode >= 0) {
          delete this.mindMapGenerations[genCounter][indexOfToggledNode][attribute];
          return true;
        }
        genCounter++;
      });
    },
    toggleValueOfNodeInMindmap(elem, attribute) {
      //helper function to toggle an attribute in mindmap using clone deep
      let genCounter = 0;
      this.mindMapGenerations.some((gen) => {
        let mappedGen = gen.map((node) => {
          return node.mindmapId;
        });
        let indexOfToggledNode = mappedGen.indexOf(elem.mindmapId);
        if (indexOfToggledNode >= 0) {
          const tempNode = cloneDeep(this.mindMapGenerations[genCounter][indexOfToggledNode]);
          tempNode[attribute] = !tempNode[attribute];
          this.mindMapGenerations[genCounter][indexOfToggledNode] = cloneDeep(tempNode);
          return true;
        }
        genCounter++;
      });
    },
    expandMindMapToDisplayNode(elementId) {
      let genCounter = 0;
      let indexOfElem = 0;
      this.mindMapGenerations.some((gen) => {
        const mindMapIds = gen.map((a) => a.mindmapId);
        let indexOfElement = mindMapIds.indexOf(parseInt(elementId));
        if (indexOfElement >= 0) {
          indexOfElem = indexOfElement;
          return true;
        }
        genCounter++;
      });
      let parentNodeId = this.mindMapGenerations[genCounter][indexOfElem].parentId;
      for (let x = genCounter - 1; x > 0; x--) {
        let parentNode = this.mindMapGenerations[x].find((obj) => obj.mindmapId === parentNodeId);
        if ("expandNode" in parentNode && !parentNode.expandNode) {
          this.toggleValueOfNodeInMindmap(parentNode, "expandNode");
        }
        parentNodeId = parentNode.parentId;
      }
    },
    redrawMapForExpandCollapse(elementId = null) {
      const innerSvg = document.getElementById("mindMapSVG");
      let innerRectSnapshot;
      if (innerSvg) {
        innerRectSnapshot = innerSvg.getBoundingClientRect();
      }

      this.deleteMindMapChildren();
      this.tempMindMapForDrawing = getCollapsedMindmapForDrawing(this.mindMapGenerations);

      this.createTheSVGNodes();
      this.drawTheSVGConnections();
      this.drawParentSVGIcons();

      if (this.activeItem) {
        const editItem = this.renderActiveNodeBorder(this.activeItem);
        if (editItem) {
          this.editItem = editItem;
        }
      }

      if (elementId != null && innerRectSnapshot) {
        const innerSvg = document.getElementById("mindMapSVG");
        const node = document.getElementById(`node.${elementId}`);
        if (!innerSvg || !node) {
          // NOTE: fallback;
          this.recenterMap(elementId);
          return;
        }

        const innerRect = innerSvg.getBoundingClientRect();
        const svg = document.getElementById("svgElem");
        const rect = node.querySelector("rect[height]");
        if (!svg || !rect) {
          // NOTE: fallback;
          this.recenterMap(elementId);
          return;
        }

        const svgPos = svg.getBoundingClientRect();
        const nodePos = node.getBoundingClientRect();
        const viewportOffset = {
          x: nodePos.x - svgPos.x,
          y: nodePos.y - svgPos.y,
        };
        const transform = this.panzoom.getTransform();
        this.panzoom.moveTo(
          viewportOffset.x - rect.x.baseVal.value * transform.scale,
          viewportOffset.y + (innerRectSnapshot.height - innerRect.height) / 2 - rect.y.baseVal.value * transform.scale
        );
      }
    },
    redrawFromRoot(elementRootText) {
      this.deleteMindMapChildren();
      this.mindMapGenerations[0][0].value = elementRootText;
      this.tempMindMapForDrawing = cloneDeep(this.mindMapGenerations);
      this.rootNode.value = elementRootText;

      this.createTheSVGNodes();
      this.drawTheSVGConnections();
      this.drawParentSVGIcons();
      this.recenterMap(0);
    },
    async updateScenarioMessage(
      oldState,
      newState,
      updatedMessage,
      clearActiveItem = true,
      clearLinkItem = true,
      clearLinkHighlight = true
    ) {
      this.previousState = {
        scenarioMindmapMessages: oldState,
        onSaveDeleteTargetIds: cloneDeep(this.onSaveDeleteTargetIds),
        validTextMappings: cloneDeep(this.validTextMappings),
      };
      this.nextState = null;

      this.deleteMindMapChildren();

      let index = 0;
      for (index; index < this.mindMapGenerations.length; index++) {
        const tempMessageCheck = this.mindMapGenerations[index].find(
          (obj) => obj.mindmapId === updatedMessage.mindmapId
        );
        if (tempMessageCheck) {
          break;
        }
      }

      const innerIndex = this.mindMapGenerations[index].findIndex((x) => x.mindmapId === updatedMessage.mindmapId);
      this.mindMapGenerations[index][innerIndex] = updatedMessage;
      this.mindMapGenerations = this.mindMapGenerations.slice(0, index + 1);

      const filteredScenarioMessages = cloneDeep(this.scenarioMessages).filter(
        (messages) => !this.onSaveDeleteTargetIds.includes(messages.dataId)
      );
      this.mindMapGenerations = await generateMindMap(
        this.rootNode,
        this.mindMapGenerations,
        this.scenarioMindmapMessages,
        this.validTextMappings,
        this.filteredScenarioTextMap,
        this.scenarioTalks,
        this.talkName,
        this.scenarioId + "#" + this.versionId,
        filteredScenarioMessages
      );

      this.tempMindMapForDrawing = cloneDeep(this.mindMapGenerations);

      this.createTheSVGNodes();
      this.drawTheSVGConnections();
      this.drawParentSVGIcons();
      this.recenterMap(updatedMessage.mindmapId);

      this.scenarioMindmapMessages = cloneDeep(this.scenarioMindmap[this.versionId][this.talkName]);
      this.validTextMappings = cloneDeep(this.scenarioMindmap[this.versionId].textMapping);

      if (clearActiveItem) {
        this.clearActiveItem();
      }
      if (clearLinkItem) {
        this.clearLinkItem();
      }
      if (clearLinkHighlight) {
        this.unhighightLinks();
      }
    },
    //================================================================
    // Mindmap click event handlers
    //================================================================
    //Function for expanding/collapsing a node on the mindmap
    toggleExpand(elem, event) {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      if (elem.expandNode != null) {
        console.log("toggleExpand:", elem);
        this.toggleValueOfNodeInMindmap(elem, "expandNode");
        console.log("nextMindMapGenerations:", this.mindMapGenerations);
        this.redrawMapForExpandCollapse(elem.mindmapId);
      }
    },
    //Highlight a list of element ids
    highlightListOfElems(nodeIdsToHighlight, nodeToCenterOn, event) {
      event.stopPropagation();
      this.unhighightLinks(null);

      //first expand all elements that need expanding
      nodeIdsToHighlight.forEach((id) => {
        const elem = document.getElementById("node." + id);
        if (!elem) {
          this.expandMindMapToDisplayNode(id);
        }
      });
      //redraw map
      this.redrawMapForExpandCollapse(nodeIdsToHighlight[nodeToCenterOn].mindmapId);
      //highlight the nodes
      nodeIdsToHighlight.forEach((id) => {
        const tempElemId = "node." + id;
        this.highlightedNodes.push(tempElemId);
        const elem = document.getElementById(tempElemId);
        if (elem) {
          elem.setAttribute("filter", "url(#linkhighlight)");
        }
      });
    },
    clearNodeClickHandler() {
      console.log("clearNodeClickHandler:", this.nodeClickHandler);
      clearTimeout(this.nodeClickHandler);
      this.nodeClickHandler = null;
    },
    clearActiveItem() {
      console.log("clearActiveItem:", this.activeItem);
      if (!this.activeItem) {
        return;
      }
      const targets = document.querySelectorAll('.node[filter="url(#activenode)"]');
      if (targets) {
        Array.from(targets).forEach((target) => {
          if (target.classList.contains("user")) {
            target.setAttribute("filter", "");
          } else if (target.classList.contains("bot")) {
            target.setAttribute("filter", "url(#botnode)");
          }
        });
      }
      this.activeItem = null;
    },
    clearLinkItem() {
      console.log("clearLinkItem:", this.linkItem);
      if (!this.linkItem) {
        return;
      }
      const targets = document.querySelectorAll('.node[filter="url(#linknode)"]');
      if (targets) {
        Array.from(targets).forEach((target) => {
          if (target.classList.contains("user")) {
            target.setAttribute("filter", "");
          } else if (target.classList.contains("bot")) {
            target.setAttribute("filter", "url(#botnode)");
          }
        });
      }
      this.linkItem = null;
    },
    //function for unhighlighting any nodes currently highlighted
    unhighightLinks() {
      console.log("MOHEMOHE", "unhighightLinks()", "activeItem:", this.activeItem);
      const targets = document.querySelectorAll('.node[filter="url(#linkhighlight)"]');
      if (targets) {
        Array.from(targets).forEach((target) => {
          if (target.classList.contains("user")) {
            target.setAttribute("filter", "");
          } else if (target.classList.contains("bot")) {
            target.setAttribute("filter", "url(#botnode)");
          }
        });
      }
      this.highlightedNodes = [];
    },
    //function to rebuild mindmap using a new talk
    moveToTalk(moveToTalkName) {
      if (!(moveToTalkName in this.scenarioMindmap[this.versionId])) {
        this.saveTalkMessagesIntoMindmap(moveToTalkName);
      }
      this.talkName = moveToTalkName;
      this.$router.push({
        name: "ScenarioMindmapPage",
        params: {
          scenarioId: this.scenarioId,
          versionId: this.versionId,
          talkName: moveToTalkName,
        },
      });
      this.buildMindMapFromNewTalk();
    },
    //function for editing/node was clicked
    onClickNode(elem, event) {
      console.log("clicking to select element", elem, event);
      event.stopPropagation();
      if (this.nodeClickHandler) {
        this.clearNodeClickHandler();
        return this.onDoubleClickNode(elem, event);
      }
      this.nodeClickHandler = setTimeout(() => {
        this.clearNodeClickHandler();
        this.onSingleClickNode(elem, event);
      }, DOUBLE_CLICK_TIMEOUT_MILLI_SEC);
    },
    asyncSleep(timeout) {
      return new Promise((resolve) => setTimeout(() => resolve(), timeout));
    },
    async onSingleClickNode(elem, event) {
      if (event.shiftKey) {
        return this.onShiftSingleClickNode(elem, event);
      }

      if (this.activeItem && this.activeItem.mindmapId !== elem.mindmapId) {
        this.clearActiveItem();
        this.clearLinkItem();
        this.unmarkDeleteNode();
      }
      if (this.editItem && this.editItem.mindmapId !== elem.mindmapId && this.editItem.mindmapId !== elem.parentId) {
        this.unhighightLinks();
      }

      console.log("active ->", elem);
      this.activeItem = elem;

      const editItem = this.renderActiveNodeBorder(this.activeItem);
      const { branchIndex } = editItem;

      const beforeEditItem = cloneDeep(this.editItem || {});
      if (editItem) {
        delete editItem.branchIndex;
        if (this.editItem) {
          this.toggleRootMessageDrawer(true);
          this.togglePropertyDrawer(true);
          if (this.editItem.dataId !== editItem.dataId) {
            this.editItem = null;
          }
          await this.asyncSleep(250);
        }
        this.editItem = editItem;
        if (branchIndex) {
          setTimeout(
            () => {
              this.editItem = { ...this.editItem, branchIndex };
            },
            beforeEditItem.dataId === editItem.dataId ? 0 : 300
          );
        }
      }

      if (this.editItem.dataId || this.editItem.mindmapId === 0 || this.editItem.mindmapId === "0") {
        if (this.editItem.mindmapId === 0 || this.editItem.mindmapId === "0") {
          this.editItem["rootId"] = this.mindMapGenerations[0][0].dataId;
        }
        this.editProperties = true;
      } else {
        this.editProperties = false;
      }
    },
    renderActiveNodeBorder(elem) {
      let editItem;
      const target = document.getElementById(`node.${elem.mindmapId}`);
      if (target) {
        const elements = cloneDeep(this.mindMapGenerations).flat();
        console.log("elements:", elements);
        if (elem.mindmapId === 0) {
          editItem = cloneDeep(elem);
          target.setAttribute("filter", "url(#activenode)");
        } else if (target.classList.contains("user")) {
          const parent = elements.find((element) => element.mindmapId === elem.parentId);
          if (parent) {
            editItem = { ...cloneDeep(parent), branchIndex: elem.branchIndex };
            const parentNode = document.getElementById(`node.${parent.mindmapId}`);
            if (parentNode) {
              parentNode.setAttribute("filter", "url(#activenode)");
            }
            elements
              .filter((element) => element.parentId === parent.mindmapId)
              .forEach((child) => {
                const node = document.getElementById(`node.${child.mindmapId}`);
                if (node) {
                  node.setAttribute("filter", "url(#activenode)");
                }
              });
          }
        } else {
          editItem = cloneDeep(elem);
          target.setAttribute("filter", "url(#activenode)");
          elements
            .filter((element) => element.parentId === elem.mindmapId)
            .forEach((child) => {
              const node = document.getElementById(`node.${child.mindmapId}`);
              if (node) {
                node.setAttribute("filter", "url(#activenode)");
              }
            });
        }
      }
      return editItem;
    },
    onShiftSingleClickNode(elem) {
      if (elem.dataType === "__INITIAL__") {
        this.$snackbar.show({
          text: "初期状態のノードには関連付けできません",
          type: "error",
        });
        return;
      }

      const from = document.getElementById(`node.${this.editItem.mindmapId}`);
      const to = document.getElementById(`node.${elem.mindmapId}`);
      if (!from || !to || !to.classList.contains("bot")) {
        return;
      }
      if (!ALLOW_LINK_DATA_TYPES.includes(this.editItem.dataType)) {
        this.$snackbar.show({
          text:
            "関連付けの設定は元ノードが " +
            ALLOW_LINK_DATA_TYPES.join(" / ") +
            (ALLOW_LINK_DATA_TYPES.length > 1 ? " のいずれか" : " ") +
            "である必要があります",
          type: "error",
        });
        return;
      }

      let currentLinkKey;
      if (this.linkItem) {
        // NOTE: すでに選択されているもので上書きする
        currentLinkKey = Object.keys(this.editItem.params)
          .filter((key) => key.startsWith("actions"))
          .find((key) => this.editItem.params[key].data === this.linkItem.dataId);
        if (currentLinkKey) {
          this.clearLinkItem();
        }
      }

      let { actionCount } = this.editItem.params;
      if (!currentLinkKey && actionCount === 4) {
        this.$snackbar.show({
          text: "アクションの数が上限に達しているため関連付けできません",
          type: "error",
        });
        return;
      }

      console.log("link ->", elem);
      this.linkItem = elem;

      to.setAttribute("filter", "url(#linknode)");
      const targetDataId = this.linkItem.dataId;
      if (currentLinkKey) {
        this.editItem.params[currentLinkKey] = {
          ...this.editItem.params[currentLinkKey],
          label: this.linkItem.nameLBD,
          text: this.linkItem.nameLBD,
          type: "postback",
          data: targetDataId,
        };
      } else {
        actionCount++;
        this.editItem.params.actionCount = actionCount;
        this.editItem.params[`actions.${actionCount - 1}`] = {
          ...this.activeItem.params[`actions.${actionCount - 1}`],
          label: this.linkItem.nameLBD,
          text: this.linkItem.nameLBD,
          type: "postback",
          data: targetDataId,
        };
      }
      console.log("updated activeItem:", this.editItem);
      this.editItem = { ...this.editItem, branchIndex: actionCount - 1 };
    },
    onDoubleClickNode(elem, event) {
      console.log("double click element", elem, event);
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      this.toggleExpand(elem);
    },
    onClickSVGContainer() {
      this.clearNodeClickHandler();
    },
    stopProperties(value) {
      this.editProperties = value;
      this.editItem = value ? this.activeItem : null;
      this.clearActiveItem();
      this.clearLinkItem();
    },
    updateEditState(value) {
      this.isChangingEditItem = value;
    },
    //================================================================
    // Fetching methods for refresh on mindmap
    //================================================================
    saveTalkMessagesIntoMindmap(talkNameToSave) {
      //Get the messages that belong to a talk and save into mindmap

      //Fetch the talk (list of user/bot messages)
      const talkValue = this.scenarioTalks.find((obj) => {
        return obj.params.name === talkNameToSave;
      });

      if (talkValue) {
        const listOfIds = [];

        //Get all the ids of bot messages
        //This will become legacy code after importing from lbd is deprecated
        //Need it for existing scenarios
        talkValue.params.messages.forEach((message) => {
          if (message.sender === "BOT") {
            listOfIds.push(message.messageId);
          }
        });

        //Filter through the messages to look for a talk property
        //This is used when messages are created through a mindmap (ie, not import)
        this.scenarioMessages.forEach((message) => {
          if ("talk" in message && message.talk === talkNameToSave) {
            listOfIds.push(message.dataId);
          }
        });

        const messages = this.scenarioMessages.filter((message) => {
          return listOfIds.includes(message.dataId);
        });
        const payload = {
          versionName: this.versionId,
          value: messages,
          valueName: talkNameToSave,
        };

        this.updateMindMapMessages(payload);
      }
    },
    async fetchProperties(force) {
      const payload = {
        scenarioId: this.scenarioId,
        versionId: this.versionId,
      };
      await this.getDataForDetails(payload);
      const textMapPayload = {
        versionName: this.versionId,
        valueName: "textMapping",
        value: (this.validScenarioTextMap || this.scenarioTextMap).textMapping,
      };
      await this.updateMindMapMessages(textMapPayload);

      this.saveTalkMessagesIntoMindmap(this.talkName);

      if (this.talkName in this.scenarioMindmap[this.versionId]) {
        this.buildMindMapFromNewTalk();
      } else {
        this.mindMapErrorMessage = "「" + this.talkName + "」というトークを見つけられませんでした。";
        this.loadingMindMap = false;
      }
    },
    onResizeWindow() {
      if (!this.$refs.svgContainer) {
        // NOTE: we need fallback to avoid blank page.
        this.svgHeight = 500;
      }
      this.svgHeight = this.$refs.svgContainer.clientHeight;
    },
    toggleRootMessageDrawer(open = null) {
      try {
        if (open === true) {
          this.$refs["root-drawer"].$el.classList.remove("drawer-shrink");
          return true;
        }
        if (open === false) {
          this.$refs["root-drawer"].$el.classList.add("drawer-shrink");
          return true;
        }
        this.$refs["root-drawer"].$el.classList.toggle("drawer-shrink");
        return true;
      } catch (e) {
        console.warn("root-drawer has not been rendered:", e);
      }
      return false;
    },
    togglePropertyDrawer(open = null) {
      try {
        if (open === true) {
          this.$refs["property-drawer"].$el.classList.remove("drawer-shrink");
          return true;
        }
        if (open === false) {
          this.$refs["property-drawer"].$el.classList.add("drawer-shrink");
          return true;
        }
        this.$refs["property-drawer"].$el.classList.toggle("drawer-shrink");
        return true;
      } catch (e) {
        console.warn("property-drawer has not been rendered:", e);
      }
      return false;
    },
    onSvgContainerMouseDown(event) {
      if (event.target.id !== "svgElem") {
        return;
      }

      if (event.targetTouches && event.targetTouches.length > 0) {
        const [touch] = event.targetTouches;
        this.lastClickPosition = {
          x: touch.screenX,
          y: touch.screenY,
        };
      } else {
        this.lastClickPosition = {
          x: event.screenX,
          y: event.screenY,
        };
      }
      console.log("onSvgContainerMouseDown:", this.lastClickPosition);
    },
    onSvgContainerMouseUp(event) {
      if (event.target.id !== "svgElem") {
        return;
      }

      let currentPosition;
      if (event.targetTouches && event.targetTouches.length > 0) {
        const [touch] = event.targetTouches;
        currentPosition = {
          x: touch.screenX,
          y: touch.screenY,
        };
      } else {
        currentPosition = {
          x: event.screenX,
          y: event.screenY,
        };
      }
      console.log("onSvgContainerMouseUp:", this.lastClickPosition, "->", currentPosition);

      if (isEqual(currentPosition, this.lastClickPosition)) {
        if (this.editProperties && this.isChangingEditItem) {
          this.$dialog.show({
            title: "アクションの編集を終了してもよろしいですか？",
            text: "行った変更は破棄されます。",
            btnConfirmTitle: "はい",
            onConfirm: () => {
              this.isChangingEditItem = false;
              this.editItem = null;
              this.editProperties = false;
              this.clearActiveItem();
              this.clearLinkItem();
              this.unmarkDeleteNode();
              this.unhighightLinks();
            },
          });
        } else {
          this.editItem = null;
          this.editProperties = false;
          this.clearActiveItem();
          this.clearLinkItem();
          this.unmarkDeleteNode();
          this.unhighightLinks();
        }
      }
    },
    onClickSaveButton() {
      const originalTalkId = this.getTalkIdFromName();
      this.newTalkUUID = originalTalkId;

      const payload = {
        scenarioId: this.scenarioId,
        versionId: this.versionId,
        name: this.talkName,
        scenario: this.scenarioId + "#" + this.versionId,
        messages: this.scenarioMindmapMessages,
        generations: this.mindMapGenerations,
        onSaveDeleteTargetIds: this.onSaveDeleteTargetIds || [],
        newTalkId: this.newTalkUUID,
      };
      this.saveTalkNodes(payload);
    },
    onClickDeleteButton() {
      if (!this.editItem) {
        return;
      }

      if (this.deleteTargets.length > 0) {
        return this.deleteNodes();
      }

      const nextMindmapMessages = cloneDeep(this.mindMapGenerations).flat();
      const deleteRootElem = this.editItem;
      const deleteTargets = deleteElements(nextMindmapMessages, deleteRootElem);
      if (deleteTargets instanceof Error) {
        if (deleteTargets.message === LINKED_NODE_DELETE_ERROR) {
          this.$snackbar.show({ text: "関連付けを含むノードは削除できません", type: "error" });
          return;
        }
        // NOTE: ここには来ないはずだが未知のErrorが返ってきたときのために定義
        this.$snackbar.show({ text: "削除範囲の検出に失敗しました", type: "error" });
        return;
      }
      this.deleteTargets = deleteTargets;

      this.markDeleteNode();
      this.$snackbar.show({ text: "もう一度削除ボタンをクリックすると削除します", type: "warn" });
    },
    markDeleteNode() {
      if (Array.isArray(this.deleteTargets)) {
        this.deleteTargets.forEach((deleteTarget) => {
          const element = document.getElementById(`node.${deleteTarget.mindmapId}`);
          if (element) {
            element.classList.add("delete-target");
          }
        });
      }
    },
    unmarkDeleteNode() {
      const nodes = document.getElementsByClassName("delete-target");
      if (nodes) {
        Array.from(nodes).forEach((node) => node.classList.remove("delete-target"));
      }
      this.deleteTargets = [];
    },
    deleteNodes() {
      if (this.deleteTargets.length === 0) {
        return;
      }

      this.previousState = {
        scenarioMindmapMessages: cloneDeep(this.scenarioMindmapMessages),
        onSaveDeleteTargetIds: cloneDeep(this.onSaveDeleteTargetIds),
        validTextMappings: cloneDeep(this.validTextMappings),
      };

      const targetBotNodeDataIds = cloneDeep(this.deleteTargets)
        .filter((target) => target.dataId)
        .map((target) => target.dataId);

      const nextScenarioMindmapMessages = cloneDeep(this.scenarioMindmapMessages).filter(
        (message) => !targetBotNodeDataIds.includes(message.dataId)
      );

      const firstChildNode = cloneDeep(this.deleteTargets).find((node) => node.parentId === 0);
      if (firstChildNode) {
        const firstChildNodeIndex = targetBotNodeDataIds.findIndex((dataId) => dataId === firstChildNode.dataId);
        targetBotNodeDataIds.splice(firstChildNodeIndex, 1);
        const cleanFirstNode = {
          ...firstChildNode,
          dataType: "__INITIAL__",
          nameLBD: "",
          newMessage: true,
          params: {
            text: "",
          },
        };
        delete cleanFirstNode.expandNode;
        nextScenarioMindmapMessages.push(cleanFirstNode);
      }

      const nextValidTextMappings = cloneDeep(this.validTextMappings);
      Object.keys(nextValidTextMappings).forEach((key) => {
        if (targetBotNodeDataIds.includes(nextValidTextMappings[key])) {
          delete nextValidTextMappings[key];
        }
      });

      const deleteOriginNode = cloneDeep(this.deleteTargets).shift();
      const currentMindMapFlatGenerations = cloneDeep(this.mindMapGenerations).flat();
      const parentUserNode = currentMindMapFlatGenerations.find((node) => node.mindmapId === deleteOriginNode.parentId);
      if (parentUserNode && parentUserNode.type === "postback") {
        const parentBotNode = currentMindMapFlatGenerations.find((node) => node.mindmapId === parentUserNode.parentId);
        const parentBotNodeIndex = nextScenarioMindmapMessages.findIndex(
          (node) => node.dataId === parentBotNode.dataId
        );
        if (parentBotNodeIndex > -1) {
          //For BubbleFlex Messages On Delete
          deletePostbackActionFromBubbleFlexParams(nextScenarioMindmapMessages[parentBotNodeIndex].params, deleteOriginNode);
          let targetKey;
          if (nextScenarioMindmapMessages[parentBotNodeIndex].params.columnCount) {
            targetKey = `action.${parentUserNode.carouselIndex}.${
              parentUserNode.branchIndex -
              nextScenarioMindmapMessages[parentBotNodeIndex].params.columnCount * parentUserNode.carouselIndex
            }`;
          } else if (nextScenarioMindmapMessages[parentBotNodeIndex].params.actionCount) {
            targetKey = `actions.${parentUserNode.branchIndex}`;
          } else if (
            nextScenarioMindmapMessages[parentBotNodeIndex].params.actionLeft ||
            nextScenarioMindmapMessages[parentBotNodeIndex].params.actionRight
          ) {
            targetKey = parentUserNode.branchIndex === 0 ? "actionLeft" : "actionRight";
          }
          if (targetKey && nextScenarioMindmapMessages[parentBotNodeIndex].params[targetKey]) {
            nextScenarioMindmapMessages[parentBotNodeIndex].params[targetKey].data = "";
            nextScenarioMindmapMessages[parentBotNodeIndex].params[targetKey]._shouldSetDataId = true;
          }
        }
      }
      this.onSaveDeleteTargetIds.push(...targetBotNodeDataIds);

      this.validTextMappings = cloneDeep(nextValidTextMappings);
      this.scenarioMindmap[this.versionId].textMapping = cloneDeep(nextValidTextMappings);

      this.scenarioMindmap[this.versionId][this.talkName] = cloneDeep(nextScenarioMindmapMessages);
      this.scenarioMindmapMessages = cloneDeep(nextScenarioMindmapMessages);

      this.nextState = null;

      this.editProperties = false;
      this.unmarkDeleteNode();
      this.reRenderSVG();
    },
    onClickUndoButton() {
      this.nextState = {
        scenarioMindmapMessages: cloneDeep(this.scenarioMindmapMessages),
        onSaveDeleteTargetIds: cloneDeep(this.onSaveDeleteTargetIds),
        validTextMappings: cloneDeep(this.validTextMappings),
      };
      this.replaceState(this.previousState);
      this.previousState = null;

      this.editProperties = false;
      this.reRenderSVG();
    },
    onClickRedoButton() {
      this.previousState = {
        scenarioMindmapMessages: cloneDeep(this.scenarioMindmapMessages),
        onSaveDeleteTargetIds: cloneDeep(this.onSaveDeleteTargetIds),
        validTextMappings: cloneDeep(this.validTextMappings),
      };
      this.replaceState(this.nextState);
      this.nextState = null;

      this.editProperties = false;
      this.reRenderSVG();
    },
    replaceState(state) {
      const { scenarioMindmapMessages, onSaveDeleteTargetIds, validTextMappings } = cloneDeep(state);
      this.validTextMappings = cloneDeep(validTextMappings);
      this.scenarioMindmap[this.versionId].textMapping = cloneDeep(validTextMappings);
      this.scenarioMindmap[this.versionId][this.talkName] = cloneDeep(scenarioMindmapMessages);
      this.scenarioMindmapMessages = cloneDeep(scenarioMindmapMessages);
      this.onSaveDeleteTargetIds = cloneDeep(onSaveDeleteTargetIds);
    },
    reRenderSVG() {
      this.clearNodeClickHandler();
      this.clearLinkItem();
      this.clearActiveItem();
      this.deleteMindMapChildren();
      this.buildTheMindMap();
    },
    onWindowKeyDown(event) {
      if (event.path.find((path) => path.id === "drawer-content")) {
        // NOTE: keydown on drawer textarea. we should ignore event
        return true;
      }

      const isPressCtrl = this.isMacOS ? event.metaKey : event.ctrlKey;

      if (isPressCtrl && event.key === "c") {
        return this.onCopy(event);
      }
      if (isPressCtrl && event.key === "v") {
        return this.onPaste(event);
      }
      if (isPressCtrl && event.key === "z") {
        return this.onClickUndoButton();
      }
      if (isPressCtrl && event.key === "y") {
        return this.onClickRedoButton();
      }
    },
    onCopy(event) {
      if (!this.activeItem) {
        return;
      }
      if (!this.activeItem.dataType) {
        this.$snackbar.show({ text: "アクションノード以外はコピーできません", type: "error" });
      }
      const copiedItems = [[cloneDeep(this.activeItem)]];
      const generations = cloneDeep(this.mindMapGenerations);
      for (let generation = this.activeItem.generation + 1; generation < generations.length; generation++) {
        const childCopyTargets = [];
        const childGeneration = cloneDeep(this.mindMapGenerations[generation]);
        copiedItems[copiedItems.length - 1].forEach((parentItem) => {
          const nextCopyTargets = childGeneration.filter((gen) => gen.parentId === parentItem.mindmapId);
          if (nextCopyTargets.length > 0) {
            childCopyTargets.push(...nextCopyTargets);
          }
        });
        copiedItems.push(childCopyTargets);
      }
      this.copiedItems = copiedItems;
    },
    onPaste(event) {
      if (!this.activeItem || !this.copiedItems) {
        return;
      }

      if (this.activeItem.dataType !== "__INITIAL__") {
        this.$snackbar.show({ text: "設定前のアクション以外にはペーストできません", type: "error" });
        return;
      }

      // TODO: paste Item
      this.previousState = {
        scenarioMindmapMessages: cloneDeep(this.scenarioMindmapMessages),
        onSaveDeleteTargetIds: cloneDeep(this.onSaveDeleteTargetIds),
        validTextMappings: cloneDeep(this.validTextMappings),
      };

      // NOTE: 複数回ペーストする可能性があるので、ここで新しく配列を作ってdataIdを生成し直す
      const filteredBotNodes = cloneDeep(this.copiedItems)
        .flat()
        .filter((node) => node.dataType);

      // NOTE: 新しいdataIdの転置インデックス
      const newDataIdIndex = {};
      filteredBotNodes.forEach((node) => {
        const newDataId = generateUUID();
        newDataIdIndex[node.dataId] = newDataId;
        node.dataId = newDataId;
      });

      filteredBotNodes.forEach((node) => {
        node.nameLBD = (node.nameLBD || "新規メッセージ") + "のコピー";

        if (node.params.actionLeft) {
          node.params.actionLeft.data = newDataIdIndex[node.params.actionLeft.data] || node.params.actionLeft.data;
        }
        if (node.params.actionRight) {
          node.params.actionRight.data = newDataIdIndex[node.params.actionRight.data] || node.params.actionRight.data;
        }
        if (node.params.actionCount) {
          if (node.dataType === "buttons") {
            for (let i = 0; i < node.params.actionCount; i++) {
              if (node.params[`actions.${i}`].type === "postback") {
                node.params[`actions.${i}`].data =
                  newDataIdIndex[node.params[`actions.${i}`].data] || node.params[`actions.${i}`].data;
              }
            }
          }
          if (node.dataType === "carousel") {
            for (let j = 0; j < node.params.columnCount; j++) {
              for (let i = 0; i < node.params.actionCount; i++) {
                if (node.params[`action.${j}.${i}`].type === "postback") {
                  node.params[`action.${j}.${i}`].data =
                    newDataIdIndex[node.params[`action.${j}.${i}`].data] || node.params[`action.${j}.${i}`].data;
                }
              }
            }
          }
        }

        delete node.generation;
        delete node.parentId;
        delete node.mindmapId;
        delete node.branchIndex;
      });

      const parentUserNode = this.mindMapGenerations[this.activeItem.generation - 1].find(
        (node) => node.mindmapId === this.activeItem.parentId
      );
      if (!parentUserNode) {
        throw new Error("invalid state on parentUserNode");
      }
      const parentBotNode = this.mindMapGenerations[parentUserNode.generation - 1].find(
        (node) => node.mindmapId === parentUserNode.parentId
      );
      if (!parentBotNode) {
        throw new Error("invalid state on parentBotNode");
      }
      let parentBranchParamKey;
      switch (parentBotNode.dataType) {
        case "buttons":
          parentBranchParamKey = `actions.${parentUserNode.branchIndex}`;
          break;
        case "confirm":
          parentBranchParamKey = parentUserNode.branchIndex === 0 ? "actionLeft" : "actionRight";
          break;
        case "carousel":
          parentBranchParamKey = `action.${parentUserNode.carouselIndex}.${
            parentUserNode.branchIndex - parentBotNode.params.actionCount * parentUserNode.carouselIndex
          }`;
          break;
      }

      let nextScenarioMindmapMessages = cloneDeep(this.scenarioMindmapMessages);
      const nextValidTextMappings = cloneDeep(this.validTextMappings);
      if (parentBranchParamKey) {
        if (parentBotNode.params[parentBranchParamKey].type === "postback") {
          parentBotNode.params[parentBranchParamKey].data = filteredBotNodes[0].dataId;
          nextScenarioMindmapMessages = nextScenarioMindmapMessages.filter(
            (message) => message.dataId !== parentBotNode.dataId
          );
          nextScenarioMindmapMessages.push(parentBotNode);
        } else if (parentBotNode.params[parentBranchParamKey].type === "message") {
          nextValidTextMappings[parentBotNode.params[parentBranchParamKey].text] = filteredBotNodes[0].dataId;
        }
      }
      nextScenarioMindmapMessages.push(...filteredBotNodes);

      this.validTextMappings = cloneDeep(nextValidTextMappings);
      this.scenarioMindmap[this.versionId].textMapping = cloneDeep(nextValidTextMappings);
      this.scenarioMindmap[this.versionId][this.talkName] = cloneDeep(nextScenarioMindmapMessages);
      this.scenarioMindmapMessages = cloneDeep(nextScenarioMindmapMessages);
      this.nextState = null;

      this.editProperties = false;
      this.reRenderSVG();
    },
    localDataTypeUpdate(dataType) {
      this.editItemDataType = dataType;
    },
  },
  mounted() {
    this.onMount();

    document.body.classList.add("lbd-web");
    this.$refs.svgContainer.addEventListener("mousedown", this.onSvgContainerMouseDown);
    this.$refs.svgContainer.addEventListener("touchstart", this.onSvgContainerMouseDown);
    this.$refs.svgContainer.addEventListener("mouseup", this.onSvgContainerMouseUp);
    this.$refs.svgContainer.addEventListener("touchend", this.onSvgContainerMouseUp);
    window.addEventListener("resize", this.onResizeWindow);
    window.addEventListener("keydown", this.onWindowKeyDown);
    this.onResizeWindow();
  },
  beforeDestroy() {
    document.body.classList.remove("lbd-web");
    this.$refs.svgContainer.removeEventListener("mousedown", this.onSvgContainerMouseDown);
    this.$refs.svgContainer.removeEventListener("touchstart", this.onSvgContainerMouseDown);
    this.$refs.svgContainer.removeEventListener("mouseup", this.onSvgContainerMouseUp);
    this.$refs.svgContainer.removeEventListener("touchend", this.onSvgContainerMouseUp);
    window.removeEventListener("resize", this.onResizeWindow);
    window.removeEventListener("keydown", this.onWindowKeyDown);
  },
  created() {
    this.$store.dispatch(FETCH_ALL_SCENARIOS);
    this.scenarioId = this.$route.params.scenarioId;
    this.versionId = this.$route.params.versionId;
    this.displayTalkOptions = this.talkOptions();
    this.scenarioMindmapSnapshot = cloneDeep(this.scenarioMindmap);

    this.onResizeWindow = this.onResizeWindow.bind(this);
    this.onSvgContainerMouseDown = this.onSvgContainerMouseDown.bind(this);
    this.onSvgContainerMouseUp = this.onSvgContainerMouseUp.bind(this);
    this.onWindowKeyDown = this.onWindowKeyDown.bind(this);
    this.talkName = this.$route.params.talkName;
  },

  beforeRouteLeave(to, from, next) {
    if (!isEqual(this.scenarioMindmapSnapshot, this.scenarioMindmap)) {
      this.$dialog.show({
        title: "このページを離れてもよろしいですか？",
        text: "行った変更は破棄されます。",
        btnConfirmTitle: "このページを離れる",
        onConfirm: () => {
          this.updateMindMap(cloneDeep(this.scenarioMindmapSnapshot));
          next();
        },
      });
    } else {
      next();
    }
  },
});
</script>

<style scoped>
  #mindmap-root {
    display: flex;
    flex-direction: column;
    height: calc(
        100vh - 48px - 48px - 12px - 12px
    ); /* HACK: 100vh - navbar - copyright - container_Top - container_Bottom */
    width: 100vw;
    max-width: 100%;
  }

  #mindmap-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100vw;
    max-width: 100%;
    overflow-x: hidden;
  }

  #mindmap-inner {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }

  svg {
    cursor: move; /* fallback */
    cursor: grab;
  }

  svg:active {
    cursor: grabbing;
  }

  .editor-buttons {
    padding-left: 0;
    padding-right: 0;
    display: flex;
    align-items: center;
  }

  .editor-buttons.editor-buttons-left {
    padding-bottom: 0;
  }

  .editor-button {
    min-width: 0 !important;
    padding: 0 0.5em !important;
  }

  .editor-buttons > .editor-button,
  .combined-buttons {
    margin-right: 12px;
  }

  .editor-buttons > .editor-button:last-child {
    margin-right: 0;
  }

  .combined-buttons {
    display: inline-block;
    overflow: hidden !important;
  }

  .combined-buttons.combined-buttons-split .editor-button {
    border-right: 1px solid #f2f2f2;
  }

  .combined-buttons.combined-buttons-split .editor-button:last-child {
    border-right: none;
  }

  .environment {
    display: inline;
    padding: 7px 14px;
    border-radius: 1em;
    margin-right: 12px;
  }

  .environment,
  .environment * {
    color: #ffffff;
  }

  .environment.production {
    background-color: #74de74;
  }

  .environment.sandbox {
    background-color: #bdbdbd;
  }

  .header-menu-list .v-list-item {
    cursor: pointer;
    font-size: 14px;
  }

  .header-menu-list .v-list-item--disabled .header-menu-list-item {
    opacity: 0.6;
  }

  .header-menu-list .header-menu-list-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .header-menu-list .v-list-item span:last-child {
    margin-left: 1rem;
  }

  .header-menu-list .v-list-item:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
</style>
<style>
  body.lbd-web .router-container {
    min-height: unset !important;
  }

  #svgElem #node\.0,
  #svgElem .node.bot {
    cursor: pointer;
  }

  .node.delete-target rect {
    stroke: red;
    fill: #ffaaaa;
  }

  .node.delete-target text {
    fill: red;
  }

  .drawer-shrink-toggle-icon {
    transform: rotate(0deg);
    transition: 0.25s all ease-in-out;
  }

  .drawer-shrink {
    transform: translateX(calc(100% - 38px)) !important;
  }

  .drawer-shrink #drawer-content {
    pointer-events: none;
    overflow: hidden;
    position: relative;
  }

  .drawer-shrink .drawer-shrink-toggle-icon {
    transform: rotate(180deg);
  }

  .editor-buttons .combined-buttons .editor-button[disabled] {
    background-color: rgba(0, 0, 0, 0.12) !important;
  }
</style>
