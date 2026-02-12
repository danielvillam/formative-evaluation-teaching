/**
 * Main Application Entry Point
 * Sistema de Evaluación Formativa Docente - UNAL
 */

// Import UI helpers
import { showToast, setupPasswordToggle } from './utils/ui-helpers.js';

// Import session management
import { checkClerkSession, enforcePermissions, hasRole } from './utils/session.js';

// Import validation
import { validateEvaluationForm } from './utils/validation.js';

// Import authentication handlers
import { handleLogin, handleLogout, setupFormToggle } from './handlers/auth.js';

// Import components
import { renderNavbar } from './components/navbar.js';
import { renderLoginSection } from './components/login.js';
import { renderTeacherSection, renderEvaluationItems, submitTeacherEvaluation, updateSelfEvaluationButton, getTeacherResults, processTeacherResults, exportTeacherResults, getImprovementPlans, renderImprovementPlans } from './components/teacher.js';
import { renderStudentSection, populateTeachers, renderStudentEvaluationItems, submitStudentEvaluation } from './components/student.js';
import { renderDirectorSection, loadDirectorData, updateDirectorDashboard, exportDirectorReport } from './components/director.js';
import { Clerk } from '@clerk/clerk-js';

// ============================================
// GLOBAL STATE
// ============================================
const appState = {
    currentUser: null,
    currentRole: null,
    clerkInstance: null
};

// Make showToast globally available for compatibility
window.showToast = showToast;

// ============================================
// CLERK INITIALIZATION
// ============================================
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) {
    console.error('VITE_CLERK_PUBLISHABLE_KEY is missing. Please configure it in .env file.');
} else {
    appState.clerkInstance = new Clerk(clerkPubKey);
    appState.clerkInstance.load().then(() => {
        console.info('Clerk initialized successfully');
    }).catch(err => {
        console.error('Failed to load Clerk:', err);
    });
}

// ============================================
// UI INITIALIZATION
// ============================================
const navbarContainer = document.getElementById('navbar-container');
navbarContainer.innerHTML = renderNavbar();

const main = document.getElementById('main-container');
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

// ============================================
// ROLE SWITCHING
// ============================================
async function switchRole(role) {
    if (!appState.currentRole) {
        showToast('Debes iniciar sesión.', { type: 'danger' });
        return;
    }
    if (role !== appState.currentRole) {
        showToast('No tienes permisos para ver este rol.', { type: 'danger' });
        enforcePermissions(appState);
        return;
    }

    document.querySelectorAll('.tab-button')
        .forEach(tab => tab.classList.toggle('active', tab.dataset.role === role));
    document.querySelectorAll('.role-section')
        .forEach(section => section.classList.toggle('active-section', section.id === `${role}-section`));

    document.getElementById('self-evaluation-form')?.style && (document.getElementById('self-evaluation-form').style.display = 'none');
    document.getElementById('results-visualization')?.style && (document.getElementById('results-visualization').style.display = 'none');

    if (role === 'teacher') {
        const teacherId = appState.currentUser?.primaryEmailAddress?.emailAddress || appState.currentUser?.email;
        if (teacherId) {
            updateSelfEvaluationButton(teacherId);
        }
    }

    if (role === 'student') {
        const userEmail = appState.currentUser?.primaryEmailAddress?.emailAddress || appState.currentUser?.email;
        if (userEmail) {
            populateTeachers(userEmail);
        }
    }

    if (role === 'director') {
        const loadingDiv = document.getElementById('director-loading');
        const contentDiv = document.getElementById('director-content');
        
        if (loadingDiv) loadingDiv.style.display = 'block';
        if (contentDiv) contentDiv.style.display = 'none';
        
        try {
            const stats = await loadDirectorData();
            updateDirectorDashboard(stats);
            window.directorStats = stats;
            
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (contentDiv) contentDiv.style.display = 'block';
        } catch (error) {
            console.error('Error loading director data:', error);
            showToast('Error al cargar las estadísticas del director.', { type: 'danger' });
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (contentDiv) contentDiv.style.display = 'block';
        }
    }
}

