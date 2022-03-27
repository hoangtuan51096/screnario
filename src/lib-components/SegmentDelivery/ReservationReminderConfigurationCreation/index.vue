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
    <v-overlay :opacity="0.2" v-show="isLoading">
      <content-loading :size="50" />
    </v-overlay>
    <div>
      <div class="text-right ma-4 row">
        <router-link :to="{ name: 'SegmentDeliveryPage' }" class="list-item-link">
          <v-btn color="primary" text>
            <v-icon left>mdi-arrow-left-circle</v-icon>
            配信リストに戻る
          </v-btn>
        </router-link>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          class="mr-3 button-update"
          elevation="0"
          v-show="isSelectedSurveyId"
          :disabled="!canUpdate"
          :style="
            hasActionPermission('hideButton', 'SegmentDelivery_DistributionCreation_SendDistribution')
              ? hideButtonPermissionStyle()
              : ''
          "
          @click="hasActionPermission('click', 'backendRequest') ? handleUpsertReminder() : showActionPermissionError()"
        >
          <v-icon left>mdi-content-save-outline</v-icon>
          保存
        </v-btn>
        <v-btn
            color="error"
            class="button-update"
            elevation="0"
            v-show="isSelectedSurveyId"
            :disabled="!canDelete"
            @click="hasActionPermission('click', 'backendRequest') ? handleDeleteReminder() : showActionPermissionError()"
            :style="
              hasActionPermission('hideButton', 'SegmentDelivery_DistributionCreation_SendDistribution')
                ? hideButtonPermissionStyle()
                : ''
            "
          >
            <v-icon left>mdi-delete-forever-outline</v-icon>
            設定削除
          </v-btn>
      </div>
      <!-- select survey -->
      <SurveySelector />
      <div class="my-4"></div>
      <!-- select category -->
      <CateorySelector />
      <v-row v-if="!hasPermissionForViewingReminderConfig && !isFetchingReminderConfig">
        <v-col class="ma-4">選択中の帳票・分類のリマインド配信設定を閲覧する権限がありません。</v-col>
      </v-row>
      <v-form ref="form" lazy-validation v-else-if="isSelectedSurveyId && !isFetchingReminderConfig">
        <div class="mt-4">
          <v-btn color="primary"
            class="mt-5 ml-4"
            :disabled="isMaxSettings()"
            :min-width="150"
            @click="addNewSettings"
          >
            <v-icon>mdi mdi-playlist-plus</v-icon>
            配信設定追加
          </v-btn>
        </div>
        <div v-for="(settings, index1) in displayReminderSettings" :key="index1" class="mt-4">
          <v-row no-gutters class="mb-2">
            <v-col :cols="2">
              <v-subheader>
                リマインド配信日時
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon class="mx-1" v-on="on">mdi-information-outline</v-icon>
                  </template>
                  <span>予約日の0日前に設定した場合は、予約日当日にリマインド配信されます。</span>
                </v-tooltip>
              </v-subheader>
            </v-col>
            <v-col :cols="1" class="align-items-center">
              <span class="ml-4">予約日の</span>
            </v-col>
            <v-col :cols="2" class="align-items-center">
              <v-text-field
                v-model="settings.daysBefore"
                dense
                hide-details="auto"
                outlined
                type="number"
                :min="0"
                :max="9"
                :rules="daysBeforRules"
              ></v-text-field>
            </v-col>
            <v-col :cols="1" class="align-items-center">
              <span class="ml-2">日前</span>
            </v-col>
            <v-col :cols="2" class="align-items-center">
              <v-menu
                v-model="timePickerProperty[index1].show"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ attrs }">
                  <v-text-field
                    v-model="settings.sendTime"
                    outlined
                    dense
                    hide-details
                    v-bind="attrs"
                    @click="showTimePicker(index1)"
                  ></v-text-field>
                </template>
                <v-time-picker
                  class="time-picker"
                  elevation="15"
                  format="24hr"
                  placeholder="hh:mm"
                  v-model="timePickerProperty[index1].value"
                  v-show="timePickerProperty[index1].show"
                  @click:minute="selectTime(index1)"
                ></v-time-picker>
              </v-menu>
            </v-col>
            <div class="align-items-center">
              <v-icon class="ml-4" :disabled="isMinSettings()" @click="removeReminderSettings(index1)">mdi-trash-can-outline</v-icon>
            </div>
          </v-row>
          <!-- 配信メッセージ -->
          <v-row>
            <v-col :cols="2">
              <v-subheader>配信メッセージ</v-subheader>
            </v-col>
            <v-col :cols="10">
              <div v-for="(message, index2) in settings.messages" :key="index2">
                <v-card class="mx-4" outlined tile>
                  <v-toolbar color="grey lighten-2" dense elevation="0">
                    <v-btn-toggle :value="message.type" dense group mandatory @change="onChangeMessageTypes($event, index1, index2)">
                      <v-btn value="text" text>
                        <v-icon>mdi-chat-outline</v-icon>
                      </v-btn>
                      <v-btn value="image" text>
                        <v-icon>mdi-image-outline</v-icon>
                      </v-btn>
                    </v-btn-toggle>
                    <v-spacer></v-spacer>
                    <v-btn-toggle dense group>
                      <v-btn
                        text
                        :disabled="isMinMessages(index1)"
                        :value="3"
                        @click="removeMessage(index1, index2)"
                      >
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-btn-toggle>
                  </v-toolbar>
                  <!-- messages -->
                  <v-container>
                    <v-textarea
                      v-if="message.type === 'text'"
                      class="px-1 my-4"
                      hide-details="auto"
                      maxlength="5000"
                      outlined
                      placeholder="テキストを入力"
                      rows="4"
                      single-line
                      :value="message.text"
                      :rules="textMessageRules"
                      @input="onChangeTextMessage($event, index1, index2)"
                    ></v-textarea>
                    <input
                      type="file"
                      class="d-none"
                      accept="image/png, image/jpeg"
                      :ref='"inputFile" + index1 + index2'
                      @change="onChangeImageMessage($event, index1, index2)"
                    />
                    <v-card v-if="message.type === 'image'" class="mx-1 my-4" outlined hide-details>
                      <v-container fluid center>
                        <v-btn
                          v-if="!message.imageUrl"
                          color="primary"
                          class="my-3"
                          elevation="0"
                          @click="uploadImage(index1, index2)"
                          >写真をアップロード
                        </v-btn>
                        <v-alert v-model="message.error.value" class="my-3 body-2" color="red" type="error" text>
                          {{ message.error.message }}
                        </v-alert>
                        <div v-if="message.imageUrl && !message.error.value">
                          <v-img class="my-4" :src="message.imageUrl" max-height="150" contain></v-img>
                          <v-btn color="error" class="my-2" elevation="0" @click="removeImage(index1, index2)">削除 </v-btn>
                        </div>
                      </v-container>
                      <div class="text-left mb-2">
                        <v-subheader class="caption">
                          ファイル形式：JPG、JPEG、PNG<br />
                          ファイルサイズ：10MB以下 (LINEトーク上でプレビュー表示される画像は、システム内部で圧縮された画像になります)
                        </v-subheader>
                      </div>
                    </v-card>
                  </v-container>
                </v-card>
              </div>
              <div>
                <v-btn color="primary"
                  class="ml-4 mt-3 mb-4"
                  elevation="0"
                  outlined
                  :disabled="isMaxMessages(index1)"
                  @click="addMessage(index1)"
                >
                  <v-icon left>mdi-plus</v-icon>
                  追加
                </v-btn>
              </div>
            </v-col>
          </v-row>
          <v-divider class="mx-4"></v-divider>
        </div>
      </v-form>
      <v-row v-else-if="!isFetchingReminderConfig">
        <v-col class="ma-4">帳票を選択してください。</v-col>
      </v-row>
      <v-container fluid>
        <div class="text-right mx-2">
          <v-btn
            color="primary"
            class="mr-3 button-update"
            elevation="0"
            v-show="isSelectedSurveyId"
            :disabled="!canUpdate"
            :style="
              hasActionPermission('hideButton', 'SegmentDelivery_DistributionCreation_SendDistribution')
                ? hideButtonPermissionStyle()
                : ''
            "
            @click="hasActionPermission('click', 'backendRequest') ? handleUpsertReminder() : showActionPermissionError()"
          >
            <v-icon left>mdi-content-save-outline</v-icon>
            保存
          </v-btn>
          <v-btn
            color="error"
            class="button-update"
            elevation="0"
            v-show="isSelectedSurveyId"
            :disabled="!canDelete"
            @click="hasActionPermission('click', 'backendRequest') ? handleDeleteReminder() : showActionPermissionError()"
            :style="
              hasActionPermission('hideButton', 'SegmentDelivery_DistributionCreation_SendDistribution')
                ? hideButtonPermissionStyle()
                : ''
            "
          >
            <v-icon left>mdi-delete-forever-outline</v-icon>
            設定削除
          </v-btn>
        </div>
      </v-container>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapState, mapMutations } from 'vuex';

