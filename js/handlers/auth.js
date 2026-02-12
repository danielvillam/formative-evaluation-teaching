/**
 * Authentication Handlers
 * Manejadores de autenticación: login, logout, registro
 */

import { renderNavbar } from '../components/navbar.js';
import { renderRegistrationForm } from '../components/registration.js';
import { showToast, setupPasswordToggle } from '../utils/ui-helpers.js';
import { validateRequiredFields, validatePassword, validatePasswordMatch, setupPasswordMatchValidation } from '../utils/validation.js';
import { enforcePermissions } from '../utils/session.js';

/**
 * Maneja el inicio de sesión
 * @param {Event} e - El evento de submit del formulario
 * @param {Object} clerkInstance - Instancia de Clerk
 * @param {Object} state - Estado global de la aplicación
 * @param {Function} switchRoleCallback - Callback para cambiar de rol
 */
export async function handleLogin(e, clerkInstance, state, switchRoleCallback) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Validation
    if (!validateRequiredFields({ email, password, role })) {
        showToast('Por favor completa todos los campos.', { type: 'warning' });
        return;
    }

    if (!clerkInstance) {
        showToast('Error: Sistema de autenticación no inicializado.', { type: 'danger' });
        return;
    }

    // Check if there's already an active Clerk session
    if (clerkInstance && clerkInstance.session) {
        console.log('Ya existe una sesión activa en Clerk');
        
        const activeEmail = clerkInstance.user?.primaryEmailAddress?.emailAddress || clerkInstance.user?.emailAddresses?.[0]?.emailAddress;
        
        if (activeEmail && activeEmail !== email) {
            showToast('Ya hay una sesión activa con otro usuario. Por favor, cierra sesión primero.', { type: 'danger', delay: 5000 });
            return;
        }
        
        const storedRole = clerkInstance.user?.publicMetadata?.role || localStorage.getItem(`user_role_${activeEmail}`);
        
        if (storedRole && storedRole !== role) {
            const roleNames = { student: 'Estudiante', teacher: 'Docente', director: 'Directivo' };
            showToast(`Este usuario está registrado como ${roleNames[storedRole]}, no como ${roleNames[role]}.`, { type: 'danger', delay: 5000 });
            return;
        }
        
        state.currentUser = { 
            email: activeEmail, 
            name: activeEmail.split('@')[0],
            primaryEmailAddress: { emailAddress: activeEmail }
        };
        state.currentRole = storedRole || role;
        
        const navbarContainer = document.getElementById('navbar-container');
        navbarContainer.innerHTML = renderNavbar(state.currentUser, state.currentRole);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-section').style.display = 'block';
        enforcePermissions(state);
        switchRoleCallback(state.currentRole);
        showToast('✓ Sesión activa detectada', { type: 'success' });
        return;
    }

    try {
        // Use Clerk's signIn method
        const signIn = await clerkInstance.client.signIn.create({
            identifier: email,
            password: password,
        });

        if (signIn.status === 'complete') {
            await clerkInstance.setActive({ session: signIn.createdSessionId });
            
            const clerkUser = clerkInstance.user;
            let storedRole = clerkUser?.publicMetadata?.role || localStorage.getItem(`user_role_${email}`);
            
            if (storedRole && storedRole !== role) {
                const roleNames = { student: 'Estudiante', teacher: 'Docente', director: 'Directivo' };
                showToast(`Este usuario está registrado como ${roleNames[storedRole]}, no como ${roleNames[role]}.`, { type: 'danger', delay: 5000 });
                
                try {
                    await clerkInstance.signOut();
                } catch (signOutError) {
                    console.error('Error signing out after role mismatch:', signOutError);
                }
                return;
            }

            state.currentUser = { email, name: email.split('@')[0] };
            state.currentRole = storedRole || role;
            
            if (!storedRole) {
                localStorage.setItem(`user_role_${email}`, role);
                
                try {
                    const response = await fetch('/api/update-user-metadata', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: clerkUser.id, role: role })
                    });
                    
                    if (response.ok) {
                        console.log('Role saved to Clerk during login');
                        
                        if (role === 'teacher') {
                            await fetch('/api/teachers', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: email, name: email.split('@')[0] })
                            });
                        }
                    }
                } catch (metadataError) {
                    console.error('Could not save role to Clerk:', metadataError);
                }
            }
        } else {
            showToast('Error al iniciar sesión. Por favor intenta de nuevo.', { type: 'danger' });
            return;
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        
        let errorMessage = error.errors?.[0]?.message || error.message || 'Credenciales inválidas';
        
        if (errorMessage.includes('Password is incorrect')) {
            errorMessage = 'Contraseña incorrecta. Intenta de nuevo o usa otro método.';
        } else if (errorMessage.includes('Invalid email')) {
            errorMessage = 'Correo electrónico inválido.';
        } else if (errorMessage.includes('User not found') || errorMessage.includes("Couldn't find your account")) {
            errorMessage = 'No se encontró una cuenta con este correo.';
        }
        
        showToast('Error: ' + errorMessage, { type: 'danger', delay: 5000 });
        return;
    }

    // Update UI
    state.currentUser = { email, name: email.split('@')[0] };
    state.currentRole = role;

    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = renderNavbar(state.currentUser, state.currentRole);
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';

    enforcePermissions(state);
    switchRoleCallback(role);
    
    showToast('✓ Sesión iniciada correctamente', { type: 'success' });
}

/**
 * Maneja el cierre de sesión
 * @param {Event} e - El evento de click
 * @param {Object} clerkInstance - Instancia de Clerk
 * @param {Object} state - Estado global
 */
