/**
 * Validation Functions
 * Funciones de validación para formularios y datos
 */

/**
 * Valida que todos los campos requeridos de un formulario estén completos
 * @param {Object} fields - Objeto con los valores de los campos
 * @returns {boolean}
 */
export function validateRequiredFields(fields) {
    return Object.values(fields).every(value => value && value.trim() !== '');
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida que la contraseña cumpla los requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @returns {Object} - {valid: boolean, message: string}
 */
export function validatePassword(password) {
    if (password.length < 8) {
        return {
            valid: false,
            message: 'La contraseña debe tener al menos 8 caracteres.'
        };
    }
    
    return { valid: true, message: '' };
}

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Primera contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {boolean}
 */
export function validatePasswordMatch(password, confirmPassword) {
    return password === confirmPassword;
}

/**
 * Valida que todas las preguntas de evaluación estén respondidas
 * @param {HTMLFormElement} form - Formulario con las preguntas
 * @param {Array} items - Array con los items de evaluación
 * @returns {Object} - {valid: boolean, unansweredCount: number}
 */
export function validateEvaluationForm(form, items) {
    let unansweredCount = 0;
    
    // Clear previous error messages
    form.querySelectorAll('.eval-error-msg').forEach(e => e.remove());
    
    const questions = form.querySelectorAll('.evaluation-item');
    
    questions.forEach((itemDiv, index) => {
        const radios = itemDiv.querySelectorAll('input[type="radio"]');
        const name = radios[0]?.name;
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        
        if (!checked) {
            unansweredCount++;
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
    
    return {
        valid: unansweredCount === 0,
        unansweredCount
    };
}

/**
 * Configura validación en tiempo real para coincidencia de contraseñas
 * @param {string} passwordId - ID del input de contraseña
 * @param {string} confirmPasswordId - ID del input de confirmación
 * @param {string} messageId - ID del elemento para mostrar el mensaje
 */
export function setupPasswordMatchValidation(passwordId, confirmPasswordId, messageId) {
    const regPassword = document.getElementById(passwordId);
    const regConfirmPassword = document.getElementById(confirmPasswordId);
    const passwordMatchMessage = document.getElementById(messageId);

    if (regPassword && regConfirmPassword && passwordMatchMessage) {
        const validateMatch = () => {
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

        regPassword.addEventListener('input', validateMatch);
        regConfirmPassword.addEventListener('input', validateMatch);
    }
}
