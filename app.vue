<template>
  <div>
    <v-container class="mt-10">
      <v-row no-gutters>
        <v-col>
          <v-card color="primary" variant="outlined" class="mx-auto">
            <v-card-item>
              <div class="pa-2 ma-2">
                <div class="text-overline mb-1">Tanda Tangan Disini</div>
                <VueSignaturePad
                  width="100%"
                  height="350px"
                  ref="signaturePad"
                  :customStyle="customStyle"
                />
              </div>
            </v-card-item>

            <v-card-actions>
              <!-- <div>
          <button @click="save">Save</button>
          <button @click="undo">Undo</button>
        </div> -->
              <v-btn @click="save" color="primary" variant="outlined">
                Save
              </v-btn>
              <v-btn @click="undo" variant="outlined" color="deep-orange">
                Undo
              </v-btn>
              <v-btn @click="clear" color="green" variant="outlined">
                Clear
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { VueSignaturePad } from "vue-signature-pad";

export default defineComponent({
  name: "MySignaturePad",
  components: { VueSignaturePad },
  data() {
    return {
      customStyle: {
        border: "blue 2px solid ",
      },
    };
  },
  methods: {
    clear() {
      this.$refs.signaturePad.clearSignature();
    },
    undo() {
      this.$refs.signaturePad.undoSignature();
    },
    save() {
      const { isEmpty, data } = this.$refs.signaturePad.saveSignature();
      console.log(isEmpty, "empty");
      console.log(data, "data");
    },

    async saveSignature() {
      const signature = await $fetch("/api/todos", {
        method: "POST",
        body: {
          // My todo data
        },
      });
    },
  },
});
</script>