// ============================================
// EVENT HANDLERS INITIALIZATION
// ============================================
function initEventHandlers() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => handleLogin(e, appState.clerkInstance, appState, switchRole));
    }
    
    // Use event delegation for logout button
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        navbarContainer.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn')) {
                e.preventDefault();
                handleLogout(e, appState.clerkInstance, appState);
            }
        });
    }

    // Tab click handlers
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', () => switchRole(tab.dataset.role));
    });

    // Password toggle for login
    setupPasswordToggle('password', 'toggle-password', 'toggle-password-icon');

    // Teacher evaluation handlers
    setupTeacherHandlers();
    
    // Student evaluation handlers
    setupStudentHandlers();
    
    // Director handlers
    setupDirectorHandlers();
}

// ============================================
// TEACHER EVENT HANDLERS
// ============================================
function setupTeacherHandlers() {
    const startBtn = document.getElementById('start-self-eval');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!hasRole('teacher', appState) && !hasRole('director', appState)) {
                return showToast('No tienes permiso para iniciar una autoevaluación docente.', { type: 'danger' });
            }
            
            const resultsVis = document.getElementById('results-visualization');
            if (resultsVis) resultsVis.style.display = 'none';

            const form = document.getElementById('self-evaluation-form');
            if (form) {
                form.style.display = 'block';
                renderEvaluationItems();
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    const cancelEval = document.getElementById('cancel-eval');
    if (cancelEval) {
        cancelEval.addEventListener('click', () => {
            const form = document.getElementById('self-evaluation-form');
            if (form) form.style.display = 'none';
            showToast('Autoevaluación cancelada.', { type: 'secondary', delay: 2000 });
        });
    }

    const viewResultsBtn = document.getElementById('view-results');
    if (viewResultsBtn) {
        viewResultsBtn.addEventListener('click', async () => {
            if (!hasRole('teacher', appState) && !hasRole('director', appState)) {
                return showToast('No tienes permiso para ver los resultados.', { type: 'danger' });
            }
            
            const teacherId = appState.currentUser?.primaryEmailAddress?.emailAddress || appState.currentUser?.email;
            if (!teacherId) {
                showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
                return;
            }

            const form = document.getElementById('self-evaluation-form');
            if (form) form.style.display = 'none';

            const resultsVis = document.getElementById('results-visualization');
            if (resultsVis) resultsVis.style.display = 'block';

            await loadTeacherResults(teacherId);
        });
    }

    const teacherEvalForm = document.getElementById('teacher-eval-form');
    if (teacherEvalForm) {
        teacherEvalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!hasRole('teacher', appState) && !hasRole('director', appState)) {
                return showToast('No tienes permiso para enviar esta evaluación.', { type: 'danger' });
            }

            const validation = validateEvaluationForm(teacherEvalForm, window.evaluationItems);
            if (!validation.valid) {
                showToast('Por favor, responda todas las preguntas antes de enviar la evaluación.', { type: 'warning' });
                return;
            }

            const scores = {};
            window.evaluationItems.forEach(item => {
                const checked = teacherEvalForm.querySelector(`input[name='eval-${item.id}']:checked`);
                scores[item.id] = checked ? parseInt(checked.value, 10) : null;
            });

            const userEmail = appState.currentUser?.primaryEmailAddress?.emailAddress || appState.currentUser?.email || 'anonimo';
            const teacherId = userEmail;
            const userRole = appState.currentRole || 'teacher';

            try {
                await submitTeacherEvaluation(teacherId, { scores }, userEmail, userRole);
                showToast('¡Evaluación enviada con éxito!', { type: 'success' });
                
                await updateSelfEvaluationButton(teacherId);
                
                const formEl = document.getElementById('self-evaluation-form');
                if (formEl) formEl.style.display = 'none';
                const resultsVis = document.getElementById('results-visualization');
                if (resultsVis) resultsVis.style.display = 'none';

                window.evaluationItems.forEach(item => {
                    const radios = document.getElementsByName(`eval-${item.id}`);
                    radios.forEach(r => r.checked = false);
                });
            } catch (error) {
                console.error('Error al enviar evaluación:', error);
                showToast('Error al enviar la evaluación. Por favor, intente nuevamente.', { type: 'danger' });
            }
        });
    }

    setupTeacherResultsHandlers();
    setupImprovementPlanHandlers();
}

