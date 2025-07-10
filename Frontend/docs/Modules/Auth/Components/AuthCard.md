---
title: AuthCard Component
description: A reusable and flexible authentication card component built with Quasar and TypeScript.
---

# AuthCard Component

A flexible card component for **login/register forms**, with support for:

- Custom fields via slot
- Primary & secondary action buttons
- Optional bottom link
- Dynamic social login buttons

---

## Props

| Prop             | Type            | Required | Description                   |
| ---------------- | --------------- | -------- | ----------------------------- |
| `headerTitle`    | `string`        | Yes      | Card title                    |
| `primaryLabel`   | `string`        | Yes      | Label for primary button      |
| `secondaryLabel` | `string`        | Yes      | Label for secondary button    |
| `link`           | `string`        | No       | Optional bottom link path     |
| `linkText`       | `string`        | No       | Text for the bottom link      |
| `socialLogins`   | `SocialLogin[]` | No       | Array of social login configs |

### SocialLogin Type

```ts
type SocialLogin = {
  label: string
  icon: string
  color: string
  provider: string
}
Events
Event Name	Payload	Description
primaryClick	—	Fired when primary button is clicked
secondaryClick	—	Fired when secondary button is clicked
socialClick	provider: string	Fired when a social login button is clicked

Slots
Slot Name	Description
fields	Slot to inject custom form fields

Example Usage
vue
Copy
Edit
<auth-card
  header-title="Login"
  primary-label="Log In"
  secondary-label="Clear"
  link="/signup"
  link-text="Sign up here"
  :social-logins="[
    { label: 'Google', icon: 'mdi-google', color: 'red-5', provider: 'google' },
    { label: 'Facebook', icon: 'mdi-facebook', color: 'indigo-9', provider: 'facebook' }
  ]"
  @primaryClick="onLogin"
  @secondaryClick="clearForm"
  @socialClick="loginWith"
>
  <template #fields>
    <form-login v-model:email="email" v-model:password="password" />
  </template>
</auth-card>
```
