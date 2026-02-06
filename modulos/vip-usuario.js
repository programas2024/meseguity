// ============================================
// GESTIÓN DE USUARIO Y AUTENTICACIÓN
// ============================================

async function verificarAutenticacion() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            console.error('No hay sesión activa');
            window.location.href = 'index.html';
            return null;
        }
        return session.user;
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        return null;
    }
}

async function cargarDatosUsuario() {
    try {
        const { data: usuario, error: errorUsuarioAuth } = await supabaseClient.auth.getUser();
        
        if (errorUsuarioAuth) {
            console.error('Error obteniendo usuario auth:', errorUsuarioAuth);
            return;
        }
        
        if (usuario.user) {
            window.datosUsuarioVIP.id = usuario.user.id;
            
            // 1. Cargar datos de la tabla usuarios
            await cargarDatosBasicosUsuario();
            
            // 2. Cargar diamantes
            await cargarDiamantesUsuario();
            
            // 3. Cargar corazones
            await cargarCorazonesUsuario();
            
            // 4. Calcular racha
            await calcularRachaDiaria();
            
            // 5. Cargar título activo
            await cargarTituloActivo();
            
            // 6. Calcular nivel
            window.datosUsuarioVIP.nivel = calcularNivel(window.datosUsuarioVIP.puntos);
            
            // 7. Actualizar estadísticas
            actualizarEstadisticas();
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
    }
}

async function cargarDatosBasicosUsuario() {
    try {
        const { data: datosUsuario, error: errorUsuario } = await supabaseClient
            .from('usuarios')
            .select('puntos, email, id, nombre, avatar_url')
            .eq('id', window.datosUsuarioVIP.id)
            .single();
        
        if (errorUsuario) {
            console.error('Error cargando datos usuario:', errorUsuario);
            return;
        }
        
        if (datosUsuario) {
            window.datosUsuarioVIP.puntos = datosUsuario?.puntos || 0;
            window.datosUsuarioVIP.avatar_url = datosUsuario?.avatar_url || null;
            
            // Usar la nueva función para información horizontal
            actualizarInfoUsuarioHorizontal(datosUsuario);
            document.getElementById('puntosTotal').textContent = window.datosUsuarioVIP.puntos;
        }
    } catch (error) {
        console.error('Error en cargarDatosBasicosUsuario:', error);
    }
}

async function cargarDiamantesUsuario() {
    try {
        console.log('Cargando diamantes para usuario:', window.datosUsuarioVIP.id);
        
        // Buscar en la tabla diamantes_vip
        const { data: datosDiamantes, error: errorDiamantes } = await supabaseClient
            .from('diamantes_vip')
            .select('diamantes_totales, diamantes_canjeables')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .maybeSingle();
        
        console.log('Resultado consulta diamantes:', { datosDiamantes, errorDiamantes });
        
        if (errorDiamantes) {
            if (errorDiamantes.code === 'PGRST116' || errorDiamantes.message?.includes('No rows found')) {
                console.log('No se encontró registro de diamantes, creando uno nuevo...');
                await crearRegistroDiamantesInicial();
            } else {
                window.datosUsuarioVIP.diamantes = 0;
                window.datosUsuarioVIP.diamantesCanjeables = 0;
            }
        } else if (datosDiamantes) {
            window.datosUsuarioVIP.diamantes = datosDiamantes.diamantes_totales || 0;
            window.datosUsuarioVIP.diamantesCanjeables = datosDiamantes.diamantes_canjeables || 0;
            console.log('Diamantes cargados:', window.datosUsuarioVIP.diamantesCanjeables);
        } else {
            console.log('No hay datos de diamantes, creando registro inicial...');
            await crearRegistroDiamantesInicial();
        }
        
        const diamantesElement = document.getElementById('diamantesTotal');
        if (diamantesElement) {
            diamantesElement.textContent = window.datosUsuarioVIP.diamantesCanjeables;
        }
        
    } catch (error) {
        console.error('Error en cargarDiamantesUsuario:', error);
        window.datosUsuarioVIP.diamantes = 0;
        window.datosUsuarioVIP.diamantesCanjeables = 0;
        
        const diamantesElement = document.getElementById('diamantesTotal');
        if (diamantesElement) {
            diamantesElement.textContent = '0';
        }
    }
}

async function crearRegistroDiamantesInicial() {
    try {
        const { error } = await supabaseClient
            .from('diamantes_vip')
            .insert({
                usuario_id: window.datosUsuarioVIP.id,
                diamantes_totales: 0,
                diamantes_canjeables: 0,
                updated_at: new Date().toISOString()
            });
        
        if (error) {
            console.error('Error creando registro de diamantes:', error);
        } else {
            window.datosUsuarioVIP.diamantes = 0;
            window.datosUsuarioVIP.diamantesCanjeables = 0;
        }
    } catch (error) {
        console.error('Error en crearRegistroDiamantesInicial:', error);
    }
}

async function cargarCorazonesUsuario() {
    try {
        const { data: datosCorazones, error: errorCorazones } = await supabaseClient
            .from('corazones_vip')
            .select('corazones_totales')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .single();
        
        if (errorCorazones) {
            console.error('Error cargando corazones:', errorCorazones);
            window.datosUsuarioVIP.corazones = 0;
        } else if (datosCorazones) {
            window.datosUsuarioVIP.corazones = datosCorazones.corazones_totales || 0;
        }
        
        document.getElementById('corazonesTotal').textContent = window.datosUsuarioVIP.corazones;
        
    } catch (error) {
        console.error('Error en cargarCorazonesUsuario:', error);
        window.datosUsuarioVIP.corazones = 0;
        document.getElementById('corazonesTotal').textContent = '0';
    }
}

async function calcularRachaDiaria() {
    try {
        const { data: reclamaciones, error } = await supabaseClient
            .from('historial_puntos_vip')
            .select('created_at')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .eq('tipo', 'diario')
            .order('created_at', { ascending: false });
        
        if (error) {
            window.datosUsuarioVIP.streakActual = 0;
            return;
        }
        
        if (!reclamaciones || reclamaciones.length === 0) {
            window.datosUsuarioVIP.streakActual = 0;
            return;
        }
        
        let streak = 1;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < reclamaciones.length - 1; i++) {
            const fechaActual = new Date(reclamaciones[i].created_at);
            const fechaSiguiente = new Date(reclamaciones[i + 1].created_at);
            
            fechaActual.setHours(0, 0, 0, 0);
            fechaSiguiente.setHours(0, 0, 0, 0);
            
            const diffTime = fechaActual.getTime() - fechaSiguiente.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
            } else if (diffDays > 1) {
                break;
            }
        }
        
        window.datosUsuarioVIP.streakActual = streak;
        actualizarUIStreak();
        
    } catch (error) {
        console.error('Error calculando racha:', error);
        window.datosUsuarioVIP.streakActual = 0;
    }
}

