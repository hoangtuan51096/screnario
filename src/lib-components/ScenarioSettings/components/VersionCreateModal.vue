<template>
  <v-dialog v-model="show" max-width="600" persistent>
    <v-card max-width="100%" style="overflow-x: hidden">
      <v-system-bar color="primary" dark height="5"></v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title class="blue-grey--text text--darken-4 font-weight-bold">
          新規シナリオ作成
        </v-toolbar-title>
      </v-toolbar>
      <template v-if="!isImportingScenarioData">
        <v-form ref="form">
          <v-row class="mx-2">
            <v-col>
              <div class="body-2 blue-grey--text font-weight-bold">
                バージョン
              </div>
              <v-text-field
                class="pt-4"
                ref="scenarioVersion"
                v-model="scenarioVersion"
                maxlength="120"
                :rules="[rules.notEmpty, rules.notStartsWhiteSpace, rules.notEndsWhiteSpace, rules.isValidVersionName]"
                solo
                hide-details="auto"
                single-line
                outlined
                dense
                flat
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </template>
      <template v-if="isImportingScenarioData">
        <v-row align="center" justify="center">
          <v-col md="1">
            <v-progress-circular :size="50" color="primary" indeterminate> </v-progress-circular>
          </v-col>
        </v-row>
      </template>
      <v-card-actions v-if="!isImportingScenarioData" class="pa-4 d-flex justify-end">
        <template>
          <v-btn
              class="blue-grey--text"
              outlined
              @click="cancelCreate"
          >
            キャンセル
          </v-btn>
          <v-btn
              :disabled="disableCreate"
              class="ml-2"
              color="primary"
              elevation="4"
              @click="hasActionPermission('click', 'backendRequest') ? createVersion() : showActionPermissionError()"
          >
            作成
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapMutations, mapState } from "vuex";
import { CREATE_SCENARIO_VERSION } from "@/store/action-types";
import { SET_IMPORTING_SCENARIO_DATA_ERROR } from "@/store/mutation-types";

interface LocalState {
  scenarioName: string;
  disableCreate: boolean;
  scenarioVersion: string;
  versionList: Array<any>;
  specialScenarios: Array<string>;
  rules: any;
}

export default Vue.extend({
  props: {
    visible: Boolean,
    scenario: Object,
  },
  watch: {
    scenarioVersion() {
      this.validate();
    },
    scenarioName() {
      this.validate();
    },
    creatingScenarioDataError(val) {
      if (val) {
        if (val instanceof String) {
          this.$snackbar.show({ text: val, type: "error" });
        } else {
          this.$snackbar.show({ text: val.message, type: "error" });
        }
      }
    },
    createFinishSuccess(val) {
      if (val) {
        this.$emit("onCreateFinishSuccess");
      }
    },
    visible(val) {
      if (val) {
        this.scenarioVersion = this.getAutoScenarioVersion();
        this.scenarioName = (this.activeScenario && this.activeScenario.scenarioId) || "";
        this.versionList = this.populateVersionsList();
      }
    },
  },
  data() {
    return {
      scenarioName: "",
      disableCreate: true,
      scenarioVersion: "",
      versionList: [],
      specialScenarios: ["損傷報告"],
      rules: null
    };
  },
  components: {},
  computed: {
    ...mapState({
      isImportingScenarioData: (state: any) => state.scenarios.isImportingScenarioData,
      creatingScenarioDataError: (state: any) => state.scenarios.importingScenarioDataError,
      createFinishSuccess: (state: any) => state.scenarios.createFinishSuccess,
      activeScenario: (state: any) => state.scenarios.activeScenario,
      settings: (state: any) => state.scenarios.settings,
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
    }
  },
  methods: {
    ...mapActions({
      createScenarioVersion: CREATE_SCENARIO_VERSION,
    }),
    ...mapMutations({
      setImportingScenarioDataError: SET_IMPORTING_SCENARIO_DATA_ERROR,
    }),
    getAutoScenarioVersion(): string {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      return "ver" + yyyy + mm + dd;
    },
    cancelCreate(): void {
      this.show = false;
      this.scenarioName = "";
      this.scenarioVersion = "";
      this.versionList = [];
    },
    createVersion(): void {
      if (!this.checkValidVersionName(this.scenarioVersion)) {
        this.$snackbar.show({
          text: "同名のバージョンが存在しています。別のバージョン名を指定してください。",
          type: "error",
        });
        return;
      }

      const payload = {
        scenarioName: this.scenarioName,
        scenarioVersion: this.scenarioVersion,
      };
      this.createScenarioVersion(payload);
    },
    checkValidVersionName(value: any): boolean {
      return !this.versionList.includes(value); // valid === not in the version list
    },
    validate(): void {
      this.$nextTick(() => {
        if (
          this.$refs.scenarioVersion &&
          this.$refs.scenarioVersion.form &&
          typeof this.$refs.scenarioVersion.form.validate === "function"
        ) {
          this.$refs.scenarioVersion.form.validate();
        }
      });
      if (!this.checkValidVersionName(this.scenarioVersion)) {
        this.disableCreate = true;
        return;
      }
      if (this.rules.notEmpty(this.scenarioVersion) !== true) {
        this.disableCreate = true;
        return;
      }
      if (this.rules.notStartsWhiteSpace(this.scenarioVersion) !== true) {
        this.disableCreate = true;
        return;
      }
      if (this.rules.notEndsWhiteSpace(this.scenarioVersion) !== true) {
        this.disableCreate = true;
        return;
      }
      if (this.scenarioName === "") {
        this.disableCreate = true;
        return;
      }
      this.disableCreate = false;
    },
    populateVersionsList(): Array<any> {
      if (this.activeScenario && this.activeScenario.versions) {
        const verList = Object.keys(this.activeScenario.versions).reduce((array, version) => {
          array.push(this.activeScenario.versions[version].displayVersionName || version);
          return array;
        }, []);
        const compare = (a, b) => {
          if (a < b) return -1;
          if (a > b) return 1;
          return 0;
        }
        return verList.sort(compare);
      } else {
        return [];
      }
    },
  },
  created() {
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
        return this.checkValidVersionName(value) || "同名のバージョンが存在しています。";
      },
    };
  }
});
</script>
