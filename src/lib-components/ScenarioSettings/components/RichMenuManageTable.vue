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
.menu-exists-in-opposite {
  pointer-events: none !important;
}
.disabledPointer {
  pointer-events: none !important;
}

.v-data-footer {
  border-top: 0px !important;
  padding: 0px !important;
}
</style>
<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="displayItems"
      :items-per-page="5"
      show-select
      :loading="isFetchingAllRichMenus"
      loading-text="処理中ですしばらく、お待ちください。"
      :footer-props="{
        'items-per-page-options': itemsPerPage,
        'items-per-page-text': '1ページあたりの表示数:',
        'page-text': ''
      }"
      item-key="richMenuId"
      class="pa-4 elevation-1"
      :search="searchText"
      :custom-sort="customSort"
      v-model="selectedMenus"
    >
      <template v-slot:top="{ pagination, options, updateOptions}">
        <v-row align="center">
          <v-col :cols="3" style="padding: 0px">
            <span class="font-weight-bold">{{paginationText(pagination)}}</span>
          </v-col>
          <v-col style="padding: 0px">
            <v-data-footer
            :pagination="pagination"
            :options="options"
            @update:options="updateOptions"
            page-text=""
            items-per-page-text="1ページあたりの表示数:"
            :items-per-page-options="itemsPerPage"
            />
          </v-col>
        </v-row>
      </template>
      <template v-slot:item.data-table-select="{ isSelected, select, item }">
        <v-simple-checkbox
            v-if="(normalMenu && item.richMenuId == normalMenu.richMenuId) ||
            (bosaiMenu && item.richMenuId == bosaiMenu.richMenuId)"
            color="gray"
            indeterminate
            :disabled="true"
        />
        <v-simple-checkbox
            v-else
            color="gray"
            :value="selectedMenus.map((selected) => selected.richMenuId).includes(item.richMenuId)"
            @input="select($event)"
        />
      </template>
      <template v-slot:item.edit="{ item }">
        <div>
          <v-btn color="primary" @click="editableItemFunction(item)">
            編集
          </v-btn>
        </div>
      </template>
      <template v-slot:item.preview="{ item }">
        <v-img
          max-height="100"
          max-width="150"
          style="margin-top: 0.5em; margin-bottom: 0.5em;"
          @click="openImageDialog(rich_menu_image_url + item.richMenuId)"
          :src="rich_menu_image_url + item.richMenuId"
        ></v-img>
      </template>

      <template v-slot:item.setDefault="{ item }">
        <div>
          <v-btn v-if="normalMenu && item.richMenuId == normalMenu.richMenuId" disabled>
            適用中
          </v-btn>
          <v-btn
            v-else color="secondary" @click="setDefaultDisplayMenu(item)"
            :style="hasActionPermission('hideButton', 'ScenarioSettings_RichMenuManageTable_SetDefault')
                ? hideButtonPermissionStyle() : ''">
            適用
          </v-btn>
        </div>
      </template>
      <template v-slot:item.setBosai="{ item }">
        <div>
          <v-btn v-if="bosaiMenu && item.richMenuId == bosaiMenu.richMenuId" disabled>
            適用中
          </v-btn>
          <v-btn
            v-else color="secondary" @click="setBosaiMenu(item)"
            :style="hasActionPermission('hideButton', 'ScenarioSettings_RichMenuManageTable_SetBosai')
                ? hideButtonPermissionStyle(): ''">
            適用
          </v-btn>
        </div>
      </template>
    </v-data-table>
    <ImageDisplayModal :visible="showImageDisplay" :imgSrc="imageSource" @close="showImageDisplay = false" />
    <RichMenuDesigner
      :visible="showRichMenuDesigner"
      :environment="environment"
      :activeMenu="activeMenu"
      :bosaiMenu="bosaiMenu"
      :normalMenu="normalMenu"
      :richMenuList="richMenuList"
      :editableItem="editableItem"
      :richMenuUrlProp="richMenuImageUrl"
      :richMenuFileProp="richMenuImageFile"
      :oppositeEnvironmentMenus="oppositeEnvironmentMenus"
      :oppositeEnvironmentActiveMenu="oppositeEnvironmentActiveMenu"
      :oppositeEnvironmentNormalMenu="oppositeEnvironmentNormalMenu"
      :oppositeEnvironmentBosaiMenu="oppositeEnvironmentBosaiMenu"
      :itemsRichMenu="itemsRichMenu"
      @close="showRichMenuDesigner = false"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import ImageDisplayModal from "../../components/common/ImageDisplayModal.vue";