// ============================================
// TEACHER RESULTS HANDLERS
// ============================================
function setupTeacherResultsHandlers() {
    const closeResultsBtn = document.getElementById('close-results');
    if (closeResultsBtn) {
        closeResultsBtn.addEventListener('click', () => {
            const resultsSection = document.getElementById('results-visualization');
            if (resultsSection) resultsSection.style.display = 'none';
            showToast('Visualización cerrada.', { type: 'secondary', delay: 2000 });
        });
    }

    const refreshResultsBtn = document.getElementById('refresh-results');
    if (refreshResultsBtn) {
        refreshResultsBtn.addEventListener('click', async () => {
            if (!hasRole('teacher', appState) && !hasRole('director', appState)) {
                return showToast('No tienes permiso para actualizar resultados.', { type: 'danger' });
            }

            const teacherId = appState.currentUser?.primaryEmailAddress?.emailAddress || appState.currentUser?.email;
            if (!teacherId) {
                showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
                return;
            }

            showToast('Actualizando resultados...', { type: 'info', delay: 1500 });
            await loadTeacherResults(teacherId);
            showToast('Resultados actualizados correctamente.', { type: 'success' });
        });
    }

    const exportTeacherResultsBtn = document.getElementById('export-teacher-results');
    if (exportTeacherResultsBtn) {
        exportTeacherResultsBtn.addEventListener('click', async () => {
            if (!hasRole('teacher', appState) && !hasRole('director', appState)) {
                return showToast('No tienes permiso para exportar resultados.', { type: 'danger' });
            }

            const teacherId = appState.currentUser?.primaryEmailAddress?.emailAddress || appState.currentUser?.email;
            const teacherName = appState.currentUser?.fullName || appState.currentUser?.firstName || teacherId.split('@')[0];

            if (!teacherId) {
                showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
                return;
            }

            try {
                let teacherQuestions = window.evaluationItems;
                if (!teacherQuestions) {
                    const response = await fetch('/api/questions?type=teacher');
                    teacherQuestions = await response.json();
                    window.evaluationItems = teacherQuestions;
                }

                let studentQuestions = window.studentEvaluationItems;
                if (!studentQuestions) {
                    const response = await fetch('/api/questions?type=student');
                    studentQuestions = await response.json();
                    window.studentEvaluationItems = studentQuestions;
                }

                const resultsData = await getTeacherResults(teacherId);
                const processedData = processTeacherResults(resultsData);

                if (!processedData || !processedData.hasData) {
                    showToast('No hay datos para exportar.', { type: 'warning' });
                    return;
                }

                exportTeacherResults(teacherName, processedData, teacherQuestions, studentQuestions);
                showToast('Resultados exportados correctamente.', { type: 'success' });
            } catch (error) {
                console.error('Error exporting results:', error);
                showToast('Error al exportar resultados.', { type: 'danger' });
            }
        });
    }
}