import {
  UPSERT_REMINDER_CONFIGURATION,
  DELETE_REMINDER_CONFIGURATION,
  FETCH_REMINDER_CONFIGURATION,
  FETCH_ALL_SURVEY_CONFIGS,
  FETCH_ALL_REMIND_CATEGORIES,
} from '@/store/action-types';

import {
  ADD_REMINDER_SETTINGS,
  REMOVE_REMINDER_SETTINGS,
  ADD_REMINDER_SETTINGS_MESSAGE,
  REMOVE_REMINDER_SETTINGS_MESSAGE,
  SET_REMINDER_SETTINGS_MESSAGE_TYPE,
  SET_REMINDER_SETTINGS_TEXT_MESSAGE,
  SET_REMINDER_SETTINGS_IMAGE_MESSAGE,
  SET_REMINDER_SETTINGS_SEND_TIME,
  SET_SELECTED_SURVEY_ID,
  SET_SELECTED_CATEGORY,
  SET_DISPLAY_REMINDER_SETTINGS,
  SET_REMINDER_CONFIGURATION,
} from '@/store/mutation-types';

import {
  DEFAULT_REMINDER_SETTINGS,
} from '@/store/modules/segments/segments.constants';

import { cloneDeep } from 'lodash';

import CateorySelector from './components/CategorySelector.vue';
import SurveySelector from './components/SurveySelector.vue';