import RichMenuDesigner from "../components/RichMenuDesigner.vue";
import {
  SET_DEFAULT_PRODUCTION_RICHMENU,
  SET_DEFAULT_SANDBOX_RICHMENU,
  SET_BOSAI_PRODUCTION_RICHMENU,
  SET_BOSAI_SANDBOX_RICHMENU,
} from "@/store/mutation-types";
import {
  SET_ACTIVE_RICH_MENU,
  DELETE_RICH_MENU,
  FETCH_ALL_RICHMENUS,
  SAVE_ACTIVE_SCENARIO,
  COPY_RICH_MENU,
  FETCH_ACTIVE_SCENARIO_DATA,
  FETCH_DEFAULT_RICHMENUS,
  FETCH_ALL_RICHMENUS_ALIAS_LIST,
} from "@/store/action-types";
import { NORMAL_RICH_MENU_PARAM, BOSAI_RICH_MENU_PARAM } from "@/store/modules/scenarios/scenarios.constants";
import cloneDeep from "lodash/cloneDeep";
import { generateUUID } from "@/utils/uuidUtils";
import { isNullOrEmpty } from "@/utils/stringUtils";

export default Vue.extend({
  name: "RichMenuManageTable",
  props: {
    richMenuList: Array,
    environment: String,
    activeMenu: Object,
    normalMenu: Object,
    bosaiMenu: Object,
    oppositeEnvironmentActiveMenu: Object,
    oppositeEnvironmentNormalMenu: Object,
    oppositeEnvironmentBosaiMenu: Object,
    oppositeEnvironmentMenus: Array,
    searchCriteria: Object,
  },
  data() {
    return {
      displayItems: [],
      headers: [
        { text: "画像", value: "preview", sortable: false, width: "20%" },
        { text: "メニュー名", value: "name", sortable: true, width: "50%" },
        { text: "通常", value: "setDefault", sortable: true, align: "center", width: "10%" },
        { text: "災害時", value: "setBosai", sortable: true, align: "center", width: "10%" },
        { text: "", value: "edit", sortable: false, width: "10%", align: "center" },
      ],
      searchText: "",
      showImageDisplay: false,
      showRichMenuDesigner: false,
      imageSource: "",
      editableItem: null,
      richMenuImageFile: "",
      richMenuImageUrl: "",
      rich_menu_image_url: "https://" + process.env.VUE_APP_SCENARIO_CLOUDFRONT_DOMAIN_NAME + "/resources/richmenus/",
      itemsRichMenu: [],
      itemsPerPage: [5, 10, 15, -1],
      selectedMenus: [],
    };
  },
  watch: {
    richMenuList: {
      deep: true,
      handler(value) {
        this.setUpDisplayItems();
        for(let x = this.selectedMenus.length - 1; x >= 0; x--) {
          const result = value.find((elem) => {
            elem.richMenuId === this.selectedMenus[x].richMenuId
          });
          if (result === undefined) {
            this.selectedMenus.splice(x, 1);
          }
        }
      }
    },
    searchCriteria: {
      deep: true,
      handler(value) {
        this.setUpDisplayItems();
      }
    },
    selectedMenus: {
      deep: true,
      handler(value) {
        const selectedMenus = cloneDeep(value);

        if(this.normalMenu && this.normalMenu.richMenuId) {
          const indexOfNormal = selectedMenus.map(function(e) { return e.richMenuId; }).indexOf(this.normalMenu.richMenuId);
          if (indexOfNormal >= 0) {
            selectedMenus.splice(indexOfNormal, 1);
          }
        }

        if(this.bosaiMenu && this.bosaiMenu.richMenuId) {
          const indexOfBosai = selectedMenus.map(function(e) { return e.richMenuId; }).indexOf(this.bosaiMenu.richMenuId);
          if (indexOfBosai >= 0) {
            selectedMenus.splice(indexOfBosai, 1);
          }
        }
        this.$emit("selectedMenus", selectedMenus);
      }
    }
  },
  components: { ImageDisplayModal, RichMenuDesigner },
  computed: {
    ...mapState({
      isFetchingAllRichMenus: (state) => state.scenarios.isFetchingAllRichMenus,
      errorFetchingAllRichMenus: (state) => state.scenarios.errorFetchingAllRichMenus,
      activeScenarioData: (state) => state.scenarios.activeScenarioData,
    }),
  },
  methods: {
    ...mapActions({
      setActiveRichMenu: SET_ACTIVE_RICH_MENU,
      deleteRichMenu: DELETE_RICH_MENU,
      refreshRichMenus: FETCH_ALL_RICHMENUS,
      saveActiveScenario: SAVE_ACTIVE_SCENARIO,
      fetchActiveScenario: FETCH_ACTIVE_SCENARIO_DATA,
      fetchDefaultRichMenu: FETCH_DEFAULT_RICHMENUS,
      fetchAllRichMenuAliasList: FETCH_ALL_RICHMENUS_ALIAS_LIST
    }),
    setUpDisplayItems() {
      this.displayItems = cloneDeep(this.richMenuList);
      if (this.searchCriteria && !isNullOrEmpty(this.searchCriteria.richMenuName)) {
        this.displayItems = this.displayItems.filter((elem) =>
          elem.name && elem.name.includes(this.searchCriteria.richMenuName)
        );
      }

      if (this.searchCriteria && !isNullOrEmpty(this.searchCriteria.normalMode)
        && this.normalMenu && this.normalMenu.richMenuId) {
        if (this.searchCriteria.normalMode === '適用中') {
          this.displayItems = this.displayItems.filter((elem) =>
            elem.richMenuId === this.normalMenu.richMenuId
          );
        } else if (this.searchCriteria.normalMode === '未適用') {
          this.displayItems = this.displayItems.filter((elem) =>
            elem.richMenuId !== this.normalMenu.richMenuId
          );
        }
      }

      if (this.searchCriteria && !isNullOrEmpty(this.searchCriteria.bosaiMode)
        && this.bosaiMenu && this.bosaiMenu.richMenuId) {
        if (this.searchCriteria.bosaiMode === '適用中') {
          this.displayItems = this.displayItems.filter((elem) =>
            elem.richMenuId === this.bosaiMenu.richMenuId
          );
        } else if (this.searchCriteria.bosaiMode === '未適用') {
          this.displayItems = this.displayItems.filter((elem) =>
            elem.richMenuId !== this.bosaiMenu.richMenuId
          );
        }
      }
    },
    paginationText(pagination) {
      const { page, itemsPerPage } = pagination;
      let start = 0;
      let end = 0;
      if (this.displayItems.length === 0) {
        start = 0;
        end = 0;
      } else if (itemsPerPage === -1) {
        start = 1;
        end = this.displayItems.length;
      } else {
        start = page === 1? 1 : itemsPerPage * (page - 1);
        end = itemsPerPage * page > this.displayItems.length ? this.displayItems.length : itemsPerPage * page;
      }
      return start + "-" + end + " 件 / " + this.displayItems.length + "件";
    },
    openImageDialog(src) {
      this.imageSource = src;
      this.showImageDisplay = true;
    },
    setDefaultDisplayMenu(menu) {
      this.$dialog.show({
        title: "リッチメニュー通常設定確認",
        text: "このリッチメニューを通常に設定してもよろしいですか？",
        type: "info",
        btnConfirmTitle: "はい",
        onConfirm: async () => {
          await this.fetchActiveScenario();
          var newScenarioData = cloneDeep(this.activeScenarioData);
          var valueToSet = NORMAL_RICH_MENU_PARAM[this.environment];
          var richMenusToSet = {};
          richMenusToSet[valueToSet] = menu.richMenuId;

          if (newScenarioData) {
            if (newScenarioData.richMenus) {
              newScenarioData.richMenus[valueToSet] = menu.richMenuId;
            } else {
              newScenarioData["richMenus"] = richMenusToSet;
            }
          } else {
            newScenarioData = {
              scenarioId: "settings",
              richMenus: richMenusToSet,
            };
          }
          this.saveActiveScenario(newScenarioData);

          //condition for changing channel rich menu when not in bosaiMode/env not found, condition matched
          if (
            !this.activeScenarioData.bosaiMode ||
            (this.activeScenarioData.bosaiMode && !this.activeScenarioData.bosaiMode[this.environment]) ||
            (this.activeScenarioData.bosaiMode && this.activeScenarioData.bosaiMode[this.environment] == false)
          ) {
            let payload = { richMenu: menu, environment: this.environment };
            this.setActiveRichMenu(payload);
          } else {
            await this.fetchDefaultRichMenu();
          }
          if (this.environment == "production") {
            this.$store.commit(SET_DEFAULT_PRODUCTION_RICHMENU, menu);
          } else {
            this.$store.commit(SET_DEFAULT_SANDBOX_RICHMENU, menu);
          }
        },
      });
    },
    setBosaiMenu(menu) {
      this.$dialog.show({
        title: "リッチメニュー災害時モード設定確認",
        text: "このリッチメニューを災害時モード用に設定してもよろしいですか？",
        type: "info",
        btnConfirmTitle: "はい",
        onConfirm: async () => {
          var newScenarioData = cloneDeep(this.activeScenarioData);
          var valueToSet = BOSAI_RICH_MENU_PARAM[this.environment];
          var richMenusToSet = {};
          richMenusToSet[valueToSet] = menu.richMenuId;

          if (newScenarioData) {
            if (newScenarioData.richMenus) {
              newScenarioData.richMenus[valueToSet] = menu.richMenuId;
            } else {
              newScenarioData["richMenus"] = richMenusToSet;
            }
          } else {
            newScenarioData = {
              scenarioId: "settings",
              richMenus: richMenusToSet,
            };
          }

          this.saveActiveScenario(newScenarioData);
          await this.fetchDefaultRichMenu();
          if (this.environment == "production") {
            this.$store.commit(SET_BOSAI_PRODUCTION_RICHMENU, menu);
          } else {
            this.$store.commit(SET_BOSAI_SANDBOX_RICHMENU, menu);
          }
        },
      });
    },
    customSort(items , sortBy , sortOrder) {
      if (sortBy.length > 0 && sortOrder.length > 0) {
        var categoryToSortBy = sortBy[0];
        var isDesc = sortOrder[0];
        switch (categoryToSortBy) {
          case "name":
            items.sort((a, b) => {
              if (!isDesc) {
                return a.name.localeCompare(b.name);
              } else {
                return b.name.localeCompare(a.name);
              }
            });
            break;
          case "setBosai":
            items.sort((a, b) => {
              if (!isDesc) {
                return this.bosaiMenu && this.bosaiMenu.richMenuId == a.richMenuId ? -1 : 0;
              } else {
                return this.bosaiMenu && this.bosaiMenu.richMenuId == a.richMenuId ? 1 : -1;
              }
            });
            break;
          case "setDefault":
            items.sort((a, b) => {
              if (!isDesc) {
                return this.normalMenu && this.normalMenu.richMenuId == a.richMenuId ? -1 : 0;
              } else {
                return this.normalMenu && this.normalMenu.richMenuId == a.richMenuId ? 1 : -1;
              }
            });
            break;
          case "setActive":
            items.sort((a, b) => {
              if (!isDesc) {
                return this.activeMenu && this.activeMenu.richMenuId == a.richMenuId ? -1 : 0;
              } else {
                return this.activeMenu && this.activeMenu.richMenuId == a.richMenuId ? 1 : -1;
              }
            });
            break;
          default:
            break;
        }
      }
      return items;
    },
    async editableItemFunction(item) {
      let params = {
        richMenuId: item.richMenuId,
        environment: this.environment,
      };

      let aliasItems = [];
      let response = await this.fetchAllRichMenuAliasList(params);
      let name = "";
      for(let responseItem in response) {
        if(response[responseItem].richMenuId === item.richMenuId) {
          delete response[responseItem]
        }
      }
      for(let responseItem in response) {
        for(let richMenuItem in this.richMenuList) {
          if(response[responseItem].richMenuId === this.richMenuList[richMenuItem].richMenuId && this.richMenuList[richMenuItem].name !== "") {
            name = this.richMenuList[richMenuItem].name;
            aliasItems.push({value: response[responseItem].richMenuAliasId , text: name})
          }
        }
      }
      this.itemsRichMenu = aliasItems;

      this.editableItem = cloneDeep(item);
      this.richMenuImageUrl = this.rich_menu_image_url + item.richMenuId + "?" + generateUUID();
      this.showRichMenuDesigner = true;
    },
  },
  created() {},
  mounted() {
    this.setUpDisplayItems();
  },
});
</script>
