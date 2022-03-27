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
  <v-dialog scrollable persistent v-model="show" max-width="500">
    <v-card max-width="100%" style="overflow-x: hidden">
      <v-system-bar color="warning" dark height="10"> </v-system-bar>
<!--      <v-toolbar flat>-->
<!--        <v-toolbar-title class="blue-grey&#45;&#45;text text&#45;&#45;darken-4 font-weight-bold">-->
<!--          選択項目を削除-->
<!--        </v-toolbar-title>-->
<!--      </v-toolbar>-->
      <template>
        <template v-if="!isDeletingScenarioVersion">
          <v-row class="mx-4 mt-2">
            <div class="v-avatar v-list-item__avatar" style="height: 40px; min-width: 40px; width: 40px;"><!----><i aria-hidden="true" class="v-icon notranslate mdi mdi-alert-outline theme--light warning--text" style="font-size: 40px;"></i><!----></div>
            <v-col class="text-break" cols="auto">
              <div class="v-list-item__title">テンプレート トーク削除確認</div>
              <div class="mt-2 text-body-2 break-line text--disabled" v-if="payload.talkNames">
                {{ talkName }} を削除します。
              </div>
              <div class="mt-2 text-body-2 break-line text--disabled">
                削除したら元に戻すことはできません。
              </div>
            </v-col>
          </v-row>
        </template>
        <v-divider></v-divider>
        <template v-if="isDeletingScenarioVersion">
          <v-row justify="center" align="center">
            <v-col md="1">
              <v-progress-circular :size="50" color="green" indeterminate> </v-progress-circular>
            </v-col>
          </v-row>
        </template>
        <v-card-actions class="d-flex justify-end" v-if="!isDeletingScenarioVersion">
          <v-btn class="blue-grey--text" outlined @click="cancelDelete">
            キャンセル
          </v-btn>
          <v-btn
              color="error"
              elevation="4"
              class="ml-2"
              :disabled="disableDelete"
              @click="hasActionPermission('click', 'backendRequest') ? deleteItem() : showActionPermissionError()"
          >
            削除
          </v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapMutations } from "vuex";
import {DELETE_TALK} from "@/store/action-types";
import {DELETE_SCENARIO_TALK_SUCCESS} from "@/store/mutation-types";
import MultiLine from "../../components/common/MultiLine.vue";
import {cloneDeep} from "lodash";
export default Vue.extend({
  components: {MultiLine},
  props: {
    visible: Boolean,
    payload: Object,
    active: Object,
  },
  watch: {
    deletingScenarioVersionError(val) {
      if (val) {
        if (val instanceof String) {
          this.$snackbar.show({ text: val, type: "error" });
        } else {
          this.$snackbar.show({ text: val.message, type: "error" });
        }
      }
    },
    deleteFinishSuccess(val) {
      if (val) {
        this.$emit("on-delete-finish-success");
      }
    },
  },
  data() {
    return {
      disableDelete: false,
    };
  },
  computed: {
    ...mapState({
      isDeletingScenarioVersion: (state) => state.scenarios.isDeletingScenarioVersion,
      deletingScenarioVersionError: (state) => state.scenarios.deletingScenarioVersionError,
      deleteScenarioTalkSuccess: (state) => state.scenarios.deleteScenarioTalkSuccess,
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
    talkName() {
      return this.payload.talkNames.map((versionName) => `"${(versionName || "").trim()}"`).join(" と ")
    }
  },
  methods: {
    ...mapActions({
      deleteTalk: DELETE_TALK,
    }),
    ...mapMutations({
      setDeleteScenarioTalkSuccess: DELETE_SCENARIO_TALK_SUCCESS,
    }),
    cancelDelete() {
      this.show = false;
    },
    async deleteItem() {
      const basicPayload = cloneDeep(this.payload);
      delete basicPayload.talkNames;
      // const payloads = this.payload.talkNames.map((talkName) => ({
      //   ...basicPayload,
      //   talkName,
      // }));
      await this.deleteTalk(basicPayload);
      this.show = false;
      this.$emit("onDeleteFinishSuccess");
      this.$snackbar.show({ text: `"${this.talkName}" を削除しました。` });
    },
    backToSelect() {
      this.$emit("backToSelect");
    },
  },
});
</script>
