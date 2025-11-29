export function renderTeacherSection() {
    return `
    <div class="role-section" id="teacher-section">
        <!-- Modal Plan de Mejora -->
        <div class="modal fade" id="improvementPlanModal" tabindex="-1" aria-labelledby="improvementPlanModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="improvementPlanModalLabel">Crear Plan de Mejora Docente</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <form id="improvement-plan-form">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="plan-goal" class="form-label">Meta principal</label>
                                <input type="text" class="form-control" id="plan-goal" name="goal" required placeholder="Ej: Mejorar la participación estudiantil en clase">
                            </div>
                            <div class="mb-3">
                                <label for="plan-actions" class="form-label">Acciones a implementar</label>
                                <textarea class="form-control" id="plan-actions" name="actions" rows="3" required placeholder="Describa las acciones concretas..."></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="plan-indicators" class="form-label">Indicadores de éxito</label>
                                <input type="text" class="form-control" id="plan-indicators" name="indicators" required placeholder="Ej: Aumento del 20% en participación oral">
                            </div>
                            <div class="mb-3">
                                <label for="plan-deadline" class="form-label">Fecha límite</label>
                                <input type="date" class="form-control" id="plan-deadline" name="deadline" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-success">Guardar Plan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card dashboard-card">
                    <div class="card-header role-teacher">
                        <h5 class="mb-0">Autoevaluación</h5>
                        <div class="header-actions">
                            <span class="badge badge-role teacher">Docente</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Complete su autoevaluación formativa para reflexionar sobre su práctica docente.</p>
                        <button class="btn btn-primary" id="start-self-eval">Comenzar Autoevaluación</button>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card dashboard-card">
                    <div class="card-header role-teacher">
                        <h5 class="mb-0">Resultados</h5>
                        <div class="header-actions">
                            <span class="text-white" title="Resultados">
                                <i class="bi bi-download fs-5"></i>
                            </span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Revise sus resultados de autoevaluación y comparativos con percepciones estudiantiles.</p>
                        <button class="btn btn-primary" id="view-results">Ver Resultados</button>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card dashboard-card">
                    <div class="card-header role-teacher">
                        <h5 class="mb-0">Plan de Mejora</h5>
                        <div class="header-actions">
                            <span class="text-white" title="Plan de mejora">
                                <i class="bi bi-journal-text fs-5"></i>
                            </span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Desarrolle y documente su plan de mejora continua basado en los resultados.</p>
                        <button class="btn btn-primary" id="improvement-plan">Crear Plan</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-4" id="self-evaluation-form" style="display: none;">
            <div class="card">
                <div class="card-header role-teacher">
                    <h4 class="mb-0">Formulario de Autoevaluación Docente</h4>
                    <div class="header-actions">
                        <span class="badge badge-role teacher">Docente</span>
                    </div>
                </div>
                <div class="card-body">
                    <p>Evalúe su desempeño según la siguiente escala:</p>
                    <div class="evaluation-scale">
                        <div class="scale-item">1: Totalmente en desacuerdo</div>
                        <div class="scale-item">2: En desacuerdo</div>
                        <div class="scale-item">3: Indiferente</div>
                        <div class="scale-item">4: De acuerdo</div>
                        <div class="scale-item">5: Totalmente de acuerdo</div>
                    </div>

                    <form id="teacher-eval-form">
                        <div id="teacher-evaluation-items"></div>

                        <div class="mt-3 d-flex gap-2">
                            <button type="submit" class="btn btn-success">Enviar Evaluación</button>
                            <button type="button" class="btn btn-secondary" id="cancel-eval">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="mt-4" id="results-visualization" style="display: none;">
            <div class="card">
                <div class="card-header role-teacher">
                    <h4 class="mb-0">Resultados de Evaluación</h4>
                    <div class="header-actions">
                        <button class="btn btn-sm btn-light" id="refresh-results" title="Actualizar datos">
                            <i class="bi bi-arrow-clockwise"></i> Actualizar
                        </button>
                        <button class="btn btn-sm btn-light" id="export-teacher-results" title="Exportar resultados">
                            <i class="bi bi-download"></i> Exportar
                        </button>
                        <button class="btn btn-sm btn-secondary" id="close-results" title="Cerrar">
                            <i class="bi bi-x-lg"></i> Cerrar
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-lg-6 mb-4">
                            <div class="chart-container">
                                <canvas id="results-chart"></canvas>
                            </div>
                        </div>
                        <div class="col-lg-6 mb-4">
                            <h5>Comparativo con evaluación estudiantil</h5>
                            <div class="chart-container">
                                <canvas id="comparison-chart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h5 class="mb-3">Resultados Detallados</h5>
                        
                        <!-- Autoevaluación Table -->
                        <div class="mb-4" id="self-eval-table-container">
                            <h6 class="text-primary"><i class="bi bi-person-check me-2"></i>Autoevaluación Docente</h6>
                            <div class="table-responsive">
                                <table class="table table-bordered table-sm align-middle">
                                    <thead class="table-primary">
                                        <tr>
                                            <th style="width: 70%">Pregunta</th>
                                            <th class="text-center">Puntuación</th>
                                        </tr>
                                    </thead>
                                    <tbody id="self-eval-table-body">
                                        <!-- Se llenará dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Student Evaluations Table -->
                        <div class="mb-4" id="student-eval-table-container">
                            <h6 class="text-warning"><i class="bi bi-people-fill me-2"></i>Evaluación Estudiantil (Promedio)</h6>
                            <div class="table-responsive">
                                <table class="table table-bordered table-sm align-middle">
                                    <thead class="table-warning">
                                        <tr>
                                            <th style="width: 70%">Pregunta</th>
                                            <th class="text-center">Promedio</th>
                                        </tr>
                                    </thead>
                                    <tbody id="student-eval-table-body">
                                        <!-- Se llenará dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h5 class="mb-3">Resumen y oportunidades de mejora</h5>
                        <div id="results-summary" class="alert alert-info" style="min-height:2.5em"></div>
                    </div>
                    <div class="mt-4" id="improvement-plans-section">
                        <h5 class="mb-3"><i class="bi bi-journal-text me-2"></i>Planes de Mejora</h5>
                        <div id="improvement-plans-container">
                            <!-- Se llenará dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

export async function loadData() {
    try {
        const data = await fetch('/api/getTeacherQuestions');
        return await data.json();
    } catch (error) {
        console.error("Error al cargar preguntas de la base de datos", error);
        return null;
    }
}

/**
 * Render assessment items as 5 radio buttons (1-5),
 * using the same style as the student evaluation (blue outline).
 * Each group uses name="eval-{id}" for proper grouping.
 */
export async function renderEvaluationItems() {
    const container = document.getElementById('teacher-evaluation-items');
    if (!container) return;

    const data = await loadData();
    if (!data || !Array.isArray(data)) {
        console.error("No se encontraron preguntas de docentes en el formato esperado");
        return;
    }

    // Assign data to a global variable for later use
    window.evaluationItems = data;

    container.innerHTML = '';

    data.forEach((item, index) => {
        const itemId = item.id || (index + 1);
        const itemElement = document.createElement('div');
        itemElement.className = 'evaluation-item mb-3';

        // Botones 1 a 5
        let buttonsHTML = '';
        for (let i = 1; i <= 5; i++) {
            buttonsHTML += `
                <input type="radio"
                    class="btn-check"
                    name="eval-${itemId}"
                    id="eval-${itemId}-${i}"
                    value="${i}"
                    data-id="${itemId}">
                <label class="btn btn-outline-primary rounded-circle me-2" 
                    for="eval-${itemId}-${i}">
                    ${i}
                </label>
            `;
        }

        itemElement.innerHTML = `
            <h6 class="mb-2">${item.question}</h6>
            <div class="d-flex align-items-center">
                ${buttonsHTML}
            </div>
        `;

        container.appendChild(itemElement);
    });
}

export async function checkTeacherSelfEvaluation(teacherId) {
    if (!teacherId) {
        console.error('Teacher ID is required');
        return false;
    }

    try {
        const response = await fetch(`/api/get-teacher-self-evaluation?teacherId=${encodeURIComponent(teacherId)}`);
        
        if (!response.ok) {
            console.error('Error checking teacher self-evaluation:', response.status);
            return false;
        }

        const data = await response.json();
        return data.hasEvaluated || false;
    } catch (error) {
        console.error('Error checking teacher self-evaluation:', error);
        return false;
    }
}

export async function updateSelfEvaluationButton(teacherId) {
    const button = document.getElementById('start-self-eval');
    if (!button) return;

    const hasEvaluated = await checkTeacherSelfEvaluation(teacherId);
    
    if (hasEvaluated) {
        button.disabled = true;
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
        button.innerHTML = '<i class="bi bi-check-circle me-2"></i>Autoevaluación Completada';
        
        // Update card text
        const cardText = button.closest('.card-body')?.querySelector('.card-text');
        if (cardText) {
            cardText.textContent = 'Ya has completado tu autoevaluación. Puedes revisar tus resultados en la sección correspondiente.';
            cardText.classList.add('text-muted');
        }
    } else {
        button.disabled = false;
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
        button.innerHTML = 'Comenzar Autoevaluación';
    }
}

export async function submitTeacherEvaluation(teacherId, evaluationData, userEmail, userRole) {
    if (!teacherId || !evaluationData || !userEmail || !userRole) {
        console.error('Missing required fields for teacher evaluation');
        return null;
    }

    try {
        const response = await fetch('/api/submit-evaluation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId, evaluationData, userEmail, userRole })
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(`Error del servidor: ${errorDetails.message || 'Error desconocido'}`);
        }

        const result = await response.json();
        console.log('Teacher evaluation submitted successfully:', result);
        return result;
    } catch (error) {
        console.error('Error al enviar la evaluación:', error);
        throw error;
    }
}

export async function getTeacherResults(teacherId) {
    if (!teacherId) {
        console.error('Teacher ID is required');
        return null;
    }

    try {
        const response = await fetch(`/api/get-teacher-results?teacherId=${encodeURIComponent(teacherId)}`);
        
        if (!response.ok) {
            console.error('Error fetching teacher results:', response.status);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching teacher results:', error);
        return null;
    }
}

export function processTeacherResults(resultsData) {
    if (!resultsData || !resultsData.hasData) {
        return null;
    }

    const { selfEvaluation, studentEvaluations } = resultsData;
    
    // Process self-evaluation scores
    const selfScores = selfEvaluation ? 
        Object.entries(selfEvaluation.evaluationData?.scores || selfEvaluation.evaluationData || {}).map(([id, score]) => ({
            questionId: parseInt(id),
            score: score
        })) : [];

    // Process student evaluations - calculate averages per question
    const studentScoresMap = {};
    
    studentEvaluations.forEach(evaluation => {
        // Handle both formats: {scores: {...}} and direct scores object
        const scoresData = evaluation.evaluationData?.scores || evaluation.evaluationData || {};
        Object.entries(scoresData).forEach(([id, score]) => {
            const questionId = parseInt(id);
            if (!studentScoresMap[questionId]) {
                studentScoresMap[questionId] = [];
            }
            if (typeof score === 'number' && score > 0) {
                studentScoresMap[questionId].push(score);
            }
        });
    });

    // Calculate averages
    const studentScores = Object.entries(studentScoresMap).map(([id, scores]) => ({
        questionId: parseInt(id),
        score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    }));

    return {
        selfScores,
        studentScores,
        hasData: selfScores.length > 0 || studentScores.length > 0,
        hasSelfEvaluation: selfScores.length > 0,
        hasStudentEvaluations: studentScores.length > 0,
        studentCount: studentEvaluations.length
    };
}

export function exportTeacherResults(teacherName, processedData, teacherQuestions, studentQuestions) {
    if (!processedData || !processedData.hasData) {
        alert('No hay datos para exportar');
        return;
    }

    // Create CSV content
    let csv = `Resultados de Evaluación - ${teacherName}\n`;
    csv += `Fecha: ${new Date().toLocaleDateString()}\n\n`;

    // Self-evaluation section
    if (processedData.hasSelfEvaluation) {
        csv += 'AUTOEVALUACIÓN DOCENTE\n';
        csv += 'Pregunta,Puntuación\n';
        
        teacherQuestions.forEach((item, idx) => {
            const questionId = item.id || (idx + 1);
            const selfScore = processedData.selfScores.find(s => s.questionId === questionId);
            if (selfScore && selfScore.score > 0) {
                csv += `"${(item.question || item.text).replace(/"/g, '""')}",${selfScore.score}\n`;
            }
        });

        const selfAverage = processedData.selfScores.reduce((sum, s) => sum + s.score, 0) / processedData.selfScores.length;
        csv += `\nPromedio Autoevaluación,${selfAverage.toFixed(2)}\n\n`;
    }

    // Student evaluations section
    if (processedData.hasStudentEvaluations) {
        csv += 'EVALUACIÓN ESTUDIANTIL\n';
        csv += `Número de evaluaciones recibidas: ${processedData.studentCount}\n`;
        csv += 'Pregunta,Promedio\n';
        
        studentQuestions.forEach((item, idx) => {
            const questionId = idx + 1;
            const studentScore = processedData.studentScores.find(s => s.questionId === questionId);
            if (studentScore && studentScore.score > 0) {
                csv += `"${(item.question || item.text).replace(/"/g, '""')}",${studentScore.score.toFixed(2)}\n`;
            }
        });

        const studentAverage = processedData.studentScores.reduce((sum, s) => sum + s.score, 0) / processedData.studentScores.length;
        csv += `\nPromedio Estudiantes,${studentAverage.toFixed(2)}\n\n`;
    }

    // Summary
    if (processedData.hasSelfEvaluation && processedData.hasStudentEvaluations) {
        const selfAverage = processedData.selfScores.reduce((sum, s) => sum + s.score, 0) / processedData.selfScores.length;
        const studentAverage = processedData.studentScores.reduce((sum, s) => sum + s.score, 0) / processedData.studentScores.length;
        const difference = selfAverage - studentAverage;
        
        csv += 'RESUMEN COMPARATIVO\n';
        csv += `Promedio Autoevaluación,${selfAverage.toFixed(2)}\n`;
        csv += `Promedio Estudiantes,${studentAverage.toFixed(2)}\n`;
        csv += `Diferencia,${difference.toFixed(2)}\n`;
    }

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados_evaluacion_${teacherName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export async function getImprovementPlans(teacherId) {
    if (!teacherId) {
        console.error('Teacher ID is required');
        return null;
    }

    try {
        const response = await fetch(`/api/get-improvement-plans?teacherId=${encodeURIComponent(teacherId)}`);
        
        if (!response.ok) {
            console.error('Error fetching improvement plans:', response.status);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching improvement plans:', error);
        return null;
    }
}

export function renderImprovementPlans(plansData) {
    const container = document.getElementById('improvement-plans-container');
    if (!container) return;

    if (!plansData || !plansData.plans || plansData.plans.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                No hay planes de mejora registrados. Crea uno desde la sección "Plan de Mejora".
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    plansData.plans.forEach((plan, index) => {
        const planCard = document.createElement('div');
        planCard.className = 'card mb-3';
        
        const deadline = new Date(plan.deadline);
        const createdAt = new Date(plan.createdAt);
        const today = new Date();
        const isOverdue = deadline < today;
        
        planCard.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center ${isOverdue ? 'bg-danger text-white' : 'bg-light'}">
                <h6 class="mb-0">
                    <i class="bi bi-calendar-event me-2"></i>
                    Plan de Mejora #${plansData.plans.length - index}
                </h6>
                <span class="badge ${isOverdue ? 'bg-light text-danger' : 'bg-secondary'}">
                    ${isOverdue ? 'Vencido' : 'Activo'}
                </span>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-12 mb-3">
                        <strong><i class="bi bi-bullseye me-2"></i>Meta principal:</strong>
                        <p class="mb-0 ms-4">${plan.goal}</p>
                    </div>
                    <div class="col-md-12 mb-3">
                        <strong><i class="bi bi-list-check me-2"></i>Acciones a implementar:</strong>
                        <p class="mb-0 ms-4" style="white-space: pre-wrap;">${plan.actions}</p>
                    </div>
                    <div class="col-md-6 mb-2">
                        <strong><i class="bi bi-graph-up me-2"></i>Indicadores de éxito:</strong>
                        <p class="mb-0 ms-4">${plan.indicators}</p>
                    </div>
                    <div class="col-md-6 mb-2">
                        <strong><i class="bi bi-calendar-check me-2"></i>Fecha límite:</strong>
                        <p class="mb-0 ms-4">${deadline.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <hr>
                <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>
                    Creado el ${createdAt.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </small>
            </div>
        `;
        
        container.appendChild(planCard);
    });
}
