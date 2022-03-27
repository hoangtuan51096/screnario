
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
    import { mapState } from "vuex";
    import { getPaginationText } from "@/utils/pagination";
    export default Vue.extend({
        props: {
            scenariosListPaginate: Array,
		        total: Number,
            dataTableOptions: Object
        },
        mixins: [],
        components: {},
        data() {
            return {};
        },
        watch: {},
        computed: {
            ...mapState({
                isFetchingScenarioDetail: (state) => state.scenarios.isFetchingScenarioDetail
            }),
		        paginationText() {
                const totalCount = this.total + " 件";
                return getPaginationText(this.dataTableOptions.from, this.dataTableOptions.to, totalCount, this.scenariosListPaginate);
            },
            isPreviousDisabled() {
                return (this.dataTableOptions.page === 1) || this.isFetchingScenarioDetail;
            },
            isNextDisabled() {
                return (this.dataTableOptions.page * this.dataTableOptions.perPage >= this.total) || this.isFetchingScenarioDetail
            }
        },
        methods: {
            handlePrevious() {
                this.$emit('change', this.dataTableOptions.page - 1)
            },
            handleNext() {
                this.$emit('change', this.dataTableOptions.page + 1)
            },
        },
        created() {},
    });
</script>
