import { ClerkProvider } from '@clerk/clerk-js';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
    throw new Error('Clerk publishable key is missing.');
}

export const clerkProvider = new ClerkProvider({
    publishableKey: clerkPubKey,
});