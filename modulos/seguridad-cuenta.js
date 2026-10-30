// seguridad-cuenta.js
// Manejo de seguridad de la cuenta

// Configurar eventos de seguridad
function configurarEventosSeguridad() {
    console.log("⚙️ Configurando eventos de seguridad...");
    
    // Cambiar contraseña
    const btnCambiarPassword = document.getElementById('btnCambiarPassword');
    if (btnCambiarPassword) {
        btnCambiarPassword.addEventListener('click', mostrarModalCambiarPassword);
    }

    // Configurar 2FA
    const btnConfigurar2FA = document.getElementById('btnConfigurar2FA');
    if (btnConfigurar2FA) {
        btnConfigurar2FA.addEventListener('click', mostrarModal2FA);
    }

    // Ver sesiones
    const btnVerSesiones = document.getElementById('btnVerSesiones');
    if (btnVerSesiones) {
        btnVerSesiones.addEventListener('click', mostrarModalSesiones);
    }

    // Configurar privacidad
    const btnConfigurarPrivacidad = document.getElementById('btnConfigurarPrivacidad');
    if (btnConfigurarPrivacidad) {
        btnConfigurarPrivacidad.addEventListener('click', mostrarModalPrivacidad);
    }

    // Eliminar cuenta (desde seguridad)
    const btnEliminarCuentaSeguridad = document.getElementById('btnEliminarCuentaSeguridad');
    if (btnEliminarCuentaSeguridad) {
        btnEliminarCuentaSeguridad.addEventListener('click', mostrarModalEliminarCuenta);
    }

    console.log("✅ Eventos de seguridad configurados");
}

