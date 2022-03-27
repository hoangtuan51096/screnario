<template>
  <v-dialog scrollable v-model="show" max-width="600">
    <v-card>
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title class="blue-grey--text text--darken-4 font-weight-bold">
          シナリオを有効にする
        </v-toolbar-title>
      </v-toolbar>
      <template>
        <v-row class="mx-2" v-if="fetchingTalkDistributionError">
          <v-col cols="12">
            <v-alert
              class="text-center"
              color="red"
              text
              type="warning">{{ fetchingTalkDistributionError }}</v-alert>
          </v-col>
        </v-row>
        <v-row class="mx-2">
          <v-col cols="12" style="padding-bottom: 0;">
            <span>"{{
              (
                activeScenario.versions
                && activeScenario.versions[newVersion]
                && activeScenario.versions[newVersion].displayVersionName
              )
              ? activeScenario.versions[newVersion].displayVersionName
              : newVersion }}"
              を{{ getEnvironmentDisplayText(environment) }}環境で有効にします。</span>
          </v-col>
        </v-row>
        <v-row class="mx-2" v-if="talkDistributionsThatBecomeInactive.length > 0">
          <v-col cols="12" style="display: inline-grid; padding-top: 0; padding-bottom: 0;">
            <span style="padding-bottom: 0.5em;">設定変更後、以下のトーク配信設定が解除されます。</span>
            <span :key="dist.distributionConfigId" v-for="dist in talkDistributionsThatBecomeInactive">{{ dist.deliveryTitle }}</span>
          </v-col>
        </v-row>
        <v-row class="mx-2">
          <v-col cols="12">
            <span>よろしいですか？</span>
          </v-col>
        </v-row>
      </template>
      <v-card-actions class="pa-4 d-flex justify-end">
        <template>
          <v-btn class="px-6 mr-2 blue-grey--text" outlined @click="cancelChange">
            キャンセル
          </v-btn>
          <v-btn
            color="primary"
            class="px-6 mr-2"
            @click="hasActionPermission('click', 'backendRequest') ? confirmChange() : showActionPermissionError()"
          >
            OK
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions } from "vuex";
import { FETCH_TALK_DELIVERY_LIST, FETCH_SCENARIO_SPECIFIC_TALKS } from "@/store/action-types";
import { TEMPLATE_TALK_IDS, SCENARIO_ENV_TYPES } from "@/store/modules/scenarios/scenarios.constants";

export default Vue.extend({
  props: {
    visible: Boolean,
    currentVersion: String,
    newVersion: String,
    environment: String,
    scenarioId: String,
  },
  data() {
    return {
      loadingTalkDistributions: false,
      talkDistributionsThatBecomeInactive: [],
      fetchingTalkDistributionError: null,
    };
  },
  components: {},
  computed: {
    ...mapState({
      activeScenario: (state) => state.scenarios.activeScenario,
    }),
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.resetLocalData();
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    ...mapActions({
      fetchTalksForScenario: FETCH_SCENARIO_SPECIFIC_TALKS,
    }),
    getEnvironmentDisplayText(envName) {
      return envName in SCENARIO_ENV_TYPES ? SCENARIO_ENV_TYPES[envName].text : "不明";
    },
    resetLocalData() {
      this.loadingTalkDistributions = false;
      this.talkDistributionsThatBecomeInactive = [];
      this.fetchingTalkDistributionError = null;
    },
    confirmChange() {
      this.show = false;
      this.$emit("onChangeConfirm");
    },
    cancelChange() {
      this.show = false;
    },
    findValidDistributionsFromTalks(talkList , distributionList) {
      const validDistributions = [];
      for (const dist of distributionList) {
        if (!dist.enabled || dist.environment !== this.environment) {
          continue;
        }
        if (TEMPLATE_TALK_IDS.includes(dist.talkId)) {
          const talk = talkList.find(talk => talk.dataId === dist.talkId);
          if (talk) {
            validDistributions.push(dist);
          }
        } else {
          const talk = talkList.find(talk =>
            talk.params && talk.params.name && talk.params.name === dist.talkName
          )
          if (talk) {
            validDistributions.push(dist);
          }
        }
      }
      return validDistributions;
    },
    findDifferencesInValidDistributions(currentDistributions , newDistributions) {
      for (const dist of currentDistributions) {
        const distInNewDistributions = newDistributions.find(config => config.distributionConfigId === dist.distributionConfigId);
        if (!distInNewDistributions) {
          this.talkDistributionsThatBecomeInactive.push(dist);
        }
      }
    }
  },
});
</script>