export default Vue.extend({
  data() {
    return {
      textMessageRules: [(v) => !!v || ''],
      daysBeforRules: [(v) =>  (!!v && v >= 0) || ''],
      sendTimeRules: [(v) => !!v || ''],
      timePickerProperty: [
        {
          value: '12:00',
          show: false,
          targetIndex: null,
        },
        {
          value: '12:00',
          show: false,
          targetIndex: null,
        }
      ],
      reminderSettings: [],
    };
  },
  components: {
    CateorySelector,
    SurveySelector,
  },
  computed: {
    ...mapState({
      isFetchingReminderConfig: (state) => state.segments.isFetchingReminderConfig,
      displayReminderSettings: (state) => state.segments.displayReminderSettings,
      isUpdatingReminderConfig: (state) => state.segments.isUpdatingReminderConfig,
      isUpdatingReminderConfigError: (state) => state.segments.isUpdatingReminderConfigError,
      selectedCategoryId: (state) => state.segments.selectedCategoryId,
      isLoadingCategories: (state) => state.segments.isFetchingAllRemindCategories,
      selectedSurveyId: (state) => state.segments.selectedSurveyId,
      isFetchingAllSurveyConfigs: (state)  => state.segments.isFetchingAllSurveyConfigs,
      reminderConfiguration: (state) => state.segments.reminderConfiguration,
      surveyConfigs: (state)  => state.segments.allSurveyConfigs,
      categories: (state) => state.segments.allReminderCategories,
      hasPermissionForViewingReminderConfig: (state) => state.segments.hasPermissionForViewingReminderConfig,

      permissionsFromTeam: (state) => state.auth.permissionsFromTeam,
    }),
    isAdministrator() {
      return this.permissionsFromTeam.isAdministrator;
    },
    isSelectedSurveyId() {
      return this.selectedSurveyId !== null;
    },
    isSelectedCategoryId() {
      return this.selectedCategoryId !== null;
    },
    isLoading() {
      return this.isLoadingCategories
        || this.isFetchingAllSurveyConfigs
        || this.isFetchingReminderConfig
        || this.isUpdatingReminderConfig;
    },
    isNewSettings() {
      return this.reminderConfiguration === null;
    },
    canUpdate() {
      return this.isAdministrator ? this.isSelectedSurveyId : this.isSelectedSurveyId && this.isSelectedCategoryId;
    },
    canDelete() {
      if (this.isNewSettings) {
        return false;
      }
      return this.canUpdate;
    },
  },
  methods: {
    ...mapActions({
      upsertReminderConfig: UPSERT_REMINDER_CONFIGURATION,
      deleteReminderConfig: DELETE_REMINDER_CONFIGURATION,
      fetchReminderConfig: FETCH_REMINDER_CONFIGURATION,
      fetchAllSurveyConfigs: FETCH_ALL_SURVEY_CONFIGS,
      fetchAllReminderCategories: FETCH_ALL_REMIND_CATEGORIES,
    }),
    ...mapMutations({
      addReminderSettings: ADD_REMINDER_SETTINGS,
      toggleMessageType: SET_REMINDER_SETTINGS_MESSAGE_TYPE,
      addReminderSettingsMessage: ADD_REMINDER_SETTINGS_MESSAGE,
      removeReminderSettingsMessage: REMOVE_REMINDER_SETTINGS_MESSAGE,
      updateReminderSettingsTextMessage: SET_REMINDER_SETTINGS_TEXT_MESSAGE,
      updateReminderSettingsImageMessage: SET_REMINDER_SETTINGS_IMAGE_MESSAGE,
      removeReminderSettings: REMOVE_REMINDER_SETTINGS,
      updateReminderSettingsSendTime: SET_REMINDER_SETTINGS_SEND_TIME,
      setSelectedSurveyId: SET_SELECTED_SURVEY_ID,
      setSelectedCategoryId: SET_SELECTED_CATEGORY,
      setDisplayReminderSettings: SET_DISPLAY_REMINDER_SETTINGS,
      setReminderConfiguration: SET_REMINDER_CONFIGURATION,
    }),
    onChangeMessageTypes(value , index1, index2) {
      this.toggleMessageType({
        type: value,
        index1,
        index2
      });
    },
    onChangeTextMessage(value, index1, index2) {
      this.updateReminderSettingsTextMessage({
        text: value,
        index1,
        index2,
      });
    },
    addMessage(index) {
      const message = {
        text: '',
        type: 'text',
        imageUrl: '',
        file: null,
        error: {
          value: false,
          message: ''
        }
      };
      this.addReminderSettingsMessage({ message, index });
    },
    removeMessage(index1, index2) {
      this.removeReminderSettingsMessage({ index1, index2 });
    },
    uploadImage(index1, index2) {
      const refName = `inputFile${index1}${index2}`;
      this.$refs[refName][0].click();
    },
    removeImage(index1, index2) {
      const image = {
        imageUrl: '',
        file: null,
        error: { value: false, message: '' },
      };
      this.updateReminderSettingsImageMessage({
        image,
        index1,
        index2
      });
    },
    onChangeImageMessage(event, index1, index2) {
      const file = event.target.files[0];
      const totalSizeMB = (file.size / Math.pow(1024, 2)).toFixed(2);
      const refName = `inputFile${index1}${index2}`;
      const image = {
        imageUrl: '',
        file: null,
        error: { value: true, message: '10MB 以下のファイルを選んでください。' },
      };

      if (totalSizeMB < 10) {
        if (file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/jpg') {
          image.error.message = 'JPG、JPEG、PNG の写真ファイルを選んでください。';
        } else {
          image.imageUrl = URL.createObjectURL(file);
          image.file = file,
          image.error = {
            value: false,
            message: '',
          }
        }
      }
      this.updateReminderSettingsImageMessage({
        image,
        index1,
        index2
      });
      this.$refs[refName][0].value = '';
    },
    addNewSettings() {
      this.addReminderSettings(cloneDeep(DEFAULT_REMINDER_SETTINGS));
    },
    isMaxMessages(index) {
      return this.displayReminderSettings[index].messages.length === 2;
    },
    isMaxSettings() {
      return this.displayReminderSettings.length === 2;
    },
    isMinMessages(index) {
      return this.displayReminderSettings[index].messages.length === 1;
    },
    isMinSettings() {
      return this.displayReminderSettings.length === 1;
    },
    showTimePicker(index) {
      const setTime = this.displayReminderSettings[index].sendTime ? this.displayReminderSettings[index].sendTime : '00:00';
      this.timePickerProperty[index].value = setTime
      this.timePickerProperty[index].show = true;
    },
    selectTime(index) {
      const { value } = this.timePickerProperty[index];
      this.updateReminderSettingsSendTime({ index, value });
      this.timePickerProperty[index].show = false;
    },
    async handleUpsertReminder() {
      const message = {
        text: 'リマインド配信設定を更新しました。',
      };

      const errorMessage = this.validateSettings();
      if (errorMessage) {
        message.text = errorMessage;
        message.type = 'error';
        this.$snackbar.show(message);
        return;
      }

      await this.upsertReminderConfig(this.displayReminderSettings);
      if (this.isUpdatingReminderConfigError) {
        message.text = 'リマインド配信設定の更新に失敗しました。管理者にお問い合わせください。';
        message.type = 'error';
      }
      this.$snackbar.show(message);
    },
    validateSettings() {
      let errorMessage = null;
      for (const settings of this.displayReminderSettings) {
        const { daysBefore, sendTime, messages } = settings;
        if (!this.validateBeforeDays(daysBefore)) {
          errorMessage = '配信日の入力値が不正です。0 ～ 9の数値を入力してください。';
          break;
        }
        if (!this.validateSendTime(sendTime)) {
          errorMessage = '配信時間の入力値が不正です。hh:mmの形式で入力してください。';
          break;
        }

        for (const message of messages) {
          const { type } = message;
          if (type === 'text' && !message.text) {
            errorMessage = '配信メッセージが入力されていません。';
            break;
          }
          if(type === 'image' && !message.imageUrl) {
            errorMessage = '配信する画像が選択されていません。';
            break;
          }
        }
      }
      return errorMessage;
    },
    validateSendTime(sendTime) {
      if (!sendTime) {
        return false;
      }
      // sendTimeのフォーマットがhh:mmかチェック
      return sendTime.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/) !== null;
    },
    validateBeforeDays(daysBefore) {
      // daysBeforeが0以上の半角数値かチェック
      const pattern = /^([1-9]\d*|0)$/;
      if (!pattern.test(daysBefore)) {
        return false;
      }

      // daysBeforeが0 ~ 9の値かチェック
      const _daysBefore = Number(daysBefore);
      return _daysBefore >= 0 && _daysBefore <= 9;
    },
    async handleDeleteReminder() {
      const message = {
        text: 'リマインド配信設定を削除しました。',
      };

      if (this.reminderConfiguration) {
        await this.deleteReminderConfig(this.reminderConfiguration.id);

        if (this.isUpdatingReminderConfigError) {
          message.text = 'リマインド配信設定の削除に失敗しました。管理者にお問い合わせください。';
          message.type = 'error';
        }
      } else {
        message.text = '未保存の設定は削除できません。',
        message.type = 'error';
      }

      this.$snackbar.show(message);
    },
    initSelected() {
      this.setSelectedSurveyId(null);
      this.setSelectedCategoryId(null);
      this.initReminderConfig();
    },
    initReminderConfig() {
      this.setReminderConfiguration(null);
      const defaultSettings = cloneDeep(DEFAULT_REMINDER_SETTINGS);
      this.setDisplayReminderSettings([defaultSettings]);
    },
    async fetchSurveyConfigsAndCategories() {
      await Promise.all([
        this.fetchAllSurveyConfigs(),
        this.fetchAllReminderCategories()
      ]);
    },
    getIdsInRouterParams(): null | { surveyId; categoryId } {
      const { surveyId, categoryId } = this.$route.params;
      if (!surveyId) {
        return null;
      }

      return {
        surveyId,
        categoryId
      };
    },
    isExistSurveyAndCategory(surveyId, categoryId) {
      const isExistSurveyConfigs = !!this.surveyConfigs.find(config => config.surveyId === surveyId);
      // surveyIdのみで予約リマインド配信設定が設定されている場合もあるので、paramsにcategoryIdが存在しない場合はtrueを代入するようにする
      const isExistCategory = categoryId ? !!this.categories.find(category => category.id === categoryId) : true;
      return isExistSurveyConfigs && isExistCategory;
    },
  },
  async created() {
    await this.fetchSurveyConfigsAndCategories();

    const ids = this.getIdsInRouterParams();
    if (ids === null) {
      this.initSelected();
      return;
    }

    const { surveyId, categoryId } = ids;
    if (!this.isExistSurveyAndCategory(surveyId, categoryId)) {
      this.$snackbar.show({ text: '帳票もしくは分類が存在しませんでした。' });
      this.initSelected();
      return;
    }

    this.setSelectedSurveyId(surveyId);
    this.setSelectedCategoryId(categoryId || null);
    await this.fetchReminderConfig({
      surveyId: this.selectedSurveyId,
      categoryId: this.selectedCategoryId
    });
  },
  watch: {
    selectedSurveyId(value) {
      if (value === null) {
        this.initReminderConfig();
      }
    }
  }
});
</script>

<style lang="less" scoped>
.align-items-center {
  display: flex;
  align-items: center;
}
.button-update {
  min-width: 120px!important;
}
</style>
