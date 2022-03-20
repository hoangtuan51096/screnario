
<template>
	<div>
		<v-divider></v-divider>
		<v-container fluid>
			<v-row no-gutters>
				<v-col cols="auto" class="body-1 align-self-center">
          <span class="mx-1 body-1 grey--text text--darken-2">
            {{ paginationText }}
          </span>
				</v-col>
				<v-spacer></v-spacer>
				<v-col cols="auto" class="align-self-center mx-2">
					<v-icon color="grey--text text--darken-1" :disabled="isPreviousDisabled" @click="handlePrevious" left
					>mdi-chevron-left
					</v-icon>
				</v-col>
				<v-col cols="auto" class="align-self-center">
					<v-icon color="grey--text text--darken-1" :disabled="isNextDisabled" @click="handleNext" left
					>mdi-chevron-right
					</v-icon>
				</v-col>
			</v-row>
		</v-container>
		<v-divider></v-divider>
	</div>
</template>

<script lang="ts">
    import Vue from "vue";
    import { mapState, mapActions, mapMutations } from "vuex";
    import { getPaginationText } from "@/utils/pagination";
    import {SET_TABLE_OPTION_SCENARIO} from "@/store/modules/scenarios/mutations-types";
    import {FETCH_ALL_SCENARIOS} from "@/store/action-types";
    export default Vue.extend({
        props: {},
        mixins: [],
        components: {},
        data() {
            return {};
        },
        watch: {},
        computed: {
            ...mapState({
                scenariosListPaginate: (state: any) => state.scenarios.scenariosListPaginate,
                dataTableOptions: (state: any) => state.scenarios.dataTableOptions,
                isFetchingScenarios: (state: any) => state.scenarios.isFetchingScenarios
            }),
            page: {
                get(): any {
                    return this.dataTableOptions.page;
                },
                set(value: any): void {
                    this.setListDataTableOptions({
                        ...this.dataTableOptions,
                        page: value,
                    });
                    this.fetchData();
                },
            },
		        paginationText(): string {
                if (this.scenariosListPaginate.meta) {
                    const totalCount = this.scenariosListPaginate.meta.total + " 件";
                    return getPaginationText(this.scenariosListPaginate.meta.from, this.scenariosListPaginate.meta.to, totalCount, this.scenariosListPaginate.data);
                }
            },
            isPreviousDisabled(): boolean {
                return this.page <= 1 || this.isFetchingScenarioList;
            },
            isNextDisabled(): boolean {
                if (this.scenariosListPaginate.meta) {
                    const totalPages = Math.ceil(this.scenariosListPaginate.meta.total / this.dataTableOptions.itemsPerPage);
                    const isLastPage = this.page === totalPages;
                    return (this.page >= totalPages && isLastPage) || this.isFetchingScenarioList;
                }
								return true
            }
        },
        methods: {
            ...mapMutations({
                setListDataTableOptions: SET_TABLE_OPTION_SCENARIO,
            }),
            async fetchData(): Promise<void> {
                this.$emit('change')
            },
            handlePrevious(): void {
                this.page = this.page - 1;
            },
            handleNext(): void {
                this.page = this.page + 1;
            },
        },
        created() {},
    });
</script>
