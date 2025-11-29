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
import { renderNavbar } from './components/navbar.js';
import { renderLoginSection } from './components/login.js';
import { renderRegistrationForm } from './components/registration.js';
import { renderTeacherSection, renderEvaluationItems, submitTeacherEvaluation, updateSelfEvaluationButton, getTeacherResults, processTeacherResults, exportTeacherResults, getImprovementPlans, renderImprovementPlans } from './components/teacher.js';
import { renderStudentSection, populateTeachers, renderStudentEvaluationItems, submitStudentEvaluation } from './components/student.js';
import { renderDirectorSection, loadDirectorData, updateDirectorDashboard, exportDirectorReport } from './components/director.js';
import { Clerk } from '@clerk/clerk-js';

let currentUser = null;
let currentRole = null;
let clerkInstance = null;

// Initialize Clerk
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) {
    console.error('VITE_CLERK_PUBLISHABLE_KEY is missing. Please configure it in .env file.');
} else {
    clerkInstance = new Clerk(clerkPubKey);
    clerkInstance.load().then(() => {
        console.info('Clerk initialized successfully');
    }).catch(err => {
        console.error('Failed to load Clerk:', err);
    });
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
async function switchRole(role) {
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

    if (role === 'teacher') {
        // Check if teacher has already completed self-evaluation
        const teacherId = currentUser?.primaryEmailAddress?.emailAddress || currentUser?.email;
        if (teacherId) {
            updateSelfEvaluationButton(teacherId);
        }
    }

    if (role === 'student') {
        // Load teachers with evaluated status for current student
        const userEmail = currentUser?.primaryEmailAddress?.emailAddress || currentUser?.email;
        if (userEmail) {
            populateTeachers(userEmail);
        }
    }

    if (role === 'director') {
        // Load real data from database
        const loadingDiv = document.getElementById('director-loading');
        const contentDiv = document.getElementById('director-content');
        
        if (loadingDiv) loadingDiv.style.display = 'block';
        if (contentDiv) contentDiv.style.display = 'none';
        
        try {
            const stats = await loadDirectorData();
            updateDirectorDashboard(stats);
            
            // Store stats for export functionality
            window.directorStats = stats;
            
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (contentDiv) contentDiv.style.display = 'block';
        } catch (error) {
            console.error('Error loading director data:', error);
            if (typeof showToast === 'function') {
                showToast('Error al cargar las estadísticas del director.', { type: 'danger' });
            }
            if (loadingDiv) loadingDiv.style.display = 'none';
            if (contentDiv) contentDiv.style.display = 'block';
        }
    }
}

// ---- Auto Session Restoration ----
async function checkClerkSession() {
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
            currentUser = { 
                email, 
                name: user.firstName || user.username || email.split('@')[0],
                primaryEmailAddress: { emailAddress: email }
            };
            currentRole = role;
            
            // Update UI
            const navbarContainer = document.getElementById('navbar-container');
            navbarContainer.innerHTML = renderNavbar(currentUser, currentRole);
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('app-section').style.display = 'block';
            enforcePermissions();
            switchRole(currentRole);
            
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
    if (viewResultsBtn) viewResultsBtn.addEventListener('click', async () => {
        if (!hasRole('teacher') && !hasRole('director')) return showToast('No tienes permiso para ver los resultados.', { type: 'danger' });
        
        // Get teacher ID
        const teacherId = currentUser?.primaryEmailAddress?.emailAddress || currentUser?.email;
        if (!teacherId) {
            showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
            return;
        }

        // Hide self-assessment form if visible
        const form = document.getElementById('self-evaluation-form');
        if (form) form.style.display = 'none';

        // Show results section
        const resultsVis = document.getElementById('results-visualization');
        if (resultsVis) resultsVis.style.display = 'block';

        // Load teacher questions if not already loaded
        let teacherQuestions = window.evaluationItems;
        if (!teacherQuestions) {
            const response = await fetch('/api/getTeacherQuestions');
            teacherQuestions = await response.json();
            window.evaluationItems = teacherQuestions;
        }

        // Load student questions
        let studentQuestions = window.studentEvaluationItems;
        if (!studentQuestions) {
            const response = await fetch('/api/getStudentQuestions');
            studentQuestions = await response.json();
            window.studentEvaluationItems = studentQuestions;
        }

        // Fetch real data from database
        const resultsData = await getTeacherResults(teacherId);
        
        if (!resultsData || !resultsData.hasData) {
            // No data available - show message
            const summaryDiv = document.getElementById('results-summary');
            if (summaryDiv) {
                summaryDiv.innerHTML = `
                    <div class="alert alert-info" role="alert">
                        <h5 class="alert-heading"><i class="bi bi-info-circle me-2"></i>No hay datos disponibles</h5>
                        <p class="mb-0">Aún no se han recopilado suficientes datos para generar resultados.</p>
                        <hr>
                        <p class="mb-0 small">
                            ${!resultsData?.selfEvaluation ? '• Completa tu autoevaluación<br>' : ''}
                            ${(!resultsData?.studentEvaluations || resultsData.studentEvaluations.length === 0) ? '• Espera a que los estudiantes completen sus evaluaciones' : ''}
                        </p>
                    </div>
                `;
            }
            
            // Clear charts and tables
            if (window.resultsChart) window.resultsChart.destroy();
            if (window.comparisonChart) window.comparisonChart.destroy();
            document.getElementById('self-eval-table-container').style.display = 'none';
            document.getElementById('student-eval-table-container').style.display = 'none';
            
            return;
        }

        // Process the data
        const processedData = processTeacherResults(resultsData);
        
        if (!processedData || !processedData.hasData) {
            showToast('No hay datos suficientes para generar resultados.', { type: 'warning' });
            return;
        }

        // Fill Self-Evaluation Table
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

        // Fill Student Evaluations Table
        const studentEvalTableBody = document.getElementById('student-eval-table-body');
        const studentEvalContainer = document.getElementById('student-eval-table-container');
        if (studentEvalTableBody && processedData.hasStudentEvaluations) {
            studentEvalContainer.style.display = 'block';
            studentEvalTableBody.innerHTML = '';
            studentQuestions.forEach((item, idx) => {
                const questionId = (idx + 1); // Student questions use index-based IDs
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

        // Calculate overall averages for charts
        const selfAverage = processedData.hasSelfEvaluation ?
            processedData.selfScores.reduce((sum, s) => sum + s.score, 0) / processedData.selfScores.length : 0;
        
        const studentAverage = processedData.hasStudentEvaluations ?
            processedData.studentScores.reduce((sum, s) => sum + s.score, 0) / processedData.studentScores.length : 0;

        // Bar chart - Overall averages comparison
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
                            title: {
                                display: true,
                                text: 'Promedio General de Evaluaciones'
                            }
                        }
                    }
                });
            }
        }

        // Radar chart - Comparison by available data
        const comparisonCanvas = document.getElementById('comparison-chart');
        if (comparisonCanvas) {
            const comparisonCtx = comparisonCanvas.getContext('2d');
            if (comparisonCtx) {
                if (window.comparisonChart) window.comparisonChart.destroy();
                
                // Show distribution of scores
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
                            title: {
                                display: true,
                                text: 'Distribución de Puntuaciones'
                            }
                        }
                    }
                });
            }
        }

        // Text summary
        const summaryDiv = document.getElementById('results-summary');
        if (summaryDiv) {
            let html = `<div class="mb-3"><strong>Evaluaciones recibidas:</strong> `;
            if (processedData.hasSelfEvaluation) html += `Autoevaluación completada (${processedData.selfScores.length} preguntas). `;
            if (processedData.hasStudentEvaluations) html += `${processedData.studentCount} evaluación(es) de estudiantes (${processedData.studentScores.length} preguntas promediadas).`;
            html += `</div>`;
            
            html += `<div class="mb-3">`;
            if (processedData.hasSelfEvaluation) {
                html += `<p><strong>Promedio Autoevaluación:</strong> <span class="badge bg-primary">${selfAverage.toFixed(2)}</span></p>`;
            }
            if (processedData.hasStudentEvaluations) {
                html += `<p><strong>Promedio Estudiantes:</strong> <span class="badge bg-warning text-dark">${studentAverage.toFixed(2)}</span></p>`;
            }
            html += `</div>`;
            
            // Comparison only if both exist
            if (processedData.hasSelfEvaluation && processedData.hasStudentEvaluations) {
                const difference = selfAverage - studentAverage;
                if (Math.abs(difference) >= 0.3) {
                    if (difference > 0) {
                        html += `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i><strong>Nota:</strong> Tu autoevaluación es ${difference.toFixed(2)} puntos más alta que la percepción estudiantil. Considera revisar aspectos donde puedas mejorar la comunicación de tus fortalezas.</div>`;
                    } else {
                        html += `<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i><strong>Excelente:</strong> Los estudiantes valoran tu desempeño ${Math.abs(difference).toFixed(2)} puntos más alto que tu autoevaluación. ¡Reconoce tus fortalezas!</div>`;
                    }
                } else {
                    html += '<p class="text-muted"><i class="bi bi-check-circle me-2"></i>Hay una buena alineación entre tu autoevaluación y la percepción estudiantil.</p>';
                }
            } else if (!processedData.hasSelfEvaluation) {
                html += '<p class="text-info"><i class="bi bi-info-circle"></i> Completa tu autoevaluación para ver comparaciones detalladas.</p>';
            } else if (!processedData.hasStudentEvaluations) {
                html += '<p class="text-info"><i class="bi bi-info-circle"></i> Aún no hay evaluaciones de estudiantes para comparar.</p>';
            }
            
            summaryDiv.innerHTML = html;
        }

        // Load and render improvement plans
        const plansData = await getImprovementPlans(teacherId);
        if (plansData) {
            renderImprovementPlans(plansData);
        }

        // Scroll to results section
        resultsVis.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Close results button
    const closeResultsBtn = document.getElementById('close-results');
    if (closeResultsBtn) closeResultsBtn.addEventListener('click', () => {
        const resultsSection = document.getElementById('results-visualization');
        if (resultsSection) resultsSection.style.display = 'none';
        showToast('Visualización cerrada.', { type: 'secondary', delay: 2000 });
    });

    // Refresh teacher results button
    const refreshResultsBtn = document.getElementById('refresh-results');
    if (refreshResultsBtn) refreshResultsBtn.addEventListener('click', async () => {
        if (!hasRole('teacher') && !hasRole('director')) {
            return showToast('No tienes permiso para actualizar resultados.', { type: 'danger' });
        }

        const teacherId = currentUser?.primaryEmailAddress?.emailAddress || currentUser?.email;
        if (!teacherId) {
            showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
            return;
        }

        try {
            showToast('Actualizando resultados...', { type: 'info', delay: 1500 });

            // Load teacher questions if not already loaded
            let teacherQuestions = window.evaluationItems;
            if (!teacherQuestions) {
                const response = await fetch('/api/getTeacherQuestions');
                teacherQuestions = await response.json();
                window.evaluationItems = teacherQuestions;
            }

            // Load student questions
            let studentQuestions = window.studentEvaluationItems;
            if (!studentQuestions) {
                const response = await fetch('/api/getStudentQuestions');
                studentQuestions = await response.json();
                window.studentEvaluationItems = studentQuestions;
            }

            // Fetch real data from database
            const resultsData = await getTeacherResults(teacherId);
            const processedData = processTeacherResults(resultsData);

            if (!processedData || !processedData.hasData) {
                showToast('No hay datos disponibles para actualizar.', { type: 'warning' });
                return;
            }

            // Update tables and charts (reuse the logic from view results)
            // Fill Self-Evaluation Table
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
            }

            // Fill Student Evaluations Table
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
            }

            // Update charts
            const selfAverage = processedData.hasSelfEvaluation ?
                processedData.selfScores.reduce((sum, s) => sum + s.score, 0) / processedData.selfScores.length : 0;
            
            const studentAverage = processedData.hasStudentEvaluations ?
                processedData.studentScores.reduce((sum, s) => sum + s.score, 0) / processedData.studentScores.length : 0;

            // Update bar chart
            if (window.resultsChart) {
                window.resultsChart.data.datasets[0].data = [selfAverage.toFixed(2)];
                window.resultsChart.data.datasets[1].data = [studentAverage.toFixed(2)];
                window.resultsChart.update();
            }

            // Update radar chart
            if (window.comparisonChart) {
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

                window.comparisonChart.data.datasets[0].data = selfDistribution;
                window.comparisonChart.data.datasets[1].data = studentDistribution;
                window.comparisonChart.update();
            }

            // Reload improvement plans
            const plansData = await getImprovementPlans(teacherId);
            if (plansData) {
                renderImprovementPlans(plansData);
            }

            showToast('Resultados actualizados correctamente.', { type: 'success' });
        } catch (error) {
            console.error('Error refreshing results:', error);
            showToast('Error al actualizar resultados.', { type: 'danger' });
        }
    });

    // Export teacher results button
    const exportTeacherResultsBtn = document.getElementById('export-teacher-results');
    if (exportTeacherResultsBtn) exportTeacherResultsBtn.addEventListener('click', async () => {
        if (!hasRole('teacher') && !hasRole('director')) {
            return showToast('No tienes permiso para exportar resultados.', { type: 'danger' });
        }

        const teacherId = currentUser?.primaryEmailAddress?.emailAddress || currentUser?.email;
        const teacherName = currentUser?.fullName || currentUser?.firstName || teacherId.split('@')[0];

        if (!teacherId) {
            showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
            return;
        }

        try {
            // Load questions if needed
            let teacherQuestions = window.evaluationItems;
            if (!teacherQuestions) {
                const response = await fetch('/api/getTeacherQuestions');
                teacherQuestions = await response.json();
                window.evaluationItems = teacherQuestions;
            }

            let studentQuestions = window.studentEvaluationItems;
            if (!studentQuestions) {
                const response = await fetch('/api/getStudentQuestions');
                studentQuestions = await response.json();
                window.studentEvaluationItems = studentQuestions;
            }

            // Fetch and process data
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

    // Handle teacher self-assessment form submission
    const teacherEvalForm = document.getElementById('teacher-eval-form');
    if (teacherEvalForm) teacherEvalForm.addEventListener('submit', async (e) => {
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
            const checked = teacherEvalForm.querySelector(`input[name="${name}"]:checked`);

            if (!checked) {
                allAnswered = false;
                const error = document.createElement('span');
                error.className = 'eval-error-msg';
                error.textContent = 'Por favor responde esta pregunta.';
                error.style.display = 'block';
                error.style.color = '#A61C31';
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
        
        const userEmail = currentUser?.primaryEmailAddress?.emailAddress || currentUser?.email || 'anonimo';
        const teacherId = userEmail; // Use email as unique identifier
        const userRole = currentRole || 'teacher';
        
        console.log('Evaluación enviada:', { scores, teacherId, userEmail, userRole });
        
        // Submit to MongoDB
        try {
            await submitTeacherEvaluation(teacherId, { scores }, userEmail, userRole);
            showToast('¡Evaluación enviada con éxito!', { type: 'success' });
            
            // Update button status to show evaluation is completed
            await updateSelfEvaluationButton(teacherId);
            
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
        } catch (error) {
            console.error('Error al enviar evaluación:', error);
            showToast('Error al enviar la evaluación. Por favor, intente nuevamente.', { type: 'danger' });
        }
    });

    // Student evaluation section - setup event listener only
    // Note: populateTeachers() is called from switchRole() when role is 'student'
    const selectTeacher = document.getElementById('select-teacher');
    if (selectTeacher) {
        selectTeacher.addEventListener('change', function() {
            if (!hasRole('student') && !hasRole('director')) {
                // Reset select if no permission
                this.value = '';
                return showToast('No tienes permiso para realizar evaluaciones estudiantiles.', { type: 'danger' });
            }
            if (this.value) {
                // Check if teacher was already evaluated
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
    // Cancel button for student evaluation
    const cancelStudentEvalBtn = document.getElementById('cancel-student-eval');
    if (cancelStudentEvalBtn) {
        cancelStudentEvalBtn.addEventListener('click', function() {
            const selectTeacher = document.getElementById('select-teacher');
            const studentForm = document.getElementById('student-eval-form');
            const formEl = document.getElementById('student-evaluation-form');
            
            // Reset select to default option
            if (selectTeacher) selectTeacher.value = '';
            
            // Reset form
            if (studentForm) studentForm.reset();
            
            // Hide evaluation form
            if (formEl) formEl.style.display = 'none';
            
            // Clear any error messages
            if (studentForm) {
                studentForm.querySelectorAll('.eval-error-msg').forEach(e => e.remove());
            }
            
            showToast('Evaluación cancelada.', { type: 'secondary', delay: 2000 });
        });
    }

    const studentForm = document.getElementById('student-eval-form');
    if (studentForm) studentForm.addEventListener('submit', async (e) => {
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
                error.style.color = '#A61C31';
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

        try {
            await submitStudentEvaluation(teacherId, scores, userEmail, userRole);
            
            showToast('¡Evaluación enviada con éxito! Su respuesta es anónima.', { type: 'success' });
            studentForm.reset();
            const selectTeacher = document.getElementById('select-teacher');
            if (selectTeacher) selectTeacher.value = '';
            const formEl = document.getElementById('student-evaluation-form');
            if (formEl) formEl.style.display = 'none';
            
            // Reload teachers list to update evaluated status
            const studentEmail = currentUser?.primaryEmailAddress?.emailAddress || currentUser?.email;
            if (studentEmail) {
                populateTeachers(studentEmail);
            }
        } catch (error) {
            console.error('Error al enviar evaluación:', error);
            showToast('Error al enviar la evaluación. Por favor, intente nuevamente.', { type: 'danger' });
        }
    });

    // Director controls and analytics
    const refreshDirectorBtn = document.getElementById('refresh-director-data');
    if (refreshDirectorBtn) refreshDirectorBtn.addEventListener('click', async () => {
        if (!hasRole('director')) return showToast('No tienes permiso para actualizar datos.', { type: 'danger' });
        
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

    const exportBtn = document.getElementById('export-report');
    if (exportBtn) exportBtn.addEventListener('click', () => {
        if (!hasRole('director')) return showToast('No tienes permiso para exportar reportes.', { type: 'danger' });
        
        if (window.directorStats) {
            exportDirectorReport(window.directorStats);
            showToast('Reporte exportado correctamente.', { type: 'success' });
        } else {
            showToast('No hay datos para exportar. Primero carga las estadísticas.', { type: 'warning' });
        }
    });

    const exportSummaryBtn = document.getElementById('export-summary');
    if (exportSummaryBtn) exportSummaryBtn.addEventListener('click', () => {
        if (!hasRole('director')) return showToast('No tienes permiso para exportar resumen.', { type: 'danger' });
        
        if (window.directorStats) {
            exportDirectorReport(window.directorStats);
            showToast('Resumen exportado correctamente.', { type: 'success' });
        } else {
            showToast('No hay datos para exportar.', { type: 'warning' });
        }
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
    if (planForm) planForm.addEventListener('submit', async function(e) {
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

        // Get teacher information
        const teacherId = currentUser?.primaryEmailAddress?.emailAddress || currentUser?.email;
        const userEmail = teacherId;

        if (!teacherId) {
            showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
            return;
        }

        // Save the plan to backend
        try {
            const response = await fetch('/api/save-improvement-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    teacherId, 
                    userEmail,
                    goal, 
                    actions, 
                    indicators, 
                    deadline 
                })
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(`Error del servidor: ${errorDetails.message || 'Error desconocido'}`);
            }

            const result = await response.json();
            console.log('Improvement plan saved successfully:', result);
            
            showToast('¡Plan de mejora guardado exitosamente!', { type: 'success' });
            
            // Reload improvement plans if results section is visible
            const resultsVis = document.getElementById('results-visualization');
            if (resultsVis && resultsVis.style.display !== 'none') {
                const plansData = await getImprovementPlans(teacherId);
                if (plansData) {
                    renderImprovementPlans(plansData);
                }
            }
            
            // Close modal after saving
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

    // Handle cancel button in improvement plan modal
    const improvementPlanModal = document.getElementById('improvementPlanModal');
    if (improvementPlanModal) {
        improvementPlanModal.addEventListener('hidden.bs.modal', function() {
            const planForm = document.getElementById('improvement-plan-form');
            if (planForm) {
                // Check if form has any data before resetting
                const hasData = planForm.goal.value.trim() || 
                               planForm.actions.value.trim() || 
                               planForm.indicators.value.trim() || 
                               planForm.deadline.value;
                
                if (hasData) {
                    planForm.reset();
                    showToast('Plan de mejora cancelado.', { type: 'secondary', delay: 2000 });
                }
            }
        });
    }

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

    if (!clerkInstance) {
        showToast('Error: Sistema de autenticación no inicializado.', { type: 'danger' });
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
                
                // If teacher, add to teachers collection
                if (role === 'teacher') {
                    try {
                        const teacherResponse = await fetch('/api/add-teacher', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                teacherId: email,
                                name: email.split('@')[0] // Use email prefix as default name
                            })
                        });

                        const teacherData = await teacherResponse.json();
                        
                        if (teacherResponse.ok) {
                            console.log('Teacher added to database:', teacherData);
                        } else {
                            console.error('Error adding teacher:', teacherData);
                        }
                    } catch (teacherError) {
                        console.error('Error adding teacher to database:', teacherError);
                        // Don't show error to user, just log it
                    }
                }
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
            
            // Clear login form
            const loginForm = document.getElementById('login-form');
            if (loginForm) loginForm.reset();
            
            if (loginSection) loginSection.style.display = 'none';
            if (registrationContainer) registrationContainer.style.display = 'block';
        });
    }

    // Show login button click
    const showLoginBtn = document.getElementById('show-login');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear registration form
            if (registrationForm) registrationForm.reset();
            
            // Clear password match message
            if (passwordMatchMessage) {
                passwordMatchMessage.textContent = '';
                passwordMatchMessage.className = 'form-text';
            }
            
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

    if (!clerkInstance) {
        showToast('Error: Sistema de autenticación no inicializado.', { type: 'danger' });
        return;
    }

    // Check if there's already an active Clerk session
    if (clerkInstance && clerkInstance.session) {
        console.log('Ya existe una sesión activa en Clerk');
        
        // Get the email from the active session
        const activeEmail = clerkInstance.user?.primaryEmailAddress?.emailAddress || clerkInstance.user?.emailAddresses?.[0]?.emailAddress;
        
        // Check if the email from the form matches the active session
        if (activeEmail && activeEmail !== email) {
            showToast('Ya hay una sesión activa con otro usuario. Por favor, cierra sesión primero.', { type: 'danger', delay: 5000 });
            return;
        }
        
        // Get the stored role from Clerk metadata or localStorage
        const storedRole = clerkInstance.user?.publicMetadata?.role || localStorage.getItem(`user_role_${activeEmail}`);
        
        // Validate that the selected role matches the stored role
        if (storedRole && storedRole !== role) {
            const roleNames = {
                student: 'Estudiante',
                teacher: 'Docente',
                director: 'Directivo'
            };
            showToast(`Este usuario está registrado como ${roleNames[storedRole]}, no como ${roleNames[role]}.`, { type: 'danger', delay: 5000 });
            return;
        }
        
        currentUser = { 
            email: activeEmail, 
            name: activeEmail.split('@')[0],
            primaryEmailAddress: { emailAddress: activeEmail }
        };
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
                showToast(`Este usuario está registrado como ${roleNames[storedRole]}, no como ${roleNames[role]}.`, { type: 'danger', delay: 5000 });
                
                // Sign out to prevent session from staying active
                try {
                    await clerkInstance.signOut();
                } catch (signOutError) {
                    console.error('Error signing out after role mismatch:', signOutError);
                }
                
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
                        
                        // If teacher, ensure they're in the teachers collection
                        if (role === 'teacher') {
                            try {
                                const teacherResponse = await fetch('/api/add-teacher', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        teacherId: email,
                                        name: email.split('@')[0]
                                    })
                                });

                                const teacherData = await teacherResponse.json();
                                console.log('Teacher check/add result:', teacherData);
                            } catch (teacherError) {
                                console.error('Error checking/adding teacher:', teacherError);
                            }
                        }
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
        
        // Translate common Clerk error messages to Spanish
        let errorMessage = error.errors?.[0]?.message || error.message || 'Credenciales inválidas';
        
        // Common error translations
        if (errorMessage.includes('Password is incorrect')) {
            errorMessage = 'Contraseña incorrecta. Intenta de nuevo o usa otro método.';
        } else if (errorMessage.includes('Invalid email')) {
            errorMessage = 'Correo electrónico inválido.';
        } else if (errorMessage.includes('User not found') || errorMessage.includes("Couldn't find your account")) {
            errorMessage = 'No se encontró una cuenta con este correo.';
        } else if (errorMessage.includes('Too many requests')) {
            errorMessage = 'Demasiados intentos. Por favor espera un momento.';
        } else if (errorMessage.includes('Network')) {
            errorMessage = 'Error de conexión. Verifica tu internet.';
        }
        
        showToast('Error: ' + errorMessage, { type: 'danger', delay: 5000 });
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
    console.log('Showing login success toast for role:', role);
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
    
    // Save logout message to show after page reload
    sessionStorage.setItem('logoutMessage', 'true');
    
    // Scroll to login
    if (loginSection) {
        loginSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    // Check for active Clerk session first
    const sessionRestored = await checkClerkSession();
    
    init();
    
    // Only enforce permissions if session wasn't restored (to avoid double-call)
    if (!sessionRestored) {
        enforcePermissions();
    }
    
    setupFormToggle();
    
    // Check if there's a logout message to show
    if (sessionStorage.getItem('logoutMessage')) {
        sessionStorage.removeItem('logoutMessage');
        // Small delay to ensure DOM is fully loaded
        setTimeout(() => {
            showToast('✓ Sesión cerrada correctamente', { type: 'info', delay: 3000 });
        }, 100);
    }
});
