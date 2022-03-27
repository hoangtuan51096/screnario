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
    <v-overlay :opacity="0.2" v-if="isFetchingDistributionConfigs">
      <content-loading :size="50" text="" />
    </v-overlay>
    <div v-else>
      <div class="mt-4 row">
        <router-link
          :to="{ name: 'SegmentDeliveryPage', params: { tab: 'outer-distribution-settings' } }"
          class="list-item-link"
        >
          <v-btn color="primary" class="mx-4" text>
            <v-icon left>mdi-arrow-left-circle</v-icon>
            配信リストに戻る
          </v-btn>
        </router-link>
        <v-spacer></v-spacer>
        <v-btn-toggle v-show="btnGroupVisibility" v-model="conditionMode" class="mx-3" color="primary" dense mandatory>
          <v-btn value="extract" class="px-6">
            <v-icon left>mdi-text-recognition</v-icon>
            <span class="hidden-sm-and-down">抽出条件</span>
          </v-btn>
          <v-btn value="change" class="px-6" v-if="isNotTalkDistribution">
            <v-icon left>mdi-text-box-multiple-outline</v-icon>
            <span class="hidden-sm-and-down">本文変更条件</span>
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-card v-if="conditionMode === 'extract'" outlined class="my-4">
        <v-container class="pa-4">
          <v-row>
            <v-col :cols="gridCols.half">
              <v-subheader class="px-1">サブジェクト抽出条件</v-subheader>
              <v-text-field
                v-model="condition.subjectExtractionCondition"
                class="px-1"
                placeholder="正規表現"
                clearable
                outlined
                dense
                hide-details
              >
                <template v-slot:append-outer>
                  <v-icon :color="isSubjectMatched ? 'primary' : 'red'">
                    {{ isSubjectMatched ? "mdi-check-circle" : "mdi-close-circle" }}
                  </v-icon>
                </template>
              </v-text-field>
              <div>
                <v-btn
                  color="primary"
                  class="mt-4 mx-1"
                  min-width="150"
                  :loading="isCheckingSubjectCondition"
                  @click="onCheckSubject"
                  >チェック</v-btn
                >
              </div>
            </v-col>
            <v-col :cols="gridCols.half">
              <v-subheader class="px-1">テスト</v-subheader>
              <v-text-field
                v-model="condition.subjectTest"
                class="px-1"
                placeholder="サブジェクト"
                outlined
                dense
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row class="mt-2">
            <v-col :cols="gridCols.half">
              <v-subheader class="px-1">本文抽出条件</v-subheader>
              <v-text-field
                v-model="condition.bodyExtractionCondition"
                class="px-1"
                placeholder="正規表現"
                clearable
                outlined
                dense
                hide-details
              >
                <template v-slot:append-outer>
                  <v-icon :color="isBodyMatched ? 'primary' : 'red'">
                    {{ isBodyMatched ? "mdi-check-circle" : "mdi-close-circle" }}
                  </v-icon>
                </template>
              </v-text-field>
              <div>
                <v-btn
                  color="primary"
                  class="mt-4 mx-1"
                  min-width="150"
                  :loading="isCheckingBodyCondition"
                  @click="onCheckBody"
                  >チェック</v-btn
                >
              </div>
            </v-col>
            <v-col :cols="gridCols.half">
              <v-subheader class="px-1">テスト</v-subheader>
              <v-textarea
                v-model="condition.bodyTest"
                class="px-1"
                placeholder="本文"
                single-line
                outlined
                rows="8"
                hide-details
              ></v-textarea>
            </v-col>
          </v-row>
        </v-container>
      </v-card>

      <v-card v-if="conditionMode === 'change'" outlined class="my-4">
        <v-container class="pa-4">
          <v-row>
            <v-col :cols="gridCols.full">
              <v-subheader class="px-1">本文変更条件</v-subheader>
              <v-textarea
                v-model="content.bodyChangeCondition"
                class="px-1"
                placeholder="正規表現"
                single-line
                outlined
                rows="4"
                hide-details
              ></v-textarea>

              <v-alert
                v-model="changeError"
                class="mx-1 my-4 mb-0"
                color="red"
                border="left"
                elevation="1"
                dismissible
                colored-border
                type="error"
              >
                {{ changeBodyContentError && changeBodyContentError.message }}
              </v-alert>

              <div align="right">
                <v-btn
                  color="primary"
                  class="mt-4 mx-1"
                  min-width="150"
                  :loading="isChangingBodyContent"
                  @click="onChangeContent"
                  >変更</v-btn
                >
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="gridCols.half">
              <v-subheader class="px-1">テスト</v-subheader>
              <v-textarea
                v-model="content.bodyTest"
                class="px-1"
                placeholder="原文の本文"
                single-line
                outlined
                rows="8"
                hide-details
              ></v-textarea>
            </v-col>
            <v-col :cols="gridCols.half">
              <v-subheader class="px-1">結果</v-subheader>
              <v-textarea
                v-model="bodyChangeResult"
                class="px-1"
                placeholder="変更後の本文"
                single-line
                outlined
                readonly
                rows="8"
                hide-details
              ></v-textarea>
            </v-col>
          </v-row>
        </v-container>
      </v-card>

      <v-alert
        v-model="updateError"
        class="mt-2"
        color="red"
        border="left"
        elevation="1"
        dismissible
        colored-border
        type="error"
      >
        {{ updateConditionContentError && updateConditionContentError.message }}
      </v-alert>

      <div align="right" class="mb-4">
        <v-btn
          color="grey lighten-2"
          class="mx-4"
          min-width="150"
          @click="onClear"
          :style="
            hasActionPermission('hideButton', 'SegmentDelivery_ConditionDetail_Clear')
              ? hideButtonPermissionStyle()
              : ''
          "
          >クリア
        </v-btn>
        <v-btn
          color="primary"
          min-width="150"
          :loading="isUpdatingCondition || isUpdatingContent"
          @click="hasActionPermission('click', 'backendRequest') ? onSave() : showActionPermissionError()"
          :style="
            hasActionPermission('hideButton', 'SegmentDelivery_ConditionDetail_Save') ? hideButtonPermissionStyle() : ''
          "
          >保存
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import {
  FETCH_DISTRIBUTION_CONFIGS,
  CHECK_SUBJECT_CONDITION,
  CHECK_BODY_CONDITION,
  CHANGE_BODY_CONTENT,
  UPDATE_CONDITION,
  UPDATE_CONTENT,
} from "@/store/action-types";

