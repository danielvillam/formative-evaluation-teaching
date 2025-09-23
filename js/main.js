import { renderNavbar } from './components/navbar.js';
import { renderLoginSection } from './components/login.js';
import { renderTeacherSection, renderEvaluationItems } from './components/teacher.js';
import { renderStudentSection, populateTeachers, renderStudentEvaluationItems } from './components/student.js';
import { renderDirectorSection, updateDirectorChartAndTable } from './components/director.js';
import { evaluationItems, studentEvaluationItems } from './data.js';

let currentUser = null;
let currentRole = null;

// Render base layout
const navbarContainer = document.getElementById('navbar-container');
navbarContainer.innerHTML = renderNavbar();

const main = document.getElementById('main-container');

// Render login and sections
main.innerHTML = `
    ${renderLoginSection()}
    <div class="container mt-4" id="app-section" style="display: none;">
        <div class="d-flex mb-4" id="role-tabs">
            <div class="tab-button active" data-role="teacher">Docente</div>
            <div class="tab-button" data-role="student">Estudiante</div>
            <div class="tab-button" data-role="director">Directivo</div>
        </div>

        <div id="sections-container">
            ${renderTeacherSection()}
            ${renderStudentSection()}
            ${renderDirectorSection()}
        </div>
    </div>
`;

// ---- Permissions and utilities ----
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

    // clear forms on entry
    document.getElementById('self-evaluation-form')?.style && (document.getElementById('self-evaluation-form').style.display = 'none');
    document.getElementById('results-visualization')?.style && (document.getElementById('results-visualization').style.display = 'none');
    document.getElementById('student-evaluation-form')?.style && (document.getElementById('student-evaluation-form').style.display = 'none');
}

/**
 * Attempt to switch tabs. If it doesn't match the current role, block.
 */
