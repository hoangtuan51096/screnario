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
<style scoped>
  .outer-distribution-tabs {
    margin-bottom: 1em;
  }
</style>
<template>
  <div>
    <v-container class="my-4" fluid>
      <v-tabs v-model="tab" grow class="outer-distribution-tabs">
        <v-tabs-slider></v-tabs-slider>
        <v-tab href="#mail-delivery-list">
          <span>メール転送配信</span>
        </v-tab>
        <v-tab href="#talk-delivery-list">
          <span>トーク配信</span>
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <!-- メール転送配信 -->
        <v-tab-item value="mail-delivery-list">
          <v-row no-gutters>
            <v-spacer></v-spacer>
            <v-btn @click="handleReloadMailDeliveryList" class="mr-3" color="secondary">
              <v-icon left>
                {{ isFetchingSegmentDeliveries ? "mdi-cached mdi-spin" : "mdi-cached" }}
              </v-icon>
              データ更新
            </v-btn>
            <v-btn @click="openDataModal()" class="mr-3" color="primary">
              <v-icon left>mdi-plus</v-icon>
              新規作成
            </v-btn>
          </v-row>
          <v-data-table
            v-model="selected"
            :headers="mailHeaders"
            :items="filteredMailDistributions"
            item-key="id"
            :loading="isFetchingMailDeliveryList"
            :items-per-page="perOnPage"
            :footer-props="{ 'items-per-page-options': [10, 20, 50, 100] }"
            :page.sync="page"
          >
            <template v-slot:item.deliveryTitle="{ item }">
              <a @click="openDataModal(item)"> {{ item.deliveryTitle }} </a>
            </template>
            <template v-slot:item.distributionCondition="{ item }">
              <v-btn color="primary" :to="onConditionDetail(item)" small>設定 </v-btn>
            </template>
            <template v-slot:item.enabled="{ item }">
              <div>
                <span v-if="item.enabled" style="color: green;">有効</span>
                <span v-else style="color: red;">無効</span>
              </div>
            </template>
            <template v-slot:footer>
              <div></div>
            </template>
          </v-data-table>
        </v-tab-item>
        <!-- トーク配信 -->
        <v-tab-item value="talk-delivery-list">
          <v-row no-gutters>
            <v-spacer></v-spacer>
            <v-btn @click="handleReloadTalkDeliveryList" class="mr-3" color="secondary">
              <v-icon left>
                {{ isFetchingSegmentDeliveries ? "mdi-cached mdi-spin" : "mdi-cached" }}
              </v-icon>
              データ更新
            </v-btn>
            <v-btn @click="openTalkModal()" class="mr-3" color="primary"
              ><v-icon left>mdi-plus</v-icon>
              新規作成
            </v-btn>
          </v-row>
          <v-data-table
            v-model="selected"
            :headers="talkHeaders"
            :items="filteredTalkDistributions"
            item-key="id"
            :loading="isFetchingTalkDeliveryList"
            :items-per-page="perOnPage"
            :footer-props="{ 'items-per-page-options': [10, 20, 50, 100] }"
            :page.sync="page"
          >
            <template v-slot:item.deliveryTitle="{ item }">
              <a @click="openTalkModal(item)">{{ item.deliveryTitle }}</a
              >
            </template>
            <template v-slot:item.environment="{ item }">
              {{ getEnvironmentDisplay(item.environment) }}
            </template>
            <template v-slot:item.distributionCondition="{ item }">
              <v-btn color="primary" :to="onConditionDetail(item)" small>設定 </v-btn>
            </template>
            <template v-slot:item.enabled="{ item }">
              <div>
                <span v-if="item.enabled" style="color: green;">有効</span>
                <span v-else style="color: red;">無効</span>
              </div>
            </template>
            <template v-slot:footer>
              <div></div>
            </template>
          </v-data-table>
        </v-tab-item>
      </v-tabs-items>
    </v-container>
    <DataModal :visible="showDataModal" @close="closeDataModal" :item="selectedItem" />
    <TalkModal :visible="showTalkModal" @close="closeTalkModal" :item="selectedItem" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import { FETCH_MAIL_DELIVERY_LIST, FETCH_TALK_DELIVERY_LIST, FETCH_ALL_SEGMENT_DELIVERIES } from "@/store/action-types";
import { UPDATE_SEGMENT_PAGE } from "@/store/mutation-types";
import { TALK_DELIVERY_ENVIRONMENT_DISPLAY_TEXT } from "@/store/modules/segments/segments.constants"

import DataModal from "../components/DataModal/index.vue";
import TalkModal from "../components/TalkModal/index.vue";

import { emitSnackbar } from "@/utils/emitComponents";

interface TextValuePair {
  text: string;
  value: string;
}

interface LocalState {
  tab: string;
  perOnPage: number;
  selected: Array<any>;
  mailHeaders: Array<TextValuePair>;
  talkHeaders: Array<TextValuePair>;
  showDataModal: boolean;
  showTalkModal: boolean;
  selectedItem: any;
  distributionCondition: any;
}

