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
</style>

<template>
  <div class="image-map-message">
    <v-btn :color="usePrimaryButtonColor ? 'primary' : 'secondary'" width="100%" @click="visible = true">イメージマップエディタを開く</v-btn>
    <v-dialog v-model="visible" fullscreen persistent transition="dialog-bottom-transition">
      <v-card>
        <v-system-bar color="primary" dark height="5"></v-system-bar>
        <v-toolbar dense flat>
          <v-toolbar-title>イメージマップ編集</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-alert v-model="hasError" border="left" class="mt-4 multi-line" color="red" text type="error">
            {{ errorMessage }}
          </v-alert>
          <v-row>
            <v-col :cols="5" class="rich-menu-properties-col">
              <div>
                <v-row class="title-row">
                  <span class="text-subtitle-1 font-weight-bold">プロパティ</span>
                </v-row>
                <v-form ref="form">
                  <v-switch v-model="editFiles" label="画像を変更する"> </v-switch>
                  <div v-if="editFiles">
                    <v-file-input
                      v-model="fileModels"
                      :error="!fileModels && !imageMap"
                      :error-messages="!fileModels && !imageMap ? '必須' : ''"
                      accept=".jpg,.jpeg,.png"
                      :label="!fileModels ? 'クリックして画像を開く' : '画像'"
                      @change="fileDataChanged($event)"
                      @focusin="focusIn"
                      @focusout="focusOut"
                      @click:clear="imageMap.areas = []"
                    >
                    </v-file-input>
                    <div class="image-instructions">
                      <p class="caption caption-text">画像形式：JPG, JPEG, PNG</p>
                      <p class="caption caption-text">画像サイズ：10MB以下</p>
                    </div>
                  </div>

                  <div v-if="imageMap && imageMap.areas && imageMap.areas.length === 0">
                    <span class="warning--text">イメージマップには、少なくとも1つのアクション要素が必要です。</span>
                  </div>
                  <div v-if="imageMap && imageMap.areas && imageMap.areas.length === 50">
                    <span class="warning--text"
                      >イメージマップには、最大50のアクション要素しかサポートしていません。</span
                    >
                  </div>
                  <div v-for="(area, index) in imageMap.areas" :key="index">
                    <v-container :class="{ 'active-rich-menu-action': area.selected }">
                      <v-row class="rich-menu-action-row">
                        <v-col class="rich-menu-action-col" cols="10"> アクション {{ index + 1 }} </v-col>
                        <v-col class="rich-menu-action-col">
                          <v-btn color="error" small @click="deleteArea(area.id)"> 削除 </v-btn>
                        </v-col>
                      </v-row>
                      <v-row class="rich-menu-action-row">
                        <v-col class="rich-menu-action-col" cols="9" offset="1">
                          <div>
                            <span class="text-subtitle-2">領域&nbsp;</span>
                            x:{{ area.bounds.x }} y:{{ area.bounds.y }} 横:{{ area.bounds.width }} 縦:{{
                              area.bounds.height
                            }}
                          </div>
                        </v-col>
                        <v-col class="rich-menu-action-col">
                          <v-btn small @click="area.editable = !area.editable"> 編集 </v-btn>
                        </v-col>
                      </v-row>
                      <v-row v-if="area.editable" class="rich-menu-action-row">
                        <v-col class="rich-menu-action-col" offset="1">
                          <v-text-field
                            v-model="area.bounds.x"
                            :error="area.bounds.x === ''"
                            :error-messages="area.bounds.x === '' ? '必須' : ''"
                            label="X"
                            type="number"
                            @focus="focusArea(area.id)"
                            @focusin="focusIn"
                            @focusout="focusOut"
                            @input="changingXCoordinate(area)"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row v-if="area.editable" class="rich-menu-action-row">
                        <v-col class="rich-menu-action-col" offset="1">
                          <v-text-field
                            v-model="area.bounds.y"
                            :error="area.bounds.y === ''"
                            :error-messages="area.bounds.y === '' ? '必須' : ''"
                            label="Y"
                            type="number"
                            @focus="focusArea(area.id)"
                            @focusin="focusIn"
                            @focusout="focusOut"
                            @input="changingYCoordinate(area)"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row v-if="area.editable" class="rich-menu-action-row">
                        <v-col class="rich-menu-action-col" offset="1">
                          <v-text-field
                            v-model="area.bounds.width"
                            :error="area.bounds.width === ''"
                            :error-messages="area.bounds.width === '' ? '必須' : ''"
                            label="横"
                            type="number"
                            @focus="focusArea(area.id)"
                            @focusin="focusIn"
                            @focusout="focusOut"
                            @input="changingWidthCoordinate(area)"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row v-if="area.editable" class="rich-menu-action-row">
                        <v-col class="rich-menu-action-col" offset="1">
                          <v-text-field
                            v-model="area.bounds.height"
                            :error="area.bounds.height === ''"
                            :error-messages="area.bounds.height === '' ? '必須' : ''"
                            label="縦"
                            type="number"
                            @focus="focusArea(area.id)"
                            @focusin="focusIn"
                            @focusout="focusOut"
                            @input="changingHeightCoordinate(area)"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row v-if="area.editable" class="rich-menu-action-row">
                        <v-col offset="1">
                          <span style="font-size: 12px; color: #646464">
                            画像サイズは 横: 1040 縦: {{ imageMapImageHeight }} です。<br />
                            範囲外の値を入力した場合や、範囲が重なっている場合は意図しない動作になる可能性があります。
                          </span>
                        </v-col>
                      </v-row>
                      <v-row v-if="area.editable" class="rich-menu-action-row">
                        <v-col offset="1">
                          <v-divider />
                        </v-col>
                      </v-row>
                      <v-row class="rich-menu-action-row">
                        <v-col class="rich-menu-action-col" offset="1">
                          <v-select
                            v-model="area.action.type"
                            :error="!area.action.type"
                            :error-messages="!area.action.type ? '必須' : ''"
                            :items="actionTypes"
                            label="タイプ"
                            @focus="focusArea(area.id)"
                            @focusin="focusIn"
                            @focusout="focusOut"
                          ></v-select>
                        </v-col>
                      </v-row>
                      <v-row class="rich-menu-action-row">
                        <v-col class="rich-menu-action-col" offset="1">
                          <InputText
                            v-if="area.action.type === 'message'"
                            v-model="area.action.text"
                            :error="!area.action.text && area.action.type === 'message'"
                            :rules="[rules.validAction]"
                            label="テキスト"
                            placeholder="テキスト"
                            maxlength="1000"
                            @change="(value) => { this.area.action.text = value }"
                            @focus="focusArea(area.id)"
                            @focusin="focusIn"
                            @focusout="focusOut"
                          ></InputText>
                        </v-col>
                      </v-row>
                      <v-row class="rich-menu-action-row">
                        <v-col class="rich-menu-action-col" offset="1">
                          <InputText
                            v-if="area.action.type === 'uri'"
                            v-model="area.action.uri"
                            :error="!area.action.uri || !checkValidUrl(area.action.uri)"
                            :rules="[rules.validURL]"
                            maxlength="1000"
                            label="URL"
                            placeholder="URL"
                            @change="(value) => { this.area.action.uri = value }"
                            @focus="focusArea(area.id)"
                            @focusin="focusIn"
                            @focusout="focusOut"
                          ></InputText>
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
                    v-show="this.imageMapImageUrl"
                    :cropUrl="this.imageMapImageUrl"
                    :displayAreas="displayAreas"
                    :emitAreaEvent="visible"
                    :height="imageMapImageHeight"
                    :opacityOutline="0.4"
                    :opacityOverlay="0.2"
                    :width="700"
                    :ignoreWatchArea="true"
                    class="selected-image-area"
                    v-on:getListAreas="getListAreas"
                    v-on:selectAreaClicked="clickingOnSelectArea"
                  />
                </template>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="pa-4 mr-6 elevation-3" large @click="visible = false"> キャンセル </v-btn>
          <v-btn
            :disabled="isValidImageMap"
            :style="
              hasActionPermission('hideButton', 'ScenarioSettings_RichMenuDesigner_Save')
                ? hideButtonPermissionStyle()
                : ''
            "
            class="pa-4 mr-6 primary elevation-3"
            large
            @click="saveImageMap"
          >
            <v-icon>mdi-content-save</v-icon>
            反映して戻る
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapState } from "vuex";
import MultiSelectAreasImage from "../../ScenarioSettings/ImageMultiSelector/MultiSelectAreasImage.vue";
import { CREATE_RICH_MENU, DELETE_RICH_MENU } from "@/store/action-types";
import { cloneDeep, isNumber } from "lodash";
import CryptoJS from "crypto-js";
import InputText from "./InputText.vue";

