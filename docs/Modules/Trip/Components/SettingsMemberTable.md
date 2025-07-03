````md
# SettingsMemberTable.vue Component

## Props

- `rows: Array<any>`  
  List of members to display in the table, each with properties like `photoURL`, `displayName`, `email`, and `role`.
- `allUsers: Array<any>`  
  Complete list of all users available, used to populate user selection options.

- `involvedUsers: Array<any>`  
  Array of user IDs involved in the trip, used to filter/select users for role assignment.

## What It Does

- Displays a table of trip members with avatar, name, email, and roles.
- Roles are shown as removable chips; users can remove roles unless they are the trip creator.
- Provides a button to open a dialog for adding a new administrator role.
- The dialog allows selecting a user from involved users and assigning a specific role from predefined options.
- Emits `update-role` event when a new role is assigned.
- Emits `role-removed` event when a role chip is removed.
- Shows notification if an attempt is made to remove the trip creator’s role.

## Emits

- `update-role` with payload `{ uid: string | null, role: string }` when assigning a new role.
- `role-removed` with payload `{ uid: string, role: Array<string> }` when removing a role.

## How to Use

```vue
<SettingsMemberTable
  :rows="members"
  :allUsers="allUsersList"
  :involvedUsers="involvedUserIds"
  @update-role="handleRoleUpdate"
  @role-removed="handleRoleRemove"
/>
```
````

- Pass member data via `rows`.
- Pass all users and involved user IDs for selection logic.
- Listen to `update-role` and `role-removed` events to update roles accordingly.

```

```
