import{o as _}from"./@clerk-DKm5ZWPx.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function o(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(r){if(r.ep)return;r.ep=!0;const n=o(r);fetch(r.href,n)}})();function N(t=null,e=null){let o="";return e==="student"?o="Estudiante":e==="teacher"?o="Docente":e==="director"?o="Directivo":e&&(o=e),`
    <nav class="navbar">
        <div class="container d-flex align-items-center justify-content-between">
            <a class="navbar-brand" href="#">
                Sistema de evaluación formativa de la docencia
            </a>
            <div class="navbar-nav ms-auto d-flex align-items-center">
                ${t&&e?`
                    <div class="d-flex align-items-center me-3 navbar-text">
                        <i class="bi bi-person-circle fs-4 me-2"></i>
                        <div class="d-flex flex-column">
                            <span class="small">${t.email}</span>
                            <span class="badge badge-role ${e}">${o}</span>
                        </div>
                    </div>
                    <a class="nav-link text-danger fw-semibold" href="#" id="logout-btn">
                        <i class="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
                    </a>
                `:""}
            </div>
        </div>
    </nav>
    `}function U(){return`
    <div class="container mt-5" id="login-section">
        <div class="login-card">
            <div class="card">
                <div class="card-header bg-primary text-center">
                    <h4 class="mb-0 w-100 text-center">Iniciar Sesión</h4>
                </div>

                <div class="card-body">
                    <form id="login-form" autocomplete="on">
                        <div class="mb-3">
                            <label for="email" class="form-label">Correo Electrónico</label>
                            <input type="email" class="form-control" id="email" placeholder="ejemplo@correo.com" required>
                        </div>

                        <div class="mb-3 position-relative">
                            <label for="password" class="form-label">Contraseña</label>
                            <div class="d-flex">
                                <input type="password" class="form-control" id="password" placeholder="********" required aria-describedby="toggle-password" style="border-top-right-radius:0;border-bottom-right-radius:0;">
                                <button type="button" class="btn btn-outline-secondary" id="toggle-password" aria-pressed="false" aria-label="Mostrar contraseña" style="border-top-left-radius:0;border-bottom-left-radius:0;">
                                    <i class="bi bi-eye" id="toggle-password-icon"></i>
                                </button>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="role" class="form-label">Rol</label>
                            <select class="form-select" id="role" aria-label="Selecciona tu rol" required>
                                <option value="">-- Seleccione un rol --</option>
                                <option value="student">Estudiante</option>
                                <option value="teacher">Docente</option>
                                <option value="director">Directivo</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 d-flex justify-content-center align-items-center">Ingresar</button>
                    </form>
                </div>

                <div class="card-footer text-center small text-muted">
                    <p class="mt-3">¿No tienes una cuenta? <button id="show-registration" class="btn btn-link">Regístrate aquí</button></p>
                    <div class="mb-1">
                        <strong>Ejemplo:</strong> Correo: prueba@unal.edu.co | Contraseña: 123
                    </div>
                    <br>
                    <i>Acceso al Sistema de Evaluación Formativa</i>
                </div>
            </div>
        </div>
    </div>
    `}function G(){return`
    <div class="role-section" id="teacher-section">
        <!-- Modal Plan de Mejora -->
        <div class="modal fade" id="improvementPlanModal" tabindex="-1" aria-labelledby="improvementPlanModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="improvementPlanModalLabel">Crear Plan de Mejora Docente</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <form id="improvement-plan-form">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="plan-goal" class="form-label">Meta principal</label>
                                <input type="text" class="form-control" id="plan-goal" name="goal" required placeholder="Ej: Mejorar la participación estudiantil en clase">
                            </div>
                            <div class="mb-3">
                                <label for="plan-actions" class="form-label">Acciones a implementar</label>
                                <textarea class="form-control" id="plan-actions" name="actions" rows="3" required placeholder="Describa las acciones concretas..."></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="plan-indicators" class="form-label">Indicadores de éxito</label>
                                <input type="text" class="form-control" id="plan-indicators" name="indicators" required placeholder="Ej: Aumento del 20% en participación oral">
                            </div>
                            <div class="mb-3">
                                <label for="plan-deadline" class="form-label">Fecha límite</label>
                                <input type="date" class="form-control" id="plan-deadline" name="deadline" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-success">Guardar Plan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="card dashboard-card">
                    <div class="card-header role-teacher">
                        <h5 class="mb-0">Autoevaluación</h5>
                        <div class="header-actions">
                            <span class="badge badge-role teacher">Docente</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Complete su autoevaluación formativa para reflexionar sobre su práctica docente.</p>
                        <button class="btn btn-primary" id="start-self-eval">Comenzar Autoevaluación</button>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card dashboard-card">
                    <div class="card-header role-teacher">
                        <h5 class="mb-0">Resultados</h5>
                        <div class="header-actions">
                            <button class="btn btn-sm btn-outline-secondary" id="download-results" title="Descargar">
                                <i class="bi bi-download"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Revise sus resultados de autoevaluación y comparativos con percepciones estudiantiles.</p>
                        <button class="btn btn-primary" id="view-results">Ver Resultados</button>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card dashboard-card">
                    <div class="card-header role-teacher">
                        <h5 class="mb-0">Plan de Mejora</h5>
                        <div class="header-actions">
                            <button class="btn btn-sm btn-outline-secondary" id="open-plan" title="Ver plan">
                                <i class="bi bi-journal-text"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Desarrolle y documente su plan de mejora continua basado en los resultados.</p>
                        <button class="btn btn-primary" id="improvement-plan">Crear Plan</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-4" id="self-evaluation-form" style="display: none;">
            <div class="card">
                <div class="card-header role-teacher">
                    <h4 class="mb-0">Formulario de Autoevaluación Docente</h4>
                    <div class="header-actions">
                        <span class="badge badge-role teacher">Docente</span>
                    </div>
                </div>
                <div class="card-body">
                    <p>Evalúe su desempeño según la siguiente escala:</p>
                    <div class="evaluation-scale">
                        <div class="scale-item">1: Totalmente en desacuerdo</div>
                        <div class="scale-item">2: En desacuerdo</div>
                        <div class="scale-item">3: Indiferente</div>
                        <div class="scale-item">4: De acuerdo</div>
                        <div class="scale-item">5: Totalmente de acuerdo</div>
                    </div>

                    <form id="teacher-eval-form">
                        <div id="teacher-evaluation-items"></div>

                        <div class="mt-4">
                            <h5>Reflexión sobre la práctica docente</h5>
                            <textarea class="form-control" id="reflection" rows="4" placeholder="Escriba aquí sus reflexiones..."></textarea>
                        </div>

                        <div class="mt-3 d-flex gap-2">
                            <button type="submit" class="btn btn-success">Enviar Evaluación</button>
                            <button type="button" class="btn btn-secondary" id="cancel-eval">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="mt-4" id="results-visualization" style="display: none;">
            <div class="card">
                <div class="card-header role-teacher">
                    <h4 class="mb-0">Resultados de Evaluación</h4>
                    <div class="header-actions">
                        <button class="btn btn-sm btn-outline-secondary" id="refresh-results" title="Refrescar">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-lg-6 mb-4">
                            <div class="chart-container">
                                <canvas id="results-chart"></canvas>
                            </div>
                        </div>
                        <div class="col-lg-6 mb-4">
                            <h5>Comparativo con evaluación estudiantil</h5>
                            <div class="chart-container">
                                <canvas id="comparison-chart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h5 class="mb-3">Tabla comparativa por pregunta</h5>
                        <div class="table-responsive">
                            <table class="table table-bordered align-middle" id="results-comparison-table">
                                <thead class="table-light">
                                    <tr>
                                        <th>Pregunta</th>
                                        <th>Autoevaluación</th>
                                        <th>Promedio Estudiantil</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Se llenará dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h5 class="mb-3">Resumen y oportunidades de mejora</h5>
                        <div id="results-summary" class="alert alert-info" style="min-height:2.5em"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `}async function J(){try{return await(await fetch("/api/getTeacherQuestions")).json()}catch(t){return console.error("Error al cargar preguntas de la base de datos",t),null}}async function Z(){const t=document.getElementById("teacher-evaluation-items");if(!t)return;const e=await J();if(!e||!Array.isArray(e)){console.error("No se encontraron preguntas de docentes en el formato esperado");return}window.evaluationItems=e,t.innerHTML="",e.forEach((o,a)=>{const r=`teacher-${a+1}`,n=document.createElement("div");n.className="evaluation-item mb-3";let s="";for(let d=1;d<=5;d++)s+=`
                <input type="radio"
                    class="btn-check"
                    name="eval-${r}"
                    id="eval-${r}-${d}"
                    value="${d}"
                    data-id="${r}">
                <label class="btn btn-outline-primary rounded-circle me-2" 
                    for="eval-${r}-${d}">
                    ${d}
                </label>
            `;n.innerHTML=`
            <h6 class="mb-2">${o.question}</h6>
            <div class="d-flex align-items-center">
                ${s}
            </div>
        `,t.appendChild(n)})}function W(){return`
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
    `}async function Y(){try{return await(await fetch("/api/getStudentQuestions")).json()}catch(t){return console.error("Error al cargar preguntas de la base de datos",t),null}}async function K(){const t=document.getElementById("select-teacher");if(t){t.innerHTML='<option value="">-- Seleccione un docente --</option>';try{const e=await X();if(e&&e.length>0)e.forEach(o=>{const a=document.createElement("option");a.value=o._id||o.id,a.textContent=o.name+(o.subject?` - ${o.subject}`:""),t.appendChild(a)});else{console.warn("No se encontraron docentes en la base de datos");const o=document.createElement("option");o.value="",o.textContent="No hay docentes disponibles",o.disabled=!0,t.appendChild(o)}}catch(e){console.error("Error al cargar docentes:",e);const o=document.createElement("option");o.value="",o.textContent="Error al cargar docentes",o.disabled=!0,t.appendChild(o)}}}async function Q(){const t=document.getElementById("student-evaluation-items");if(!t)return;const e=await Y();if(!e||!Array.isArray(e)){console.error("No se encontraron preguntas de estudiantes en el formato esperado");return}window.studentEvaluationItems=e,t.innerHTML="",e.forEach((o,a)=>{const r=`student-${a+1}`,n=document.createElement("div");n.className="evaluation-item mb-3";let s="";for(let d=1;d<=5;d++)s+=`
                <input type="radio"
                    class="btn-check"
                    name="eval-${r}"
                    id="eval-${r}-${d}"
                    value="${d}"
                    data-id="${r}">
                <label class="btn btn-outline-primary rounded-circle me-2" 
                    for="eval-${r}-${d}">
                    ${d}
                </label>
            `;n.innerHTML=`
            <h6 class="mb-2">${o.question}</h6>
            <div class="d-flex align-items-center">
                ${s}
            </div>
        `,t.appendChild(n)})}async function X(){try{const t=await fetch("/api/get-teachers");if(!t.ok){let e="Error al obtener los docentes";const o=t.headers.get("content-type");if(o&&o.includes("application/json"))try{e=(await t.json()).message||e}catch(a){console.error("Error parsing JSON response:",a)}else try{const a=await t.text();console.error("Server returned non-JSON response (status "+t.status+"):",a.substring(0,200))}catch(a){console.error("Error reading response text:",a)}throw console.error("Error al obtener los docentes:",e),new Error(e)}return await t.json()}catch(t){throw console.error("Error en fetchTeachers:",t),t}}async function ee(t,e,o,a){if(!t||!e||!o||!a)return alert("Por favor, complete todos los campos antes de enviar la evaluación."),null;try{const r=await fetch("/api/submit-evaluation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({teacherId:t,evaluationData:e,userEmail:o,userRole:a})});if(!r.ok){const s=await r.json();throw new Error(`Error del servidor: ${s.message||"Error desconocido"}`)}const n=await r.json();return alert("¡Evaluación enviada correctamente!"),window.location.href="/",n}catch(r){return console.error("Error al enviar la evaluación:",r),alert("Hubo un error al enviar la evaluación. Por favor, inténtelo de nuevo."),null}}function te(){return`
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
    `}function F(t){var A,w;if(!t){typeof showToast=="function"?showToast("Chart context not found.",{type:"danger"}):console.warn("updateDirectorChartAndTable: canvas context is null");return}if(typeof Chart>"u"){typeof showToast=="function"?showToast("Chart.js is not loaded. Chart will not be rendered.",{type:"danger"}):console.warn("Chart.js is not loaded. Chart will not be rendered.");return}const e=((A=document.getElementById("report-type"))==null?void 0:A.value)||"department",o=((w=document.getElementById("time-period"))==null?void 0:w.value)||"current",a=reportData[e]||{labels:[],values:[]};try{window.directorChart&&window.directorChart.destroy(),window.directorChart=new Chart(t,{type:"bar",data:{labels:a.labels,datasets:[{label:`Puntuación promedio (${o})`,data:a.values,backgroundColor:"#0d6efd"}]},options:{scales:{y:{beginAtZero:!0,max:5}}}})}catch(u){typeof showToast=="function"?showToast("Error al dibujar el gráfico principal.",{type:"danger"}):console.error("Error al dibujar el gráfico directorChart:",u)}const r=document.getElementById("director-line-chart");if(r)try{window.directorLineChart&&window.directorLineChart.destroy(),window.directorLineChart=new Chart(r.getContext("2d"),{type:"line",data:{labels:["2021","2022","2023"],datasets:[{label:"Identidad profesional",data:[4,4.2,4.3],borderColor:"#0d6efd",fill:!1},{label:"Pedagogía",data:[3.9,4,4.1],borderColor:"#6610f2",fill:!1},{label:"Conocimiento disciplinar",data:[4.2,4.4,4.5],borderColor:"#ffc107",fill:!1}]},options:{scales:{y:{beginAtZero:!0,max:5}}}})}catch(u){typeof showToast=="function"?showToast("Error al dibujar el gráfico de líneas.",{type:"danger"}):console.error("Error al dibujar directorLineChart:",u)}const n=document.getElementById("director-radar-chart");if(n)try{window.directorRadarChart&&window.directorRadarChart.destroy(),window.directorRadarChart=new Chart(n.getContext("2d"),{type:"radar",data:{labels:["Identidad","Pedagogía","Disciplina","Innovación","Gestión"],datasets:[{label:"Departamento A",data:[4.2,4,4.3,3.9,4.1],backgroundColor:"rgba(13,110,253,0.2)",borderColor:"#0d6efd"},{label:"Departamento B",data:[4,4.1,4.2,4,4],backgroundColor:"rgba(255,193,7,0.2)",borderColor:"#ffc107"}]},options:{scales:{r:{beginAtZero:!0,max:5}}}})}catch(u){typeof showToast=="function"?showToast("Error al dibujar el gráfico radar.",{type:"danger"}):console.error("Error al dibujar directorRadarChart:",u)}const s=document.getElementById("director-pie-chart");if(s)try{window.directorPieChart&&window.directorPieChart.destroy(),window.directorPieChart=new Chart(s.getContext("2d"),{type:"pie",data:{labels:["Ciencias","Ingeniería","Humanidades","Salud"],datasets:[{data:[30,25,20,25],backgroundColor:["#0d6efd","#6610f2","#ffc107","#20c997"]}]}})}catch(u){typeof showToast=="function"?showToast("Error al dibujar el gráfico de torta.",{type:"danger"}):console.error("Error al dibujar directorPieChart:",u)}const d=document.getElementById("indicators-table");d&&(d.innerHTML="",[{name:"Identidad profesional",value:"4.3",trend:"↑",comparison:"+0.2"},{name:"Pedagogía",value:"4.1",trend:"→",comparison:"+0.1"},{name:"Conocimiento disciplinar",value:"4.5",trend:"↑",comparison:"+0.3"},{name:"Innovación",value:"4.0",trend:"→",comparison:"0.0"},{name:"Gestión",value:"4.2",trend:"↑",comparison:"+0.2"}].forEach(C=>{const S=document.createElement("tr");S.innerHTML=`<td>${C.name}</td><td>${C.value}</td><td>${C.trend}</td><td>${C.comparison}</td>`,d.appendChild(S)}));const f=document.getElementById("cross-table");f&&(f.innerHTML="",[{genero:"Femenino",promedio:"4.3",cantidad:18},{genero:"Masculino",promedio:"4.1",cantidad:22},{genero:"Otro/No responde",promedio:"4.0",cantidad:3}].forEach(C=>{const S=document.createElement("tr");S.innerHTML=`<td>${C.genero}</td><td>${C.promedio}</td><td>${C.cantidad}</td>`,f.appendChild(S)}))}function l(t,e={}){const o=document.getElementById("toast-container");if(!o)return alert(t);const a=document.createElement("div");a.className=`toast align-items-center text-bg-${e.type||"primary"} border-0`,a.setAttribute("role","alert"),a.setAttribute("aria-live","assertive"),a.setAttribute("aria-atomic","true"),a.style.minWidth="250px",a.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${t}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
    `,o.appendChild(a),new bootstrap.Toast(a,{delay:e.delay||3500}).show(),a.addEventListener("hidden.bs.toast",()=>a.remove())}let B=null,b=null,L=null,O=!1;const ae="pk_test_bmF0aW9uYWwtbWFydGVuLTMuY2xlcmsuYWNjb3VudHMuZGV2JA";O||(L=new _(ae),L.load().then(()=>{console.info("Clerk initialized successfully")}).catch(t=>{console.error("Failed to load Clerk, falling back to demo mode:",t),O=!0}));const oe=document.getElementById("navbar-container");oe.innerHTML=N();const ne=document.getElementById("main-container"),re=`
<div id="app-section">
    <SignedIn>
        ${U()}
        ${G()}
        ${W()}
        ${te()}
    </SignedIn>
    <SignedOut>
        <RedirectToSignIn />
    </SignedOut>
</div>`;ne.innerHTML=re;function g(t){return b===t}function q(){var o,a,r;const t=document.querySelectorAll(".tab-button"),e=document.querySelectorAll(".role-section");t.forEach(n=>{const s=n.dataset.role;n.style.display=s===b?"":"none",n.classList.toggle("active",s===b)}),e.forEach(n=>{const s=n.id.replace("-section","");n.style.display=s===b?"":"none",n.classList.toggle("active-section",s===b)}),(o=document.getElementById("self-evaluation-form"))!=null&&o.style&&(document.getElementById("self-evaluation-form").style.display="none"),(a=document.getElementById("results-visualization"))!=null&&a.style&&(document.getElementById("results-visualization").style.display="none"),(r=document.getElementById("student-evaluation-form"))!=null&&r.style&&(document.getElementById("student-evaluation-form").style.display="none")}function R(t){var e,o,a;if(!b){l("Debes iniciar sesión.",{type:"danger"});return}if(t!==b){l("No tienes permisos para ver este rol.",{type:"danger"}),q();return}if(document.querySelectorAll(".tab-button").forEach(r=>r.classList.toggle("active",r.dataset.role===t)),document.querySelectorAll(".role-section").forEach(r=>r.classList.toggle("active-section",r.id===`${t}-section`)),(e=document.getElementById("self-evaluation-form"))!=null&&e.style&&(document.getElementById("self-evaluation-form").style.display="none"),(o=document.getElementById("results-visualization"))!=null&&o.style&&(document.getElementById("results-visualization").style.display="none"),t==="director"){const r=(a=document.getElementById("director-chart"))==null?void 0:a.getContext("2d");r&&F(r)}}function se(){const t=document.getElementById("login-form");t&&t.addEventListener("submit",ce);const e=document.getElementById("logout-btn");e&&e.addEventListener("click",H),document.querySelectorAll(".tab-button").forEach(i=>{i.addEventListener("click",()=>R(i.dataset.role))});const o=document.getElementById("start-self-eval");o&&o.addEventListener("click",()=>{if(!g("teacher")&&!g("director"))return l("No tienes permiso para iniciar una autoevaluación docente.",{type:"danger"});const i=document.getElementById("results-visualization");i&&(i.style.display="none");const c=document.getElementById("self-evaluation-form");c?(c.style.display="block",Z(),c.scrollIntoView({behavior:"smooth",block:"start"})):console.error('El elemento con ID "self-evaluation-form" no existe en el DOM.')});const a=document.getElementById("cancel-eval");a&&a.addEventListener("click",()=>{const i=document.getElementById("self-evaluation-form");i&&(i.style.display="none"),l("Autoevaluación cancelada.",{type:"secondary",delay:2e3})});const r=document.getElementById("toggle-password");r&&r.addEventListener("click",()=>{const i=document.getElementById("password"),c=document.getElementById("toggle-password-icon");if(!i)return;const y=i.type==="password";i.type=y?"text":"password",r.setAttribute("aria-pressed",String(y)),r.setAttribute("aria-label",y?"Ocultar contraseña":"Mostrar contraseña"),c&&(c.classList.toggle("bi-eye",!y),c.classList.toggle("bi-eye-slash",y)),i.focus()});const n=document.getElementById("view-results");n&&n.addEventListener("click",()=>{if(!g("teacher")&&!g("director"))return l("No tienes permiso para ver los resultados.",{type:"danger"});const i=document.getElementById("self-evaluation-form");i&&(i.style.display="none");const c=document.getElementById("results-visualization");c&&(c.style.display="block");const y=evaluationItems.map(m=>Math.round(3.5+Math.random()*1.5*10)/10),$=evaluationItems.map(m=>Math.round(3+Math.random()*2*10)/10),x=[...new Set(evaluationItems.map(m=>m.category))],k=x.map(m=>{const E=evaluationItems.map((v,p)=>v.category===m?p:-1).filter(v=>v!==-1);return Math.round(E.reduce((v,p)=>v+y[p],0)/E.length*10)/10}),T=x.map(m=>{const E=evaluationItems.map((v,p)=>v.category===m?p:-1).filter(v=>v!==-1);return Math.round(E.reduce((v,p)=>v+$[p],0)/E.length*10)/10}),D=document.getElementById("results-chart");if(D){const m=D.getContext("2d");m&&(window.resultsChart&&window.resultsChart.destroy(),window.resultsChart=new Chart(m,{type:"bar",data:{labels:x,datasets:[{label:"Autoevaluación",data:k,backgroundColor:"#0d6efd"},{label:"Estudiantes",data:T,backgroundColor:"#ffc107"}]},options:{scales:{y:{beginAtZero:!0,max:5}}}}))}const h=document.getElementById("comparison-chart");if(h){const m=h.getContext("2d");m&&(window.comparisonChart&&window.comparisonChart.destroy(),window.comparisonChart=new Chart(m,{type:"radar",data:{labels:x,datasets:[{label:"Autoevaluación",data:k,backgroundColor:"rgba(13,110,253,0.2)",borderColor:"#0d6efd",pointBackgroundColor:"#0d6efd"},{label:"Estudiantes",data:T,backgroundColor:"rgba(255,193,7,0.2)",borderColor:"#ffc107",pointBackgroundColor:"#ffc107"}]},options:{scales:{r:{beginAtZero:!0,max:5}}}}))}const I=document.querySelector("#results-comparison-table tbody");I&&(I.innerHTML="",evaluationItems.forEach((m,E)=>{const v=document.createElement("tr");v.innerHTML=`
                    <td>${m.text}</td>
                    <td class="text-center">${y[E]}</td>
                    <td class="text-center">${$[E]}</td>
                `,I.appendChild(v)}));const P=document.getElementById("results-summary");if(P){let m=[],E=[];evaluationItems.forEach((p,M)=>{const V=y[M]-$[M];V>=.5?m.push(p.text):V<=-.5&&E.push(p.text)});let v="";m.length>0&&(v+=`<b>Fortalezas percibidas:</b> <ul>${m.map(p=>`<li>${p}</li>`).join("")}</ul>`),E.length>0&&(v+=`<b>Oportunidades de mejora:</b> <ul>${E.map(p=>`<li>${p}</li>`).join("")}</ul>`),v||(v="No se detectaron diferencias significativas entre autoevaluación y percepción estudiantil."),P.innerHTML=v}c.scrollIntoView({behavior:"smooth",block:"start"})});const s=document.getElementById("teacher-eval-form");s&&s.addEventListener("submit",i=>{if(i.preventDefault(),!g("teacher")&&!g("director"))return l("No tienes permiso para enviar esta evaluación.",{type:"danger"});let c=!0;if(s.querySelectorAll(".eval-error-msg").forEach(h=>h.remove()),s.querySelectorAll(".evaluation-item").forEach((h,I)=>{var v;const m=(v=h.querySelectorAll('input[type="radio"]')[0])==null?void 0:v.name;if(!f.querySelector(`input[name="${m}"]:checked`)){c=!1;const p=document.createElement("span");p.className="eval-error-msg",p.textContent="Por favor responde esta pregunta.",p.style.display="block",p.style.color="#dc3545",p.style.fontSize="0.95em",p.style.marginTop="0.25rem",h.appendChild(p)}}),!c){l("Por favor, responda todas las preguntas antes de enviar la evaluación.",{type:"warning"});return}const $={};evaluationItems.forEach(h=>{const I=s.querySelector(`input[name='eval-${h.id}']:checked`);$[h.id]=I?parseInt(I.value,10):null});const x=document.getElementById("reflection").value;console.log("Evaluación enviada:",{scores:$,reflection:x}),l("¡Evaluación enviada con éxito!",{type:"success"});const k=document.getElementById("self-evaluation-form");k&&(k.style.display="none");const T=document.getElementById("results-visualization");T&&(T.style.display="none"),evaluationItems.forEach(h=>{document.getElementsByName(`eval-${h.id}`).forEach(P=>P.checked=!1)});const D=document.getElementById("reflection");D&&(D.value="")}),K();const d=document.getElementById("select-teacher");d&&d.addEventListener("change",function(){if(!g("student")&&!g("director"))return this.value="",l("No tienes permiso para realizar evaluaciones estudiantiles.",{type:"danger"});if(this.value){const i=document.getElementById("student-evaluation-form");i&&(i.style.display="block"),Q()}else{const i=document.getElementById("student-evaluation-form");i&&(i.style.display="none")}});const f=document.getElementById("student-eval-form");f&&f.addEventListener("submit",i=>{if(i.preventDefault(),!g("student")&&!g("director"))return l("No tienes permiso para enviar esta evaluación.",{type:"danger"});const c=window.studentEvaluationItems||studentEvaluationItems;let y=!0;if(f.querySelectorAll(".eval-error-msg").forEach(I=>I.remove()),f.querySelectorAll(".evaluation-item").forEach((I,P)=>{var p;const E=(p=I.querySelectorAll('input[type="radio"]')[0])==null?void 0:p.name;if(!f.querySelector(`input[name="${E}"]:checked`)){y=!1;const M=document.createElement("span");M.className="eval-error-msg",M.textContent="Por favor responde esta pregunta.",M.style.display="block",M.style.color="#dc3545",M.style.fontSize="0.95em",M.style.marginTop="0.25rem",I.appendChild(M)}}),!y){l("Por favor, responda todas las preguntas antes de enviar la evaluación.",{type:"warning"});return}const x={};c.forEach((I,P)=>{const m=f.querySelector(`input[name='eval-student-${P+1}']:checked`);x[P+1]=m?parseInt(m.value,10):null});const k=document.getElementById("select-teacher").value,T=(B==null?void 0:B.email)||"anonimo",D=b||"student";console.log("Evaluación estudiantil enviada:",{teacherId:k,scores:x,userEmail:T,userRole:D}),ee(k,x,T,D),l("¡Evaluación enviada con éxito! Su respuesta es anónima.",{type:"success"}),f.reset(),d&&(d.value="");const h=document.getElementById("student-evaluation-form");h&&(h.style.display="none")});const A=document.getElementById("report-type"),w=document.getElementById("time-period");A&&A.addEventListener("change",()=>{var c;if(!g("director"))return alert("No tienes permiso para cambiar los filtros de administración.");const i=(c=document.getElementById("director-chart"))==null?void 0:c.getContext("2d");i&&F(i)}),w&&w.addEventListener("change",()=>{var c;if(!g("director"))return alert("No tienes permiso para cambiar los filtros de administración.");const i=(c=document.getElementById("director-chart"))==null?void 0:c.getContext("2d");i&&F(i)});const u=document.getElementById("export-report");u&&u.addEventListener("click",()=>{if(!g("director"))return l("No tienes permiso para exportar reportes.",{type:"danger"});l("Funcionalidad de exportación (marchar a backend)",{type:"info"})});const C=document.getElementById("detailed-analysis");C&&C.addEventListener("click",()=>{if(!g("director"))return alert("No tienes permiso para ver análisis detallado.");alert("Funcionalidad de análisis detallado (marchar a backend)")});const S=document.getElementById("open-plan");S&&S.addEventListener("click",()=>{if(!g("teacher")&&!g("director"))return alert("No tienes permiso para ver el plan.");alert("Aquí se abriría el Plan de Mejora (implementa modal o navegación).")});const z=document.getElementById("improvement-plan");z&&z.addEventListener("click",()=>{var c,y;if(!g("teacher")&&!g("director"))return l("No tienes permiso para crear un plan de mejora.",{type:"danger"});(c=document.getElementById("self-evaluation-form"))!=null&&c.style&&(document.getElementById("self-evaluation-form").style.display="none"),(y=document.getElementById("results-visualization"))!=null&&y.style&&(document.getElementById("results-visualization").style.display="none");const i=document.getElementById("improvementPlanModal");i&&new bootstrap.Modal(i).show()});const j=document.getElementById("improvement-plan-form");j&&j.addEventListener("submit",function(i){i.preventDefault();const c=j.goal.value.trim(),y=j.actions.value.trim(),$=j.indicators.value.trim(),x=j.deadline.value;if(!c||!y||!$||!x){l("Por favor complete todos los campos.",{type:"warning"});return}l("¡Plan de mejora guardado exitosamente!",{type:"success"});const k=document.getElementById("improvementPlanModal");if(k){const T=bootstrap.Modal.getInstance(k);T&&T.hide()}j.reset()})}function ie(){return`
    <div id="registration-section" class="container mt-5">
        <div class="login-card">
            <div class="card">
                <div class="card-header bg-success text-center">
                    <h4 class="mb-0 w-100 text-center">Registro de Usuario</h4>
                </div>
                <div class="card-body">
                    <form id="registration-form">
                        <div class="mb-3">
                            <label for="reg-email" class="form-label">Correo Electrónico</label>
                            <input type="email" class="form-control" id="reg-email" placeholder="ejemplo@correo.com" required>
                        </div>
                        <div class="mb-3">
                            <label for="reg-password" class="form-label">Contraseña</label>
                            <input type="password" class="form-control" id="reg-password" placeholder="Mínimo 8 caracteres" minlength="8" required>
                            <div class="form-text">
                                <small>
                                    <i class="bi bi-info-circle"></i> La contraseña debe tener:
                                    <ul class="mb-0 mt-1" style="font-size: 0.85rem;">
                                        <li>Al menos 8 caracteres</li>
                                        <li>Combinación de letras y números</li>
                                        <li>Caracteres especiales recomendados (@, #, !, etc.)</li>
                                    </ul>
                                </small>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="reg-role" class="form-label">Rol</label>
                            <select class="form-select" id="reg-role" required>
                                <option value="">-- Seleccione un rol --</option>
                                <option value="student">Estudiante</option>
                                <option value="teacher">Docente</option>
                                <option value="director">Directivo</option>
                            </select>
                        </div>
                        <div id="clerk-captcha" class="mb-3"></div>
                        <button type="submit" class="btn btn-success w-100">Registrarse</button>
                    </form>
                </div>
                <div class="card-footer text-center">
                    <button id="show-login" class="btn btn-link">¿Ya tienes una cuenta? Inicia sesión aquí</button>
                </div>
            </div>
        </div>
    </div>`}async function le(t){var r;t.preventDefault();const e=document.getElementById("reg-email").value.trim(),o=document.getElementById("reg-password").value,a=document.getElementById("reg-role").value;if(!e||!o||!a){l("Por favor completa todos los campos.",{type:"warning"});return}if(o.length<8){l("La contraseña debe tener al menos 8 caracteres.",{type:"warning"});return}if(O||!L){const n=JSON.parse(localStorage.getItem("demo_users")||"[]");if(n.find(d=>d.email===e)){l("Este correo ya está registrado.",{type:"warning"});return}n.push({email:e,password:o,role:a}),localStorage.setItem("demo_users",JSON.stringify(n)),l("✓ Usuario registrado con éxito (modo demo)",{type:"success"}),document.getElementById("registration-form").reset(),document.getElementById("registration-container").style.display="none",document.getElementById("login-section").style.display="block";return}try{const n=await L.client.signUp.create({emailAddress:e,password:o});if(console.log("SignUp status:",n.status),localStorage.setItem(`user_role_${e}`,a),n.status==="complete"){l("✓ Usuario registrado con éxito. Iniciando sesión...",{type:"success"}),console.log("Usuario registrado exitosamente:",n),B={email:e,name:e.split("@")[0]},b=a,document.getElementById("registration-form").reset(),document.getElementById("registration-container").style.display="none",document.getElementById("login-section").style.display="none",document.getElementById("app-section").style.display="block";const s=document.getElementById("navbar-container");s.innerHTML=N(B,b),(r=document.getElementById("logout-btn"))==null||r.addEventListener("click",H),q(),R(a),l("✓ Sesión iniciada automáticamente.",{type:"success",delay:2e3})}else n.status==="missing_requirements"?(l("Registro iniciado. Por favor verifica tu correo electrónico.",{type:"info"}),console.log("Verification required:",n.missingFields),l("Se ha enviado un código de verificación a tu correo.",{type:"info",delay:5e3})):n.createdUserId?(l("✓ Usuario registrado. Revisa tu correo para verificar tu cuenta.",{type:"success"}),document.getElementById("registration-form").reset(),document.getElementById("registration-container").style.display="none",document.getElementById("login-section").style.display="block"):l("Registro en proceso. Estado: "+n.status,{type:"info"})}catch(n){console.error("Error al registrar usuario:",n);let s="Error desconocido";if(n.errors&&n.errors.length>0){const d=n.errors[0],f=d.message||d.longMessage||"";f.includes("Passwords must be 8 characters")?s="La contraseña debe tener al menos 8 caracteres.":f.includes("found in an online data breach")?s="Esta contraseña es insegura. Por favor usa una contraseña más fuerte y única.":f.includes("email address is taken")?s="Este correo ya está registrado.":s=f}else n.message&&(s=n.message);l(s,{type:"danger"})}}function de(){const t=document.getElementById("login-section"),e=document.getElementById("registration-container"),o=document.getElementById("show-registration");e&&(e.innerHTML=ie(),e.style.display="none");const a=document.getElementById("registration-form");a&&a.addEventListener("submit",le),o&&o.addEventListener("click",n=>{n.preventDefault(),t&&(t.style.display="none"),e&&(e.style.display="block")});const r=document.getElementById("show-login");r&&r.addEventListener("click",n=>{n.preventDefault(),e&&(e.style.display="none"),t&&(t.style.display="block")})}async function ce(t){var s,d,f,A;t.preventDefault();const e=document.getElementById("email").value.trim(),o=document.getElementById("password").value,a=document.getElementById("role").value;if(!e||!o||!a){l("Por favor completa todos los campos.",{type:"warning"});return}if(L&&L.session){console.log("Ya existe una sesión activa en Clerk");const w=localStorage.getItem(`user_role_${e}`);B={email:e,name:e.split("@")[0]},b=w||a;const u=document.getElementById("navbar-container");u.innerHTML=N(B,b),(s=document.getElementById("logout-btn"))==null||s.addEventListener("click",H),document.getElementById("login-section").style.display="none",document.getElementById("app-section").style.display="block",q(),R(b),l("✓ Sesión activa detectada",{type:"success"});return}if(O||!L){const u=JSON.parse(localStorage.getItem("demo_users")||"[]").find(S=>S.email===e&&S.password===o);if(!u){l("Credenciales incorrectas. Si no tienes cuenta, regístrate primero.",{type:"danger"});return}if(u.role!==a){l(`Este usuario está registrado como ${u.role==="student"?"Estudiante":u.role==="teacher"?"Docente":"Directivo"}, no como ${a==="student"?"Estudiante":a==="teacher"?"Docente":"Directivo"}.`,{type:"danger"});return}B={email:e,name:e.split("@")[0]},b=a;const C=document.getElementById("navbar-container");C.innerHTML=N(B,b),(d=document.getElementById("logout-btn"))==null||d.addEventListener("click",H),document.getElementById("login-section").style.display="none",document.getElementById("app-section").style.display="block",q(),R(a),l("✓ Sesión iniciada (modo demo)",{type:"success"});return}try{if((await L.client.signIn.create({identifier:e,password:o})).status==="complete"){const u=localStorage.getItem(`user_role_${e}`);if(u&&u!==a){l("Rol incorrecto para este usuario.",{type:"danger"}),await L.signOut();return}B={email:e,name:e.split("@")[0]},b=a,u||localStorage.setItem(`user_role_${e}`,a)}else{l("Error al iniciar sesión. Por favor intenta de nuevo.",{type:"danger"});return}}catch(w){console.error("Error al iniciar sesión:",w);const u=((A=(f=w.errors)==null?void 0:f[0])==null?void 0:A.message)||w.message||"Credenciales inválidas";l("Error: "+u,{type:"danger"});return}B={email:e,name:e.split("@")[0]},b=a;const r=document.getElementById("navbar-container");r.innerHTML=N(B,b),document.getElementById("logout-btn").addEventListener("click",H),document.getElementById("login-section").style.display="none";const n=document.getElementById("app-section");n?n.style.display="block":console.error('El elemento con ID "app-section" no existe en el DOM.'),q(),R(a)}function H(t){t==null||t.preventDefault(),L&&L.session&&L.signOut().then(()=>{console.log("Signed out from Clerk")}).catch(a=>{console.error("Error signing out from Clerk:",a)}),B=null,b=null;const e=document.getElementById("navbar-container");e.innerHTML=N(),document.getElementById("login-section").style.display="block",document.getElementById("app-section").style.display="none",document.getElementById("login-form").reset();const o=document.getElementById("login-section");o?(o.style.display="block",o.scrollIntoView({behavior:"smooth",block:"start"})):console.error("El formulario de inicio de sesión no se pudo renderizar."),q()}window.addEventListener("DOMContentLoaded",()=>{se(),q(),de()});
