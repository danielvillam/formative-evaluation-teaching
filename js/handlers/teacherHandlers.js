/**
 * @fileoverview Teacher evaluation handlers
 * @module handlers/teacherHandlers
 */

import { appState } from '../state/appState.js';
import { showToast } from '../utils/toast.js';
import { DOM } from '../utils/dom.js';
import { getTeacherQuestions, getStudentQuestions } from '../services/evaluationService.js';
import { 
    renderEvaluationItems, 
    submitTeacherEvaluation, 
    updateSelfEvaluationButton,
    getTeacherResults,
    processTeacherResults,
    exportTeacherResults
} from '../components/teacher.js';

/**
 * Handle start self-evaluation button click
 */
export function handleStartSelfEvaluation() {
    if (!appState.hasRole('teacher') && !appState.hasRole('director')) {
        showToast('No tienes permiso para realizar autoevaluaciones.', { type: 'danger' });
        return;
    }

    const form = DOM.getElementById('self-evaluation-form');
    const resultsVis = DOM.getElementById('results-visualization');

    DOM.hide(resultsVis);
    DOM.show(form);

    if (!appState.evaluationItems) {
        renderEvaluationItems();
    }

    DOM.scrollIntoView(form);
}

/**
 * Handle teacher evaluation form submission
 * @param {Event} e - Submit event
 */