// ============================================
// LOAD TEACHER RESULTS
// ============================================
async function loadTeacherResults(teacherId) {
    let teacherQuestions = window.evaluationItems;
    if (!teacherQuestions) {
        const response = await fetch('/api/questions?type=teacher');
        teacherQuestions = await response.json();
        window.evaluationItems = teacherQuestions;
    }

    let studentQuestions = window.studentEvaluationItems;
    if (!studentQuestions) {
        const response = await fetch('/api/questions?type=student');
        studentQuestions = await response.json();
        window.studentEvaluationItems = studentQuestions;
    }

    const resultsData = await getTeacherResults(teacherId);
    
    if (!resultsData || !resultsData.hasData) {
        const summaryDiv = document.getElementById('results-summary');
        if (summaryDiv) {
            summaryDiv.innerHTML = `
                <div class="alert alert-info" role="alert">
                    <h5 class="alert-heading"><i class="bi bi-info-circle me-2"></i>No hay datos disponibles</h5>
                    <p class="mb-0">Aún no se han recopilado suficientes datos para generar resultados.</p>
                </div>
            `;
        }
        
        if (window.resultsChart) window.resultsChart.destroy();
        if (window.comparisonChart) window.comparisonChart.destroy();
        document.getElementById('self-eval-table-container').style.display = 'none';
        document.getElementById('student-eval-table-container').style.display = 'none';
        
        return;
    }

    const processedData = processTeacherResults(resultsData);
    
    if (!processedData || !processedData.hasData) {
        showToast('No hay datos suficientes para generar resultados.', { type: 'warning' });
        return;
    }

    // Update UI with results (tables, charts, summary)
    updateResultsTables(processedData, teacherQuestions, studentQuestions);
    updateResultsCharts(processedData);
    updateResultsSummary(processedData);

    const plansData = await getImprovementPlans(teacherId);
    if (plansData) {
        renderImprovementPlans(plansData);
    }

    const resultsVis = document.getElementById('results-visualization');
    resultsVis.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Helper functions for updating results UI
function updateResultsTables(processedData, teacherQuestions, studentQuestions) {
    const selfEvalTableBody = document.getElementById('self-eval-table-body');
    const selfEvalContainer = document.getElementById('self-eval-table-container');
    if (selfEvalTableBody && processedData.hasSelfEvaluation) {
        selfEvalContainer.style.display = 'block';
        selfEvalTableBody.innerHTML = '';
        teacherQuestions.forEach((item, idx) => {
            const questionId = item.id || (idx + 1);
            const selfScore = processedData.selfScores.find(s => s.questionId === questionId);
            if (selfScore && selfScore.score > 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.question || item.text}</td>
                    <td class="text-center"><span class="badge bg-primary">${selfScore.score}</span></td>
                `;
                selfEvalTableBody.appendChild(tr);
            }
        });
    } else if (selfEvalContainer) {
        selfEvalContainer.style.display = 'none';
    }

    const studentEvalTableBody = document.getElementById('student-eval-table-body');
    const studentEvalContainer = document.getElementById('student-eval-table-container');
    if (studentEvalTableBody && processedData.hasStudentEvaluations) {
        studentEvalContainer.style.display = 'block';
        studentEvalTableBody.innerHTML = '';
        studentQuestions.forEach((item, idx) => {
            const questionId = (idx + 1);
            const studentScore = processedData.studentScores.find(s => s.questionId === questionId);
            if (studentScore && studentScore.score > 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.question || item.text}</td>
                    <td class="text-center"><span class="badge bg-warning text-dark">${studentScore.score.toFixed(1)}</span></td>
                `;
                studentEvalTableBody.appendChild(tr);
            }
        });
    } else if (studentEvalContainer) {
        studentEvalContainer.style.display = 'none';
    }
}

