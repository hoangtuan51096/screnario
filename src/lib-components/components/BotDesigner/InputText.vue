<template>
  <div class="input-text">
    <input
      class="full-width app-input-text"
      :name="name"
      :id="id"
      type="text"
      :autocomplete="autocomplete || 'off'"
      v-model="valueData"
      :disabled="disabled"
      :maxlength="maxlength"
      :placeholder="placeholder"
      @keypress="onlyNumber"
      @input="onInput"
      @change="checkData"
      @focus="focusArea"
      @focusin="focusIn"
      @focusout="focusOut"
    />

    <v-text-field
        v-model="valueData"
        outlined
        dense
        @keypress="onlyNumber($event)"
        :rules="rules"
        :maxlength="maxlength"
    >
    </v-text-field>
  </div>
</template>

<script>
    export default {
        name: "InputText",
        props: [
            "id",
            "name",
            "type",
            "rules",
            "value",
            "placeholder",
            "disabled",
            "maxlength",
            "value",
            "autocomplete"
        ],

        data() {
            return {
                minlength: false,
                valueData: ''
            };
        },
        watch: {
          value() {
            this.valueData = this.value
          }
        },
        created() {
            this.valueData = this.value
        },
        methods: {
            checkData() {
              this.$emit('change', this.valueData)
            },
            focusArea(value) {
              this.$emit('focus', value)
            },
            focusIn(value) {
              this.$emit('focusin', value)
            },
            focusOut(value) {
              this.$emit('focusout', value)
              if (this.valueData === null) {
                this.valueData = ""
                this.$emit('change', this.valueData)
              }
            },
            onlyNumber($event) {
              if (this.maxlength && (this.valueData !== null)) {
                if (this.valueData.length >= this.maxlength) {
                  $event.preventDefault()
                }
              }
            },
            onInput (event) {
                let value = event.target.value;
                let data = ''
                let check = false
                if (this.maxlength) {
                  for (var i = 0; i < value.length; i++) {
                    if (i <= (this.maxlength - 1)) {
                      data += ('' + value[i])
                    } else {
                      check = true
                    }
                  }
                }
                event.target.value = check ? this.valueData : data;
                this.$emit('change', event.target.value)
                this.$emit('input', event.target.value)
                if (event.target.getAttribute("maxlength") != null && event.target.value.length > event.target.getAttribute("maxlength")) {
                    event.target.blur()
                }
            }
        }
    };
</script>
