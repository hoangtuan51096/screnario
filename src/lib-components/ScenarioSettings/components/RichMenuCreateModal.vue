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
@font-face {
  font-family: lucidaConsole;
  src: url("../../../../assets/fonts/LUCON.TTF");
}
.jsonEditArea {
  white-space: nowrap;
  font-family: lucidaConsole, monospace;
}
</style>
<template>
  <v-dialog scrollable persistent v-model="show">
    <v-card>
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat dense>
        <v-toolbar-title>リッチメニュー作成</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon　@click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col :cols="8">
            <div>
              <label>JSONデータ</label>
              <v-textarea
                v-model="jsonRichMenuText"
                outlined
                class="jsonEditArea"
                background-color="grey lighten-2"
                rows="14"
                @input="onChangeInput"
              ></v-textarea>
            </div>
          </v-col>
          <v-col :cols="4">
            <v-file-input
              v-model="fileModels"
              @change="fileDataChanged($event)"
              label="リッチメニューの画像"
              accept=".jpg,.jpeg,.png"
            >
            </v-file-input>
            <img :src="this.richMenuImageUrl" height="130px" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          large
          class="pa-4 mr-6 primary elevation-3"
          @click="saveRichMenu"
          :loading="isCreatingRichMenu"
          :style="
            hasActionPermission('hideButton', 'ScenarioSettings_RichMenuCreateModal_Save')
              ? hideButtonPermissionStyle()
              : ''
          "
          ><v-icon>mdi-content-save</v-icon>保存</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import { CREATE_RICH_MENU } from "@/store/action-types";

interface LocalState {
  errorText: boolean;
  richMenuBody: any;
  richMenuImageUrl: any;
  richMenuImageFile: any;
  fileModels: any;
  jsonRichMenuText: any;
}

export default {
  name: "RichMenuCreateModal",
  props: {
    visible: Boolean,
  },
  data(): LocalState {
    return {
      errorText: false,
      richMenuBody: null,
      richMenuImageUrl: null,
      richMenuImageFile: null,
      fileModels: undefined,
      jsonRichMenuText: null,
    };
  },
  components: {},
  computed: {
    ...mapState({
      isCreatingRichMenu: (state: any) => state.scenarios.isCreatingRichMenu,
      isCreatingRichMenuError: (state: any) => state.scenarios.isCreatingRichMenuError,
    }),
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
  },
  methods: {
    ...mapActions({
      createRichMenu: CREATE_RICH_MENU,
    }),
    resetFields(): void {
      this.richMenuImageUrl = null;
      this.richMenuImageFile = null;
      this.fileModels = undefined;
      this.jsonRichMenuText = "";
    },
    fileDataChanged(event: any): void {
      if (event) {
        var reader = new FileReader();
        reader.onload = (e) => {
          console.log(event);
          this.richMenuImageFile = event;
          this.richMenuImageUrl = e.target.result;
        };
        reader.readAsDataURL(event);
      } else {
        this.richMenuImageFile = null;
        this.richMenuImageUrl = null;
      }
    },
    checkError(errorMessage: any, successMessage: any): void {
      if (errorMessage) {
        this.$snackbar.show({
          text: errorMessage,
          type: "error",
        });
      } else {
        this.resetFields();
        this.$snackbar.show({
          text: successMessage,
        });
      }
    },
    async saveRichMenu(): Promise<void> {
      if (this.richMenuBody && this.validateJSON(this.richMenuBody)) {
        if (this.richMenuImageFile != null) {
          if (this.richMenuImageFile.size <= 10485760) {
            if (
              this.richMenuImageFile.type === "image/jpeg" ||
              this.richMenuImageFile.type === "image/jpeg" ||
              this.richMenuImageFile.type === "image/png"
            ) {
              this.hasError = false;
              try {
                let payload = {
                  richMenu: JSON.parse(this.richMenuBody),
                  richMenuImage: this.richMenuImageFile,
                };
                let response = await this.createRichMenu(payload);
                this.show = false;
                this.checkError(this.isCreatingRichMenuError, "リッチメニュー作成しました");
              } catch (error) {
                console.log(error);
                this.errorMessage = "リッチメニュー作成に失敗しました！";
                this.hasError = true;
              }
            } else {
              this.errorMessage = "画像はjpg,jpeg,pngをえらんでください！";
              this.hasError = true;
            }
          } else {
            this.errorMessage = "画像は10MB以下をえらんでください！";
            this.hasError = true;
          }
        } else {
          this.errorMessage = "リッチメニューの画像をえらんでください！";
          this.hasError = true;
        }
      } else {
        this.errorMessage = "JSONのフォーマットを確認してください！";
        this.hasError = true;
      }
    },
    onChangeInput(value: any): void {
      this.richMenuBody = value;
    },
    validateJSON(value: any): boolean {
      try {
        var JSONobj = JSON.parse(value);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
  created() {},
};
</script>
