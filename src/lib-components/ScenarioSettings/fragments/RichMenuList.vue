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
.stopScrolling {
  overflow: hidden;
}
</style>
<template>
  <v-container fluid :class="{ stopScrolling: showRichMenuDesigner }">
    <div class="pb-4">
      <template v-if="isFetchingRichMenuInfo || isSavingActiveScenario">
        <v-row justify="center" align="center">
          <v-col md="1">
            <v-progress-circular :size="50" color="primary" indeterminate> </v-progress-circular>
          </v-col>
        </v-row>
      </template>
      <v-card class="mx-auto" :elevation="0" v-else>
        <template v-if="errorFetchingRichMenuInfo">
          <ContentLoadError :error="errorFetchingRichMenuInfo" />
        </template>
        <template v-else>
          <v-toolbar :elevation="0">
            <v-toolbar-title>リッチメニュー一覧</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn style="margin-right: 0.5em" color="error" outlined class="white--text"
              :style="
                hasActionPermission('hideButton', 'ScenarioSettings_RichMenuManageTable_Delete')
                  ? hideButtonPermissionStyle()
                  : ''"
              @click="deleteSelectedMenus"
              :disabled="(tab === 0 && selectedRichMenus.production.length === 0) ||
              (tab === 1 && selectedRichMenus.sandbox.length === 0)">
              <v-icon left>mdi-trash-can</v-icon>選択項目を削除
            </v-btn>
            <v-btn style="margin-right: 0.5em" color="blue-grey" class="white--text" @click="updatedRichMenuList()" :loading="isFetchingAllRichMenus">
              <v-icon left>mdi-reload</v-icon>データ更新
            </v-btn>
            <v-btn color="primary" @click="showRichMenuDesignerConfirm = true"
              :style="
              hasActionPermission('hideButton', 'ScenarioSettings_RichMenuDesigner_Save')
                ? hideButtonPermissionStyle()
                : ''"
              :loading="isFetchingAllRichMenus">
              <v-icon left>mdi-plus</v-icon>新規作成
            </v-btn>
          </v-toolbar>
          <v-tabs v-model="tab" :grow="true">
            <v-tabs-slider></v-tabs-slider>
            <v-tab>
              本番
            </v-tab>
            <v-tab>
              サンドボックス
            </v-tab>
            <v-tab-item>
              <div class="pt-4" v-if="errorFetchingAllRichMenus">
                <ContentLoadError :error="errorFetchingAllRichMenus" />
              </div>
              <div class="pt-4" v-else>
                <RichMenuManageTable
                  :rich-menu-list="productionRichMenuList"
                  :active-menu="activeProductionRichMenu"
                  :normal-menu="defaultProductionRichMenu"
                  :bosai-menu="bosaiProductionRichMenu"
                  :opposite-environment-active-menu="activeSandboxRichMenu"
                  :opposite-environment-normal-menu="defaultSandboxRichMenu"
                  :opposite-environment-bosai-menu="bosaiSandboxRichMenu"
                  :opposite-environment-menus="sandboxRichMenuList"
                  :search-criteria="searchCriteria"
                  environment="production"
                  @selectedMenus="updateSelectedMenus($event, 'production')"
                />
              </div>
            </v-tab-item>
            <v-tab-item>
              <div class="pt-4" v-if="errorFetchingAllRichMenus">
                <ContentLoadError :error="errorFetchingAllRichMenus" />
              </div>
              <div class="pt-4" v-else>
                <RichMenuManageTable
                  :rich-menu-list="sandboxRichMenuList"
                  :active-menu="activeSandboxRichMenu"
                  :normal-menu="defaultSandboxRichMenu"
                  :bosai-menu="bosaiSandboxRichMenu"
                  :opposite-environment-active-menu="activeProductionRichMenu"
                  :opposite-environment-normal-menu="defaultProductionRichMenu"
                  :opposite-environment-bosai-menu="bosaiProductionRichMenu"
                  :opposite-environment-menus="productionRichMenuList"
                  :search-criteria="searchCriteria"
                  environment="sandbox"
                  @selectedMenus="updateSelectedMenus($event, 'sandbox')"
                />
              </div>
            </v-tab-item>
          </v-tabs>
        </template>
      </v-card>
    </div>

    <v-dialog width="50%" v-model="showRichMenuDesignerConfirm">
      <v-card flat>
        <v-card-title>
          新規作成
        </v-card-title>
        <v-card-text>
          <span>メニュー名</span>
          <v-text-field
            v-model="createRichMenuName"
            outlined
            hide-details="auto"
            placeholder="メニュー名を入力"
            :error="namedRichMenuAlreadyExists"
            :error-messages="namedRichMenuAlreadyExists ? '同じ名前のリッチメニューがあるため保存できません！' : ''">
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showRichMenuDesignerConfirm = false" color="primary" outlined>キャンセル</v-btn>
          <v-btn color="primary" @click="openDesigner()" :disabled="!isValidRichMenuName">作成</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <RichMenuDesigner
      :createRichMenuName="createRichMenuName"
      :editableItem="null"
      :visible="showRichMenuDesigner"
      :productionList="productionRichMenuList"
      :sandboxList="sandboxRichMenuList"
      :itemsRichMenu="itemsRichMenu"
      @close="showRichMenuDesigner = false"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
