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
    :max-width="maxWidthDialog"
  >
    <v-system-bar :color="colorChooser" dark height="5"> </v-system-bar>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title> {{ isEditData ? "配信編集" : "新規作成" }}</v-toolbar-title>
        <v-checkbox dense hide-details label="Dry mode" v-model="dryRun" style="margin-top: 0; display: none;"/>
        <v-spacer></v-spacer>
        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="form" v-model="valid">
        <v-container fluid>
          <v-row no-gutters v-if="source != 'broadcast'">
            <v-col :cols="gridCols.label">
              <v-subheader>配信名</v-subheader>
            </v-col>
            <v-col :cols="gridCols.input">
              <v-text-field
                :color="colorChooser"
                v-model="deliveryTitle"
                :rules="deliveryTitleRules"
                outlined
                dense
                hide-details
                placeholder="配信名"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row no-gutters v-if="source != 'broadcast'">
            <v-col :cols="gridCols.label">
              <v-subheader>有効</v-subheader>
            </v-col>
            <v-col :cols="gridCols.input">
              <v-radio-group v-model="enabled" row hide-details class="my-2">
                <v-radio :color="colorChooser" label="はい" :value="true"></v-radio>
                <v-radio :color="colorChooser" label="いいえ" :value="false"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row no-gutters v-if="source != 'broadcast'">
            <v-col :cols="gridCols.label">
              <v-subheader>すべての友だち</v-subheader>
            </v-col>
            <v-col :cols="gridCols.input">
              <v-radio-group v-model="recipients" row hide-details class="my-2">
                <v-radio label="はい" value="ALL"></v-radio>
                <v-radio label="いいえ" value="FILTER"> </v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <template v-if="recipients === 'FILTER' || source === 'broadcast'">
            <v-row no-gutters class="my-2">
              <v-col :cols="gridCols.label">
                <v-subheader>帳票</v-subheader>
              </v-col>
              <v-col :cols="gridCols.input">
                <v-autocomplete
                  v-model="selectedFormConfig"
                  @change="onChangeFormConfigOption"
                  :items="surveyConfigOptions"
                  :rules="formConfigRules"
                  attach
                  outlined
                  dense
                  clearable
                  hide-details
                  placeholder="帳票"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <ConditionListFragment
              :visible="visible"
              :isFormConfigChanged="isFormConfigChanged"
              :surveySchema="surveySchema"
              :distItem="distItem"
              :conditions="conditions"
              :loading="isFetchingSurveyConfigsById"
              @onChangeCondition="onChangeCondition"
            />
          </template>
          <v-alert
            v-model="noConditionsSelectedError"
            class="mt-2"
            color="red"
            border="left"
            elevation="1"
            dismissible
            colored-border
            type="error"
          >
            配信条件を設定してください
          </v-alert>
        </v-container>
        <v-card-actions class="px-4">
          <v-row>
            <v-col>
              <v-btn
                :color="colorChooser"
                block
                :loading="isCreatingSegmentDelivery || isUpdatingSegmentDelivery"
                :disabled="isSaveDisabled"
                @click="noConditionsSelected ? (noConditionsSelectedError = true) : onSave()"
                :style="
                  hasActionPermission('hideButton', 'SegmentDelivery_DataModal_Save') ? hideButtonPermissionStyle() : ''
                "
              >
                保存
              </v-btn>
            </v-col>
            <v-col>
              <v-btn color="grey lighten-2" block @click="show = false"> 閉じる </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import {
  CREATE_SEGMENT_DELIVERY,
  UPDATE_SEGMENT_DELIVERY,
  FETCH_MAIL_DELIVERY_LIST,
  FETCH_SURVEY_CONFIGS,
  FETCH_SURVEY_CONFIGS_BY_ID,
} from "@/store/action-types";
import { SET_DISTRIBUTION_DETAIL, SET_SURVEY_SCHEMA } from "@/store/mutation-types";

