<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";

export default defineComponent({
  name: "Messenger",

  setup() {
    const windowHeight=window.innerHeight*.7
    const rules= [
        value => !!value || 'Required.',
        value => (value && value.length >= 3) || 'Min 3 characters',
      ]
  return{
    windowHeight,
    rules,
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
    <v-card-actions>
       <v-text-field
      label="Peer ID"
      :rules="rules"
      hide-details="auto"
    ></v-text-field>
    <v-text-field
      label="Your Name"
      :rules="rules"
      hide-details="auto"
    ></v-text-field>
    <v-text-field
      label="Connect URL"
      :rules="rules"
      hide-details="auto"
    ></v-text-field>
    <v-btn>Connect</v-btn>
    </v-card-actions>
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
<style scoped>
.v-text-field{
  padding: 10px;
}
</style>