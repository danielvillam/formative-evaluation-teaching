/**
 * @fileoverview Authentication handlers for login and registration
 * @module handlers/authHandlers
 */

import { appState } from '../state/appState.js';
import { showToast } from '../utils/toast.js';
import { DOM } from '../utils/dom.js';
import { updateUserMetadata } from '../services/clerkService.js';
import { addTeacher } from '../services/evaluationService.js';

/**
 * Handle user login
 * @param {Event} e - Submit event
 */
export async function handleLogin(e) {
    e.preventDefault();
    
    const email = DOM.getElementById('email')?.value.trim();
    const password = DOM.getElementById('password')?.value;
    const role = DOM.getElementById('role')?.value;

    // Validation
    if (!email || !password || !role) {
        showToast('Por favor completa todos los campos.', { type: 'warning' });
        return;
    }

    if (!appState.clerkInstance) {
        showToast('Error: Sistema de autenticación no inicializado.', { type: 'danger' });
        return;
    }

    // Check if there's already an active Clerk session
    if (appState.clerkInstance.session) {
        console.log('Ya existe una sesión activa en Clerk');
        
        const activeEmail = appState.clerkInstance.user?.primaryEmailAddress?.emailAddress || 
                          appState.clerkInstance.user?.emailAddresses?.[0]?.emailAddress;
        
        if (activeEmail && activeEmail !== email) {
            showToast('Ya hay una sesión activa con otro usuario. Por favor, cierra sesión primero.', { 
                type: 'danger', 
                delay: 5000 
            });
            return;
        }
        
        const storedRole = appState.clerkInstance.user?.publicMetadata?.role || 
                          localStorage.getItem(`user_role_${activeEmail}`);
        
        if (storedRole && storedRole !== role) {
            showToast(`Tu cuenta está registrada como ${storedRole}. Por favor selecciona el rol correcto.`, { 
                type: 'warning', 
                delay: 5000 
            });
            return;
        }
    }

    try {
        // Sign in with Clerk
        const signIn = await appState.clerkInstance.client.signIn.create({
            identifier: email,
            password: password,
        });

        console.log('SignIn status:', signIn.status);

        if (signIn.status === 'complete') {
            showToast('✓ Inicio de sesión exitoso. Validando rol...', { type: 'success' });
            
            // Get stored role from Clerk metadata
            const storedRole = appState.clerkInstance.user?.publicMetadata?.role;
            
            // Fallback to localStorage if not in Clerk
            const fallbackRole = localStorage.getItem(`user_role_${email}`);
            const actualRole = storedRole || fallbackRole;
            
            if (!actualRole) {
                // No role found - save the selected role
                try {
                    await updateUserMetadata(signIn.createdSessionId, role);
                    localStorage.setItem(`user_role_${email}`, role);
                    
                    // If teacher, add to teachers collection
                    if (role === 'teacher') {
                        await addTeacherOnLogin(email);
                    }
                } catch (error) {
                    console.error('Error saving role:', error);
                    showToast('Error al guardar el rol. Usando rol local.', { type: 'warning' });
                    localStorage.setItem(`user_role_${email}`, role);
                }
                
                await completeLogin(email, role);
                return;
            }
            
            // Validate role matches
            if (actualRole !== role) {
                await appState.clerkInstance.signOut();
                showToast(`Tu cuenta está registrada como ${actualRole}. Por favor selecciona el rol correcto.`, { 
                    type: 'danger', 
                    delay: 5000 
                });
                return;
            }
            
            // If teacher, ensure they're in teachers collection
            if (role === 'teacher') {
                await addTeacherOnLogin(email);
            }
            
            await completeLogin(email, role);
        } else {
            showToast('Inicio de sesión incompleto. Estado: ' + signIn.status, { type: 'warning' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        
        let errorMessage = 'Error al iniciar sesión.';
        
        if (error.errors && error.errors.length > 0) {
            const clerkError = error.errors[0];
            const message = clerkError.message || clerkError.longMessage || '';
            
            if (message.includes('Incorrect password') || message.includes('couldn\'t find your account')) {
                errorMessage = 'Correo o contraseña incorrectos.';
            } else {
                errorMessage = message;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showToast(errorMessage, { type: 'danger' });
    }
}

/**
 * Complete login process and update UI
 * @param {string} email - User email
 * @param {string} role - User role
 */
async function completeLogin(email, role) {
    appState.currentUser = { 
        email, 
        name: email.split('@')[0],
        primaryEmailAddress: { emailAddress: email }
    };
    appState.currentRole = role;
    
    // Clear login form
    const loginForm = DOM.getElementById('login-form');
    DOM.clearForm(loginForm);
    
    // Hide login section, show app
    DOM.hide('login-section');
    DOM.show('app-section');
    
    // Update navbar
    const { renderNavbar } = await import('../components/navbar.js');
    const navbarContainer = DOM.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = renderNavbar();
    }
    
    // Apply permissions and switch to role
    const { enforcePermissions, switchRole } = await import('../main.js');
    enforcePermissions();
    await switchRole(role);
    
    showToast('✓ Bienvenido(a) al sistema.', { type: 'success', delay: 2000 });
}

/**
 * Add teacher to MongoDB on login if not exists
 * @param {string} email - Teacher email
 */
async function addTeacherOnLogin(email) {
    try {
        await addTeacher(email, email.split('@')[0]);
        console.log('Teacher ensured in database');
    } catch (error) {
        console.error('Error adding teacher to database:', error);
    }
}

/**
 * Handle user registration
 * @param {Event} e - Submit event
 */
export async function handleRegistration(e) {
    e.preventDefault();
    
    const email = DOM.getElementById('reg-email')?.value.trim();
    const password = DOM.getElementById('reg-password')?.value;
    const confirmPassword = DOM.getElementById('reg-confirm-password')?.value;
    const role = DOM.getElementById('reg-role')?.value;

    // Validation
    if (!email || !password || !confirmPassword || !role) {
        showToast('Por favor completa todos los campos.', { type: 'warning' });
        return;
    }

    if (password !== confirmPassword) {
        showToast('Las contraseñas no coinciden.', { type: 'warning' });
        return;
    }

    if (password.length < 8) {
        showToast('La contraseña debe tener al menos 8 caracteres.', { type: 'warning' });
        return;
    }

    if (!appState.clerkInstance) {
        showToast('Error: Sistema de autenticación no inicializado.', { type: 'danger' });
        return;
    }

    try {
        const signUp = await appState.clerkInstance.client.signUp.create({
            emailAddress: email,
            password: password,
        });

        console.log('SignUp status:', signUp.status);

        if (signUp.status === 'complete') {
            showToast('✓ Usuario registrado con éxito. Guardando rol...', { type: 'success' });
            
            // Save role to Clerk metadata
            try {
                await updateUserMetadata(signUp.createdUserId, role);
                localStorage.setItem(`user_role_${email}`, role);
                
                // If teacher, add to teachers collection
                if (role === 'teacher') {
                    await addTeacherOnLogin(email);
                }
            } catch (metadataError) {
                console.error('Error saving role to Clerk:', metadataError);
                localStorage.setItem(`user_role_${email}`, role);
                showToast(`Rol guardado localmente. Error servidor: ${metadataError.message}`, { 
                    type: 'warning', 
                    delay: 5000 
                });
            }
            
            // User is already signed in after signup
            appState.currentUser = { email, name: email.split('@')[0] };
            appState.currentRole = role;
            
            // Clear form
            const registrationForm = DOM.getElementById('registration-form');
            DOM.clearForm(registrationForm);
            
            // Hide registration and login sections, show app
            DOM.hide('registration-container');
            DOM.hide('login-section');
            DOM.show('app-section');
            
            // Update navbar
            const { renderNavbar } = await import('../components/navbar.js');
            const navbarContainer = DOM.getElementById('navbar-container');
            if (navbarContainer) {
                navbarContainer.innerHTML = renderNavbar();
            }
            
            // Apply permissions
            const { enforcePermissions, switchRole } = await import('../main.js');
            enforcePermissions();
            await switchRole(role);
            
            showToast('✓ Sesión iniciada automáticamente.', { type: 'success', delay: 2000 });
            
        } else if (signUp.status === 'missing_requirements') {
            showToast('Registro iniciado. Por favor verifica tu correo electrónico.', { type: 'info' });
            showToast('Se ha enviado un código de verificación a tu correo.', { type: 'info', delay: 5000 });
            
        } else if (signUp.createdUserId) {
            showToast('✓ Usuario registrado. Revisa tu correo para verificar tu cuenta.', { type: 'success' });
            
            // Clear form and switch to login
            const registrationForm = DOM.getElementById('registration-form');
            DOM.clearForm(registrationForm);
            DOM.hide('registration-container');
            DOM.show('login-section');
            
        } else {
            showToast('Registro en proceso. Estado: ' + signUp.status, { type: 'info' });
        }
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        let errorMessage = 'Error desconocido';
        
        if (error.errors && error.errors.length > 0) {
            const clerkError = error.errors[0];
            const message = clerkError.message || clerkError.longMessage || '';
            
            if (message.includes('Passwords must be 8 characters')) {
                errorMessage = 'La contraseña debe tener al menos 8 caracteres.';
            } else if (message.includes('found in an online data breach')) {
                errorMessage = 'Esta contraseña es insegura. Por favor usa una contraseña más fuerte y única.';
            } else if (message.includes('email address is taken')) {
                errorMessage = 'Este correo ya está registrado.';
            } else {
                errorMessage = message;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showToast(errorMessage, { type: 'danger' });
    }
}

/**
 * Toggle between login and registration forms
 */
export function setupFormToggle() {
    const loginSection = DOM.getElementById('login-section');
    const registrationContainer = DOM.getElementById('registration-container');
    const showRegistrationBtn = DOM.getElementById('show-registration');
    const showLoginBtn = DOM.getElementById('show-login');

    // Render registration form if container exists
    if (registrationContainer && !registrationContainer.innerHTML.trim()) {
        import('../components/registration.js').then(module => {
            if (module.renderRegistrationForm) {
                registrationContainer.innerHTML = module.renderRegistrationForm();
                DOM.hide(registrationContainer);
            }
        });
    }

    // Show registration button
    if (showRegistrationBtn) {
        showRegistrationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const loginForm = DOM.getElementById('login-form');
            DOM.clearForm(loginForm);
            
            DOM.hide(loginSection);
            DOM.show(registrationContainer);
        });
    }

    // Show login button
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const registrationForm = DOM.getElementById('registration-form');
            DOM.clearForm(registrationForm);
            
            const passwordMatchMessage = DOM.getElementById('password-match-message');
            if (passwordMatchMessage) {
                passwordMatchMessage.textContent = '';
                passwordMatchMessage.className = 'form-text';
            }
            
            DOM.hide(registrationContainer);
            DOM.show(loginSection);
        });
    }
}

/**
 * Setup password toggle visibility
 * @param {string} inputId - Password input ID
 * @param {string} buttonId - Toggle button ID
 * @param {string} iconId - Toggle icon ID
 */
export function setupPasswordToggle(inputId, buttonId, iconId) {
    const passwordInput = DOM.getElementById(inputId);
    const toggleButton = DOM.getElementById(buttonId);
    const toggleIcon = DOM.getElementById(iconId);

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

/**
 * Setup password match validation for registration
 */
export function setupPasswordMatchValidation() {
    const regPassword = DOM.getElementById('reg-password');
    const regConfirmPassword = DOM.getElementById('reg-confirm-password');
    const passwordMatchMessage = DOM.getElementById('password-match-message');

    if (regPassword && regConfirmPassword && passwordMatchMessage) {
        const validatePasswordMatch = () => {
            if (regConfirmPassword.value === '') {
                passwordMatchMessage.textContent = '';
                passwordMatchMessage.className = 'form-text';
                return;
            }

            if (regPassword.value === regConfirmPassword.value) {
                passwordMatchMessage.textContent = '✓ Las contraseñas coinciden';
                passwordMatchMessage.className = 'form-text text-success';
            } else {
                passwordMatchMessage.textContent = '✗ Las contraseñas no coinciden';
                passwordMatchMessage.className = 'form-text text-danger';
            }
        };

        regPassword.addEventListener('input', validatePasswordMatch);
        regConfirmPassword.addEventListener('input', validatePasswordMatch);
    }
}
