// Variables globales para logros
let currentUserId = null;
let currentUserEmail = null;
let currentUserName = null;
let estadisticasUsuario = {};
let logrosDesdeBD = [];
let logrosUsuarioDesdeBD = [];




// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', async function() {
    // Mostrar banner de carga
    actualizarBannerCarga('iniciando');
    
    // Ejecutar cargas en paralelo para mayor velocidad
    try {
        // Cargar todo en paralelo (más rápido)
        await Promise.all([
            (async () => {
                await verificarSesion();
                actualizarBannerCarga('sesion', 25);
            })(),
            (async () => {
                await cargarLogrosDesdeBD();
                actualizarBannerCarga('logros', 50);
            })(),
            (async () => {
                await cargarEstadisticasCompletas();
                actualizarBannerCarga('estadisticas', 75);
            })()
        ]);
        
        // Cargar logros del usuario (depende de las cargas anteriores)
        await cargarLogrosUsuarioDesdeBD();
        actualizarBannerCarga('usuario', 90);
        
        // Verificar logros (rápido)
        await verificarLogros();
        
        // Inicializar y renderizar (instantáneo)
        inicializarEventos();
        renderizarLogros();
        
        // Completar - banner visible solo 800ms máximo
        actualizarBannerCarga('completado', 100);
        
    } catch (error) {
        console.error('Error cargando logros:', error);
        // Ocultar banner rápido aunque haya error
        setTimeout(() => {
            actualizarBannerCarga('completado', 100);
            // Aún mostrar lo que se pudo cargar
            inicializarEventos();
            renderizarLogros();
        }, 500);
    }
});

function actualizarBannerCarga(estado, porcentaje) {
    const banner = document.getElementById('loading-banner');
    const progressFill = document.getElementById('loading-progress-fill');
    const statusText = document.getElementById('loading-status');
    const percentageText = document.getElementById('loading-percentage');
    
    if (!banner) return;
    
    // Asegurar que el banner esté visible
    banner.classList.remove('hidden');
    banner.classList.remove('fade-out');
    
    // Actualizar progreso
    if (porcentaje !== undefined) {
        progressFill.style.width = `${porcentaje}%`;
        percentageText.textContent = `${porcentaje}%`;
    }
    
    switch(estado) {
        case 'iniciando':
            statusText.textContent = 'Preparando logros...';
            progressFill.style.width = '10%';
            percentageText.textContent = '10%';
            break;
            
        case 'sesion':
            statusText.textContent = 'Verificando sesión...';
            progressFill.style.width = '25%';
            percentageText.textContent = '25%';
            break;
            
        case 'logros':
            statusText.textContent = 'Obteniendo logros...';
            progressFill.style.width = '50%';
            percentageText.textContent = '50%';
            break;
            
        case 'estadisticas':
            statusText.textContent = 'Cargando estadísticas...';
            progressFill.style.width = '75%';
            percentageText.textContent = '75%';
            break;
            
        case 'usuario':
            statusText.textContent = 'Cargando tu progreso...';
            progressFill.style.width = '90%';
            percentageText.textContent = '90%';
            break;
            
        case 'completado':
            statusText.textContent = '¡Listo!';
            progressFill.style.width = '100%';
            percentageText.textContent = '100%';
            
            // Ocultar el banner RÁPIDO (solo 300ms de delay)
            setTimeout(() => {
                banner.classList.add('fade-out');
                setTimeout(() => {
                    banner.classList.add('hidden');
                }, 200);
            }, 300); // Solo 300ms de visibilidad
            break;
            
        default:
            statusText.textContent = estado || 'Cargando...';
    }
}

