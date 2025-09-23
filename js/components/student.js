import { studentEvaluationItems, teachers } from '../data.js';

export function renderStudentSection() {
    return `
    <div class="role-section" id="student-section">
        <div class="card">
            <div class="card-header role-student">
                <h4 class="mb-0">Evaluación de Percepción Estudiantil</h4>
                <div class="header-actions">
                    <span class="badge badge-role student">Estudiante</span>
                </div>
            </div>

            <div class="card-body">
                <p class="text-muted">Su respuesta es importante. Por favor, sea honesto y objetivo en su evaluación.</p>

                <div class="mb-3">
                    <label for="select-teacher" class="form-label">Seleccione el docente a evaluar:</label>
                    <select class="form-select" id="select-teacher" aria-label="Seleccione docente">
                        <option value="">-- Seleccione un docente --</option>
                    </select>
                </div>

                <div id="student-evaluation-form" style="display: none;">
                    <div class="evaluation-scale mb-4">
                        <div class="scale-item">1: Muy en desacuerdo</div>
                        <div class="scale-item">2: En desacuerdo</div>
                        <div class="scale-item">3: Neutral</div>
                        <div class="scale-item">4: De acuerdo</div>
                        <div class="scale-item">5: Muy de acuerdo</div>
                    </div>

                    <form id="student-eval-form">
                        <div id="student-evaluation-items"></div>

                        <div class="mt-3">
                            <button type="submit" class="btn btn-primary">Enviar Evaluación</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `;
}

export function populateTeachers() {
    const select = document.getElementById('select-teacher');
    if (!select) return;
    // clear previous options except placeholder
    select.innerHTML = '<option value="">-- Seleccione un docente --</option>';
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.name} (${teacher.department})`;
        select.appendChild(option);
    });
}

export function renderStudentEvaluationItems() {
    const container = document.getElementById('student-evaluation-items');
    if (!container) return;
    container.innerHTML = '';

    studentEvaluationItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'evaluation-item mb-3';

        // "button" style radios from 1 to 5
        let buttonsHTML = '';
        for (let i = 1; i <= 5; i++) {
            buttonsHTML += `
                <input type="radio"
                    class="btn-check"
                    name="eval-${item.id}"
                    id="eval-${item.id}-${i}"
                    value="${i}"
                    data-id="${item.id}">
                <label class="btn btn-outline-secondary rounded-circle me-2" 
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