const areaMaxBound = 2147483647;

export default Vue.extend({
  name: "ItemImageMapMessage",
  props: {
    params: {
      type: Object,
      required: true,
    },
    canSave: Boolean,
    branchIndex: Number,
    usePrimaryButtonColor: Boolean
  },
  data() {
    const params = cloneDeep((this).params) || {};
    return {
      hidePreviewDisplay: ["jsonTemplate", "compositeMessage"],
      originalParams: cloneDeep((this).params) || {},
      imageMapFiles: [],
      visible: false,
      lastDeletedId: null,
      editFiles: false,
      editFocus: false,
      isEditing: false,
      displayAreas: [],
      imageMap: {},
      hasError: false,
      errorMessage: "",
      imageMapImageFile: null,
      imageMapImageUrl: null,
      imageMapImageHeight: params.autoDetectedBaseHeight || 0,
      fileModels: undefined,
      actionTypes: [
        { value: "message", text: "メッセージアクション" },
        { value: "uri", text: "URIアクション" },
      ],
      // eslint-disable-next-line
      urlRegex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      onSave: false,
      rules: {}
    };
  },
  components: {
    MultiSelectAreasImage, InputText
  },
  watch: {
    visible(value) {
      console.log("visible changed", "originalParams:", this.originalParams);
      const params = cloneDeep(this.originalParams);
      this.imageMap = this.toRichMenuEmulateObject(params);
      this.imageMapImageUrl = this.toImageMapImageUrl(params);
      if (!value) {
        this.resetFields();
      }
    },
    params: {
      deep: true,
      immediate: true,
      handler(value) {
        console.log("param changed", "params:", value);
        const params = cloneDeep(value);
        this.imageMap = this.toRichMenuEmulateObject(params);
        this.imageMapImageUrl = this.toImageMapImageUrl(params);
        this.originalParams = cloneDeep(value);
      }
    },
    imageMap: {
      immediate: true,
      deep: true,
      handler(val) {
        console.log("imageMap compute", "val:", cloneDeep(val));
        if (val) {
          this.isEditing = true;
          let tempAreaArray = [];
          if (val.areas && Array.isArray(val.areas)){
            for (let index = 0; index < val.areas.length; index++) {
              var tempArea = {
                ...val.areas[index],
                id: index + 1,
                y: Math.ceil((this.imageMapPreviewImageHeight / this.imageMapImageHeight) * val.areas[index].bounds.y),
                height: Math.ceil(
                  (this.imageMapPreviewImageHeight / this.imageMapImageHeight) * val.areas[index].bounds.height
                ),
                x: Math.ceil((700 / 1040) * val.areas[index].bounds.x),
                width: Math.ceil((700 / 1040) * val.areas[index].bounds.width),
              };
              tempAreaArray.push(tempArea);
            }
          }
          this.displayAreas = cloneDeep(tempAreaArray);
          console.log("imageMap changed", "this.displayAreas:", cloneDeep(this.displayAreas));
        }
      },
    },
    editFiles(value) {
      if (!value) {
        this.fileModels = undefined;
        this.imageMap.size.height = this.originalParams.autoDetectedBaseHeight || 0;
        this.imageMapImageFile = null;
        this.imageMapImageUrl = this.toImageMapImageUrl(this.originalParams);
      }
    },
  },
  computed: {
    ...mapState({
      isCreatingRichMenu: (state) => (state).scenarios.isCreatingRichMenu,
      isCreatingRichMenuError: (state) => (state).scenarios.isCreatingRichMenuError,
    }),
    imageMapPreviewImageHeight() {
      return (700 / 1040) * this.imageMapImageHeight;
    },
    isValidImageMap() {
      var invalidAreas = false;
      if (this.imageMap && this.imageMap.areas){
        this.imageMap.areas.forEach((area) => {
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
            }
          }
          if (area.bounds) {
            if (area.bounds.x === "" || area.bounds.y === "" || area.bounds.width === "" || area.bounds.height === "") {
              invalidAreas = true;
            }
          }
        });
      }
      const isInvalid =
        !this.imageMap || !this.imageMap.areas || !this.imageMap.size ||
        this.imageMap.areas.length == 0 ||
        this.imageMap.size.width == null ||
        this.imageMap.size.height == null ||
        this.imageMapImageUrl == null ||
        invalidAreas;
      if (this.visible) {
        this.$emit("updateSaveStatus", { key: "imageMap", value: !isInvalid });
      }
      return isInvalid;
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
          width: 1040,
          height: null,
        },
        selected: false,
        name: "",
        chatBarText: "",
        areas: [],
      };
      this.editFiles = false;
      this.isEditing = false;
      this.lastDeletedId = null;
      this.hasError = false;
      this.displayAreas = [];
      this.errorMessage = "";
      this.richMenuImageFile = null;
      this.richMenuImageUrl = null;
      this.show = false;
      this.fileModels = undefined;
      this.editFocus = false;
      this.richMenuImageHeight = 0;
    },
    toRichMenuEmulateObject(params) {
      console.log("toRichMenuEmulateObject", "params:", params);
      const richMenuEmulateObject = {
        size: {
          width: params.baseWidth || 1040,
          height: params.autoDetectedBaseHeight || null,
        },
        areas: [],
      };

      if (params.actionCount) {
        let id = 1;
        for (let i = 0; i < params.actionCount; i++) {
          const param = params[`action.${i}`] || {};
          if (isNumber(param.x) && isNumber(param.y) && isNumber(param.width) && isNumber(param.height)) {
            richMenuEmulateObject.areas.push({
              id,
              action: {
                type: param.type || "message",
                text: param.text || "",
                uri: param.uri,
              },
              bounds: {
                x: param.x,
                y: param.y,
                width: param.width,
                height: param.height,
              },
              editable: false,
            });
            id++;
          }
        }
      }
      console.log("toRichMenuEmulateObject", "richMenuEmulateObject:", cloneDeep(richMenuEmulateObject));
      return richMenuEmulateObject;
    },
    toImageMapImageUrl(params) {
      if (params.baseUrl && params.baseUrl.startsWith("data:")) {
        return params.baseUrl;
      }
      if (params.baseUrl && params.baseWidth) {
        return `${params.baseUrl}/${params.baseWidth}`;
      }
      return null;
    },
    checkValidUrl(url) {
      var regex = new RegExp(this.urlRegex);
      return url.match(regex);
    },
    getListAreas(valueBounds) {
      var value = cloneDeep(valueBounds);

      this.displayAreas = valueBounds;
      var indexExists = this.displayAreas.findIndex((x) => x.id === this.lastDeletedId);
      if (indexExists >= 0) {
        this.displayAreas.splice(indexExists, 1);
        this.lastDeletedId = null;
      }

      //Remove any element in imageMap areas that have an id that is not in value
      this.imageMap.areas.forEach((elem) => {
        var idToCheck = elem.id;
        var imageBox = value.filter((obj) => {
          return obj.id === idToCheck;
        });
        if (imageBox.length == 0) {
          var indexToDelete = this.imageMap.areas.findIndex((x) => x.id === idToCheck);
          this.imageMap.areas.splice(indexToDelete, 1);
        }
      });

      value.forEach((elem) => {
        //existingAction is array but should only return one item in theory
        var existingAction = this.imageMap.areas.filter((obj) => {
          return obj.id === elem.id;
        });

        var mappedValue = {};
        if (existingAction.length > 0) {
          //matching element was found, save the existing data and new bounds
          mappedValue = {
            ...existingAction[0],
            selected: elem.selected,
            editable: elem.editable,
            bounds: {
              x: elem.x,
              y: elem.y,
              width: elem.width,
              height: elem.height,
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
            },
          };
        }

        mappedValue.bounds.y = Math.floor((this.imageMapImageHeight / this.imageMapPreviewImageHeight) * elem.y);
        mappedValue.bounds.height = Math.floor(
          (this.imageMapImageHeight / this.imageMapPreviewImageHeight) * elem.height
        );
        mappedValue.bounds.x = Math.floor((1040 / 700) * elem.x);
        mappedValue.bounds.width = Math.floor((1040 / 700) * elem.width);

        if (existingAction.length > 0) {
          var indexToReplace = this.imageMap.areas.findIndex((x) => x.id === existingAction[0].id);
          if (indexToReplace >= 0) {
            this.imageMap.areas[indexToReplace].selected = mappedValue.selected;

            this.imageMap.areas[indexToReplace].bounds.x = mappedValue.bounds.x < 0 ? 0 :
              mappedValue.bounds.x > areaMaxBound ? areaMaxBound : mappedValue.bounds.x;
            this.imageMap.areas[indexToReplace].bounds.y = mappedValue.bounds.y < 0 ? 0 :
              mappedValue.bounds.y > areaMaxBound ? areaMaxBound : mappedValue.bounds.y;
            this.imageMap.areas[indexToReplace].bounds.height = mappedValue.bounds.height < 0 ? 0 :
              mappedValue.bounds.height > areaMaxBound ? areaMaxBound : mappedValue.bounds.height;
            this.imageMap.areas[indexToReplace].bounds.width = mappedValue.bounds.width < 0 ? 0 :
              mappedValue.bounds.width > areaMaxBound ? areaMaxBound : mappedValue.bounds.width;

            this.imageMap.areas[indexToReplace].action = mappedValue.action;
          }
        } else {
          this.imageMap.areas.push(mappedValue);
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
            let img = new Image();
            img.onload = async () => {
              //run validation here
              if (event.size > 10000000) {
                this.errorMessage = "画像のサイズ制限は10MBです";
                this.hasError = true;
                this.fileModels = undefined;
              } else {
                this.imageMap.size.height = this.imageMapImageHeight = Math.ceil(img.height * (1040 / img.width));
                this.imageMapImageUrl = e.target.result;
                this.imageMapImageFile = event;

                const innerResp = await fetch(e.target.result);
                const wordArray = CryptoJS.lib.WordArray.create(await innerResp.arrayBuffer());
                this.imageMapImageFile.hash = CryptoJS.SHA1(wordArray).toString();
                console.log("hash:", this.imageMapImageFile.hash);
              }
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(event);
        } else {
          this.errorMessage = "画像はjpg,jpeg,pngのいずれかである必要があります";
          this.hasError = true;
        }
      } else {
        this.imageMapImageFile = null;
        this.imageMapImageUrl = null;
      }
    },
    setImgSize(imgSize) {
      console.log("setImgSize:", imgSize);
    },
    checkError(errorMessage, successMessage) {
      if (!errorMessage) {
        this.hasError = false;
        this.$snackbar.show({
          text: successMessage,
        });
      }
    },
    saveImageMap() {
      console.log("saveImageMap", "this.hasError:", this.hasError);
      if (!this.hasError) {
        const payload = {
          ...this.originalParams,
          actionCount: this.imageMap.areas.length,
        };
        console.log("saveImageMap", "this.imageMap:", cloneDeep(this.imageMap));
        this.imageMap.areas.forEach((area, index) => {
          const action = {
            width: area.bounds.width < 0 ? 0 : area.bounds.width > areaMaxBound ? areaMaxBound : area.bounds.width,
            height: area.bounds.height < 0 ? 0 : area.bounds.height > areaMaxBound ? areaMaxBound : area.bounds.height,
            x: area.bounds.x < 0 ? 0 : area.bounds.x > areaMaxBound ? areaMaxBound : area.bounds.x,
            y: area.bounds.y < 0 ? 0 : area.bounds.y > areaMaxBound ? areaMaxBound : area.bounds.y,
            type: area.action.type,
            isAreaEditMode: false,
            quadrant: 0,
            text: "",
            uri: null
          };
          switch (area.action.type) {
            case "message":
              {
                action.text = area.action.text;
              }
              break;
            case "uri":
              {
                action.uri = area.action.uri;
              }
              break;
          }
          payload[`action.${index}`] = action;
        });
        if (this.imageMapImageFile) {
          payload.baseUrl = this.imageMapImageUrl;
          payload.baseWidth = 1040;
          payload.autoDetectedBaseHeight = this.imageMapImageHeight;

          let type = this.imageMapImageFile.type.split("/").pop() || "png";
          if (type === "jpeg") {
            type = "jpg";
          }
          payload.image2 = {
            type: "file",
            file: {
              cloned: false,
              cloneId: null,
              id: "", // NOTE: UploadImageToS3のときに使うUUIDが後で入る
              name: this.imageMapImageFile.name,
              type: type,
              hash: this.imageMapImageFile.hash,
            },
          };
        }
        console.log("saveImageMap", "payload:", cloneDeep(payload));
        this.$emit("updateParams", cloneDeep(payload));
        this.visible = false;
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
      if (!Number.isInteger(area.bounds.x)) {
        area.bounds.x = parseInt(area.bounds.x, 10);
      }
      if (area.bounds.x < 0) {
        area.bounds.x = 0;
      } else if (parseInt(area.bounds.x) + parseInt(area.bounds.width) > this.imageMap.size.width) {
        area.bounds.x = 1040 - area.bounds.width;
      }
      var newX = area.bounds.x;

      var mappedX = (newX * 700) / 1040;

      var indexToUpdate = this.displayAreas.findIndex((item) => item.id === area.id);
      this.displayAreas[indexToUpdate].x = mappedX;
    },
    changingYCoordinate(area) {
      if (!Number.isInteger(area.bounds.y)) {
        area.bounds.y = parseInt(area.bounds.y, 10);
      }
      if (area.bounds.y < 0) {
        area.bounds.y = 0;
      } else if (parseInt(area.bounds.y) + parseInt(area.bounds.height) > this.imageMap.size.height) {
        area.bounds.y = this.imageMap.size.height - area.bounds.height;
      }
      var newY = area.bounds.y;

      var mappedY = (newY * this.imageMapPreviewImageHeight) / this.imageMapImageHeight;

      var indexToUpdate = this.displayAreas.findIndex((item) => item.id === area.id);
      this.displayAreas[indexToUpdate].y = mappedY;
    },
    changingWidthCoordinate(area) {
      if (!Number.isInteger(area.bounds.width)) {
        area.bounds.width = parseInt(area.bounds.width, 10);
      }
      if (area.bounds.width < 0) {
        area.bounds.width = 0;
      } else if (parseInt(area.bounds.x, 10) + parseInt(area.bounds.width, 10) > this.imageMap.size.width) {
        area.bounds.width = this.imageMap.size.width - area.bounds.x;
      }

      const newWidth = area.bounds.width;

      const mappedWidth = (newWidth * 700) / 1040;

      var indexToUpdate = this.displayAreas.findIndex((item) => item.id === area.id);
      this.displayAreas[indexToUpdate].width = mappedWidth;
    },
    changingHeightCoordinate(area) {
      if (!Number.isInteger(area.bounds.height)) {
        area.bounds.height = parseInt(area.bounds.height, 10);
      }
      if (area.bounds.height < 0) {
        area.bounds.height = 0;
      } else if (parseInt(area.bounds.y) + parseInt(area.bounds.height) > this.imageMap.size.height) {
        area.bounds.height = this.imageMap.size.height - area.bounds.y;
      }

      var newHeight = area.bounds.height;

      var mappedHeight = (newHeight * this.imageMapPreviewImageHeight) / this.imageMapImageHeight;

      var indexToUpdate = this.displayAreas.findIndex((item) => item.id === area.id);
      this.displayAreas[indexToUpdate].height = mappedHeight;
    },
    cancelRichMenuCreate() {
      this.visible = false;
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
    this.rules = {
      validAction: (value) => {
        if (value.length <= 0) {
          return "テキストは空白のみは使用できません。";
        }
        if (value.length >= 1000) {
          return "テキストは1000文字以内にしてください。";
        }
        return true;
      },
      validURL: (value) => {
        if (value.length <= 0) {
          return "URLは空白のみは使用できません。";
        }
        return true;
      }
    };
  },
  mounted() {
    this.imageMap = this.toRichMenuEmulateObject(this.params);
    this.imageMapImageUrl = this.toImageMapImageUrl(this.params);
    this.onSave = false;
  },
});
</script>
