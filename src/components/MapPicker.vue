<template>
  <div>
    <q-btn :label="btnLabel" size="sm" @click="showMap = true" color="primary" />

    <q-dialog v-model="showMap" full-width>
      <q-card style="max-width: 1000px">
        <q-card-section>
          <div id="map" style="height: 400px"></div>
        </q-card-section>
        <q-card-section>
          <div v-if="pickedLocation">
            <p><strong>Selected Coordinates:</strong></p>
            <p>Lat: {{ pickedLocation?.lat }}</p>
            <p>Lng: {{ pickedLocation?.lng }}</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn
            v-if="isSetLocation"
            color="primary"
            label="Set Location"
            @click="emitPickedLocation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

const props = defineProps({
  modelValue: Object,
  initialLocation: {
    type: Object,
    default: () => ({ lat: 23.8103, lng: 90.4125 }), // Default: Dhaka
  },
  isSetLocation: {
    type: Boolean,
    default: true,
  },
  btnLabel: {
    type: String,
    default: 'Pick Location',
  },
});

const emit = defineEmits(['update:modelValue', 'picked']);

const showMap = ref(false);
const pickedLocation = ref(null);

let map = null;
let marker = null;
let searchControl = null;

watch(showMap, async (val) => {
  if (val) {
    await nextTick();
    initMap();
  }
});

// 🔄 Normalize props.initialLocation to always return { lat, lng }
function getNormalizedCoords() {
  const loc = props.initialLocation;
  const lat = loc.lat ?? loc.latitude;
  const lng = loc.lng ?? loc.longitude;

  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng };
  } else {
    // fallback to Dhaka
    return { lat: 23.8103, lng: 90.4125 };
  }
}

function initMap() {
  if (map) {
    map.remove();
  }

  const coords = getNormalizedCoords();

  map = L.map('map').setView([coords.lat, coords.lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);

  pickedLocation.value = { lat: coords.lat, lng: coords.lng };

  marker.on('dragend', (event) => {
    const { lat, lng } = event.target.getLatLng();
    updatePicked(lat, lng);
  });

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    marker.setLatLng([lat, lng]);
    updatePicked(lat, lng);
  });

  const provider = new OpenStreetMapProvider();

  searchControl = new GeoSearchControl({
    provider,
    style: 'bar',
    showMarker: false,
    autoClose: true,
    retainZoomLevel: false,
    searchLabel: 'Search location...',
    keepResult: true,
  });

  map.addControl(searchControl);

  map.on('geosearch/showlocation', (result) => {
    const { x: lng, y: lat } = result.location;
    marker.setLatLng([lat, lng]);
    updatePicked(lat, lng);
    map.setView([lat, lng], 13);
  });
}

function updatePicked(lat, lng) {
  pickedLocation.value = { lat, lng };
  emit('update:modelValue', pickedLocation.value);
}

function emitPickedLocation() {
  if (pickedLocation.value) {
    emit('picked', pickedLocation.value);
    showMap.value = false;
  }
}
</script>

<style>
@import 'leaflet/dist/leaflet.css';
.leaflet-control-geosearch {
  z-index: 10000 !important;
}
.leaflet-control-geosearch .results {
  z-index: 10001 !important;
  position: absolute !important;
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
}
.leaflet-control-geosearch .results > * {
  color: #000 !important;
}
</style>
