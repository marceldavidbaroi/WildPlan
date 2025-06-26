````md
---

# `extractDateParts` Function Documentation

The `extractDateParts` function is a utility designed to parse a given date input and return a comprehensive object containing various extracted date components and formatted strings. This function is particularly useful for displaying date information in different formats across your Quasar application.

## Location

This utility function is located in your Quasar application at:
`src/utils/date.ts`

## Installation

This function is part of your Quasar project's utilities. No special installation is required beyond ensuring the `src/utils/date.ts` file exists in your project.

## Usage

You can import and use the `extractDateParts` function in any component, page, or other utility file within your Quasar application.

```typescript
// src/components/MyDateDisplayComponent.vue
<template>
  <div>
    <p>Current Date Info:</p>
    <ul>
      <li>Date: {{ dateInfo?.date }}</li>
      <li>Month (Short): {{ dateInfo?.month }}</li>
      <li>Month (Full): {{ dateInfo?.fullMonth }}</li>
      <li>Year: {{ dateInfo?.year }}</li>
      <li>Day: {{ dateInfo?.day }}</li>
      <li>Weekday (Short): {{ dateInfo?.weekdayShort }}</li>
      <li>Formatted: {{ dateInfo?.formatted }}</li>
      <li>ISO: {{ dateInfo?.iso }}</li>
      <li>Locale String: {{ dateInfo?.localeString }}</li>
    </ul>

    <p>Specific Date Info (2023-11-15):</p>
    <ul>
      <li>Formatted: {{ specificDateInfo?.formatted }}</li>
      <li>Locale String (French): {{ specificDateInfoFrench?.localeString }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { extractDateParts } from 'src/utils/date'; // Adjust path if necessary based on your project structure

const dateInfo = ref(extractDateParts(new Date()));

const specificDateInfo = ref(extractDateParts("2023-11-15T10:00:00Z"));
const specificDateInfoFrench = ref(extractDateParts("2023-11-15T10:00:00Z", 'fr-FR'));

</script>
```
````

**Example Output in a Quasar App (based on current date and locale):**

```
Current Date Info:
  - Date: 26
  - Month (Short): Jun
  - Month (Full): June
  - Year: 2025
  - Day: Thursday
  - Weekday (Short): Thu
  - Formatted: Thu, 26 June 2025
  - ISO: 2025-06-26T08:31:22.000Z
  - Locale String: 6/26/2025, 2:31:22 PM

Specific Date Info (2023-11-15):
  - Formatted: Wed, 15 November 2023
  - Locale String (French): 15/11/2023 à 16:00:00 // (Time will vary based on timezone)
```

## API

### `extractDateParts(input: string | number | Date, locale: string = 'default'): object | null`

Extracts various date components and formatted strings from a given date input.

#### Parameters

- **`input`** (Type: `string | number | Date`): The date to be parsed. This can be:
  - A `Date` object (e.g., `new Date()`).
  - A string representation of a date (e.g., `"2023-01-01"`, `"December 25, 2023"`, `"2023-11-15T10:00:00Z"`).
  - A number representing a Unix timestamp in milliseconds (e.g., `1678886400000` for March 15, 2023).
- **`locale`** (Type: `string`, Default: `'default'`): An optional string representing the locale to use for formatting month, day, and locale-specific strings (e.g., `'en-US'`, `'fr-FR'`, `'bn-BD'`). If `'default'` is used, the runtime's default locale will be used, which typically corresponds to the user's browser settings.

#### Returns

- **`object`**: An object containing the following properties if the input is a valid date:

  - **`date`** (Type: `number`): The day of the month (e.g., `27`).
  - **`month`** (Type: `string`): The abbreviated month name (e.g., `"Jun"`).
  - **`fullMonth`** (Type: `string`): The full month name (e.g., `"June"`).
  - **`year`** (Type: `number`): The full year (e.g., `2025`).
  - **`day`** (Type: `string`): The full day of the week name (e.g., `"Friday"`).
  - **`weekdayShort`** (Type: `string`): The abbreviated day of the week name (e.g., `"Fri"`).
  - **`formatted`** (Type: `string`): A custom formatted date string in the consistent format `"WeekdayShort, Date FullMonth Year"` (e.g., `"Fri, 27 June 2025"`).
  - **`iso`** (Type: `string`): The date in ISO 8601 format (e.g., `"2025-06-27T00:00:00.000Z"`). This is always in UTC.
  - **`localeString`** (Type: `string`): The date and time formatted according to the specified `locale` and the user's timezone (e.g., `"6/27/2025, 12:00:00 AM"`). The exact format and time will depend on the `locale` and the environment's timezone settings.

- **`null`**: If the input is not a valid date, the function returns `null` and logs a warning to the console, making it easy to handle invalid date inputs gracefully.

## Error Handling

The function includes basic error handling for invalid date inputs. If the `Date` constructor cannot parse the `input` (e.g., `new Date("invalid string")`), `isNaN(dateObj.getTime())` will be true, causing the function to return `null` and print a warning to the console. It is recommended to check for `null` when using the function.

```typescript
const result = extractDateParts('abc');
if (result) {
  // Use result
} else {
  // Handle invalid date
  console.error('Failed to extract date parts from invalid input.');
}
```

---

```

```
