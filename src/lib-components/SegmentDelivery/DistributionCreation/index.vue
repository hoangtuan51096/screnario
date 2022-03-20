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
    <v-overlay :opacity="0.2" v-if="isFetchingDistributionDetail">
      <content-loading :size="50" text="" />
    </v-overlay>
    <div v-else>
      <div class="text-right ma-4 row">
        <router-link
          :to="{ name: 'DistributionDetail', params: { distributionId: distributionDetail.id } }"
          clas="list-item-link"
          v-if="$route.params.distributionId || $route.params.distCopiedDetail"
        >
          <v-btn color="primary" text>
            <v-icon left>mdi-arrow-left-circle</v-icon>
            詳細画面に戻る
          </v-btn>
        </router-link>
        <router-link :to="{ name: 'SegmentDeliveryPage' }" class="list-item-link" v-else>
          <v-btn color="primary" text>
            <v-icon left>mdi-arrow-left-circle</v-icon>
            配信リストに戻る
          </v-btn>
        </router-link>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-checkbox dense hide-details label="Dry mode" v-model="dryRun" style="margin-top: 0; display: none;"/>
        <v-btn
          color="grey lighten-2"
          elevation="0"
          class="mx-2"
          :loading="isSavingDistributionDeliveryDraft"
          :disabled="isDistributionDisabled"
          @click="hasActionPermission('click', 'backendRequest') ? saveDraft() : showActionPermissionError()"
          :style="
            hasActionPermission('hideButton', 'SegmentDelivery_DistributionCreation_SaveDraft')
              ? hideButtonPermissionStyle()
              : ''
          "
        >
          下書き保存
        </v-btn>
        <v-btn
          color="grey lighten-2"
          class="mx-2"
          elevation="0"
          :loading="isSendingBroadcastMessages"
          @click="hasActionPermission('click', 'backendRequest') ? broadcast() : showActionPermissionError()"
          :style="
            hasActionPermission('hideButton', 'SegmentDelivery_DistributionCreation_TestBroadcast')
              ? hideButtonPermissionStyle()
              : ''
          "
        >
          テスト配信
        </v-btn>
        <v-btn
          color="primary"
          class="mx-2"
          elevation="0"
          :loading="isCreatingDistributionDelivery || isUpdatingDistributionDelivery"
          :disabled="isDistributionDisabled"
          @click="hasActionPermission('click', 'backendRequest') ? send() : showActionPermissionError()"
          :style="
            hasActionPermission('hideButton', 'SegmentDelivery_DistributionCreation_SendDistribution')
              ? hideButtonPermissionStyle()
              : ''
          "
        >
          配信
        </v-btn>
      </div>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-container fluid>
          <v-divider></v-divider>
          <v-alert v-model="hasError" class="my-4 multi-line" color="red" border="left" type="error" text>
            {{ errorMessage }}
          </v-alert>
          <v-row no-gutters class="my-4">
            <v-col>
              <v-row no-gutters>
                <v-col :cols="fieldsCols.label">
                  <v-subheader>配信名</v-subheader>
                </v-col>
                <v-col :cols="fieldsCols.input">
                  <v-text-field
                    v-model="name"
                    :rules="nameRules"
                    outlined
                    dense
                    hide-details="auto"
                    placeholder="配信名"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col :cols="fieldsCols.label">
                  <v-subheader>配信先</v-subheader>
                </v-col>
                <v-col :cols="fieldsCols.input">
                  <v-radio-group v-model="recipients" class="mt-2">
                    <v-radio label="すべての友だち" value="ALL"></v-radio>
                    <v-radio label="絞り込み" value="FILTER">
                      <template slot="label">
                        <v-btn color="primary" elevation="0" @click="openDataModal()">絞り込み </v-btn>
                        <div
                          v-if="surveyConditions.conditions && surveyConditions.conditions.length > 0"
                          class="mx-2 primary--text"
                        >
                          <v-icon color="primary">mdi-check-circle-outline</v-icon>
                          設定済み
                        </div>
                        <div v-else class="mx-2 red--text">
                          <v-icon color="red">mdi-close-circle-outline</v-icon>
                          未設定
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                  <div v-if="showDataModal">
                    <DataModal
                      :visible="showDataModal"
                      :item="selectedItem"
                      :distItem="distributionDetail"
                      :source="'broadcast'"
                      @close="closeDataModal"
                      @getSurveyConditions="getSurveyConditions"
                      @setSurveyConditions="setSurveyConditions"
                      @updateTargetEstimate="updateTargetEstimate"
                    />
                  </div>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col :cols="fieldsCols.label"> <v-subheader>配信日時</v-subheader></v-col>
                <v-col :cols="fieldsCols.input">
                  <v-radio-group v-model="startType" class="mt-2">
                    <v-radio label="今すぐ配信" value="IMMEDIATE"></v-radio>
                    <v-radio label="一回のみ配信" value="ONETIME"></v-radio>
                    <!-- <v-row v-if="startType === 'ONETIME'"> -->
                    <v-row no-gutters class="pl-8">
                      <v-col :cols="fieldsCols.input">
                        <v-row no-gutters>
                          <v-col cols="12" sm="auto" class="pr-2">
                            <DatePickerMenu
                              :field="'scheduledStartAt'"
                              :isEndDate="false"
                              :enablePicker="startType === 'ONETIME'"
                            />
                          </v-col>
                          <v-col cols="12" sm="auto">
                            <TimePickerMenu :field="'scheduledStartAt'" :enablePicker="startType === 'ONETIME'" />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-radio value="RECURRING" class="pt-4">
                      <template slot="label">
                        <v-row no-gutters>
                          <v-col cols="12" sm="auto">
                            <v-btn color="primary" elevation="0" @click="openRecurringSettingsModal">
                              詳しく配信条件を設定する
                            </v-btn>
                          </v-col>
                        </v-row>
                        <RecurringSettingsModal
                          :visible="recurringSettingsModal"
                          :recurringSettings="distributionDetail.recurringSettings"
                          @close="recurringSettingsModal = false"
                        />
                      </template>
                    </v-radio>
                    <v-row no-gutters class="px-7" align="center">
                      <v-col cols="12" sm="auto" class="pa-1">
                        <v-text-field
                          v-model="fromDatetimeString"
                          filled
                          dense
                          readonly
                          :disabled="startType !== 'RECURRING' || fromDatetimeString !== ''"
                          :error="startType === 'RECURRING' && fromDatetimeString === ''"
                          :outlined="startType === 'RECURRING' && fromDatetimeString === ''"
                          hide-details="auto"
                          style="max-width: 180px"
                        ></v-text-field>
                      </v-col>
                      <span>-</span>
                      <v-col cols="12" sm="auto" class="pa-1">
                        <v-text-field
                          v-model="toDatetimeString"
                          filled
                          dense
                          readonly
                          :disabled="startType !== 'RECURRING' || toDatetimeString !== ''"
                          :error="startType === 'RECURRING' && toDatetimeString === ''"
                          :outlined="startType === 'RECURRING' && toDatetimeString === ''"
                          hide-details="auto"
                          style="max-width: 180px"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="auto" class="pa-1">
                        <v-text-field
                          v-model="periodString"
                          filled
                          dense
                          readonly
                          disabled
                          hide-details="auto"
                          style="max-width: 100px"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="auto" class="pa-1">
                        <v-text-field
                          v-model="withExcludeString"
                          filled
                          dense
                          readonly
                          disabled
                          hide-details="auto"
                          style="max-width: 120px"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-col>
            <v-col :cols="gridCols.right">
              <v-card outlined>
                <v-toolbar color="grey lighten-2" flat dense>
                  <v-spacer></v-spacer>
                  <v-toolbar-title class="body-2">ターゲット統計</v-toolbar-title>
                  <v-spacer></v-spacer>
                </v-toolbar>
                <v-list-item>
                  <v-list-item-content class="my-2 text-center">
                    <v-progress-circular
                      :rotate="360"
                      :size="100"
                      :indeterminate="isGettingDistributionStatistics"
                      :value="targetPercentage"
                      color="primary"
                    >
                      {{ targetPercentage + "%" }}
                    </v-progress-circular>
                    <v-list-item-subtitle class="my-4"> {{ usersToSendToStatus }} </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>
          </v-row>
          <v-divider></v-divider>
        </v-container>
        <div v-for="(message, index) in messages" :key="index">
          <v-card class="ma-4" outlined tile>
            <v-toolbar color="grey lighten-2" dense elevation="0">
              <v-btn-toggle :value="message.type" dense group mandatory @change="onChangeMessageTypes($event, index)">
                <v-btn value="text" text>
                  <v-icon>mdi-chat-outline</v-icon>
                </v-btn>
                <v-btn value="image" text>
                  <v-icon>mdi-image-outline</v-icon>
                </v-btn>
                <v-btn value="imagemap" text>
                  <v-icon>mdi-view-grid-outline</v-icon>
                </v-btn>
                <v-btn value="flex" text>
                  <v-icon>mdi-view-dashboard-outline</v-icon>
                </v-btn>
              </v-btn-toggle>
              <v-spacer></v-spacer>
              <v-btn-toggle dense group>
                <v-btn :value="3" text @click="removeMessage(index)" :disabled="isMin">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-toolbar>
            <v-container>
              <v-textarea
                v-if="message.contents.type === 'text'"
                :value="message.contents.text"
                :rules="textMessageRules"
                class="px-1 my-4"
                placeholder="テキストを入力"
                single-line
                outlined
                rows="4"
                hide-details="auto"
                @input="onChangeTextMessage($event, index)"
              ></v-textarea>
              <input
                type="file"
                ref="inputFile"
                class="d-none"
                accept="image/png, image/jpeg"
                @change="onChangeImageMessage($event, index)"
              />
              <v-card v-if="message.contents.type === 'image'" class="mx-1 my-4" outlined hide-details>
                <v-container fluid center>
                  <v-btn
                    v-if="!message.contents.previewImageUrl"
                    color="primary"
                    class="my-3"
                    elevation="0"
                    @click="uploadImage(index)"
                    >写真をアップロード
                  </v-btn>
                  <v-alert v-model="message.contents.error.value" class="my-3 body-2" color="red" type="error" text>
                    {{ message.contents.error.message }}
                  </v-alert>
                  <div v-if="message.contents.previewImageUrl && !message.contents.error.value">
                    <v-img class="my-4" :src="message.contents.previewImageUrl" max-height="150" contain></v-img>
                    <v-btn color="error" class="my-2" elevation="0" @click="removeImage(index)">削除 </v-btn>
                  </div>
                </v-container>
                <div class="text-left mb-2">
                  <v-subheader class="caption">
                    ファイル形式：JPG、JPEG、PNG<br />
                    ファイルサイズ：10MB以下 (LINEトーク上でプレビュー表示される画像は、システム内部で圧縮された画像になります)
                  </v-subheader>
                </div>
              </v-card>

              <v-card v-if="message.contents.type === 'imagemap'" class="mx-1 my-4" outlined hide-details>
                <v-container fluid center>
                  <div v-if="message.contents.imagemapRenderingPayload && message.contents.imagemapRenderingPayload.baseUrl">
                    <v-img class="my-4" :src="imagemapUrl(message.contents.imagemapRenderingPayload.baseUrl)" max-height="150" contain></v-img>
                  </div>
                  <div class="my-3 mx-16" >
                    <template>
                      <ItemImageMapMessage
                        @updateParams="updateModelParams($event, index)"
                        :usePrimaryButtonColor="true"
                        :params="message.contents.imagemapRenderingPayload || {}"
                      />
                    </template>
                  </div>
                </v-container>
              </v-card>
              <v-card v-if="message.contents.type === 'flex'" class="mx-1 my-4" outlined hide-details>
                <v-container fluid center>
                  <div class="my-1 mx-2" >
                    <v-row>
                      <v-col cols="6" align="left">
                        <template>
                          <ItemBubbleFlex
                            @updateModelParams="updateBubbleFlex($event, index)"
                            @updateSaveStatus="updateFlexJsonStatus($event, index)"
                            :params="message.contents.flexPayload.payload"
                          />
                        </template>
                      </v-col>
                      <v-col cols="6">
                          <div class="line-preview-box">
                              <div class="line-preview-elements">
                                <template>
                                  <BubbleFlexPreview :message="message.contents.flexPayload.payload"/>
                                </template>
                              </div>
                            
                          </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-container>
              </v-card>

            </v-container>
          </v-card>
        </div>
      </v-form>
      <v-container fluid>
        <v-btn color="primary" class="mx-1 mb-4" elevation="0" outlined :disabled="isMax" @click="addMessage">
          <v-icon left>mdi-plus</v-icon>
          追加
        </v-btn>
        <v-divider></v-divider>
        <div class="text-center">
          <v-btn
            color="primary"
            class="mt-4"
            elevation="0"
            :loading="isCreatingDistributionDelivery"
            :disabled="isDistributionDisabled"
            @click="hasActionPermission('click', 'backendRequest') ? send() : showActionPermissionError()"
            :style="
              hasActionPermission('hideButton', 'SegmentDelivery_DistributionCreation_SendDistribution')
                ? hideButtonPermissionStyle()
                : ''
            "
          >
            配信
          </v-btn>
        </div>
      </v-container>

      <div class="message-preview">
        <v-menu top offset-y nudge-top="5px" opacity="0" :close-on-click="false">
          <template v-slot:activator="{ on, attrs }">
            <v-btn class="ma-4" color="primary" min-width="320" v-bind="attrs" v-on="on" @click="preview = !preview">
              <v-icon left> {{ preview ? "mdi-chevron-down" : "mdi-chevron-up" }}</v-icon>
              プレビュー
            </v-btn>
          </template>
          <div>
            <MessagePreview :messages="messages" />
          </div>
        </v-menu>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import {
  CREATE_DISTRIBUTION_DELIVERY,
  UPDATE_DISTRIBUTION_DELIVERY,
  SAVE_DISTRIBUTION_DELIVERY_DRAFT,
  SEND_BROADCAST_MESSAGES,
  GET_DISTRIBUTION_STATISTICS,
  FETCH_DISTRIBUTION_DETAIL_BY_ID,
  FETCH_SURVEY_CONFIGS,
} from "@/store/action-types";
import {
  SET_DISTRIBUTION_DETAIL,
  SET_SURVEY_CONDITIONS,
  SET_MESSAGE_TYPES,
  SET_TEXT_MESSAGE,
  SET_IMAGE_MESSAGE,
  SET_IMAGEMAP_MESSAGE,
  SET_FLEX_MESSAGE,
  ADD_MESSAGE_INPUT,
  REMOVE_MESSAGE_INPUT,
} from "@/store/mutation-types";

