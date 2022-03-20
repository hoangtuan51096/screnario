<template>
  <div>
    <SubAppBar>
      <div style="display: flex; justify-content: space-between">
        <div>
          <v-btn-toggle v-model="tab" dense mandatory color="primary">
              <v-btn value="scenario-setting">
              <v-icon left :color="tab === 'scenario-setting' ? 'primary' : ''">
                  mdi-application-cog
              </v-icon>
              シナリオ設定
              </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </SubAppBar>
    <v-card outlined class="my-4">
      <v-tabs-items v-model="tab">
        <v-tab-item value="scenario-setting">
          <v-container fluid>
            <ScenarioSettings
              :searchCriteria="searchCriteria"
            />
          </v-container>
        </v-tab-item>
        <v-tab-item value="rich-menu-list">
          <v-container fluid>
            <RichMenuList
              :searchCriteria="searchCriteria"
            />
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ScenarioSettings from './fragments/ScenarioSettings.vue';
import ScenarioSearch from './components/ScenarioSearch.vue';
import RichMenuList from './fragments/RichMenuList.vue';
import RichMenuSearch from './components/RichMenuSearch.vue';
import SubAppBar from '../components/common/SubAppBar.vue';
import {mapState} from 'vuex';

interface LocalState {
  tab: string;
  showSearch: boolean;
  searchCriteria: any;
}

export default {
  name: 'ScenarioCommon',
  data(): LocalState {
    return {
      tab: 'scenario-setting',
      showSearch: false,
      searchCriteria: {},
    };
  },
  components: {
    SubAppBar,
    ScenarioSettings,
    ScenarioSearch,
    RichMenuList,
    RichMenuSearch,
  },
  computed: {
    ...mapState({
      isFetchingScenarios: (state: any) => state.scenarios.isFetchingScenarios,
    }),
  },
  methods: {
    toggleShowSearch(show: any): void {
      if (show != null) {
        this.showSearch = show;
      } else {
        this.showSearch = !this.showSearch;
      }
    },
    updateSearchCriteria(value: any): void {
      this.searchCriteria = value;
    },
  },
  created() {},
};
</script>
