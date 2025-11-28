/**
 * @fileoverview DOM manipulation utilities
 * @module utils/dom
 */

/**
 * Safely query and manipulate DOM elements
 */
export const DOM = {
    /**
     * Get element by ID with null check
     * @param {string} id - Element ID
     * @returns {HTMLElement|null}
     */
    getElementById(id) {
        return document.getElementById(id);
    },

    /**
     * Hide element
     * @param {string|HTMLElement} element - Element or ID
     */
    hide(element) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el && el.style) el.style.display = 'none';
    },

    /**
     * Show element
     * @param {string|HTMLElement} element - Element or ID
     * @param {string} [display='block'] - Display type
     */
    show(element, display = 'block') {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el && el.style) el.style.display = display;
    },

    /**
     * Toggle element visibility
     * @param {string|HTMLElement} element - Element or ID
     */
    toggle(element) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (!el || !el.style) return;
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    },

    /**
     * Scroll element into view smoothly
     * @param {string|HTMLElement} element - Element or ID
     */
    scrollIntoView(element) {
        const el = typeof element === 'string' ? this.getElementById(element) : element;
        if (el && el.scrollIntoView) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    /**
     * Clear form inputs
     * @param {string|HTMLFormElement} form - Form element or ID
     */
    clearForm(form) {
        const formEl = typeof form === 'string' ? this.getElementById(form) : form;
        if (formEl && formEl.reset) formEl.reset();
    }
};