function updateResultsCharts(processedData) {
    const selfAverage = processedData.hasSelfEvaluation ?
        processedData.selfScores.reduce((sum, s) => sum + s.score, 0) / processedData.selfScores.length : 0;
    
    const studentAverage = processedData.hasStudentEvaluations ?
        processedData.studentScores.reduce((sum, s) => sum + s.score, 0) / processedData.studentScores.length : 0;

    const resultsCanvas = document.getElementById('results-chart');
    if (resultsCanvas) {
        const resultsCtx = resultsCanvas.getContext('2d');
        if (resultsCtx) {
            if (window.resultsChart) window.resultsChart.destroy();
            window.resultsChart = new Chart(resultsCtx, {
                type: 'bar',
                data: {
                    labels: ['Promedio General'],
                    datasets: [
                        { 
                            label: 'Autoevaluación', 
                            data: [selfAverage.toFixed(2)], 
                            backgroundColor: '#466B3F',
                            hidden: !processedData.hasSelfEvaluation
                        },
                        { 
                            label: `Estudiantes (${processedData.studentCount})`, 
                            data: [studentAverage.toFixed(2)], 
                            backgroundColor: '#94B43B',
                            hidden: !processedData.hasStudentEvaluations
                        }
                    ]
                },
                options: { 
                    scales: { y: { beginAtZero: true, max: 5 } },
                    plugins: {
                        title: { display: true, text: 'Promedio General de Evaluaciones' }
                    }
                }
            });
        }
    }

    const comparisonCanvas = document.getElementById('comparison-chart');
    if (comparisonCanvas) {
        const comparisonCtx = comparisonCanvas.getContext('2d');
        if (comparisonCtx) {
            if (window.comparisonChart) window.comparisonChart.destroy();
            
            const scoreRanges = ['1-2', '2-3', '3-4', '4-5'];
            const selfDistribution = [0, 0, 0, 0];
            const studentDistribution = [0, 0, 0, 0];
            
            processedData.selfScores.forEach(s => {
                if (s.score <= 2) selfDistribution[0]++;
                else if (s.score <= 3) selfDistribution[1]++;
                else if (s.score <= 4) selfDistribution[2]++;
                else selfDistribution[3]++;
            });
            
            processedData.studentScores.forEach(s => {
                if (s.score <= 2) studentDistribution[0]++;
                else if (s.score <= 3) studentDistribution[1]++;
                else if (s.score <= 4) studentDistribution[2]++;
                else studentDistribution[3]++;
            });
            
            window.comparisonChart = new Chart(comparisonCtx, {
                type: 'radar',
                data: {
                    labels: scoreRanges,
                    datasets: [
                        { 
                            label: 'Autoevaluación', 
                            data: selfDistribution, 
                            backgroundColor: 'rgba(70,107,63,0.2)', 
                            borderColor: '#466B3F', 
                            pointBackgroundColor: '#466B3F',
                            hidden: !processedData.hasSelfEvaluation
                        },
                        { 
                            label: `Estudiantes (${processedData.studentCount})`, 
                            data: studentDistribution, 
                            backgroundColor: 'rgba(148,180,59,0.2)', 
                            borderColor: '#94B43B', 
                            pointBackgroundColor: '#94B43B',
                            hidden: !processedData.hasStudentEvaluations
                        }
                    ]
                },
                options: { 
                    scales: { r: { beginAtZero: true } },
                    plugins: {
                        title: { display: true, text: 'Distribución de Puntuaciones' }
                    }
                }
            });
        }
    }
}

function updateResultsSummary(processedData) {
    const selfAverage = processedData.hasSelfEvaluation ?
        processedData.selfScores.reduce((sum, s) => sum + s.score, 0) / processedData.selfScores.length : 0;
    
    const studentAverage = processedData.hasStudentEvaluations ?
        processedData.studentScores.reduce((sum, s) => sum + s.score, 0) / processedData.studentScores.length : 0;

    const summaryDiv = document.getElementById('results-summary');
    if (summaryDiv) {
        let html = `<div class="mb-3"><strong>Evaluaciones recibidas:</strong> `;
        if (processedData.hasSelfEvaluation) html += `Autoevaluación completada. `;
        if (processedData.hasStudentEvaluations) html += `${processedData.studentCount} evaluación(es) de estudiantes.`;
        html += `</div>`;
        
        if (processedData.hasSelfEvaluation && processedData.hasStudentEvaluations) {
            const difference = selfAverage - studentAverage;
            if (Math.abs(difference) >= 0.3) {
                if (difference > 0) {
                    html += `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i><strong>Nota:</strong> Tu autoevaluación es ${difference.toFixed(2)} puntos más alta que la percepción estudiantil.</div>`;
                } else {
                    html += `<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i><strong>Excelente:</strong> Los estudiantes valoran tu desempeño ${Math.abs(difference).toFixed(2)} puntos más alto.</div>`;
                }
            }
        }
        
        summaryDiv.innerHTML = html;
    }
}

