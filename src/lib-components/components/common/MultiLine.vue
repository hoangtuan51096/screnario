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
  <div
      class="multiline"
      v-html="$slots.default.pop().text.replace(/。/g, '。<br>').trim()"
  />
</template>

<style scoped>
.multiline {
  max-width: 100%;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  overflow: hidden;
}
</style>
