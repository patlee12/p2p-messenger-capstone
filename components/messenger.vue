<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";

export default defineComponent({
  name: "Messenger",

  setup() {
    const windowHeight=window.innerHeight*.7
  return{
    windowHeight,
  }},
});
</script>

<template>
<div>
<v-row>
  <v-col cols="6">
  <v-card>
    <v-card-title>
   Configuration
    </v-card-title>
    <v-card-text>Hello</v-card-text>
  </v-card>
  </v-col>
   <v-col cols="6">
  <v-card :height=windowHeight>
    <v-card-title>
   Conversation
    </v-card-title>
  </v-card>
  </v-col>
</v-row>
</div>

</template>