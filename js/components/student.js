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
                        <div class="scale-item">1: Totalmente en desacuerdo</div>
                        <div class="scale-item">2: En desacuerdo</div>
                        <div class="scale-item">3: Indiferente</div>
                        <div class="scale-item">4: De acuerdo</div>
                        <div class="scale-item">5: Totalmente de acuerdo</div>
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

export async function loadData() {
    const response = await fetch('./data/data.json');
    if (!response.ok) {
        console.error("Error al cargar data.json");
        return null;
    }
    return await response.json();
}

export function populateTeachers() {
    const select = document.getElementById('select-teacher');
    if (!select) return;
    // Clear previous options except for the placeholder
    select.innerHTML = '<option value="">-- Seleccione un docente --</option>';
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = `${teacher.name} (${teacher.department})`;
        select.appendChild(option);
    });
}

export async function renderStudentEvaluationItems() {
    const container = document.getElementById('student-evaluation-items');
    if (!container) return;

    const data = await loadData();
    if (!data || !data.Estudiantes) {
        console.error("No se encontraron datos de Estudiantes en el JSON");
        return;
    }

    container.innerHTML = '';

    data.Estudiantes.forEach((text, index) => {
        const itemId = `student-${index + 1}`; // <--- más seguro que solo un número
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

