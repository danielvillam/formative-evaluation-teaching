/**
 * @fileoverview Toast notification utility for user feedback
 * @module utils/toast
 */

/**
 * Shows a Bootstrap toast notification
 * @param {string} message - The message to display
 * @param {Object} options - Configuration options
 * @param {string} [options.type='primary'] - Toast type (primary, success, warning, danger, info)
 * @param {number} [options.delay=3500] - Duration in milliseconds
 */
export function showToast(message, options = {}) {
    const container = document.getElementById('toast-container');
    
    if (!container) {
        // Fallback to alert if toast container not available
        alert(message);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${options.type || 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.style.minWidth = '250px';
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
    `;
    
    container.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { 
        delay: options.delay || 3500 
    });
    
    bsToast.show();
    
    // Remove toast from DOM after hidden
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}