// Modal para cambiar contraseña
async function mostrarModalCambiarPassword() {
    const { value: formValues } = await Swal.fire({
        title: '🔐 Cambiar Contraseña',
        html: `
            <div style="text-align: left;">
                <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="color: #1e40af; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-shield-alt"></i> Seguridad de Contraseña
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="background: white; padding: 8px; border-radius: 6px;">
                            <p style="color: #10b981; margin: 0 0 5px 0; font-size: 12px; font-weight: 500;">
                                <i class="fas fa-check-circle"></i> Recomendado
                            </p>
                            <ul style="color: #374151; padding-left: 15px; margin: 0; font-size: 11px;">
                                <li>12+ caracteres</li>
                                <li>Mayúsculas/minúsculas</li>
                                <li>Símbolos especiales</li>
                            </ul>
                        </div>
                        <div style="background: white; padding: 8px; border-radius: 6px;">
                            <p style="color: #ef4444; margin: 0 0 5px 0; font-size: 12px; font-weight: 500;">
                                <i class="fas fa-times-circle"></i> Evitar
                            </p>
                            <ul style="color: #374151; padding-left: 15px; margin: 0; font-size: 11px;">
                                <li>Info personal</li>
                                <li>Contraseñas comunes</li>
                                <li>Patrones simples</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #374151; font-weight: 500; display: block; margin-bottom: 8px;">
                        <i class="fas fa-lock" style="color: #3b82f6; margin-right: 8px;"></i>
                        Contraseña Actual
                    </label>
                    <div style="position: relative;">
                        <input type="password" id="currentPassword" class="swal2-input" placeholder="Ingresa tu contraseña actual" 
                               style="width: 100%; padding-right: 40px;">
                        <button type="button" id="toggleCurrentPassword" 
                                style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); 
                                       background: none; border: none; color: #6b7280; cursor: pointer;">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #374151; font-weight: 500; display: block; margin-bottom: 8px;">
                        <i class="fas fa-key" style="color: #10b981; margin-right: 8px;"></i>
                        Nueva Contraseña
                    </label>
                    <div style="position: relative;">
                        <input type="password" id="newPassword" class="swal2-input" placeholder="Crea una nueva contraseña" 
                               style="width: 100%; padding-right: 40px;">
                        <button type="button" id="toggleNewPassword" 
                                style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); 
                                       background: none; border: none; color: #6b7280; cursor: pointer;">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <div id="passwordStrength" style="margin-top: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <div style="flex: 1; height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                                <div id="strengthBar" style="height: 100%; width: 0%; background: #ef4444; transition: all 0.3s;"></div>
                            </div>
                            <span id="strengthText" style="color: #9ca3af; font-size: 12px;">Débil</span>
                        </div>
                        <div id="passwordRequirements" style="color: #6b7280; font-size: 11px;"></div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: #374151; font-weight: 500; display: block; margin-bottom: 8px;">
                        <i class="fas fa-redo" style="color: #8b5cf6; margin-right: 8px;"></i>
                        Confirmar Nueva Contraseña
                    </label>
                    <div style="position: relative;">
                        <input type="password" id="confirmPassword" class="swal2-input" placeholder="Repite la nueva contraseña" 
                               style="width: 100%; padding-right: 40px;">
                        <button type="button" id="toggleConfirmPassword" 
                                style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); 
                                       background: none; border: none; color: #6b7280; cursor: pointer;">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <div id="passwordMatch" style="margin-top: 8px;">
                        <span style="color: #9ca3af; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-circle" style="font-size: 8px;"></i>
                            Las contraseñas deben coincidir
                        </span>
                    </div>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Cambiar Contraseña',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1a73e8',
        cancelButtonColor: '#6b7280',
        background: '#ffffff',
        width: 450,
        preConfirm: () => {
            const current = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            
            if (!current || !newPass || !confirm) {
                Swal.showValidationMessage('Todos los campos son requeridos');
                return false;
            }
            
            if (newPass.length < 8) {
                Swal.showValidationMessage('La nueva contraseña debe tener al menos 8 caracteres');
                return false;
            }
            
            if (newPass !== confirm) {
                Swal.showValidationMessage('Las contraseñas no coinciden');
                return false;
            }
            
            // Verificar fortaleza de contraseña
            const strength = calcularFortalezaContraseña(newPass);
            if (strength.score < 3) {
                Swal.showValidationMessage('La contraseña es muy débil. Usa una combinación más fuerte.');
                return false;
            }
            
            return { current, newPass };
        },
        didOpen: () => {
            // Configurar toggles de visibilidad
            configurarTogglesPassword();
            
            // Configurar validación en tiempo real
            const newPassInput = document.getElementById('newPassword');
            const confirmPassInput = document.getElementById('confirmPassword');
            
            newPassInput.addEventListener('input', validarFortalezaContraseña);
            confirmPassInput.addEventListener('input', validarCoincidenciaContraseña);
        }
    });

    if (formValues) {
        // Aquí iría la lógica para cambiar la contraseña en Supabase
        Swal.fire({
            title: '✅ Contraseña Cambiada',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #047857); 
                            border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                        <i class="fas fa-check" style="color: white; font-size: 40px;"></i>
                    </div>
                    <p style="color: #065f46; font-weight: 500; margin-bottom: 10px;">
                        Contraseña actualizada exitosamente
                    </p>
                    <p style="color: #4b5563; font-size: 14px;">
                        Tu contraseña ha sido cambiada. Se recomienda:
                    </p>
                    <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin-top: 15px;">
                        <ul style="color: #0369a1; margin: 0; padding-left: 20px; text-align: left; font-size: 13px;">
                            <li>Cerrar sesión en todos los dispositivos</li>
                            <li>Actualizar aplicaciones móviles</li>
                            <li>No compartir tu contraseña con nadie</li>
                        </ul>
                    </div>
                </div>
            `,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#1a73e8',
            background: '#ffffff'
        });
    }
}

