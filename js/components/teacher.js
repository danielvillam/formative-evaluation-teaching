import { evaluationItems } from '../data.js';

export function renderTeacherSection() {
    return `
    <div class="role-section" id="teacher-section">
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
                        <div class="scale-item">1: Nunca</div>
                        <div class="scale-item">2: Rara vez</div>
                        <div class="scale-item">3: Ocasionalmente</div>
                        <div class="scale-item">4: Frecuentemente</div>
                        <div class="scale-item">5: Siempre</div>
                    </div>

                    <form id="teacher-eval-form">
                        <div id="evaluation-items"></div>

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
                    <div class="chart-container">
                        <canvas id="results-chart"></canvas>
                    </div>
                    <div class="mt-4">
                        <h5>Comparativo con evaluación estudiantil</h5>
                        <div class="chart-container">
                            <canvas id="comparison-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
* Renders assessment items as 5 radio buttons (1..5),
* similar to student.js. Keeps name="eval-{id}" to group radio buttons.
*/
export function renderEvaluationItems() {
    const container = document.getElementById('evaluation-items');
    if (!container) return;
    container.innerHTML = '';

    evaluationItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'evaluation-item mb-3';

        // "button" style radios from 1 to 5
        let buttonsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const requiredAttr = i === 1 ? 'required' : '';
            buttonsHTML += `
                <input type="radio"
                    class="btn-check"
                    name="eval-${item.id}"
                    id="eval-${item.id}-${i}"
                    value="${i}"
                    data-id="${item.id}"
                    ${requiredAttr}>
                <label class="btn btn-outline-primary rounded-circle me-2" 
                    for="eval-${item.id}-${i}">
                    ${i}
                </label>
            `;
        }

        itemElement.innerHTML = `
            <h6 class="mb-2">${item.text}</h6>
            <div class="d-flex align-items-center">
                ${buttonsHTML}
            </div>
        `;

        container.appendChild(itemElement);
    });
}