// También puedes agregar esto en caso de error
function mostrarErrorCarga(mensaje) {
    const banner = document.getElementById('loading-banner');
    if (banner) {
        banner.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner-large" style="background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="loading-text">
                    <h3><i class="fas fa-exclamation-circle"></i> Error al cargar</h3>
                    <p>${mensaje || 'Ocurrió un error al cargar tus logros.'}</p>
                    <button class="btn-reclamar" onclick="location.reload()" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i>
                        Reintentar
                    </button>
                </div>
            </div>
        `;
    }
}
// Verificar sesión del usuario
async function verificarSesion() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            window.location.href = 'index.html';
            return;
        }
        
        currentUserId = user.id;
        currentUserEmail = user.email;
        
        // Obtener información del perfil del usuario
        const { data: perfil, error: perfilError } = await supabase
            .from('usuarios')
            .select('nombre, apellidos, avatar_url, puntos')
            .eq('id', currentUserId)
            .single();
        
        if (!perfilError && perfil) {
            currentUserName = perfil.nombre + (perfil.apellidos ? ' ' + perfil.apellidos : '');
            
            // Actualizar interfaz
            const userNameElement = document.getElementById('userName');
            const userEmailElement = document.getElementById('userEmail');
            const userAvatarElement = document.getElementById('userAvatar');
            
            if (userNameElement) userNameElement.textContent = currentUserName || 'Usuario';
            if (userEmailElement) userEmailElement.textContent = currentUserEmail;
            
            if (userAvatarElement) {
                if (perfil.avatar_url) {
                    userAvatarElement.innerHTML = 
                        `<img src="${perfil.avatar_url}" alt="${currentUserName}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">`;
                } else {
                    const initials = currentUserName ? currentUserName.charAt(0).toUpperCase() : 'U';
                    userAvatarElement.innerHTML = 
                        `<div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">
                            ${initials}
                        </div>`;
                }
            }
        }
        
    } catch (error) {
        console.error('Error verificando sesión:', error);
        window.location.href = 'index.html';
    }
}

// Cargar logros desde la base de datos
async function cargarLogrosDesdeBD() {
    try {
        const { data: logros, error } = await supabase
            .from('logros')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        logrosDesdeBD = logros || [];
        
        console.log("Logros cargados desde BD:", logrosDesdeBD);
        
    } catch (error) {
        console.error('Error cargando logros desde BD:', error);
        // Si hay error, usar logros por defecto
        logrosDesdeBD = await obtenerLogrosPorDefecto();
    }
}

// Logros por defecto (en caso de que falle la conexión)
async function obtenerLogrosPorDefecto() {
    return [
        { id: 1, titulo: "Primer Mensaje Recibido", descripcion: "Recibe tu primer mensaje en Trangos", icono: "fa-comment", categoria: "mensajes", objetivo: 1, puntos: 100, tipo: "recibir_mensaje" },
        { id: 2, titulo: "Comunicador Inicial", descripcion: "Envía tu primer mensaje a otro usuario", icono: "fa-paper-plane", categoria: "mensajes", objetivo: 1, puntos: 100, tipo: "enviar_mensaje" },
        { id: 3, titulo: "Mensajero Activo", descripcion: "Envía 20 mensajes en total", icono: "fa-comments", categoria: "mensajes", objetivo: 20, puntos: 300, tipo: "enviar_20_mensajes" },
        { id: 4, titulo: "Popularidad", descripcion: "Recibe 30 mensajes de otros usuarios", icono: "fa-inbox", categoria: "mensajes", objetivo: 30, puntos: 500, tipo: "recibir_30_mensajes" },
        { id: 5, titulo: "Fundador de Grupo", descripcion: "Crea tu primer grupo en Trangos", icono: "fa-users", categoria: "grupos", objetivo: 1, puntos: 200, tipo: "crear_grupo" },
        { id: 6, titulo: "Integrante Social", descripcion: "Acepta una invitación a un grupo", icono: "fa-user-plus", categoria: "grupos", objetivo: 1, puntos: 150, tipo: "unirse_grupo" },
        { id: 7, titulo: "Primera Conexión", descripcion: "Agrega a tu primer amigo en Trangos", icono: "fa-user-friends", categoria: "amigos", objetivo: 1, puntos: 100, tipo: "agregar_amigo" },
        { id: 8, titulo: "Socializador", descripcion: "Ten al menos 2 amigos con buena afinidad", icono: "fa-handshake", categoria: "amigos", objetivo: 2, puntos: 250, tipo: "amigos_afinidad" }
    ];
}

// Cargar estadísticas completas del usuario
async function cargarEstadisticasCompletas() {
    try {
        estadisticasUsuario = {
            mensajes_recibidos: 0,
            mensajes_enviados: 0,
            grupos_creados: 0,
            grupos_unidos: 0,
            amigos_totales: 0,
            amigos_con_afinidad: 0
        };

        // 1. Contar mensajes recibidos del usuario actual
        const { count: recibidosCount } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .eq('destinatario_email', currentUserEmail);

        estadisticasUsuario.mensajes_recibidos = recibidosCount || 0;

        // 2. Contar mensajes enviados del usuario actual
        const { count: enviadosCount } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .eq('remitente_id', currentUserId);

        estadisticasUsuario.mensajes_enviados = enviadosCount || 0;

        // 3. Contar grupos creados por el usuario actual
        try {
            const { count: gruposCreadosCount } = await supabase
                .from('grupos')
                .select('*', { count: 'exact', head: true })
                .eq('creador_id', currentUserId);

            estadisticasUsuario.grupos_creados = gruposCreadosCount || 0;
        } catch (error) {
            console.log("Tabla grupos no disponible o sin campo creador_id");
        }

        // 4. Contar grupos a los que pertenece el usuario actual
        try {
            const { count: gruposUnidosCount } = await supabase
                .from('miembros_grupo')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', currentUserId);

            estadisticasUsuario.grupos_unidos = gruposUnidosCount || 0;
        } catch (error) {
            console.log("Tabla miembros_grupo no disponible");
        }

        // 5. Contar amigos totales del usuario actual
        const { count: amigosCount } = await supabase
            .from('amistades')
            .select('*', { count: 'exact', head: true })
            .or(`usuario_id.eq.${currentUserId},amigo_id.eq.${currentUserId}`)
            .eq('estado', 'aceptada');

        estadisticasUsuario.amigos_totales = amigosCount || 0;

        // 6. Contar amigos con afinidad alta (asumiendo campo 'afinidad' en amistades)
        try {
            const { count: amigosAfinidadCount } = await supabase
                .from('amistades')
                .select('*', { count: 'exact', head: true })
                .or(`usuario_id.eq.${currentUserId},amigo_id.eq.${currentUserId}`)
                .eq('estado', 'aceptada')
                .gte('afinidad', 80); // Asumiendo que afinidad es un porcentaje

            estadisticasUsuario.amigos_con_afinidad = amigosAfinidadCount || 0;
        } catch (error) {
            console.log("Campo afinidad no disponible, usando amigos totales");
            estadisticasUsuario.amigos_con_afinidad = estadisticasUsuario.amigos_totales;
        }

        console.log("Estadísticas cargadas:", estadisticasUsuario);

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Cargar logros del usuario desde la base de datos
async function cargarLogrosUsuarioDesdeBD() {
    try {
        const { data: logrosUsuario, error } = await supabase
            .from('logros_usuario')
            .select(`
                *,
                logro:logro_id (
                    id,
                    titulo,
                    categoria
                )
            `)
            .eq('usuario_id', currentUserId);

        if (!error && logrosUsuario) {
            logrosUsuarioDesdeBD = logrosUsuario;
            console.log("Logros del usuario cargados desde BD:", logrosUsuarioDesdeBD);
        } else {
            logrosUsuarioDesdeBD = [];
        }

    } catch (error) {
        console.error('Error cargando logros del usuario desde BD:', error);
        logrosUsuarioDesdeBD = [];
    }
}

// Verificar y actualizar logros basados en estadísticas
async function verificarLogros() {
    try {
        let nuevosLogrosDesbloqueados = [];

        // Para cada logro en la BD
        for (const logroBD of logrosDesdeBD) {
            // Buscar si el usuario ya tiene este logro
            const logroUsuario = logrosUsuarioDesdeBD.find(lu => lu.logro_id === logroBD.id);
            
            // Preparar objeto logro para la interfaz
            const logro = {
                ...logroBD,
                desbloqueado: !!logroUsuario,
                reclamado: logroUsuario?.reclamado || false,
                progreso: 0,
                recompensa: `${logroBD.puntos} puntos`
            };

            // Si ya está reclamado, progreso completo
            if (logro.reclamado) {
                logro.progreso = logroBD.objetivo;
                continue;
            }

            // Calcular progreso según el tipo de logro
            let progresoActual = 0;
            let objetivoCumplido = false;

            switch(logroBD.tipo) {
                case "recibir_mensaje":
                    progresoActual = estadisticasUsuario.mensajes_recibidos;
                    objetivoCumplido = progresoActual >= logroBD.objetivo;
                    break;
                
                case "enviar_mensaje":
                    progresoActual = estadisticasUsuario.mensajes_enviados;
                    objetivoCumplido = progresoActual >= logroBD.objetivo;
                    break;
                
                case "enviar_20_mensajes":
                    progresoActual = estadisticasUsuario.mensajes_enviados;
                    objetivoCumplido = progresoActual >= logroBD.objetivo;
                    break;
                
                case "recibir_30_mensajes":
                    progresoActual = estadisticasUsuario.mensajes_recibidos;
                    objetivoCumplido = progresoActual >= logroBD.objetivo;
                    break;
                
                case "crear_grupo":
                    progresoActual = estadisticasUsuario.grupos_creados;
                    objetivoCumplido = progresoActual >= logroBD.objetivo;
                    break;
                
                case "unirse_grupo":
                    // Unirse a grupo se considera si está en algún grupo (creado o unido)
                    progresoActual = estadisticasUsuario.grupos_creados + estadisticasUsuario.grupos_unidos;
                    objetivoCumplido = progresoActual >= logroBD.objetivo;
                    break;
                
                case "agregar_amigo":
                    progresoActual = estadisticasUsuario.amigos_totales;
                    objetivoCumplido = progresoActual >= logroBD.objetivo;
                    break;
                
                case "amigos_afinidad":
                    progresoActual = estadisticasUsuario.amigos_con_afinidad;
                    objetivoCumplido = progresoActual >= logroBD.objetivo;
                    break;
                
                default:
                    console.log(`Tipo de logro desconocido: ${logroBD.tipo}`);
                    continue;
            }

            logro.progreso = Math.min(progresoActual, logroBD.objetivo);
            
            // Si se cumple el objetivo y no está desbloqueado aún
            if (objetivoCumplido && !logro.desbloqueado) {
                logro.desbloqueado = true;
                nuevosLogrosDesbloqueados.push(logro);
            }
        }

        // Guardar nuevos logros desbloqueados en la BD
        for (const logro of nuevosLogrosDesbloqueados) {
            const guardado = await guardarLogroDesbloqueado(logro.id);
            if (guardado) {
                // Agregar a la lista local
                logrosUsuarioDesdeBD.push({
                    usuario_id: currentUserId,
                    logro_id: logro.id,
                    reclamado: false,
                    fecha_desbloqueo: new Date().toISOString(),
                    logro: { id: logro.id, titulo: logro.titulo, categoria: logro.categoria }
                });
                
                // Mostrar notificación
                mostrarNotificacionLogroDesbloqueado(logro);
            }
        }

        // Actualizar estadísticas en la interfaz
        actualizarEstadisticasUI();

    } catch (error) {
        console.error('Error verificando logros:', error);
    }
}

// Guardar logro desbloqueado en la base de datos
async function guardarLogroDesbloqueado(logroId) {
    try {
        const { error } = await supabase
            .from('logros_usuario')
            .insert({
                usuario_id: currentUserId,
                logro_id: logroId,
                fecha_desbloqueo: new Date().toISOString(),
                reclamado: false
            });

        if (error) {
            console.error('Error guardando logro desbloqueado:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error en guardarLogroDesbloqueado:', error);
        return false;
    }
}

// Reclamar recompensa de un logro
async function reclamarLogro(logroId) {
    try {
        const logroBD = logrosDesdeBD.find(l => l.id === logroId);
        if (!logroBD) {
            Swal.fire('Error', 'Logro no encontrado en la base de datos', 'error');
            return;
        }

        // Buscar si el usuario tiene este logro
        const logroUsuario = logrosUsuarioDesdeBD.find(lu => lu.logro_id === logroId);
        
        if (!logroUsuario) {
            Swal.fire('No disponible', 'Debes completar el logro antes de reclamar la recompensa', 'warning');
            return;
        }

        if (logroUsuario.reclamado) {
            Swal.fire('Ya reclamado', 'Ya has reclamado la recompensa de este logro', 'info');
            return;
        }

        // Mostrar confirmación
        const { value: confirmar } = await Swal.fire({
            title: '¿Reclamar recompensa?',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div class="achievement-icon icon-${logroBD.categoria}" style="margin: 0 auto 15px; width: 70px; height: 70px; font-size: 32px;">
                        <i class="fas ${logroBD.icono}"></i>
                    </div>
                    <h3 style="color: #333; margin-bottom: 10px;">${logroBD.titulo}</h3>
                    <div style="background: #fff8e1; border-radius: 10px; padding: 15px; margin: 15px 0;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                            <i class="fas fa-gem" style="color: #FFC107; font-size: 22px;"></i>
                            <span style="font-size: 20px; font-weight: bold; color: #333;">
                                +${logroBD.puntos} puntos
                            </span>
                        </div>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '¡Reclamar!',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#d33'
        });

        if (!confirmar) return;

        // Actualizar en la base de datos
        const { error } = await supabase
            .from('logros_usuario')
            .update({
                reclamado: true,
                fecha_reclamado: new Date().toISOString()
            })
            .eq('usuario_id', currentUserId)
            .eq('logro_id', logroId);

        if (error) {
            console.error('Error reclamando logro:', error);
            Swal.fire('Error', 'No se pudo reclamar la recompensa', 'error');
            return;
        }

        // Actualizar en la lista local
        const index = logrosUsuarioDesdeBD.findIndex(lu => lu.logro_id === logroId);
        if (index !== -1) {
            logrosUsuarioDesdeBD[index].reclamado = true;
            logrosUsuarioDesdeBD[index].fecha_reclamado = new Date().toISOString();
        }

        // Sumar puntos al usuario
        await sumarPuntosUsuario(logroBD.puntos);

        // Mostrar notificación de éxito
        mostrarNotificacionRecompensaReclamada(logroBD);

        // Actualizar interfaz
        renderizarLogros();
        actualizarEstadisticasUI();

    } catch (error) {
        console.error('Error en reclamarLogro:', error);
        Swal.fire('Error', 'Ocurrió un error al reclamar la recompensa', 'error');
    }
}

// Sumar puntos al usuario
async function sumarPuntosUsuario(puntos) {
    try {
        // Primero, obtener los puntos actuales del usuario
        const { data: usuario, error: errorUsuario } = await supabase
            .from('usuarios')
            .select('puntos, nombre')
            .eq('id', currentUserId)
            .single();

        if (errorUsuario) {
            console.error('Error obteniendo puntos del usuario:', errorUsuario);
            return;
        }

        const nuevosPuntos = (usuario.puntos || 0) + puntos;

        // Actualizar puntos del usuario
        const { error: errorUpdate } = await supabase
            .from('usuarios')
            .update({ puntos: nuevosPuntos })
            .eq('id', currentUserId);

        if (errorUpdate) {
            console.error('Error actualizando puntos:', errorUpdate);
        }

        console.log(`Puntos actualizados: ${usuario.puntos || 0} + ${puntos} = ${nuevosPuntos}`);

        // Actualizar el nombre del usuario en la interfaz con los nuevos puntos
        const userNameElement = document.getElementById('userName');
        if (userNameElement && currentUserName) {
            userNameElement.textContent = `${currentUserName} (${nuevosPuntos} pts)`;
        }

    } catch (error) {
        console.error('Error en sumarPuntosUsuario:', error);
    }
}

// Obtener logro para la interfaz (con estado actual)
function obtenerLogroParaInterfaz(logroBD) {
    const logroUsuario = logrosUsuarioDesdeBD.find(lu => lu.logro_id === logroBD.id);
    
    // Calcular progreso según estadísticas
    let progreso = 0;
    if (logroUsuario?.reclamado) {
        progreso = logroBD.objetivo; // Ya reclamado, progreso completo
    } else {
        // Calcular progreso basado en estadísticas
        progreso = calcularProgresoLogro(logroBD);
    }
    
    return {
        ...logroBD,
        desbloqueado: !!logroUsuario,
        reclamado: logroUsuario?.reclamado || false,
        progreso: progreso,
        recompensa: `${logroBD.puntos} puntos`
    };
}

// Calcular progreso de un logro basado en estadísticas
function calcularProgresoLogro(logroBD) {
    let progresoActual = 0;
    
    switch(logroBD.tipo) {
        case "recibir_mensaje":
            progresoActual = estadisticasUsuario.mensajes_recibidos;
            break;
        case "enviar_mensaje":
            progresoActual = estadisticasUsuario.mensajes_enviados;
            break;
        case "enviar_20_mensajes":
            progresoActual = estadisticasUsuario.mensajes_enviados;
            break;
        case "recibir_30_mensajes":
            progresoActual = estadisticasUsuario.mensajes_recibidos;
            break;
        case "crear_grupo":
            progresoActual = estadisticasUsuario.grupos_creados;
            break;
        case "unirse_grupo":
            progresoActual = estadisticasUsuario.grupos_creados + estadisticasUsuario.grupos_unidos;
            break;
        case "agregar_amigo":
            progresoActual = estadisticasUsuario.amigos_totales;
            break;
        case "amigos_afinidad":
            progresoActual = estadisticasUsuario.amigos_con_afinidad;
            break;
    }
    
    return Math.min(progresoActual, logroBD.objetivo);
}

// Mostrar notificación cuando se desbloquea un logro
function mostrarNotificacionLogroDesbloqueado(logro) {
    Swal.fire({
        title: '🎉 ¡Logro Desbloqueado!',
        html: `
            <div style="text-align: center; padding: 20px;">
                <div class="achievement-icon icon-${logro.categoria}" style="margin: 0 auto 20px; width: 80px; height: 80px; font-size: 36px;">
                    <i class="fas ${logro.icono}"></i>
                </div>
                <h3 style="color: #333; margin-bottom: 10px;">${logro.titulo}</h3>
                <p style="color: #666; margin-bottom: 20px;">${logro.descripcion}</p>
                <div style="background: rgba(255, 193, 7, 0.1); border-radius: 10px; padding: 15px; margin-top: 15px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <i class="fas fa-gem" style="color: #FFC107; font-size: 24px;"></i>
                        <span style="font-size: 18px; font-weight: bold; color: #333;">
                            Recompensa: ${logro.recompensa}
                        </span>
                    </div>
                </div>
                <p style="color: #4CAF50; margin-top: 15px; font-weight: 600;">
                    <i class="fas fa-gift"></i> ¡Ve a reclamar tu recompensa!
                </p>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Ver logros',
        confirmButtonColor: '#667eea',
        timer: 6000,
        timerProgressBar: true
    });
}

