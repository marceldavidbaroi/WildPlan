<template>
  <div>
    <q-btn label="Pick Location" size="sm" @click="showMap = true" color="primary" />

    <q-dialog v-model="showMap" full-width>
      <q-card style="max-width: 1000px">
        <q-card-section>
          <div id="map" style="height: 400px"></div>
        </q-card-section>
        <q-card-section>
          <div v-if="pickedLocation">
            <p><strong>Selected Coordinates:</strong></p>
            <p>Lat: {{ pickedLocation.lat }}</p>
            <p>Lng: {{ pickedLocation.lng }}</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn color="primary" label="Set Location" @click="emitPickedLocation" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Props
const props = defineProps({
  modelValue: Object, // For two-way binding (optional)
  initialLocation: {
    type: Object,
    default: () => ({ lat: 23.8103, lng: 90.4125 }), // Dhaka as fallback
  },
});

// Emits
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

function initMap() {
  if (map) {
    map.remove();
  }

  const coords = [props.initialLocation.lat, props.initialLocation.lng];

  map = L.map('map').setView(coords, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  marker = L.marker(coords, { draggable: true }).addTo(map);

  pickedLocation.value = { lat: coords[0], lng: coords[1] };

  marker.on('dragend', function (event) {
    const { lat, lng } = event.target.getLatLng();
    updatePicked(lat, lng);
  });

  map.on('click', function (e) {
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
    showMap.value = false; // ✅ close the dialog manually
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
