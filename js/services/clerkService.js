/**
 * @fileoverview Clerk authentication service
 * @module services/clerkService
 */

import { Clerk } from '@clerk/clerk-js';

/**
 * Initialize Clerk instance
 * @returns {Promise<Clerk|null>}
 */
export async function initializeClerk() {
    const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    
    if (!clerkPubKey) {
        console.error('VITE_CLERK_PUBLISHABLE_KEY is missing. Please configure it in .env file.');
        return null;
    }

    try {
        const clerkInstance = new Clerk(clerkPubKey);
        await clerkInstance.load();
        console.info('Clerk initialized successfully');
        return clerkInstance;
    } catch (err) {
        console.error('Failed to load Clerk:', err);
        return null;
    }
}

/**
 * Check if there's an active Clerk session
 * @param {Clerk} clerkInstance - Clerk instance
 * @returns {Promise<Object|null>} User object or null
 */
export async function checkClerkSession(clerkInstance) {
    if (!clerkInstance) {
        console.log('Clerk instance not available yet');
        return null;
    }

    try {
        await clerkInstance.load();
        
        if (clerkInstance.session && clerkInstance.user) {
            const user = clerkInstance.user;
            const email = user.primaryEmailAddress?.emailAddress || 
                         user.emailAddresses?.[0]?.emailAddress;
            
            if (!email) {
                console.warn('User logged in but no email found');
                return null;
            }

            return {
                user,
                email,
                role: user.publicMetadata?.role || localStorage.getItem(`user_role_${email}`)
            };
        }

        return null;
    } catch (error) {
        console.error('Error checking Clerk session:', error);
        return null;
    }
}

/**
 * Update user metadata in Clerk
 * @param {string} userId - Clerk user ID
 * @param {Object} metadata - Metadata to update
 * @returns {Promise<Object>}
 */
export async function updateUserMetadata(userId, metadata) {
    const response = await fetch('/api/update-user-metadata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, metadata })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user metadata');
    }

    return await response.json();
}