// Mostrar notificación cuando se reclama una recompensa
function mostrarNotificacionRecompensaReclamada(logro) {
    Swal.fire({
        title: '🎁 ¡Recompensa Reclamada!',
        html: `
            <div style="text-align: center; padding: 20px;">
                <div class="achievement-icon icon-${logro.categoria}" style="margin: 0 auto 20px; width: 80px; height: 80px; font-size: 36px; background: #4CAF50;">
                    <i class="fas ${logro.icono}"></i>
                </div>
                <h3 style="color: #333; margin-bottom: 10px;">${logro.titulo}</h3>
                <div style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.2)); border-radius: 10px; padding: 20px; margin: 15px 0;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
                        <i class="fas fa-gem" style="color: #FFC107; font-size: 28px;"></i>
                        <span style="font-size: 24px; font-weight: bold; color: #333;">
                            +${logro.puntos} puntos
                        </span>
                    </div>
                    <p style="color: #4CAF50; font-size: 16px; margin: 0;">
                        <i class="fas fa-check-circle"></i> Recompensa añadida a tu cuenta
                    </p>
                </div>
                <p style="color: #666; margin-top: 15px;">
                    ¡Sigue completando logros para ganar más recompensas!
                </p>
            </div>
        `,
        icon: 'success',
        confirmButtonText: '¡Genial!',
        confirmButtonColor: '#4CAF50',
        timer: 5000,
        timerProgressBar: true
    });
}

