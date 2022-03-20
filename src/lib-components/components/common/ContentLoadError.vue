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
<template>
  <div>
    <v-row>
      <v-col class="mx-auto text-center" cols="auto">
        <v-icon :color="color" class="display-2">mdi-alert-circle</v-icon>
        <div class="title" v-bind:style="{ color: color }">エラーが発生しました。</div>
        <div class="body-2" v-bind:style="{ color: color }">
          ページの再読み込み実施を実施してください。それでも表示されない場合は、<br />
          サーバへアクセスが混み合っているか、メンテナンス中の可能性があります。<br />
          しばらく時間をおいてから、もう一度アクセスしてください。<br />
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import style from "@/mixins/style";

export default Vue.extend({
  name: "ContentLoadError",
  mixins: [style],
  props: {
    error: {
      type: Error,
    },
    color: String,
  },
  created() {},
});
</script>