function actualizarUIStreak() {
    const streakContainer = document.getElementById('streakContainer');
    const streakInfoLogros = document.getElementById('streakInfoLogros');
    const streakCounter = document.getElementById('streakCounter');
    const streakDaysText = document.getElementById('streakDaysText');
    const streakProgressText = document.getElementById('streakProgressText');
    const streakProgressFill = document.getElementById('streakProgressFill');
    
    if (window.datosUsuarioVIP.streakActual > 0) {
        const diasTexto = window.datosUsuarioVIP.streakActual === 1 ? 'día consecutivo' : 'días consecutivos';
        
        if (streakContainer) {
            streakContainer.innerHTML = `
                <div class="streak-info" style="margin-bottom: 20px;">
                    <div class="streak-header">
                        <div class="streak-icon">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div>
                            <div class="streak-counter">${window.datosUsuarioVIP.streakActual}</div>
                            <div class="streak-days-text">${diasTexto}</div>
                        </div>
                    </div>
                    <div class="streak-progress">
                        <div class="progress-labels">
                            <span>Progreso</span>
                            <span>${window.datosUsuarioVIP.streakActual}/7 días</span>
                        </div>
                        <div class="progress-bar-streak">
                            <div class="progress-fill-streak" style="width: ${Math.min((window.datosUsuarioVIP.streakActual / 7) * 100, 100)}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (streakInfoLogros) {
            streakInfoLogros.style.display = 'block';
            if (streakCounter) streakCounter.textContent = window.datosUsuarioVIP.streakActual;
            if (streakDaysText) streakDaysText.textContent = diasTexto;
            if (streakProgressText) streakProgressText.textContent = `${window.datosUsuarioVIP.streakActual}/7 días`;
            if (streakProgressFill) streakProgressFill.style.width = `${Math.min((window.datosUsuarioVIP.streakActual / 7) * 100, 100)}%`;
        }
    } else {
        if (streakContainer) streakContainer.innerHTML = '';
        if (streakInfoLogros) streakInfoLogros.style.display = 'none';
    }
}

function actualizarInfoUsuarioSidebar(datosUsuario) {
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const userAvatarElement = document.getElementById('userAvatar');
    
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

async function cargarTituloActivo() {
    try {
        console.log('Intentando cargar título activo para usuario:', window.datosUsuarioVIP.id);
        
        const { data: tituloActivo, error } = await supabaseClient
            .from('titulo_activo_usuario')
            .select('titulo_id')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .eq('activo', true)
            .maybeSingle();
        
        console.log('Resultado de consulta título activo:', { tituloActivo, error });
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('No se encontró título activo para este usuario');
            } else if (error.code === '42P01') {
                console.error('La tabla titulo_activo_usuario no existe');
                await crearTablaTituloActivoSiNoExiste();
            } else {
                console.error('Error cargando título activo:', error);
            }
            
            window.datosUsuarioVIP.tituloActivo = null;
            // Usar la nueva función para sidebar horizontal
            actualizarTituloSidebarHorizontal(null);
            return;
        }
        
        if (!tituloActivo || !tituloActivo.titulo_id) {
            window.datosUsuarioVIP.tituloActivo = null;
            actualizarTituloSidebarHorizontal(null);
            return;
        }
        
        console.log('Buscando información del título ID:', tituloActivo.titulo_id);
        const { data: tituloInfo, error: errorTitulo } = await supabaseClient
            .from('titulos_usuario')
            .select('titulo, nombre')
            .eq('id', tituloActivo.titulo_id)
            .maybeSingle();
        
        console.log('Resultado de consulta información título:', { tituloInfo, errorTitulo });
        
        if (errorTitulo) {
            console.error('Error obteniendo información del título:', errorTitulo);
            window.datosUsuarioVIP.tituloActivo = null;
        } else if (tituloInfo) {
            window.datosUsuarioVIP.tituloActivo = tituloInfo.titulo || tituloInfo.nombre || 'Título VIP';
        }
        
        console.log('Título activo establecido como:', window.datosUsuarioVIP.tituloActivo);
        // Usar la nueva función para sidebar horizontal
        actualizarTituloSidebarHorizontal(window.datosUsuarioVIP.tituloActivo);
        
    } catch (error) {
        console.error('Error en cargarTituloActivo:', error);
        window.datosUsuarioVIP.tituloActivo = null;
        actualizarTituloSidebarHorizontal(null);
    }
}