// Actualizar estadísticas en la interfaz
function actualizarEstadisticasUI() {
    // Calcular total de logros desbloqueados y reclamados
    let totalLogrosDesbloqueados = 0;
    let totalLogrosReclamados = 0;
    let totalPuntos = 0;
    let totalPuntosDisponibles = 0;
    const totalLogros = logrosDesdeBD.length;

    // Contar logros por categoría
    const logrosPorCategoria = {
        mensajes: 0,
        grupos: 0,
        amigos: 0
    };

    logrosDesdeBD.forEach(logroBD => {
        const logroUsuario = logrosUsuarioDesdeBD.find(lu => lu.logro_id === logroBD.id);
        
        // Contar por categoría
        if (logroBD.categoria in logrosPorCategoria) {
            logrosPorCategoria[logroBD.categoria]++;
        }
        
        if (logroUsuario) {
            totalLogrosDesbloqueados++;
            totalPuntosDisponibles += logroBD.puntos;
            
            if (logroUsuario.reclamado) {
                totalLogrosReclamados++;
                totalPuntos += logroBD.puntos;
            }
        }
    });

    const progresoPorcentaje = Math.round((totalLogrosDesbloqueados / totalLogros) * 100);
    const puntosPendientes = totalPuntosDisponibles - totalPuntos;

    // Actualizar UI
    document.getElementById('total-logros').textContent = `${totalLogrosDesbloqueados}/${totalLogros}`;
    document.getElementById('total-puntos').textContent = totalPuntos;
    document.getElementById('progreso').textContent = `${progresoPorcentaje}%`;

    // Actualizar contadores en la barra lateral
    document.getElementById('count-mensajes').textContent = logrosPorCategoria.mensajes;
    document.getElementById('count-grupos').textContent = logrosPorCategoria.grupos;
    document.getElementById('count-amigos').textContent = logrosPorCategoria.amigos;

    // Obtener puntos actuales del usuario para mostrar en el nombre
    obtenerPuntosUsuarioParaMostrar();

    // Mostrar notificación si hay puntos pendientes por reclamar
    if (puntosPendientes > 0 && totalLogrosDesbloqueados > totalLogrosReclamados) {
        mostrarNotificacionPuntosPendientes(puntosPendientes);
    }
}

