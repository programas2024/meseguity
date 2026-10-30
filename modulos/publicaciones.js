


// ======================
// MÓDULO DE PUBLICACIONES PARA PRINCIPAL.HTML
// ======================

window.PublicacionesPrincipal = (function() {
    let paginaActual = 1;
    let totalPaginas = 1;
    const porPagina = 10;
    let filtrosActuales = {
        tipo: 'todas',
        orden: 'recientes',
        busqueda: ''
    };
    let publicacionesCargadas = false;

    // ======================
    // FUNCIONES PÚBLICAS
    // ======================

    async function inicializar() {
        console.log("📰 Inicializando publicaciones en principal.html...");
        
        try {
            // Configurar eventos
            configurarEventos();
            
            // Cargar estadísticas
            await cargarEstadisticas();
            
            // Cargar publicaciones si es la primera vez
            if (!publicacionesCargadas) {
                await cargarPublicaciones();
            }
            
            console.log("✅ Publicaciones inicializadas en principal.html");
            return true;
        } catch (error) {
            console.error("❌ Error inicializando publicaciones:", error);
            return false;
        }
    }

    function configurarEventos() {
        // Configurar clic en botón de publicaciones
        const btnPublicaciones = document.getElementById('btnPublicaciones');
        if (btnPublicaciones) {
            btnPublicaciones.addEventListener('click', function() {
                mostrarSeccionPublicaciones();
            });
        }
        
        // Configurar botón de refrescar
        const btnRefresh = document.getElementById('btnRefreshPublicaciones');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', function() {
                recargarPublicaciones();
            });
        }
        
        // Configurar botón de crear publicación
        const btnCrear = document.getElementById('btnCrearPublicacion');
        if (btnCrear) {
            btnCrear.addEventListener('click', function() {
                window.location.href = 'configuracion.html#publicaciones';
            });
        }
        
        // Configurar búsqueda
        const inputBusqueda = document.getElementById('buscarPublicaciones');
        const btnBuscar = document.getElementById('btnBuscarPublicaciones');
        
        if (inputBusqueda) {
            let timeoutBusqueda;
            inputBusqueda.addEventListener('input', function() {
                clearTimeout(timeoutBusqueda);
                timeoutBusqueda = setTimeout(() => {
                    filtrarPublicaciones();
                }, 500);
            });
            
            inputBusqueda.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    filtrarPublicaciones();
                }
            });
        }
        
        if (btnBuscar) {
            btnBuscar.addEventListener('click', filtrarPublicaciones);
        }
        
        // Configurar filtros
        const filtroTipo = document.getElementById('filtroTipoPublicacion');
        const filtroOrden = document.getElementById('filtroOrdenPublicacion');
        
        if (filtroTipo) {
            filtroTipo.addEventListener('change', filtrarPublicaciones);
        }
        
        if (filtroOrden) {
            filtroOrden.addEventListener('change', filtrarPublicaciones);
        }
        
        // Configurar paginación
        const btnPaginaAnterior = document.getElementById('btnPaginaAnterior');
        const btnPaginaSiguiente = document.getElementById('btnPaginaSiguiente');
        
        if (btnPaginaAnterior) {
            btnPaginaAnterior.addEventListener('click', function() {
                cambiarPagina(paginaActual - 1);
            });
        }
        
        if (btnPaginaSiguiente) {
            btnPaginaSiguiente.addEventListener('click', function() {
                cambiarPagina(paginaActual + 1);
            });
        }
        
        // Botón crear primera publicación
        const btnPrimeraPublicacion = document.getElementById('btnCrearPrimeraPublicacion');
        if (btnPrimeraPublicacion) {
            btnPrimeraPublicacion.addEventListener('click', function() {
                window.location.href = 'configuracion.html#publicaciones';
            });
        }
    }

    async function mostrarSeccionPublicaciones() {
        try {
            // Cambiar a sección de publicaciones
            if (window.Interfaz && window.Interfaz.mostrarSeccion) {
                window.Interfaz.mostrarSeccion('seccionPublicaciones');
            }
            
            // Cargar publicaciones si no están cargadas
            if (!publicacionesCargadas) {
                await cargarPublicaciones();
            }
        } catch (error) {
            console.error("Error mostrando sección publicaciones:", error);
        }
    }

    async function cargarPublicaciones() {
        try {
            mostrarCargando(true);
            ocultarSinResultados();
            
            // Construir consulta
            let query = supabaseClient
                .from('publicaciones')
                .select('*, usuario:usuarios(nombre, apellidos, avatar_url, email, pais, ciudad)', { count: 'exact' })
                .eq('visibilidad', 'publico');
            
            // Aplicar filtros
            if (filtrosActuales.tipo !== 'todas') {
                query = query.eq('tipo', filtrosActuales.tipo);
            }
            
            if (filtrosActuales.busqueda.trim() !== '') {
                const searchTerm = `%${filtrosActuales.busqueda}%`;
                query = query.or(`contenido.ilike.${searchTerm}, usuario.nombre.ilike.${searchTerm}`);
            }
            
            // Ordenar
            if (filtrosActuales.orden === 'recientes') {
                query = query.order('fecha_creacion', { ascending: false });
            } else if (filtrosActuales.orden === 'populares') {
                query = query.order('likes_count', { ascending: false });
            } else if (filtrosActuales.orden === 'antiguas') {
                query = query.order('fecha_creacion', { ascending: true });
            }
            
            // Paginación
            const desde = (paginaActual - 1) * porPagina;
            const hasta = desde + porPagina - 1;
            query = query.range(desde, hasta);
            
            // Ejecutar consulta
            const { data: publicaciones, error, count } = await query;
            
            if (error) throw error;
            
            // Actualizar paginación
            totalPaginas = Math.ceil((count || 0) / porPagina);
            actualizarPaginacion();
            
            // Mostrar resultados
            if (!publicaciones || publicaciones.length === 0) {
                mostrarSinResultados();
                return;
            }
            
            // Renderizar publicaciones
            await renderizarPublicaciones(publicaciones);
            
            // Actualizar estado
            publicacionesCargadas = true;
            
        } catch (error) {
            console.error("Error cargando publicaciones:", error);
            mostrarError();
        } finally {
            mostrarCargando(false);
        }
    }

    async function renderizarPublicaciones(publicaciones) {
        const feedElement = document.getElementById('feedPublicaciones');
        if (!feedElement) return;
        
        feedElement.innerHTML = '';
        
        for (const publicacion of publicaciones) {
            const publicacionElement = await crearElementoPublicacion(publicacion);
            if (publicacionElement) {
                feedElement.appendChild(publicacionElement);
            }
        }
    }

    async function crearElementoPublicacion(publicacion) {
        try {
            const usuario = publicacion.usuario || {};
            const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() || 
                                  (usuario.email ? usuario.email.split('@')[0] : 'Usuario Messery');
            
            const tiempoTranscurrido = calcularTiempoTranscurrido(publicacion.fecha_creacion);
            
            // Crear elemento
            const div = document.createElement('div');
            div.className = 'publicacion-item';
            div.dataset.id = publicacion.id;
            
            let contenidoHTML = `
                <div class="publicacion-header">
                    <div class="publicacion-avatar" onclick="mostrarPerfilPublicaciones('${publicacion.usuario_id}', '${nombreCompleto}')">
            `;
            
            // Avatar
            if (usuario.avatar_url) {
                contenidoHTML += `
                    <img src="${usuario.avatar_url}" 
                         alt="${nombreCompleto}"
                         onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user-circle\\'></i>';">
                `;
            } else {
                contenidoHTML += `
                    <i class="fas fa-user-circle"></i>
                `;
            }
            
            contenidoHTML += `
                    </div>
                    <div class="publicacion-info">
                        <h4 class="publicacion-autor" onclick="mostrarPerfilPublicaciones('${publicacion.usuario_id}', '${nombreCompleto}')">
                            ${nombreCompleto}
                        </h4>
                        <div class="publicacion-fecha">
                            <i class="far fa-clock"></i>
                            <span>${tiempoTranscurrido}</span>
                            <i class="fas fa-globe-americas"></i>
                            <span>Pública</span>
                        </div>
                    </div>
                </div>
                
                <div class="publicacion-contenido">
            `;
            
            // Contenido de texto
            if (publicacion.contenido) {
                contenidoHTML += `
                    <div class="publicacion-texto">${publicacion.contenido}</div>
                `;
            }
            
            // Media según tipo
            if (publicacion.url_media) {
                switch(publicacion.tipo) {
                    case 'imagen':
                        contenidoHTML += `
                            <div class="publicacion-media">
                                <img src="${publicacion.url_media}" 
                                     alt="Imagen publicada"
                                     onclick="ampliarImagenPublicacion('${publicacion.url_media}')">
                            </div>
                        `;
                        break;
                        
                    case 'video':
                        if (publicacion.url_media.includes('youtube.com') || publicacion.url_media.includes('youtu.be')) {
                            const videoId = extraerIdYouTube(publicacion.url_media);
                            if (videoId) {
                                contenidoHTML += `
                                    <div class="publicacion-media">
                                        <iframe 
                                            width="100%" 
                                            height="315" 
                                            src="https://www.youtube.com/embed/${videoId}?rel=0" 
                                            frameborder="0" 
                                            allowfullscreen>
                                        </iframe>
                                    </div>
                                `;
                            }
                        } else {
                            contenidoHTML += `
                                <div class="publicacion-media">
                                    <video width="100%" controls>
                                        <source src="${publicacion.url_media}" type="video/mp4">
                                        Tu navegador no soporta el video.
                                    </video>
                                </div>
                            `;
                        }
                        break;
                        
                    case 'enlace':
                        let dominio = 'Enlace compartido';
                        try {
                            const urlObj = new URL(publicacion.url_media);
                            dominio = urlObj.hostname.replace('www.', '');
                        } catch (e) {}
                        
                        contenidoHTML += `
                            <a href="${publicacion.url_media}" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               class="publicacion-enlace">
                                <i class="fas fa-external-link-alt"></i>
                                <div>
                                    <strong>Enlace compartido</strong><br>
                                    <small>${dominio}</small>
                                </div>
                            </a>
                        `;
                        break;
                }
            }
            
            // Stats y acciones
            const usuarioActual = await obtenerUsuarioActual();
            const yaDioLike = usuarioActual ? await verificarLike(publicacion.id, usuarioActual.id) : false;
            
            contenidoHTML += `
                </div>
                
                <div class="publicacion-stats">
                    <div class="stat-item ${yaDioLike ? 'active' : ''}" onclick="darLikePrincipal('${publicacion.id}', this)">
                        <i class="fas fa-heart"></i>
                        <span>${publicacion.likes_count || 0}</span>
                    </div>
                    <div class="stat-item" onclick="verComentariosPrincipal('${publicacion.id}')">
                        <i class="fas fa-comment"></i>
                        <span>${publicacion.comentarios_count || 0}</span>
                    </div>
                    <div class="stat-item" onclick="compartirPublicacionPrincipal('${publicacion.id}', '${nombreCompleto.replace(/'/g, "\\'")}')">
                        <i class="fas fa-share-alt"></i>
                        <span>Compartir</span>
                    </div>
                </div>
            `;
            
            div.innerHTML = contenidoHTML;
            return div;
            
        } catch (error) {
            console.error("Error creando elemento:", error);
            return null;
        }
    }

    async function cargarEstadisticas() {
        try {
            // Obtener total de publicaciones
            const { count: totalPublicaciones } = await supabaseClient
                .from('publicaciones')
                .select('*', { count: 'exact', head: true })
                .eq('visibilidad', 'publico');
            
            // Obtener usuarios únicos que publicaron
            const { data: usuariosPublicando } = await supabaseClient
                .from('publicaciones')
                .select('usuario_id')
                .eq('visibilidad', 'publico');
            
            const usuariosUnicos = new Set(usuariosPublicando?.map(p => p.usuario_id) || []);
            
            // Obtener total de likes y comentarios
            const { data: stats } = await supabaseClient
                .from('publicaciones')
                .select('likes_count, comentarios_count')
                .eq('visibilidad', 'publico');
            
            let totalLikes = 0;
            let totalComentarios = 0;
            
            if (stats) {
                totalLikes = stats.reduce((sum, p) => sum + (p.likes_count || 0), 0);
                totalComentarios = stats.reduce((sum, p) => sum + (p.comentarios_count || 0), 0);
            }
            
            // Actualizar UI
            document.getElementById('totalPublicaciones').textContent = totalPublicaciones || 0;
            document.getElementById('usuariosPublicando').textContent = usuariosUnicos.size;
            document.getElementById('totalLikes').textContent = totalLikes;
            document.getElementById('totalComentarios').textContent = totalComentarios;
            
        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        }
    }

    function filtrarPublicaciones() {
        const inputBusqueda = document.getElementById('buscarPublicaciones');
        const filtroTipo = document.getElementById('filtroTipoPublicacion');
        const filtroOrden = document.getElementById('filtroOrdenPublicacion');
        
        if (inputBusqueda) filtrosActuales.busqueda = inputBusqueda.value.trim();
        if (filtroTipo) filtrosActuales.tipo = filtroTipo.value;
        if (filtroOrden) filtrosActuales.orden = filtroOrden.value;
        
        paginaActual = 1;
        cargarPublicaciones();
    }

    function recargarPublicaciones() {
        paginaActual = 1;
        cargarPublicaciones();
        cargarEstadisticas();
    }

    function cambiarPagina(nuevaPagina) {
        if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
            return;
        }
        
        paginaActual = nuevaPagina;
        cargarPublicaciones();
    }

    function actualizarPaginacion() {
        const paginacionElement = document.getElementById('paginacionPublicaciones');
        const btnAnterior = document.getElementById('btnPaginaAnterior');
        const btnSiguiente = document.getElementById('btnPaginaSiguiente');
        const infoPagina = document.getElementById('infoPagina');
        
        if (!paginacionElement) return;
        
        // Mostrar/ocultar paginación
        if (totalPaginas <= 1) {
            paginacionElement.style.display = 'none';
            return;
        }
        
        paginacionElement.style.display = 'flex';
        
        // Actualizar botones
        if (btnAnterior) {
            btnAnterior.disabled = paginaActual <= 1;
        }
        
        if (btnSiguiente) {
            btnSiguiente.disabled = paginaActual >= totalPaginas;
        }
        
        // Actualizar información
        if (infoPagina) {
            infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
        }
    }

    // ======================
    // FUNCIONES DE UTILIDAD
    // ======================

    function mostrarCargando(mostrar) {
        const feedElement = document.getElementById('feedPublicaciones');
        const cargandoElement = document.getElementById('cargandoPublicaciones');
        
        if (mostrar) {
            if (feedElement) feedElement.style.display = 'none';
            if (cargandoElement) {
                cargandoElement.style.display = 'block';
                cargandoElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando publicaciones...';
            }
        } else {
            if (feedElement) feedElement.style.display = 'flex';
            if (cargandoElement) cargandoElement.style.display = 'none';
        }
    }

    function mostrarSinResultados() {
        const feedElement = document.getElementById('feedPublicaciones');
        const sinResultadosElement = document.getElementById('sinResultadosPublicaciones');
        const paginacionElement = document.getElementById('paginacionPublicaciones');
        
        if (feedElement) feedElement.innerHTML = '';
        if (sinResultadosElement) sinResultadosElement.style.display = 'block';
        if (paginacionElement) paginacionElement.style.display = 'none';
    }

    function ocultarSinResultados() {
        const sinResultadosElement = document.getElementById('sinResultadosPublicaciones');
        if (sinResultadosElement) {
            sinResultadosElement.style.display = 'none';
        }
    }

    function mostrarError() {
        const feedElement = document.getElementById('feedPublicaciones');
        if (feedElement) {
            feedElement.innerHTML = `
                <div class="sin-resultados">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h3>Error al cargar publicaciones</h3>
                    <p>Intenta recargar la página</p>
                    <button class="btn-primary" onclick="PublicacionesPrincipal.recargarPublicaciones()" style="margin-top: 20px;">
                        <i class="fas fa-redo"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    async function obtenerUsuarioActual() {
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            return user;
        } catch (error) {
            return null;
        }
    }

    async function verificarLike(publicacionId, usuarioId) {
        try {
            const { data } = await supabaseClient
                .from('likes')
                .select('id')
                .eq('publicacion_id', publicacionId)
                .eq('usuario_id', usuarioId)
                .maybeSingle();
            
            return !!data;
        } catch (error) {
            return false;
        }
    }

    function calcularTiempoTranscurrido(fecha) {
        const ahora = new Date();
        const fechaPublicacion = new Date(fecha);
        const diferencia = Math.floor((ahora - fechaPublicacion) / 1000);
        
        if (diferencia < 60) return 'Hace unos segundos';
        if (diferencia < 3600) {
            const minutos = Math.floor(diferencia / 60);
            return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
        }
        if (diferencia < 86400) {
            const horas = Math.floor(diferencia / 3600);
            return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        }
        if (diferencia < 604800) {
            const dias = Math.floor(diferencia / 86400);
            return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
        }
        
        return fechaPublicacion.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function extraerIdYouTube(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // ======================
    // EXPORTAR FUNCIONES
    // ======================

    return {
        inicializar,
        mostrarSeccionPublicaciones,
        cargarPublicaciones,
        recargarPublicaciones,
        cambiarPagina,
        getFiltrosActuales: () => ({ ...filtrosActuales }),
        getPaginacion: () => ({ paginaActual, totalPaginas })
    };
})();

// ======================
// FUNCIONES GLOBALES PARA INTERACCIÓN
// ======================

function mostrarPerfilPublicaciones(usuarioId, nombre) {
    if (typeof mostrarPerfilCompleto === 'function') {
        mostrarPerfilCompleto(usuarioId);
    } else {
        Swal.fire({
            title: `Perfil de ${nombre}`,
            html: `<p>Redirigiendo al perfil completo...</p>`,
            icon: 'info',
            timer: 1500,
            showConfirmButton: false
        });
        
        setTimeout(() => {
            window.open(`perfil.html?id=${usuarioId}`, '_blank');
        }, 1500);
    }
}

function ampliarImagenPublicacion(url) {
    Swal.fire({
        imageUrl: url,
        imageAlt: 'Imagen de la publicación',
        showCloseButton: true,
        showConfirmButton: false,
        width: '90%',
        imageWidth: '100%',
        imageHeight: 'auto'
    });
}

async function darLikePrincipal(publicacionId, element) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            Swal.fire({
                icon: 'info',
                title: 'Inicia sesión',
                text: 'Debes iniciar sesión para dar like',
                confirmButtonText: 'Iniciar sesión'
            });
            return;
        }
        
        // Verificar si ya dio like
        const { data: likeExistente } = await supabaseClient
            .from('likes')
            .select('id')
            .eq('publicacion_id', publicacionId)
            .eq('usuario_id', user.id)
            .maybeSingle();
        
        if (likeExistente) {
            // Quitar like
            await supabaseClient
                .from('likes')
                .delete()
                .eq('id', likeExistente.id);
            
            await supabaseClient.rpc('decrement_likes', { publicacion_id: publicacionId });
            
            // Actualizar UI
            const span = element.querySelector('span');
            const likesActuales = parseInt(span.textContent) || 0;
            span.textContent = likesActuales - 1;
            element.classList.remove('active');
            
        } else {
            // Dar like
            await supabaseClient
                .from('likes')
                .insert({
                    publicacion_id: publicacionId,
                    usuario_id: user.id
                });
            
            await supabaseClient.rpc('increment_likes', { publicacion_id: publicacionId });
            
            // Actualizar UI
            const span = element.querySelector('span');
            const likesActuales = parseInt(span.textContent) || 0;
            span.textContent = likesActuales + 1;
            element.classList.add('active');
        }
        
    } catch (error) {
        console.error("Error dando like:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo dar like a la publicación'
        });
    }
}

function verComentariosPrincipal(publicacionId) {
    Swal.fire({
        title: 'Comentarios',
        html: `<div id="comentariosContainer"></div>`,
        showCloseButton: true,
        showConfirmButton: false,
        width: 600,
        didOpen: () => {
            cargarComentariosPrincipal(publicacionId);
        }
    });
}

async function cargarComentariosPrincipal(publicacionId) {
    try {
        const { data: comentarios, error } = await supabaseClient
            .from('comentarios')
            .select('*, usuario:usuarios(nombre, apellidos, avatar_url)')
            .eq('publicacion_id', publicacionId)
            .order('fecha_creacion', { ascending: true });
        
        if (error) throw error;
        
        const container = document.getElementById('comentariosContainer');
        if (!container) return;
        
        let comentariosHTML = '<div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">';
        
        if (!comentarios || comentarios.length === 0) {
            comentariosHTML += `
                <div style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-comments" style="font-size: 48px;"></i>
                    <h3 style="color: #2c3e50; margin: 20px 0 10px;">Sin comentarios</h3>
                    <p>Sé el primero en comentar</p>
                </div>
            `;
        } else {
            for (const comentario of comentarios) {
                const usuario = comentario.usuario || {};
                const nombre = `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() || 'Usuario';
                const fecha = new Date(comentario.fecha_creacion).toLocaleDateString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                comentariosHTML += `
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e8edf2;">
                        <div style="display: flex; align-items: flex-start; gap: 10px;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: #667eea;">
                                ${usuario.avatar_url ? 
                                    `<img src="${usuario.avatar_url}" style="width:100%;height:100%;object-fit:cover;">` :
                                    `<i class="fas fa-user" style="color:white; display:flex; align-items:center; justify-content:center; height:100%;"></i>`
                                }
                            </div>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                    <strong style="color: #2c3e50;">${nombre}</strong>
                                    <small style="color: #7f8c8d;">${fecha}</small>
                                </div>
                                <div style="color: #2c3e50; line-height: 1.5;">
                                    ${comentario.contenido}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        comentariosHTML += '</div>';
        
        // Agregar campo para nuevo comentario
        comentariosHTML += `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e8edf2;">
                <textarea id="nuevoComentarioPrincipal" 
                          placeholder="Escribe tu comentario..." 
                          style="width:100%; padding:12px; border:2px solid #e8edf2; border-radius:8px; margin-bottom:10px; resize: vertical;"
                          rows="3"></textarea>
                <button onclick="agregarComentarioPrincipal('${publicacionId}')"
                        style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; border:none; padding:10px 25px; border-radius:8px; cursor:pointer; font-weight:600;">
                    <i class="fas fa-paper-plane"></i> Enviar comentario
                </button>
            </div>
        `;
        
        container.innerHTML = comentariosHTML;
        
    } catch (error) {
        console.error("Error cargando comentarios:", error);
        const container = document.getElementById('comentariosContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los comentarios</p>
                </div>
            `;
        }
    }
}

