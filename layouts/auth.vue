<template>
  <v-card>
    <v-layout>
      <v-app-bar color="primary" prominent>
        <v-app-bar-nav-icon variant="text"></v-app-bar-nav-icon>

        <v-toolbar-title>Absensi</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text="Import CPNS" variant="text" to="/import-cpns"></v-btn>

        <!-- <template v-if="$vuetify.display.mdAndUp">
          <v-btn icon="mdi-magnify" variant="text"></v-btn>

          <v-btn icon="mdi-filter" variant="text"></v-btn>
        </template> -->

        <!-- <v-btn icon="mdi-dots-vertical" variant="text"></v-btn> -->
        <v-btn @click="logoutHandler">Logout</v-btn>
      </v-app-bar>

      <v-main style="min-height: 300px">
        <v-container>
          <slot />
        </v-container>
      </v-main>
    </v-layout>
  </v-card>
</template>
<script setup>
const router = useRouter();
const { logout } = useSanctumAuth();

const logoutHandler = async () => {
  await logout();
  router.push("/login");
};
</script>