import { DEFAULT_DISTRIBUTION_DETAIL } from "@/store/modules/segments/segments.state";

import RecurringSettingsModal from "../components/RecurringSettingsModal/index.vue";
import DataModal from "../components/DataModal/index.vue";
import MessagePreview from "@/pages/admin/SegmentDelivery/DistributionCreation/fragments/MessagePreview.vue";

import DatePickerMenu from "../components/DatetimePickerMenus/DatePickerMenu.vue";
import TimePickerMenu from "../components/DatetimePickerMenus/TimePickerMenu.vue";

import DatetimeFormatter from "@/mixins/DatetimeFormatter";

import {
  checkSurveyConditions,
  checkRecurringSettings,
  checkCustomRecurringSettings,
  checkScheduledStartAt,
  checkUploadedImage,
  checkUploadedImagemap,
  checkValidFlexmessage
} from "@/validation/segment-delivery";

import { emitSnackbar } from "@/utils/emitComponents";

import { cloneDeep } from "lodash";

import ItemImageMapMessage from "@/components/BotDesigner/ItemImageMapMessage.vue";
import ItemBubbleFlex from "./fragments/ItemBubbleFlex.vue";
import BubbleFlexPreview from "./fragments/BubbleFlexPreview.vue";
import default_messages from "@/constants/default_messages.json";

