import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import type { UserProfile, ServiceResponse, FetchUserOptions } from '../store/types';
import type { User } from 'firebase/auth';
import { auth } from 'src/boot/firebase';

// Geolocation helper
async function getUserGeolocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation not supported by browser'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

export async function fetchUserProfile(user: User): Promise<{
  success: boolean;
  profile: UserProfile | null;
  message: string;
}> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    const providerInfo = user.providerData[0];
    const displayName = user.displayName ?? providerInfo?.displayName ?? null;
    const email = user.email ?? providerInfo?.email ?? null;
    const photoURL = user.photoURL ?? providerInfo?.photoURL ?? null;

    if (!userSnap.exists()) {
      const defaultProfile: UserProfile = {
        uid: user.uid,
        displayName,
        email,
        photoURL,
        preferences: {
          notifications: true,
          theme: 'light',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      try {
        const location = await getUserGeolocation();
        defaultProfile.location = {
          latitude: location.latitude,
          longitude: location.longitude,
          updatedAt: Date.now(),
        };
      } catch (geoErr) {
        console.warn('[fetchUserProfile] Geolocation skipped:', geoErr.message);
      }

      await setDoc(userDocRef, defaultProfile);

      return {
        success: true,
        profile: defaultProfile,
        message: 'Default profile created',
      };
    }

    const existingProfile = userSnap.data() as UserProfile;

    const patchedProfile = {
      ...existingProfile,
      displayName: existingProfile.displayName ?? displayName,
      email: existingProfile.email ?? email,
      photoURL: existingProfile.photoURL ?? photoURL,
    };

    const needsUpdate =
      existingProfile.displayName !== patchedProfile.displayName ||
      existingProfile.email !== patchedProfile.email ||
      existingProfile.photoURL !== patchedProfile.photoURL;

    if (needsUpdate) {
      await updateDoc(userDocRef, {
        displayName: patchedProfile.displayName,
        email: patchedProfile.email,
        photoURL: patchedProfile.photoURL,
        updatedAt: Date.now(),
      });
    }

    try {
      const location = await getUserGeolocation();
      await updateDoc(userDocRef, {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          updatedAt: Date.now(),
        },
      });
    } catch (geoErr) {
      console.warn('[fetchUserProfile] Location update skipped:', geoErr.message);
    }

    return {
      success: true,
      profile: patchedProfile,
      message: 'Profile fetched successfully',
    };
  } catch (error) {
    console.error('[fetchUserProfile] Error:', error);
    return {
      success: false,
      profile: null,
      message: 'Failed to fetch user profile',
    };
  }
}

export async function updateUserProfile(
  uid: string,
  profileData: Partial<UserProfile>,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('[updateUserProfile] Error updating profile:', error);
    return {
      success: false,
      message: 'Failed to update profile',
    };
  }
}

export async function fetchAllUser(
  options: FetchUserOptions = {},
): Promise<ServiceResponse<UserProfile[]>> {
  try {
    const colRef = collection(db, 'users');
    let q = query(colRef);

    if (options.sortBy) {
      q = query(q, orderBy(options.sortBy, options.sortDirection ?? 'asc'));
    }

    const snapshot = await getDocs(q);

    let users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as UserProfile),
    }));

    if (options.searchQuery) {
      const lowerQuery = options.searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          (user.displayName?.toLowerCase().includes(lowerQuery) ?? false) ||
          (user.email?.toLowerCase().includes(lowerQuery) ?? false),
      );
    }

    return {
      success: true,
      message: 'Users fetched successfully',
      data: users,
    };
  } catch (error) {
    console.error('[fetchAllUser] Error:', error);
    return {
      success: false,
      message: 'Failed to fetch users',
    };
  }
}

export async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User is not authenticated.');
  }
  return await user.getIdToken();
}
