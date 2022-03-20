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
.single-bubble-flex-container {
  width: 25em;
}

.fxC2 {
  color: #666666 !important;
}

.fxC1 {
  color: #aaaaaa !important;
}

.fxC0 {
  color: #999999 !important;
}

.LyGi {
  width: 100%;
  max-width: 500px;
  min-width: 0;
}

.LyMe {
  width: 100%;
  max-width: 300px;
  min-width: 0;
}

.LyKi {
  width: 100%;
  max-width: 260px;
  min-width: 0;
}

.LyMi {
  width: 100%;
  max-width: 160px;
  min-width: 0;
}

.LyNa {
  width: 100%;
  max-width: 120px;
  min-width: 0;
}

@import url(https://static.line-scdn.net/line_flexible_msg/172927b9b3c/css/sp/main.css?26687621);
</style>

<template>
  <v-container class="bubble-flex-preview-container">
    <div class="single-bubble-flex-container" v-html="renderedBubbleFlex"></div>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { render } from "@/services/flexRender.ts";

interface LocalState {
  renderedBubbleFlex: string;
}

export default Vue.extend({
  name: "BubbleFlexPreview",
  props: {
    message: Object,
  },
  data(): LocalState {
    return {
      renderedBubbleFlex: "<span>読み込み中</span>",
    };
  },
  watch: {
    message(value) {
      this.renderedBubbleFlex = render(value);
    },
  },
  components: {},
  computed: {
    ...mapState({}),
  },
  methods: {},
  created() {
    this.renderedBubbleFlex = render(this.message);
  },
});
</script>
