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
  <v-dialog v-model="show" max-width="1000" scrollable>
    <v-card>
      <v-system-bar color="primary" dark height="5"></v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title>詳細</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <v-card-text>
        <template v-for="(value, name) in objectName">
          <v-row :key="'row-' + name" class="px-4">
            <v-col :key="'col-' + name" :cols="2">
              <strong>{{ value }}</strong>
            </v-col>
            <v-col :key="'col-item-' + name">
              <template v-if="item && name === 'body'">
                <div class="mail-body-format">
                  {{ item ? item.body : "ーー" }}
                </div>
              </template>
              <template v-else-if="item && name === 'status'">
                <div :class="statusColor(item.status)">
                  {{ item ? convertToJapanese(item.status) : "ーー" }}
                </div>
              </template>
              <template v-else-if="item && name === 'createdAt'">
                {{ item.createdAt === "ーー" ? "ーー" : formatUnixToYYYYMMDHHmmss(item.createdAt) }}
              </template>
              <template v-else-if="item && name === 'finishedAt'">
                {{ item.finishedAt === "ーー" ? "ーー" : formatUnixToYYYYMMDHHmmss(item.finishedAt) }}
              </template>
              <template v-else>
                {{ item ? item[name] : "ーー" }}
              </template>
            </v-col>
          </v-row>
        </template>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="px-4">
        <v-container>
          <v-alert
            v-model="resendError"
            class="mt-4"
            color="red"
            border="left"
            elevation="1"
            dismissible
            colored-border
            type="error"
          >
            {{ resendDistributionItemError && resendDistributionItemError.message }}
          </v-alert>
          <v-row>
            <v-col>
              <v-btn
                color="primary"
                block
                elevation="1"
                :loading="isResendingDistributionItem"
                :disabled="!(item && item.status === 'ERROR') || isResendingDistributionItem"
                @click="resendItem()"
              >
                <v-icon left>mdi-send</v-icon>
                再送
              </v-btn>
            </v-col>
            <v-col>
              <v-btn color="grey lighten-2" block elevation="1" @click="show = false">
                <v-icon left>mdi-close-box-outline</v-icon>
                閉じる
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import { RESEND_DISTRIBUTION_ITEM } from "@/store/action-types";
import { SET_IS_RESENDING_DISTRIBUTION_ITEM, SET_RESEND_DISTRIBUTION_ITEM_ERROR } from "@/store/mutation-types";
import DatetimeFormatter from "@/mixins/DatetimeFormatter";

interface LocalState {
  objectName: any;
  resendError: boolean;
  resendFinished: boolean;
}

export default Vue.extend({
  props: {
    visible: Boolean,
    close: Function,
    item: Object,
    refreshTable: Function,
  },
  data(): LocalState {
    return {
      objectName: {
        id: "ID",
        subject: "件名",
        body: "本文",
        createdAt: "作成日時",
        finishedAt: "完了日時",
        status: "状況",
        error: "エラー",
        deliveriesCount: "配信成功の数",
        failuresCount: "配信失敗の数",
      },
      resendError: false,
      resendFinished: false,
    };
  },
  mixins: [DatetimeFormatter],
  computed: {
    ...mapState({
      isResendingDistributionItem: (state: any) => state.segments.isResendingDistributionItem,
      resendDistributionItemError: (state: any) => state.segments.resendDistributionItemError,
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
    }),
    ...mapMutations({
      setResendDistributionItemError: SET_RESEND_DISTRIBUTION_ITEM_ERROR,
    }),
    statusColor(value: any): string {
      switch (value) {
        case "FINISHED":
          return "primary--text";
        case "ERROR":
          return "red--text";
        default:
          return "orange--text";
      }
    },
    resendItem(): void {
      this.resendDistributionItem(this.item);
    },
    convertToJapanese(value: any): any {
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
      if (value === "ERROR") {
        return "エラー";
      }
      if (value === "IGNORED") {
        return "送信対象者無し";
      }
      if (value === "TALK") {
        return "ーー";
      }
      return value;
    },
  },
});
</script>
<style scoped>

.mail-body-format {
  white-space: pre-line;
}
</style>
