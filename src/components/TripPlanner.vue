<template>
  <div class="row justify-start">
    <q-btn v-if="!show" flat color="" icon="auto_awesome" @click="show = true">
      <q-tooltip>Need help deciding where to go? Meet your AI assistant.</q-tooltip>
    </q-btn>
  </div>

  <q-dialog v-model="show" persistent>
    <q-card v-if="show" class="trip-card">
      <q-card-section>
        <div class="row justify-end">
          <q-btn flat icon="close" @click="show = false" />
        </div>
        <div class="text-h5 text-bold q-mb-md">🗺️ Plan Your Perfect Trip</div>

        <!-- Step instructions -->
        <div v-if="step === 1" class="step-text">🌍 Which country do you want to travel to?</div>
        <div v-else-if="step === 2" class="step-text">🏙️ Which city in {{ country }}?</div>
        <div v-else-if="step === 3" class="step-text">😊 How are you feeling today?</div>
        <div v-else-if="step === 4" class="step-text">
          ✨ Great! Let me find the best trip types for you...
        </div>
        <div v-else-if="step === 5" class="step-text">📌 Pick a place nearby for this trip!</div>
        <div v-else-if="step === 6" class="step-text">📅 When do you want to go?</div>
        <div v-else-if="step === 7" class="step-text">📝 Any extra details & trip name?</div>
        <div v-else-if="step === 8" class="step-text">✅ All set! Here’s your plan:</div>

        <!-- Inputs per step -->
        <template v-if="step === 1">
          <q-select
            v-model="country"
            :options="countryOptions"
            label="Select a country"
            filled
            standout
            class="q-mb-md"
            menu-anchor="bottom left"
            menu-self="top left"
            :menu-props="{ maxHeight: '300px', fit: true, cover: true }"
            use-input
            @new-value="(val) => addNewOption('countryOptions', val, country)"
            @update:model-value="(val) => (country = val)"
          />
        </template>

        <template v-else-if="step === 2">
          <q-select
            v-model="city"
            :options="cityOptions"
            label="Select a city"
            filled
            standout
            class="q-mb-md"
            menu-anchor="bottom left"
            menu-self="top left"
            :menu-props="{ maxHeight: '300px', fit: true, cover: true }"
            use-input
            @new-value="(val) => addNewOption('cityOptions', val, city)"
            @update:model-value="(val) => (city = val)"
          />
        </template>

        <template v-else-if="step === 3">
          <q-select
            v-model="mood"
            :options="moodOptions"
            label="Pick your mood"
            filled
            standout
            class="q-mb-md"
            menu-anchor="bottom left"
            menu-self="top left"
            :menu-props="{ maxHeight: '300px', fit: true, cover: true }"
            use-input
            @new-value="(val) => addNewOption('moodOptions', val, mood)"
            @update:model-value="(val) => (mood = val)"
          />
        </template>

        <!-- AI Typing -->
        <div v-if="loading" class="ai-bubble q-mb-md">
          <q-spinner-dots color="primary" size="2em" />
          <span class="typing-text">{{ loadingMessage }}</span>
        </div>

        <!-- Dynamic Trip Types -->
        <template v-if="step === 4 && !loading">
          <q-select
            v-model="tripType"
            :options="tripTypeOptions"
            label="Choose a trip type"
            filled
            standout
            class="q-mb-md"
            menu-anchor="bottom left"
            menu-self="top left"
            :menu-props="{ maxHeight: '300px', fit: true, cover: true }"
            use-input
            @new-value="(val) => addNewOption('tripTypeOptions', val, tripType)"
            @update:model-value="(val) => (tripType = val)"
          />
          <q-btn
            flat
            dense
            color="primary"
            icon="refresh"
            label="Load More Options"
            @click="loadMoreTripTypes"
          />
        </template>

        <!-- Dynamic Places -->
        <template v-if="step === 5 && !loading">
          <q-select
            v-model="place"
            :options="placeOptions"
            label="Pick a place"
            filled
            standout
            class="q-mb-md"
            menu-anchor="bottom left"
            menu-self="top left"
            :menu-props="{ maxHeight: '300px', fit: true, cover: true }"
            use-input
            @new-value="(val) => addNewOption('placeOptions', val, place)"
            @update:model-value="(val) => (place = val)"
          />
          <q-btn
            flat
            dense
            color="primary"
            icon="refresh"
            label="Load More Options"
            @click="loadMorePlaces"
          />
        </template>

        <!-- Start and End Date Picker -->
        <template v-if="step === 6">
          <q-input
            v-model="startDate"
            label="Trip Start Date"
            filled
            standout
            readonly
            class="q-mb-md"
            @click="showStartDatePicker = true"
          />
          <q-dialog v-model="showStartDatePicker">
            <q-date
              v-model="startDate"
              mask="YYYY-MM-DD"
              @update:model-value="showStartDatePicker = false"
            />
          </q-dialog>

          <q-input
            v-model="endDate"
            label="Trip End Date"
            filled
            standout
            readonly
            class="q-mb-md"
            @click="showEndDatePicker = true"
          />
          <q-dialog v-model="showEndDatePicker">
            <q-date
              v-model="endDate"
              mask="YYYY-MM-DD"
              @update:model-value="showEndDatePicker = false"
            />
          </q-dialog>
        </template>

        <!-- Extra Details & Trip Name -->
        <template v-if="step === 7">
          <q-input
            v-model="tripName"
            label="Trip Name"
            filled
            standout
            class="q-mb-md"
            maxlength="50"
            counter
          />
          <q-input
            v-model="extraDetails"
            label="Optional details"
            filled
            standout
            type="textarea"
            class="q-mb-md"
            rows="3"
          />
          <q-checkbox v-model="isPublic" label="Make trip public" />
        </template>

        <!-- Summary -->
        <template v-if="step === 8">
          <q-card class="summary-card q-pa-md">
            <div><strong>📝 Trip Name:</strong> {{ tripName }}</div>
            <div><strong>🌍 Country:</strong> {{ country }}</div>
            <div><strong>🏙️ City:</strong> {{ city }}</div>
            <div><strong>😊 Mood:</strong> {{ mood }}</div>
            <div><strong>✨ Trip Type:</strong> {{ tripType }}</div>
            <div><strong>📌 Place:</strong> {{ place }}</div>
            <div><strong>📅 Start Date:</strong> {{ startDate }}</div>
            <div><strong>📅 End Date:</strong> {{ endDate }}</div>
            <div><strong>📝 Extra Details:</strong> {{ extraDetails || 'None' }}</div>
            <div><strong>🌐 Public Trip:</strong> {{ isPublic ? 'Yes' : 'No' }}</div>
          </q-card>
        </template>
      </q-card-section>

      <q-separator />

      <q-card-actions align="between" class="q-pa-md">
        <q-btn v-if="step > 1 && step < 8" flat label="Back" color="primary" @click="prevStep" />

        <q-btn
          v-if="step < 7"
          label="Next"
          color="primary"
          :disable="!canProceed || loading"
          @click="nextStep"
        />

        <q-btn v-else-if="step === 7" label="Finish" color="accent" @click="nextStep" />

        <q-btn v-else-if="step === 8" label="Start Over" color="primary" @click="reset" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';

