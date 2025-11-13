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
import { renderTeacherSection, renderEvaluationItems } from './components/teacher.js';
import { renderStudentSection, populateTeachers, renderStudentEvaluationItems } from './components/student.js';
import { renderDirectorSection, updateDirectorChartAndTable } from './components/director.js';
import { evaluationItems, studentEvaluationItems } from './data.js';

let currentUser = null;
let currentRole = null;

// Render the navigation bar
const navbarContainer = document.getElementById('navbar-container');
navbarContainer.innerHTML = renderNavbar();

const main = document.getElementById('main-container');

// Render login and main app sections
main.innerHTML = `
    ${renderLoginSection()}
    <div class="container mt-4" id="app-section" style="display: none;">
        <div class="d-flex mb-4" id="role-tabs">
            <div class="tab-button active" data-role="Docente">Docente</div>
            <div class="tab-button" data-role="Estudiante">Estudiante</div>
            <div class="tab-button" data-role="Directivo">Directivo</div>
        </div>

        <div id="sections-container">
            ${renderTeacherSection()}
            ${renderStudentSection()}
            ${renderDirectorSection()}
        </div>
    </div>
`;

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
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

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
        }
    });

    // Cancel teacher self-evaluation
    const cancelEval = document.getElementById('cancel-eval');
    if (cancelEval) cancelEval.addEventListener('click', () => {
        const form = document.getElementById('self-evaluation-form');
        if (form) form.style.display = 'none';
        showToast('Autoevaluación cancelada.', { type: 'secondary', delay: 2000 });
    });

    // Toggle show/hide password in login form
    const pwToggle = document.getElementById('toggle-password');
    if (pwToggle) {
        pwToggle.addEventListener('click', () => {
            const pwInput = document.getElementById('password');
            const icon = document.getElementById('toggle-password-icon');
            if (!pwInput) return;
            const isPassword = pwInput.type === 'password';
            pwInput.type = isPassword ? 'text' : 'password';
            pwToggle.setAttribute('aria-pressed', String(isPassword));
            pwToggle.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
            if (icon) {
                icon.classList.toggle('bi-eye', !isPassword);
                icon.classList.toggle('bi-eye-slash', isPassword);
            }
            // Keep focus on the password input
            pwInput.focus();
        });
    }

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
        items.forEach(item => {
            const checked = studentForm.querySelector(`input[name='eval-${item.id}']:checked`);
            scores[item.id] = checked ? parseInt(checked.value, 10) : null;
        });
        const teacherId = document.getElementById('select-teacher').value;
        console.log('Evaluación estudiantil enviada:', { teacherId, scores });
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

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    currentUser = { email, name: email.split('@')[0] };
    currentRole = role;

    // Re-render navbar after login
    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = renderNavbar(currentUser, currentRole);

    // Re-assign logout event after login
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';

    // IMPORTANT: apply permissions so tabs/sections are shown for this role
    enforcePermissions();

    // Then switchRole to set active classes and do any role-specific initialization
    switchRole(role);
}

function handleLogout(e) {
    e?.preventDefault();
    currentUser = null;
    currentRole = null;

    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = renderNavbar();

    document.getElementById('login-section').style.display = 'block';
    document.getElementById('app-section').style.display = 'none';
    document.getElementById('login-form').reset();

    // Hide all sections and forms on logout
    enforcePermissions();
}

window.addEventListener('DOMContentLoaded', () => {
    init();
    enforcePermissions();
});
