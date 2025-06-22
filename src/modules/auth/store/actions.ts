import type { AuthState, UserProfile } from './types';
import * as AuthService from '../services/auth.service';
import * as UserProfileService from '../services/userProfile.service';
import type { User } from 'firebase/auth';

interface StateResponse {
  success: boolean;
  message: string;
  data?: {
    user: User | null;
    profile: UserProfile | null;
  };
}

export async function loginWithEmail(
  this: AuthState,
  email: string,
  password: string,
): Promise<StateResponse> {
  try {
    this.user = await AuthService.loginWithEmail(email, password);
    if (this.user) {
      this.profile = (await UserProfileService.fetchUserProfile(this.user)).profile;
      return {
        success: true,
        message: 'Login successful',
        data: { user: this.user, profile: this.profile },
      };
    } else {
      this.profile = null;
      return {
        success: false,
        message: 'Login failed: no user returned',
      };
    }
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    else if (typeof error === 'string') message = error;

    return {
      success: false,
      message: `Login failed: ${message}`,
    };
  }
}

export async function registerWithEmail(
  this: AuthState,
  email: string,
  password: string,
): Promise<StateResponse> {
  try {
    this.user = await AuthService.registerWithEmail(email, password);
    if (this.user) {
      this.profile = (await UserProfileService.fetchUserProfile(this.user)).profile;
      return {
        success: true,
        message: 'Registration successful',
        data: { user: this.user, profile: this.profile },
      };
    } else {
      this.profile = null;
      return {
        success: false,
        message: 'Registration failed: no user returned',
      };
    }
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    else if (typeof error === 'string') message = error;

    return {
      success: false,
      message: `Registration failed: ${message}`,
    };
  }
}

export async function loginWithGoogle(this: AuthState): Promise<StateResponse> {
  try {
    this.user = await AuthService.loginWithGoogle();
    console.log('User after Google login:', this.user);
    if (this.user) {
      this.profile = (await UserProfileService.fetchUserProfile(this.user)).profile;
      return {
        success: true,
        message: 'Google login successful',
        data: { user: this.user, profile: this.profile },
      };
    } else {
      this.profile = null;
      return {
        success: false,
        message: 'Google login failed: no user returned',
      };
    }
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    else if (typeof error === 'string') message = error;

    return {
      success: false,
      message: `Google login failed: ${message}`,
    };
  }
}

export async function logout(this: AuthState): Promise<StateResponse> {
  try {
    await AuthService.logout();
    this.user = null;
    this.profile = null;
    return {
      success: true,
      message: 'Logout successful',
      data: { user: null, profile: null },
    };
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    else if (typeof error === 'string') message = error;

    return {
      success: false,
      message: `Logout failed: ${message}`,
    };
  }
}

export function initAuth(this: AuthState): Promise<void> {
  return new Promise((resolve) => {
    AuthService.subscribeToAuthState((user: User | null) => {
      (async () => {
        try {
          this.user = user;

          if (user) {
            const result = await UserProfileService.fetchUserProfile(user);
            this.profile = result.profile;
            this.initialized = true;
          } else {
            this.profile = null;
            this.initialized = false;
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          this.profile = null;
          this.initialized = false;
        } finally {
          resolve(); // resolve the Promise after first auth update
        }
      })().catch((err) => {
        console.error('Async IIFE error:', err);
        resolve(); // still resolve to prevent hanging Promise
      });
    });
  });
}

export async function updateProfile(
  this: AuthState,
  profileData: Partial<UserProfile>,
): Promise<StateResponse> {
  this.loading = true;
  if (!this.user) {
    return {
      success: false,
      message: 'No authenticated user',
    };
  }

  try {
    await UserProfileService.updateUserProfile(this.user.uid, profileData);
    this.profile = { ...this.profile, ...profileData } as UserProfile;
    this.loading = false;

    return {
      success: true,
      message: 'Profile updated successfully',
      data: { user: this.user, profile: this.profile },
    };
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) message = error.message;
    else if (typeof error === 'string') message = error;
    this.loading = false;

    return {
      success: false,
      message: `Profile update failed: ${message}`,
    };
  }
}

export async function fetchAllUser(this: AuthState) {
  this.loading = true;
  const response = await UserProfileService.fetchAllUser();
  this.allUsers = response?.data;
  this.loading = false;
  return response;
}