const step = ref(1);

const country = ref('');
const city = ref('');
const mood = ref('');
const tripType = ref('');
const place = ref('');

// Replace single date with start and end
const startDate = ref('');
const endDate = ref('');

const tripName = ref('');
const extraDetails = ref('');
const isPublic = ref(false);

const showStartDatePicker = ref(false);
const showEndDatePicker = ref(false);

const loading = ref(false);
const show = ref(false);

const countryOptions = [
  'Argentina',
  'Australia',
  'Austria',
  'Bangladesh',
  'Brazil',
  'Cambodia',
  'Canada',
  'China',
  'Croatia',
  'Denmark',
  'Egypt',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Iceland',
  'India',
  'Indonesia',
  'Italy',
  'Japan',
  'Malaysia',
  'Mexico',
  'Morocco',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Norway',
  'Philippines',
  'Portugal',
  'Russia',
  'Saudi Arabia',
  'Singapore',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'Sweden',
  'Switzerland',
  'Thailand',
  'Turkey',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Vietnam',
];
const cityOptions = ref<string[]>([]);
const moodOptions = ['Relaxed', 'Adventurous', 'Romantic', 'Family', 'Solo'];
const tripTypeOptions = ref<string[]>([]);
const placeOptions = ref<string[]>([]);

const canProceed = computed(() => {
  if (step.value === 1) return country.value !== '';
  if (step.value === 2) return city.value !== '';
  if (step.value === 3) return mood.value !== '';
  if (step.value === 4) return tripType.value !== '';
  if (step.value === 5) return place.value !== '';
  if (step.value === 6) {
    // Both dates filled and startDate <= endDate
    return startDate.value !== '' && endDate.value !== '' && startDate.value <= endDate.value;
  }
  if (step.value === 7) return tripName.value.trim() !== '';
  return true;
});

