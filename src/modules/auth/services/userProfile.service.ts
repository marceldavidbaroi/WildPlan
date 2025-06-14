import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import type { UserProfile } from '../store/types';
import type { User } from 'firebase/auth';

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

      await setDoc(userDocRef, defaultProfile);
      console.log('[fetchUserProfile] Default profile created:', defaultProfile);

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
      console.log('[fetchUserProfile] Patched missing fields in Firestore.');
    }

    console.log('[fetchUserProfile] Profile fetched:', patchedProfile);

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

    console.log('[updateUserProfile] Profile updated for UID:', uid, profileData);

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
