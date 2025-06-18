<template>
  <div>
    <!-- Header -->
    <q-card flat bordered class="q-pa-md rounded-borders shadow-2 bg-transparent">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Contact List</div>
        <q-btn flat icon="person_add" color="primary" unelevated dense @click="showDialog = true">
          <q-tooltip anchor="top middle" self="bottom middle" class="bg-secondary text-white">
            Add User
          </q-tooltip>
        </q-btn>
      </q-card-section>

      <q-separator />

      <!-- Contact List -->
      <q-list bordered separator>
        <q-item v-for="(contact, index) in list" :key="index">
          <q-item-section avatar>
            <q-avatar>
              <img v-if="contact.photoURL" :src="contact.photoURL" alt="Avatar" />
              <q-icon v-else name="person" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-subtitle1">{{ contact.name }}</q-item-label>
            <q-item-label caption>{{ contact.email }}</q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-btn
              icon="delete"
              color="negative"
              round
              flat
              dense
              size="sm"
              @click="removeContact(contact.email)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Dialog to Add New Contact -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Add New Contact</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="searchQuery"
            label="Search by email"
            filled
            dense
            debounce="300"
            clearable
            @update:model-value="onSearch"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-list v-if="filteredUsers.length">
            <q-item
              v-for="(user, idx) in filteredUsers"
              :key="idx"
              clickable
              @click="addContact(user)"
            >
              <q-item-section avatar>
                <q-avatar>
                  <img v-if="user.photoURL" :src="user.photoURL" alt="User" />
                  <q-icon v-else name="person" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ user.displayName }}</q-item-label>
                <q-item-label caption>{{ user.email }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="q-mt-md text-caption text-grey text-center">No results found.</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { Notify } from 'quasar';
import type { Contact, UserProfile } from '../store/types';

const props = defineProps<{
  list: Contact[] | undefined | null;
  users: UserProfile[];
}>();

const emit = defineEmits<{
  (e: 'update:list', value: Contact[]): void;
  (e: 'remove:contact', value: string): void;
}>();

const showDialog = ref(false);
const searchQuery = ref('');
const filteredUsers = ref<UserProfile[]>([]);

function onSearch() {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) {
    filteredUsers.value = [];
    return;
  }

  filteredUsers.value = props.users.filter((user) => user.email?.toLowerCase().includes(query));
}

function addContact(user: UserProfile) {
  if (!user.email || !user.displayName) {
    Notify.create({
      message: 'Invalid user: missing email or display name',
      type: 'warning',
      color: 'warning',
      position: 'top',
    });
    return;
  }

  const newContact: Contact = {
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };

  const exists = props.list?.some((c) => c.email === newContact.email);
  if (exists) {
    Notify.create({
      message: 'Contact already exists',
      type: 'info',
      color: 'primary',
      position: 'top',
    });
    return;
  }

  if (props.list) {
    emit('update:list', [...props.list, newContact]);
  }

  showDialog.value = false;
  searchQuery.value = '';
  filteredUsers.value = [];
}

function removeContact(email: string) {
  emit('remove:contact', email);
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}

@media (max-width: 600px) {
  .q-card {
    margin: 0 auto;
  }
}
</style>
