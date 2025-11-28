/**
 * @fileoverview Student evaluation handlers
 * @module handlers/studentHandlers
 */

import { appState } from '../state/appState.js';
import { showToast } from '../utils/toast.js';
import { DOM } from '../utils/dom.js';
import { populateTeachers, renderStudentEvaluationItems, submitStudentEvaluation } from '../components/student.js';

/**
 * Handle teacher selection change
 * @param {Event} e - Change event
 */
export function handleTeacherSelection(e) {
    if (!appState.hasRole('student') && !appState.hasRole('director')) {
        e.target.value = '';
        showToast('No tienes permiso para realizar evaluaciones estudiantiles.', { 
            type: 'danger' 
        });
        return;
    }

    if (e.target.value) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        
        if (selectedOption && selectedOption.dataset.evaluated === 'true') {
            e.target.value = '';
            showToast('Ya has evaluado a este docente.', { type: 'warning' });
            DOM.hide('student-evaluation-form');
            return;
        }

        DOM.show('student-evaluation-form');
        renderStudentEvaluationItems();
    } else {
        DOM.hide('student-evaluation-form');
    }
}

/**
 * Handle student evaluation form submission
 * @param {Event} e - Submit event
 */
export async function handleStudentEvaluationSubmit(e) {
    e.preventDefault();

    if (!appState.hasRole('student') && !appState.hasRole('director')) {
        showToast('No tienes permiso para enviar evaluaciones.', { type: 'danger' });
        return;
    }

    const studentForm = DOM.getElementById('student-eval-form');
    const items = appState.studentEvaluationItems;

    if (!items) {
        showToast('Error: No se cargaron las preguntas de evaluación.', { type: 'danger' });
        return;
    }

    // Remove previous error messages
    const errorMessages = document.querySelectorAll('.eval-error-msg');
    errorMessages.forEach(msg => msg.remove());

    // Validate all questions answered
    let allAnswered = true;
    items.forEach((item, index) => {
        const itemDiv = document.querySelector(
            `#student-evaluation-items > div:nth-child(${index + 1})`
        );
        if (!itemDiv) return;

        const radios = studentForm.querySelectorAll(`input[name='eval-student-${index + 1}']`);
        if (radios.length === 0) return;

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
        showToast('Por favor, responda todas las preguntas antes de enviar la evaluación.', {
            type: 'warning'
        });
        return;
    }

    // Collect scores
    const scores = {};
    items.forEach((item, index) => {
        const checked = studentForm.querySelector(
            `input[name='eval-student-${index + 1}']:checked`
        );
        scores[index + 1] = checked ? parseInt(checked.value, 10) : null;
    });

    const teacherId = DOM.getElementById('select-teacher').value;
    const userEmail = appState.getUserEmail();
    const userRole = appState.currentRole || 'student';

    console.log('Evaluación estudiantil enviada:', { teacherId, scores, userEmail, userRole });

    try {
        await submitStudentEvaluation(teacherId, scores, userEmail, userRole);

        showToast('¡Evaluación enviada con éxito! Su respuesta es anónima.', { 
            type: 'success' 
        });

        DOM.clearForm(studentForm);

        const selectTeacher = DOM.getElementById('select-teacher');
        if (selectTeacher) selectTeacher.value = '';

        DOM.hide('student-evaluation-form');

        // Reload teachers list to update evaluated status
        const studentEmail = appState.getUserEmail();
        if (studentEmail) {
            populateTeachers(studentEmail);
        }
    } catch (error) {
        console.error('Error al enviar evaluación:', error);
        showToast('Error al enviar la evaluación. Por favor, intente nuevamente.', {
            type: 'danger'
        });
    }
}