// Obtener puntos del usuario para mostrar en el nombre
async function obtenerPuntosUsuarioParaMostrar() {
    try {
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('puntos')
            .eq('id', currentUserId)
            .single();

        if (!error && usuario && currentUserName) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = `${currentUserName} (${usuario.puntos || 0} pts)`;
            }
        }
    } catch (error) {
        console.error('Error obteniendo puntos para mostrar:', error);
    }
}

// Mostrar notificación de puntos pendientes por reclamar
function mostrarNotificacionPuntosPendientes(puntosPendientes) {
    // Solo mostrar una vez por sesión
    if (sessionStorage.getItem('notificacionPuntosMostrada')) return;
    
    setTimeout(() => {
        Swal.fire({
            title: '💰 ¡Tienes recompensas pendientes!',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-coins" style="font-size: 48px; color: #FFC107; margin-bottom: 15px;"></i>
                    <p style="color: #333; font-size: 18px; margin-bottom: 10px;">
                        Tienes <strong style="color: #FFC107;">${puntosPendientes} puntos</strong> pendientes por reclamar
                    </p>
                    <p style="color: #666;">
                        Reclama tus logros completados para obtener las recompensas
                    </p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Ver mis logros',
            confirmButtonColor: '#667eea',
            timer: 8000,
            timerProgressBar: true
        });
        
        sessionStorage.setItem('notificacionPuntosMostrada', 'true');
    }, 3000);
}

