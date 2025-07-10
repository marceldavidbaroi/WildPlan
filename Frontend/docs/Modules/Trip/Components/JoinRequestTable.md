````md
# JoinRequestTable.vue Component

## Props

- `rows: joinRequest[]`  
  An array of join request objects to be displayed in the table. Each object should contain user info like `uid`, `displayName`, and `email`.

## What It Does

- Renders a table listing join requests with columns for **Name**, **Email**, and **Actions**.
- The **Actions** column contains an "Approve" button for each row.
- When "Approve" is clicked, it emits an `approve` event with the corresponding join request row.

## Returns / Emits

- Emits an event named `approve` with the selected `joinRequest` object when the Approve button is clicked.

## How to Use

```vue
<JoinRequestTable :rows="joinRequests" @approve="handleApprove" />
```
````

- Bind `rows` with an array of join request data.
- Listen for the `approve` event to perform approval logic in the parent component.

```

```
