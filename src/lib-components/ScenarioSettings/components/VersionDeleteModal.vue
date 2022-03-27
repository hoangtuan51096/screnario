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
  <v-dialog scrollable persistent v-model="show" max-width="600">
    <v-card max-width="100%" style="overflow-x: hidden">
      <v-system-bar color="error" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title class="blue-grey--text text--darken-4 font-weight-bold">
          選択項目を削除
        </v-toolbar-title>
      </v-toolbar>
      <template>
        <template v-if="!isDeletingScenarioVersion">
          <v-row class="mx-2">
            <v-col class="text-break" cols="auto">
              <v-col cols="12" style="padding-bottom: 0;">
                <span>"{{
                  scenario.versionNames.map((versionName) =>
                    `"${(
                      (
                        activeScenario.versions
                        && activeScenario.versions[versionName]
                        && activeScenario.versions[versionName].displayVersionName
                      )
                      ? activeScenario.versions[versionName].displayVersionName
                      : versionName).trim()
                    }"`).join(" と ")
                }} を削除します。<br/>
                削除したら元に戻すことはできません。</span>
              </v-col>
            </v-col>
          </v-row>
        </template>
        <template v-if="isDeletingScenarioVersion">
          <v-row justify="center" align="center">
            <v-col md="1">
              <v-progress-circular :size="50" color="green" indeterminate> </v-progress-circular>
            </v-col>
          </v-row>
        </template>
        <v-card-actions class="pa-4 d-flex justify-end" v-if="!isDeletingScenarioVersion">
          <v-btn class="blue-grey--text" outlined @click="cancelDelete">
            キャンセル
          </v-btn>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div
                  style="display: inline-block"
                  v-bind="attrs"
                  v-on="disableDelete && on"
              >
                <v-btn
                    color="error"
                    elevation="4"
                    class="ml-2"
                    :disabled="disableDelete"
                    @click="hasActionPermission('click', 'backendRequest') ? deleteItem() : showActionPermissionError()"
                >
                  削除
                </v-btn>
              </div>
            </template>
            <span>
            この操作を行う場合は、権限を管理者にお問い合わせください
          </span>
          </v-tooltip>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapMutations } from "vuex";
import { DELETE_SCENARIO_VERSION } from "@/store/action-types";
import { SET_DELETING_SCENARIO_VERSION_ERROR } from "@/store/mutation-types";
import MultiLine from "../../components/common/MultiLine.vue";
import {ROLE_MEMBER, USER_TYPE_STORE} from "@/constants/permission.constants";

export default Vue.extend({
  components: {MultiLine},
  props: {
    visible: Boolean,
    scenario: Object,
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
  computed: {
    ...mapState({
      userData: (state) => (state).auth.user,
      isDeletingScenarioVersion: (state) => state.scenarios.isDeletingScenarioVersion,
      deletingScenarioVersionError: (state) => state.scenarios.deletingScenarioVersionError,
      deleteFinishSuccess: (state) => state.scenarios.deleteFinishSuccess,
      activeScenario: (state) => state.scenarios.activeScenario,
      activeScenarioData: (state) => state.scenarios.activeScenarioData,
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
    disableDelete() {
      return (this.userData.role === ROLE_MEMBER && this.userData.user_type === USER_TYPE_STORE)
    }
  },
  methods: {
    ...mapActions({
      deleteScenarioVersion: DELETE_SCENARIO_VERSION,
    }),
    ...mapMutations({
      setDeletingScenarioVersionError: SET_DELETING_SCENARIO_VERSION_ERROR,
    }),
    cancelDelete() {
      this.show = false;
    },
    deleteItem() {
      const payload = this.scenario.versionIds.join(',');
      this.deleteScenarioVersion(payload);
    },
    backToSelect() {
      this.$emit("backToSelect");
    },
  },
});
</script>
