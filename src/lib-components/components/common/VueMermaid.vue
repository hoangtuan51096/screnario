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
  <div id="mermaid" class="mermaid">{{ parseCode }}</div>
</template>

<script lang="ts">
import Vue from "vue";
import mermaid from "mermaid";
import { DAMAGE_REPORT_FLOW } from "@/constants/scenario.constants";

export default Vue.extend({
  name: "VueMermaid",
  props: {
    type: {
      type: String,
      default: "graph LR",
    },
    nodes: {
      type: Array,
      required: true,
    },
    styles: {
      type: Array,
      default() {
        return [];
      },
    },
    config: {
      type: Object,
      default() {
        return {};
      },
    },
    defaultConfig: {
      type: Object,
      default() {
        return {
          theme: "default",
          startOnLoad: false,
          securityLevel: "loose",
          flowchart: { useMaxWidth: true },
        };
      },
    },
    stopOnError: {
      type: Boolean,
      default: false,
    },
    chartId: String,
  },
  data() {
    return {
      edges: [
        { type: "default", open: "[", close: "]" },
        { type: "round", open: "(", close: ")" },
        { type: "circle", open: "((", close: "))" },
        { type: "asymetric", open: ">", close: "]" },
        { type: "rhombus", open: "{", close: "}" },
        { type: "stadium", open: "([", close: "])" },
        { type: "subroutine", open: "[[", close: "]]" },
      ],
      linkStyles: [
        { type: "default", id: "default", code: "interpolate basis color: #008000" },
        { type: "branch", code: "interpolate basis color: red" },
      ],
    };
  },
  mounted() {
    this.init();
    this.loadNodes();
  },
  computed: {
    nodeObject() {
      const { nodes } = this;
      if (Array.isArray(nodes) && nodes.length > 0) {
        const arrayToObject = (arr, keyField) => Object.assign({}, ...arr.map((item) => ({ [item[keyField]]: item })));
        return arrayToObject(nodes, "id");
      } else {
        return {};
      }
    },
    customStyle() {
      const { nodes, styles } = this;
      const nodeStyles = nodes.filter((node) => node.style).map((node) => `style ${node.id} ${node.style}`);
      const nodeLinkStyles = nodes
        .filter((node) => node.linkStyle)
        .map((node) => `linkStyle ${node.linkNumber || nodes.indexOf(node)} ${node.linkStyle}`);
      return nodeStyles.concat(styles).concat(nodeLinkStyles);
    },
    parseCode() {
      const { nodes } = this;
      if (Array.isArray(nodes) && nodes.length > 0) {
        const parseCode = this.type + "\n";
        const groupNodes = this.getGroupNodes(nodes);
        const code = parseCode + groupNodes + this.customStyle.join(" \n");
        this.load(code);
        console.log(code);
        return code;
      } else {
        return "";
      }
    },
    damageReportCode() {
      return DAMAGE_REPORT_FLOW;
    },
  },
  methods: {
    getGroupNodes(nodes) {
      const innerMap = new Map();
      nodes.forEach((element) => {
        const group = element.group || "";
        const data = innerMap.get(group) || { nids: new Set(), narr: [] };
        data.nids.add(element.id);
        data.narr.push(element);
        innerMap.set(group, data);
      });
      return [...innerMap.entries()]
        .map((item) => {
          const [groupName, entry] = item;
          const { nids, narr } = entry;
          if (groupName !== "") {
            const innerNodes = [];
            const outNodes = [];
            narr.forEach((node) => {
              if (node.next) {
                innerNodes.push({
                  id: node.id,
                  text: node.text,
                  style: node.style,
                });
                node.next.forEach((id) => {
                  if (nids.has(id)) {
                    innerNodes.push({
                      id: node.id,
                      text: node.text,
                      link: node.link,
                      next: [id],
                    });
                  } else {
                    outNodes.push({
                      id: node.id,
                      text: node.text,
                      link: node.link,
                      next: [id],
                    });
                  }
                });
              } else {
                innerNodes.push(node);
              }
            });
            const innerNodesStr = this.buildNodesStr(innerNodes);
            const outNodeStr = this.buildNodesStr(outNodes);
            return `subgraph ${groupName} \n ${innerNodesStr} end \n ${outNodeStr}`;
          } else {
            const nodesStr = this.buildNodesStr(narr);
            return nodesStr;
          }
        })
        .join(" \n");
    },
    buildNodesStr(nodes) {
      var i = 0;
      return (
        nodes
          .map((item) => {
            if (item.next && item.next.length > 0) {
              return item.next
                .map((n, index) => {
                  const next = this.nodeObject[n] || this.nodeObject[n.id];
                  i += 1;
                  if (next != null && typeof next != "undefined") {
                    return `${this.buildNode(item)}${this.buildLink(item, index)}${this.buildNode(next)}\n
                    ${this.buildLinkStyle(item, i - 1)}`;
                  } else {
                    //TODO error
                    return `${this.buildNode(item)}`;
                  }
                })
                .join("\n");
            } else {
              return `${this.buildNode(item)}`;
            }
          })
          .join("\n") +
        "\n" +
        nodes
          .filter((item) => item.editable)
          .map((item) => {
            return `click ${item.id} mermaidClick`;
          })
          .join("\n") +
        "\n" +
        nodes
          .filter((item) => item.url)
          .map((item) => {
            return `click ${item.id} "${item.url}"`;
          })
          .join("\n") +
        "\n"
      );
    },
    buildNode(item) {
      let edge = !item.edgeType
        ? this.edges.find((e) => {
            return e.type === "default";
          })
        : this.edges.find((e) => {
            return e.type === item.edgeType;
          });
      return `${item.id}${edge.open}"${item.text}"${edge.close}`;
    },
    buildLink(item, index) {
      const link = "-->";
      if (item.link) {
        if (Array.isArray(item.link)) {
          if (item.link.length > index) return item.link[index];
          else return item.link[item.link.length - 1];
        } else {
          return item.link;
        }
      }
      return link;
    },
    buildLinkStyle(item, index) {
      let linkStyle = !item.linkStyle
        ? this.linkStyles.find((e) => {
            return e.type === "default";
          })
        : this.linkStyles.find((e) => {
            return e.type === item.linkStyle;
          });
      let _id = linkStyle.id ? linkStyle.id : index;
      return `linkStyle ${_id} ${linkStyle.code}`;
    },
    loadNodes() {
      if (this.chartId) {
        switch (this.chartId) {
          case "損傷報告":
            this.load(this.damageReportCode);
            break;
          default:
            this.load(this.parseCode);
            break;
        }
      } else {
        this.load(this.parseCode);
      }
    },
    init() {
      const _t = this;
      // @ts-ignore
      window.mermaidClick = function (id) {
        _t.edit(id);
      };
      mermaid.initialize(Object.assign(this.defaultConfig, this.config));
    },
    load(code) {
      if (code) {
        var container = document.getElementById("mermaid");
        if (container) {
          container.removeAttribute("data-processed");
          container.replaceChild(document.createTextNode(code), container.firstChild);
          try {
            mermaid.init(code, container);
          } catch (error) {
            if (this.stopOnError) {
              throw error;
            }
          }
        }
      }
    },
    edit(id) {
      this.$emit("nodeClick", id);
    },
  },
});
</script>

<style>
.mermaid {
  text-align: center;
}
</style>