// Renderizar logros en la interfaz
function renderizarLogros() {
    // Agrupar logros por categoría
    const logrosPorCategoria = {
        mensajes: [],
        grupos: [],
        amigos: []
    };
    
    // Procesar cada logro desde la BD
    logrosDesdeBD.forEach(logroBD => {
        const logro = obtenerLogroParaInterfaz(logroBD);
        
        if (logro.categoria in logrosPorCategoria) {
            logrosPorCategoria[logro.categoria].push(logro);
        }
    });
    
    // Renderizar logros de mensajes
    const contenedorMensajes = document.getElementById('mensajes-logros');
    contenedorMensajes.innerHTML = logrosPorCategoria.mensajes
        .map(logro => crearTarjetaLogro(logro))
        .join('');
    
    // Renderizar logros de grupos
    const contenedorGrupos = document.getElementById('grupos-logros');
    contenedorGrupos.innerHTML = logrosPorCategoria.grupos
        .map(logro => crearTarjetaLogro(logro))
        .join('');
    
    // Renderizar logros de amigos
    const contenedorAmigos = document.getElementById('amigos-logros');
    contenedorAmigos.innerHTML = logrosPorCategoria.amigos
        .map(logro => crearTarjetaLogro(logro))
        .join('');
}

// Crear tarjeta de logro HTML con botón de reclamar
function crearTarjetaLogro(logro) {
    const porcentaje = Math.min(Math.round((logro.progreso / logro.objetivo) * 100), 100);
    const estadoClase = logro.desbloqueado ? 'unlocked' : 'locked';
    const reclamadoClase = logro.reclamado ? 'reclamado' : '';
    const iconoClase = `icon-${logro.categoria}`;
    
    // Determinar el botón a mostrar
    let botonHTML = '';
    if (logro.desbloqueado && !logro.reclamado) {
        botonHTML = `
            <button class="btn-reclamar" onclick="reclamarLogro(${logro.id})">
                <i class="fas fa-gift"></i>
                Reclamar
            </button>
        `;
    } else if (logro.reclamado) {
        botonHTML = `
            <div class="reclamado-badge">
                <i class="fas fa-check-circle"></i>
                Reclamado
            </div>
        `;
    } else {
        botonHTML = `
            <div class="btn-bloqueado">
                <i class="fas fa-lock"></i>
                Bloqueado
            </div>
        `;
    }
    
    return `
        <div class="achievement-card ${estadoClase} ${reclamadoClase}" data-id="${logro.id}" onclick="verDetalleLogro(${logro.id})">
            <div class="achievement-icon ${iconoClase}">
                <i class="fas ${logro.icono}"></i>
            </div>
            <div class="achievement-info">
                <div class="achievement-title">
                    ${logro.titulo}
                    ${logro.desbloqueado ? 
                        '<i class="fas fa-unlock" style="color: #4CAF50;"></i>' : 
                        '<i class="fas fa-lock" style="color: #ff5252;"></i>'}
                </div>
                <div class="achievement-description">${logro.descripcion}</div>
                
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${porcentaje}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>${logro.desbloqueado ? 
                            (logro.reclamado ? '¡Reclamado!' : '¡Completado!') 
                            : `Progreso: ${logro.progreso}/${logro.objetivo}`}</span>
                        <span>${porcentaje}%</span>
                    </div>
                </div>
                
                <div class="achievement-reward">
                    <i class="fas fa-gem"></i>
                    <span>Recompensa: ${logro.recompensa}</span>
                </div>
                
                <!-- Botón de acción -->
                <div class="achievement-action">
                    ${botonHTML}
                </div>
            </div>
            <div class="achievement-badge">${logro.puntos} pts</div>
        </div>
    `;
}

