// Minimal user types used across the app and tests
export interface UserProfile {
	id: string;
	email?: string;
	displayName?: string;
	photoURL?: string;
	createdAt?: number;
	updatedAt?: number;
}

export type User = UserProfile;

export interface AppUser extends UserProfile {
	roles?: string[];
	isAdmin?: boolean;
}

export default UserProfile;
 