<template>
  <div>
    <SubAppBar>
      <template>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div class="body-2">
            <router-link color="primary" :to="{name: 'ScenarioSettingsPage'}">シナリオ一覧</router-link>
            <span class="blue-grey--text" style="opacity: 0.6">
            -
            </span>
            <span class="blue-grey--text">
              {{ activeScenario.versions[$route.params.versionId].displayVersionName || $route.params.versionId }}
            </span>
          </div>
        </div>
      </template>
    </SubAppBar>
    <v-card outlined class="my-4">
      <v-tabs-items v-model="tab">
        <v-tab-item value="scenario-setting">
          <v-container fluid>
            <ScenarioSettings/>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ScenarioSettings from './fragments/ScenarioSettings.vue';
import SubAppBar from '@/components/common/SubAppBar.vue';
import {mapActions, mapState} from 'vuex';
import {FETCH_ALL_SCENARIOS, FETCH_SCENARIO_TALK} from "@/store/action-types";
import {
  SET_TALK_DATATABLE_OPTION,
  SET_TALK_SEARCH_ATTRIBUTE, SET_TALK_SEARCH_ENDDATE, SET_TALK_SEARCH_STARTDATE,
  SET_TALK_SEARCH_VALUE
} from "../../../../src/store/mutation-types";

interface LocalState {
  tab: string;
}

export default Vue.extend({
  data(): LocalState {
    return {
      tab: 'scenario-setting',
    };
  },
  components: {
    SubAppBar,
    ScenarioSettings,
  },
  computed: {
    ...mapState({
      isFetchingScenarios: (state: any) => state.scenarios.isFetchingScenarios,
      activeScenario: (state: any) => state.scenarios.activeScenario,
    }),
  },
  methods: {
    ...mapActions({
      getDataForDetails: FETCH_SCENARIO_TALK,
    }),
  },
  async created() {
    if (!this.activeScenario.scenarioId) {
      await this.$store.dispatch(FETCH_ALL_SCENARIOS);
    }
    this.$store.commit(SET_TALK_DATATABLE_OPTION, {
      groupBy: [],
      groupDesc: [],
      itemsPerPage: 10,
      multiSort:false,
      mustSort:false,
      page: 1,
      sortBy: ["updated_at"],
      sortDesc: [true],
    });
    this.$store.commit(SET_TALK_SEARCH_ATTRIBUTE, null);
    this.$store.commit(SET_TALK_SEARCH_VALUE, null);
    this.$store.commit(SET_TALK_SEARCH_STARTDATE, null);
    this.$store.commit(SET_TALK_SEARCH_ENDDATE, null);
    // await this.getDataForDetails({
    //   scenarioId: this.$route.params.scenarioId,
    //   versionId: this.$route.params.versionId,
    // });
  },
});
</script>
