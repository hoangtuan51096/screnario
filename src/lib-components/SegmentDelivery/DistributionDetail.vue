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
      <div class="text-right mt-4 row">
        <router-link :to="{ name: 'SegmentDeliveryPage' }" class="list-item-link">
          <v-btn color="primary" class="mx-4" text>
            <v-icon left>mdi-arrow-left-circle</v-icon>
            配信一覧に戻る
          </v-btn>
        </router-link>
        <v-spacer></v-spacer>
        <template>
          <v-btn
            class="mr-3"
            color="primary"
            elevation="1"
            :loading="isResendingDistributionItem"
            :disabled="!(item && item.state === 'ERROR') || isResendingDistributionItem"
            :style="
              hasActionPermission('hideButton', 'SegmentDelivery_DistributionDetail_ResendDistribution')
                ? hideButtonPermissionStyle()
                : ''
            "
            @click="resendItem()"
          >
            <v-icon left>mdi-send</v-icon>
            再送
          </v-btn>
          <router-link :to="onEditDistribution()" class="list-item-link" v-show="editVisibility">
            <v-btn color="primary" class="mr-3">
              <v-icon left>mdi-pencil</v-icon>
              修正
            </v-btn>
          </router-link>
          <router-link :to="onCopyDistribution()" class="list-item-link" v-show="copyVisibility">
            <v-btn color="primary" class="mr-3">
              <v-icon left>mdi-pencil</v-icon>
              複写して新規作成
            </v-btn>
          </router-link>
        </template>
      </div>
      <v-card outlined class="mt-4 mb-4">
        <v-toolbar flat dense>
          <v-toolbar-title>配信詳細</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-divider></v-divider>
        <template v-for="(value, name) in objectName">
          <v-row no-gutters class="my-3" :key="'row-' + name">
            <v-col :key="'col-' + name" :cols="3">
              <v-subheader
                ><strong>{{ value }}</strong></v-subheader
              >
            </v-col>
            <v-col :key="'col-item-' + name">
              <div class="body-2 py-2 px-4">
                <div v-if="item && name === 'id'">
                  {{ item.id }}
                </div>
                <div v-if="item && name === 'mailSubject'">
                  <div class="mail-body-format">
                    {{ item.type === "distributionDelivery" ? item.mailSubject : "ーー" }}
                  </div>
                </div>
                <div v-if="item && name === 'mailBody' && item.type === 'distributionDelivery'">
                  <div class="mail-body-format">
                    <v-textarea
                      :value="item.type === 'distributionDelivery' ? item.mailBody : 'ーー'"
                      readonly
                      outlined
                      filled
                    ></v-textarea>
                  </div>
                </div>
                <div v-if="item && name === 'state'">
                  <div :class="statusColor(item.state)">
                    {{ item ? convertToJapanese(item.state) : "ーー" }}
                  </div>
                </div>
                <div v-if="item && name === 'error'" :class="statusColor(item.state)">
                  {{ item.errorMessage ? item.errorMessage : "ーー" }}
                </div>
                <div v-if="item && name === 'name'">
                  {{ item.name ? item.name : "ーー" }}
                </div>
                <div v-if="item && name === 'createdAt'">
                  {{ item.createdAt ? formatUnixToYYYYMMDHHmmss(item.createdAt) : "ーー" }}
                </div>
                <div v-if="item && name === 'completedAt'">
                  {{ item.completedAt ? formatUnixToYYYYMMDHHmmss(item.completedAt) : "ーー" }}
                </div>
                <div v-if="item && name === 'deliverySuccessCount'">
                  {{ item.deliverySuccessCount ? item.deliverySuccessCount : "ーー" }}
                </div>
                <div v-if="item && name === 'deliveryFailureCount'">
                  {{ item.deliveryFailureCount ? item.deliveryFailureCount : "ーー" }}
                </div>
              </div>
            </v-col>
          </v-row>
        </template>
      </v-card>
      <div class="text-right">
        <template>
          <v-btn
            v-if="item.type === 'distributionDelivery#v2' && item.state !== 'FINISHED' && item.startType !== 'HOME'"
            elevation="2"
            color="error"
            dark
            :loading="isDeletingDistributionItem"
            @click="deleteItem"
            :style="
              hasActionPermission('hideButton', 'SegmentDelivery_DistributionDetail_DeleteDistribution')
                ? hideButtonPermissionStyle()
                : ''
            "
          >
            <v-icon left>mdi-delete-forever-outline</v-icon>
            配信削除
          </v-btn>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import {
  RESEND_DISTRIBUTION_ITEM,
  FETCH_DISTRIBUTION_DETAIL_BY_ID,
  DELETE_DISTRIBUTION_ITEM,
} from "@/store/action-types";
import {
  SET_IS_RESENDING_DISTRIBUTION_ITEM,
  SET_RESEND_DISTRIBUTION_ITEM_ERROR,
  SET_IS_FETCHING_DISTRIBUTION_DETAIL,
  SET_FETCH_DISTRIBUTION_DETAIL_ERROR,
} from "@/store/mutation-types";
import DatetimeFormatter from "@/mixins/DatetimeFormatter";

