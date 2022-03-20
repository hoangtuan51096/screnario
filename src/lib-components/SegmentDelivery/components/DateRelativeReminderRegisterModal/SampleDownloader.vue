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
  <a
    target="_blank"
    download="日付リマインド設定サンプル.csv"
    :href="href"
  >サンプルファイルのダウンロード</a>
</template>

<script lang="ts">
import Vue from 'vue';

interface LocalState {
  sampleContents: Array<Array<string | number>>;
  href: string;
}

export default Vue.extend({
  data(): LocalState {
    return {
      sampleContents: [
        ['経過年数', '経過日数', 'メッセージ1', 'メッセージ2'],
        [0, 30, '1ヶ月検診の時期が来ました。以下より予約に進んでください。', 'https://smartcity.linefukuoka.co.jp/ja/project/smartcityproject'],
        [0, 180, '半年検診の時期が来ました。以下より予約に進んでください。', 'https://smartcity.linefukuoka.co.jp/ja/project/smartcityproject'],
        [1, -1, '明日は誕生日ですね、誕生日の準備頑張ってください。', ''],
        [1, 0, 'お子様のお誕生日おめでとうございます。', ''],
      ],
      href: '',
    };
  },
  created() {
    const csvContents = this.sampleContents.reduce((accContents, content) => {
      return accContents + content.join(',') + '\n';
    }, '');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContents], { type: 'text/csv' });
    this.href = URL.createObjectURL(blob);
  },
});
</script>
