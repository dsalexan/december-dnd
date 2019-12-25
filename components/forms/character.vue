<template>
  <div class="form-character">
    <!-- name -->
    <v-text-field @input="updateValue()" v-model="internal_value.name" label="Name" solo light dense></v-text-field>
    <!-- type (basically race) -->
    <div class="d-flex flex-row justify-space-around">
      <div class="flex-grow-1">
        <v-text-field
          @input="updateValue()"
          v-model="internal_value.type"
          class="mr-2"
          label="Type"
          solo
          light
          dense
        ></v-text-field>
      </div>
      <div class="flex-grow-1" style="margin-bottom: 18px;">
        <div v-for="(tag, index) in internal_value.tags" :key="index" class="d-flex flex-row">
          <v-text-field
            @input="updateValue()"
            v-model="internal_value.tags[index]"
            class="ml-2"
            label="Tag"
            style="height: 46px;"
            solo
            light
            dense
          >
          </v-text-field>
          <v-btn v-if="index === internal_value.tags.length - 1" @click="addTag()" text icon color="amber" class="ml-2">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn v-else @click="removeTag(index)" text icon color="red" class="ml-2">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <!-- background -->
    <v-text-field @input="updateValue()" v-model="internal_value.background" label="Background" solo light dense></v-text-field>
    <!-- level/cr (basically class) -->
    <div style="margin-bottom: 18px;">
      <div
        v-for="(level, index) in internal_value.level"
        :key="index"
        class="d-flex flex-row justify-space-around"
        style="height: 46px;"
      >
        <v-text-field
          @input="updateValue()"
          v-model="internal_value.level[index].level"
          type="number"
          class="pr-2"
          label="Level"
          solo
          light
          dense
        ></v-text-field>
        <v-text-field
          @input="updateValue()"
          v-model="internal_value.level[index].class.name"
          class="px-2"
          label="Class Name"
          solo
          light
          dense
        ></v-text-field>
        <v-text-field
          @input="updateValue()"
          v-model="internal_value.level[index].class.source"
          class="px-2"
          label="Class Source"
          solo
          light
          dense
        ></v-text-field>
        <v-text-field
          @input="updateValue()"
          v-model="internal_value.level[index].subclass.name"
          class="px-2"
          label="Subclass Name"
          solo
          light
          dense
        ></v-text-field>
        <v-text-field
          @input="updateValue()"
          v-model="internal_value.level[index].subclass.source"
          class="pl-2"
          label="Subclass Source"
          solo
          light
          dense
        ></v-text-field>
        <v-btn v-if="index === internal_value.level.length - 1" @click="addLevel" text icon color="amber" class="ml-2">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn v-else @click="removeLevel" text icon color="red" class="ml-2">
          <v-icon>mdi-minus</v-icon>
        </v-btn>
      </div>
    </div>
    <v-text-field @input="updateValue()" v-model="internal_value.cr" type="number" label="CR" solo light dense></v-text-field>
    <!-- ability -->
    <div class="d-flex flex-row justify-space-between">
      <div
        v-for="ability in ['str', 'dex', 'con', 'int', 'wis', 'cha']"
        :key="ability"
        class="d-flex flex-column align-center px-4"
      >
        <div class="body-2 text-uppercase grey--text text--lighten-2">
          {{ ability }}
        </div>
        <v-text-field
          @input="updateValue()"
          v-model="internal_value.ability[ability]"
          type="number"
          solo
          light
          dense
        ></v-text-field>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

const EMPTY = {
  name: undefined,
  type: undefined,
  tags: [undefined],
  background: undefined,
  level: [
    {
      level: undefined,
      class: {
        name: undefined,
        source: undefined
      },
      subclass: {
        name: undefined,
        source: undefined
      }
    }
  ],
  cr: undefined,
  // TODO: add support to adding special multiple CR like coven, lair
  ability: {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10
  }
}

export default {
  name: 'form-character',
  props: {
    value: {
      type: Object,
      default: () => _.cloneDeep(EMPTY)
    }
  },
  data() {
    return {
      internal_value: this.value
    }
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        this.internal_value = newVal
      },
      deep: true
    }
  },
  methods: {
    updateValue() {
      setTimeout(() => this.$emit('input', this.internal_value), 10)
    },
    addTag() {
      this.internal_value.tags.push(undefined)
    },
    removeTag(index) {
      this.internal_value.tags.splice(index, 1)
    },
    addLevel() {
      this.internal_value.level.push(_.cloneDeep(EMPTY.level[0]))
    },
    removeLevel(index) {
      this.internal_value.level.splice(index, 1)
    }
  }
}
</script>

<style lang="sass" scoped>
.form-character
</style>