import ConditionListFragment from "../../fragments/ConditionListFragment.vue";

import { emitSnackbar } from "@/utils/emitComponents";

interface GridCols {
  label: number;
  input: number;
}

interface LocalState {
  gridCols: GridCols;
  valid: boolean;
  isEditData: boolean;
  distributionConfigId: any;
  deliveryTitle: string;
  enabled: boolean;
  recipients: string;
  isFormConfigChanged: boolean;
  selectedFormConfig: any;
  surveyId: any;
  surveyTitle: any;
  conditions: Array<any>;
  deliveryTitleRules: any;
  formConfigRules: any;
  createError: boolean;
  updateError: boolean;
  noConditionsSelectedError: boolean;
  foundSurveySchema: boolean;
  dryRun: boolean;
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
      gridCols: {
        label: 3,
        input: 9,
      },

      valid: true,

      isEditData: false,

      distributionConfigId: null,
      deliveryTitle: "",
      enabled: true,
      recipients: "ALL",

      isFormConfigChanged: false,
      selectedFormConfig: null,
      surveyId: null,
      surveyTitle: null,
      conditions: [],

      deliveryTitleRules: [(v) => !!v || "配信名は必須入力です。"],

      formConfigRules: [(v) => !!v || "帳票は必須入力です。"],

      createError: false,
      updateError: false,
      noConditionsSelectedError: false,

