<template>
  <v-row>
    <v-col>
      <v-card title="Data Peserta" flat>
        <template v-slot:text>
          <v-text-field
            v-model="search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            single-line
          ></v-text-field>
        </template>
        <v-data-table-server
          height="700"
          fixed-header
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="serverItems"
          :items-length="totalItems"
          :loading="loading"
          :search="search"
          item-value="name"
          @update:options="loadItems"
        >
          <template v-slot:item.signature="{ item, value }">
            <v-btn
              v-if="!value"
              @click="setDialog(item.id)"
              color="deep-purple"
              variant="outlined"
            >
              Tandatangani
            </v-btn>

            <v-hover v-else v-slot="{ isHovering, props }">
              <v-card
                id="#ttd"
                :class="{ 'on-hover': isHovering }"
                :elevation="isHovering ? 12 : 2"
                v-bind="props"
              >
                <v-img :src="value" max-width="500" cover>
                  <div class="align-self-center mt-10">
                    <v-btn
                      :class="{ 'show-btns': isHovering }"
                      color="green"
                      icon="mdi-pencil"
                      variant="text"
                      size="small"
                      @click="setDialog(item.id)"
                    ></v-btn>
                    <v-btn
                      :class="{ 'show-btns': isHovering }"
                      color="red"
                      icon="mdi-delete"
                      variant="text"
                      size="small"
                      @click="deleteSignature(item.id)"
                    ></v-btn>
                  </div> </v-img></v-card
            ></v-hover>
          </template>
        </v-data-table-server>
      </v-card>
    </v-col>
  </v-row>
  <div class="text-center pa-4">
    <v-dialog v-model="dialog" max-width="600" persistent>
      <v-card color="primary" variant="outlined" class="mx-auto bg-white">
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h5 text-medium ps-2">Tanda Tangan disini</div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-item>
          <div class="pa-2 ma-2">
            <VueSignaturePad
              width="100%"
              height="350px"
              ref="signaturePad"
              :customStyle="customStyle"
            />
          </div>
        </v-card-item>
        <v-card-actions>
          <v-btn @click="save" color="primary" variant="outlined"> Save </v-btn>
          <v-btn @click="undo" variant="outlined" color="deep-orange">
            Undo
          </v-btn>
          <v-btn @click="clear" color="green" variant="outlined"> Clear </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <v-snackbar
    :timeout="2000"
    color="deep-purple-accent-4"
    elevation="24"
    v-model="notification"
  >
    {{ notificationMessage }}
  </v-snackbar>
</template>

<script setup>
import { VueSignaturePad } from "vue-signature-pad";

const headers = [
  { title: "Nomor Urut", align: "start", sortable: true, key: "nomor_urut" },
  {
    title: "Tanda Tangan",
    key: "signature",
    align: "center",
    sortable: false,
  },
  { title: "Nomor Peserta", key: "nomor_peserta", align: "start" },
  { title: "NIK", key: "nik", align: "start" },
  { title: "Nama Lengkap", key: "nama_lengkap", align: "start" },
  { title: "Jadwal", key: "jadwal", align: "start" },
  { title: "Lokasi", key: "lokasi", align: "start" },
  { title: "Sesi", key: "sesi", align: "start" },
  { title: "Ruang", key: "ruang", align: "start" },
];

const serverItems = ref([]);
const itemsPerPage = ref(50);
const search = ref("");
const loading = ref(false);
const totalItems = ref(0);
const client = useSanctumClient();
const dialog = ref(false);
const paramsId = ref("");
const signature = ref(null);
const notification = ref(false);
const notificationMessage = ref("Berhasil di Tandatangani");
// Fetch initial data
const { data, refresh } = await useAsyncData("cpns", () =>
  client("/api/show-cpns")
);

const {
  data: dataSignature,
  execute,
  status: statusSignature,
} = await useAsyncData("signature", () =>
  client(
    "/api/save-cpns-signature",
    {
      method: "POST",
      body: {
        id: paramsId.value,
        signature: signature.value,
      },
    },
    {
      immediate: false,
    }
  )
);

const deleteSignature = (id) => {
  paramsId.value = id;
  signature.value = null;
  notificationMessage.value = "Berhasil dihapus";
  execute();
};

watch(statusSignature, (status, oldStatus) => {
  /* ... */
  if (status === "success") {
    signature.value = dataSignature.value.data.signature;
    changeSignature();
  }
});

const FakeAPI = {
  async fetch({ page, itemsPerPage, sortBy, search }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        // const items = data?.value?.data || [];
        const items = data?.value?.data.slice().filter((item) => {
          if (
            search &&
            !item.nomor_peserta.toLowerCase().includes(search.toLowerCase())
          ) {
            return false;
          }

          return true;
        });

        if (sortBy.length) {
          const sortKey = sortBy[0].key;
          const sortOrder = sortBy[0].order;
          items.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
          });
        }

        const paginated = items.slice(start, end);

        resolve({ items: paginated, total: items.length });
      }, 500);
    });
  },
};

const loadItems = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true;

  // // serverItems.value = data?.value?.data || [];
  FakeAPI.fetch({ page, itemsPerPage, sortBy, search }).then(
    ({ items, total }) => {
      serverItems.value = items;
      totalItems.value = total;
      loading.value = false;
    }
  );
};

// Ref for VueSignaturePad
const signaturePad = ref(null);

// Custom styles
const customStyle = ref({
  border: "blue 2px solid",
});

// Clear signature
const setDialog = (value) => {
  dialog.value = true;
  paramsId.value = value;
};

// Clear signature
const clear = () => {
  signaturePad.value.clearSignature();
};

// Undo signature
const undo = () => {
  signaturePad.value.undoSignature();
};

// Save signature
const save = () => {
  const { isEmpty, data } = signaturePad.value.saveSignature();
  notificationMessage.value = "Berhasil di Tandatangani";

  if (!isEmpty) {
    saveSignature(data);
  }
};

// Save signature to API
const saveSignature = async (dataSignature) => {
  // dialog.value = false;
  signature.value = dataSignature;

  execute();
};

const changeSignature = async () => {
  const found = serverItems.value.find(
    (element) => element.id === paramsId.value
  );
  await nextTick();
  found.signature = signature.value;
  dialog.value = false;
  notification.value = true;
};
</script>
<style scoped>
#ttd {
  transition: opacity 0.4s ease-in-out;
}

#ttd:not(.on-hover) {
  opacity: 0.6;
}

.show-btns {
  color: rgba(134, 4, 160, 0.623) !important;
}
</style>
