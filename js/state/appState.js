/**
 * @fileoverview Application state management
 * @module state/appState
 */

/**
 * Global application state
 */
class AppState {
    constructor() {
        this._currentUser = null;
        this._currentRole = null;
        this._clerkInstance = null;
        this._evaluationItems = null;
        this._studentEvaluationItems = null;
        this._directorStats = null;
    }

    // User getters/setters
    get currentUser() {
        return this._currentUser;
    }

    set currentUser(user) {
        this._currentUser = user;
    }

    // Role getters/setters
    get currentRole() {
        return this._currentRole;
    }

    set currentRole(role) {
        this._currentRole = role;
    }

    // Clerk instance
    get clerkInstance() {
        return this._clerkInstance;
    }

    set clerkInstance(instance) {
        this._clerkInstance = instance;
    }

    // Evaluation items
    get evaluationItems() {
        return this._evaluationItems;
    }

    set evaluationItems(items) {
        this._evaluationItems = items;
        if (typeof window !== 'undefined') {
            window.evaluationItems = items;
        }
    }

    get studentEvaluationItems() {
        return this._studentEvaluationItems;
    }

    set studentEvaluationItems(items) {
        this._studentEvaluationItems = items;
        if (typeof window !== 'undefined') {
            window.studentEvaluationItems = items;
        }
    }

    // Director stats
    get directorStats() {
        return this._directorStats;
    }

    set directorStats(stats) {
        this._directorStats = stats;
        if (typeof window !== 'undefined') {
            window.directorStats = stats;
        }
    }

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean}
     */
    hasRole(role) {
        return this._currentRole === role;
    }

    /**
     * Get user email
     * @returns {string|null}
     */
    getUserEmail() {
        return this._currentUser?.primaryEmailAddress?.emailAddress || 
               this._currentUser?.email || 
               null;
    }

    /**
     * Get user name
     * @returns {string}
     */
    getUserName() {
        return this._currentUser?.fullName || 
               this._currentUser?.firstName || 
               this.getUserEmail()?.split('@')[0] || 
               'Usuario';
    }

    /**
     * Clear all state
     */
    clear() {
        this._currentUser = null;
        this._currentRole = null;
        this._evaluationItems = null;
        this._studentEvaluationItems = null;
        this._directorStats = null;
    }
}

// Export singleton instance
export const appState = new AppState();
