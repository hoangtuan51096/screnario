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
<style>
.user-input-error-message {
  color: red;
  font-size: small;
}
</style>

<template>
  <v-dialog scrollable persistent v-model="show" max-width="600">
    <v-card>
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title class="blue-grey--text text--darken-4 font-weight-bold">
          ユーザー入力編集
        </v-toolbar-title>
      </v-toolbar>
      <v-container>
        <template v-if="message">
          <v-row v-for="(item, index) of displayItems" :key="index">
            <v-col>
              <v-text-field
                  v-model="item.value"
                  label="入力"
                  single-line
                  outlined
                  dense
                  hide-details
                  :readonly="hasActionPermission('disableButton', 'ScenarioSettings_EditUserMessage_Readonly')"
                  @input="changedValue(item, index)"/>
            </v-col>
            <v-col cols="auto">
              <v-btn
                  color="error"
                  :disabled="hasActionPermission('disableButton', 'ScenarioSettings_EditUserMessage_Readonly')"
                  @click="deleteFromUserInput(index)"
              >
                削除
              </v-btn>
            </v-col>
          </v-row>
          <p v-if="!canSave && invalidText === ''" class="user-input-error-message">空の値は使用できません。</p>
          <p v-if="!canSave && invalidText !== ''" class="user-input-error-message">
            <MultiLine>
              入力された文字列は他のユーザーテキストで使用されています。別の文字列を指定してください：{{ invalidText }}
            </MultiLine>
          </p>
          <p v-if="hasRepeats" class="user-input-error-message">ユーザーテキストに同じ文字は入力できません。</p>
        </template>
      </v-container>
      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <template>
          <v-btn
              color="primary"
              :disabled="hasActionPermission('disableButton', 'ScenarioSettings_EditUserMessage_Readonly')"
              @click="addTextMapping"
          >
            追加
          </v-btn>
          <v-spacer/>
          <v-btn outlined class="blue-grey--text" @click="closeComponent">
            キャンセル
          </v-btn>
          <v-btn
              color="primary"
              class="ml-2"
              @click="hasActionPermission('click', 'backendRequest') ? clickSave() : showActionPermissionError()"
              :disabled="hasActionPermission('disableButton', 'ScenarioSettings_SaveUserMessage_Click') || !canSave || hasRepeats"
          >
            保存
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import { cloneDeep, indexOf } from "lodash";
import MultiLine from "@/components/common/MultiLine.vue";

interface LocalState {
  originalInput: Array<any>;
  validToSave: Array<any>;
  displayItems: Array<any>;
  hasRepeats: boolean;
  someValue: boolean;
  canSave: boolean;
  textMap: any;
  invalidText: string;
  rules: any;
  headers: Array<any>;
}

export default Vue.extend({
  props: {
    visible: Boolean,
    close: Function,
    message: Object,
  },
  data(): LocalState {
    return {
      originalInput: [],
      validToSave: [],
      displayItems: [],
      hasRepeats: false,
      someValue: true,
      canSave: true,
      textMap: null,
      invalidText: "",
      rules: {
        validText: (value) => value.length > 0 || "必須",
      },
      headers: [
        {
          text: "ユーザテキスト",
          sortable: true,
          value: "value",
        },
        {
          text: "削除",
          sortable: false,
          value: "delete",
        },
      ],
    };
  },
  watch: {
    visible(value) {
      if (value) {
        this.displayItems = [];
        this.originalInput = this.message.userInput ? cloneDeep(this.message.userInput) : [];
        this.validToSave = Array.apply(null, Array(this.originalInput.length)).map(function () {
          return true;
        });
        this.invalidText = "";
        this.canSave = true;
        this.originalInput.forEach((text) => {
          this.displayItems.push({
            value: text,
          });
        });
      }
    },
    scenarioTextMap () {
      this.textMap = this.textMappingList;
    },
  },
  components: {MultiLine},
  computed: {
    ...mapState({
      scenarioTextMap: (state: any) => state.scenarios.scenarioTextmap,
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
    textMappingList(): any {
      if (this.scenarioTextMap && this.scenarioTextMap.textMapping) {
        return Object.keys(this.scenarioTextMap.textMapping);
      } else {
        return [];
      }
    },
  },
  methods: {
    clickSave(): void {
      var textMappings = [];
      this.displayItems.forEach((item) => {
        textMappings.push(item["value"]);
      });
      this.message.userInput = textMappings;
      this.$emit("save", this.message, this.originalInput);
      this.show = false;
    },
    addTextMapping(): void {
      this.validToSave.push(false);
      this.displayItems.push({
        value: "",
      });

      setTimeout(() => {
        const obj = this.$refs["editDialog"];
        if (obj) {
          obj.isActive = true;
        }
      }, 5);
      this.validate();
    },
    deleteFromUserInput(index: any): void {
      this.validToSave.splice(index, 1);
      this.displayItems.splice(index, 1);
      this.validate();
    },
    changedValue(item: any, index: any): void {
      if (item.value === "" || (this.textMap.includes(item.value) && !this.originalInput.includes(item.value))) {
        this.validToSave[index] = false;
      } else {
        this.validToSave[index] = true;
      }

      const tempValues = cloneDeep(this.displayItems);
      let seen = new Set();
      this.hasRepeats = tempValues.some(function (currentObject) {
        return seen.size === seen.add(currentObject.value).size;
      });
      this.validate();
    },
    validate(): void {
      let foundInvalid = false;
      let index = 0;
      this.validToSave.forEach((value) => {
        if (!value) {
          this.invalidText = this.displayItems[index].value;
          foundInvalid = true;
        }
        index += 1;
      });
      this.canSave = !foundInvalid;
    },
    closeComponent(): void {
      this.show = false;
      this.message.userInput = this.originalInput;
    },
  },
  created() {
    this.textMap = this.textMappingList;
  }
});
</script>
