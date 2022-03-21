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
        <v-row>
            <v-divider class="mb-4" />
        </v-row>
        <v-row>
            <v-form @submit.prevent style="width: 100%">
            <v-row>
                <v-col class="col-12 col-lg-6">
                    <div class="body-2 blue-grey--text font-weight-bold">
                        シナリオバージョン
                    </div>
                    <v-text-field
                        dense
                        outlined
                        hide-details="auto"
                        clearable
                        v-model="scenarioVersion"
                    />
                </v-col>
                <v-col class="col-6 col-lg-3">
                    <div class="body-2 blue-grey--text font-weight-bold">
                        本番ステータス
                    </div>
                    <v-select
                        dense
                        outlined
                        hide-details="auto"
                        :items="statuses"
                        v-model="productionStatus"
                    />
                </v-col>
                <v-col class="col-6 col-lg-3">
                    <div class="body-2 blue-grey--text font-weight-bold">
                        サンドボックスステータス
                    </div>
                    <v-select
                        dense
                        outlined
                        hide-details="auto"
                        :items="statuses"
                        v-model="sandboxStatus"
                    />
                </v-col>
            </v-row>
            <div class="d-flex justify-end py-4">
                <v-btn
                    outlined
                    color="warning"
                    @click="clearSearchCriteria()"
                >
                検索条件をクリア
                </v-btn>
                <v-btn
                    class="ml-2"
                    color="primary"
                    type="submit"
                    :disabled="isFetchingScenarios"
                    @click="onClickSearch()"
                >
                この条件で検索
                </v-btn>
            </div>
            </v-form>
        </v-row>
    </div>
</template>

<script>
import {mapState} from 'vuex';

const emptySelectValue = '－－－－－';

export default {
  data() {
    return {
      statuses: [
        emptySelectValue,
        '適用中',
        '未適用',
      ],

      scenarioVersion: '',
      productionStatus: emptySelectValue,
      sandboxStatus: emptySelectValue,

      searchCriteria: {},
    };
  },
  components: {
  },
  computed: {
    ...mapState({
      isFetchingScenarios: (state) => state.scenarios.isFetchingScenarios,
    }),
  },
  methods: {
    clearSearchCriteria: function () {
      this.scenarioVersion = '';
      this.productionStatus = emptySelectValue;
      this.sandboxStatus = emptySelectValue;
      this.onClickSearch();
    },
    onClickSearch: function () {
      this.searchCriteria = {
        scenarioVersion: this.scenarioVersion,
        productionStatus: this.productionStatus,
        sandboxStatus: this.sandboxStatus,
      }
      this.$emit("searchCriteriaUpdated", this.searchCriteria);
    },
  },
  created() {},
};
</script>
