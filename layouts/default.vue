<script>
import { defineComponent, onMounted } from "@nuxtjs/composition-api";

export default defineComponent({
  name: "DefaultLayout",
  setup() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-home",
          title: "Home",
          to: "/",
        },
        {
          icon: "mdi-application",
          title: "Overview",
          to: "/dashboard",
        },
      ],
    };
  },
});
</script>

<template>
  <v-app dark>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon
        v-for="(item, i) in items"
        :key="i"
        :to="item.to"
        router
        exact
      >
        <v-icon>{{ item.icon }}</v-icon>
      </v-app-bar-nav-icon>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>
