// ============================================
// FUNCIONES UTILITARIAS Y DE CONFIGURACIÓN MEJORADAS
// ============================================

// Función para actualizar información del usuario en horizontal
function actualizarInfoUsuarioHorizontal(datosUsuario) {
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const userAvatarElement = document.getElementById('userAvatarHorizontal');
    
    if (userNameElement) {
        userNameElement.textContent = datosUsuario?.nombre || datosUsuario?.email?.split('@')[0] || 'Usuario VIP';
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = datosUsuario?.email || 'usuario@messery.com';
    }
    
    if (userAvatarElement) {
        if (datosUsuario?.avatar_url) {
            userAvatarElement.innerHTML = `<img src="${datosUsuario.avatar_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            userAvatarElement.innerHTML = '<i class="fas fa-user-circle"></i>';
        }
    }
}

// Función para actualizar título en sidebar horizontal
function actualizarTituloSidebarHorizontal(titulo) {
    const tituloSidebar = document.getElementById('tituloActivoSidebarHorizontal');
    const tituloActual = document.getElementById('tituloActual');
    const etiquetaTitulo = document.getElementById('etiquetaTitulo');
    
    if (!tituloSidebar || !tituloActual || !etiquetaTitulo) {
        console.warn('Elementos del sidebar de título no encontrados');
        return;
    }
    
    if (titulo) {
        tituloSidebar.style.display = 'block';
        tituloActual.textContent = titulo;
        etiquetaTitulo.textContent = titulo.toUpperCase();
    } else {
        tituloSidebar.style.display = 'none';
    }
}

// Función para actualizar UI de racha con nuevo diseño
function actualizarUIStreak() {
    const streakContainer = document.getElementById('streakContainer');
    const streakInfoLogros = document.getElementById('streakInfoLogros');
    const streakCounter = document.getElementById('streakCounter');
    const streakDaysText = document.getElementById('streakDaysText');
    const streakProgressText = document.getElementById('streakProgressText');
    const streakProgressFill = document.getElementById('streakProgressFill');
    
    if (window.datosUsuarioVIP.streakActual > 0) {
        const diasTexto = window.datosUsuarioVIP.streakActual === 1 ? 'día consecutivo' : 'días consecutivos';
        
        // Actualizar container principal
        if (streakContainer) {
            streakContainer.innerHTML = `
                <div class="streak-info-premium">
                    <div class="streak-header-premium">
                        <div class="streak-icon-premium">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div>
                            <div class="streak-counter-premium">${window.datosUsuarioVIP.streakActual}</div>
                            <div class="streak-days-text-premium">${diasTexto}</div>
                        </div>
                    </div>
                    <div class="streak-progress-premium">
                        <div class="progress-labels-premium">
                            <span>Progreso hacia recompensa semanal</span>
                            <span>${window.datosUsuarioVIP.streakActual}/7 días</span>
                        </div>
                        <div class="progress-bar-streak-premium">
                            <div class="progress-fill-streak-premium" style="width: ${Math.min((window.datosUsuarioVIP.streakActual / 7) * 100, 100)}%"></div>
                        </div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 5px; text-align: center;">
                            ${window.datosUsuarioVIP.streakActual >= 7 ? '🎉 ¡Racha completa! Reclama tu recompensa' : 
                              window.datosUsuarioVIP.streakActual >= 5 ? '🔥 ¡Vas por buen camino!' :
                              window.datosUsuarioVIP.streakActual >= 3 ? '💪 Sigue así' : '🚀 Comienza tu racha'}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Actualizar sección de logros
        if (streakInfoLogros) {
            streakInfoLogros.style.display = 'block';
            if (streakCounter) streakCounter.textContent = window.datosUsuarioVIP.streakActual;
            if (streakDaysText) streakDaysText.textContent = diasTexto;
            if (streakProgressText) streakProgressText.textContent = `${window.datosUsuarioVIP.streakActual}/7 días`;
            if (streakProgressFill) streakProgressFill.style.width = `${Math.min((window.datosUsuarioVIP.streakActual / 7) * 100, 100)}%`;
        }
    } else {
        if (streakContainer) streakContainer.innerHTML = `
            <div class="streak-info-premium" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="streak-header-premium">
                    <div class="streak-icon-premium">
                        <i class="fas fa-fire"></i>
                    </div>
                    <div>
                        <div class="streak-counter-premium">0</div>
                        <div class="streak-days-text-premium">Comienza tu racha</div>
                    </div>
                </div>
                <div class="streak-progress-premium">
                    <div class="progress-labels-premium">
                        <span>Reclama hoy para iniciar tu racha</span>
                        <span>0/7 días</span>
                    </div>
                    <div class="progress-bar-streak-premium">
                        <div class="progress-fill-streak-premium" style="width: 0%"></div>
                    </div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.8); margin-top: 5px; text-align: center;">
                        🎁 Reclama tu recompensa diaria para comenzar
                    </div>
                </div>
            </div>
        `;
        if (streakInfoLogros) streakInfoLogros.style.display = 'none';
    }
}

// Funciones de información VIP MEJORADAS
function mostrarInformacionVIP() {
    Swal.fire({
        title: '👑 <strong>Messery VIP</strong> - Sistema de Recompensas Premium',
        html: `
            <div style="text-align: left; padding: 10px; max-width: 500px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <div style="font-size: 24px; color: #f59e0b;">
                        <i class="fas fa-crown"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #1e3a8a;">¿Qué es Messery VIP?</h3>
                    </div>
                </div>
                
                <p style="margin-bottom: 15px; color: #4b5563;">
                    <strong>Messery VIP</strong> es nuestro sistema de recompensas premium diseñado para reconocer y premiar 
                    a los usuarios más activos y comprometidos con nuestra comunidad.
                </p>
                
                <div style="background: #f8fafc; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 16px;">🌟 <strong>Beneficios VIP:</strong></h4>
                    <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                        <li><strong>Recompensas Diarias:</strong> Puntos gratis cada 24 horas</li>
                        <li><strong>Títulos Exclusivos:</strong> Personaliza tu perfil con títulos únicos</li>
                        <li><strong>Estilos de Mensaje:</strong> Destaca en los chats con estilos especiales</li>
                        <li><strong>Logros Desbloqueables:</strong> Completa desafíos para ganar diamantes</li>
                        <li><strong>Sistema de Niveles:</strong> Sube de nivel según tu actividad</li>
                    </ul>
                </div>
                
                <div style="background: #f0f9ff; border-radius: 10px; padding: 15px; border-left: 4px solid #3b82f6;">
                    <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 15px;">💎 <strong>Tipos de Monedas:</strong></h4>
                    <div style="display: flex; justify-content: space-between; font-size: 13px;">
                        <div style="text-align: center;">
                            <div style="color: #8b5cf6;">⭐ Puntos</div>
                            <div>Para recompensas básicas</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="color: #ef4444;">❤️ Corazones</div>
                            <div>Actividad social</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="color: #0ea5e9;">💎 Diamantes</div>
                            <div>Compras premium</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 15px; font-size: 12px; color: #6b7280; text-align: center;">
                    <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                    Sistema desarrollado exclusivamente para Messery
                </div>
            </div>
        `,
        icon: 'info',
        confirmButtonText: '¡Entendido!',
        confirmButtonColor: '#3b82f6',
        width: 550
    });
}

function mostrarSoporteVIP() {
    Swal.fire({
        title: '🛟 <strong>Soporte Messery VIP</strong>',
        html: `
            <div style="text-align: left; padding: 10px; max-width: 500px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <div style="font-size: 24px; color: #10b981;">
                        <i class="fas fa-headset"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #1e3a8a;">¿Necesitas ayuda?</h3>
                    </div>
                </div>
                
                <p style="margin-bottom: 15px; color: #4b5563;">
                    Nuestro equipo de soporte está disponible para ayudarte con cualquier problema 
                    o pregunta relacionada con el sistema <strong>Messery VIP</strong>.
                </p>
                
                <div style="background: #f0fdf4; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #065f46; font-size: 16px;">📞 <strong>Canales de Contacto:</strong></h4>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; background: white; border-radius: 8px;">
                        <div style="font-size: 18px; color: #3b82f6;">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #1e3a8a;">Correo Electrónico</div>
                            <div style="font-size: 13px; color: #4b5563;">soporte@messery.com</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; background: white; border-radius: 8px;">
                        <div style="font-size: 18px; color: #8b5cf6;">
                            <i class="fab fa-discord"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #1e3a8a;">Servidor Discord</div>
                            <div style="font-size: 13px; color: #4b5563;">discord.gg/messery-vip</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 8px;">
                        <div style="font-size: 18px; color: #f59e0b;">
                            <i class="fas fa-comments"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #1e3a8a;">Chat en Tiempo Real</div>
                            <div style="font-size: 13px; color: #4b5563;">Disponible en la app principal</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: #fef3c7; border-radius: 10px; padding: 15px; border-left: 4px solid #f59e0b;">
                    <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 15px;">⏰ <strong>Horarios de Atención:</strong></h4>
                    <div style="color: #78350f;">
                        <div>• <strong>Lunes a Viernes:</strong> 9:00 - 18:00 (UTC)</div>
                        <div>• <strong>Sábados:</strong> 10:00 - 14:00 (UTC)</div>
                        <div>• <strong>Respuesta promedio:</strong> 2-4 horas hábiles</div>
                    </div>
                </div>
                
                <div style="margin-top: 15px; font-size: 12px; color: #6b7280; text-align: center;">
                    <i class="fas fa-shield-alt" style="margin-right: 5px;"></i>
                    Tu privacidad y satisfacción son nuestra prioridad
                </div>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Gracias',
        confirmButtonColor: '#10b981',
        width: 550
    });
}

// Funciones placeholder para funcionalidades futuras
function invitarAmigos() {
    Swal.fire({
        title: '👥 <strong>Invitar Amigos a Messery</strong>',
        html: `
            <div style="text-align: left; padding: 10px; max-width: 500px;">
                <p style="margin-bottom: 15px; color: #4b5563;">
                    Invita amigos a unirse a <strong>Messery</strong> y gana recompensas exclusivas por cada amigo que se registre 
                    usando tu enlace personalizado.
                </p>
                
                <div style="background: #f0f9ff; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">🎁 <strong>Recompensas por Invitación:</strong></h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="text-align: center; background: white; padding: 10px; border-radius: 8px;">
                            <div style="color: #10b981; font-weight: 600;">+100 Puntos</div>
                            <div style="font-size: 12px;">Por cada amigo</div>
                        </div>
                        <div style="text-align: center; background: white; padding: 10px; border-radius: 8px;">
                            <div style="color: #0ea5e9; font-weight: 600;">+50 Diamantes</div>
                            <div style="font-size: 12px;">Por cada 5 amigos</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f8fafc; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 15px;">🔗 <strong>Tu Enlace Personalizado:</strong></h4>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" 
                               value="https://messery.com/registro?ref=${window.datosUsuarioVIP.id}" 
                               readonly 
                               style="flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; font-size: 13px;">
                        <button onclick="copiarEnlaceInvitacion()" 
                                style="background: #3b82f6; color: white; border: none; border-radius: 8px; padding: 0 15px; cursor: pointer; font-weight: 600;">
                            Copiar
                        </button>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #fef3c7; border-radius: 8px;">
                    <div style="font-size: 18px; color: #f59e0b;">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div style="font-size: 13px; color: #92400e;">
                        <strong>Tip:</strong> Comparte tu enlace en redes sociales para más recompensas
                    </div>
                </div>
            </div>
        `,
        icon: 'info',
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
        confirmButtonText: 'Ver Mis Invitados',
        confirmButtonColor: '#3b82f6',
        width: 550
    });
}

function copiarEnlaceInvitacion() {
    const enlace = `https://messery.com/registro?ref=${window.datosUsuarioVIP.id}`;
    navigator.clipboard.writeText(enlace).then(() => {
        Swal.fire({
            title: '✅ Copiado',
            text: 'Enlace copiado al portapapeles',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    });
}

function mostrarActividades() {
    Swal.fire({
        title: '🏃 <strong>Actividades Diarias</strong>',
        html: `
            <div style="text-align: left; padding: 10px; max-width: 500px;">
                <p style="margin-bottom: 15px; color: #4b5563;">
                    Completa actividades diarias para ganar puntos y subir de nivel en <strong>Messery VIP</strong>.
                </p>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 16px;">📅 <strong>Actividades de Hoy:</strong></h4>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f0fdf4; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid #10b981;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-size: 18px; color: #10b981;">
                                <i class="fas fa-sign-in-alt"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #065f46;">Iniciar Sesión</div>
                                <div style="font-size: 12px; color: #059669;">Recompensa diaria</div>
                            </div>
                        </div>
                        <div style="background: #10b981; color: white; padding: 5px 10px; border-radius: 20px; font-weight: 600; font-size: 14px;">
                            +25 Puntos
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #fef3c7; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-size: 18px; color: #f59e0b;">
                                <i class="fas fa-comment-alt"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #92400e;">Enviar 10 Mensajes</div>
                                <div style="font-size: 12px; color: #d97706;">Progreso: 3/10</div>
                            </div>
                        </div>
                        <div style="background: #f59e0b; color: white; padding: 5px 10px; border-radius: 20px; font-weight: 600; font-size: 14px;">
                            +50 Puntos
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #eff6ff; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid #3b82f6;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-size: 18px; color: #3b82f6;">
                                <i class="fas fa-users"></i>
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #1e40af;">Participar en Chat Grupal</div>
                                <div style="font-size: 12px; color: #2563eb;">Por 15 minutos</div>
                            </div>
                        </div>
                        <div style="background: #3b82f6; color: white; padding: 5px 10px; border-radius: 20px; font-weight: 600; font-size: 14px;">
                            +75 Puntos
                        </div>
                    </div>
                </div>
                
                <div style="background: #f8fafc; border-radius: 10px; padding: 15px; border: 1px solid #e5e7eb;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <div style="font-size: 18px; color: #8b5cf6;">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600; color: #1e3a8a;">Tu Progreso Diario</div>
                            <div style="font-size: 13px; color: #6b7280;">25/150 puntos obtenidos hoy</div>
                        </div>
                    </div>
                    <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #8b5cf6, #3b82f6); height: 100%; width: 16.6%; border-radius: 4px;"></div>
                    </div>
                </div>
            </div>
        `,
        icon: 'info',
        confirmButtonText: '¡A por ello!',
        confirmButtonColor: '#3b82f6',
        width: 550
    });
}

function cargarLogros() {
    console.log('Cargando logros...');
    // Implementación simplificada - se puede expandir
    const logrosContainer = document.getElementById('logrosContainer');
    if (logrosContainer) {
        logrosContainer.innerHTML = `
            <div class="logro-card">
                <div class="logro-icon">
                    <i class="fas fa-star"></i>
                </div>
                <h4>Primeros Pasos</h4>
                <p>Reclama tu primera recompensa diaria</p>
                <div class="logro-progreso">
                    <div class="logro-progreso-fill" style="width: 100%"></div>
                </div>
                <div class="logro-recompensa">
                    <i class="fas fa-gem"></i> 50 diamantes
                </div>
            </div>
            
            <div class="logro-card">
                <div class="logro-icon">
                    <i class="fas fa-fire"></i>
                </div>
                <h4>Racha de Fuego</h4>
                <p>Reclama recompensas diarias por 7 días consecutivos</p>
                <div class="logro-progreso">
                    <div class="logro-progreso-fill" style="width: ${Math.min((window.datosUsuarioVIP.streakActual / 7) * 100, 100)}%"></div>
                </div>
                <div class="logro-recompensa">
                    <i class="fas fa-gem"></i> 150 diamantes
                </div>
            </div>
            
            <div class="logro-card">
                <div class="logro-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h4>Socializador</h4>
                <p>Envía 100 mensajes en el chat</p>
                <div class="logro-progreso">
                    <div class="logro-progreso-fill" style="width: 30%"></div>
                </div>
                <div class="logro-recompensa">
                    <i class="fas fa-gem"></i> 100 diamantes
                </div>
            </div>
        `;
    }
}

function guardarConfiguracion() {
    const config = {
        notifications: document.getElementById('notificationsToggle').checked,
        reminder: document.getElementById('reminderToggle').checked
    };
    
    localStorage.setItem('vipConfig', JSON.stringify(config));
    
    Swal.fire({
        title: '✅ Configuración Guardada',
        html: `
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 50px; color: #10b981; margin-bottom: 10px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <p style="color: #4b5563;">Tus preferencias VIP han sido guardadas correctamente.</p>
            </div>
        `,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

// Cargar configuración guardada al iniciar
function cargarConfiguracion() {
    const configGuardada = localStorage.getItem('vipConfig');
    if (configGuardada) {
        const config = JSON.parse(configGuardada);
        if (document.getElementById('notificationsToggle')) {
            document.getElementById('notificationsToggle').checked = config.notifications;
        }
        if (document.getElementById('reminderToggle')) {
            document.getElementById('reminderToggle').checked = config.reminder;
        }
    }
}

// Llamar esta función en la inicialización
cargarConfiguracion();