/**
 * @fileoverview Director dashboard handlers
 * @module handlers/directorHandlers
 */

import { appState } from '../state/appState.js';
import { showToast } from '../utils/toast.js';
import { DOM } from '../utils/dom.js';
import { loadDirectorData, updateDirectorDashboard, exportDirectorReport } from '../components/director.js';

/**
 * Handle refresh director data button
 */
export async function handleRefreshDirectorData() {
    if (!appState.hasRole('director')) {
        showToast('No tienes permiso para actualizar datos.', { type: 'danger' });
        return;
    }

    const loadingDiv = DOM.getElementById('director-loading');
    const contentDiv = DOM.getElementById('director-content');

    DOM.show(loadingDiv);
    DOM.hide(contentDiv);

    try {
        const stats = await loadDirectorData();
        updateDirectorDashboard(stats);
        appState.directorStats = stats;
        showToast('Datos actualizados correctamente.', { type: 'success' });
    } catch (error) {
        console.error('Error refreshing director data:', error);
        showToast('Error al actualizar datos.', { type: 'danger' });
    } finally {
        DOM.hide(loadingDiv);
        DOM.show(contentDiv);
    }
}

/**
 * Handle export report button
 */
export function handleExportReport() {
    if (!appState.hasRole('director')) {
        showToast('No tienes permiso para exportar reportes.', { type: 'danger' });
        return;
    }

    if (appState.directorStats) {
        exportDirectorReport(appState.directorStats);
        showToast('Reporte exportado correctamente.', { type: 'success' });
    } else {
        showToast('No hay datos para exportar. Primero carga las estadísticas.', { 
            type: 'warning' 
        });
    }
}

/**
 * Handle export summary button
 */
export function handleExportSummary() {
    if (!appState.hasRole('director')) {
        showToast('No tienes permiso para exportar resumen.', { type: 'danger' });
        return;
    }

    if (appState.directorStats) {
        exportDirectorReport(appState.directorStats);
        showToast('Resumen exportado correctamente.', { type: 'success' });
    } else {
        showToast('No hay datos para exportar.', { type: 'warning' });
    }
}
