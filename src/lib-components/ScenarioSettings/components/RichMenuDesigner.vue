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
.rich-menu-properties-col {
  height: calc(100vh - 150px);
  padding-top: 0px;
  overflow: scroll;
}
.image-select-area {
  padding-top: 0px;
  background-color: #688bbc;
}
.active-rich-menu-action {
  border-left: medium solid #00b900 !important;
}
.rich-menu-action-col {
  padding-top: 0.1em;
  padding-bottom: 0.1em;
}
.title-row {
  background-color: #F2F2F2;
  padding-left: 1em;
}
.image-select-area {
  overflow: hidden;
  border-radius: 5px;
}
.selected-image-area {
  margin: 1.5em;
}
.caption {
  margin-bottom: 0em;
  margin-left: 0.5em;
  padding-left: 0.5em;
}
.image-instructions {
  margin-bottom: 1em;
}
.rich-menu-action-row {
  padding-top: 0.5em !important;
}
</style>
<template>
  <v-dialog fullscreen persistent v-model="show" transition="dialog-bottom-transition">
    <v-card id="designerCard">
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat dense>
        <v-toolbar-title>リッチメニュー{{ isEditing ? "編集" : "作成" }}</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <v-alert v-model="hasError" class="mt-4 multi-line" color="red" border="left" type="error" text>
          {{ errorMessage }}
        </v-alert>
        <v-row>
          <v-col :cols="5" class="rich-menu-properties-col">
            <div>
              <v-form ref="form">
                <div>
                  <span class="font-weight-bold">タイトル</span>
                  <v-text-field
                    v-model="richMenu.name"
                    placeholder="タイトル"
                    outlined
                    hide-details="auto"
                    @focusin="focusIn"
                    @focusout="focusOut"
                    disabled
                  ></v-text-field>
                </div>

                <div>
                  <span class="font-weight-bold">テンプレートタイプ</span>
                  <v-select
                    v-model="richMenu.size.height"
                    :items="itemsBaseHeight"
                    placeholder="テンプレートタイプ"
                    outlined
                    hide-details="auto"
                    @focusin="focusIn"
                    @focusout="focusOut"
                    :error="!richMenu.size.height"
                    :error-messages="!richMenu.size.height ? '必須' : ''"
                  ></v-select>
                </div>

                <div>
                  <span class="font-weight-bold">リッチメニュー画像を選択</span>
                  <v-file-input
                    v-model="fileModels"
                    @change="fileDataChanged($event)"
                    @click:clear="richMenu.areas = []"
                    placeholder="ファイルを選択"
                    @focusin="focusIn"
                    @focusout="focusOut"
                    outlined
                    prepend-icon=""
                    prepend-inner-icon="mdi-import"
                    hide-details="auto"
                    accept=".jpg,.jpeg,.png"
                    :error="!fileModels && !editableItem"
                    :error-messages="!fileModels && !editableItem ? '必須' : ''"
                  >
                  </v-file-input>
                  <div class="image-instructions" v-if="fileModels">
                    <p class="caption caption-text">画像サイズ：{{richMenuFileSize.height}}x{{richMenuFileSize.width}}</p>
                  </div>
                  <div v-else class="image-instructions">
                    <p class="caption caption-text">画像形式：JPG, JPEG, PNG</p>
                    <p class="caption caption-text">画像容量：1MB以下</p>
                    <p class="caption caption-text">画像サイズ：縦.250px以上/横.800px~2500px</p>
                    <p class="caption caption-text">画像アスペクト比(横÷縦)：1.45以上</p>
                  </div>
                </div>

                <div>
                  <span class="font-weight-bold">デフォルトでメニューを表示</span>
                  <v-select
                    v-model="richMenu.selected"
                    :items="itemsDefault"
                    outlined
                    @focusin="focusIn"
                    @focusout="focusOut"
                  ></v-select>
                </div>

                <div>
                  <span class="font-weight-bold">トークルームのタイトルバー名</span>
                  <v-text-field
                    v-model="richMenu.chatBarText"
                    placeholder="メニュー"
                    outlined
                    @focusin="focusIn"
                    @focusout="focusOut"
                    :error="!richMenu.chatBarText || richMenu.chatBarText.length > 14"
                    :error-messages="
                      !richMenu.chatBarText
                        ? '必須'
                        : richMenu.chatBarText.length > 14
                        ? '値は14文字未満である必要があります'
                        : ''
                    "
                  ></v-text-field>
                </div>

                <div v-if="richMenu.areas.length == 0">
                  <span class="warning--text">リッチメニューには、少なくとも1つのアクション要素が必要です。</span>
                </div>
                <div v-if="richMenu.areas.length == 20">
                  <span class="warning--text">リッチメニューは、最大20のアクションしかサポートできません。</span>
                </div>

                <div v-for="(area, index) in richMenu.areas" :key="index">
                  <v-container :class="{ 'active-rich-menu-action': area.selected }">
                    <v-row class="rich-menu-action-row">
                      <v-col class="rich-menu-action-col font-weight-bold" cols="10"> アクション {{ index + 1 }} </v-col>
                      <v-col class="rich-menu-action-col">
                        <v-btn v-if="area.selected" color="error" small @click="deleteArea(area.id)"> 削除 </v-btn>
                      </v-col>
                    </v-row>

                    <v-row class="rich-menu-action-row" align="center" style="margin-top: 0.5em;">
                      <v-col :cols="4" style="text-align: end">
                        <span>タイプ</span>
                      </v-col>
                      <v-col class="rich-menu-action-col">
                        <v-select
                          v-model="area.action.type"
                          :items="actionTypes"
                          @focus="focusArea(area.id)"
                          placeholder="タイプ"
                          outlined
                          @focusin="focusIn"
                          @focusout="focusOut"
                          hide-details="auto"
                          :error="!area.action.type"
                          :error-messages="!area.action.type ? '必須' : ''"
                        ></v-select>
                      </v-col>
                    </v-row>

                    <v-row class="rich-menu-action-row" v-if="area.action.type === 'message'">
                      <v-col :cols="4" style="text-align: end">
                        <span>テキスト</span>
                      </v-col>
                      <v-col class="rich-menu-action-col">
                        <v-text-field
                          v-model="area.action.text"
                          @focus="focusArea(area.id)"
                          placeholder="テキスト"
                          outlined
                          @focusin="focusIn"
                          @focusout="focusOut"
                          :error="!area.action.text"
                          :error-messages="!area.action.text ? '必須' : ''"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>
                    </v-row>


                    <div v-if="area.action.type === 'postback'">
                      <v-row class="rich-menu-action-row">
                        <v-col :cols="4" style="text-align: end">
                          <span>テキスト</span>
                        </v-col>
                        <v-col class="rich-menu-action-col">
                          <v-text-field
                            v-model="area.action.displayText"
                            @focus="focusArea(area.id)"
                            placeholder="テキスト"
                            outlined
                            @focusin="focusIn"
                            @focusout="focusOut"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row class="rich-menu-action-row">
                        <v-col :cols="4" style="text-align: end">
                          <span>データ</span>
                        </v-col>
                        <v-col class="rich-menu-action-col">
                          <v-text-field
                            v-model="area.action.data"
                            @focus="focusArea(area.id)"
                            placeholder="データ"
                            outlined
                            @focusin="focusIn"
                            @focusout="focusOut"
                            :error="!area.action.data"
                            :error-messages="!area.action.data ? '必須' : ''"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </div>

                    <v-row class="rich-menu-action-row" v-if="area.action.type == 'uri'">
                      <v-col :cols="4" style="text-align: end">
                        <span>リンク</span>
                      </v-col>
                      <v-col class="rich-menu-action-col">
                        <v-text-field
                          v-model="area.action.uri"
                          @focus="focusArea(area.id)"
                          placeholder="リンク"
                          outlined
                          @focusin="focusIn"
                          @focusout="focusOut"
                          :error="!area.action.uri || !checkValidUrl(area.action.uri)"
                          :error-messages="!area.action.uri ? '必須' : !checkValidUrl(area.action.uri) ? 'リンクが無効です' : ''"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row class="rich-menu-action-row" align="center" v-if="area.action.type === 'richmenuswitch'">
                      <v-col :cols="4" style="text-align: end">
                        <span>メニュー</span>
                      </v-col>
                      <v-col class="rich-menu-action-col">
                        <v-select
                            v-model="area.action.richMenuAliasId"
                            :items="itemsRichMenu"
                            @focus="focusArea(area.id)"
                            placeholder="メニュー"
                            outlined
                            @focusin="focusIn"
                            @focusout="focusOut"
                            hide-details="auto"
                            :error="!area.action.richMenuAliasId"
                            :error-messages="!area.action.richMenuAliasId ? '必須' : ''"
                        ></v-select>
                      </v-col>
                    </v-row>

                    <v-row class="rich-menu-action-row" align="center">
                      <v-col :cols="4" style="text-align: end">
                        <span>サイズ（横：縦）</span>
                      </v-col>
                      <v-col class="rich-menu-action-col">
                        <v-text-field
                          v-model="area.bounds.width"
                          type="number"
                          @input="changingWidthCoordinate(area)"
                          @focus="focusArea(area.id)"
                          outlined
                          @focusin="focusIn"
                          @focusout="focusOut"
                          :error="area.bounds.width === ''"
                          :error-messages="area.bounds.width === '' ? '必須' : ''"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>
                      <v-col class="rich-menu-action-col">
                        <v-text-field
                          v-model="area.bounds.height"
                          type="number"
                          @input="changingHeightCoordinate(area)"
                          @focus="focusArea(area.id)"
                          outlined
                          @focusin="focusIn"
                          @focusout="focusOut"
                          :error="area.bounds.height === ''"
                          :error-messages="area.bounds.height === '' ? '必須' : ''"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row class="rich-menu-action-row" align="center">
                      <v-col :cols="4" style="text-align: end">
                        <span>位置（X：Y）</span>
                      </v-col>
                      <v-col class="rich-menu-action-col">
                        <v-text-field
                          v-model="area.bounds.x"
                          type="number"
                          @input="changingXCoordinate(area)"
                          @focus="focusArea(area.id)"
                          outlined
                          @focusin="focusIn"
                          @focusout="focusOut"
                          :error="area.bounds.x === ''"
                          :error-messages="area.bounds.x === '' ? '必須' : ''"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>
                      <v-col class="rich-menu-action-col">
                        <v-text-field
                            v-model="area.bounds.y"
                            type="number"
                            @input="changingYCoordinate(area)"
                            @focus="focusArea(area.id)"
                            outlined
                            @focusin="focusIn"
                            @focusout="focusOut"
                            :error="area.bounds.y === ''"
                            :error-messages="area.bounds.y === '' ? '必須' : ''"
                            hide-details="auto"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </div>
              </v-form>
            </div>
          </v-col>
          <v-col :cols="7" class="image-select-area">
            <v-row class="title-row">
              <span class="text-subtitle-1 font-weight-bold">プレビュー</span>
            </v-row>
            <v-row>
              <template>
                <MultiSelectAreasImage
                  class="selected-image-area"
                  v-show="this.richMenuImageUrl"
                  :cropUrl="this.richMenuImageUrl"
                  :width="richMenuImageWidth"
                  :height="richMenuImageHeight"
                  :opacityOutline="0.4"
                  :opacityOverlay="0.2"
                  :displayAreas="displayAreas"
                  :scrollTop="scrollTop()"
                  :scrollLeft="scrollLeft()"
                  v-on:getListAreas="getListAreas"
                  v-on:selectAreaClicked="clickingOnSelectArea"
                  :emitAreaEvent="visible"
                />
              </template>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn large class="pa-4 mr-6 elevation-3" :disabled="isCreatingRichMenu" @click="cancelRichMenuCreate()">
          キャンセル
        </v-btn>
        <v-btn
          large
          class="pa-4 mr-6 primary elevation-3"
          :disabled="canCreateMenu()"
          @click="saveRichMenu"
          :loading="isCreatingRichMenu"
          :style="
            hasActionPermission('hideButton', 'ScenarioSettings_RichMenuDesigner_Save')
              ? hideButtonPermissionStyle()
              : ''
          "
        >
          保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import MultiSelectAreasImage from "../ImageMultiSelector/MultiSelectAreasImage.vue";
