/**
 * UI Helper Functions
 * Funciones auxiliares para la interfaz de usuario
 */

/**
 * Muestra un toast de notificación estilo Bootstrap
 * @param {string} message - Mensaje a mostrar
 * @param {Object} options - Opciones del toast (type, delay)
 * @param {string} options.type - Tipo de toast: 'primary', 'success', 'danger', 'warning', 'info', 'secondary'
 * @param {number} options.delay - Tiempo en ms antes de que se cierre automáticamente
 */
export function showToast(message, options = {}) {
    const container = document.getElementById('toast-container');
    if (!container) return alert(message); // fallback for environments without toast container
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${options.type || 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.style.minWidth = '250px';
    toast.style.position = 'relative';
    toast.style.overflow = 'hidden';
    
    const delay = options.delay || 3500;
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: rgba(255,255,255,0.3);">
            <div class="toast-progress" style="height: 100%; background: rgba(255,255,255,0.8); width: 100%; transition: width ${delay}ms linear;"></div>
        </div>
    `;
    container.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { delay: delay });
    bsToast.show();
    
    // Animate progress bar
    const progressBar = toast.querySelector('.toast-progress');
    if (progressBar) {
        // Small delay to ensure transition works
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 10);
    }
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

/**
 * Configura el toggle para mostrar/ocultar contraseña
 * @param {string} inputId - ID del input de contraseña
 * @param {string} buttonId - ID del botón toggle
 * @param {string} iconId - ID del icono dentro del botón
 */
export function setupPasswordToggle(inputId, buttonId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.getElementById(buttonId);
    const toggleIcon = document.getElementById(iconId);

    if (passwordInput && toggleButton && toggleIcon) {
        toggleButton.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleIcon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
            toggleButton.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
            toggleButton.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });
    }
}
