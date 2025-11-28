// Utils
import { showToast } from './utils/toast.js';
import { DOM } from './utils/dom.js';

// State
import { appState } from './state/appState.js';

// Services
import { initializeClerk, checkClerkSession, updateUserMetadata } from './services/clerkService.js';
import { getTeacherQuestions, getStudentQuestions, addTeacher } from './services/evaluationService.js';

// Components
import { renderNavbar } from './components/navbar.js';
import { renderLoginSection } from './components/login.js';
import { renderRegistrationForm } from './components/registration.js';
import { renderTeacherSection } from './components/teacher.js';
import { renderStudentSection, populateTeachers } from './components/student.js';
import { renderDirectorSection, loadDirectorData, updateDirectorDashboard } from './components/director.js';

// Handlers
import {
    handleStartSelfEvaluation,
    handleTeacherEvaluationSubmit,
    handleViewResults,
    handleRefreshResults,
    handleExportResults
} from './handlers/teacherHandlers.js';
import {
    handleTeacherSelection,
    handleStudentEvaluationSubmit
} from './handlers/studentHandlers.js';
import {
    handleRefreshDirectorData,
    handleExportReport,
    handleExportSummary
} from './handlers/directorHandlers.js';
import {
    handleLogin,
    handleRegistration,
    setupFormToggle,
    setupPasswordToggle,
    setupPasswordMatchValidation
} from './handlers/authHandlers.js';

// Make showToast globally available (needed by some legacy code)
window.showToast = showToast;

/**
 * Initialize the application
 */
async function initializeApp() {
    // Initialize Clerk
    appState.clerkInstance = await initializeClerk();

    // Render UI
    renderUI();

    // Check for existing session
    await restoreSession();

    // Setup event listeners
    setupEventListeners();

    // Check for success messages in sessionStorage
    checkSessionMessages();
}

/**
 * Render main UI structure
 */
function renderUI() {
    // Render navbar
    const navbarContainer = DOM.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.innerHTML = renderNavbar();
    }

    // Render main app sections
    const main = DOM.getElementById('main-container');
    if (main) {
        main.innerHTML = `
            <div id="app-section">
                <SignedIn>
                    ${renderLoginSection()}
                    ${renderTeacherSection()}
                    ${renderStudentSection()}
                    ${renderDirectorSection()}
                </SignedIn>
                <SignedOut>
                    <RedirectToSignIn />
                </SignedOut>
            </div>
        `;
    }
}

/**
 * Restore session from Clerk if available
 */
async function restoreSession() {
    const sessionData = await checkClerkSession(appState.clerkInstance);

    if (sessionData) {
        appState.currentUser = sessionData.user;
        appState.currentRole = sessionData.role;

        if (appState.currentRole) {
            console.log('Session restored:', {
                email: sessionData.email,
                role: appState.currentRole
            });

            updateUIForLoggedInUser(sessionData.email, appState.currentRole);
            await switchRole(appState.currentRole);
        }
    }
}

/**
 * Update UI elements for logged-in user
 * @param {string} email - User email
 * @param {string} role - User role
 */
function updateUIForLoggedInUser(email, role) {
    const userInfoDiv = DOM.getElementById('user-info');
    if (userInfoDiv) {
        userInfoDiv.textContent = `Usuario: ${email} | Rol: ${role.charAt(0).toUpperCase() + role.slice(1)}`;
        DOM.show(userInfoDiv);
    }

    const loginSection = DOM.getElementById('login-section');
    DOM.hide(loginSection);

    enforcePermissions();
}

/**
 * Check for session messages and display them
 */
function checkSessionMessages() {
    if (sessionStorage.getItem('evalSubmittedSuccess') === 'true') {
        showToast('Bienvenido de vuelta. Tu evaluación fue enviada correctamente.', {
            type: 'success',
            delay: 4000
        });
        sessionStorage.removeItem('evalSubmittedSuccess');
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    setupNavigationListeners();
    setupTeacherListeners();
    setupStudentListeners();
    setupDirectorListeners();
    setupAuthListeners();
}

/**
 * Setup navigation event listeners
 */
function setupNavigationListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const role = btn.dataset.role;
            switchRole(role);
        });
    });

    // Logout button - use event delegation for dynamically rendered navbar
    const navbarContainer = DOM.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.addEventListener('click', async (e) => {
            // Check for logout button or its children
            if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
                e.preventDefault();
                await handleLogout();
            }
        });
    }

    // Also handle direct click on logout button if it exists
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'logout-button' || e.target.closest('#logout-button')) {
            e.preventDefault();
            await handleLogout();
        }
    });
}

/**
 * Setup teacher-specific event listeners
 */
