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
                            <option value="cross">Cruce de Variables</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="time-period" class="form-label">Período de Tiempo:</label>
                        <select class="form-select" id="time-period">
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                            <option value="2020">2020</option>
                            <option value="all">Todos los datos disponibles</option>
                        </select>
                    </div>
                </div>

                <div class="row g-4">
                    <div class="col-lg-6">
                        <div class="chart-container mb-3">
                            <canvas id="director-chart"></canvas>
                        </div>
                        <div class="chart-container mb-3">
                            <canvas id="director-line-chart"></canvas>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="chart-container mb-3">
                            <canvas id="director-radar-chart"></canvas>
                        </div>
                        <div class="chart-container mb-3">
                            <canvas id="director-pie-chart"></canvas>
                        </div>
                    </div>
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
                    <h5>Cruce de Variables: Género vs. Promedio Evaluación</h5>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Género</th>
                                    <th>Promedio Evaluación</th>
                                    <th>Número de Docentes</th>
                                </tr>
                            </thead>
                            <tbody id="cross-table"></tbody>
                        </table>
                    </div>
                </div>

                <div class="mt-4">
                    <button class="btn btn-primary" id="export-report">Exportar Reporte</button>
                </div>
            </div>
        </div>
    </div>
    `;
}

export function updateDirectorChartAndTable(ctx) {
    // safety checks
    // Validate chart context and Chart.js availability
    if (!ctx) {
        if (typeof showToast === 'function') showToast('Chart context not found.', { type: 'danger' });
        else console.warn('updateDirectorChartAndTable: canvas context is null');
        return;
    }
    if (typeof Chart === 'undefined') {
        if (typeof showToast === 'function') showToast('Chart.js is not loaded. Chart will not be rendered.', { type: 'danger' });
        else console.warn('Chart.js is not loaded. Chart will not be rendered.');
        return;
    }

    const reportType = document.getElementById('report-type')?.value || 'department';
    const timePeriod = document.getElementById('time-period')?.value || 'current';
    const data = reportData[reportType] || { labels: [], values: [] };

    // --- Main Bar Chart ---
    try {
        if (window.directorChart) window.directorChart.destroy();
        window.directorChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{ label: `Puntuación promedio (${timePeriod})`, data: data.values, backgroundColor: '#0d6efd' }]
            },
            options: { scales: { y: { beginAtZero: true, max: 5 } } }
        });
    } catch (err) {
        if (typeof showToast === 'function') showToast('Error al dibujar el gráfico principal.', { type: 'danger' });
        else console.error('Error al dibujar el gráfico directorChart:', err);
    }

    // --- Temporal Line Chart ---
    const lineCanvas = document.getElementById('director-line-chart');
    if (lineCanvas) {
        try {
            if (window.directorLineChart) window.directorLineChart.destroy();
            window.directorLineChart = new Chart(lineCanvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['2021', '2022', '2023'],
                    datasets: [
                        { label: 'Identidad profesional', data: [4.0, 4.2, 4.3], borderColor: '#0d6efd', fill: false },
                        { label: 'Pedagogía', data: [3.9, 4.0, 4.1], borderColor: '#6610f2', fill: false },
                        { label: 'Conocimiento disciplinar', data: [4.2, 4.4, 4.5], borderColor: '#ffc107', fill: false }
                    ]
                },
                options: { scales: { y: { beginAtZero: true, max: 5 } } }
            });
        } catch (err) {
            if (typeof showToast === 'function') showToast('Error al dibujar el gráfico de líneas.', { type: 'danger' });
            else console.error('Error al dibujar directorLineChart:', err);
        }
    }

    // --- Category Radar Chart ---
    const radarCanvas = document.getElementById('director-radar-chart');
    if (radarCanvas) {
        try {
            if (window.directorRadarChart) window.directorRadarChart.destroy();
            window.directorRadarChart = new Chart(radarCanvas.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Identidad', 'Pedagogía', 'Disciplina', 'Innovación', 'Gestión'],
                    datasets: [
                        { label: 'Departamento A', data: [4.2, 4.0, 4.3, 3.9, 4.1], backgroundColor: 'rgba(13,110,253,0.2)', borderColor: '#0d6efd' },
                        { label: 'Departamento B', data: [4.0, 4.1, 4.2, 4.0, 4.0], backgroundColor: 'rgba(255,193,7,0.2)', borderColor: '#ffc107' }
                    ]
                },
                options: { scales: { r: { beginAtZero: true, max: 5 } } }
            });
        } catch (err) {
            if (typeof showToast === 'function') showToast('Error al dibujar el gráfico radar.', { type: 'danger' });
            else console.error('Error al dibujar directorRadarChart:', err);
        }
    }

    // --- Faculty Pie Chart ---
    const pieCanvas = document.getElementById('director-pie-chart');
    if (pieCanvas) {
        try {
            if (window.directorPieChart) window.directorPieChart.destroy();
            window.directorPieChart = new Chart(pieCanvas.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['Ciencias', 'Ingeniería', 'Humanidades', 'Salud'],
                    datasets: [{
                        data: [30, 25, 20, 25],
                        backgroundColor: ['#0d6efd', '#6610f2', '#ffc107', '#20c997']
                    }]
                }
            });
        } catch (err) {
            if (typeof showToast === 'function') showToast('Error al dibujar el gráfico de torta.', { type: 'danger' });
            else console.error('Error al dibujar directorPieChart:', err);
        }
    }

    // Update indicators summary table
    const tableBody = document.getElementById('indicators-table');
    if (tableBody) {
        tableBody.innerHTML = '';
        const indicators = [
            { name: "Identidad profesional", value: "4.3", trend: "↑", comparison: "+0.2" },
            { name: "Pedagogía", value: "4.1", trend: "→", comparison: "+0.1" },
            { name: "Conocimiento disciplinar", value: "4.5", trend: "↑", comparison: "+0.3" },
            { name: "Innovación", value: "4.0", trend: "→", comparison: "0.0" },
            { name: "Gestión", value: "4.2", trend: "↑", comparison: "+0.2" }
        ];
        indicators.forEach(ind => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${ind.name}</td><td>${ind.value}</td><td>${ind.trend}</td><td>${ind.comparison}</td>`;
            tableBody.appendChild(row);
        });
    }

    // Cross-tab: Gender vs. Evaluation Average
    const crossTable = document.getElementById('cross-table');
    if (crossTable) {
        crossTable.innerHTML = '';
        const crossData = [
            { genero: 'Femenino', promedio: '4.3', cantidad: 18 },
            { genero: 'Masculino', promedio: '4.1', cantidad: 22 },
            { genero: 'Otro/No responde', promedio: '4.0', cantidad: 3 }
        ];
        crossData.forEach(rowData => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${rowData.genero}</td><td>${rowData.promedio}</td><td>${rowData.cantidad}</td>`;
            crossTable.appendChild(row);
        });
    }
}
