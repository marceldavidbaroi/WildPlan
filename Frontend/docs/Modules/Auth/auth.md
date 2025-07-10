# Auth & User Profile Module

This module handles user **login**, **registration**, **logout**, and **profile management**.

## Store

- Uses **Pinia** (`authStore`) to manage:
  - `user` and `profile` data
  - Auth status (`isAuthenticated`)
  - Actions for login, logout, register, etc.
  - State is persisted.

## Components

- **AuthCard**: Layout for auth forms
- **FormLogin**: Login form
- **FormRegister**: Register form
- **UserContact**: Contact info
- **UserGeneralSettings**: User settings

## Pages

- **login**: Login page
- **logout**: Logs out user
- **register**: New user registration
- **profile**: User profile page
- **index**: Main entry
- **userSettings**: Manage user settings

---

**Everything does its corresponding task.**