function setupTeacherListeners() {
    const startSelfEvalBtn = DOM.getElementById('start-self-eval');
    if (startSelfEvalBtn) {
        startSelfEvalBtn.addEventListener('click', handleStartSelfEvaluation);
    }

    const cancelEvalBtn = DOM.getElementById('cancel-eval');
    if (cancelEvalBtn) {
        cancelEvalBtn.addEventListener('click', () => {
            DOM.hide('self-evaluation-form');
            showToast('Autoevaluación cancelada.', { type: 'secondary', delay: 2000 });
        });
    }

    const teacherEvalForm = DOM.getElementById('teacher-eval-form');
    if (teacherEvalForm) {
        teacherEvalForm.addEventListener('submit', handleTeacherEvaluationSubmit);
    }

    const viewResultsBtn = DOM.getElementById('view-results');
    if (viewResultsBtn) {
        viewResultsBtn.addEventListener('click', handleViewResults);
    }

    const refreshResultsBtn = DOM.getElementById('refresh-results');
    if (refreshResultsBtn) {
        refreshResultsBtn.addEventListener('click', handleRefreshResults);
    }

    const exportTeacherResultsBtn = DOM.getElementById('export-teacher-results');
    if (exportTeacherResultsBtn) {
        exportTeacherResultsBtn.addEventListener('click', handleExportResults);
    }

    // Improvement plan buttons
    const openPlanBtn = DOM.getElementById('open-plan');
    if (openPlanBtn) {
        openPlanBtn.addEventListener('click', () => {
            if (!appState.hasRole('teacher') && !appState.hasRole('director')) {
                return showToast('No tienes permiso para ver el plan.', { type: 'danger' });
            }
            showToast('Aquí se abriría el Plan de Mejora (funcionalidad pendiente).', { type: 'info' });
        });
    }

    const improvementBtn = DOM.getElementById('improvement-plan');
    if (improvementBtn) {
        improvementBtn.addEventListener('click', () => {
            if (!appState.hasRole('teacher') && !appState.hasRole('director')) {
                return showToast('No tienes permiso para crear un plan de mejora.', { type: 'danger' });
            }
            DOM.hide('self-evaluation-form');
            DOM.hide('results-visualization');
            
            const modalEl = DOM.getElementById('improvementPlanModal');
            if (modalEl && window.bootstrap) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        });
    }

    // Handle improvement plan form submission
    const planForm = DOM.getElementById('improvement-plan-form');
    if (planForm) {
        planForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const goal = planForm.goal?.value.trim();
            const actions = planForm.actions?.value.trim();
            const indicators = planForm.indicators?.value.trim();
            const deadline = planForm.deadline?.value;
            
            if (!goal || !actions || !indicators || !deadline) {
                showToast('Por favor complete todos los campos.', { type: 'warning' });
                return;
            }
            
            showToast('¡Plan de mejora guardado exitosamente!', { type: 'success' });
            
            const modalEl = DOM.getElementById('improvementPlanModal');
            if (modalEl && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
            
            planForm.reset();
        });
    }
}

/**
 * Setup student-specific event listeners
 */
function setupStudentListeners() {
    const selectTeacher = DOM.getElementById('select-teacher');
    if (selectTeacher) {
        selectTeacher.addEventListener('change', handleTeacherSelection);
    }

    const studentEvalForm = DOM.getElementById('student-eval-form');
    if (studentEvalForm) {
        studentEvalForm.addEventListener('submit', handleStudentEvaluationSubmit);
    }
}

/**
 * Setup director-specific event listeners
 */
function setupDirectorListeners() {
    const refreshDirectorBtn = DOM.getElementById('refresh-director-data');
    if (refreshDirectorBtn) {
        refreshDirectorBtn.addEventListener('click', handleRefreshDirectorData);
    }

    const exportBtn = DOM.getElementById('export-report');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportReport);
    }

    const exportSummaryBtn = DOM.getElementById('export-summary');
    if (exportSummaryBtn) {
        exportSummaryBtn.addEventListener('click', handleExportSummary);
    }
}

/**
 * Setup authentication event listeners
 */
function setupAuthListeners() {
    // Login form submission
    const loginForm = DOM.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Registration form submission
    const registrationForm = DOM.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    // Setup form toggle between login and registration
    setupFormToggle();

    // Setup password visibility toggles
    setupPasswordToggle('password', 'toggle-password', 'toggle-password-icon');
    setupPasswordToggle('reg-password', 'toggle-reg-password', 'toggle-reg-password-icon');
    setupPasswordToggle('reg-confirm-password', 'toggle-reg-confirm-password', 'toggle-reg-confirm-password-icon');

    // Setup password match validation for registration
    setupPasswordMatchValidation();
}

