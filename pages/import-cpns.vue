<template>
  <v-row>
    <v-col>
      <v-card flat>
        <v-card-title class="d-flex align-center ga-2 justify-space-between">
          <v-label class="text-h4 text-black">Data Peserta CPNS</v-label>

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ props }">
              <v-btn
                variant="outlined"
                color="primary"
                prepend-icon="mdi-file-excel"
                v-bind="props"
                >Import</v-btn
              >
            </template>
            <v-form @submit.prevent="handleSubmit">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-file-input
                      clearable
                      label="File input"
                      variant="outlined"
                      accept=".csv"
                      show-size
                      v-model="fileCsv"
                      :rules="fileRules"
                    ></v-file-input>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue-darken-1"
                    variant="text"
                    @click="dialog = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn color="blue-darken-1" variant="text" type="submit">
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-card-title>

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
          item-value="nama_lengkap  "
          @update:options="loadItems"
        >
        </v-data-table-server>
      </v-card>
    </v-col>
  </v-row>

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
definePageMeta({
  layout: "auth",
});

const headers = [
  { title: "Nomor Urut", align: "start", key: "nomor_urut", sortable: true },
  { title: "Nomor Peserta", key: "nomor_peserta", align: "start" },
  { title: "NIK", key: "nik", align: "start" },
  {
    title: "Nama Lengkap",
    key: "nama_lengkap",
    align: "start",
  },
  { title: "Jadwal", key: "jadwal", align: "start" },
  { title: "Lokasi", key: "lokasi", align: "start" },
  { title: "Sesi", key: "sesi", align: "start" },
  { title: "Ruang", key: "ruang", align: "start" },
];

const serverItems = ref([]);
const itemsPerPage = ref(50);
const search = ref("");
const fileCsv = ref(null);
const loading = ref(false);
const totalItems = ref(0);
const client = useSanctumClient();
const dialog = ref(false);
const notification = ref(false);
const notificationMessage = ref("Berhasil di Tandatangani");

// Fetch initial data
const { data, refresh } = await useAsyncData("import-cpns", () =>
  client(`/api/show-import-cpns`)
);

const fileRules = [
  (value) => {
    if (!value || !value.length) return false; // Ensure a file is selected

    const file = value[0]; // Assuming single file upload
    const allowedType = "text/csv";
    const maxSize = 2 * 1024 * 1024; // 2 MB in bytes

    if (file.type !== allowedType) {
      return "Only CSV files are allowed!";
    }

    if (file.size > maxSize) {
      return "File size must be below 2 MB!";
    }

    return true; // Validation passed
  },
];

const handleSubmit = async () => {
  const errorMessages = fileRules
    .map((rule) => rule(fileCsv.value))
    .filter((result) => result !== true);

  if (errorMessages.length === 0) {
    alert("Form submitted successfully!");
  } else {
    alert(
      `Please fix validation errors before submitting:\n${errorMessages.join(
        "\n"
      )}`
    );
  }
};

// const validateFile = [
//   (value) => {
//     const file = value[0]; // Assuming single file upload
//     const allowedType = "text/csv";
//     const maxSize = 2 * 1024 * 1024; // 2 MB in bytes

//     if (file.type !== allowedType) {
//       return "Only CSV files are allowed!";
//     }

//     if (file.size > maxSize) {
//       return "File size must be below 2 MB!";
//     }

//     return true; // Validation passed
//   },
// ];

const FakeAPI = {
  async fetch({ page, itemsPerPage, sortBy, search }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        let items = [];
        if (data?.value?.data.length > 0) {
          items = data?.value?.data.slice.filter((item) => {
            if (
              search &&
              !item.nomor_peserta.toLowerCase().includes(search.toLowerCase())
            ) {
              return false;
            }

            return true;
          });
        } else {
          items = [];
        }
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