import { mapState, mapActions, mapMutations } from "vuex";

interface GridCols {
  half;
  full;
}

export default Vue.extend({
  data() {
    return {
      gridCols: {
        half: 6,
        full: 12,
      },

      distributionConfigId: null,
      distributionConfigs: null,
      conditionMode: "extract",

      condition: {
        subjectExtractionCondition: "",
        subjectTest: "",
        bodyExtractionCondition: "",
        bodyTest: "",
      },

      content: {
        bodyChangeCondition: "",
        bodyTest: "",
      },

      isSubjectMatched: false,
      isBodyMatched: false,

      bodyChangeResult: "",

      valid: {
        subject: false,
        body: false,
      },

      changeError: false,
      updateError: false,
      btnGroupVisibility: true,
    };
  },
  watch: {
    changeBodyContentError(value) {
      if (value) {
        this.changeError = true;
      } else {
        this.changeError = false;
      }
    },
    updateConditionContentError(value) {
      if (value) {
        this.updateError = true;
      } else {
        this.updateError = false;
      }
    },
  },
  computed: {
    ...mapState({
      isFetchingDistributionConfigs: (state) => state.segments.isFetchingDistributionConfigs,

      isCheckingSubjectCondition: (state) => state.segments.isCheckingSubjectCondition,
      checkSubjectConditionError: (state) => state.segments.checkSubjectConditionError,

      isCheckingBodyCondition: (state) => state.segments.isCheckingBodyCondition,
      checkBodyConditionError: (state) => state.segments.checkBodyConditionError,

      isChangingBodyContent: (state) => state.segments.isChangingBodyContent,
      changeBodyContentError: (state) => state.segments.changeBodyContentError,

      isUpdatingCondition: (state) => state.segments.isUpdatingCondition,
      isUpdatingContent: (state) => state.segments.isUpdatingContent,
      updateConditionContentError: (state) => state.segments.updateConditionContentError,
    }),
    isNotTalkDistribution() {
      return this.distributionConfigs && !("talkName" in this.distributionConfigs);
    }
  },
  methods: {
    ...mapActions({
      fetchDistributionConfigs: FETCH_DISTRIBUTION_CONFIGS,

      checkSubjectCondition: CHECK_SUBJECT_CONDITION,
      checkBodyCondition: CHECK_BODY_CONDITION,
      changeBodyContent: CHANGE_BODY_CONTENT,

      updateCondition: UPDATE_CONDITION,
      updateContent: UPDATE_CONTENT,
    }),
    async fetchData() {
      this.distributionConfigId = this.$route.params.distributionConfigId;
      let result = await this.fetchDistributionConfigs(this.distributionConfigId);
      if (result) {
        if (result.bosaiTrigger) this.btnGroupVisibility = false;
        this.distributionConfigs = result;
        this.initializeValues();
      }
    },
    initializeValues() {
      if (this.distributionConfigs.distributionCondition) {
        this.condition.subjectExtractionCondition =
          this.distributionConfigs.distributionCondition.condition.subjectExtractionCondition;
        this.condition.subjectTest = this.distributionConfigs.distributionCondition.condition.subjectTest;
        this.condition.bodyExtractionCondition =
          this.distributionConfigs.distributionCondition.condition.bodyExtractionCondition;
        this.condition.bodyTest = this.distributionConfigs.distributionCondition.condition.bodyTest;

        this.condition.subjectExtractionCondition && this.condition.subjectTest
          ? (this.isSubjectMatched = true)
          : (this.isSubjectMatched = false);
        this.condition.bodyExtractionCondition && this.condition.bodyTest
          ? (this.isBodyMatched = true)
          : (this.isBodyMatched = false);

        this.content.bodyChangeCondition = this.distributionConfigs.distributionCondition.content.bodyChangeCondition;
        this.content.bodyTest = this.distributionConfigs.distributionCondition.content.bodyTest;
      }
    },
    async onCheckSubject() {
      try {
        this.isSubjectMatched = await this.checkSubjectCondition({
          subjectExtractionCondition: this.condition.subjectExtractionCondition,
          subjectTest: this.condition.subjectTest,
        });
      } catch {}
    },
    async onCheckBody() {
      try {
        this.isBodyMatched = await this.checkBodyCondition({
          bodyExtractionCondition: this.condition.bodyExtractionCondition,
          bodyTest: this.condition.bodyTest,
        });
      } catch {}
    },
    async onChangeContent() {
      try {
        this.bodyChangeResult = await this.changeBodyContent({
          bodyChangeCondition: this.content.bodyChangeCondition,
          bodyTest: this.content.bodyTest,
        });
      } catch {}
    },
    onSave() {
      switch (this.conditionMode) {
        case "extract":
          this.saveCondition({
            distributionConfigId: this.distributionConfigId,
            subjectExtractionCondition: this.condition.subjectExtractionCondition,
            subjectTest: this.condition.subjectTest,
            bodyExtractionCondition: this.condition.bodyExtractionCondition,
            bodyTest: this.condition.bodyTest,
          });
          break;
        case "change":
          this.saveContent({
            distributionConfigId: this.distributionConfigId,
            bodyChangeCondition: this.content.bodyChangeCondition,
            bodyTest: this.content.bodyTest,
          });
          break;
      }
    },
    async saveCondition(params) {
      try {
        await this.updateCondition(params);

        if (!this.updateConditionContentError) {
          this.$snackbar.show({
            text: "抽出条件を保存しました。",
          });
        }
      } catch (error) {}
    },
    async saveContent(params) {
      try {
        await this.updateContent(params);

        if (!this.updateConditionContentError) {
          this.$snackbar.show({
            text: "本文変更条件を保存しました。",
          });
        }
      } catch (error) {}
    },
    onClear() {
      switch (this.conditionMode) {
        case "extract":
          this.clearCondition();
          break;
        case "change":
          this.clearContent();
          break;
      }
    },
    clearCondition() {
      this.condition.subjectExtractionCondition = "";
      this.condition.subjectTest = "";
      this.condition.bodyExtractionCondition = "";
      this.condition.bodyTest = "";
    },
    clearContent() {
      this.content.bodyChangeCondition = "";
      this.content.bodyTest = "";
      this.bodyChangeResult = "";
    },
  },
  created() {
    window.scrollTo(0, 0);
    this.fetchData();
  },
});
</script>