// Configurar toggles de visibilidad de contraseña
function configurarTogglesPassword() {
    const toggles = ['toggleCurrentPassword', 'toggleNewPassword', 'toggleConfirmPassword'];
    
    toggles.forEach(toggleId => {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.addEventListener('click', function() {
                const targetId = toggleId.replace('toggle', '').toLowerCase() + 'Password';
                const input = document.getElementById(targetId);
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        }
    });
}

// Validar fortaleza de contraseña en tiempo real
function validarFortalezaContraseña() {
    const password = document.getElementById('newPassword').value;
    const strength = calcularFortalezaContraseña(password);
    
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const requirementsDiv = document.getElementById('passwordRequirements');
    
    // Actualizar barra de fuerza
    const width = (strength.score / 5) * 100;
    strengthBar.style.width = `${width}%`;
    
    // Actualizar color y texto
    const strengthConfig = {
        1: { color: '#ef4444', text: 'Muy Débil' },
        2: { color: '#f97316', text: 'Débil' },
        3: { color: '#f59e0b', text: 'Moderada' },
        4: { color: '#10b981', text: 'Fuerte' },
        5: { color: '#047857', text: 'Muy Fuerte' }
    };
    
    const config = strengthConfig[strength.score] || strengthConfig[1];
    strengthBar.style.background = config.color;
    strengthText.textContent = config.text;
    strengthText.style.color = config.color;
    
    // Mostrar requisitos
    let requirementsHTML = '';
    strength.requirements.forEach(req => {
        const icon = req.met ? 'fas fa-check-circle' : 'fas fa-times-circle';
        const color = req.met ? '#10b981' : '#9ca3af';
        requirementsHTML += `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <i class="${icon}" style="color: ${color}; font-size: 12px;"></i>
                <span style="color: ${req.met ? '#374151' : '#9ca3af'}; font-size: 12px;">${req.text}</span>
            </div>
        `;
    });
    
    requirementsDiv.innerHTML = requirementsHTML;
}

// Calcular fortaleza de contraseña
function calcularFortalezaContraseña(password) {
    let score = 0;
    const requirements = [];
    
    // Longitud mínima
    const hasLength = password.length >= 8;
    requirements.push({ text: 'Mínimo 8 caracteres', met: hasLength });
    if (hasLength) score++;
    
    // Mayúsculas y minúsculas
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    requirements.push({ text: 'Letras mayúsculas y minúsculas', met: hasUpper && hasLower });
    if (hasUpper && hasLower) score++;
    
    // Números
    const hasNumbers = /\d/.test(password);
    requirements.push({ text: 'Al menos un número', met: hasNumbers });
    if (hasNumbers) score++;
    
    // Símbolos
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    requirements.push({ text: 'Al menos un símbolo especial', met: hasSymbols });
    if (hasSymbols) score++;
    
    // Longitud fuerte
    const hasStrongLength = password.length >= 12;
    requirements.push({ text: '12+ caracteres para mayor seguridad', met: hasStrongLength });
    if (hasStrongLength) score++;
    
    return { score, requirements };
}

// Validar coincidencia de contraseñas
function validarCoincidenciaContraseña() {
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const matchDiv = document.getElementById('passwordMatch');
    
    if (!newPass || !confirmPass) {
        matchDiv.innerHTML = `
            <span style="color: #9ca3af; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                <i class="fas fa-circle" style="font-size: 8px;"></i>
                Las contraseñas deben coincidir
            </span>
        `;
        return;
    }
    
    if (newPass === confirmPass) {
        matchDiv.innerHTML = `
            <span style="color: #10b981; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                <i class="fas fa-check-circle"></i>
                Las contraseñas coinciden
            </span>
        `;
    } else {
        matchDiv.innerHTML = `
            <span style="color: #ef4444; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                <i class="fas fa-times-circle"></i>
                Las contraseñas no coinciden
            </span>
        `;
    }
}

// Modal para 2FA
function mostrarModal2FA() {
    Swal.fire({
        title: '📱 Autenticación de Dos Factores',
        html: `
            <div style="text-align: left; max-height: 500px; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="color: #0369a1; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-mobile-alt"></i> Protección Adicional
                    </h4>
                    <p style="color: #0c4a6e; margin: 0;">
                        Añade una capa extra de seguridad a tu cuenta. Necesitarás un código de verificación además de tu contraseña.
                    </p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-shield-alt" style="color: #3b82f6;"></i> ¿Cómo funciona 2FA?
                    </h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: white; font-weight: bold;">1</span>
                                </div>
                                <h6 style="color: #1e40af; margin: 0;">Iniciar Sesión</h6>
                            </div>
                            <p style="color: #6b7280; margin: 0; font-size: 13px;">
                                Ingresas tu email y contraseña como siempre
                            </p>
                        </div>
                        
                        <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="width: 32px; height: 32px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: white; font-weight: bold;">2</span>
                                </div>
                                <h6 style="color: #5b21b6; margin: 0;">Código de Verificación</h6>
                            </div>
                            <p style="color: #6b7280; margin: 0; font-size: 13px;">
                                Ingresas el código de 6 dígitos de tu app
                            </p>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-mobile-alt" style="color: #10b981;"></i> Aplicaciones Recomendadas
                    </h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb;">
                            <i class="fab fa-google" style="color: #4285f4; font-size: 24px; margin-bottom: 8px;"></i>
                            <p style="color: #374151; margin: 0; font-size: 12px; font-weight: 500;">Google Authenticator</p>
                        </div>
                        <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb;">
                            <i class="fas fa-user-secret" style="color: #000; font-size: 24px; margin-bottom: 8px;"></i>
                            <p style="color: #374151; margin: 0; font-size: 12px; font-weight: 500;">Authy</p>
                        </div>
                        <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 2px solid #e5e7eb;">
                            <i class="fas fa-lock" style="color: #8b5cf6; font-size: 24px; margin-bottom: 8px;"></i>
                            <p style="color: #374151; margin: 0; font-size: 12px; font-weight: 500;">Microsoft Authenticator</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 10px; border-left: 4px solid #d97706;">
                    <h6 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">
                        <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i> Importante
                    </h6>
                    <ul style="color: #92400e; padding-left: 20px; margin: 0; font-size: 13px;">
                        <li>Guarda tus códigos de recuperación en un lugar seguro</li>
                        <li>Sin acceso a la app de autenticación, no podrás iniciar sesión</li>
                        <li>Configura 2FA en todos tus dispositivos</li>
                    </ul>
                </div>
            </div>
        `,
        width: 600,
        showCancelButton: true,
        confirmButtonText: 'Configurar 2FA',
        cancelButtonText: 'Quizás después',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        background: '#ffffff',
        showCloseButton: true
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: '⏳ Redirigiendo...',
                html: `
                    <div style="text-align: center; padding: 30px;">
                        <div style="width: 80px; height: 80px; border: 3px solid #e5e7eb; border-top: 3px solid #3b82f6; 
                                border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px auto;"></div>
                        <p style="color: #4b5563; margin-bottom: 15px;">Preparando configuración de 2FA...</p>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 10px;">
                            <p style="color: #6b7280; margin: 0; font-size: 14px;">
                                <i class="fas fa-info-circle" style="color: #3b82f6; margin-right: 8px;"></i>
                                Serás redirigido al panel de configuración de seguridad
                            </p>
                        </div>
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                `,
                showConfirmButton: false,
                background: '#ffffff',
                allowOutsideClick: false
            });
            
            // Simular redirección
            setTimeout(() => {
                Swal.fire({
                    title: '✅ 2FA Configurado',
                    text: 'La autenticación de dos factores ha sido configurada exitosamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#1a73e8',
                    background: '#ffffff'
                });
            }, 2000);
        }
    });
}