async function agregarComentarioPrincipal(publicacionId) {
    try {
        const textarea = document.getElementById('nuevoComentarioPrincipal');
        const contenido = textarea.value.trim();
        
        if (!contenido) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor escribe un comentario',
                timer: 2000
            });
            return;
        }
        
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            Swal.fire({
                icon: 'info',
                title: 'Inicia sesión',
                text: 'Debes iniciar sesión para comentar',
                confirmButtonText: 'Iniciar sesión'
            });
            return;
        }
        
        // Insertar comentario
        const { error } = await supabaseClient
            .from('comentarios')
            .insert({
                publicacion_id: publicacionId,
                usuario_id: user.id,
                contenido: contenido
            });
        
        if (error) throw error;
        
        // Actualizar contador
        await supabaseClient.rpc('increment_comentarios', { publicacion_id: publicacionId });
        
        // Limpiar y recargar
        textarea.value = '';
        cargarComentariosPrincipal(publicacionId);
        
        Swal.fire({
            icon: 'success',
            title: '¡Comentario publicado!',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error("Error agregando comentario:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo publicar el comentario'
        });
    }
}

function compartirPublicacionPrincipal(publicacionId, autorNombre) {
    const url = `${window.location.origin}/view.html?id=${publicacionId}`;
    const mensaje = `¡Mira esta publicación de ${autorNombre} en Messery! ${url}`;
    
    Swal.fire({
        title: 'Compartir publicación',
        html: `
            <div style="text-align: center;">
                <input type="text" value="${url}" readonly 
                       style="width:100%; padding:12px; border:2px solid #e8edf2; border-radius:8px; margin-bottom: 20px; background: #f8f9fa;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <button onclick="copiarEnlacePrincipal('${url}')"
                            style="padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-copy"></i> Copiar enlace
                    </button>
                    <button onclick="window.open('https://web.whatsapp.com/send?text=${encodeURIComponent(mensaje)}', '_blank')"
                            style="padding: 12px; background: #25D366; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                </div>
            </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        width: 500
    });
}

function copiarEnlacePrincipal(url) {
    navigator.clipboard.writeText(url).then(() => {
        Swal.fire({
            icon: 'success',
            title: '¡Copiado!',
            text: 'Enlace copiado al portapapeles',
            timer: 2000,
            showConfirmButton: false
        });
    });
}