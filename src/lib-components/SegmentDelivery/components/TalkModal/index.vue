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
  <v-dialog
    v-model="show"
    :persistent="isCreatingSegmentDelivery || isUpdatingSegmentDelivery"
    max-width="700"
  >
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title class="text-h5" style="font-weight: bold;"> {{ isEditData ? "配信編集" : "新規作成" }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="form" v-model="valid">
        <v-container fluid>
          <v-row style="display: block; margin: 1em; margin-bottom: 1em !important;">
            <span>配信名</span>
            <v-text-field
                v-model="deliveryTitle"
                :rules="deliveryTitleRules"
                outlined
                dense
                hide-details
                placeholder="配信名"
            ></v-text-field>
          </v-row>
          <v-row style="display: block; margin: 1em; margin-bottom: 1em !important;">
            <span>環境を選択</span>
            <v-select
                v-model="selectedEnvironment"
                :items="listOfEnvironments"
                :rules="environmentRules"
                :disabled="isFetchingTalksForOutsideDistribution"
                outlined
                dense
                hide-details
                placeholder="環境名"
            ></v-select>
          </v-row>
          <v-row style="display: block; margin: 1em; margin-bottom: 1em !important;">
            <span>トークを選択</span>
            <v-select
                v-model="selectedTalk"
                :items="talksToDisplay"
                :rules="talkRules"
                :loading="isFetchingTalksForOutsideDistribution"
                :disabled="isFetchingTalksForOutsideDistribution"
                item-text="name"
                item-value="dataId"
                outlined
                dense
                hide-details
                placeholder="トーク名"
            ></v-select>
            <v-checkbox
                style="margin-top: 0;"
                hide-details="auto"
                v-model="useDisasterRichmenu"
                label="災害用リッチメニューを使用"
            ></v-checkbox>
          </v-row>
          <v-row style="display: block; margin: 1em;">
            <span>有効 / 無効</span>
            <v-radio-group style="margin-top: 0 !important;" v-model="enabled" row hide-details class="my-2">
                <v-radio color="primary" label="有効" :value="true"></v-radio>
                <v-radio color="primary" label="無効" :value="false"></v-radio>
            </v-radio-group>
          </v-row>
        </v-container>
        <v-card-actions class="px-4">
          <v-row>
            <v-spacer></v-spacer>
            <v-col cols="2">
              <v-btn color="primary" outlined @click="show = false"> キャンセル </v-btn>
            </v-col>
            <v-col cols="2">
              <v-btn
                color="primary"
                block
                :loading="isCreatingSegmentDelivery || isUpdatingSegmentDelivery"
                :disabled="isSaveDisabled"
                @click="onSave()"
                :style="
                  hasActionPermission('hideButton', 'SegmentDelivery_DataModal_Save') ? hideButtonPermissionStyle() : ''
                "
              >
                {{ isEditData ? "保存" : "作成" }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapState, mapMutations } from "vuex";
import {
  CREATE_SEGMENT_DELIVERY,
  UPDATE_SEGMENT_DELIVERY,
  FETCH_TALK_DELIVERY_LIST,
  FETCH_SCENARIO_TALKS_FOR_TALK_DISTRIBUTION,
} from "@/store/action-types";
import { SET_DISTRIBUTION_DETAIL } from "@/store/mutation-types";

import { emitSnackbar } from "@/utils/emitComponents";

interface LocalState {
  valid: boolean;
  isEditData: boolean;
  distributionConfigId: any;
  deliveryTitle: string;
  enabled: boolean;
  selectedTalk: any;
  selectedEnvironment: string;
  useDisasterRichmenu: boolean;
  deliveryTitleRules: any;
  talkRules: any;
  environmentRules: any;
  listOfEnvironments: Array<any>;
  createError: boolean;
  updateError: boolean;
}

export default Vue.extend({
  props: {
    visible: Boolean,
    close: Function,
    item: Object,
    source: String,
    getSurveyConditions: Function,
    distItem: Object,
    updateTargetEstimate: Function,
  },
  data(): LocalState {
    return {
      valid: false,

      isEditData: false,

      distributionConfigId: null,
      deliveryTitle: "",
      enabled: true,
      selectedTalk: null,
      selectedEnvironment: "sandbox",
      useDisasterRichmenu: false,

      deliveryTitleRules: [(v) => !!v || "配信名は必須入力です。"],
      talkRules: [(v) => !!v || "トークは必須入力です。"],
      environmentRules: [(v) => !!v || "環境は必須入力です。"],

      listOfEnvironments: [
        {
          text: "本番",
          value: "production"
        },
        {
          text: "サンドボックス",
          value: "sandbox",
        }
      ],

      createError: false,
      updateError: false,
    };
  },
  components: { },
  computed: {
    ...mapState({
      isCreatingSegmentDelivery: (state: any) => state.segments.isCreatingSegmentDelivery,
      createSegmentDeliveryError: (state: any) => state.segments.createSegmentDeliveryError,
      isUpdatingSegmentDelivery: (state: any) => state.segments.isUpdatingSegmentDelivery,
      updateSegmentDeliveryError: (state: any) => state.segments.updateSegmentDeliveryError,

      isFetchingTalksForOutsideDistribution: (state: any) => state.segments.isFetchingTalksForOutsideDistribution,
      fetchTalksForOutsideDistributionError: (state: any) => state.segments.fetchTalksForOutsideDistributionError,
      talksForOutsideDistribution: (state: any) => state.segments.talksForOutsideDistribution,

      distributionDetail: (state: any) => state.segments.distributionDetail,
    }),
    talksToDisplay() {
      return this.selectedEnvironment in this.talksForOutsideDistribution ? this.talksForOutsideDistribution[this.selectedEnvironment] : [];
    },
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
    isSaveDisabled(): boolean {
      return !this.valid || !this.selectedTalkInAvailableTalks || this.isCreatingSegmentDelivery || this.isUpdatingSegmentDelivery;
    },
    selectedTalkInAvailableTalks(): any {
      return this.talksForOutsideDistribution[this.selectedEnvironment].find(elem => elem.dataId == this.selectedTalk);
    }
  },
  watch: {
    visible(value) {
      if (value) {
        this.isEditData = this.item ? true : false;
        this.resetValues();
        this.initializeValues();
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
      }
    },
    createSegmentDeliveryError(value) {
      if (value) {
        this.createError = true;
      } else {
        this.createError = false;
      }
    },
    updateSegmentDeliveryError(value) {
      if (value) {
        this.updateError = true;
      } else {
        this.updateError = false;
      }
    },
  },
  methods: {
    ...mapActions({
      createSegmentDelivery: CREATE_SEGMENT_DELIVERY,
      updateSegmentDelivery: UPDATE_SEGMENT_DELIVERY,
      fetchTalkDeliveryList: FETCH_TALK_DELIVERY_LIST,
      fetchActiveScenarioTalks: FETCH_SCENARIO_TALKS_FOR_TALK_DISTRIBUTION,
    }),
    ...mapMutations({
      updateDistributionDetail: SET_DISTRIBUTION_DETAIL,
    }),
    async initializeValues(): Promise<void> {
      if (this.item) {
        this.deliveryTitle = this.item.deliveryTitle;
        this.selectedEnvironment = this.item.environment;
        this.selectedTalk = this.item.talkId;
        this.useDisasterRichmenu = this.item.useDisasterRichmenu;
        this.enabled = this.item.enabled;
        this.distributionConfigId = this.item.distributionConfigId;
      }
      this.fetchActiveScenarioTalks();
    },
    getTalkName(talkId: any): any {
      return this.talksForOutsideDistribution[this.selectedEnvironment].find(elem => elem.dataId === talkId).name;
    },
    onSave(): void {
      let params: any = {
        name: this.deliveryTitle,
        enabled: this.enabled,
        environment: this.selectedEnvironment,
        talkId: this.selectedTalk,
        useDisasterRichmenu: this.useDisasterRichmenu
      };
      params["talkName"] = this.getTalkName(this.selectedTalk);
      
      if (this.distributionConfigId) {
        params.id = this.distributionConfigId;
      }

      if (!this.isEditData) {
        this.create(params);
      } else {
        this.update(params);
      }
    },
    async create(params: any): Promise<void> {
      if (this.hasActionPermission("click", "backendRequest")) {
        await this.createSegmentDelivery(params)
        if (this.createSegmentDeliveryError) {
          emitSnackbar(this.$snackbar, this.createSegmentDeliveryError, "error");
        } else {
          this.show = false;
          this.$snackbar.show({
            text: "配信データを追加しました。",
          });
          await this.fetchTalkDeliveryList();
        }
      } else {
        this.showActionPermissionError();
      }
    },
    async update(params: any): Promise<void> {
      if (this.hasActionPermission("click", "backendRequest")) {
        await this.updateSegmentDelivery(params)
        if (this.updateSegmentDeliveryError) {
          emitSnackbar(this.$snackbar, this.updateSegmentDeliveryError, "error");
        } else {
          this.show = false;
          this.$snackbar.show({
            text: "配信情報を更新しました。",
          });
          await this.fetchTalkDeliveryList();
        }
      } else {
        this.showActionPermissionError();
      }
    },
    resetValues(): void {
      this.deliveryTitle = "";
      this.enabled = true;
      this.createError = false;
      this.updateError = false;
      this.selectedTalk = null;
      this.environment = "sandbox";
      this.useDisasterRichmenu = false;
    },
    handleUpdate(value: any): void {
      this.updateDistributionDetail({ ...this.distributionDetail, ...value });
    },
  },
  async created() {
  }
});
</script>