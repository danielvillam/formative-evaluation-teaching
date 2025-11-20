
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
                            <button class="btn btn-sm btn-outline-secondary" id="download-results" title="Descargar">
                                <i class="bi bi-download"></i>
                            </button>
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
                            <button class="btn btn-sm btn-outline-secondary" id="open-plan" title="Ver plan">
                                <i class="bi bi-journal-text"></i>
                            </button>
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

                        <div class="mt-4">
                            <h5>Reflexión sobre la práctica docente</h5>
                            <textarea class="form-control" id="reflection" rows="4" placeholder="Escriba aquí sus reflexiones..."></textarea>
                        </div>

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
                        <button class="btn btn-sm btn-outline-secondary" id="refresh-results" title="Refrescar">
                            <i class="bi bi-arrow-clockwise"></i>
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
                        <h5 class="mb-3">Tabla comparativa por pregunta</h5>
                        <div class="table-responsive">
                            <table class="table table-bordered align-middle" id="results-comparison-table">
                                <thead class="table-light">
                                    <tr>
                                        <th>Pregunta</th>
                                        <th>Autoevaluación</th>
                                        <th>Promedio Estudiantil</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Se llenará dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h5 class="mb-3">Resumen y oportunidades de mejora</h5>
                        <div id="results-summary" class="alert alert-info" style="min-height:2.5em"></div>
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
        if (!data || !data.Docentes) {
            console.error("No se encontraron datos de Docentes en el JSON");
            return;
        }
    
    container.innerHTML = '';

    data.Estudiantes.forEach((text, index) => {
        const itemId = index + 1; // genera un ID numérico
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
            <h6 class="mb-2">${text}</h6>
            <div class="d-flex align-items-center">
                ${buttonsHTML}
            </div>
        `;

        container.appendChild(itemElement);
    });
}