async function nextStep() {
  if (step.value === 1) {
    await generateCities();
  } else if (step.value === 3) {
    await generateTripTypes();
  } else if (step.value === 4) {
    await generatePlaces();
  }
  step.value++;
}

function prevStep() {
  step.value--;
}

function reset() {
  step.value = 1;
  country.value = '';
  city.value = '';
  mood.value = '';
  tripType.value = '';
  place.value = '';
  startDate.value = '';
  endDate.value = '';
  tripName.value = '';
  extraDetails.value = '';
  isPublic.value = false;
}

async function generateCities() {
  loading.value = true;
  const prompt = `List the top 10 most popular cities to visit in ${country.value}. Only give the list.`;
  const options = await askAI(prompt);
  cityOptions.value = parseList(options);
  loading.value = false;
}

async function generateTripTypes() {
  loading.value = true;
  const prompt = `Suggest 5 new trip types for ${country.value}, ${city.value} for someone who feels ${mood.value}. Only give the list.`;
  const options = await askAI(prompt);
  tripTypeOptions.value = parseList(options);
  loading.value = false;
}

async function generatePlaces() {
  loading.value = true;
  const prompt = `Suggest 5 places in ${city.value} for a ${tripType.value} trip. Only give the list.`;
  const options = await askAI(prompt);
  placeOptions.value = parseList(options);
  loading.value = false;
}

async function loadMoreTripTypes() {
  await generateTripTypes();
  tripType.value = '';
}

async function loadMorePlaces() {
  await generatePlaces();
  place.value = '';
}

async function askAI(prompt: string) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false,
    }),
  });
  const data = await response.json();
  return data.response || '';
}

function parseList(text: string) {
  return text
    .split(/\n|,/)
    .map((t: string) => t.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

function addNewOption(optionListName: string, val: string, modelRef: any) {
  let list: string[] = [];

  if (optionListName === 'countryOptions') {
    list = countryOptions;
  } else if (optionListName === 'cityOptions') {
    list = cityOptions.value;
  } else if (optionListName === 'tripTypeOptions') {
    list = tripTypeOptions.value;
  } else if (optionListName === 'placeOptions') {
    list = placeOptions.value;
  }

  if (val && !list.includes(val)) {
    list.push(val);
  }
  modelRef.value = val;
}

const loadingMessage = ref('Thinking...');

const loadingMessages = [
  '✨ Hang tight! I’m looking for the best ideas...',
  '🔍 Still searching, please wait a moment...',
  '🤖 Almost there! Gathering the best suggestions...',
];

let loadingInterval: number | undefined;

watchEffect(() => {
  if (loading.value) {
    let index = 0;
    loadingMessage.value = loadingMessages[index];
    loadingInterval = window.setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      loadingMessage.value = loadingMessages[index];
    }, 5500);
  } else {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = undefined;
    }
  }
});
</script>

<style scoped>
.trip-card {
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.step-text {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.ai-bubble {
  display: flex;
  align-items: center;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease;
}

.typing-text {
  margin-left: 0.5rem;
  font-style: italic;
}

.summary-card {
  border-radius: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.q-item__label {
  white-space: normal;
  word-break: break-word;
}
</style>
