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
  <v-card style="height: 100%; display: flex; flex-direction: row; overflow: hidden">
    <div style="display: flex; align-items: center">
      <div class="drawer-shrink-toggle-icon">
        <v-btn style="min-width: 0; padding: 0 0.5em" text rounded @click="onClickToggleButton()">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>
    <div style="flex: 1; display: flex; height: 100%; flex-direction: column; overflow: hidden">
      <v-toolbar flat style="flex: 0">
        <v-btn
          color="primary"
          elevation="4"
          @click="
            hasActionPermission('click', 'backendRequest') ? onUpdateItemProperties() : showActionPermissionError()
          "
          :disabled="!canSave"
          style="flex: 1; margin: 0 12px 0 0"
        >
          反映する
        </v-btn>
        <v-btn elevation="4" @click="closeModal" style="flex: 1"> キャンセル </v-btn>
      </v-toolbar>
      <div id="drawer-content" style="flex: 1; overflow-y: auto">
        <v-card-text class="ma-0 px-3 bot-designer-item-properties">
          <v-card class="px-4" outlined>
            <v-row>
              <v-col>
                <label>開始メッセージ</label>

                <InputText
                  v-model="modelLocal.value"
                  outlined
                  dense
                  @input="onChangeName($event)"
                  @change="(value) => { this.modelLocal.value = value }"
                  :rules="[rules.validTextLength, rules.checkDuplicate, rules.notStartsWhiteSpace, rules.notEndsWhiteSpace]"
                  :maxlength="120"
                >
                </InputText>
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import { SET_SCENARIO_MINDMAP_MESSAGES } from "@/store/mutation-types";
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import OriginActionProperty from "../../components/BotDesigner/CommonProperties/ActionProperty.vue";
import { cloneDeep } from "lodash";
import InputText from "../../components/BotDesigner/InputText.vue";

export default Vue.extend({
  props: {
    model: Object,
    scenarioId: String,
    versionId: String,
    editProperties: Boolean,
    onClickToggleButton: Function,
  },
  data() {
    return {
      modelLocal: null,
      originalModel: null,
      canSave: false,
      rules: {}
    };
  },
  watch: {
    model(value) {
      this.canSave = false;
      this.modelLocal = cloneDeep(value);
      this.originalModel = cloneDeep(this.modelLocal);
    },
  },
  components: {InputText},
  computed: {
    ...mapState({
      scenarioTextMap: (state) => state.scenarios.scenarioTextmap,
      scenarioMessages: (state) => state.scenarios.scenarioMessages,
      scenarioMindmap: (state) => state.scenarios.scenarioMindmap,
    }),
    maxWidthDialog() {
      return 800;
    },
  },
  methods: {
    ...mapActions({}),
    ...mapMutations({
      updateMindMapMessages: SET_SCENARIO_MINDMAP_MESSAGES,
    }),
    updateSaveStatus(value) {
      this.$emit("updateEditState", value);
      this.canSave = value;
    },
    onChangeName(event) {
      this.updateSaveStatus(event.length <= 120);
    },
    closeModal() {
      this.modelLocal = this.originalModel;
      this.updateSaveStatus(false);
      this.$emit("stopProperties", false);
    },
    async onUpdateItemProperties() {
      let oldState = this.scenarioMindmap[this.versionId]["textMapping"];
      let old_key = Object.keys(oldState).find((key) => oldState[key] === this.modelLocal.rootId);
      let new_key = this.modelLocal.value;
      let _newState = cloneDeep(oldState);
      delete _newState[old_key];

      let newState = { ..._newState, [new_key]: this.modelLocal.rootId };
      var payload = {
        versionName: this.versionId,
        valueName: "textMapping",
        value: newState,
      };
      await this.updateMindMapMessages(payload);
      this.updateSaveStatus(false);
      this.$emit("stopProperties", false);

      this.$emit("redrawFromRoot", new_key);
    },
  },
  created() {
    this.modelLocal = cloneDeep(this.model) || {};
    this.originalModel = cloneDeep(this.model) || {};
    this.rules = {
      validTextLength: (value) => {
        if (!value || value.trim().length === 0) {
          this.canSave = false;
          return "開始メッセージは必須入力です。";
        }
        if (value && value.length > 120) {
          return "開始メッセージは120文字以内にしてください。";
        } else {
          return true;
        }
      },
      checkDuplicate: (value) => {
        if (value && this.originalModel.value === value) {
          this.canSave = false;
          return true;
        }
        if (value && this.scenarioTextMap.textMapping[value]) {
          this.canSave = false;
          return "トーク名を既存のユーザーテキストマッピングと同じにすることはできません。";
        }
        if (value && !this.scenarioTextMap.textMapping[value]) {
          return true;
        }
      },
      notStartsWhiteSpace: (value) => {
        if (!value.match(/^\s+.*$/)) {
          return true
        }
        this.canSave = false;
        return "先頭に空白を指定することはできません。";
      },
      notEndsWhiteSpace: (value) => {
        if (!value.match(/^.*?\s+$/)) {
          return true
        }
        this.canSave = false;
        return "末尾に空白を指定することはできません。";
      },
    };
  }
});
</script>

<style lang="less">
.bot-designer-item-properties {
  label {
    margin-bottom: 5px;

    display: inline-block;
  }
}
</style>