export default Vue.extend({
  props: {
    visible: Boolean,
    close: Function,
    refreshTable: Function,
  },
  data() {
    return {
      objectName: {
        id: "ID",
        mailSubject: "件名",
        mailBody: "本文",
        createdAt: "作成日時",
        completedAt: "完了日時",
        state: "状況",
        error: "エラー",
        deliverySuccessCount: "配信成功の数",
        deliveryFailureCount: "配信失敗の数",
      },
      resendError: false,
      resendFinished: false,
      distributionId: 0,
      editVisibility: false,
      copyVisibility: false,
    };
  },
  mixins: [DatetimeFormatter],
  computed: {
    ...mapState({
      isResendingDistributionItem: (state) => state.segments.isResendingDistributionItem,
      resendDistributionItemError: (state) => state.segments.resendDistributionItemError,
      isFetchingDistributionDetail: (state) => state.segments.isFetchingDistributionDetail,
      item: (state) => state.segments.distributionDetail,
      isDeletingDistributionItem: (state) => state.segments.isDeletingDistributionItem,
      deleteDistributionItemError: (state) => state.segments.deleteDistributionItemError,
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
  },
  watch: {
    resendDistributionItemError(value) {
      if (value) {
        this.resendError = true;
      } else {
        this.resendError = false;
      }
    },
    isResendingDistributionItem(value) {
      if (!this.resendError && !value) {
        this.$snackbar.show({
          text: "再送成功しました",
        });
        this.show = false;
        this.$emit("refreshTable");
      }
    },
  },
  methods: {
    ...mapActions({
      resendDistributionItem: RESEND_DISTRIBUTION_ITEM,
      fetchById: FETCH_DISTRIBUTION_DETAIL_BY_ID,
      deleteDistributionItem: DELETE_DISTRIBUTION_ITEM,
    }),
    ...mapMutations({
      setResendDistributionItemError: SET_RESEND_DISTRIBUTION_ITEM_ERROR,
    }),
    statusColor(value) {
      switch (value) {
        case "FINISHED":
          return "primary--text";
        case "ERROR":
          return "red--text";
        default:
          return "orange--text";
      }
    },
    resendItem() {
      this.resendDistributionItem(this.item);
    },
    onEditDistribution() {
      return {
        name: "DistributionEditPage",
        params: {
          distributionId: this.item.id,
        },
      };
    },
    onCopyDistribution() {
      return {
        name: "DistributionCopyPage",
        params: {
          distCopiedDetail: this.item.id,
        },
      };
    },
    convertToJapanese(value) {
      if (value === "ALL") {
        return "全て";
      }
      if (value === "NEW") {
        return "処理待機中";
      }
      if (value === "QUEUED") {
        return "処理中";
      }
      if (value === "FINISHED") {
        return "完了";
      }
      if (value === "DRAFT") {
        return "下書き";
      }
      if (value === "ERROR") {
        return "エラー";
      }
      if (value === "IGNORED") {
        return "送信対象者無し";
      }
      if (value === "TALK") {
        return "ーー";
      }
      if (value === "SCHEDULED") {
        return "予約";
      }
      return value;
    },
    async dataProcessing() {
      await this.fetchById(this.$route.params.distributionId);
      if (this.item.type == "distributionDelivery#v2") {
        this.objectName = {
          id: "配信 ID",
          name: "配信名",
          createdAt: "作成日時",
          completedAt: "完了日時",
          state: "状況",
          error: "エラー",
          deliverySuccessCount: "配信成功の数",
          deliveryFailureCount: "配信失敗の数",
        };
      }
      if (
        this.item.type == "distributionDelivery#v2" && this.item.startType !== 'HOME' &&
        (this.item.state == "DRAFT" || this.item.state == "SCHEDULED" || this.item.state == "FINISHED")
      )
        this.copyVisibility = true;
      if (
        this.item.type == "distributionDelivery#v2" && this.item.startType !== 'HOME' &&
        (this.item.state == "DRAFT" || this.item.state == "SCHEDULED" || this.item.state == "ERROR")
      )
        this.editVisibility = true;
    },
    async deleteItem() {
      this.$dialog.show({
        title: "配信削除確認",
        text: "この配信を削除してもよろしいですか？",
        type: "error",
        btnConfirmTitle: "はい",
        onConfirm: async () => {
          try {
            let response = await this.deleteDistributionItem(this.$route.params.distributionId);
            if (this.deleteDistributionItemError === "ERROR") {
              this.$snackbar.show({
                text: "削除に失敗しました。",
              });
            } else {
              this.$snackbar.show({
                text: "削除しました。",
              });
              this.$router.push({ name: "SegmentDeliveryPage" });
            }
          } catch (error) {
            console.log(error);
          }
        },
      });
    },
  },
  created() {
    window.scrollTo(0, 0);
    this.dataProcessing();
  },
});
</script>

<style scoped>
.mail-body-format {
  white-space: pre-line;
}
</style>