// Modal para ver sesiones activas
async function mostrarModalSesiones() {
    try {
        // Obtener información de sesiones (simulado)
        const sesionesSimuladas = [
            {
                id: 1,
                dispositivo: 'Chrome en Windows',
                ubicacion: 'Bogotá, Colombia',
                fecha: 'Hoy, 14:30',
                ip: '190.100.50.25',
                actual: true
            },
            {
                id: 2,
                dispositivo: 'Safari en iPhone',
                ubicacion: 'Medellín, Colombia',
                fecha: 'Ayer, 09:15',
                ip: '200.100.75.30',
                actual: false
            },
            {
                id: 3,
                dispositivo: 'Firefox en Mac',
                ubicacion: 'Cali, Colombia',
                fecha: 'Hace 3 días, 18:45',
                ip: '180.150.90.40',
                actual: false
            }
        ];
        
        let sesionesHTML = `
            <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="color: #374151; margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-clock"></i> Sesiones Activas
                    </h4>
                    <p style="color: #6b7280; margin: 0;">
                        Revisa y gestiona todas las sesiones activas de tu cuenta
                    </p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h5 style="color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-user-check" style="color: #10b981;"></i> Sesión Actual
                    </h5>
        `;
        
        // Sesión actual
        const sesionActual = sesionesSimuladas.find(s => s.actual);
        if (sesionActual) {
            sesionesHTML += `
                <div style="background: #ecfdf5; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #10b981;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <h6 style="color: #065f46; margin: 0; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                                ${sesionActual.dispositivo}
                            </h6>
                            <p style="color: #047857; margin: 5px 0 0 0; font-size: 12px;">
                                <i class="fas fa-map-marker-alt"></i> ${sesionActual.ubicacion}
                            </p>
                        </div>
                        <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                            Actual
                        </span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <div>
                            <p style="color: #374151; margin: 0 0 4px 0; font-size: 12px; font-weight: 500;">
                                <i class="fas fa-calendar"></i> Último acceso
                            </p>
                            <p style="color: #6b7280; margin: 0; font-size: 11px;">${sesionActual.fecha}</p>
                        </div>
                        <div>
                            <p style="color: #374151; margin: 0 0 4px 0; font-size: 12px; font-weight: 500;">
                                <i class="fas fa-network-wired"></i> Dirección IP
                            </p>
                            <p style="color: #6b7280; margin: 0; font-size: 11px;">${sesionActual.ip}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Otras sesiones
        const otrasSesiones = sesionesSimuladas.filter(s => !s.actual);
        if (otrasSesiones.length > 0) {
            sesionesHTML += `
                <h5 style="color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-history" style="color: #6b7280;"></i> Otras Sesiones
                </h5>
                <div style="background: #f8fafc; padding: 10px; border-radius: 10px;">
            `;
            
            otrasSesiones.forEach(sesion => {
                sesionesHTML += `
                    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div>
                                <h6 style="color: #374151; margin: 0; font-size: 14px;">${sesion.dispositivo}</h6>
                                <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 12px;">
                                    <i class="fas fa-map-marker-alt"></i> ${sesion.ubicacion}
                                </p>
                            </div>
                            <button class="btn-cerrar-sesion" data-id="${sesion.id}" 
                                    style="background: #fee2e2; color: #dc2626; border: none; padding: 6px 12px; 
                                           border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500;">
                                <i class="fas fa-sign-out-alt"></i> Cerrar
                            </button>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                            <div>
                                <p style="color: #9ca3af; margin: 0; font-size: 11px;">Último acceso</p>
                                <p style="color: #6b7280; margin: 0; font-size: 11px; font-weight: 500;">${sesion.fecha}</p>
                            </div>
                            <div>
                                <p style="color: #9ca3af; margin: 0; font-size: 11px;">IP</p>
                                <p style="color: #6b7280; margin: 0; font-size: 11px; font-weight: 500;">${sesion.ip}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            sesionesHTML += `</div>`;
        }
        
        sesionesHTML += `
                <div style="margin-top: 20px; background: #f0f9ff; padding: 12px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                    <h6 style="color: #0369a1; margin: 0 0 5px 0; font-size: 14px;">
                        <i class="fas fa-lightbulb" style="color: #0ea5e9;"></i> Recomendaciones
                    </h6>
                    <ul style="color: #0c4a6e; padding-left: 20px; margin: 0; font-size: 13px;">
                        <li>Cierra sesiones en dispositivos que ya no uses</li>
                        <li>Revisa periódicamente las direcciones IP sospechosas</li>
                        <li>Cambia tu contraseña si notas actividad inusual</li>
                    </ul>
                </div>
                
                <div style="margin-top: 15px; text-align: center;">
                    <button id="btnCerrarTodasSesiones" 
                            style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; 
                                   padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; width: 100%;">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Todas las Sesiones
                    </button>
                </div>
            </div>
        `;
        
        const { value: accept } = await Swal.fire({
            title: '👥 Sesiones Activas',
            html: sesionesHTML,
            width: 500,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Cerrar',
            cancelButtonColor: '#6b7280',
            background: '#ffffff',
            showCloseButton: true,
            didOpen: () => {
                // Configurar eventos de los botones
                document.querySelectorAll('.btn-cerrar-sesion').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const sessionId = this.getAttribute('data-id');
                        cerrarSesionRemota(sessionId);
                    });
                });
                
                const btnCerrarTodas = document.getElementById('btnCerrarTodasSesiones');
                if (btnCerrarTodas) {
                    btnCerrarTodas.addEventListener('click', cerrarTodasSesiones);
                }
            }
        });
        
    } catch (error) {
        console.error('Error al cargar sesiones:', error);
        mostrarAlerta('error', 'Error al cargar las sesiones activas');
    }
}