export default Vue.extend({
  components: { DataModal, TalkModal },
  data(): LocalState {
    return {
      tab: "mail-delivery-list",
      perOnPage: 10,
      selected: [],
      mailHeaders: [
        { text: "配信名", value: "deliveryTitle" },
        { text: "帳票", value: "survey" },
        { text: "配信条件", value: "distributionCondition" },
        { text: "有効/無効", value: "enabled" },
        { text: "次の配信日時", value: "nextDelivery" },
        { text: "前回の配信日時", value: "lastDelivery" },
      ],
      talkHeaders: [
        { text: "配信名", value: "deliveryTitle" },
        { text: "トーク名", value: "talkName" },
        { text: "環境", value: "environment" },
        { text: "配信条件", value: "distributionCondition" },
        { text: "有効/無効", value: "enabled" }
      ],
      showDataModal: false,
      showTalkModal: false,
      selectedItem: null,
      distributionCondition: null,
    };
  },
  watch: {
    async tab(value) {
      switch(value) {
        case "mail-delivery-list":
          if (!this.mailDeliveryList || this.mailDeliveryList.length === 0) {
            await this.fetchMailDeliveryList();
          }
        break;
        case "talk-delivery-list":
          if (!this.talkDeliveryList || this.talkDeliveryList.length === 0) {
            await this.fetchTalkDeliveryList();
          }
        break;
      }
      this.$emit("outerSegmentTabChange", value);
    },
    fetchMailDeliveryListError(value) {
      if (value) {
        emitSnackbar(this.$snackbar, value, "error");
      }
    },
    fetchTalkDeliveryListError(value) {
      if (value) {
        emitSnackbar(this.$snackbar, value, "error");
      }
    }
  },
  computed: {
    ...mapState({
      mailDeliveryList: (state: any) => state.segments.mailDeliveryList,
      talkDeliveryList: (state: any) => state.segments.talkDeliveryList,

      isFetchingMailDeliveryList: (state: any) => state.segments.isFetchingMailDeliveryList,
      isFetchingTalkDeliveryList: (state: any) => state.segments.isFetchingTalkDeliveryList,

      fetchMailDeliveryListError: (state: any) => state.segments.fetchMailDeliveryListError,
      fetchTalkDeliveryListError: (state: any) => state.segments.fetchTalkDeliveryListError,

      segmentsList: (state: any) => state.segments.segmentsList,
      isFetchingSegmentDeliveries: (state: any) => state.segments.isFetchingSegmentDeliveries,
      fetchSegmentDeliveriesError: (state: any) => state.segments.fetchSegmentDeliveriesError,
      currentPage: (state: any) => state.segments.currentPage,
    }),
    ...mapGetters({
      filteredMailDistributions: "filteredMailDistributions",
      filteredTalkDistributions: "filteredTalkDistributions",
    }),
    page: {
      get(): number {
        return this.currentPage;
      },
      set(value: number): void {
        this.updatePage(value);
      },
    },
  },
  methods: {
    ...mapMutations({
      updatePage: UPDATE_SEGMENT_PAGE,
    }),
    ...mapActions({
      fetchMailDeliveryList: FETCH_MAIL_DELIVERY_LIST,
      fetchTalkDeliveryList: FETCH_TALK_DELIVERY_LIST,

      fetchSegmentDeliveries: FETCH_ALL_SEGMENT_DELIVERIES,
    }),
    async handleReloadMailDeliveryList(): Promise<void> {
      await this.fetchMailDeliveryList().then(() => {
        emitSnackbar(this.$snackbar, "メール配信データを更新しました。");
      })
    },
    async handleReloadTalkDeliveryList(): Promise<void> {
      await this.fetchTalkDeliveryList().then(() => {
        emitSnackbar(this.$snackbar, "トーク配信データを更新しました。");
      })
    },
    getEnvironmentDisplay(env: any): any {
      return TALK_DELIVERY_ENVIRONMENT_DISPLAY_TEXT[env] ? TALK_DELIVERY_ENVIRONMENT_DISPLAY_TEXT[env] : "不明";
    },
    openDataModal(item: any): void {
      item ? (this.selectedItem = item) : null;
      this.showDataModal = true;
    },
    openTalkModal(item: any): void {
      item ? (this.selectedItem = item) : null;
      this.showTalkModal = true;
    },
    closeTalkModal(): void {
      this.selectedItem = null;
      this.showTalkModal = false;
    },
    closeDataModal(): void {
      this.selectedItem = null;
      this.showDataModal = false;
    },
    onConditionDetail(item: any): any {
      return {
        name: "ConditionDetail",
        params: {
          distributionConfigId: item.distributionConfigId,
        },
      };
    }
  },
  created() {
    this.fetchMailDeliveryList();
  },
});
</script>
