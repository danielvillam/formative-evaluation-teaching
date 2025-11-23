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
    try {
        const data = await fetch('/api/getStudentQuestions');
        return await data.json();
    } catch (error) {
        console.error("Error al cargar preguntas de la base de datos", error);
        return null;
    }
}

export async function populateTeachers() {
    const select = document.getElementById('select-teacher');
    if (!select) return;

    // Clear previous options except for the placeholder
    select.innerHTML = '<option value="">-- Seleccione un docente --</option>';

    // Fetch teacher data from the database
    try {
        const teachers = await fetchTeachers();
        if (teachers && teachers.length > 0) {
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher._id || teacher.id;
                option.textContent = teacher.name + (teacher.subject ? ` - ${teacher.subject}` : '');
                select.appendChild(option);
            });
        } else {
            console.warn('No se encontraron docentes en la base de datos');
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay docentes disponibles';
            option.disabled = true;
            select.appendChild(option);
        }
    } catch (error) {
        console.error('Error al cargar docentes:', error);
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Error al cargar docentes';
        option.disabled = true;
        select.appendChild(option);
    }
}

export async function renderStudentEvaluationItems() {
    const container = document.getElementById('student-evaluation-items');
    if (!container) return;

    const data = await loadData();
    if (!data || !Array.isArray(data)) {
        console.error("No se encontraron preguntas de estudiantes en el formato esperado");
        return;
    }

    // Assign data to a global variable for later use
    window.studentEvaluationItems = data;

    container.innerHTML = '';

    data.forEach((item, index) => {
        const itemId = `student-${index + 1}`;
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

export async function fetchTeachers() {
    try {
        const response = await fetch('/api/get-teachers');
        if (!response.ok) {
            // Try to parse JSON error, but handle if it's HTML
            let errorMessage = 'Error al obtener los docentes';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Response is not JSON (probably HTML error page)
                const text = await response.text();
                console.error('Server returned non-JSON response:', text.substring(0, 200));
            }
            console.error('Error al obtener los docentes:', errorMessage);
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en fetchTeachers:', error);
        throw error;
    }
}

export async function submitStudentEvaluation(teacherId, evaluationData, userEmail, userRole) {
    if (!teacherId || !evaluationData || !userEmail || !userRole) {
        alert('Por favor, complete todos los campos antes de enviar la evaluación.');
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
        alert('¡Evaluación enviada correctamente!');
        window.location.href = '/'; // Redirige a la página de inicio
        return result;
    } catch (error) {
        console.error('Error al enviar la evaluación:', error);
        alert('Hubo un error al enviar la evaluación. Por favor, inténtelo de nuevo.');
        return null;
    }
}