export async function handleLogout(e, clerkInstance, state) {
    e?.preventDefault();
    
    console.log('Logout initiated');
    
    if (clerkInstance && clerkInstance.session) {
        try {
            await clerkInstance.signOut();
            console.log('Signed out from Clerk successfully');
        } catch (err) {
            console.error('Error signing out from Clerk:', err);
        }
    }
    
    state.currentUser = null;
    state.currentRole = null;

    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = renderNavbar();

    const loginSection = document.getElementById('login-section');
    const appSection = document.getElementById('app-section');
    const registrationContainer = document.getElementById('registration-container');
    
    if (loginSection) loginSection.style.display = 'block';
    if (appSection) appSection.style.display = 'none';
    if (registrationContainer) registrationContainer.style.display = 'none';

    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();

    enforcePermissions(state);
    sessionStorage.setItem('logoutMessage', 'true');
    
    if (loginSection) {
        loginSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Maneja el registro de usuario
 * @param {Event} e - El evento de submit
 * @param {Object} clerkInstance - Instancia de Clerk
 * @param {Object} state - Estado global
 * @param {Function} switchRoleCallback - Callback para cambiar de rol
 */
export async function handleRegistration(e, clerkInstance, state, switchRoleCallback) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const role = document.getElementById('reg-role').value;

    if (!validateRequiredFields({ email, password, confirmPassword, role })) {
        showToast('Por favor completa todos los campos.', { type: 'warning' });
        return;
    }

    if (!validatePasswordMatch(password, confirmPassword)) {
        showToast('Las contraseñas no coinciden.', { type: 'warning' });
        return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showToast(passwordValidation.message, { type: 'warning' });
        return;
    }

    if (!clerkInstance) {
        showToast('Error: Sistema de autenticación no inicializado.', { type: 'danger' });
        return;
    }

    try {
        const signUp = await clerkInstance.client.signUp.create({
            emailAddress: email,
            password: password,
        });

        console.log('SignUp status:', signUp.status);

        if (signUp.status === 'complete') {
            showToast('✓ Usuario registrado con éxito. Guardando rol...', { type: 'success' });
            
            try {
                const response = await fetch('/api/update-user-metadata', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: signUp.createdUserId, role: role })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || data.message || 'Failed to save user role');
                }
                
                localStorage.setItem(`user_role_${email}`, role);
                
                if (role === 'teacher') {
                    await fetch('/api/teachers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: email, name: email.split('@')[0] })
                    });
                }
            } catch (metadataError) {
                console.error('Error saving role:', metadataError);
                localStorage.setItem(`user_role_${email}`, role);
                showToast(`Rol guardado localmente. Error servidor: ${metadataError.message}`, { type: 'warning', delay: 5000 });
            }
            
            state.currentUser = { email, name: email.split('@')[0] };
            state.currentRole = role;
            
            document.getElementById('registration-form').reset();
            document.getElementById('registration-container').style.display = 'none';
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('app-section').style.display = 'block';
            
            const navbarContainer = document.getElementById('navbar-container');
            navbarContainer.innerHTML = renderNavbar(state.currentUser, state.currentRole);
            
            enforcePermissions(state);
            switchRoleCallback(role);
            
            showToast('✓ Sesión iniciada automáticamente.', { type: 'success', delay: 2000 });
        } else {
            showToast('Registro en proceso. Estado: ' + signUp.status, { type: 'info' });
        }
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        let errorMessage = 'Error desconocido';
        
        if (error.errors && error.errors.length > 0) {
            const message = error.errors[0].message || '';
            if (message.includes('email address is taken')) {
                errorMessage = 'Este correo ya está registrado.';
            } else {
                errorMessage = message;
            }
        }
        
        showToast(errorMessage, { type: 'danger' });
    }
}

/**
 * Configura el toggle entre formularios de login y registro
 * @param {Object} clerkInstance - Instancia de Clerk
 * @param {Object} state - Estado global
 * @param {Function} switchRoleCallback - Callback para cambiar de rol
 */
export function setupFormToggle(clerkInstance, state, switchRoleCallback) {
    const loginSection = document.getElementById('login-section');
    const registrationContainer = document.getElementById('registration-container');
    const showRegistrationBtn = document.getElementById('show-registration');

    if (registrationContainer) {
        registrationContainer.innerHTML = renderRegistrationForm();
        registrationContainer.style.display = 'none';
    }

    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => handleRegistration(e, clerkInstance, state, switchRoleCallback));
    }

    setupPasswordToggle('reg-password', 'toggle-reg-password', 'toggle-reg-password-icon');
    setupPasswordToggle('reg-confirm-password', 'toggle-reg-confirm-password', 'toggle-reg-confirm-password-icon');
    setupPasswordMatchValidation('reg-password', 'reg-confirm-password', 'password-match-message');

    if (showRegistrationBtn) {
        showRegistrationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginForm = document.getElementById('login-form');
            if (loginForm) loginForm.reset();
            if (loginSection) loginSection.style.display = 'none';
            if (registrationContainer) registrationContainer.style.display = 'block';
        });
    }

    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (registrationForm) registrationForm.reset();
            const passwordMatchMessage = document.getElementById('password-match-message');
            if (passwordMatchMessage) {
                passwordMatchMessage.textContent = '';
                passwordMatchMessage.className = 'form-text';
            }
            if (registrationContainer) registrationContainer.style.display = 'none';
            if (loginSection) loginSection.style.display = 'block';
        });
    }
}