// ============================================
// IMPROVEMENT PLAN HANDLERS
// ============================================
function setupImprovementPlanHandlers() {
    const improvementBtn = document.getElementById('improvement-plan');
    if (improvementBtn) {
        improvementBtn.addEventListener('click', () => {
            if (!hasRole('teacher', appState) && !hasRole('director', appState)) {
                return showToast('No tienes permiso para crear un plan de mejora.', { type: 'danger' });
            }
            document.getElementById('self-evaluation-form')?.style && (document.getElementById('self-evaluation-form').style.display = 'none');
            document.getElementById('results-visualization')?.style && (document.getElementById('results-visualization').style.display = 'none');
            
            const modalEl = document.getElementById('improvementPlanModal');
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            }
        });
    }

    const planForm = document.getElementById('improvement-plan-form');
    if (planForm) {
        planForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const goal = planForm.goal.value.trim();
            const actions = planForm.actions.value.trim();
            const indicators = planForm.indicators.value.trim();
            const deadline = planForm.deadline.value;
            
            if (!goal || !actions || !indicators || !deadline) {
                showToast('Por favor complete todos los campos.', { type: 'warning' });
                return;
            }

            const teacherId = appState.currentUser?.primaryEmailAddress?.emailAddress || appState.currentUser?.email;
            const userEmail = teacherId;

            if (!teacherId) {
                showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
                return;
            }

            try {
                const response = await fetch('/api/improvement-plans', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teacherId, userEmail, goal, actions, indicators, deadline })
                });

                if (!response.ok) {
                    const errorDetails = await response.json();
                    throw new Error(`Error del servidor: ${errorDetails.message || 'Error desconocido'}`);
                }

                showToast('¡Plan de mejora guardado exitosamente!', { type: 'success' });
                
                const resultsVis = document.getElementById('results-visualization');
                if (resultsVis && resultsVis.style.display !== 'none') {
                    const plansData = await getImprovementPlans(teacherId);
                    if (plansData) {
                        renderImprovementPlans(plansData);
                    }
                }
                
                const modalEl = document.getElementById('improvementPlanModal');
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                }
                planForm.reset();
            } catch (error) {
                console.error('Error al guardar el plan de mejora:', error);
                showToast('Error al guardar el plan de mejora. Por favor, intente nuevamente.', { type: 'danger' });
            }
        });
    }
}

// ============================================
// STUDENT EVENT HANDLERS
// ============================================
function setupStudentHandlers() {
    const selectTeacher = document.getElementById('select-teacher');
    if (selectTeacher) {
        selectTeacher.addEventListener('change', function() {
            if (!hasRole('student', appState) && !hasRole('director', appState)) {
                this.value = '';
                return showToast('No tienes permiso para realizar evaluaciones estudiantiles.', { type: 'danger' });
            }
            if (this.value) {
                const selectedOption = this.options[this.selectedIndex];
                if (selectedOption && selectedOption.dataset.evaluated === 'true') {
                    this.value = '';
                    showToast('Ya has evaluado a este docente.', { type: 'warning' });
                    const form = document.getElementById('student-evaluation-form');
                    if (form) form.style.display = 'none';
                    return;
                }
                
                const form = document.getElementById('student-evaluation-form');
                if (form) form.style.display = 'block';
                renderStudentEvaluationItems();
            } else {
                const form = document.getElementById('student-evaluation-form');
                if (form) form.style.display = 'none';
            }
        });
    }

    const cancelStudentEvalBtn = document.getElementById('cancel-student-eval');
    if (cancelStudentEvalBtn) {
        cancelStudentEvalBtn.addEventListener('click', function() {
            const selectTeacher = document.getElementById('select-teacher');
            const studentForm = document.getElementById('student-eval-form');
            const formEl = document.getElementById('student-evaluation-form');
            
            if (selectTeacher) selectTeacher.value = '';
            if (studentForm) studentForm.reset();
            if (formEl) formEl.style.display = 'none';
            if (studentForm) studentForm.querySelectorAll('.eval-error-msg').forEach(e => e.remove());
            
            showToast('Evaluación cancelada.', { type: 'secondary', delay: 2000 });
        });
    }

    const studentForm = document.getElementById('student-eval-form');
    if (studentForm) {
        studentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!hasRole('student', appState) && !hasRole('director', appState)) {
                return showToast('No tienes permiso para enviar esta evaluación.', { type: 'danger' });
            }

            const items = window.studentEvaluationItems;
            const validation = validateEvaluationForm(studentForm,  items);
            
            if (!validation.valid) {
                showToast('Por favor, responda todas las preguntas antes de enviar la evaluación.', { type: 'warning' });
                return;
            }

            const scores = {};
            items.forEach((item, index) => {
                const checked = studentForm.querySelector(`input[name='eval-student-${index + 1}']:checked`);
                scores[index + 1] = checked ? parseInt(checked.value, 10) : null;
            });

            const teacherId = document.getElementById('select-teacher').value;
            const userEmail = appState.currentUser?.email || 'anonimo';
            const userRole = appState.currentRole || 'student';

            try {
                await submitStudentEvaluation(teacherId, scores, userEmail, userRole);
                
                showToast('¡Evaluación enviada con éxito! Su respuesta es anónima.', { type: 'success' });
                studentForm.reset();
                const selectTeacher = document.getElementById('select-teacher');
                if (selectTeacher) selectTeacher.value = '';
                const formEl = document.getElementById('student-evaluation-form');
                if (formEl) formEl.style.display = 'none';
                
                const studentEmail = appState.currentUser?.primaryEmailAddress?.emailAddress || appState.currentUser?.email;
                if (studentEmail) {
                    populateTeachers(studentEmail);
                }
            } catch (error) {
                console.error('Error al enviar evaluación:', error);
                showToast('Error al enviar la evaluación. Por favor, intente nuevamente.', { type: 'danger' });
            }
        });
    }
}

