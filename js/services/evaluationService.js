/**
 * @fileoverview API service for evaluations
 * @module services/evaluationService
 */

/**
 * Fetch teacher questions from API
 * @returns {Promise<Array>}
 */
export async function getTeacherQuestions() {
    const response = await fetch('/api/getTeacherQuestions');
    if (!response.ok) {
        throw new Error('Failed to fetch teacher questions');
    }
    return await response.json();
}

/**
 * Fetch student questions from API
 * @returns {Promise<Array>}
 */
export async function getStudentQuestions() {
    const response = await fetch('/api/getStudentQuestions');
    if (!response.ok) {
        throw new Error('Failed to fetch student questions');
    }
    return await response.json();
}

/**
 * Submit evaluation
 * @param {Object} data - Evaluation data
 * @returns {Promise<Object>}
 */
export async function submitEvaluation(data) {
    const response = await fetch('/api/submit-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || 'Error al enviar evaluación');
    }

    return await response.json();
}

/**
 * Check if teacher completed self-evaluation
 * @param {string} teacherId - Teacher email/ID
 * @returns {Promise<Object>}
 */
export async function getTeacherSelfEvaluation(teacherId) {
    const response = await fetch(
        `/api/get-teacher-self-evaluation?teacherId=${encodeURIComponent(teacherId)}`
    );

    if (!response.ok) {
        throw new Error('Failed to check self-evaluation');
    }

    return await response.json();
}

/**
 * Get evaluated teachers for a student
 * @param {string} userEmail - Student email
 * @returns {Promise<Object>}
 */
export async function getStudentEvaluations(userEmail) {
    const response = await fetch(
        `/api/get-student-evaluations?userEmail=${encodeURIComponent(userEmail)}`
    );

    if (!response.ok) {
        throw new Error('Failed to get student evaluations');
    }

    return await response.json();
}

/**
 * Add teacher to database
 * @param {string} teacherId - Teacher email
 * @param {string} name - Teacher name
 * @returns {Promise<Object>}
 */
export async function addTeacher(teacherId, name) {
    const response = await fetch('/api/add-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, name })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add teacher');
    }

    return await response.json();
}
