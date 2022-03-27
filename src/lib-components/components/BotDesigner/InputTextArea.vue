<template>
  <div class="input-textarea">
    <textarea
      :class="['full-width app-input-textarea', { 'error-text': (validText !== '') }]"
      :name="name"
      :id="id"
      :autocomplete="autocomplete || 'off'"
      v-model="valueData"
      :disabled="disabled"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :rows="rows"
      @keypress="onlyNumber"
      @input="onInput"
      @change="checkData"
      @focus="focusArea"
      @focusin="focusIn"
      @focusout="focusOut"
    ></textarea>
    <div v-if="validText !== ''" class="v-text-field__details">
      <div class="v-messages theme--light error--text" role="alert">
        <div class="v-messages__wrapper">
          <div class="v-messages__message">
            {{ validText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: "InputTextArea",
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
            "required",
            "label",
            "rows",
            "autocomplete"
        ],

        data() {
            return {
                minlength: false,
                valueData: '',
                stateValid: false
            };
        },
        watch: {
          value() {
            this.valueData = this.value
          }
        },
        computed: {
          validText() {
            if (!this.stateValid) {
              return ''
            }
            if (this.required) {
              if(!this.valueData) {
                return this.label + '空白のみは使用できません。'
              }
            }
            if (this.maxlength) {
              if(this.valueData.length > this.maxlength) {
                return this.label + 'は' + this.maxlength + '文字以内にしてください。'
              }
            }
            return ''
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
              this.stateValid = true
              this.$emit('focus', value)
            },
            focusIn(value) {
              this.$emit('focusin', value)
            },
            focusOut(value) {
              this.$emit('focusout', value)
            },
            onlyNumber($event) {
              if (this.maxlength) {
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
