export function renderRegistrationForm() {
    return `
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
                        <div class="mb-3 position-relative">
                            <label for="reg-password" class="form-label">Contraseña</label>
                            <div class="d-flex">
                                <input type="password" class="form-control" id="reg-password" placeholder="Mínimo 8 caracteres" minlength="8" required style="border-top-right-radius:0;border-bottom-right-radius:0;">
                                <button type="button" class="btn btn-outline-secondary" id="toggle-reg-password" aria-pressed="false" aria-label="Mostrar contraseña" style="border-top-left-radius:0;border-bottom-left-radius:0;">
                                    <i class="bi bi-eye" id="toggle-reg-password-icon"></i>
                                </button>
                            </div>
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
                        <div class="mb-3 position-relative">
                            <label for="reg-confirm-password" class="form-label">Confirmar Contraseña</label>
                            <div class="d-flex">
                                <input type="password" class="form-control" id="reg-confirm-password" placeholder="Repite tu contraseña" minlength="8" required style="border-top-right-radius:0;border-bottom-right-radius:0;">
                                <button type="button" class="btn btn-outline-secondary" id="toggle-reg-confirm-password" aria-pressed="false" aria-label="Mostrar contraseña" style="border-top-left-radius:0;border-bottom-left-radius:0;">
                                    <i class="bi bi-eye" id="toggle-reg-confirm-password-icon"></i>
                                </button>
                            </div>
                            <div id="password-match-message" class="form-text"></div>
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
    </div>`;
}
