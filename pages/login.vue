// File: pages/login.vue
<template>
  <v-container class="d-flex align-center justify-center mt-10" fill-height>
    <v-card elevation="10" class="ma-16" max-width="500">
      <v-card-title
        class="justify-center text-h5 deep-purple--text text--accent-4"
      >
        Welcome Back
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- Email Input -->
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            :rules="[rules.required, rules.email]"
            outlined
            dense
            color="deep-purple accent-4"
          />

          <!-- Password Input -->
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[rules.required, rules.min(6)]"
            outlined
            dense
            color="deep-purple accent-4"
          />

          <!-- Login Button -->
          <v-btn
            class="mt-4"
            block
            :disabled="!valid"
            color="deep-purple accent-4"
            dark
            @click="onLogin"
          >
            Login
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          text
          color="deep-purple accent-4"
          @click="$router.push('/register')"
        >
          Don't have an account? Sign up
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const { login } = useSanctumAuth();

const email = ref("test@example.com");
const password = ref("password");
const valid = ref(false);
const router = useRouter();
definePageMeta({
  layout: "login",
});
const rules = {
  required: (value) => !!value || "This field is required",
  email: (value) => /.+@.+\..+/.test(value) || "E-mail must be valid",
  min: (length) => (value) =>
    (value || "").length >= length || `Min ${length} characters`,
};

const onLogin = async () => {
  if (!valid.value) return;
  const userCredentials = {
    email: email.value,
    password: password.value,
  };

  await login(userCredentials);

  router.push("/");
};
</script>

<style scoped>
html,
body {
  margin: 0;
  height: 100%;
  background: url("https://images.unsplash.com/photo-1499377193864-82682aefed04?q=80&w=2082&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")
    no-repeat center center fixed;
  background-size: cover;
}

.v-container {
  background-color: rgba(237, 231, 246, 0.8); /* Semi-transparent overlay */
  border-radius: 10px;
}
</style>
