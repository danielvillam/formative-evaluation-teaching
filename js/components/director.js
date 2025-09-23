import { reportData } from '../data.js';

export function renderDirectorSection() {
    return `
    <div class="role-section" id="director-section">
        <div class="card">
           <div class="card-header role-director">
                <h4 class="mb-0">Panel de Directivos - Reportes y Analytics</h4>
                <div class="header-actions">
                    <button class="btn btn-sm btn-outline-secondary" id="export-summary" title="Exportar resumen">
                        <i class="bi bi-download"></i> Exportar
                    </button>
                </div>
            </div>

            <div class="card-body">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <label for="report-type" class="form-label">Tipo de Reporte:</label>
                        <select class="form-select" id="report-type">
                            <option value="department">Por Departamento</option>
                            <option value="faculty">Por Facultad</option>
                            <option value="individual">Individual (Docente)</option>
                            <option value="trends">Tendencias Temporales</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="time-period" class="form-label">Período de Tiempo:</label>
                        <select class="form-select" id="time-period">
                            <option value="current">Actual (2023)</option>
                            <option value="previous">Anterior (2022)</option>
                            <option value="all">Todos los datos disponibles</option>
                        </select>
                    </div>
                </div>

                <div class="chart-container">
                    <canvas id="director-chart"></canvas>
                </div>

                <div class="mt-4">
                    <h5>Resumen de Indicadores</h5>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Indicador</th>
                                    <th>Valor Promedio</th>
                                    <th>Tendencia</th>
                                    <th>Comparativo Departamento</th>
                                </tr>
                            </thead>
                            <tbody id="indicators-table"></tbody>
                        </table>
                    </div>
                </div>

                <div class="mt-4">
                    <button class="btn btn-primary" id="export-report">Exportar Reporte</button>
                    <button class="btn btn-info" id="detailed-analysis">Análisis Detallado</button>
                </div>
            </div>
        </div>
    </div>
    `;
}

export function updateDirectorChartAndTable(ctx) {
    // safety checks
    if (!ctx) return console.warn('updateDirectorChartAndTable: canvas context is null');
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está cargado. No se generará el gráfico.');
        return;
    }

    const reportType = document.getElementById('report-type')?.value || 'department';
    const timePeriod = document.getElementById('time-period')?.value || 'current';

    const data = reportData[reportType] || { labels: [], values: [] };

    try {
        // destroy previous graph if it exists
        if (window.directorChart) window.directorChart.destroy();

        window.directorChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{ label: `Puntuación promedio (${timePeriod})`, data: data.values }]
            },
            options: {
                scales: { y: { beginAtZero: true, max: 5 } }
            }
        });
    } catch (err) {
        console.error('Error al dibujar el gráfico directorChart:', err);
    }

    // Update example table
    const tableBody = document.getElementById('indicators-table');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const indicators = [
        { name: "Identidad profesional", value: "4.3", trend: "↑", comparison: "+0.2" },
        { name: "Pedagogía", value: "4.1", trend: "→", comparison: "+0.1" },
        { name: "Conocimiento disciplinar", value: "4.5", trend: "↑", comparison: "+0.3" }
    ];
    indicators.forEach(ind => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${ind.name}</td><td>${ind.value}</td><td>${ind.trend}</td><td>${ind.comparison}</td>`;
        tableBody.appendChild(row);
    });
}
