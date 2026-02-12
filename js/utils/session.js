/**
 * Session Management
 * Funciones para gestión de sesiones, permisos y autenticación
 */

import { renderNavbar } from '../components/navbar.js';
import { showToast } from './ui-helpers.js';

/**
 * Verifica si hay una sesión activa de Clerk y la restaura
 * @param {Object} clerkInstance - Instancia de Clerk
 * @param {Object} state - Estado global de la aplicación
 * @returns {Promise<boolean>} - true si se restauró la sesión
 */
export async function checkClerkSession(clerkInstance, state) {
    if (!clerkInstance) {
        console.log('Clerk instance not available yet');
        return false;
    }

    try {
        // Wait for Clerk to be fully loaded
        await clerkInstance.load();
        
        // Check if there's an active session
        if (clerkInstance.session && clerkInstance.user) {
            const user = clerkInstance.user;
            const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
            
            if (!email) {
                console.log('No email found in Clerk session');
                return false;
            }
            
            console.log('Active Clerk session found for:', email);
            
            // Get the stored role from Clerk metadata or localStorage
            const roleFromMetadata = user.publicMetadata?.role;
            const roleFromStorage = localStorage.getItem(`user_role_${email}`);
            const role = roleFromMetadata || roleFromStorage;
            
            if (!role) {
                console.log('No role found for user, requiring manual login');
                return false;
            }
            
            console.log('Restoring session with role:', role);
            
            // Restore the session
            state.currentUser = { 
                email, 
                name: user.firstName || user.username || email.split('@')[0],
                primaryEmailAddress: { emailAddress: email }
            };
            state.currentRole = role;
            
            // Update UI
            const navbarContainer = document.getElementById('navbar-container');
            navbarContainer.innerHTML = renderNavbar(state.currentUser, state.currentRole);
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('app-section').style.display = 'block';
            enforcePermissions(state);
            
            console.log('Session restored successfully');
            return true;
        } else {
            console.log('No active Clerk session found');
            return false;
        }
    } catch (error) {
        console.error('Error checking Clerk session:', error);
        return false;
    }
}

/**
 * Verifica si el usuario actual tiene un rol específico
 * @param {string} role - Rol a verificar
 * @param {Object} state - Estado global
 * @returns {boolean}
 */
export function hasRole(role, state) {
    return state.currentRole === role;
}

/**
 * Aplica permisos basados en el rol actual
 * Muestra/oculta tabs y secciones según el rol
 * @param {Object} state - Estado global con currentRole
 */
export function enforcePermissions(state) {
    const tabs = document.querySelectorAll('.tab-button');
    const sections = document.querySelectorAll('.role-section');

    tabs.forEach(tab => {
        const role = tab.dataset.role;
        tab.style.display = (role === state.currentRole) ? '' : 'none';
        tab.classList.toggle('active', role === state.currentRole);
    });

    sections.forEach(section => {
        const idRole = section.id.replace('-section','');
        section.style.display = (idRole === state.currentRole) ? '' : 'none';
        section.classList.toggle('active-section', idRole === state.currentRole);
    });

    // Hide all forms on entry
    document.getElementById('self-evaluation-form')?.style && (document.getElementById('self-evaluation-form').style.display = 'none');
    document.getElementById('results-visualization')?.style && (document.getElementById('results-visualization').style.display = 'none');
    document.getElementById('student-evaluation-form')?.style && (document.getElementById('student-evaluation-form').style.display = 'none');
}
