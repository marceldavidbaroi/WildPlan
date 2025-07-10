# ContactList Component

This component shows a **contact list** with options to **add** or **remove** contacts.

## Features

- Displays a list of contacts with name, email, and avatar.
- Add new contacts by searching users by email.
- Remove contacts with a delete button.
- Uses a **Quasar dialog** for adding contacts.

## Props

- `list`: Current contacts (`Contact[]`)
- `users`: All available users to search (`UserProfile[]`)

## Emits

- `update:list`: Emits updated contact list.
- `remove:contact`: Emits the email of the contact to remove.

## Usage

```vue
<ContactList
  :list="contactList"
  :users="allUsers"
  @update:list="updateContactList"
  @remove:contact="removeContact"
/>
```