/**
 * Enforce role-based permissions on UI
 */
export function enforcePermissions() {
    const tabs = document.querySelectorAll('.tab-button');
    const sections = document.querySelectorAll('.role-section');

    tabs.forEach(tab => {
        const role = tab.dataset.role;
        tab.style.display = (role === appState.currentRole) ? '' : 'none';
        tab.classList.toggle('active', role === appState.currentRole);
    });

    sections.forEach(section => {
        const idRole = section.id.replace('-section', '');
        section.style.display = (idRole === appState.currentRole) ? '' : 'none';
        section.classList.toggle('active-section', idRole === appState.currentRole);
    });

    // Hide forms by default
    DOM.hide('self-evaluation-form');
    DOM.hide('results-visualization');
    DOM.hide('student-evaluation-form');
}

/**
 * Switch to a specific role view
 * @param {string} role - Role to switch to
 */
export async function switchRole(role) {
    if (!appState.currentRole) {
        showToast('Debes iniciar sesión.', { type: 'danger' });
        return;
    }

    if (role !== appState.currentRole) {
        showToast('No tienes permisos para ver este rol.', { type: 'danger' });
        enforcePermissions();
        return;
    }

    // Update UI
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.role === role);
    });

    document.querySelectorAll('.role-section').forEach(section => {
        section.classList.toggle('active-section', section.id === `${role}-section`);
    });

    DOM.hide('self-evaluation-form');
    DOM.hide('results-visualization');

    // Load role-specific data
    await loadRoleSpecificData(role);
}

/**
 * Load data specific to each role
 * @param {string} role - Current role
 */
async function loadRoleSpecificData(role) {
    if (role === 'teacher') {
        const teacherId = appState.getUserEmail();
        if (teacherId) {
            const { updateSelfEvaluationButton } = await import('./components/teacher.js');
            await updateSelfEvaluationButton(teacherId);
        }
    }

    if (role === 'student') {
        const userEmail = appState.getUserEmail();
        if (userEmail) {
            if (!appState.studentEvaluationItems) {
                appState.studentEvaluationItems = await getStudentQuestions();
            }
            populateTeachers(userEmail);
        }
    }

    if (role === 'director') {
        const loadingDiv = DOM.getElementById('director-loading');
        const contentDiv = DOM.getElementById('director-content');

        DOM.show(loadingDiv);
        DOM.hide(contentDiv);

        try {
            const stats = await loadDirectorData();
            updateDirectorDashboard(stats);
            appState.directorStats = stats;
            window.directorStats = stats; // Keep for legacy compatibility
        } catch (error) {
            console.error('Error loading director data:', error);
            showToast('Error al cargar las estadísticas del director.', { type: 'danger' });
        } finally {
            DOM.hide(loadingDiv);
            DOM.show(contentDiv);
        }
    }
}

/**
 * Handle user logout
 */
async function handleLogout() {
    try {
        console.log('Logout initiated');
        
        if (appState.clerkInstance && appState.clerkInstance.session) {
            await appState.clerkInstance.signOut();
            console.log('Signed out from Clerk successfully');
        }

        // Clear local state
        appState.clear();
        // Don't clear all localStorage - only user-specific data
        // localStorage.clear();

        // Re-render navbar without user
        const navbarContainer = DOM.getElementById('navbar-container');
        if (navbarContainer) {
            navbarContainer.innerHTML = renderNavbar();
        }

        // Show login section and hide app section
        DOM.show('login-section');
        DOM.hide('app-section');
        DOM.hide('registration-container');
        
        document.querySelectorAll('.role-section').forEach(section => {
            DOM.hide(section);
        });

        const userInfoDiv = DOM.getElementById('user-info');
        if (userInfoDiv) {
            userInfoDiv.textContent = '';
            DOM.hide(userInfoDiv);
        }

        // Reset login form
        const loginForm = DOM.getElementById('login-form');
        if (loginForm) {
            DOM.clearForm(loginForm);
        }

        // Hide all sections and forms
        enforcePermissions();
        
        // Save logout message for next load
        sessionStorage.setItem('logoutMessage', 'true');
        
        // Scroll to login
        const loginSection = DOM.getElementById('login-section');
        if (loginSection) {
            DOM.scrollIntoView(loginSection);
        }
    } catch (error) {
        console.error('Error during logout:', error);
        showToast('Error al cerrar sesión.', { type: 'danger' });
    }
}

// Initialize app when DOM is ready
window.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    
    // Check for logout message
    if (sessionStorage.getItem('logoutMessage')) {
        sessionStorage.removeItem('logoutMessage');
        setTimeout(() => {
            showToast('✓ Sesión cerrada correctamente', { type: 'info', delay: 3000 });
        }, 100);
    }
});