interface GridCols {
  left: number;
  right: number;
}

interface FieldsCols {
  label: number;
  input: number;
}

interface LocalState {
  gridCols: GridCols;
  fieldsCols: FieldsCols;
  valid: boolean;
  isDistributionDisabled: boolean;
  targetPercentage: number;
  selectedFormConfig: any;
  showDataModal: boolean;
  recurringSettingsModal: boolean;
  selectedItem: any;
  fromDatetimeString: any;
  toDatetimeString: any;
  periodString: any;
  withExcludeString: string;
  isMax: boolean;
  isMin: boolean;
  nameRules: any;
  textMessageRules: any;
  preview: boolean;
  hasError: boolean;
  errorMessage: string;
}

export default {
  data(): LocalState {
    return {
      gridCols: {
        left: 8,
        right: 4,
      },

      fieldsCols: {
        label: 2,
        input: 8,
      },
      valid: false,
      isDistributionDisabled: false,

      targetPercentage: 100,

      selectedFormConfig: null,

      showDataModal: false,
      recurringSettingsModal: false,

      selectedItem: null,

      fromDatetimeString: null,
      toDatetimeString: null,
      periodString: null,
      withExcludeString: "除外日なし",

      isMax: false,
      isMin: true,

      nameRules: [(v) => !!v || "配信名は必須入力です。"],
      textMessageRules: [(v) => !!v || "テキストは必須入力です。"],
      preview: false,

      hasError: false,
      errorMessage: "",
    };
  },
  components: { 
    DataModal,
    RecurringSettingsModal,
    DatePickerMenu,
    TimePickerMenu,
    MessagePreview,
    ItemImageMapMessage,
    ItemBubbleFlex,
    BubbleFlexPreview
  },
  mixins: [DatetimeFormatter],
  computed: {
    ...mapState({
      isCreatingDistributionDelivery: (state: any) => state.segments.isCreatingDistributionDelivery,
      createDistributionDeliveryError: (state: any) => state.segments.createDistributionDeliveryError,
      isUpdatingDistributionDelivery: (state: any) => state.segments.isUpdatingDistributionDelivery,
      updateDistributionDeliveryError: (state: any) => state.segments.updateDistributionDeliveryError,

      isSavingDistributionDeliveryDraft: (state: any) => state.segments.isSavingDistributionDeliveryDraft,
      saveDistributionDeliveryDraftError: (state: any) => state.segments.saveDistributionDeliveryDraftError,

      isSendingBroadcastMessages: (state: any) => state.segments.isSendingBroadcastMessages,
      sendBroadcastMessagesError: (state: any) => state.segments.sendBroadcastMessagesError,
      distributionDetail: (state: any) => state.segments.distributionDetail,

      distributionStatistics: (state: any) => state.segments.distributionStatistics,
      isGettingDistributionStatistics: (state: any) => state.segments.isGettingDistributionStatistics,
      getDistributionStatisticsError: (state: any) => state.segments.getDistributionStatisticsError,

      isFetchingDistributionDetail: (state: any) => state.segments.isFetchingDistributionDetail
    }),
    ...mapGetters({
      surveyConfigs: "surveyConfigsWithoutAppendType",
    }),
    periodOptions(): any {
      return {
        Daily: "毎日",
        Weekly: "毎週",
        Monthly: "毎月",
        LastDay: "月末",
        Custom: "カスタム",
      };
    },
    id: {
      get(): any {
        return this.distributionDetail.id;
      },
      set(value: any): void {
        this.handleUpdate({ id: value });
      },
    },
    name: {
      get(): any {
        return this.distributionDetail.name;
      },
      set(value: any): void {
        this.handleUpdate({ name: value });
      },
    },
    recipients: {
      get(): any {
        return this.distributionDetail.surveyConditions.pickAll ? "ALL" : "FILTER";
      },
      set(value: any): void {
        value == "ALL"
          ? this.handleUpdate({
              surveyConditions: { ...this.distributionDetail.surveyConditions, pickAll: true },
            })
          : this.handleUpdate({
              surveyConditions: { ...this.distributionDetail.surveyConditions, pickAll: false },
            });
      },
    },
    surveyConditions: {
      get(): any {
        return this.distributionDetail.surveyConditions;
      },
      set(value: any): void {
        this.handleUpdate({ surveyConditions: value });
      },
    },
    recurringSettings: {
      get(): any {
        return this.distributionDetail.recurringSettings;
      },
      set(value: any): void {
        this.handleUpdate({ recurringSettings: value });
      },
    },
    startType: {
      get(): any {
        return this.distributionDetail.startType;
      },
      set(value: any): void {
        this.handleUpdate({ startType: value });
      },
    },
    dryRun: {
      set(v) {
        return this.distributionDetail.dryRun = v;
      },
      get(): boolean {
        return this.distributionDetail.dryRun || false
      }
    },
    scheduledStartAt: {
      get(): any {
        return this.distributionDetail.scheduledStartAt;
      },
      set(value: any): void{
        this.handleUpdate({ scheduledStartAt: value });
      },
    },
    messages: {
      get(): any {
        return this.distributionDetail.messages;
      },
      set(value: any): void {
        this.handleUpdate({ messages: value });
      },
    },
    usersToSendToStatus(): string {
      const totalUsers = this.distributionStatistics.totalUsers;
      const usersToSendTo = this.distributionStatistics.usersToSendTo;
      if (!totalUsers || totalUsers == 0) {
        return "すべての友だちが対象になります";
      } else if (typeof usersToSendTo == "number") {
        return `約 ${usersToSendTo}人`;
      } else {
        return `約 ${totalUsers}人`;
      }
    },
  },
  watch: {
    distributionDetail: {
      handler(new_value) {
        if (new_value.recurringSettings) {
          let localFromDate = new_value.recurringSettings.fromDate;
          let localToDate = new_value.recurringSettings.toDate;
          let localFromTime = new_value.recurringSettings.fromTime;

          if (new_value.recurringSettings.period === "LastDay") {
            localFromDate = localFromDate ? this.formatToYYYYMM(localFromDate) : null;
            localToDate = localToDate ? this.formatToYYYYMM(localToDate) : null;
          } else {
            localFromDate = localFromDate ? this.formatToYYYYMMDD(localFromDate) : null;
            localToDate = localToDate ? this.formatToYYYYMMDD(localToDate) : null;
          }

          this.fromDatetimeString = localFromDate && localFromTime ? localFromDate + " " + localFromTime : "";
          this.toDatetimeString = localToDate && localFromTime ? localToDate + " " + localFromTime : "";
          this.periodString = this.periodOptions[new_value.recurringSettings.period];
          this.withExcludeString = new_value.recurringSettings.withExclude ? "除外日あり" : "除外日なし";
        }
      },
      deep: true,
    },
    recipients(value) {
      this.pickAll = value === "ALL" ? true : false;
      if (value === "ALL") this.updateTargetEstimate({});
    },
    messages(value) {
      this.isMax = value.length == 5 ? true : false;
      this.isMin = value.length == 1 ? true : false;
    },
    isCreatingDistributionDelivery(value) {
      value === true ? (this.isDistributionDisabled = true) : (this.isDistributionDisabled = false);
    },
    isSavingDistributionDeliveryDraft(value) {
      value === true ? (this.isDistributionDisabled = true) : (this.isDistributionDisabled = false);
    },
    isSendingBroadcastMessages(value) {
      value === true ? (this.isDistributionDisabled = true) : (this.isDistributionDisabled = false);
    },
  },
  methods: {
    ...mapActions({
      createDistributionDelivery: CREATE_DISTRIBUTION_DELIVERY,
      updateDistributionDelivery: UPDATE_DISTRIBUTION_DELIVERY,
      saveDistributionDeliveryDraft: SAVE_DISTRIBUTION_DELIVERY_DRAFT,
      sendBroadcastMessages: SEND_BROADCAST_MESSAGES,
      getDistributionStatistics: GET_DISTRIBUTION_STATISTICS,

      fetchDistributionDetail: FETCH_DISTRIBUTION_DETAIL_BY_ID,
      fetchById: FETCH_DISTRIBUTION_DETAIL_BY_ID,

      fetchSurveyConfigs: FETCH_SURVEY_CONFIGS,
    }),
    ...mapMutations({
      updateDistributionDetail: SET_DISTRIBUTION_DETAIL,
      setSurveyConditions: SET_SURVEY_CONDITIONS,

      addMessageInput: ADD_MESSAGE_INPUT,
      removeMessageInput: REMOVE_MESSAGE_INPUT,
      updateMessageTypes: SET_MESSAGE_TYPES,
      updateTextMessage: SET_TEXT_MESSAGE,
      updateImageMessage: SET_IMAGE_MESSAGE,
      updateImagemapMessage: SET_IMAGEMAP_MESSAGE,
      updateFlexMessage: SET_FLEX_MESSAGE
    }),
    updateModelParams(value: any, index: any): void {
      this.updateImagemapMessage({
        imagemapRenderingPayload: value,
        index
      })
    },
    updateBubbleFlex(value: any, index: any): void {
      this.updateFlexMessage({
        flexPayload: {
          payload: value.payload
        },
        index
      })
    },
    updateFlexJsonStatus(value: any, index: any): void {
      this.updateFlexMessage({
        flexPayload: {
          validateResult: value.validateResult
        },
        index
      })
    },
    recipientsList(): Array<string> {
      return ["ALL", "FILTER"];
    },
    startTypeList(): Array<string> {
      return ["IMMEDIATE", "ONETIME", "RECURRING"];
    },
    handleUpdate(value: any): void {
      this.updateDistributionDetail({ ...this.distributionDetail, ...value });
    },
    openRecurringSettingsModal(): void {
      this.recurringSettingsModal = true;
    },
    openDataModal(): void {
      this.$route.params.distributionId || this.$route.params.distCopiedDetail
        ? (this.selectedItem = this.distributionDetail)
        : null;
      this.showDataModal = true;
    },
    closeDataModal(): void {
      // this.selectedItem = null; // why reset? keep the data selected by user in DataModal dialog
      this.showDataModal = false;
    },
    getSurveyConditions(payload: any): void {
      this.selectedItem = payload; // don't reset when closeDataModal, instead keep the selected values selected in DataModal
      this.surveyConditions = payload.surveyConditions;
    },
    onChangeMessageTypes(value: any, index: any): void {
      this.updateMessageTypes({
        type: value,
        index: index,
      });
    },
    onChangeTextMessage(value: any, index: any): void {
      this.updateTextMessage({
        text: value,
        index: index,
      });
    },
    addMessage(): void {
      this.addMessageInput({
        contents: {
          type: "text",
          text: "",
          originalContentUrl: "",
          previewImageUrl: "",
          file: null,
          imagemapRenderingPayload: {},
          flexPayload: {
            validateResult: true,
            payload: default_messages.bubbleFlex,
          },
          error: {
            value: false,
            message: "",
          },
        },
      });
    },
    removeMessage(index: any): void {
      this.removeMessageInput(index);
    },
    uploadImage(index: any): void {
      this.$refs.inputFile[index].click();
    },
    removeImage(index: any): void {
      var image = {
        originalContentUrl: "",
        previewImageUrl: "",
        file: null,
        error: { value: false, message: "" },
      };
      this.updateImageMessage({
        image: image,
        index: index,
      });
    },
    onChangeImageMessage(event: any, index: any): void {
      const file = event.target.files[0];
      let totalSizeMB: any = (file.size / Math.pow(1024, 2)).toFixed(2);
      var image = {};

      if (totalSizeMB >= 10) {
        image = {
          originalContentUrl: "",
          previewImageUrl: "",
          file: null,
          error: { value: true, message: "10MB 以下のファイルを選んでください。" },
        };
      } else {
        if (file.type != "image/png" && file.type != "image/jpeg" && file.type != "image/jpg") {
          image = {
            originalContentUrl: "",
            previewImageUrl: "",
            file: null,
            error: { value: true, message: "JPG、JPEG、PNG の写真ファイルを選んでください。" },
          };
        } else {
          image = {
            originalContentUrl: URL.createObjectURL(file),
            previewImageUrl: URL.createObjectURL(file),
            file: file,
            error: { value: false, message: "" },
          };
        }
      }
      this.updateImageMessage({
        image: image,
        index: index,
      });
      this.$refs.inputFile[index].value = "";
    },
    async updateTargetEstimate(payload: any): Promise<void> {
      await this.getDistributionStatistics(payload);
      this.targetPercentage = this.calculatePercentage();
    },
    async saveDraft(): Promise<void> {
      var payload = cloneDeep(this.distributionDetail);
      let valid = this.validateForm();
      if (valid) {
        await this.saveDistributionDeliveryDraft(payload).then(response => {
          if (response.result === "SUCCESS") {
            emitSnackbar(this.$snackbar, "下書きを保存しました。");
            this.$router.push({ name: "SegmentDeliveryPage" });
          }
        });

        if (this.saveDistributionDeliveryDraftError) emitSnackbar(this.$snackbar, this.saveDistributionDeliveryDraftError, "error");
      }
    },
    async broadcast(): Promise<void> {
      let valid = this.validateForm();
      if (valid) {
        await this.sendBroadcastMessages(this.messages).then(() => {
          emitSnackbar(this.$snackbar, "テスト配信しました。");
        });

        if (this.sendBroadcastMessagesError) emitSnackbar(this.$snackbar, this.sendBroadcastMessagesError, "error");
      }
    },
    async send(): Promise<void> {
      // BUGFIX: copy should go to CREATE NOT EDIT
      var payload = cloneDeep(this.distributionDetail);
      let valid = this.validateForm();
      if (valid) {
        if (this.$route.name === "DistributionEditPage") {
          await this.updateDistributionDelivery(payload).then(response => {
            if (response.result === "SUCCESS") {
              emitSnackbar(this.$snackbar, "配信を更新しました。");
              this.$router.push({ name: "SegmentDeliveryPage" });
            }
          });

          if (this.updateDistributionDeliveryError) emitSnackbar(this.$snackbar, this.updateDistributionDeliveryError, "error");

        } else {
          await this.createDistributionDelivery(payload).then(response => {
            if (response.result === "SUCCESS") {
              emitSnackbar(this.$snackbar, "配信の登録に成功しました。");
              this.$router.push({ name: "SegmentDeliveryPage" });
            }
          });

          if (this.createDistributionDeliveryError) emitSnackbar(this.$snackbar, this.createDistributionDeliveryError, "error");
        }
      }
    },
    calculatePercentage(): any {
      return !this.distributionStatistics.totalUsers || this.distributionStatistics.totalUsers == 0
        ? 100
        : ((this.distributionStatistics.usersToSendTo / this.distributionStatistics.totalUsers) * 100).toFixed(2);
    },
    async fetchData(): Promise<void> {
      await this.fetchDistributionDetail(this.$route.params.distributionId || this.$route.params.distCopiedDetail);
    },
    validateForm(): boolean {
      let validInput = this.$refs.form.validate();

      let errorList = [];
      if (validInput) {
        if (this.recipients === "FILTER") checkSurveyConditions(errorList, this.surveyConditions);
        if (this.startType === "RECURRING") checkRecurringSettings(errorList, this.recurringSettings);
        if (this.startType === "ONETIME") checkScheduledStartAt(errorList, this.scheduledStartAt);
        checkUploadedImage(errorList, this.messages);
        checkUploadedImagemap(errorList, this.messages);
        checkValidFlexmessage(errorList, this.messages);
      } else {
        if (this.startType === "RECURRING") checkCustomRecurringSettings(errorList, this.recurringSettings);
        if (errorList.length === 0) errorList.push("未入力の必須項目があります。");
      }

      if (!validInput || errorList.length !== 0) {
        this.hasError = true;
        this.errorMessage = errorList.join("\n");
      } else {
        this.hasError = false;
      }

      return this.hasError ? false : true;
    },
    resetValidation(): void {
      this.$refs.form.resetValidation();
    },
    imagemapUrl(baseUrl): string {
      return baseUrl.startsWith("data:") ? baseUrl : baseUrl + '/1040'
    }
  },
  async created() {
    if (!this.surveyConfigs || this.surveyConfigs.length === 0) {
      // even if user hard-reload on create page, surveyConfigs in DataModal(絞り込み) will always be available
      await this.fetchSurveyConfigs("list");
    }
    if (this.$route.name == "DistributionCreatePage") {
      this.handleUpdate(cloneDeep(DEFAULT_DISTRIBUTION_DETAIL));
    } else {
      this.fetchData();
      if (this.surveyConditions && !this.surveyConditions.pickAll) {
        this.updateTargetEstimate(this.surveyConditions);
      }
    }
  },
};
</script>

<style lang="less">
.multi-line {
  white-space: pre-line;
}

.message-preview {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 30%;
  z-index: 1;
}

.fixed-preview {
  position: fixed;
  top: 60px;
}

.preview-row {
  width: fit-content;
  margin-left: 1em;
}

.line-preview-box {
  border-radius: 0.25em;
  background-color: #688bbc;
  width: 100%;
  height: auto;
}
.line-preview-elements {
  display: block;
  justify-content: center;
  overflow: auto;
  overflow-y: auto;
}


</style>
