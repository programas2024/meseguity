// Variables globales
let currentUserId = null; // ID del usuario que inició sesión
let currentUserEmail = null;
let currentUserName = null;

// Datos en memoria
let usuariosData = [];
let amigosData = [];
let mensajesData = [];

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar sesión del usuario
    await verificarSesion();
    
    // Inicializar eventos
    inicializarEventos();
    
    // Cargar datos iniciales
    await cargarEstadisticas();
    await cargarUsuarios();
});

// Verificar sesión del usuario
async function verificarSesion() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            // Si no hay sesión, redirigir al login
            window.location.href = 'index.html';
            return;
        }
        
        currentUserId = user.id;
        currentUserEmail = user.email;
        
        // Obtener información del perfil del usuario
        const { data: perfil, error: perfilError } = await supabase
            .from('usuarios')
            .select('nombre, apellidos, avatar_url')
            .eq('id', currentUserId)
            .single();
        
        if (!perfilError && perfil) {
            currentUserName = perfil.nombre + (perfil.apellidos ? ' ' + perfil.apellidos : '');
            
            // ACTUALIZAR INTERFAZ CON LOS NUEVOS IDs
            const userNameElement = document.getElementById('userName');
            const userEmailElement = document.getElementById('userEmail');
            const userAvatarElement = document.getElementById('userAvatar');
            
            if (userNameElement) {
                userNameElement.textContent = currentUserName || 'Administrador';
            }
            
            if (userEmailElement) {
                userEmailElement.textContent = currentUserEmail;
            }
            
            if (userAvatarElement) {
                if (perfil.avatar_url) {
                    userAvatarElement.innerHTML = 
                        `<img src="${perfil.avatar_url}" alt="${currentUserName}" class="avatar-img">`;
                } else {
                    const initials = currentUserName ? currentUserName.charAt(0).toUpperCase() : 'A';
                    userAvatarElement.innerHTML = `<span style="color: white; font-weight: bold; font-size: 20px;">${initials}</span>`;
                }
            }
        } else {
            // Si no hay perfil, usar datos básicos del auth
            const userNameElement = document.getElementById('userName');
            const userEmailElement = document.getElementById('userEmail');
            
            if (userNameElement) {
                userNameElement.textContent = 'Administrador';
            }
            
            if (userEmailElement) {
                userEmailElement.textContent = currentUserEmail;
            }
        }
        
    } catch (error) {
        console.error('Error verificando sesión:', error);
        window.location.href = 'index.html';
    }
}

// Inicializar eventos
function inicializarEventos() {
    // Navegación entre categorías
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            cambiarCategoria(this.dataset.category);
        });
    });

    // Botones de actualización
    document.getElementById('refresh-users').addEventListener('click', () => cargarUsuarios());
    document.getElementById('refresh-friends').addEventListener('click', () => cargarAmigos());
    document.getElementById('refresh-messages').addEventListener('click', () => cargarMensajes());

    // Búsqueda
    document.getElementById('search-users').addEventListener('input', (e) => buscarUsuarios(e.target.value));
    document.getElementById('search-friends').addEventListener('input', (e) => buscarAmigos(e.target.value));
    document.getElementById('search-messages').addEventListener('input', (e) => buscarMensajes(e.target.value));

    // Modales
    document.getElementById('modal-close').addEventListener('click', () => document.getElementById('detail-modal').style.display = 'none');
    document.getElementById('modal-cancel').addEventListener('click', () => document.getElementById('detail-modal').style.display = 'none');
    document.getElementById('message-modal-close').addEventListener('click', () => document.getElementById('message-modal').style.display = 'none');
    document.getElementById('message-modal-cancel').addEventListener('click', () => document.getElementById('message-modal').style.display = 'none');

    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });

    // Botón de usuario (ya tiene onclick en el HTML)
    const btnConfiguracion = document.getElementById('btnConfiguracion');
    if (btnConfiguracion) {
        // Ya tiene onclick="window.location.href='configuracion.html'" en el HTML
        // También podemos agregar un listener para efectos visuales
        btnConfiguracion.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btnConfiguracion.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
}

// Cambiar categoría activa
async function cambiarCategoria(categoria) {
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
        usuarios: 'Todos los Usuarios',
        amigos: 'Mis Amigos',
        mensajes: 'Ranking de Mensajes'
    };

    const descripciones = {
        usuarios: 'Gestiona y administra todos los usuarios registrados en Trangos',
        amigos: 'Administra tus relaciones de amistad',
        mensajes: 'Usuarios ordenados por cantidad total de mensajes'
    };

    document.getElementById('page-title').textContent = titulos[categoria];
    document.getElementById('page-description').textContent = descripciones[categoria];

    // Cargar datos según la categoría
    switch(categoria) {
        case 'usuarios':
            await cargarUsuarios();
            break;
        case 'amigos':
            await cargarAmigos();
            break;
        case 'mensajes':
            await cargarMensajes();
            break;
    }
}