// Función para cerrar sesión remota
function cerrarSesionRemota(sessionId) {
    Swal.fire({
        title: '¿Cerrar esta sesión?',
        text: 'Esta acción cerrará la sesión en ese dispositivo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            mostrarAlerta('success', 'Sesión cerrada exitosamente');
        }
    });
}

// Función para cerrar todas las sesiones
function cerrarTodasSesiones() {
    Swal.fire({
        title: '⚠️ Cerrar Todas las Sesiones',
        html: `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f97316, #ea580c); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                    <i class="fas fa-sign-out-alt" style="color: white; font-size: 40px;"></i>
                </div>
                <h3 style="color: #92400e; margin-bottom: 10px;">¿Cerrar todas las sesiones?</h3>
                <p style="color: #4b5563; margin-bottom: 15px;">
                    Esta acción cerrará tu sesión en todos los dispositivos excepto en este.
                </p>
                <div style="background: #fffbeb; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="color: #92400e; margin: 0; font-size: 14px; display: flex; align-items: flex-start; gap: 10px;">
                        <i class="fas fa-exclamation-circle" style="color: #f59e0b; flex-shrink: 0; margin-top: 2px;"></i>
                        <span>Tendrás que iniciar sesión nuevamente en todos tus dispositivos.</span>
                    </p>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Cerrar Todas',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#6b7280',
        background: '#ffffff',
        width: 500
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: '✅ Sesiones Cerradas',
                text: 'Todas las sesiones han sido cerradas exitosamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#10b981',
                background: '#ffffff'
            });
        }
    });
}

// Modal para configuración de privacidad
function mostrarModalPrivacidad() {
    Swal.fire({
        title: '👁️ Configuración de Privacidad',
        html: `
            <div style="text-align: left; max-height: 500px; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #faf5ff, #f3e8ff); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h4 style="color: #6d28d9; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-user-shield"></i> Controla Tu Privacidad
                    </h4>
                    <p style="color: #5b21b6; margin: 0;">
                        Decide qué información quieres compartir y con quién.
                    </p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-eye" style="color: #8b5cf6;"></i> Visibilidad del Perfil
                    </h5>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div>
                                <h6 style="color: #374151; margin: 0; font-size: 14px;">Perfil Público</h6>
                                <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">
                                    Cualquiera puede ver tu perfil
                                </p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="perfilPublico" checked>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div>
                                <h6 style="color: #374151; margin: 0; font-size: 14px;">Mostrar Estado en Línea</h6>
                                <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">
                                    Otros ven cuándo estás conectado
                                </p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="estadoEnLinea" checked>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-search" style="color: #3b82f6;"></i> Búsqueda y Descubrimiento
                    </h5>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div>
                                <h6 style="color: #374151; margin: 0; font-size: 14px;">Aparecer en Búsquedas</h6>
                                <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">
                                    Otros usuarios pueden encontrarte
                                </p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="aparecerBusquedas" checked>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px;">
                        <div style="margin-bottom: 10px;">
                            <h6 style="color: #374151; margin: 0 0 8px 0; font-size: 14px;">Quién Puede Enviarte Solicitudes</h6>
                            <select id="quienPuedeEnviar" style="width: 100%; padding: 8px 12px; border: 2px solid #e5e7eb; 
                                   border-radius: 8px; background: white; color: #374151; font-size: 14px;">
                                <option value="todos">Todos los usuarios</option>
                                <option value="amigos-de-amigos">Amigos de amigos</option>
                                <option value="nadie">Solo yo puedo iniciar</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-envelope" style="color: #10b981;"></i> Comunicación
                    </h5>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px;">
                        <div style="margin-bottom: 10px;">
                            <h6 style="color: #374151; margin: 0 0 8px 0; font-size: 14px;">Quién Puede Enviarte Mensajes</h6>
                            <select id="quienPuedeMensajes" style="width: 100%; padding: 8px 12px; border: 2px solid #e5e7eb; 
                                   border-radius: 8px; background: white; color: #374151; font-size: 14px;">
                                <option value="todos">Todos los usuarios</option>
                                <option value="amigos">Solo mis amigos</option>
                                <option value="nadie">Nadie (modo privado)</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 10px; border-left: 4px solid #d97706;">
                    <h6 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">
                        <i class="fas fa-info-circle" style="color: #f59e0b;"></i> Información Importante
                    </h6>
                    <ul style="color: #92400e; padding-left: 20px; margin: 0; font-size: 13px;">
                        <li>Los ajustes de privacidad se aplican inmediatamente</li>
                        <li>Puedes cambiar estas configuraciones en cualquier momento</li>
                        <li>Configuraciones más restrictivas pueden limitar tu interacción</li>
                    </ul>
                </div>
            </div>
            
            <style>
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }
                
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                }
                
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                }
                
                input:checked + .slider {
                    background-color: #10b981;
                }
                
                input:focus + .slider {
                    box-shadow: 0 0 1px #10b981;
                }
                
                input:checked + .slider:before {
                    transform: translateX(26px);
                }
                
                .slider.round {
                    border-radius: 34px;
                }
                
                .slider.round:before {
                    border-radius: 50%;
                }
            </style>
        `,
        width: 500,
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#8b5cf6',
        cancelButtonColor: '#6b7280',
        background: '#ffffff',
        showCloseButton: true,
        preConfirm: () => {
            const config = {
                perfilPublico: document.getElementById('perfilPublico').checked,
                estadoEnLinea: document.getElementById('estadoEnLinea').checked,
                aparecerBusquedas: document.getElementById('aparecerBusquedas').checked,
                quienPuedeEnviar: document.getElementById('quienPuedeEnviar').value,
                quienPuedeMensajes: document.getElementById('quienPuedeMensajes').value
            };
            
            return config;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const config = result.value;
            console.log('Configuración de privacidad guardada:', config);
            
            Swal.fire({
                title: '✅ Configuración Guardada',
                html: `
                    <div style="text-align: center; padding: 20px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); 
                                border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                            <i class="fas fa-check" style="color: white; font-size: 40px;"></i>
                        </div>
                        <p style="color: #5b21b6; font-weight: 500; margin-bottom: 10px;">
                            Tu configuración de privacidad ha sido actualizada
                        </p>
                        <div style="background: #f5f3ff; padding: 12px; border-radius: 8px; margin-top: 15px;">
                            <p style="color: #6d28d9; margin: 0; font-size: 13px;">
                                Los cambios se aplicarán inmediatamente a tu cuenta.
                            </p>
                        </div>
                    </div>
                `,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#8b5cf6',
                background: '#ffffff'
            });
        }
    });
}