import { CREATE_RICH_MENU, DELETE_RICH_MENU, FETCH_ALL_RICHMENUS_ALIAS_LIST } from "@/store/action-types";
import { RICH_MENU_WIDTH, RICH_MENU_HEIGHT_LARGE, RICH_MENU_HEIGHT_SHORT } from "@/constants/scenario.constants";
import { cloneDeep } from "lodash";
import { invalid } from "moment";
import { isNullOrEmpty } from '@/utils/stringUtils';

export default Vue.extend({
  name: "RichMenuDesigner",
  props: {
    visible: Boolean,
    richMenuList: Array,
    environment: String,
    editableItem: Object,
    createRichMenuName: String,
    richMenuUrlProp: String,
    richMenuFileProp: String,
    activeMenu: Object,
    normalMenu: Object,
    bosaiMenu: Object,
    oppositeEnvironmentMenus: Array,
    oppositeEnvironmentActiveMenu: Object,
    oppositeEnvironmentNormalMenu: Object,
    oppositeEnvironmentBosaiMenu: Object,
    itemsRichMenu: Array,
  },
  data() {
    return {
      lastDeletedId: null,
      editFocus: false,
      isEditing: false,
      oldRichMenuId: null,
      settingUpEdit: false,
      displayAreas: [],
      richMenu: {
        size: {
          width: RICH_MENU_WIDTH,
          height: null,
        },
        selected: false,
        name: "",
        chatBarText: "",
        areas: [],
      },
      hasError: false,
      errorMessage: "",
      areaLength: 1,
      richMenuImageFile: null,
      richMenuImageUrl: null,
      richMenuImageHeight: 0,
      richMenuFileSize: {
        width: 0,
        height: 0,
      },
      fileModels: undefined,
      actionTypes: [
        { value: "message", text: "テキスト" },
        { value: "uri", text: "リンク" },
        { value: "postback", text: "ポストバック" },
        { value: "richmenuswitch", text: "リッチメニュー" },
      ],
      itemsDefault: [
        { value: false, text: "表示しない" },
        { value: true, text: "表示する" },
      ],
      itemsBaseHeight: [
        { value: RICH_MENU_HEIGHT_LARGE, text: "大" },
        { value: RICH_MENU_HEIGHT_SHORT, text: "小" },
      ],
      richMenuImageWidth: 700,
      urlRegex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    };
  },
  components: {
    MultiSelectAreasImage,
  },
  watch: {
    editableItem: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          this.settingUpEdit = true;
          this.isEditing = true;
          this.richMenu = cloneDeep(val);
          for (let index = 0; index < this.oppositeEnvironmentMenus.length; index++) {
            if (this.oppositeEnvironmentMenus[index].name === this.richMenu.name) {
              this.oldRichMenuId = this.oppositeEnvironmentMenus[index].richMenuId;
              break;
            } else {
              this.oldRichMenuId = null;
            }
          }

          let $this = this;
          var img = new Image();
          img.onload = function() {
            $this.richMenuImageHeight = (this).height * ($this.richMenuImageWidth / (this).width);
            let tempAreaArray = [];
            for (let index = 0; index < $this.richMenu.areas.length; index++) {
              $this.richMenu.areas[index].id = index + 1;
              $this.richMenu.areas[index].selected = false;
              $this.richMenu.areas[index].editable = false;
              let tempArea = {
                id: index + 1,
                selected: false,
                resizable: false,
                editable: false,
                y: ($this.richMenuImageHeight / $this.richMenu.size.height) * $this.richMenu.areas[index].bounds.y,
                height: ($this.richMenuImageHeight / $this.richMenu.size.height) * $this.richMenu.areas[index].bounds.height,
                x: ($this.richMenuImageWidth / RICH_MENU_WIDTH) * $this.richMenu.areas[index].bounds.x,
                width: ($this.richMenuImageWidth / RICH_MENU_WIDTH) * $this.richMenu.areas[index].bounds.width,
              };
              tempAreaArray.push(tempArea);
            }
            $this.displayAreas = cloneDeep(tempAreaArray);
            $this.settingUpEdit = false;
          };
          img.src = this.richMenuUrlProp;

        } else if (!isNullOrEmpty(this.createRichMenuName)) {
          this.richMenu.name = cloneDeep(this.createRichMenuName);
        }
      },
    },
    richMenuUrlProp: {
      immediate: true,
      deep: true,
      handler(val) {
        this.richMenuImageUrl = val;
      },
    },
    visible: function (val) {
      if (val && !isNullOrEmpty(this.createRichMenuName)){
        this.richMenu.name = cloneDeep(this.createRichMenuName);
      }
    }
  },
  computed: {
    ...mapState({
      isCreatingRichMenu: (state) => state.scenarios.isCreatingRichMenu,
      isCreatingRichMenuError: (state) => state.scenarios.isCreatingRichMenuError,
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
  methods: {
    ...mapActions({
      createRichMenu: CREATE_RICH_MENU,
      deleteRichMenu: DELETE_RICH_MENU,
    }),
    resetFields() {
      this.richMenu = {
        size: {
          width: RICH_MENU_WIDTH,
          height: null,
        },
        selected: false,
        name: "",
        chatBarText: "",
        areas: [],
      };
      this.settingUpEdit = false;
      this.isEditing = false;
      this.lastDeletedId = null;
      this.hasError = false;
      this.displayAreas = [];
      this.errorMessage = "";
      this.richMenuImageFile = null;
      this.richMenuImageUrl = null;
      this.show = false;
      this.fileModels = undefined;
      this.richMenuFileSize = {
        width: 0,
        height:0
      }
      this.editFocus = false;
      this.richMenuImageHeight = 0;
    },
    scrollTop() {
      const elem = document.getElementById('designerCard')
      if (elem) {
        return elem.getBoundingClientRect().top * -1;
      } else {
        return 0;
      }
    },
    scrollLeft() {
      const elem = document.getElementById('designerCard')
      if (elem) {
        return elem.getBoundingClientRect().left * -1;
      } else {
        return 0;
      }
    },
    checkValidUrl(url) {
      var regex = new RegExp(this.urlRegex);
      return url.match(regex);
    },
    canCreateMenu() {
      var invalidAreas = false;
      this.richMenu.areas.forEach((area) => {
        if (area.action) {
          if (area.action.type == "message") {
            if ((area.action.text && area.action.text.length == 0) || !area.action.text) {
              invalidAreas = true;
            }
          } else if (area.action.type == "uri") {
            //check for valid url too
            if (
              (area.action.uri && (area.action.uri.length == 0 || !this.checkValidUrl(area.action.uri))) ||
              !area.action.uri
            ) {
              invalidAreas = true;
            }
          } else if (area.action.type == "postback") { //text can be empty for postback but data is required
            if ((area.action.data && area.action.data.length == 0) || !area.action.data) {
              invalidAreas = true;
            }
          } else if (area.action.type == "richmenuswitch") {
            if (!area.action.richMenuAliasId) {
              invalidAreas = true;
            }
          }
        }
        if (area.bounds) {
          if (area.bounds.x === "" || area.bounds.y === "" || area.bounds.width === "" || area.bounds.height === "") {
            invalidAreas = true;
          }
        }
      });
      return (
        this.richMenu.areas.action == [] ||
        this.richMenu.name.length == 0 ||
        this.richMenu.name.length > 300 ||
        this.richMenu.areas.length == 0 ||
        this.richMenu.chatBarText.length == 0 ||
        this.richMenu.chatBarText.length > 14 ||
        this.richMenu.size.width == null ||
        this.richMenu.size.height == null ||
        this.richMenuImageUrl == null ||
        invalidAreas
      );
    },
    getListAreas(valueBounds) {
      if (this.settingUpEdit) {
        return;
      }

      var value = cloneDeep(valueBounds);

      this.displayAreas = valueBounds;
      var indexExists = this.displayAreas.findIndex((x) => x.id === this.lastDeletedId);
      if (indexExists >= 0) {
        this.displayAreas.splice(indexExists, 1);
        this.lastDeletedId = null;
      }

      //Remove any element in richMenu areas that have an id that is not in value
      this.richMenu.areas.forEach((elem) => {
        var idToCheck = elem.id;
        var imageBox = value.filter((obj) => {
          return obj.id === idToCheck;
        });
        if (imageBox.length == 0) {
          var indexToDelete = this.richMenu.areas.findIndex((x) => x.id === idToCheck);
          this.richMenu.areas.splice(indexToDelete, 1);
        }
      });

      value.forEach((elem) => {
        //existingAction is array but should only return one item in theory
        var existingAction = this.richMenu.areas.filter((obj) => {
          return obj.id === elem.id;
        });

        var mappedValue  = {};
        if (existingAction.length > 0) {
          //matching element was found, save the existing data and new bounds
          mappedValue = {
            id: existingAction[0].id,
            selected: elem.selected,
            editable: elem.editable,
            bounds: {
              x: elem.x,
              y: elem.y,
              width: elem.width,
              height: elem.height,
            },
            action: {
              type: existingAction[0].action.type,
              text: existingAction[0].action.text,
              data: existingAction[0].action.data,
              uri: existingAction[0].action.uri,
              richMenuAliasId: existingAction[0].action.richMenuAliasId,
              richmenuswitch: existingAction[0].action.richmenuswitch,
            },
          };
        } else {
          //existing item not found, create a new action item with bounds
          mappedValue = {
            id: elem.id,
            selected: elem.selected,
            editable: false,
            bounds: {
              x: elem.x,
              y: elem.y,
              width: elem.width,
              height: elem.height,
            },
            action: {
              type: "message",
              text: "",
              data: "",
              uri: "",
              richmenuswitch: "",
            },
          };
        }

        if (this.richMenu.size.height == RICH_MENU_HEIGHT_SHORT) {
          mappedValue.bounds.y = Math.round((RICH_MENU_HEIGHT_SHORT / this.richMenuImageHeight) * elem.y);
          mappedValue.bounds.height = Math.round((RICH_MENU_HEIGHT_SHORT / this.richMenuImageHeight) * elem.height);
        } else {
          mappedValue.bounds.y = Math.round((RICH_MENU_HEIGHT_LARGE / this.richMenuImageHeight) * elem.y);
          mappedValue.bounds.height = Math.round((RICH_MENU_HEIGHT_LARGE / this.richMenuImageHeight) * elem.height);
        }
        mappedValue.bounds.x = Math.round((RICH_MENU_WIDTH / this.richMenuImageWidth) * elem.x);
        mappedValue.bounds.width = Math.round((RICH_MENU_WIDTH / this.richMenuImageWidth) * elem.width);

        if (existingAction.length > 0) {
          var indexToReplace = this.richMenu.areas.findIndex((x) => x.id === existingAction[0].id);
          if (indexToReplace >= 0) {
            this.richMenu.areas[indexToReplace].selected = mappedValue.selected;

            this.richMenu.areas[indexToReplace].bounds.x = mappedValue.bounds.x;
            this.richMenu.areas[indexToReplace].bounds.y = mappedValue.bounds.y;
            this.richMenu.areas[indexToReplace].bounds.height = mappedValue.bounds.height;
            this.richMenu.areas[indexToReplace].bounds.width = mappedValue.bounds.width;

            this.richMenu.areas[indexToReplace].action.type = mappedValue.action.type;
            this.richMenu.areas[indexToReplace].action.text = mappedValue.action.text;
            this.richMenu.areas[indexToReplace].action.data = mappedValue.action.data;
            this.richMenu.areas[indexToReplace].action.uri = mappedValue.action.uri;
            this.richMenu.areas[indexToReplace].action.richmenuswitch = mappedValue.action.richmenuswitch;
          }
        } else {
          this.richMenu.areas.push(mappedValue);
        }
      });
    },
    fileDataChanged(event) {
      if (event) {
        if (event.type === "image/jpg" || event.type === "image/jpeg" || event.type === "image/png") {
          this.errorMessage = "";
          this.hasError = false;
          var reader = new FileReader();
          reader.onload = (e) => {
            let img  = new Image();
            img.onload = () => {
              //run validation here
              if (event.size > 1000000) {
                this.errorMessage = "画像のサイズ制限は1MBです";
                this.hasError = true;
                this.fileModels = undefined;
              } else if (img.width < 800 || img.width > 2500) {
                this.errorMessage = "画像の横制限は800pxから2500pxまでです";
                this.hasError = true;
                this.fileModels = undefined;
              } else if (img.height < 250) {
                this.errorMessage = "画像の縦制限は250px以上です";
                this.hasError = true;
                this.fileModels = undefined;
              } else if (img.width / img.height < 1.45) {
                this.errorMessage = "画像のアスペクト比(横割る縦)制限は1.45以上です";
                this.hasError = true;
                this.fileModels = undefined;
              } else {
                this.richMenuImageHeight = img.height * (this.richMenuImageWidth / img.width);
                this.richMenuImageFile = event;
                this.richMenuFileSize = {
                  width: img.width,
                  height: img.height
                };
                this.richMenuImageUrl = e.target.result;
              }
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(event);
        } else {
          this.errorMessage = "画像はjpg,jpeg,pngをえらんでください！";
          this.hasError = true;
        }
      } else {
        this.richMenuImageFile = null;
        this.richMenuImageUrl = null;
      }
    },
    checkError(errorMessage , successMessage) {
      if (!errorMessage) {
        this.hasError = false;
        this.$snackbar.show({
          text: successMessage,
        });
        this.resetFields();
      }
    },
    async saveRichMenu() {
      if (this.editableItem == null && this.productionList) {
        var allItems = this.productionList.concat(this.sandboxList);
        for (let index = 0; index < allItems.length; index++) {
          if (allItems[index].name == this.richMenu.name) {
            this.errorMessage = "同じ名前のリッチメニューがあるため保存できません！";
            this.hasError = true;
            break;
          } else {
            this.errorMessage = "";
            this.hasError = false;
          }
        }
      }
      if (this.hasError == false) {
        var payload;
        if (this.editableItem == null) {
          // for creating rich menu
          payload = {
            richMenu: this.richMenu,
            richMenuImage: this.richMenuImageFile,
          };
          payload.richMenu.areas.forEach((area) => {
            if (area.action) {
              if (area.action.type == "richmenuswitch") {
                area.action.data = area.action.richMenuAliasId;
              }
            }
          });
          let createResponse = await this.createRichMenu(payload);
          let createMessage = createResponse.productionAndSandboxAreSame
            ? "リッチメニュー作成しました"
            : createResponse.productionRichMenuId && createResponse.sandboxRichMenuId
            ? "本番とサンドボックスにリッチメニュー作成しました"
            : createResponse.productionRichMenuId
            ? "本番にリッチメニュー作成しました"
            : "サンドボックスにリッチメニュー作成しました";
          this.checkError(this.isCreatingRichMenuError, createMessage);
        } else {
          // for editing rich menu
          //checking for current env flags
          if (this.bosaiMenu && this.bosaiMenu.richMenuId === this.richMenu.richMenuId) {
            payload = {
              richMenu: this.richMenu,
              environment: this.environment,
              bosaiFlag: true,
            };
          } else if (this.normalMenu && this.normalMenu.richMenuId === this.richMenu.richMenuId) {
            payload = {
              richMenu: this.richMenu,
              environment: this.environment,
              normalFlag: true,
            };
          } else
            payload = {
              richMenu: this.richMenu,
              environment: this.environment,
            };
          if (this.activeMenu && this.activeMenu.richMenuId === this.richMenu.richMenuId) {
            payload.activeFlag = true;
          }
          //checking for opposite env flags
          if (this.oldRichMenuId) {
            if (
              this.oppositeEnvironmentBosaiMenu &&
              this.oppositeEnvironmentBosaiMenu.richMenuId === this.oldRichMenuId
            ) {
              payload.oppositeEnvironmentBosaiFlag = true;
            } else if (
              this.oppositeEnvironmentNormalMenu &&
              this.oppositeEnvironmentNormalMenu.richMenuId === this.oldRichMenuId
            ) {
              payload.oppositeEnvironmentNormalFlag = true;
            }
            if (
              this.oppositeEnvironmentActiveMenu &&
              this.oppositeEnvironmentActiveMenu.richMenuId === this.oldRichMenuId
            ) {
              payload.oppositeEnvironmentActiveFlag = true;
            }
          }
          payload.editable = true;
          payload.oldRichMenuId = this.oldRichMenuId;
          payload.richMenuId = this.richMenu.richMenuId;
          if (this.fileModels != undefined) payload.richMenuImage = this.richMenuImageFile;
          payload.richMenu.areas.forEach((area) => {
            if (area.action) {
              if (area.action.type == "richmenuswitch") {
                area.action.data = area.action.richMenuAliasId;
              }
            }
          });
          await this.createRichMenu(payload);
          this.checkError(this.isCreatingRichMenuError, "リッチメニュー更新しました");
        }
      }
    },
    focusArea(areaId) {
      var indexToReplace = this.displayAreas.findIndex((x) => x.id === areaId);
      for (var index = 0; index < this.displayAreas.length; index++) {
        if (index == indexToReplace) {
          this.displayAreas[index].selected = true;
          this.displayAreas[index].z = 100;
          this.displayAreas[index].resizable = true;
        } else {
          this.displayAreas[index].selected = false;
          this.displayAreas[index].z = 0;
          this.displayAreas[index].resizable = false;
        }
      }
    },
    deleteArea(areaId) {
      //this.lastDeletedId = areaId;
      var indexToReplace = this.displayAreas.findIndex((x) => x.id == areaId);
      if (indexToReplace >= 0) {
        this.displayAreas.splice(indexToReplace, 1);
        this.getListAreas(this.displayAreas);
      }
    },
    deleteSelectedArea(event) {
      if (event.keyCode == 8 && !this.editFocus) {
        var indexToReplace = this.displayAreas.findIndex((x) => x.selected);
        if (indexToReplace >= 0) {
          this.displayAreas.splice(indexToReplace, 1);
          this.getListAreas(this.displayAreas);
        }
      }
    },
    changingXCoordinate(area) {
      if (area.bounds.x < 0) {
        area.bounds.x = 0;
      } else if (parseInt(area.bounds.x) + parseInt(area.bounds.width) > this.richMenu.size.width) {
        area.bounds.x = RICH_MENU_WIDTH - area.bounds.width;
      }
      var newX = area.bounds.x;

      var mappedX = (newX * this.richMenuImageWidth) / RICH_MENU_WIDTH;

      var indexToUpdate = this.displayAreas.findIndex((item) => item.id === area.id);
      this.displayAreas[indexToUpdate].x = mappedX;
    },
    changingYCoordinate(area) {
      if (area.bounds.y < 0) {
        area.bounds.y = 0;
      } else if (parseInt(area.bounds.y) + parseInt(area.bounds.height) > this.richMenu.size.height) {
        area.bounds.y = this.richMenu.size.height - area.bounds.height;
      }
      var newY = area.bounds.y;

      var mappedY = (newY * this.richMenuImageHeight) / this.richMenu.size.height;

      var indexToUpdate = this.displayAreas.findIndex((item) => item.id === area.id);
      this.displayAreas[indexToUpdate].y = mappedY;
    },
    changingWidthCoordinate(area) {
      if (area.bounds.width < 0) {
        area.bounds.width = 0;
      } else if (parseInt(area.bounds.x) + parseInt(area.bounds.width) > this.richMenu.size.width) {
        area.bounds.width = this.richMenu.size.width - area.bounds.x;
      }

      var newWidth = area.bounds.width;

      var mappedWidth = (newWidth * this.richMenuImageWidth) / RICH_MENU_WIDTH;

      var indexToUpdate = this.displayAreas.findIndex((item) => item.id === area.id);
      this.displayAreas[indexToUpdate].width = mappedWidth;
    },
    changingHeightCoordinate(area) {
      if (area.bounds.height < 0) {
        area.bounds.height = 0;
      } else if (parseInt(area.bounds.y) + parseInt(area.bounds.height) > this.richMenu.size.height) {
        area.bounds.height = this.richMenu.size.height - area.bounds.y;
      }

      var newHeight = area.bounds.height;

      var mappedHeight = (newHeight * this.richMenuImageHeight) / this.richMenu.size.height;

      var indexToUpdate = this.displayAreas.findIndex((item) => item.id === area.id);
      this.displayAreas[indexToUpdate].height = mappedHeight;
    },
    cancelRichMenuCreate() {
      this.show = false;
      this.resetFields();
    },
    focusIn() {
      this.editFocus = true;
    },
    focusOut() {
      this.editFocus = false;
    },
    clickingOnSelectArea() {
      (document).activeElement.blur();
    },
  },
  created() {
    window.addEventListener("keyup", this.deleteSelectedArea);
  },
});
</script>