// Ver detalle del logro
function verDetalleLogro(idLogro) {
    const logroBD = logrosDesdeBD.find(l => l.id === idLogro);
    if (!logroBD) return;
    
    const logro = obtenerLogroParaInterfaz(logroBD);
    const logroUsuario = logrosUsuarioDesdeBD.find(lu => lu.logro_id === idLogro);
    
    const modal = document.getElementById('achievement-modal');
    const modalBody = document.getElementById('modal-body');
    
    const porcentaje = Math.min(Math.round((logro.progreso / logro.objetivo) * 100), 100);
    
    // Determinar botón de acción para el modal
    let botonAccionHTML = '';
    if (logro.desbloqueado && !logro.reclamado) {
        botonAccionHTML = `
            <button class="btn-primary" onclick="reclamarLogro(${logro.id})" style="margin-top: 20px; width: 100%;">
                <i class="fas fa-gift"></i>
                Reclamar Recompensa
            </button>
        `;
    } else if (logro.reclamado && logroUsuario?.fecha_reclamado) {
        const fechaReclamado = new Date(logroUsuario.fecha_reclamado).toLocaleDateString('es-ES');
        botonAccionHTML = `
            <div style="background: #4CAF50; color: white; padding: 12px; border-radius: 8px; margin-top: 20px; text-align: center;">
                <i class="fas fa-check-circle"></i>
                Recompensa reclamada el ${fechaReclamado}
            </div>
        `;
    } else {
        botonAccionHTML = `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-top: 20px; text-align: center; color: #666;">
                <i class="fas fa-lock"></i>
                Completa el logro para reclamar
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div class="achievement-icon icon-${logro.categoria}" style="margin: 0 auto 15px; width: 80px; height: 80px; font-size: 36px;">
                <i class="fas ${logro.icono}"></i>
            </div>
            <h3 style="color: #333; margin-bottom: 10px;">${logro.titulo}</h3>
            <p style="color: #666; margin-bottom: 20px;">${logro.descripcion}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: 600; color: #333;">Estado:</span>
                <span style="color: ${logro.reclamado ? '#4CAF50' : logro.desbloqueado ? '#FF9800' : '#ff5252'}; font-weight: 600;">
                    ${logro.reclamado ? '¡Reclamado!' : logro.desbloqueado ? '¡Desbloqueado!' : 'Bloqueado'}
                </span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="font-weight: 600; color: #333;">Progreso:</span>
                <span style="color: #333; font-weight: 600;">${logro.progreso}/${logro.objetivo}</span>
            </div>
            
            <div class="progress-bar" style="height: 10px;">
                <div class="progress-fill" style="width: ${porcentaje}%"></div>
            </div>
        </div>
        
        <div style="background: #fff8e1; padding: 15px; border-radius: 10px; border: 1px solid #ffecb3;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <i class="fas fa-gem" style="color: #FFC107; font-size: 18px;"></i>
                <span style="font-weight: 600; color: #333;">Recompensa:</span>
            </div>
            <p style="color: #666; margin: 0; font-size: 16px; font-weight: 600;">
                ${logro.recompensa}
            </p>
            ${logroUsuario?.fecha_desbloqueo ? 
                `<p style="color: #666; margin-top: 8px; font-size: 14px;">
                    <i class="fas fa-calendar-alt"></i> Desbloqueado: ${new Date(logroUsuario.fecha_desbloqueo).toLocaleDateString('es-ES')}
                </p>` : ''
            }
        </div>
        
        ${!logro.desbloqueado ? `
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 10px; border: 1px solid #c8e6c9;">
                <h4 style="color: #2e7d32; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-lightbulb"></i> ¿Cómo completar?
                </h4>
                <p style="color: #388e3c; margin: 0; font-size: 14px;">
                    ${getConsejoLogro(logro.tipo)}
                </p>
            </div>
        ` : ''}
        
        ${botonAccionHTML}
    `;
    
    modal.style.display = 'flex';
}

// Obtener consejo según el tipo de logro
function getConsejoLogro(tipo) {
    const consejos = {
        "recibir_mensaje": "Interactúa con otros usuarios enviándoles mensajes primero. ¡Así te responderán!",
        "enviar_mensaje": "Encuentra a alguien en tu lista de usuarios y envíale un mensaje de saludo.",
        "enviar_20_mensajes": "Mantén conversaciones activas con tus amigos y participa en grupos.",
        "recibir_30_mensajes": "Sé activo en la comunidad y responde a los mensajes que te envíen.",
        "crear_grupo": "Ve a la sección de grupos y crea uno sobre un tema que te interese.",
        "unirse_grupo": "Busca grupos públicos o acepta invitaciones de grupos de tus amigos.",
        "agregar_amigo": "Visita perfiles de otros usuarios y envíales solicitudes de amistad.",
        "amigos_afinidad": "Interactúa regularmente con tus amigos enviando y respondiendo mensajes."
    };
    
    return consejos[tipo] || "Sigue usando la plataforma de forma activa para completar este logro.";
}

// Inicializar eventos
function inicializarEventos() {
    // Navegación entre categorías
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            cambiarCategoria(this.dataset.category);
        });
    });

    // Botón de actualizar (recargar todo)
    const refreshBtn = document.getElementById('refresh-users');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
            refreshBtn.disabled = true;
            
            await cargarLogrosDesdeBD();
            await cargarEstadisticasCompletas();
            await cargarLogrosUsuarioDesdeBD();
            await verificarLogros();
            renderizarLogros();
            
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar';
            refreshBtn.disabled = false;
            
            Swal.fire({
                title: '¡Actualizado!',
                text: 'Los logros se han actualizado correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }

    // Modales
    document.getElementById('modal-close')?.addEventListener('click', () => {
        document.getElementById('achievement-modal').style.display = 'none';
    });
    
    document.getElementById('modal-cancel')?.addEventListener('click', () => {
        document.getElementById('achievement-modal').style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('achievement-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }

    // Botón de usuario (ya tiene onclick en el HTML)
    const btnConfiguracion = document.getElementById('btnConfiguracion');
    if (btnConfiguracion) {
        btnConfiguracion.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btnConfiguracion.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
}

// Cambiar categoría activa
function cambiarCategoria(categoria) {
    // Actualizar botones activos
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === categoria);
    });

    // Actualizar contenido visible
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === `${categoria}-content`);
    });

    // Actualizar título y descripción
    const titulos = {
        mensajes: 'Logros de Mensajes',
        grupos: 'Logros de Grupos',
        amigos: 'Logros de Amigos'
    };

    const descripciones = {
        mensajes: 'Completa logros relacionados con mensajes y comunicación',
        grupos: 'Completa logros relacionados con grupos y comunidades',
        amigos: 'Completa logros relacionados con amistades y conexiones'
    };

    document.getElementById('page-title').textContent = titulos[categoria];
    document.getElementById('page-description').textContent = descripciones[categoria];
}

// Función para recargar todos los datos
async function recargarDatos() {
    await cargarLogrosDesdeBD();
    await cargarEstadisticasCompletas();
    await cargarLogrosUsuarioDesdeBD();
    await verificarLogros();
    renderizarLogros();
}

// Agregar funciones globales
window.recargarLogros = recargarDatos;
window.reclamarLogro = reclamarLogro;
window.verDetalleLogro = verDetalleLogro;