export async function handleTeacherEvaluationSubmit(e) {
    e.preventDefault();

    if (!appState.hasRole('teacher') && !appState.hasRole('director')) {
        showToast('No tienes permiso para enviar esta evaluación.', { type: 'danger' });
        return;
    }

    const teacherEvalForm = DOM.getElementById('teacher-eval-form');
    const evaluationItems = appState.evaluationItems;

    if (!evaluationItems) {
        showToast('Error: No se cargaron las preguntas de evaluación.', { type: 'danger' });
        return;
    }

    // Validate all questions are answered
    let allAnswered = true;
    const errorMessages = document.querySelectorAll('.eval-error-msg');
    errorMessages.forEach(msg => msg.remove());

    evaluationItems.forEach((item, index) => {
        const itemDiv = document.querySelector(`#evaluation-items > div:nth-child(${index + 1})`);
        if (!itemDiv) return;

        const radios = teacherEvalForm.querySelectorAll(`input[name='eval-${item.id}']`);
        if (radios.length === 0) return;

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
        showToast('Por favor, responda todas las preguntas antes de enviar la evaluación.', { 
            type: 'warning' 
        });
        return;
    }

    // Collect scores
    const scores = {};
    evaluationItems.forEach(item => {
        const checked = teacherEvalForm.querySelector(`input[name='eval-${item.id}']:checked`);
        if (checked) {
            scores[item.id] = parseInt(checked.value, 10);
        }
    });

    const reflection = DOM.getElementById('reflection')?.value || '';
    const teacherId = appState.getUserEmail();
    const userEmail = teacherId;
    const userRole = appState.currentRole || 'teacher';

    try {
        await submitTeacherEvaluation(teacherId, { scores, reflection }, userEmail, userRole);
        
        showToast('¡Autoevaluación enviada con éxito!', { type: 'success' });
        
        sessionStorage.setItem('evalSubmittedSuccess', 'true');
        await updateSelfEvaluationButton(teacherId);
        
        DOM.hide('self-evaluation-form');
        DOM.hide('results-visualization');
        DOM.clearForm(teacherEvalForm);
        
        const reflectionInput = DOM.getElementById('reflection');
        if (reflectionInput) reflectionInput.value = '';
    } catch (error) {
        console.error('Error al enviar evaluación:', error);
        showToast('Error al enviar la evaluación. Por favor, intente nuevamente.', { 
            type: 'danger' 
        });
    }
}

/**
 * Handle view results button click
 */
export async function handleViewResults() {
    if (!appState.hasRole('teacher') && !appState.hasRole('director')) {
        showToast('No tienes permiso para ver los resultados.', { type: 'danger' });
        return;
    }

    const teacherId = appState.getUserEmail();
    if (!teacherId) {
        showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
        return;
    }

    DOM.hide('self-evaluation-form');
    DOM.show('results-visualization');

    // Load questions if needed
    if (!appState.evaluationItems) {
        const teacherQuestions = await getTeacherQuestions();
        appState.evaluationItems = teacherQuestions;
    }

    if (!appState.studentEvaluationItems) {
        const studentQuestions = await getStudentQuestions();
        appState.studentEvaluationItems = studentQuestions;
    }

    // Fetch and display results
    const resultsData = await getTeacherResults(teacherId);
    
    if (!resultsData || !resultsData.hasData) {
        displayNoDataMessage(resultsData);
        return;
    }

    const processedData = processTeacherResults(resultsData);
    
    if (!processedData || !processedData.hasData) {
        showToast('No hay datos suficientes para generar resultados.', { type: 'warning' });
        return;
    }

    displayResults(processedData);
    DOM.scrollIntoView('results-visualization');
}

/**
 * Display message when no data available
 * @param {Object} resultsData - Results data
 */
function displayNoDataMessage(resultsData) {
    const summaryDiv = DOM.getElementById('results-summary');
    if (!summaryDiv) return;

    summaryDiv.innerHTML = `
        <div class="alert alert-info" role="alert">
            <h5 class="alert-heading"><i class="bi bi-info-circle me-2"></i>No hay datos disponibles</h5>
            <p class="mb-0">Aún no se han recopilado suficientes datos para generar resultados.</p>
            <hr>
            <p class="mb-0 small">
                ${!resultsData?.selfEvaluation ? '• Completa tu autoevaluación<br>' : ''}
                ${(!resultsData?.studentEvaluations || resultsData.studentEvaluations.length === 0) 
                    ? '• Espera a que los estudiantes completen sus evaluaciones' 
                    : ''}
            </p>
        </div>
    `;

    // Clear charts
    if (window.resultsChart) window.resultsChart.destroy();
    if (window.comparisonChart) window.comparisonChart.destroy();
    
    DOM.hide('self-eval-table-container');
    DOM.hide('student-eval-table-container');
}

/**
 * Display evaluation results with tables, charts and summary
 * @param {Object} processedData - Processed results data
 */
function displayResults(processedData) {
    const teacherQuestions = appState.evaluationItems;
    const studentQuestions = appState.studentEvaluationItems;

    // Fill Self-Evaluation Table
    const selfEvalTableBody = DOM.getElementById('self-eval-table-body');
    const selfEvalContainer = DOM.getElementById('self-eval-table-container');
    if (selfEvalTableBody && processedData.hasSelfEvaluation) {
        DOM.show(selfEvalContainer);
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
        DOM.hide(selfEvalContainer);
    }

    // Fill Student Evaluations Table
    const studentEvalTableBody = DOM.getElementById('student-eval-table-body');
    const studentEvalContainer = DOM.getElementById('student-eval-table-container');
    if (studentEvalTableBody && processedData.hasStudentEvaluations) {
        DOM.show(studentEvalContainer);
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
        DOM.hide(studentEvalContainer);
    }

    // Calculate overall averages for charts
    const selfAverage = processedData.hasSelfEvaluation ?
        processedData.selfScores.reduce((sum, s) => sum + s.score, 0) / processedData.selfScores.length : 0;
    
    const studentAverage = processedData.hasStudentEvaluations ?
        processedData.studentScores.reduce((sum, s) => sum + s.score, 0) / processedData.studentScores.length : 0;

    // Bar chart - Overall averages comparison
    createBarChart(selfAverage, studentAverage, processedData);

    // Radar chart - Distribution of scores
    createRadarChart(processedData);

    // Text summary
    displaySummary(processedData, selfAverage, studentAverage);
}

/**
 * Create bar chart for overall averages
 * @param {number} selfAverage - Self-evaluation average
 * @param {number} studentAverage - Student evaluations average
 * @param {Object} processedData - Processed results data
 */
function createBarChart(selfAverage, studentAverage, processedData) {
    const resultsCanvas = DOM.getElementById('results-chart');
    if (!resultsCanvas) return;

    const resultsCtx = resultsCanvas.getContext('2d');
    if (!resultsCtx) return;

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

/**
 * Create radar chart for score distribution
 * @param {Object} processedData - Processed results data
 */
function createRadarChart(processedData) {
    const comparisonCanvas = DOM.getElementById('comparison-chart');
    if (!comparisonCanvas) return;

    const comparisonCtx = comparisonCanvas.getContext('2d');
    if (!comparisonCtx) return;

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

/**
 * Display text summary with statistics and insights
 * @param {Object} processedData - Processed results data
 * @param {number} selfAverage - Self-evaluation average
 * @param {number} studentAverage - Student evaluations average
 */
function displaySummary(processedData, selfAverage, studentAverage) {
    const summaryDiv = DOM.getElementById('results-summary');
    if (!summaryDiv) return;

    let html = `<div class="mb-3"><strong>Evaluaciones recibidas:</strong> `;
    if (processedData.hasSelfEvaluation) {
        html += `Autoevaluación completada (${processedData.selfScores.length} preguntas). `;
    }
    if (processedData.hasStudentEvaluations) {
        html += `${processedData.studentCount} evaluación(es) de estudiantes (${processedData.studentScores.length} preguntas promediadas).`;
    }
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

/**
 * Handle refresh results button
 */
export async function handleRefreshResults() {
    if (!appState.hasRole('teacher') && !appState.hasRole('director')) {
        showToast('No tienes permiso para actualizar resultados.', { type: 'danger' });
        return;
    }

    const teacherId = appState.getUserEmail();
    if (!teacherId) {
        showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
        return;
    }

    try {
        showToast('Actualizando resultados...', { type: 'info', delay: 1500 });
        
        // Reload questions if needed
        if (!appState.evaluationItems) {
            appState.evaluationItems = await getTeacherQuestions();
        }
        if (!appState.studentEvaluationItems) {
            appState.studentEvaluationItems = await getStudentQuestions();
        }

        // Fetch fresh results
        const resultsData = await getTeacherResults(teacherId);
        
        if (!resultsData || !resultsData.hasData) {
            displayNoDataMessage(resultsData);
            showToast('No hay datos disponibles.', { type: 'warning' });
            return;
        }

        const processedData = processTeacherResults(resultsData);
        
        if (!processedData || !processedData.hasData) {
            showToast('No hay datos suficientes para generar resultados.', { type: 'warning' });
            return;
        }

        displayResults(processedData);
        showToast('Resultados actualizados correctamente.', { type: 'success' });
    } catch (error) {
        console.error('Error refreshing results:', error);
        showToast('Error al actualizar resultados.', { type: 'danger' });
    }
}

/**
 * Handle export results button
 */
export async function handleExportResults() {
    if (!appState.hasRole('teacher') && !appState.hasRole('director')) {
        showToast('No tienes permiso para exportar resultados.', { type: 'danger' });
        return;
    }

    const teacherId = appState.getUserEmail();
    const teacherName = appState.getUserName();

    if (!teacherId) {
        showToast('Error: No se pudo identificar al docente.', { type: 'danger' });
        return;
    }

    try {
        if (!appState.evaluationItems) {
            appState.evaluationItems = await getTeacherQuestions();
        }
        if (!appState.studentEvaluationItems) {
            appState.studentEvaluationItems = await getStudentQuestions();
        }

        const resultsData = await getTeacherResults(teacherId);
        const processedData = processTeacherResults(resultsData);

        if (!processedData || !processedData.hasData) {
            showToast('No hay datos para exportar.', { type: 'warning' });
            return;
        }

        exportTeacherResults(
            teacherName, 
            processedData, 
            appState.evaluationItems, 
            appState.studentEvaluationItems
        );
        
        showToast('Resultados exportados correctamente.', { type: 'success' });
    } catch (error) {
        console.error('Error exporting results:', error);
        showToast('Error al exportar resultados.', { type: 'danger' });
    }
}
