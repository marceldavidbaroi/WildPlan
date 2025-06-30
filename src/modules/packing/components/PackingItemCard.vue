<template>
  <div class="row q-col-gutter-md">
    <!-- Packed Items next -->
    <div class="col-12 q-mt-lg"></div>
    <div v-for="item in items" :key="item.id" class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
      <!-- Outer flex container for card + buttons -->
      <div class="luggage-wrapper">
        <!-- Luggage Card -->
        <div :class="['luggage-card', categoryClass(item.category)]">
          <!-- Handle on top -->
          <div class="luggage-handle"></div>

          <div class="luggage-content">
            <div class="luggage-info">
              <div class="text-h6 q-mb-xs">{{ item.name }}</div>
              <div class="text-subtitle2 q-mb-sm">Qty: {{ item.quantity }}</div>

              <div class="text-caption">
                <q-icon name="event" size="16px" class="q-mr-xs" />
                {{ formatDueDate(item.dueDate ?? 'unknown') }}
              </div>

              <div class="text-caption q-mt-xs">
                <q-icon name="timer" size="16px" class="q-mr-xs" />
                {{ getRemainingTime(item.dueDate ?? 'unknown') }}
              </div>

              <div class="text-caption q-mt-xs">
                <q-icon name="info" size="16px" class="q-mr-xs" />
                {{ item.notes || 'No notes' }}
              </div>

              <div class="q-mt-md">
                <q-badge color="grey-8" align="top" outline>
                  {{ item.type.toUpperCase() }}
                </q-badge>

                <q-badge v-if="item.type === 'personal'" color="grey-8" align="top" outline>
                  {{ item.isPacked ? 'Packed' : 'Not Packed' }}
                </q-badge>
                <q-badge v-else color="grey-8" align="top" outline>
                  {{ findPackingState(item)?.state ? 'Packed' : 'Not Packed' }}
                </q-badge>
                <q-btn
                  v-if="showPackingStateBtn(item)"
                  :color="item.isPacked ? 'info' : 'info'"
                  icon="inventory "
                  text-color="black"
                  no-caps
                  size="sm"
                  dense
                  class="q-ml-sm"
                  :loading="props.loading"
                  @click="$emit('toggle-packed', item)"
                />
                <q-btn
                  v-else
                  label="Add to your list"
                  :color="item.isPacked ? 'info' : 'info'"
                  text-color="black"
                  no-caps
                  size="sm"
                  dense
                  class="q-ml-sm"
                  :loading="props.loading"
                  @click="$emit('add-item', item)"
                />
              </div>
            </div>

            <!-- Buttons container -->
            <div
              v-if="item.ownerId === uid"
              class="luggage-actions row no-wrap items-center justify-end q-gutter-sm"
            >
              <q-btn
                icon="edit"
                size="sm"
                flat
                dense
                color="info"
                @click="$emit('edit-item', item)"
              />
              <q-btn
                icon="delete"
                size="sm"
                flat
                dense
                color="negative"
                @click="$emit('delete-item', item.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PackingItem } from '../store/types';

const props = defineProps<{
  items: PackingItem[];
  loading: boolean;
  uid: string;
}>();

const notPackedItems = computed(() => props.items.filter((item) => !item.isPacked));

const packedItems = computed(() => props.items.filter((item) => item.isPacked));

const formatDueDate = (dueDate: string) => {
  return dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date';
};

const getRemainingTime = (dueDate: string) => {
  if (!dueDate) return 'No due date';

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs < 0) return 'Expired';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} left`;

  return 'Less than a minute left';
};

const categoryToClass: Record<string, string> = {
  clothing: 'day-bg-monday',
  food: 'day-bg-tuesday',
  campingGear: 'day-bg-wednesday',
  cooking: 'day-bg-thursday',
  safety: 'day-bg-friday',
  electronics: 'day-bg-saturday',
  personalCare: 'day-bg-sunday',
  misc: 'day-bg-sunday',
};

const categoryClass = (category: string) => categoryToClass[category] || 'day-bg-sunday';

function showPackingStateBtn(item: PackingItem) {
  if (item.type === 'personal') {
    return true;
  } else {
    if (Array.isArray(item.isPacked)) {
      return item.isPacked.some((user) => user.uid === props.uid);
    }
  }
  return false;
}

function findPackingState(item: PackingItem) {
  if (Array.isArray(item.isPacked)) {
    return item.isPacked.find((u) => u.uid === props.uid);
  }
}
</script>

<style scoped>
.luggage-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Luggage card with handle & dashed border */
.luggage-card {
  border-radius: 16px;
  padding: 16px 16px 24px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  border: 2px dashed #bbb;
  background-color: var(--q-color-primary-lighter, #e3f2fd);
  position: relative;
}

.luggage-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
}

/* Handle on top like suitcase handle */
.luggage-handle {
  width: 60px;
  height: 12px;
  background: #ccc;
  border-radius: 8px 8px 0 0;
  position: absolute;
  top: -14px;
  left: calc(50% - 30px);
  box-shadow: inset 0 2px 5px rgba(255 255 255 / 0.7);
}

/* Main content + actions side by side, wrapping on small screens */
.luggage-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  height: 100%;
}

/* Info area flex-grow for responsiveness */
.luggage-info {
  flex: 1 1 60%;
  min-width: 160px;
}

/* Actions aligned vertically center */
.luggage-actions {
  flex: 0 0 auto;
  min-width: 110px;
}

/* Responsive: stack actions below info on narrow widths */
@media (max-width: 480px) {
  .luggage-content {
    flex-direction: column;
  }
  .luggage-actions {
    min-width: 100%;
    justify-content: flex-start !important;
    margin-top: 12px;
  }
}
</style>
