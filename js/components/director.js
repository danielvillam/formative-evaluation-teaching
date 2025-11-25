export function renderDirectorSection() {
    return `
    <div class="role-section" id="director-section">
        <div class="card">
           <div class="card-header role-director">
                <h4 class="mb-0">Panel de Directivos - Reportes y Analytics</h4>
                <div class="header-actions">
                    <button class="btn btn-sm btn-outline-light" id="refresh-director-data" title="Actualizar datos">
                        <i class="bi bi-arrow-clockwise"></i> Actualizar
                    </button>
                    <button class="btn btn-sm btn-outline-light" id="export-summary" title="Exportar resumen">
                        <i class="bi bi-download"></i> Exportar
                    </button>
                </div>
            </div>

            <div class="card-body">
                <div id="director-loading" style="display: none;">
                    <div class="text-center p-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2">Cargando estadísticas...</p>
                    </div>
                </div>

                <div id="director-content">
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card bg-primary text-white">
                                <div class="card-body">
                                    <h6 class="card-title">Total Docentes</h6>
                                    <h2 class="mb-0" id="stat-total-teachers">-</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-success text-white">
                                <div class="card-body">
                                    <h6 class="card-title">Evaluaciones Totales</h6>
                                    <h2 class="mb-0" id="stat-total-evaluations">-</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-info text-white">
                                <div class="card-body">
                                    <h6 class="card-title">Autoevaluaciones</h6>
                                    <h2 class="mb-0" id="stat-self-evaluations">-</h2>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card bg-warning text-dark">
                                <div class="card-body">
                                    <h6 class="card-title">Promedio General</h6>
                                    <h2 class="mb-0" id="stat-overall-average">-</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-4 mb-4">
                        <div class="col-lg-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Ranking de Docentes por Promedio</h5>
                                </div>
                                <div class="card-body">
                                    <canvas id="director-chart"></canvas>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Distribución de Evaluaciones</h5>
                                </div>
                                <div class="card-body">
                                    <canvas id="director-pie-chart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-4 mb-4">
                        <div class="col-lg-12">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Promedio por Categoría</h5>
                                </div>
                                <div class="card-body">
                                    <canvas id="director-radar-chart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <h5>Detalle de Docentes</h5>
                        <div class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Docente</th>
                                        <th>Autoevaluación</th>
                                        <th>Promedio Estudiantes</th>
                                        <th>Evaluaciones Recibidas</th>
                                        <th>Promedio General</th>
                                    </tr>
                                </thead>
                                <tbody id="teachers-detail-table"></tbody>
                            </table>
                        </div>
                    </div>

                    <div class="mt-4">
                        <button class="btn btn-primary" id="export-report">Exportar Reporte CSV</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

export async function loadDirectorData() {
    try {
        const response = await fetch('/api/get-director-stats');
        if (!response.ok) {
            throw new Error('Error al cargar estadísticas');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading director data:', error);
        throw error;
    }
}

export function updateDirectorDashboard(stats) {
    if (!stats) {
        console.error('No stats provided to updateDirectorDashboard');
        return;
    }

    // Update stat cards
    document.getElementById('stat-total-teachers').textContent = stats.totalTeachers || 0;
    document.getElementById('stat-total-evaluations').textContent = stats.totalEvaluations || 0;
    document.getElementById('stat-self-evaluations').textContent = stats.selfEvaluations || 0;
    document.getElementById('stat-overall-average').textContent = stats.overallAverage || '-';

    // Update teachers detail table
    const tableBody = document.getElementById('teachers-detail-table');
    if (tableBody && stats.teachers) {
        tableBody.innerHTML = '';
        
        // Sort teachers by overall average (descending)
        const sortedTeachers = [...stats.teachers].sort((a, b) => b.overallAverage - a.overallAverage);
        
        sortedTeachers.forEach(teacher => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${teacher.name}</td>
                <td>${teacher.hasSelfEvaluation ? `<span class="badge bg-primary">${teacher.selfAverage}</span>` : '<span class="text-muted">Sin datos</span>'}</td>
                <td>${teacher.studentEvaluationCount > 0 ? `<span class="badge bg-warning text-dark">${teacher.studentAverage}</span>` : '<span class="text-muted">Sin datos</span>'}</td>
                <td class="text-center">${teacher.studentEvaluationCount}</td>
                <td><strong>${teacher.overallAverage > 0 ? teacher.overallAverage : '-'}</strong></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Render charts
    renderDirectorCharts(stats);
}

export function renderDirectorCharts(stats) {
    if (!stats || !stats.teachers) {
        console.warn('No data available for charts');
        return;
    }

    // Filter teachers with data and sort by overall average
    const teachersWithData = stats.teachers
        .filter(t => t.overallAverage > 0)
        .sort((a, b) => b.overallAverage - a.overallAverage)
        .slice(0, 10); // Top 10 teachers

    // Bar Chart - Teacher Rankings
    const barCanvas = document.getElementById('director-chart');
    if (barCanvas && teachersWithData.length > 0) {
        const ctx = barCanvas.getContext('2d');
        if (window.directorChart) window.directorChart.destroy();
        
        window.directorChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: teachersWithData.map(t => t.name),
                datasets: [{
                    label: 'Promedio General',
                    data: teachersWithData.map(t => t.overallAverage),
                    backgroundColor: '#0d6efd'
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 5
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Pie Chart - Distribution of evaluations
    const pieCanvas = document.getElementById('director-pie-chart');
    if (pieCanvas) {
        const ctx = pieCanvas.getContext('2d');
        if (window.directorPieChart) window.directorPieChart.destroy();
        
        const teachersWithSelfEval = stats.teachers.filter(t => t.hasSelfEvaluation).length;
        const teachersWithStudentEval = stats.teachers.filter(t => t.studentEvaluationCount > 0).length;
        const teachersWithBoth = stats.teachers.filter(t => t.hasSelfEvaluation && t.studentEvaluationCount > 0).length;
        const teachersWithNone = stats.totalTeachers - teachersWithSelfEval - teachersWithStudentEval + teachersWithBoth;
        
        window.directorPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [
                    'Con ambas evaluaciones',
                    'Solo autoevaluación',
                    'Solo evaluación estudiantil',
                    'Sin evaluaciones'
                ],
                datasets: [{
                    data: [
                        teachersWithBoth,
                        teachersWithSelfEval - teachersWithBoth,
                        teachersWithStudentEval - teachersWithBoth,
                        teachersWithNone
                    ],
                    backgroundColor: ['#198754', '#0d6efd', '#ffc107', '#dc3545']
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Radar Chart - Category Averages
    const radarCanvas = document.getElementById('director-radar-chart');
    if (radarCanvas && Object.keys(stats.categoryAverages || {}).length > 0) {
        const ctx = radarCanvas.getContext('2d');
        if (window.directorRadarChart) window.directorRadarChart.destroy();
        
        const categories = Object.keys(stats.categoryAverages);
        const values = Object.values(stats.categoryAverages);
        
        window.directorRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Promedio por Categoría',
                    data: values,
                    backgroundColor: 'rgba(13,110,253,0.2)',
                    borderColor: '#0d6efd',
                    pointBackgroundColor: '#0d6efd'
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
    }
}

export function exportDirectorReport(stats) {
    if (!stats || !stats.teachers) {
        alert('No hay datos para exportar');
        return;
    }

    // Create CSV content
    let csv = 'Docente,Autoevaluación,Promedio Estudiantes,Evaluaciones Recibidas,Promedio General\n';
    
    stats.teachers.forEach(teacher => {
        csv += `"${teacher.name}",`;
        csv += `${teacher.hasSelfEvaluation ? teacher.selfAverage : 'N/A'},`;
        csv += `${teacher.studentEvaluationCount > 0 ? teacher.studentAverage : 'N/A'},`;
        csv += `${teacher.studentEvaluationCount},`;
        csv += `${teacher.overallAverage > 0 ? teacher.overallAverage : 'N/A'}\n`;
    });

    // Add summary
    csv += '\n';
    csv += `Total Docentes,${stats.totalTeachers}\n`;
    csv += `Total Evaluaciones,${stats.totalEvaluations}\n`;
    csv += `Autoevaluaciones,${stats.selfEvaluations}\n`;
    csv += `Evaluaciones de Estudiantes,${stats.studentEvaluations}\n`;
    csv += `Promedio General,${stats.overallAverage}\n`;

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_evaluaciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function updateDirectorChartAndTable(ctx) {
    // Deprecated function - now using updateDirectorDashboard
    console.warn('updateDirectorChartAndTable is deprecated. Use updateDirectorDashboard instead.');
}