// ============================================
// DIRECTOR EVENT HANDLERS
// ============================================
function setupDirectorHandlers() {
    const refreshDirectorBtn = document.getElementById('refresh-director-data');
    if (refreshDirectorBtn) {
        refreshDirectorBtn.addEventListener('click', async () => {
            if (!hasRole('director', appState)) {
                return showToast('No tienes permiso para actualizar datos.', { type: 'danger' });
            }
            
            const loadingDiv = document.getElementById('director-loading');
            const contentDiv = document.getElementById('director-content');
            
            if (loadingDiv) loadingDiv.style.display = 'block';
            if (contentDiv) contentDiv.style.display = 'none';
            
            try {
                const stats = await loadDirectorData();
                updateDirectorDashboard(stats);
                window.directorStats = stats;
                showToast('Datos actualizados correctamente.', { type: 'success' });
            } catch (error) {
                console.error('Error refreshing director data:', error);
                showToast('Error al actualizar datos.', { type: 'danger' });
            } finally {
                if (loadingDiv) loadingDiv.style.display = 'none';
                if (contentDiv) contentDiv.style.display = 'block';
            }
        });
    }

    const exportBtn = document.getElementById('export-report');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (!hasRole('director', appState)) {
                return showToast('No tienes permiso para exportar reportes.', { type: 'danger' });
            }
            
            if (window.directorStats) {
                exportDirectorReport(window.directorStats);
                showToast('Reporte exportado correctamente.', { type: 'success' });
            } else {
                showToast('No hay datos para exportar. Primero carga las estadísticas.', { type: 'warning' });
            }
        });
    }

    const exportSummaryBtn = document.getElementById('export-summary');
    if (exportSummaryBtn) {
        exportSummaryBtn.addEventListener('click', () => {
            if (!hasRole('director', appState)) {
                return showToast('No tienes permiso para exportar resumen.', { type: 'danger' });
            }
            
            if (window.directorStats) {
                exportDirectorReport(window.directorStats);
                showToast('Resumen exportado correctamente.', { type: 'success' });
            } else {
                showToast('No hay datos para exportar.', { type: 'warning' });
            }
        });
    }
}

// ============================================
// APPLICATION INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
    // Check for active Clerk session first
    const sessionRestored = await checkClerkSession(appState.clerkInstance, appState);
    
    // Initialize event handlers
    initEventHandlers();
    
    // Only enforce permissions if session wasn't restored
    if (!sessionRestored) {
        enforcePermissions(appState);
    } else {
        // If session was restored, switch to the appropriate role
        switchRole(appState.currentRole);
    }
    
    // Setup form toggle between login and registration
    setupFormToggle(appState.clerkInstance, appState, switchRole);
    
    // Check if there's a logout message to show
    if (sessionStorage.getItem('logoutMessage')) {
        sessionStorage.removeItem('logoutMessage');
        setTimeout(() => {
            showToast('✓ Sesión cerrada correctamente', { type: 'info', delay: 3000 });
        }, 100);
    }
});