// import RichMenuCreateModal from '../components/RichMenuCreateModal';
import RichMenuDesigner from "../components/RichMenuDesigner.vue";
import RichMenuManageTable from "../components/RichMenuManageTable.vue";
import ContentLoadError from "../../components/common/ContentLoadError.vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import { isNullOrEmpty } from "@/utils/stringUtils";
import {
  SET_ACTIVE_RICH_MENU,
  FETCH_ACTIVE_RICHMENUS,
  FETCH_ALL_RICHMENUS,
  FETCH_DEFAULT_RICHMENUS,
  DELETE_RICH_MENU,
  FETCH_ALL_RICHMENUS_ALIAS_LIST,
} from "@/store/action-types";
import { SET_IS_FETCHING_RICHMENU_INFO } from "@/store/mutation-types";
import { cloneDeep } from "lodash";

interface LocalState {
  showRichMenuDesigner: boolean;
  showRichMenuDesignerConfirm: boolean;
  searchProduction: string;
  searchSandbox: string;
  createRichMenuName: string;
  tab: number;
  richButtonItems: Array<any>;
  itemsRichMenu: Array<any>;
  allRichMenuAliasList: Array<any>;
  selectedRichMenus: any;
}

export default Vue.extend({
  props: {
    searchCriteria: Object,
  },
  data(): LocalState {
    return {
      // showRichMenuCreateModal: false,
      showRichMenuDesigner: false,
      showRichMenuDesignerConfirm: false,
      createRichMenuName: "",
      searchProduction: "",
      searchSandbox: "",
      tab: 0,
      richButtonItems: [{ title: "JSON" }, { title: "デザイナー" }],
      selectedRichMenus: {
        production: [],
        sandbox: [],
      },
      itemsRichMenu: [],
      allRichMenuAliasList: [],
    };
  },
  components: {
    // RichMenuCreateModal,
    RichMenuDesigner,
    RichMenuManageTable,
    ContentLoadError,
  },
  watch: {
    showRichMenuDesignerConfirm(val) {
      if(val) {
        this.createRichMenuName = "";
      }
    },
    errorFetchingRichMenuInfo(val) {
      if (val) {
        this.$snackbar.show({ text: val, type: "error" });
      }
    },
    errorDeletingRichMenu(val) {
      if (val) {
        this.$snackbar.show({ text: val, type: "error" });
      }
    },
    errorSettingRichMenu(val) {
      if (val) {
        this.$snackbar.show({ text: val, type: "error" });
      }
    },
    isCreatingRichMenuError(val) {
      if (val) {
        this.$snackbar.show({ text: val, type: "error" });
      }
    },
  },
  computed: {
    ...mapState({
      activeProductionRichMenu: (state: any) => state.scenarios.activeProductionRichMenu,
      activeSandboxRichMenu: (state: any) => state.scenarios.activeSandboxRichMenu,
      defaultProductionRichMenu: (state: any) => state.scenarios.defaultProductionRichMenu,
      defaultSandboxRichMenu: (state: any) => state.scenarios.defaultSandboxRichMenu,
      bosaiProductionRichMenu: (state: any) => state.scenarios.bosaiProductionRichMenu,
      bosaiSandboxRichMenu: (state: any) => state.scenarios.bosaiSandboxRichMenu,

      productionRichMenuList: (state: any) => state.scenarios.productionRichMenuList,
      sandboxRichMenuList: (state: any) => state.scenarios.sandboxRichMenuList,

      isFetchingRichMenuInfo: (state: any) => state.scenarios.isFetchingRichMenuInfo,
      errorFetchingRichMenuInfo: (state: any) => state.scenarios.errorFetchingRichMenuInfo,
      errorFetchingAllRichMenus: (state: any) => state.scenarios.errorFetchingAllRichMenus,

      isCreatingRichMenu: (state: any) => state.scenarios.isCreatingRichMenu,
      isCreatingRichMenuError: (state: any) => state.scenarios.isCreatingRichMenuError,

      isSavingActiveScenario: (state: any) => state.scenarios.isSavingActiveScenario,
      activeScenarioData: (state: any) => state.scenarios.activeScenarioData,

      errorDeletingRichMenu: (state: any) => state.scenarios.errorDeletingRichMenu,
      errorSettingRichMenu: (state: any) => state.scenarios.errorSettingRichMenu,

      isFetchingAllRichMenus: (state: any) => state.scenarios.isFetchingAllRichMenus,
    }),
    isValidRichMenuName() {
      return !isNullOrEmpty(this.createRichMenuName) && !this.namedRichMenuAlreadyExists;
    },
    namedRichMenuAlreadyExists() {
      const richMenu = this.productionRichMenuList.find((menu) => menu.name === this.createRichMenuName);
      return richMenu !== undefined;
    },
  },
  methods: {
    ...mapActions({
      fetchActiveRichMenus: FETCH_ACTIVE_RICHMENUS,
      fetchAllRichMenus: FETCH_ALL_RICHMENUS,
      fetchDefaultRichMenus: FETCH_DEFAULT_RICHMENUS,
      deleteRichMenu: DELETE_RICH_MENU,
      fetchAllRichMenuAliasList: FETCH_ALL_RICHMENUS_ALIAS_LIST,
    }),
    async fetchRichMenuData(): Promise<void> {
      this.fetchDefaultRichMenus();
      this.fetchActiveRichMenus();
      this.fetchAllRichMenus();
      await this.updateSwitchRichmenuItem();
    },
    async updateSwitchRichmenuItem(): Promise<void>  {
      let params = {
        richMenuId: "",
        environment: "production",
      };
      let aliasItems = [];
      let name = "";
      let response = await this.fetchAllRichMenuAliasList(params);
      this.allRichMenuAliasList = response;
      for(let responseItem in response) {
        for(let richMenuItem in this.productionRichMenuList) {
          if(response[responseItem].richMenuId === this.productionRichMenuList[richMenuItem].richMenuId && this.productionRichMenuList[richMenuItem].name !== "") {
            name = this.productionRichMenuList[richMenuItem].name;
            aliasItems.push({value: response[responseItem].richMenuAliasId , text: name})
          }
        }
      }
      this.itemsRichMenu = aliasItems;
    },
    updatedRichMenuList() {
      this.fetchAllRichMenus();
    },
    updateSelectedMenus(value, environment) {
      this.selectedRichMenus[environment] = value;
    },
    async openDesigner(): Promise<void> {
      await this.updateSwitchRichmenuItem();
      this.showRichMenuDesigner = true;
      this.showRichMenuDesignerConfirm = false;
    },
    async deleteSelectedMenus() : Promise<void> {
      let deleteCheckList = [];
      let displayText = "";
      let deleteCheckText = "";
      let menusToDelete = this.tab === 0 ? this.selectedRichMenus.production : this.selectedRichMenus.sandbox;
      let params = {
        richMenuId: "",
        environment: this.tab === 0 ? "production" : "sandbox",
      };
      let response = await this.fetchAllRichMenuAliasList(params);
      this.allRichMenuAliasList = response;
      for(let deleteItem in menusToDelete) {
        let id = "";
        this.allRichMenuAliasList.forEach((item) => {
          if(menusToDelete[deleteItem].richMenuId === item.richMenuId) {
            id = item.richMenuAliasId;
          }
        });
        let menuName = menusToDelete[deleteItem].name;
        let itemList = [];
        itemList["list"] = [];
        itemList["name"] = menuName;
        this.productionRichMenuList.forEach((item) => {
          item.areas.forEach((area) => {
            if (area.action.type === "richmenuswitch" && area.action.richMenuAliasId === id) {
              itemList["list"].push({name: item.name, flag: true});
            }
          });
        });
        if(itemList["list"] && itemList["list"].length) {
          deleteCheckList.push(itemList);
        }

      }
      for (let x = 0; x < deleteCheckList.length; x++) {
        deleteCheckText += "「" + deleteCheckList[x].name + "」";
        deleteCheckText += "は"
        deleteCheckList[x].list.forEach((item) => {
          deleteCheckText += "「" + item.name + "」";
        });
        deleteCheckText += "で使用されているため削除できません"
      }
      let $this = this;
      this.$dialog.show({
        title: "削除できません",
        text: deleteCheckText,
        type: "warning",
      });

      if(deleteCheckList.length === 0) {
        for (let x = 0; x < menusToDelete.length; x++) {
          displayText += "「" + menusToDelete[x].name + "」";
          if (x !== menusToDelete.length - 1) {
            displayText += "と"
          }
        }
        displayText += "項目を削除してもよろしいでしょうか？"
        let $this = this;
        this.$dialog.show({
          title: "選択項目を削除確認",
          text: displayText,
          type: "error",
          btnConfirmTitle: "はい",
          onConfirm: async () => {
            for (const menu of menusToDelete) {
              let payload = {
                richMenuId: menu.richMenuId,
                environment: $this.tab === 0 ? "production" : "sandbox",
                menuList: $this.tab === 0 ? $this.productionRichMenuList : $this.sandboxRichMenuList,
              };
              $this.deleteRichMenu(payload);
            }
          },
        });
      }
    }
  },
  created() {
    this.fetchRichMenuData();
  },
});
</script>