      foundSurveySchema: true,
      dryRun: false,
    };
  },
  components: { ConditionListFragment },
  computed: {
    ...mapState({
      viewSurveyConditions: (state: any) => state.segments.surveyConditions,

      surveySchema: (state: any) => state.segments.surveySchema,
      isCreatingSegmentDelivery: (state: any) => state.segments.isCreatingSegmentDelivery,
      createSegmentDeliveryError: (state: any) => state.segments.createSegmentDeliveryError,
      isUpdatingSegmentDelivery: (state: any) => state.segments.isUpdatingSegmentDelivery,
      updateSegmentDeliveryError: (state: any) => state.segments.updateSegmentDeliveryError,

      isFetchingSurveyConfigsListType: (state: any) => state.forms.isFetchingSurveyConfigsListType,
      isFetchingSurveyConfigsById: (state: any) => state.forms.isFetchingSurveyConfigsById,

      fetchSurveyConfigsListTypeError: (state: any) => state.forms.fetchSurveyConfigsListTypeError,
      fetchSurveyConfigsByIdError: (state: any) => state.forms.fetchSurveyConfigsByIdError,

      distributionDetail: (state: any) => state.segments.distributionDetail,
    }),
    ...mapGetters({
      surveyConfigs: "surveyConfigsWithoutAppendType",
    }),
    surveyConfigOptions(): Array<any> {
      let options = [];

      options.push(
        ...this.surveyConfigs.map((obj) => {
          return {
            value: obj.surveyId,
            text: "[ " + obj.surveyTitle + " ] " + obj.surveyId,
          };
        })
      );

      return options;
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
      return !this.valid || !this.foundSurveySchema || this.isCreatingSegmentDelivery || this.isUpdatingSegmentDelivery;
    },
    noConditionsSelected(): boolean {
      if (this.conditions) {
        for (let condition of this.conditions) {
            if (condition.conditionValues && condition.conditionValues.length > 0) {
              return false;
            }
          }
      }
      if (this.surveySchema.length > 0) {
        for (let schema of this.surveySchema) {
          if (schema.blockType === "dropdown" || schema.blockType === "radio" || schema.blockType === "checkboxes") {
            return true;
          }
        }
      }

      return false;
    },
    maxWidthDialog(): number {
      return 1000;
    },
    colorChooser(): string {
      return "primary";
    },
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
      fetchMailDeliveryList: FETCH_MAIL_DELIVERY_LIST,
      fetchSurveyConfigs: FETCH_SURVEY_CONFIGS,
      fetchSurveyConfigsById: FETCH_SURVEY_CONFIGS_BY_ID
    }),
    ...mapMutations({
      updateDistributionDetail: SET_DISTRIBUTION_DETAIL,
      setSurveySchema: SET_SURVEY_SCHEMA
    }),
    async initializeValues(): Promise<void> {
      if (this.source !== "broadcast") {
        if (this.item) {
          this.deliveryTitle = this.item.deliveryTitle;
          this.enabled = this.item.enabled;
          this.dryRun = !!this.item.dryRun;
          this.selectedFormConfig = this.item.surveyConditions.surveyId;

          if (this.item.surveyConditions) {
            if (this.item.surveyConditions === "ーー") {
              this.recipients = "ALL";
            } else {
              this.recipients = "FILTER";
            }

            this.distributionConfigId = this.item.distributionConfigId;
            this.surveyId = this.item.surveyConditions.surveyId;
            this.surveyTitle = this.item.surveyConditions.surveyTitle;
            this.conditions = this.item.surveyConditions.conditions;

            let index = this.surveyConfigs.findIndex((obj) => obj.surveyId === this.selectedFormConfig);
            await this.convertSchema(index);
          }
        }
      }
    },
    async onChangeFormConfigOption(value: any): Promise<void> {
      if (value) {
        var counter = 0;
        this.isFormConfigChanged = !this.isFormConfigChanged;
        this.conditions = [];

        let index = this.surveyConfigOptions.findIndex((obj) => obj.value === value);
        await this.convertSchema(index);
        this.surveyId = this.surveyConfigs[index] ? this.surveyConfigs[index].surveyId : null;
        this.surveyTitle = this.surveyConfigs[index] ? this.surveyConfigs[index].surveyTitle : null;
        this.selectedFormConfig = this.surveyId;
        if (this.surveySchema.length == 0) this.foundSurveySchema = false;
        else {
          this.surveySchema.forEach((element) => {
            if (element.conditionValues == null) this.foundSurveySchema = false;
            else counter++;
          });
          if (counter > 0) this.foundSurveySchema = true;
        }
      } else {
        this.setSurveySchema([])
      }
    },
    onChangeCondition(payload: any): void {
      this.conditions = JSON.parse(JSON.stringify(payload));
    },
    onSave(): void {
      let params: any = {
        name: this.deliveryTitle,
        enabled: this.enabled,
        dryRun: this.dryRun,
        surveyConditions: {
          surveyId: this.surveyId,
          surveyTitle: this.surveyTitle,
          conditions: this.conditions,
        },
      };

      if (this.distributionConfigId) {
        params.id = this.distributionConfigId;
      }
      if (this.$route.params.distId || this.$route.params.distCopiedDetail) {
        let surveyConditions = {
          surveyId: this.surveyId,
          surveyTitle: this.surveyTitle,
          conditions: this.conditions,
          pickAll: false,
        };
        this.$emit("getSurveyConditions", {
          deliveryTitle: this.deliveryTitle,
          distributionConfigId: this.distributionConfigId,
          enabled: this.enabled,
          surveyConditions: {
            surveyId: this.surveyId,
            surveyTitle: this.surveyTitle,
            conditions: this.conditions,
          },
        });
        this.$emit("updateTargetEstimate", surveyConditions);
        this.$emit("setSurveyConditions", surveyConditions); // when edit/copy, set surveyConds using vuex state
        this.show = false;
      } else {
        if (params.surveyConditions && this.recipients === "ALL" && this.source !== "broadcast") {
          params.surveyConditions = null;
        }
        if (!this.isEditData) {
          this.create(params);
        } else {
          this.update(params);
        }
      }
    },
    async create(params: any): Promise<void> {
      if (this.source === "broadcast") {
        this.$emit("getSurveyConditions", params);
        this.$emit("updateTargetEstimate", params.surveyConditions);

        this.handleUpdate({ surveyConditions: params.surveyConditions });

        this.$emit("setSurveyConditions", params.surveyConditions); // when createNew, set surveyConds using vuex state
        this.show = false;
      } else {
        if (this.hasActionPermission("click", "backendRequest")) {
          await this.createSegmentDelivery(params)
          if (this.createSegmentDeliveryError) {
            emitSnackbar(this.$snackbar, this.createSegmentDeliveryError, "error");
          } else {
            this.show = false;
            this.$snackbar.show({
              text: "配信データを追加しました。",
            });
            await this.fetchMailDeliveryList();
          }
        } else {
          this.showActionPermissionError();
        }
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
          await this.fetchMailDeliveryList();
        }
      } else {
        this.showActionPermissionError();
      }
    },
    resetValues(): void {
      this.deliveryTitle = "";
      this.enabled = true;
      this.selectedFormConfig = null;
      this.conditions = [];
      this.isFormConfigChanged = false;
      this.noConditionsSelectedError = false;
      this.recipients = "ALL";
      this.createError = false;
      this.updateError = false;
      this.dryRun = false;
      this.setSurveySchema([]);
    },
    async convertSchema(index: any): Promise<void> {
      if (this.surveyConfigs[index]) {
        await this.fetchSurveyConfigsById(this.surveyConfigs[index].surveyId).then(response => {
          this.surveyConfigs[index].surveySchema = response.data.surveySchema;
          let convertedSchema = []
          if (this.surveyConfigs[index] && this.surveyConfigs[index].surveySchema) {
            convertedSchema = this.surveyConfigs[index].surveySchema
              .map((obj) => {
                return {
                  itemKey: obj.itemKey,
                  title: obj.title,
                  blockType: obj.type,
                  conditionValues: obj.options ? obj.options : null,
                };
              })
              .filter((obj) => this.isSelection(obj));
          }
          this.setSurveySchema(convertedSchema)
        })
      }
    },
    handleUpdate(value: any): void {
      this.updateDistributionDetail({ ...this.distributionDetail, ...value });
    },
    isSelection(item: any): boolean {
      return item.blockType === "dropdown" || item.blockType === "radio" || item.blockType == "checkboxes";
    },
  },
  async created() {
    // this is from edit and copy
    if (this.$route.params.distId || this.$route.params.distCopiedDetail) {
      this.dryRun = !!this.distItem.dryRun;
      if (!this.distItem.surveyConditions.pickAll) {
        this.deliveryTitle = this.distItem.name;
        this.selectedFormConfig = this.viewSurveyConditions.surveyId;
        if (this.distItem.surveyConditions) {
          this.distributionConfigId = this.distItem.distributionConfigId;
          this.surveyId = this.viewSurveyConditions.surveyId;
          this.surveyTitle = this.viewSurveyConditions.surveyTitle;

          this.conditions = this.viewSurveyConditions.conditions;

          let index = this.surveyConfigs.findIndex((obj) => obj.surveyId === this.selectedFormConfig);
          await this.convertSchema(index);
          this.isEditData = true;
        }
      }
    } else if (this.source === "broadcast") {
      // this one is from create new broadcast (手動新規)
      if (this.item) {
        this.dryRun = !!this.item.dryRun;
        this.deliveryTitle = this.item.deliveryTitle;
        this.selectedFormConfig = this.item.surveyConditions.surveyId;

        if (this.item.surveyConditions) {
          this.distributionConfigId = this.item.distributionConfigId;
          this.surveyId = this.item.surveyConditions.surveyId;
          this.surveyTitle = this.item.surveyConditions.surveyTitle;
          this.conditions = this.item.surveyConditions.conditions;

          let index = this.surveyConfigs.findIndex((obj) => obj.surveyId === this.selectedFormConfig);
          await this.convertSchema(index);
        }
      }
    }
  },
});
</script>
