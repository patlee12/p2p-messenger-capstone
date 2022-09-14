<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
import Messenger from "../components/messenger.vue";

export default defineComponent({
  name: "Dashboard",
  components: { Messenger },
  setup() {},
});
</script>

<template>
  
    <messenger />

</template>
