// Bootstrap toast notification utility for visual feedback
function showToast(message, options = {}) {
    const container = document.getElementById('toast-container');
    if (!container) return alert(message); // fallback for environments without toast container
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${options.type || 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.style.minWidth = '250px';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
    `;
    container.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: options.delay || 3500 });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}
import { renderNavbar } from './components/navbar.js';
import { renderLoginSection } from './components/login.js';
import { renderRegistrationForm } from './components/registration.js';
import { renderTeacherSection, renderEvaluationItems } from './components/teacher.js';
import { renderStudentSection, populateTeachers, renderStudentEvaluationItems, submitStudentEvaluation } from './components/student.js';
import { renderDirectorSection, updateDirectorChartAndTable } from './components/director.js';
import { Clerk } from '@clerk/clerk-js';

let currentUser = null;
let currentRole = null;
let clerkInstance = null;
let useDemoMode = false; // Set to false to use real Clerk authentication

// Initialize Clerk
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (clerkPubKey && !useDemoMode) {
    clerkInstance = new Clerk(clerkPubKey);
    clerkInstance.load().then(() => {
        console.info('Clerk initialized successfully');
    }).catch(err => {
        console.error('Failed to load Clerk, falling back to demo mode:', err);
        useDemoMode = true;
    });
} else if (!clerkPubKey) {
    console.warn('Clerk publishable key is missing. Falling back to demo mode.');
    useDemoMode = true;
}

// Render the navigation bar
const navbarContainer = document.getElementById('navbar-container');
navbarContainer.innerHTML = renderNavbar();

const main = document.getElementById('main-container');

// Render login and main app sections
const app = `
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
</div>`;

main.innerHTML = app;

// ---- Permissions and utility functions ----
function hasRole(role) {
    return currentRole === role;
}

function enforcePermissions() {
    const tabs = document.querySelectorAll('.tab-button');
    const sections = document.querySelectorAll('.role-section');

    tabs.forEach(tab => {
        const role = tab.dataset.role;
        tab.style.display = (role === currentRole) ? '' : 'none';
        tab.classList.toggle('active', role === currentRole);
    });

    sections.forEach(section => {
        const idRole = section.id.replace('-section','');
        section.style.display = (idRole === currentRole) ? '' : 'none';
        section.classList.toggle('active-section', idRole === currentRole);
    });

    // Hide all forms on entry
    document.getElementById('self-evaluation-form')?.style && (document.getElementById('self-evaluation-form').style.display = 'none');
    document.getElementById('results-visualization')?.style && (document.getElementById('results-visualization').style.display = 'none');
    document.getElementById('student-evaluation-form')?.style && (document.getElementById('student-evaluation-form').style.display = 'none');
}

/**
 * Attempt to switch tabs. If it doesn't match the current role, block access.
 */
function switchRole(role) {
    if (!currentRole) {
        showToast('Debes iniciar sesión.', { type: 'danger' });
        return;
    }
    if (role !== currentRole) {
        showToast('No tienes permisos para ver este rol.', { type: 'danger' });
        enforcePermissions();
        return;
    }

    document.querySelectorAll('.tab-button')
        .forEach(tab => tab.classList.toggle('active', tab.dataset.role === role));
    document.querySelectorAll('.role-section')
        .forEach(section => section.classList.toggle('active-section', section.id === `${role}-section`));

    document.getElementById('self-evaluation-form')?.style && (document.getElementById('self-evaluation-form').style.display = 'none');
    document.getElementById('results-visualization')?.style && (document.getElementById('results-visualization').style.display = 'none');

    if (role === 'director') {
        const ctx = document.getElementById('director-chart')?.getContext('2d');
        if (ctx) updateDirectorChartAndTable(ctx);
    }
}

// ---- Event Initialization and UI Event Handlers ----
function init() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    // Use event delegation for logout button (since it's dynamically rendered)
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn')) {
                e.preventDefault();
                handleLogout(e);
            }
        });
    }

    // Tab click: attempts to switch, but switchRole blocks based on permissions
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', () => switchRole(tab.dataset.role));
    });

    // ----------------- Teacher buttons (with role guards) -----------------
    const startBtn = document.getElementById('start-self-eval');
    if (startBtn) startBtn.addEventListener('click', () => {
        if (!hasRole('teacher') && !hasRole('director')) return showToast('No tienes permiso para iniciar una autoevaluación docente.', { type: 'danger' });
    // Hide the results section if it is visible
        const resultsVis = document.getElementById('results-visualization');
        if (resultsVis) resultsVis.style.display = 'none';

    // Show the self-assessment form
        const form = document.getElementById('self-evaluation-form');
        if (form) {
            form.style.display = 'block';
            // Render evaluation items every time the form is opened
            renderEvaluationItems();
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.error('El elemento con ID "self-evaluation-form" no existe en el DOM.');
        }
    });

    // Cancel teacher self-evaluation
    const cancelEval = document.getElementById('cancel-eval');
    if (cancelEval) cancelEval.addEventListener('click', () => {
        const form = document.getElementById('self-evaluation-form');
        if (form) form.style.display = 'none';
        showToast('Autoevaluación cancelada.', { type: 'secondary', delay: 2000 });
    });

    // Setup password toggle for login
    setupPasswordToggle('password', 'toggle-password', 'toggle-password-icon');

    // View results: hide self-assessment form and show results (render charts)
    const viewResultsBtn = document.getElementById('view-results');
    if (viewResultsBtn) viewResultsBtn.addEventListener('click', () => {
        if (!hasRole('teacher') && !hasRole('director')) return showToast('No tienes permiso para ver los resultados.', { type: 'danger' });
    // Hide self-assessment form if visible
        const form = document.getElementById('self-evaluation-form');
        if (form) form.style.display = 'none';

    // Show results section
        const resultsVis = document.getElementById('results-visualization');
        if (resultsVis) resultsVis.style.display = 'block';

    // Simulated data: replace with real data in production
    // By question
    const autoScores = evaluationItems.map(item => Math.round(3.5 + Math.random() * 1.5 * 10) / 10); // 3.5-5.0
    const studentScores = evaluationItems.map(item => Math.round(3.0 + Math.random() * 2 * 10) / 10); // 3.0-5.0
    // By category
        const categories = [...new Set(evaluationItems.map(item => item.category))];
        const categoryAveragesAuto = categories.map(cat => {
            const idxs = evaluationItems.map((item, i) => item.category === cat ? i : -1).filter(i => i !== -1);
            return Math.round(idxs.reduce((sum, i) => sum + autoScores[i], 0) / idxs.length * 10) / 10;
        });
        const categoryAveragesStudent = categories.map(cat => {
            const idxs = evaluationItems.map((item, i) => item.category === cat ? i : -1).filter(i => i !== -1);
            return Math.round(idxs.reduce((sum, i) => sum + studentScores[i], 0) / idxs.length * 10) / 10;
        });

    // Bar chart by category
        const resultsCanvas = document.getElementById('results-chart');
        if (resultsCanvas) {
            const resultsCtx = resultsCanvas.getContext('2d');
            if (resultsCtx) {
                if (window.resultsChart) window.resultsChart.destroy();
                window.resultsChart = new Chart(resultsCtx, {
                    type: 'bar',
                    data: {
                        labels: categories,
                        datasets: [
                            { label: 'Autoevaluación', data: categoryAveragesAuto, backgroundColor: '#0d6efd' },
                            { label: 'Estudiantes', data: categoryAveragesStudent, backgroundColor: '#ffc107' }
                        ]
                    },
                    options: { scales: { y: { beginAtZero: true, max: 5 } } }
                });
            }
        }

    // Radar chart for comparison
        const comparisonCanvas = document.getElementById('comparison-chart');
        if (comparisonCanvas) {
            const comparisonCtx = comparisonCanvas.getContext('2d');
            if (comparisonCtx) {
                if (window.comparisonChart) window.comparisonChart.destroy();
                window.comparisonChart = new Chart(comparisonCtx, {
                    type: 'radar',
                    data: {
                        labels: categories,
                        datasets: [
                            { label: 'Autoevaluación', data: categoryAveragesAuto, backgroundColor: 'rgba(13,110,253,0.2)', borderColor: '#0d6efd', pointBackgroundColor: '#0d6efd' },
                            { label: 'Estudiantes', data: categoryAveragesStudent, backgroundColor: 'rgba(255,193,7,0.2)', borderColor: '#ffc107', pointBackgroundColor: '#ffc107' }
                        ]
                    },
                    options: { scales: { r: { beginAtZero: true, max: 5 } } }
                });
            }
        }

    // Comparison table by question
        const tableBody = document.querySelector('#results-comparison-table tbody');
        if (tableBody) {
            tableBody.innerHTML = '';
            evaluationItems.forEach((item, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.text}</td>
                    <td class="text-center">${autoScores[idx]}</td>
                    <td class="text-center">${studentScores[idx]}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

    // Text summary (simple, can be improved)
        const summaryDiv = document.getElementById('results-summary');
        if (summaryDiv) {
            // Find differences greater than 0.5
            let strengths = [], opportunities = [];
            evaluationItems.forEach((item, idx) => {
                const diff = autoScores[idx] - studentScores[idx];
                if (diff >= 0.5) strengths.push(item.text);
                else if (diff <= -0.5) opportunities.push(item.text);
            });
            let html = '';
            if (strengths.length > 0) html += `<b>Fortalezas percibidas:</b> <ul>${strengths.map(t => `<li>${t}</li>`).join('')}</ul>`;
            if (opportunities.length > 0) html += `<b>Oportunidades de mejora:</b> <ul>${opportunities.map(t => `<li>${t}</li>`).join('')}</ul>`;
            if (!html) html = 'No se detectaron diferencias significativas entre autoevaluación y percepción estudiantil.';
            summaryDiv.innerHTML = html;
        }

    // Scroll to results section
        resultsVis.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Handle teacher self-assessment form submission
    const teacherEvalForm = document.getElementById('teacher-eval-form');
    if (teacherEvalForm) teacherEvalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!hasRole('teacher') && !hasRole('director')) return showToast('No tienes permiso para enviar esta evaluación.', { type: 'danger' });

    // Visual and logical validation: only submit if all questions are answered
        let allAnswered = true;
    // Clear previous error messages
        teacherEvalForm.querySelectorAll('.eval-error-msg').forEach(e => e.remove());

    // Validate and show message below each unanswered question
        const questions = teacherEvalForm.querySelectorAll('.evaluation-item');

        questions.forEach((itemDiv, index) => {
            const radios = itemDiv.querySelectorAll('input[type="radio"]');
            const name = radios[0]?.name;
            const checked = studentForm.querySelector(`input[name="${name}"]:checked`);

            if (!checked) {
                allAnswered = false;
                const error = document.createElement('span');
                error.className = 'eval-error-msg';
                error.textContent = 'Por favor responde esta pregunta.';
                error.style.display = 'block';
                error.style.color = '#dc3545';
                error.style.fontSize = '0.95em';
                error.style.marginTop = '0.25rem';
                itemDiv.appendChild(error);
            }
        });

        if (!allAnswered) {
            showToast('Por favor, responda todas las preguntas antes de enviar la evaluación.', { type: 'warning' });
            return;
        }

    // If all questions are answered, process and clear form
        const scores = {};
        evaluationItems.forEach(item => {
            const checked = teacherEvalForm.querySelector(`input[name='eval-${item.id}']:checked`);
            scores[item.id] = checked ? parseInt(checked.value, 10) : null;
        });
        const reflection = document.getElementById('reflection').value;
        console.log('Evaluación enviada:', { scores, reflection });
    showToast('¡Evaluación enviada con éxito!', { type: 'success' });

    // Hide and clear views
        const formEl = document.getElementById('self-evaluation-form');
        if (formEl) formEl.style.display = 'none';
        const resultsVis = document.getElementById('results-visualization');
        if (resultsVis) resultsVis.style.display = 'none';

    // Reset radio buttons (optional)
        evaluationItems.forEach(item => {
            const radios = document.getElementsByName(`eval-${item.id}`);
            radios.forEach(r => r.checked = false);
        });
    // Clear textarea
        const reflectionInput = document.getElementById('reflection');
        if (reflectionInput) reflectionInput.value = '';
    });

    // Student evaluation section
    populateTeachers();
    const selectTeacher = document.getElementById('select-teacher');
    if (selectTeacher) {
        selectTeacher.addEventListener('change', function() {
            if (!hasRole('student') && !hasRole('director')) {
                // Reset select if no permission
                this.value = '';
                return showToast('No tienes permiso para realizar evaluaciones estudiantiles.', { type: 'danger' });
            }
            if (this.value) {
                const form = document.getElementById('student-evaluation-form');
                if (form) form.style.display = 'block';
                renderStudentEvaluationItems();
            } else {
                const form = document.getElementById('student-evaluation-form');
                if (form) form.style.display = 'none';
            }
        });
    }
    const studentForm = document.getElementById('student-eval-form');
    if (studentForm) studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!hasRole('student') && !hasRole('director')) return showToast('No tienes permiso para enviar esta evaluación.', { type: 'danger' });

    // Visual and logical validation: only submit if all questions are answered
        const items = window.studentEvaluationItems || studentEvaluationItems;
        let allAnswered = true;

    // Limpiar errores previos
        studentForm.querySelectorAll('.eval-error-msg').forEach(e => e.remove());

    // Recorrer todos los bloques de preguntas dinámicas
        const questions = studentForm.querySelectorAll('.evaluation-item');
        questions.forEach((itemDiv, index) => {
            const radios = itemDiv.querySelectorAll('input[type="radio"]');
            const name = radios[0]?.name;
            const checked = studentForm.querySelector(`input[name="${name}"]:checked`);

            if (!checked) {
                allAnswered = false;
                const error = document.createElement('span');
                error.className = 'eval-error-msg';
                error.textContent = 'Por favor responde esta pregunta.';
                error.style.display = 'block';
                error.style.color = '#dc3545';
                error.style.fontSize = '0.95em';
                error.style.marginTop = '0.25rem';
                itemDiv.appendChild(error);
            }
            });

        if (!allAnswered) {
            showToast('Por favor, responda todas las preguntas antes de enviar la evaluación.', { type: 'warning' });
            return;
        }

    // If all questions are answered, process and clear form
        const scores = {};
        items.forEach((item, index) => {
            const checked = studentForm.querySelector(`input[name='eval-student-${index + 1}']:checked`);
            scores[index + 1] = checked ? parseInt(checked.value, 10) : null;
        });

        const teacherId = document.getElementById('select-teacher').value;
        const userEmail = currentUser?.email || 'anonimo';
        const userRole = currentRole || 'student';

        console.log('Evaluación estudiantil enviada:', { teacherId, scores, userEmail, userRole });

        submitStudentEvaluation(teacherId, scores, userEmail, userRole);

        showToast('¡Evaluación enviada con éxito! Su respuesta es anónima.', { type: 'success' });
        studentForm.reset();
        if (selectTeacher) selectTeacher.value = '';
        const formEl = document.getElementById('student-evaluation-form');
        if (formEl) formEl.style.display = 'none';
    });

    // Director controls and analytics
    const reportType = document.getElementById('report-type');
    const timePeriod = document.getElementById('time-period');
    if (reportType) reportType.addEventListener('change', () => {
        if (!hasRole('director')) return alert('No tienes permiso para cambiar los filtros de administración.');
        const ctx = document.getElementById('director-chart')?.getContext('2d');
        if (ctx) updateDirectorChartAndTable(ctx);
    });
    if (timePeriod) timePeriod.addEventListener('change', () => {
        if (!hasRole('director')) return alert('No tienes permiso para cambiar los filtros de administración.');
        const ctx = document.getElementById('director-chart')?.getContext('2d');
        if (ctx) updateDirectorChartAndTable(ctx);
    });
    const exportBtn = document.getElementById('export-report');
    if (exportBtn) exportBtn.addEventListener('click', () => {
        if (!hasRole('director')) return showToast('No tienes permiso para exportar reportes.', { type: 'danger' });
        showToast('Funcionalidad de exportación (marchar a backend)', { type: 'info' });
    });
    const detailedAnalysis = document.getElementById('detailed-analysis');
    if (detailedAnalysis) detailedAnalysis.addEventListener('click', () => {
        if (!hasRole('director')) return alert('No tienes permiso para ver análisis detallado.');
        alert('Funcionalidad de análisis detallado (marchar a backend)');
    });

    // Small header button: open improvement plan
    const openPlanBtn = document.getElementById('open-plan');
    if (openPlanBtn) openPlanBtn.addEventListener('click', () => {
        if (!hasRole('teacher') && !hasRole('director')) return alert('No tienes permiso para ver el plan.');
    // Example: show modal or navigate to section. Replace with real modal if needed.
        alert('Aquí se abriría el Plan de Mejora (implementa modal o navegación).');
    });

    // Main body button: create improvement plan
    const improvementBtn = document.getElementById('improvement-plan');
    if (improvementBtn) improvementBtn.addEventListener('click', () => {
        if (!hasRole('teacher') && !hasRole('director')) return showToast('No tienes permiso para crear un plan de mejora.', { type: 'danger' });
        document.getElementById('self-evaluation-form')?.style && (document.getElementById('self-evaluation-form').style.display = 'none');
        document.getElementById('results-visualization')?.style && (document.getElementById('results-visualization').style.display = 'none');
    // Show Bootstrap modal for improvement plan
        const modalEl = document.getElementById('improvementPlanModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    });

    // Handle improvement plan form submission
    const planForm = document.getElementById('improvement-plan-form');
    if (planForm) planForm.addEventListener('submit', function(e) {
        e.preventDefault();
    // Simple validation for required fields
        const goal = planForm.goal.value.trim();
        const actions = planForm.actions.value.trim();
        const indicators = planForm.indicators.value.trim();
        const deadline = planForm.deadline.value;
        if (!goal || !actions || !indicators || !deadline) {
            showToast('Por favor complete todos los campos.', { type: 'warning' });
            return;
        }
    // Here you could save the plan to backend or localStorage
        showToast('¡Plan de mejora guardado exitosamente!', { type: 'success' });
    // Close modal after saving
        const modalEl = document.getElementById('improvementPlanModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
        planForm.reset();
    });

}

// Handle registration (moved outside init)
async function handleRegistration(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const role = document.getElementById('reg-role').value;

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

    // Check if using demo mode
    if (useDemoMode || !clerkInstance) {
        // Store user in localStorage for demo
        const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showToast('Este correo ya está registrado.', { type: 'warning' });
            return;
        }
        
        users.push({ email, password, role });
        localStorage.setItem('demo_users', JSON.stringify(users));
        showToast('✓ Usuario registrado con éxito (modo demo)', { type: 'success' });
        
        // Clear form
        document.getElementById('registration-form').reset();
        
        // Switch back to login form
        document.getElementById('registration-container').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
        return;
    }

    try {
        // Use Clerk's signUp method
        const signUp = await clerkInstance.client.signUp.create({
            emailAddress: email,
            password: password,
        });

        console.log('SignUp status:', signUp.status);

        if (signUp.status === 'complete') {
            // Registration completed successfully - Clerk creates a session automatically
            showToast('✓ Usuario registrado con éxito. Guardando rol...', { type: 'success' });
            console.log('Usuario registrado exitosamente:', signUp);
            
            // Save role to Clerk metadata via backend
            try {
                const response = await fetch('/api/update-user-metadata', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: signUp.createdUserId,
                        role: role
                    })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    console.error('Server error response:', data);
                    throw new Error(data.error || data.message || 'Failed to save user role');
                }

                console.log('Role saved to Clerk:', data);
                
                // Also store in localStorage as backup
                localStorage.setItem(`user_role_${email}`, role);
            } catch (metadataError) {
                console.error('Error saving role to Clerk:', metadataError);
                console.error('Error details:', metadataError.message);
                // Still store in localStorage as fallback
                localStorage.setItem(`user_role_${email}`, role);
                showToast(`Rol guardado localmente. Error servidor: ${metadataError.message}`, { type: 'warning', delay: 5000 });
            }
            
            // User is already signed in after signup, so set the current user and role
            currentUser = { email, name: email.split('@')[0] };
            currentRole = role;
            
            // Clear form
            document.getElementById('registration-form').reset();
            
            // Hide registration and login sections, show app
            document.getElementById('registration-container').style.display = 'none';
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('app-section').style.display = 'block';
            
            // Update navbar
            const navbarContainer = document.getElementById('navbar-container');
            navbarContainer.innerHTML = renderNavbar(currentUser, currentRole);
            
            // Apply permissions and switch to role
            enforcePermissions();
            switchRole(role);
            
            showToast('✓ Sesión iniciada automáticamente.', { type: 'success', delay: 2000 });
        } else if (signUp.status === 'missing_requirements') {
            // Additional steps required (like email verification)
            showToast('Registro iniciado. Por favor verifica tu correo electrónico.', { type: 'info' });
            console.log('Verification required:', signUp.missingFields);
            
            // You might want to show a verification code input here
            // For now, we'll just inform the user
            showToast('Se ha enviado un código de verificación a tu correo.', { type: 'info', delay: 5000 });
        } else if (signUp.createdUserId) {
            // User created but may need verification
            showToast('✓ Usuario registrado. Revisa tu correo para verificar tu cuenta.', { type: 'success' });
            
            // Clear form
            document.getElementById('registration-form').reset();
            
            // Switch back to login form
            document.getElementById('registration-container').style.display = 'none';
            document.getElementById('login-section').style.display = 'block';
        } else {
            showToast('Registro en proceso. Estado: ' + signUp.status, { type: 'info' });
        }
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        // Parse Clerk error messages
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

// Setup form toggle between login and registration (moved outside init)
function setupFormToggle() {
    const loginSection = document.getElementById('login-section');
    const registrationContainer = document.getElementById('registration-container');
    const showRegistrationBtn = document.getElementById('show-registration');

    // Render registration form
    if (registrationContainer) {
        registrationContainer.innerHTML = renderRegistrationForm();
        registrationContainer.style.display = 'none';
    }

    // Attach event listener to registration form
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    // Setup password toggle for registration
    setupPasswordToggle('reg-password', 'toggle-reg-password', 'toggle-reg-password-icon');
    setupPasswordToggle('reg-confirm-password', 'toggle-reg-confirm-password', 'toggle-reg-confirm-password-icon');

    // Setup password match validation
    const regPassword = document.getElementById('reg-password');
    const regConfirmPassword = document.getElementById('reg-confirm-password');
    const passwordMatchMessage = document.getElementById('password-match-message');

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

    // Show registration button click
    if (showRegistrationBtn) {
        showRegistrationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginSection) loginSection.style.display = 'none';
            if (registrationContainer) registrationContainer.style.display = 'block';
        });
    }

    // Show login button click
    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (registrationContainer) registrationContainer.style.display = 'none';
            if (loginSection) loginSection.style.display = 'block';
        });
    }
}

// Helper function to setup password toggle
function setupPasswordToggle(inputId, buttonId, iconId) {
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

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Validation
    if (!email || !password || !role) {
        showToast('Por favor completa todos los campos.', { type: 'warning' });
        return;
    }

    // Check if there's already an active Clerk session
    if (clerkInstance && clerkInstance.session) {
        console.log('Ya existe una sesión activa en Clerk');
        
        // Get the stored role or use the selected one
        const storedRole = localStorage.getItem(`user_role_${email}`);
        
        currentUser = { email, name: email.split('@')[0] };
        currentRole = storedRole || role;
        
        // Continue with login UI updates
        const navbarContainer = document.getElementById('navbar-container');
        navbarContainer.innerHTML = renderNavbar(currentUser, currentRole);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-section').style.display = 'block';
        enforcePermissions();
        switchRole(currentRole);
        showToast('✓ Sesión activa detectada', { type: 'success' });
        return;
    }

    // Check if using demo mode
    if (useDemoMode || !clerkInstance) {
        // Demo mode with localStorage
        const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            showToast('Credenciales incorrectas. Si no tienes cuenta, regístrate primero.', { type: 'danger' });
            return;
        }
        
        if (user.role !== role) {
            showToast(`Este usuario está registrado como ${user.role === 'student' ? 'Estudiante' : user.role === 'teacher' ? 'Docente' : 'Directivo'}, no como ${role === 'student' ? 'Estudiante' : role === 'teacher' ? 'Docente' : 'Directivo'}.`, { type: 'danger' });
            return;
        }
        
        currentUser = { email, name: email.split('@')[0] };
        currentRole = role;
        
        // Continue with login UI updates
        const navbarContainer = document.getElementById('navbar-container');
        navbarContainer.innerHTML = renderNavbar(currentUser, currentRole);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-section').style.display = 'block';
        enforcePermissions();
        switchRole(role);
        showToast('✓ Sesión iniciada (modo demo)', { type: 'success' });
        return;
    }

    try {
        // Use Clerk's signIn method
        const signIn = await clerkInstance.client.signIn.create({
            identifier: email,
            password: password,
        });

        if (signIn.status === 'complete') {
            // Get the current session to access user data
            await clerkInstance.setActive({ session: signIn.createdSessionId });
            
            // Get user from Clerk
            const clerkUser = clerkInstance.user;
            
            // Try to get role from Clerk metadata first
            let storedRole = clerkUser?.publicMetadata?.role;
            
            // Fallback to localStorage if not in Clerk
            if (!storedRole) {
                storedRole = localStorage.getItem(`user_role_${email}`);
            }
            
            // If role is stored and doesn't match selected role, show error
            if (storedRole && storedRole !== role) {
                const roleNames = {
                    student: 'Estudiante',
                    teacher: 'Docente',
                    director: 'Directivo'
                };
                showToast(`Este usuario está registrado como ${roleNames[storedRole]}, no como ${roleNames[role]}.`, { type: 'danger' });
                await clerkInstance.signOut();
                return;
            }

            currentUser = { email, name: email.split('@')[0] };
            currentRole = storedRole || role;
            
            // If role wasn't stored, save it now
            if (!storedRole) {
                localStorage.setItem(`user_role_${email}`, role);
                
                // Try to update Clerk metadata
                try {
                    const response = await fetch('/api/update-user-metadata', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: clerkUser.id,
                            role: role
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        console.log('Role saved to Clerk during login:', data);
                    } else {
                        console.error('Failed to save role during login:', data);
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
        const errorMessage = error.errors?.[0]?.message || error.message || 'Credenciales inválidas';
        showToast('Error: ' + errorMessage, { type: 'danger' });
        return;
    }

    // Continue with login UI updates
    currentUser = { email, name: email.split('@')[0] };
    currentRole = role;

    // Re-render navbar after login
    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = renderNavbar(currentUser, currentRole);

    document.getElementById('login-section').style.display = 'none';

    const appSection = document.getElementById('app-section');
    if (appSection) {
        appSection.style.display = 'block';
    } else {
        console.error('El elemento con ID "app-section" no existe en el DOM.');
    }

    // IMPORTANT: apply permissions so tabs/sections are shown for this role
    enforcePermissions();

    // Then switchRole to set active classes and do any role-specific initialization
    switchRole(role);
    
    // Show success message
    showToast('✓ Sesión iniciada correctamente', { type: 'success' });
}

async function handleLogout(e) {
    e?.preventDefault();
    
    console.log('Logout initiated');
    
    // Sign out from Clerk if using Clerk
    if (clerkInstance && clerkInstance.session) {
        try {
            await clerkInstance.signOut();
            console.log('Signed out from Clerk successfully');
        } catch (err) {
            console.error('Error signing out from Clerk:', err);
        }
    }
    
    currentUser = null;
    currentRole = null;

    // Re-render navbar without user
    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = renderNavbar();

    // Show login section and hide app section
    const loginSection = document.getElementById('login-section');
    const appSection = document.getElementById('app-section');
    const registrationContainer = document.getElementById('registration-container');
    
    if (loginSection) {
        loginSection.style.display = 'block';
    }
    
    if (appSection) {
        appSection.style.display = 'none';
    }
    
    if (registrationContainer) {
        registrationContainer.style.display = 'none';
    }

    // Reset login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.reset();
    }

    // Hide all sections and forms on logout
    enforcePermissions();
    
    // Scroll to login
    if (loginSection) {
        loginSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showToast('Sesión cerrada correctamente', { type: 'info' });
}

window.addEventListener('DOMContentLoaded', () => {
    init();
    enforcePermissions();
    setupFormToggle();
});