// CONSULTA 1: Cargar estadísticas
async function cargarEstadisticas() {
    try {
        // 1. Total de usuarios
        const { count: totalUsuarios, error: errorUsuarios } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true });

        if (!errorUsuarios) {
            document.getElementById('total-users').textContent = totalUsuarios;
            document.getElementById('count-usuarios').textContent = totalUsuarios;
        }

        // 2. Total de amigos del usuario actual
        const { count: totalAmigos, error: errorAmigos } = await supabase
            .from('amistades')
            .select('*', { count: 'exact', head: true })
            .or(`usuario_id.eq.${currentUserId},amigo_id.eq.${currentUserId}`)
            .eq('estado', 'aceptada');

        if (!errorAmigos) {
            document.getElementById('total-friends').textContent = totalAmigos;
            document.getElementById('count-amigos').textContent = totalAmigos;
        }

        // 3. Total de mensajes del usuario actual
        const { count: totalMensajes, error: errorMensajes } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .or(`remitente_id.eq.${currentUserId},destinatario_email.eq.${currentUserEmail}`);

        if (!errorMensajes) {
            document.getElementById('total-messages').textContent = totalMensajes;
        }

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// CONSULTA 2: Cargar todos los usuarios
async function cargarUsuarios() {
    const tbody = document.getElementById('usuarios-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="2" class="loading-row">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Cargando usuarios...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select(`
                id,
                nombre,
                apellidos,
                email,
                avatar_url,
                usuario_rangos (
                    rangos (
                        nombre,
                        puntos_minimos
                    )
                )
            `)
            .order('nombre', { ascending: true });

        if (error) throw error;

        usuariosData = usuarios || [];
        mostrarUsuarios(usuariosData);

    } catch (error) {
        console.error('Error cargando usuarios:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="error-row">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Error al cargar usuarios</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Mostrar usuarios en la tabla con etiqueta "(Tú)" para el usuario actual
function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('usuarios-body');
    
    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="empty-row">
                    <div class="empty-message">
                        <i class="fas fa-users-slash"></i>
                        <span>No hay usuarios registrados</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = usuarios.map(usuario => {
        const nombreCompleto = usuario.nombre + (usuario.apellidos ? ' ' + usuario.apellidos : '');
        const avatarIniciales = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
        const nombreMostrar = nombreCompleto.length > 20 ? nombreCompleto.substring(0, 20) + '...' : nombreCompleto;
        const esUsuarioActual = usuario.id === currentUserId;
        
        return `
        <tr data-id="${usuario.id}" class="${esUsuarioActual ? 'current-user-row' : ''}">
            <td>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <!-- AVATAR (IZQUIERDA) -->
                    <div style="flex-shrink: 0;">
                        ${usuario.avatar_url ? 
                            `<img src="${usuario.avatar_url}" alt="${nombreCompleto}" 
                                 style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: ${esUsuarioActual ? '3px solid #667eea' : '2px solid #e0e0e0'};">` :
                            `<div style="width: 45px; height: 45px; border-radius: 50%; 
                                      background: ${esUsuarioActual ? 
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
                                      display: flex; align-items: center; justify-content: center; 
                                      color: white; font-weight: 600; font-size: 18px;
                                      border: ${esUsuarioActual ? '3px solid #667eea' : '2px solid rgba(102, 126, 234, 0.3)'};">
                                ${avatarIniciales}
                            </div>`
                        }
                    </div>
                    
                    <!-- NOMBRE (DERECHA) -->
                    <div style="flex: 1;">
                        <span style="font-weight: 600; color: ${esUsuarioActual ? '#667eea' : '#333'}; font-size: 15px;" 
                              title="${nombreCompleto}">
                            ${nombreMostrar} 
                            ${esUsuarioActual ? 
                                '<span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 8px;">Tú</span>' 
                                : ''}
                        </span>
                    </div>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="verDetalleUsuario('${usuario.id}')">
                        <i class="fas fa-eye"></i>
                        <span>Ver</span>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// CONSULTA 3: Cargar amigos del usuario actual
async function cargarAmigos() {
    const tbody = document.getElementById('amigos-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="2" class="loading-row">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Cargando amigos...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        const { data: amistades, error } = await supabase
            .from('amistades')
            .select(`
                id,
                usuario:usuarios!amistades_usuario_id_fkey (
                    id,
                    nombre,
                    apellidos,
                    email,
                    avatar_url
                ),
                amigo:usuarios!amistades_amigo_id_fkey (
                    id,
                    nombre,
                    apellidos,
                    email,
                    avatar_url
                )
            `)
            .or(`usuario_id.eq.${currentUserId},amigo_id.eq.${currentUserId}`)
            .eq('estado', 'aceptada');

        if (error) throw error;

        amigosData = amistades || [];
        mostrarAmigos(amigosData);

    } catch (error) {
        console.error('Error cargando amigos:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="error-row">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Error al cargar amigos</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Mostrar amigos en la tabla con etiqueta "(Tú)" para el usuario actual
function mostrarAmigos(amistades) {
    const tbody = document.getElementById('amigos-body');
    
    if (!amistades || amistades.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="empty-row">
                    <div class="empty-message">
                        <i class="fas fa-user-friends"></i>
                        <span>No tienes amigos aún</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = amistades.map(amistad => {
        const esUsuarioActual = amistad.usuario.id === currentUserId;
        const amigo = esUsuarioActual ? amistad.amigo : amistad.usuario;
        
        const nombreAmigo = amigo.nombre + (amigo.apellidos ? ' ' + amigo.apellidos : '');
        const avatarIniciales = amigo.nombre ? amigo.nombre.charAt(0).toUpperCase() : 'A';
        const nombreMostrar = nombreAmigo.length > 20 ? nombreAmigo.substring(0, 20) + '...' : nombreAmigo;
        const esAmigoElUsuarioActual = amigo.id === currentUserId;
        
        return `
        <tr class="${esAmigoElUsuarioActual ? 'current-user-row' : ''}">
            <td>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <!-- AVATAR (IZQUIERDA) -->
                    <div style="flex-shrink: 0;">
                        ${amigo.avatar_url ? 
                            `<img src="${amigo.avatar_url}" alt="${nombreAmigo}" 
                                 style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: ${esAmigoElUsuarioActual ? '3px solid #667eea' : '2px solid #e0e0e0'};">` :
                            `<div style="width: 45px; height: 45px; border-radius: 50%; 
                                      background: ${esAmigoElUsuarioActual ? 
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
                                      display: flex; align-items: center; justify-content: center; 
                                      color: white; font-weight: 600; font-size: 18px;
                                      border: ${esAmigoElUsuarioActual ? '3px solid #667eea' : '2px solid rgba(102, 126, 234, 0.3)'};">
                                ${avatarIniciales}
                            </div>`
                        }
                    </div>
                    
                    <!-- NOMBRE (DERECHA) -->
                    <div style="flex: 1;">
                        <span style="font-weight: 600; color: ${esAmigoElUsuarioActual ? '#667eea' : '#333'}; font-size: 15px;" 
                              title="${nombreAmigo}">
                            ${nombreMostrar} 
                            ${esAmigoElUsuarioActual ? 
                                '<span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 8px;">Tú</span>' 
                                : ''}
                        </span>
                    </div>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="verDetalleUsuario('${amigo.id}')">
                        <i class="fas fa-eye"></i>
                        <span>Ver</span>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// CONSULTA 4: Cargar ranking de mensajes
async function cargarMensajes() {
    const tbody = document.getElementById('mensajes-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="loading-row">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Cargando ranking de mensajes...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        const { data: usuarios, error: errorUsuarios } = await supabase
            .from('usuarios')
            .select(`
                id,
                nombre,
                apellidos,
                email,
                avatar_url
            `);

        if (errorUsuarios) throw errorUsuarios;

        const rankingUsuarios = [];
        
        for (const usuario of usuarios) {
            const { count: enviados, error: errorEnviados } = await supabase
                .from('mensajes')
                .select('*', { count: 'exact', head: true })
                .eq('remitente_id', usuario.id);

            const { count: recibidos, error: errorRecibidos } = await supabase
                .from('mensajes')
                .select('*', { count: 'exact', head: true })
                .eq('destinatario_email', usuario.email);

            if (!errorEnviados && !errorRecibidos) {
                const totalEnviados = enviados || 0;
                const totalRecibidos = recibidos || 0;
                const totalMensajes = totalEnviados + totalRecibidos;

                rankingUsuarios.push({
                    id: usuario.id,
                    nombre: usuario.nombre + (usuario.apellidos ? ' ' + usuario.apellidos : ''),
                    email: usuario.email,
                    avatar_url: usuario.avatar_url,
                    enviados: totalEnviados,
                    recibidos: totalRecibidos,
                    total: totalMensajes,
                    posicion: 0
                });
            }
        }

        rankingUsuarios.sort((a, b) => b.total - a.total);
        
        rankingUsuarios.forEach((usuario, index) => {
            usuario.posicion = index + 1;
            usuario.medalla = obtenerMedalla(index + 1);
        });

        mensajesData = rankingUsuarios;
        mostrarRankingMensajes(rankingUsuarios);

        document.getElementById('count-mensajes').textContent = rankingUsuarios.length;

    } catch (error) {
        console.error('Error cargando ranking de mensajes:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="error-row">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Error al cargar ranking de mensajes</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Función para determinar la medalla según la posición
function obtenerMedalla(posicion) {
    if (posicion === 1) return '🥇';
    if (posicion === 2) return '🥈';
    if (posicion === 3) return '🥉';
    if (posicion <= 10) return '⭐';
    if (posicion <= 50) return '🏆';
    return '📊';
}

// Mostrar ranking de mensajes en tabla con etiqueta "(Tú)" para el usuario actual
function mostrarRankingMensajes(ranking) {
    const tbody = document.getElementById('mensajes-body');
    
    if (!ranking || ranking.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    <div class="empty-message">
                        <i class="fas fa-trophy"></i>
                        <span>No hay datos de mensajes</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = ranking.map(usuario => {
        const avatarIniciales = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';
        const esUsuarioActual = usuario.id === currentUserId;
        const claseFila = esUsuarioActual ? 'current-user-row' : '';
        const nombreMostrar = usuario.nombre.length > 18 ? usuario.nombre.substring(0, 18) + '...' : usuario.nombre;
        
        return `
        <tr class="${claseFila}" data-id="${usuario.id}">
            <td>
                <div class="ranking-position">
                    <span class="position-number">#${usuario.posicion}</span>
                    <span class="position-medal">${usuario.medalla}</span>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <!-- AVATAR (IZQUIERDA) -->
                    <div style="flex-shrink: 0;">
                        ${usuario.avatar_url ? 
                            `<img src="${usuario.avatar_url}" alt="${usuario.nombre}" 
                                 style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: ${esUsuarioActual ? '3px solid #667eea' : '2px solid #e0e0e0'};">` :
                            `<div style="width: 45px; height: 45px; border-radius: 50%; 
                                      background: ${esUsuarioActual ? 
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
                                      display: flex; align-items: center; justify-content: center; 
                                      color: white; font-weight: 600; font-size: 18px;
                                      border: ${esUsuarioActual ? '3px solid #667eea' : '2px solid rgba(102, 126, 234, 0.3)'};">
                                ${avatarIniciales}
                            </div>`
                        }
                    </div>
                    
                    <!-- NOMBRE (DERECHA) -->
                    <div style="flex: 1;">
                        <span style="font-weight: 600; color: ${esUsuarioActual ? '#667eea' : '#333'}; font-size: 15px;" 
                              title="${usuario.nombre}">
                            ${nombreMostrar} 
                            ${esUsuarioActual ? 
                                '<span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; margin-left: 8px;">Tú</span>' 
                                : ''}
                        </span>
                    </div>
                </div>
            </td>
            <td style="text-align: center;">
                <span class="message-count enviados">${usuario.enviados}</span>
            </td>
            <td style="text-align: center;">
                <span class="message-count recibidos">${usuario.recibidos}</span>
            </td>
            <td style="text-align: center;">
                <span class="message-count total">${usuario.total}</span>
            </td>
        </tr>
        `;
    }).join('');
}

// Funciones de búsqueda
function buscarUsuarios(termino) {
    if (!termino.trim()) {
        mostrarUsuarios(usuariosData);
        return;
    }

    const terminoLower = termino.toLowerCase();
    const resultados = usuariosData.filter(usuario => {
        const nombre = (usuario.nombre + ' ' + (usuario.apellidos || '')).toLowerCase();
        const email = usuario.email.toLowerCase();
        return nombre.includes(terminoLower) || email.includes(terminoLower);
    });
    
    mostrarUsuarios(resultados);
}

function buscarAmigos(termino) {
    if (!termino.trim()) {
        mostrarAmigos(amigosData);
        return;
    }

    const terminoLower = termino.toLowerCase();
    const resultados = amigosData.filter(amistad => {
        const esUsuarioActual = amistad.usuario.id === currentUserId;
        const amigo = esUsuarioActual ? amistad.amigo : amistad.usuario;
        const nombre = (amigo.nombre + ' ' + (amigo.apellidos || '')).toLowerCase();
        const email = amigo.email.toLowerCase();
        return nombre.includes(terminoLower) || email.includes(terminoLower);
    });
    
    mostrarAmigos(resultados);
}

function buscarMensajes(termino) {
    if (!termino.trim()) {
        if (mensajesData && mensajesData.length > 0) {
            mostrarRankingMensajes(mensajesData);
        }
        return;
    }

    const terminoLower = termino.toLowerCase();
    const resultados = mensajesData.filter(usuario => {
        const nombre = usuario.nombre.toLowerCase();
        const email = usuario.email.toLowerCase();
        return nombre.includes(terminoLower) || email.includes(terminoLower);
    });
    
    mostrarRankingMensajes(resultados);
}

// FUNCIÓN AUXILIAR PARA OBTENER ESTADÍSTICAS DEL USUARIO
async function obtenerEstadisticasUsuario(usuarioId) {
    try {
        const estadisticas = {
            amigos: 0,
            grupos: 0,
            mensajes: 0
        };
        
        // Contar amigos
        const { count: amigosCount } = await supabase
            .from('amistades')
            .select('*', { count: 'exact', head: true })
            .or(`usuario_id.eq.${usuarioId},amigo_id.eq.${usuarioId}`)
            .eq('estado', 'aceptada');
        
        estadisticas.amigos = amigosCount || 0;
        
        // Contar grupos (si existe la tabla miembros_grupo)
        try {
            const { count: gruposCount } = await supabase
                .from('miembros_grupo')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', usuarioId);
            
            estadisticas.grupos = gruposCount || 0;
        } catch (e) {
            console.log("Tabla miembros_grupo no disponible");
        }
        
        // Contar mensajes enviados
        const { count: mensajesCount } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .eq('remitente_id', usuarioId);
        
        estadisticas.mensajes = mensajesCount || 0;
        
        return estadisticas;
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return { amigos: 0, grupos: 0, mensajes: 0 };
    }
}

// Función para obtener edad aproximada
function obtenerEdadAproximada(fechaNacimiento) {
    try {
        const nacimiento = new Date(fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        
        if (edad < 18) return 'Menor de 18';
        if (edad < 25) return '18-24 años';
        if (edad < 35) return '25-34 años';
        if (edad < 50) return '35-49 años';
        return '50+ años';
    } catch (e) {
        return null;
    }
}

// Función para enviar mensaje al usuario
function enviarMensajeUsuario(email, nombre) {
    document.getElementById('detail-modal').style.display = 'none';
    alert(`📨 Redirigiendo para enviar mensaje a ${nombre || 'el usuario'} (${email})`);
}

// Función para ver detalles del usuario usando SweetAlert2
async function verDetalleUsuario(usuarioId) {
    try {
        // Mostrar loader mientras se cargan los datos - TEXTO CORREGIDO
        Swal.fire({
            title: 'Cargando perfil...',
            html: `
                <div style="text-align: center; padding: 30px 20px;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; margin: 0 auto 15px;">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p style="color: #888;">Obteniendo información del usuario...</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        
        // 1. Obtener datos básicos del usuario
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select(`
                *,
                usuario_rangos (
                    rangos (
                        nombre,
                        puntos_minimos,
                        descripcion
                    )
                )
            `)
            .eq('id', usuarioId)
            .single();
        
        if (error) throw error;
        
        // 2. Obtener redes sociales del usuario
        let redes = [];
        try {
            const { data: redesData } = await supabase
                .from('redes_sociales')
                .select('id, plataforma, url, activa')
                .eq('usuario_id', usuarioId)
                .eq('activa', true);
            redes = redesData || [];
        } catch (errorRedes) {
            console.error("Error al cargar redes:", errorRedes);
        }
        
        // 3. Obtener estadísticas del usuario
        const estadisticas = await obtenerEstadisticasUsuario(usuarioId);
        
        // 4. Renderizar el perfil completo
        const contenidoHTML = renderizarPerfilCompletoDetalle(usuario, redes, estadisticas);
        
        // 5. Mostrar el modal de SweetAlert2 con SCROLL
        Swal.fire({
            title: `👤 Perfil de ${usuario.nombre || ''} ${usuario.apellidos || ''}`,
            html: contenidoHTML,
            width: 850, // Ancho fijo
            padding: '0',
            showCloseButton: true,
            showConfirmButton: false,
            backdrop: true,
            allowOutsideClick: true,
            customClass: {
                popup: 'swal2-popup-custom',
                container: 'swal2-container-custom'
            },
            // Configuración para que el scroll funcione
            heightAuto: false,
            grow: 'fullscreen', // Esto permite que crezca
            scrollbarPadding: false
        });
        
        // Asegurarnos de que el scroll esté visible
        setTimeout(() => {
            const swalPopup = document.querySelector('.swal2-popup');
            if (swalPopup) {
                swalPopup.style.maxHeight = '85vh';
                swalPopup.style.overflow = 'hidden';
                
                const swalHtmlContainer = swalPopup.querySelector('.swal2-html-container');
                if (swalHtmlContainer) {
                    swalHtmlContainer.style.maxHeight = '65vh';
                    swalHtmlContainer.style.overflowY = 'auto';
                    swalHtmlContainer.style.overflowX = 'hidden';
                    swalHtmlContainer.style.padding = '0 10px 20px 0';
                    swalHtmlContainer.style.marginRight = '-10px';
                    
                    // Agregar estilos de scrollbar
                    const style = document.createElement('style');
                    style.textContent = `
                        .swal2-html-container::-webkit-scrollbar {
                            width: 8px;
                        }
                        .swal2-html-container::-webkit-scrollbar-track {
                            background: #f1f1f1;
                            border-radius: 4px;
                        }
                        .swal2-html-container::-webkit-scrollbar-thumb {
                            background: #c1c1c1;
                            border-radius: 4px;
                        }
                        .swal2-html-container::-webkit-scrollbar-thumb:hover {
                            background: #a1a1a1;
                        }
                        .swal2-html-container {
                            scrollbar-width: thin;
                            scrollbar-color: #c1c1c1 #f1f1f1;
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        }, 100);
        
    } catch (error) {
        console.error('Error cargando detalles del usuario:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar',
            text: 'No se pudieron cargar los datos del usuario',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#667eea'
        });
    }
}

// Función para renderizar el perfil completo en detalle
function renderizarPerfilCompletoDetalle(usuario, redes, estadisticas) {
    // Información del rango
    const rango = usuario.usuario_rangos?.[0]?.rangos?.nombre || 'Sin rango';
    const puntosMinimos = usuario.usuario_rangos?.[0]?.rangos?.puntos_minimos || 0;
    const descripcionRango = usuario.usuario_rangos?.[0]?.rangos?.descripcion || '';
    
    // Avatar o iniciales
    const avatarHtml = usuario.avatar_url 
        ? `<img src="${usuario.avatar_url}" alt="${usuario.nombre}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
        : `<span style="color: white; font-size: 32px; font-weight: bold;">${usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}</span>`;
    
    // Formatear fechas
    const fechaNacimiento = usuario.fecha_nacimiento 
        ? obtenerEdadAproximada(usuario.fecha_nacimiento)
        : null;
    
    const fechaRegistro = usuario.created_at 
        ? new Date(usuario.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
        : null;
    
    // Determinar si mostrar país
    const mostrarPais = usuario.mostrar_ubicacion !== false && usuario.pais;
    
    return `
        <div class="perfil-completo" style="padding: 20px 15px 0 15px;">
            <style>
                /* Tarjetas con bordes suaves */
                .info-section {
                    background: white;
                    border-radius: 12px;
                    border: 2px solid #e9ecef;
                    margin-bottom: 20px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
                }
                
                /* Header de sección */
                .section-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 18px 25px;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                /* Contenido de sección */
                .section-content {
                    padding: 25px;
                }
                
                /* Fila con 2 columnas */
                .info-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                
                .info-row:last-child {
                    margin-bottom: 0;
                }
                
                /* Grupo de información */
                .info-group {
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 20px;
                    border: 1px solid #e9ecef;
                    height: 100%;
                }
                
                /* Título de grupo */
                .group-title {
                    color: #667eea;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid rgba(102, 126, 234, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                /* Items de información verticales */
                .info-item-vertical {
                    margin-bottom: 15px;
                }
                
                .info-item-vertical:last-child {
                    margin-bottom: 0;
                }
                
                .info-label-vertical {
                    color: #666;
                    font-size: 13px;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .info-value-vertical {
                    color: #333;
                    font-weight: 600;
                    font-size: 15px;
                    padding-left: 26px;
                }
                
                /* Iconos de redes sociales - SIN LÍNEA AZUL EN MITAD */
                .social-icon-container {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                .social-icon-container:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                }
                
                /* Grid de redes */
                .socials-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
                    gap: 15px;
                    margin-top: 15px;
                }
                
                /* Botones */
                .action-button {
                    padding: 14px 24px;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    margin-top: 20px;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }
                
                .btn-secondary {
                    background: white;
                    color: #666;
                    border: 2px solid #e0e0e0;
                }
                
                .btn-secondary:hover {
                    background: #f8f9fa;
                    border-color: #667eea;
                    color: #667eea;
                }
            </style>
            
            <!-- HEADER DEL PERFIL -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; margin-bottom: 25px;">
                <div style="display: flex; align-items: center;">
                    <div style="width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 25px; flex-shrink: 0; border: 4px solid rgba(255,255,255,0.3);">
                        ${avatarHtml}
                    </div>
                    <div style="flex: 1;">
                        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${usuario.nombre || ''} ${usuario.apellidos || ''}</h1>
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                            <i class="fas fa-envelope" style="margin-right: 10px; opacity: 0.9;"></i>
                            <span style="opacity: 0.9;">${usuario.email}</span>
                        </div>
                        <div style="display: flex; gap: 30px;">
                            <div style="text-align: center;">
                                <div style="font-size: 22px; font-weight: bold;">${estadisticas.amigos}</div>
                                <div style="font-size: 13px; opacity: 0.9;">Amigos</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 22px; font-weight: bold;">${estadisticas.grupos}</div>
                                <div style="font-size: 13px; opacity: 0.9;">Grupos</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 22px; font-weight: bold;">${estadisticas.mensajes}</div>
                                <div style="font-size: 13px; opacity: 0.9;">Mensajes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- SECCIÓN DE INFORMACIÓN PRINCIPAL -->
            <div class="info-section">
                <div class="section-header">
                    <i class="fas fa-info-circle"></i>
                    INFORMACIÓN DEL USUARIO
                </div>
                
                <div class="section-content">
                    <!-- PRIMERA FILA -->
                    <div class="info-row">
                        <!-- GRUPO 1: RANGO -->
                        <div class="info-group">
                            <div class="group-title">
                                <i class="fas fa-medal"></i>
                                RANGO
                            </div>
                            
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="fas fa-crown"></i>
                                    <span>Rango actual</span>
                                </div>
                                <div class="info-value-vertical" style="color: #667eea; font-weight: 700;">${rango}</div>
                            </div>
                            
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="fas fa-star"></i>
                                    <span>Puntos mínimos</span>
                                </div>
                                <div class="info-value-vertical">${puntosMinimos} pts</div>
                            </div>
                            
                            ${descripcionRango ? `
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="fas fa-align-left"></i>
                                    <span>Descripción</span>
                                </div>
                                <div class="info-value-vertical" style="font-size: 14px; color: #666; font-weight: normal; font-style: italic;">
                                    "${descripcionRango}"
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- GRUPO 2: CUENTA -->
                        <div class="info-group">
                            <div class="group-title">
                                <i class="fas fa-user-check"></i>
                                CUENTA
                            </div>
                            
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="fas fa-circle" style="color: ${usuario.mostrar_en_linea ? '#4CAF50' : '#9e9e9e'};"></i>
                                    <span>Estado</span>
                                </div>
                                <div class="info-value-vertical" style="color: ${usuario.mostrar_en_linea ? '#4CAF50' : '#666'};">
                                    ${usuario.mostrar_en_linea ? 'En línea' : 'Desconectado'}
                                </div>
                            </div>
                            
                            ${usuario.verificado ? `
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                                    <span>Verificado</span>
                                </div>
                                <div class="info-value-vertical" style="color: #4CAF50; font-weight: 700;">Sí</div>
                            </div>
                            ` : ''}
                            
                            ${fechaRegistro ? `
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="far fa-calendar-alt"></i>
                                    <span>Miembro desde</span>
                                </div>
                                <div class="info-value-vertical">${fechaRegistro}</div>
                            </div>
                            ` : ''}
                            
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>Privacidad</span>
                                </div>
                                <div class="info-value-vertical">${usuario.privacidad || 'Estándar'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SEGUNDA FILA -->
                    <div class="info-row">
                        <!-- GRUPO 3: INFORMACIÓN PERSONAL -->
                        <div class="info-group">
                            <div class="group-title">
                                <i class="fas fa-user-circle"></i>
                                INFORMACIÓN PERSONAL
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <!-- Columna izquierda -->
                                <div>
                                    ${renderizarInfoItemVertical('fas fa-venus-mars', 'Género', usuario.genero)}
                                    ${mostrarPais ? renderizarInfoItemVertical('fas fa-globe-americas', 'País', usuario.pais) : ''}
                                    ${fechaNacimiento ? renderizarInfoItemVertical('fas fa-birthday-cake', 'Edad', fechaNacimiento) : ''}
                                </div>
                                
                                <!-- Columna derecha -->
                                <div>
                                    ${renderizarInfoItemVertical('fas fa-user-tag', 'Tipo de cuenta', usuario.tipo_cuenta)}
                                    ${renderizarInfoItemVertical('fas fa-language', 'Idioma', usuario.idioma || 'Español')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- GRUPO 4: ESTADÍSTICAS -->
                        <div class="info-group">
                            <div class="group-title">
                                <i class="fas fa-chart-bar"></i>
                                ACTIVIDAD
                            </div>
                            
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="fas fa-user-friends"></i>
                                    <span>Amigos</span>
                                </div>
                                <div class="info-value-vertical">${estadisticas.amigos}</div>
                            </div>
                            
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="fas fa-users"></i>
                                    <span>Grupos</span>
                                </div>
                                <div class="info-value-vertical">${estadisticas.grupos}</div>
                            </div>
                            
                            <div class="info-item-vertical">
                                <div class="info-label-vertical">
                                    <i class="fas fa-comments"></i>
                                    <span>Mensajes enviados</span>
                                </div>
                                <div class="info-value-vertical">${estadisticas.mensajes}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- REDES SOCIALES -->
            ${redes && redes.length > 0 ? `
            <div class="info-section">
                <div class="section-header">
                    <i class="fas fa-share-alt"></i>
                    REDES SOCIALES
                </div>
                
                <div class="section-content">
                    <div class="socials-grid">
                        ${redes.map(red => renderizarIconoRedSocialSimple(red)).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- BIOGRAFÍA -->
            ${usuario.biografia ? `
            <div class="info-section">
                <div class="section-header">
                    <i class="fas fa-book-open"></i>
                    BIOGRAFÍA
                </div>
                
                <div class="section-content">
                    <div style="color: #555; line-height: 1.6; font-size: 15px; white-space: pre-line; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
                        ${usuario.biografia}
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- BOTONES DE ACCIÓN - AL FINAL DEL SCROLL -->
            <div style="display: flex; gap: 15px; margin: 25px 0 15px 0;">
                <button onclick="enviarMensajeUsuarioSweetAlert('${usuario.email}', '${usuario.nombre || ''}')" 
                        class="action-button btn-primary">
                    <i class="fas fa-paper-plane"></i>
                    <span>Enviar Mensaje</span>
                </button>
                
                <button onclick="Swal.close()" 
                        class="action-button btn-secondary">
                    <i class="fas fa-times"></i>
                    <span>Cerrar</span>
                </button>
            </div>
        </div>
    `;
}

// Función para renderizar item de información vertical
function renderizarInfoItemVertical(icono, label, valor) {
    if (!valor) return '';
    return `
        <div class="info-item-vertical">
            <div class="info-label-vertical">
                <i class="${icono}"></i>
                <span>${label}</span>
            </div>
            <div class="info-value-vertical">${valor}</div>
        </div>
    `;
}

// Función auxiliar para renderizar iconos de redes sociales - CORREGIDO SIN LÍNEA AZUL
function renderizarIconoRedSocialSimple(red) {
    const plataformas = {
        'facebook': { icon: 'fab fa-facebook-f', color: '#1877F2' },
        'twitter': { icon: 'fab fa-twitter', color: '#1DA1F2' },
        'instagram': { icon: 'fab fa-instagram', color: '#E4405F' },
        'linkedin': { icon: 'fab fa-linkedin-in', color: '#0A66C2' },
        'youtube': { icon: 'fab fa-youtube', color: '#FF0000' },
        'tiktok': { icon: 'fab fa-tiktok', color: '#000000' },
        'whatsapp': { icon: 'fab fa-whatsapp', color: '#25D366' },
        'telegram': { icon: 'fab fa-telegram', color: '#0088CC' },
        'discord': { icon: 'fab fa-discord', color: '#5865F2' },
        'spotify': { icon: 'fab fa-spotify', color: '#1DB954' },
        'github': { icon: 'fab fa-github', color: '#181717' },
        'twitch': { icon: 'fab fa-twitch', color: '#9146FF' }
    };
    
    const plataforma = red.plataforma.toLowerCase();
    const config = plataformas[plataforma] || { icon: 'fas fa-share-alt', color: '#667eea' };
    
    // CAMBIO IMPORTANTE: Usar un solo color sólido en lugar del gradiente con línea azul
    return `
        <a href="${red.url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
            <div class="social-icon-container" style="background: ${config.color};">
                <i class="${config.icon}"></i>
            </div>
        </a>
    `;
}

// Función para enviar mensaje (compatible con SweetAlert2)
function enviarMensajeUsuarioSweetAlert(email, nombre) {
    Swal.close();
    Swal.fire({
        title: `Enviar mensaje a ${nombre || 'el usuario'}`,
        html: `
            <div style="text-align: left; padding: 20px 0;">
                <p>Redirigiendo para enviar mensaje a:</p>
                <p style="font-weight: bold; color: #667eea;">${email}</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#667eea'
    });
}