function switchRole(role) {
    if (!currentRole) {
        alert('Debes iniciar sesión.');
        return;
    }
    if (role !== currentRole) {
        alert('No tienes permisos para ver este rol.');
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

// ---- Event Initialization ----
function init() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // tabs: now click will try to switch, but switchRole blocks based on permissions
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', () => switchRole(tab.dataset.role));
    });

    // ----------------- Teacher buttons (con guardas de rol) -----------------
    const startBtn = document.getElementById('start-self-eval');
    if (startBtn) startBtn.addEventListener('click', () => {
        if (!hasRole('teacher') && !hasRole('director')) return alert('No tienes permiso para iniciar una autoevaluación docente.');
        // hide the results section if it is visible
        const resultsVis = document.getElementById('results-visualization');
        if (resultsVis) resultsVis.style.display = 'none';

        // display the self-assessment form
        const form = document.getElementById('self-evaluation-form');
        if (form) {
            form.style.display = 'block';
            // render items every time it is opened
            renderEvaluationItems();
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // cancel evaluation
    const cancelEval = document.getElementById('cancel-eval');
    if (cancelEval) cancelEval.addEventListener('click', () => {
        const form = document.getElementById('self-evaluation-form');
        if (form) form.style.display = 'none';
    });

    // Toggle Show/Hide Password (Login)
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
            // keep focus on the input
            pwInput.focus();
        });
    }

    // view results: hide self-assessment form and show results (and render charts)
    const viewResultsBtn = document.getElementById('view-results');
    if (viewResultsBtn) viewResultsBtn.addEventListener('click', () => {
        if (!hasRole('teacher') && !hasRole('director')) return alert('No tienes permiso para ver los resultados.');
        // hide form if visible
        const form = document.getElementById('self-evaluation-form');
        if (form) form.style.display = 'none';

        // show results
        const resultsVis = document.getElementById('results-visualization');
        if (resultsVis) resultsVis.style.display = 'block';

        // graph generation (same steps as you already had) - with additional guards
        const categories = [...new Set(evaluationItems.map(item => item.category))];
        const categoryAverages = categories.map(category => evaluationItems.filter(i => i.category === category).length * 4.2);

        const resultsCanvas = document.getElementById('results-chart');
        if (resultsCanvas) {
            const resultsCtx = resultsCanvas.getContext('2d');
            if (resultsCtx) {
                // destroy if exists (avoid overlapping charts)
                if (window.resultsChart) window.resultsChart.destroy();
                window.resultsChart = new Chart(resultsCtx, {
                    type: 'bar',
                    data: { labels: categories, datasets: [{ label: 'Puntuación promedio por categoría', data: categoryAverages }] },
                    options: { scales: { y: { beginAtZero: true, max: 5 } } }
                });
            }
        }

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
                            { label: 'Autoevaluación', data: [4.5, 4.2, 4.0] },
                            { label: 'Evaluación estudiantil', data: [4.2, 3.8, 4.3] }
                        ]
                    },
                    options: { scales: { r: { beginAtZero: true, max: 5 } } }
                });
            }
        }

        // move view to results
        resultsVis.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // handle submission of the self-assessment form (teacher)
    const teacherEvalForm = document.getElementById('teacher-eval-form');
    if (teacherEvalForm) teacherEvalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!hasRole('teacher') && !hasRole('director')) return alert('No tienes permiso para enviar esta evaluación.');

        const scores = {};
        let valid = true;

        // For each item in evaluationItems (imported in main.js), we look for the selected radius
        evaluationItems.forEach(item => {
            const selector = `input[name="eval-${item.id}"]:checked`;
            const checked = document.querySelector(selector);
            if (!checked) {
                valid = false;
            } else {
                scores[item.id] = parseInt(checked.value, 10);
            }
        });

        if (!valid) return alert('Por favor, complete todas las evaluaciones');

        const reflection = document.getElementById('reflection').value;
        console.log('Evaluación enviada:', { scores, reflection });
        alert('¡Evaluación enviada con éxito!');

        // clear and hide views
        const formEl = document.getElementById('self-evaluation-form');
        if (formEl) formEl.style.display = 'none';
        const resultsVis = document.getElementById('results-visualization');
        if (resultsVis) resultsVis.style.display = 'none';

        // reset radios (optional)
        evaluationItems.forEach(item => {
            const radios = document.getElementsByName(`eval-${item.id}`);
            radios.forEach(r => r.checked = false);
        });
        // clear textarea
        const reflectionInput = document.getElementById('reflection');
        if (reflectionInput) reflectionInput.value = '';
    });

    // Student
    populateTeachers();
    const selectTeacher = document.getElementById('select-teacher');
    if (selectTeacher) {
        selectTeacher.addEventListener('change', function() {
            if (!hasRole('student') && !hasRole('director')) {
                // reset select if no permiso
                this.value = '';
                return alert('No tienes permiso para realizar evaluaciones estudiantiles.');
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
        if (!hasRole('student') && !hasRole('director')) return alert('No tienes permiso para enviar esta evaluación.');
        const scores = {};
        let valid = true;
        document.querySelectorAll('#student-evaluation-items .evaluation-score').forEach(select => {
            if (!select.value) valid = false;
            scores[select.dataset.id] = parseInt(select.value);
        });
        if (!valid) return alert('Por favor, complete todas las evaluaciones');
        const teacherId = document.getElementById('select-teacher').value;
        console.log('Evaluación estudiantil enviada:', { teacherId, scores });
        alert('¡Evaluación enviada con éxito! Su respuesta es anónima.');
        studentForm.reset();
        if (selectTeacher) selectTeacher.value = '';
        const formEl = document.getElementById('student-evaluation-form');
        if (formEl) formEl.style.display = 'none';
    });

    // Director controls
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
        if (!hasRole('director')) return alert('No tienes permiso para exportar reportes.');
        alert('Funcionalidad de exportación (marchar a backend)');
    });
    const detailedAnalysis = document.getElementById('detailed-analysis');
    if (detailedAnalysis) detailedAnalysis.addEventListener('click', () => {
        if (!hasRole('director')) return alert('No tienes permiso para ver análisis detallado.');
        alert('Funcionalidad de análisis detallado (marchar a backend)');
    });

    // small button header "open-plan"
    const openPlanBtn = document.getElementById('open-plan');
    if (openPlanBtn) openPlanBtn.addEventListener('click', () => {
        if (!hasRole('teacher') && !hasRole('director')) return alert('No tienes permiso para ver el plan.');
        // example: show modal or go to section. Here I show an alert and then you could open a modal.
        alert('Aquí se abriría el Plan de Mejora (implementa modal o navegación).');
    });

    // boton grande "improvement-plan" del body
    const improvementBtn = document.getElementById('improvement-plan');
    if (improvementBtn) improvementBtn.addEventListener('click', () => {
        if (!hasRole('teacher') && !hasRole('director')) return alert('No tienes permiso para crear un plan de mejora.');
        // example behavior: open a form/create a new section
        // For now, we show the form and hide other views:
        document.getElementById('self-evaluation-form')?.style && (document.getElementById('self-evaluation-form').style.display = 'none');
        document.getElementById('results-visualization')?.style && (document.getElementById('results-visualization').style.display = 'none');

        // TODO
        alert('Funcionalidad de creación de Plan (implementa formulario o modal).');
    });

}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    currentUser = { email, name: email.split('@')[0] };
    currentRole = role;

    // re-render navbar
    const navbarContainer = document.getElementById('navbar-container');
    navbarContainer.innerHTML = renderNavbar(currentUser, currentRole);

    // re-asignar evento logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    document.getElementById('login-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';

    // IMPORTANT: apply permissions so tabs/sections are shown for this role
    enforcePermissions();

    // then switchRole to set active classes and do any role-specific init
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

    // hide everything
    enforcePermissions();
}

window.addEventListener('DOMContentLoaded', () => {
    init();
    enforcePermissions();
});
