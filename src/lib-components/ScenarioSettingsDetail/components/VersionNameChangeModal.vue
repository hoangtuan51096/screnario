<style scoped>
.modal-contents {
  padding-bottom: 0em !important;
}
</style>

<template>
  <v-dialog scrollable v-model="show" max-width="600">
    <v-card>
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title>シナリオバージョン名変更</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="modal-contents">
        <v-row>
          <v-col>
            <v-text-field
              solo
              hide-details="auto"
              single-line
              outlined
              dense
              flat
              label="シナリオバージョン名"
              maxlength="120"
              v-model="newVersionName"
              :rules="[rules.notEmpty, rules.notStartsWhiteSpace, rules.notEndsWhiteSpace, rules.isValidVersionName]"
            >
            </v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="pa-4 d-flex justify-end">
        <v-btn class="blue-grey--text" outlined @click="show = false">
          キャンセル
        </v-btn>
        <v-btn
            color="primary"
            elevation="4"
            class="ml-2"
            :disabled="saveDisabled"
            @click="updateVersionName"
        >
          変更
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";
import { cloneDeep } from "lodash";
import { isNullOrEmpty } from "@/utils/stringUtils";

interface LocalState {
  newVersionName: any;
  rules: Partial<{
    isValidVersionName: (value: string) => boolean,
  }>;
}

export default Vue.extend({
  props: {
    visible: Boolean,
		existingVersions: Array,
    versionId: String,
    originalVersionName: String,
  },
  watch: {
    visible(value) {
      if (value) {
        this.newVersionName = cloneDeep(this.originalVersionName);
      }
    }
  },
  data(): LocalState {
    return {
      newVersionName: null,
      rules: {},
    };
  },
  components: {},
  computed: {
    ...mapState({
    }),
    saveDisabled() {
      return isNullOrEmpty(this.newVersionName) ||
      this.newVersionName === this.originalVersionName ||
      !this.checkValidVersionName(this.newVersionName);
    },
    show: {
      get(): boolean {
        return this.visible;
      },
      set(value: boolean) {
        if (!value) {
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    updateVersionName(): void {
      this.$emit("updateVersion", this.newVersionName);
      this.show = false;
    },
    checkValidVersionName(value: any): boolean {
      return !this.existingVersions.includes(value); // valid === not in the version list
    },
  },
  created() {
    this.newVersionName = cloneDeep(this.originalVersionName);
    this.rules = {
      notEmpty: (value) => {
        return value !== "" || "バージョンは必須入力です。";
      },
      notStartsWhiteSpace: (value) => {
        return !value.match(/^\s+.*$/) || "先頭に空白を指定することはできません。";
      },
      notEndsWhiteSpace: (value) => {
        return !value.match(/^.*?\s+$/) || "末尾に空白を指定することはできません。";
      },
      isValidVersionName: (value) => {
        return  this.newVersionName === this.originalVersionName || this.checkValidVersionName(value) || "同名のバージョンが存在しています。";
      },
    };
  }
});
</script>
