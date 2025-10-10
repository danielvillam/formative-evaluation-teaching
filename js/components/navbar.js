export function renderNavbar(user = null, role = null) {
    // Role translation utility
    let roleLabel = '';
    if (role === 'student') roleLabel = 'Estudiante';
    else if (role === 'teacher') roleLabel = 'Docente';
    else if (role === 'director') roleLabel = 'Directivo';
    else if (role) roleLabel = role;

    return `
    <nav class="navbar">
        <div class="container d-flex align-items-center justify-content-between">
            <a class="navbar-brand" href="#">
                Sistema de evaluación formativa de la docencia
            </a>
            <div class="navbar-nav ms-auto d-flex align-items-center">
                ${user && role ? `
                    <div class="d-flex align-items-center me-3 navbar-text">
                        <i class="bi bi-person-circle fs-4 me-2"></i>
                        <div class="d-flex flex-column">
                            <span class="small">${user.email}</span>
                            <span class="badge badge-role ${role}">${roleLabel}</span>
                        </div>
                    </div>
                    <a class="nav-link text-danger fw-semibold" href="#" id="logout-btn">
                        <i class="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
                    </a>
                ` : ''}
            </div>
        </div>
    </nav>
    `;
}
