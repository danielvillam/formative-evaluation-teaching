export function renderLoginSection() {
    return `
    <div class="container mt-5" id="login-section">
        <div class="login-card">
            <div class="card">
                <div class="card-header bg-primary">
                    <h4 class="mb-0">Iniciar Sesión</h4>
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
                                <option value="teacher">Docente</option>
                                <option value="student">Estudiante</option>
                                <option value="director">Directivo</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary w-100">Ingresar</button>
                    </form>
                </div>

                <div class="card-footer text-center small text-muted">
                    Acceso al Sistema de Evaluación Formativa
                </div>
            </div>
        </div>
    </div>
    `;
}
