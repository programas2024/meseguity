// modulos/amigos.js
const Amigos = {
    // Variable para controlar si ya se mostró la notificación
    notificacionLikesMostrada: false,

    async cargarAmigos() {
        try {
            const { data: amistades, error } = await window.supabase
                .from('amistades')
                .select(`
                    id,
                    usuario_id,
                    amigo_id,
                    estado,
                    usuario:usuarios!amistades_usuario_id_fkey(id, nombre, apellidos, email, ciudad, pais),
                    amigo:usuarios!amistades_amigo_id_fkey(id, nombre, apellidos, email, ciudad, pais)
                `)
                .or(`usuario_id.eq.${window.usuarioIdActual},amigo_id.eq.${window.usuarioIdActual}`)
                .eq('estado', 'aceptada');
            
            if (error) throw error;
            
            this.procesarAmistades(amistades);
            this.mostrarListaAmigos();
            
            // Cargar los likes de las publicaciones del usuario actual
            await this.cargarLikesPublicaciones();
            
            return window.listaAmigos;
            
        } catch (error) {
            console.error('Error al cargar amigos:', error);
            window.listaAmigos = [];
            this.mostrarErrorAmigos();
            return [];
        }
    },

    // Nuevo método para cargar likes de publicaciones
    async cargarLikesPublicaciones() {
        try {
            // Primero, obtener las publicaciones del usuario actual
            const { data: publicaciones, error: errorPublicaciones } = await window.supabase
                .from('publicaciones')
                .select('id, contenido, tipo, fecha_creacion, likes_count, comentarios_count, url_media')
                .eq('usuario_id', window.usuarioIdActual)
                .order('fecha_creacion', { ascending: false });
            
            if (errorPublicaciones) {
                console.error('Error al cargar publicaciones:', errorPublicaciones);
                return;
            }
            
            // Si no hay publicaciones, salir
            if (!publicaciones || publicaciones.length === 0) {
                console.log('El usuario no tiene publicaciones');
                window.publicacionesConLikes = [];
                return;
            }
            
            // Obtener IDs de todas las publicaciones
            const publicacionIds = publicaciones.map(p => p.id);
            
            // Obtener todos los likes para estas publicaciones CON información de usuarios
            const { data: likes, error: errorLikes } = await window.supabase
                .from('likes')
                .select(`
                    publicacion_id, 
                    usuario_id, 
                    fecha_creacion,
                    usuario:usuarios!likes_usuario_id_fkey(nombre, apellidos, avatar_url, email)
                `)
                .in('publicacion_id', publicacionIds);
            
            if (errorLikes) {
                console.error('Error al cargar likes:', errorLikes);
                return;
            }
            
            // Obtener comentarios para estas publicaciones
            const { data: comentarios, error: errorComentarios } = await window.supabase
                .from('comentarios')
                .select('publicacion_id, contenido, usuario_id, fecha_creacion')
                .in('publicacion_id', publicacionIds);
            
            if (errorComentarios) {
                console.error('Error al cargar comentarios:', errorComentarios);
            }
            
            // Procesar likes por publicación
            const likesPorPublicacion = {};
            if (likes) {
                likes.forEach(like => {
                    if (!likesPorPublicacion[like.publicacion_id]) {
                        likesPorPublicacion[like.publicacion_id] = {
                            count: 0,
                            usuarios: []
                        };
                    }
                    likesPorPublicacion[like.publicacion_id].count++;
                    likesPorPublicacion[like.publicacion_id].usuarios.push({
                        usuario_id: like.usuario_id,
                        nombre: like.usuario ? `${like.usuario.nombre} ${like.usuario.apellidos}`.trim() : 'Usuario',
                        avatar_url: like.usuario?.avatar_url,
                        fecha_creacion: like.fecha_creacion
                    });
                });
            }
            
            // Procesar comentarios por publicación
            const comentariosPorPublicacion = {};
            if (comentarios) {
                comentarios.forEach(comentario => {
                    if (!comentariosPorPublicacion[comentario.publicacion_id]) {
                        comentariosPorPublicacion[comentario.publicacion_id] = [];
                    }
                    comentariosPorPublicacion[comentario.publicacion_id].push(comentario);
                });
            }
            
            // Combinar datos
            window.publicacionesConLikes = await Promise.all(publicaciones.map(async (publicacion) => {
                const likesInfo = likesPorPublicacion[publicacion.id] || { count: 0, usuarios: [] };
                const comentariosInfo = comentariosPorPublicacion[publicacion.id] || [];
                
                // Obtener detalles de los comentarios con usuarios
                const comentariosConUsuarios = await Promise.all(comentariosInfo.map(async (comentario) => {
                    try {
                        const { data: usuarioComentario } = await window.supabase
                            .from('usuarios')
                            .select('nombre, apellidos, avatar_url')
                            .eq('id', comentario.usuario_id)
                            .single();
                        
                        return {
                            ...comentario,
                            usuario: usuarioComentario || { nombre: 'Usuario', apellidos: '' }
                        };
                    } catch (error) {
                        return {
                            ...comentario,
                            usuario: { nombre: 'Usuario', apellidos: '' }
                        };
                    }
                }));
                
                return {
                    ...publicacion,
                    likes_count: likesInfo.count || publicacion.likes_count || 0,
                    comentarios_count: comentariosInfo.length || publicacion.comentarios_count || 0,
                    likes_detalle: likesInfo.usuarios,
                    comentarios_detalle: comentariosConUsuarios,
                    // Crear un resumen del contenido para mostrar
                    contenido_resumen: publicacion.contenido ? 
                        (publicacion.contenido.length > 50 ? 
                            publicacion.contenido.substring(0, 50) + '...' : 
                            publicacion.contenido) : 
                        `Publicación de tipo: ${publicacion.tipo}`,
                    fecha_formateada: this.formatearFecha(publicacion.fecha_creacion)
                };
            }));
            
            console.log('Publicaciones con likes y comentarios cargadas:', window.publicacionesConLikes);
            
            // Verificar si hay nuevos likes/comentarios desde la última vez
            if (this.hayNuevasInteracciones()) {
                // Agregar notificación de likes en lugar de abrir directamente
                this.agregarNotificacionLikes();
                // Marcar que se mostró la notificación
                this.notificacionLikesMostrada = true;
            }
            
        } catch (error) {
            console.error('Error en cargarLikesPublicaciones:', error);
            window.publicacionesConLikes = [];
        }
    },

    // Verificar si hay nuevas interacciones desde la última vez
    hayNuevasInteracciones() {
        if (!window.publicacionesConLikes || window.publicacionesConLikes.length === 0) {
            return false;
        }
        
        // Obtener la última vez que se verificaron notificaciones de likes
        const ultimaVerificacion = localStorage.getItem('ultimaVerificacionLikes');
        
        if (!ultimaVerificacion) {
            // Primera vez que se carga - NO crear notificación automáticamente
            // Solo guardar la fecha de verificación actual
            localStorage.setItem('ultimaVerificacionLikes', new Date().toISOString());
            return false;
        }
        
        // Buscar si hay interacciones más recientes que la última verificación
        const ultimaFecha = new Date(ultimaVerificacion);
        let hayNuevas = false;
        
        for (const publicacion of window.publicacionesConLikes) {
            // Verificar likes
            for (const like of publicacion.likes_detalle) {
                const fechaLike = new Date(like.fecha_creacion);
                if (fechaLike > ultimaFecha) {
                    hayNuevas = true;
                    break;
                }
            }
            
            if (hayNuevas) break;
            
            // Verificar comentarios
            for (const comentario of publicacion.comentarios_detalle) {
                const fechaComentario = new Date(comentario.fecha_creacion);
                if (fechaComentario > ultimaFecha) {
                    hayNuevas = true;
                    break;
                }
            }
            
            if (hayNuevas) break;
        }
        
        // Actualizar fecha de verificación
        localStorage.setItem('ultimaVerificacionLikes', new Date().toISOString());
        
        return hayNuevas;
    },

    // Método para agregar notificación de likes
    agregarNotificacionLikes() {
        if (!window.publicacionesConLikes || window.publicacionesConLikes.length === 0) {
            return;
        }
        
        // Calcular estadísticas
        const totalPublicaciones = window.publicacionesConLikes.length;
        const totalLikes = window.publicacionesConLikes.reduce((sum, pub) => sum + (pub.likes_count || 0), 0);
        const totalComentarios = window.publicacionesConLikes.reduce((sum, pub) => sum + (pub.comentarios_count || 0), 0);
        
        // Verificar si ya existe una notificación de likes
        if (window.solicitudesPendientes) {
            const yaExiste = window.solicitudesPendientes.some(n => n.tipo === 'likes');
            if (yaExiste) {
                return; // Ya existe, no agregar duplicado
            }
        } else {
            window.solicitudesPendientes = [];
        }
        
        // Crear objeto de notificación
        const notificacionLikes = {
            id: `likes-${Date.now()}`,
            tipo: 'likes',
            fecha_creacion: new Date().toISOString(),
            leida: false, // Nueva propiedad para controlar si se ha visto
            datos: {
                total_publicaciones: totalPublicaciones,
                total_likes: totalLikes,
                total_comentarios: totalComentarios,
                publicaciones: window.publicacionesConLikes.slice(0, 5) // Solo primeras 5 para preview
            }
        };
        
        // Agregar al inicio de las notificaciones
        window.solicitudesPendientes.unshift(notificacionLikes);
        
        // Actualizar notificaciones
        this.actualizarContadorSolicitudes();
        
        // Si el dropdown está abierto, actualizar la lista
        const dropdown = document.getElementById('dropdownNotificaciones');
        if (dropdown && dropdown.style.display === 'block') {
            this.mostrarNotificaciones();
        }
    },

    // Método para mostrar estadísticas de likes cuando se hace clic en la notificación
    async mostrarEstadisticasLikesSweetAlert() {
        if (!window.publicacionesConLikes || window.publicacionesConLikes.length === 0) {
            // Mostrar mensaje si no hay publicaciones
            Swal.fire({
                title: '📝 Tus Publicaciones',
                html: `
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 60px; color: #667eea; margin-bottom: 20px;">
                            <i class="fas fa-newspaper"></i>
                        </div>
                        <h3 style="color: #2c3e50; margin-bottom: 15px;">No tienes publicaciones</h3>
                        <p style="color: #7e8c9a; margin-bottom: 25px;">
                            Crea tu primera publicación para compartir con la comunidad.
                        </p>
                        <button onclick="window.location.href='configuracion.html#publicaciones'" 
                                style="padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                       color: white; border: none; border-radius: 10px; cursor: pointer; 
                                       font-weight: 600; font-size: 15px; transition: transform 0.3s ease;"
                                onmouseover="this.style.transform='translateY(-2px)'"
                                onmouseout="this.style.transform='translateY(0)'">
                            <i class="fas fa-plus-circle"></i> Crear primera publicación
                        </button>
                    </div>
                `,
                showConfirmButton: false,
                showCloseButton: true,
                width: 500,
                backdrop: 'rgba(102, 126, 234, 0.1)'
            });
            return;
        }
        
        // Calcular estadísticas
        const totalPublicaciones = window.publicacionesConLikes.length;
        const totalLikes = window.publicacionesConLikes.reduce((sum, pub) => sum + (pub.likes_count || 0), 0);
        const totalComentarios = window.publicacionesConLikes.reduce((sum, pub) => sum + (pub.comentarios_count || 0), 0);
        
        // Ordenar publicaciones por cantidad de likes (de mayor a menor)
        const publicacionesOrdenadas = [...window.publicacionesConLikes].sort((a, b) => b.likes_count - a.likes_count);
        
        // Obtener la publicación más popular
        const publicacionTop = publicacionesOrdenadas[0];
        
        // Crear HTML para SweetAlert
        const html = `
            <div class="estadisticas-publicaciones-container">
                <!-- Encabezado -->
                <div class="estadisticas-header" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 25px;
                    border-radius: 15px;
                    color: white;
                    text-align: center;
                    margin-bottom: 25px;
                    position: relative;
                    overflow: hidden;
                ">
                    <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; 
                                background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; 
                                background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
                    
                    <h2 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; position: relative; z-index: 1;">
                        <i class="fas fa-chart-line"></i> Estadísticas de tus Publicaciones
                    </h2>
                    <p style="margin: 0; opacity: 0.9; font-size: 15px; position: relative; z-index: 1;">
                        Resumen completo de tu actividad
                    </p>
                </div>
                
                <!-- Estadísticas principales -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
                    <!-- Total Publicaciones -->
                    <div style="background: white; border: 2px solid #e8edf2; border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 36px; font-weight: 700; color: #667eea; margin-bottom: 5px;">
                            ${totalPublicaciones}
                        </div>
                        <div style="color: #5d6d7e; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-newspaper"></i> Publicaciones
                        </div>
                    </div>
                    
                    <!-- Total Likes -->
                    <div style="background: white; border: 2px solid #e8edf2; border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 36px; font-weight: 700; color: #f093fb; margin-bottom: 5px;">
                            ${totalLikes}
                        </div>
                        <div style="color: #5d6d7e; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-heart"></i> Likes recibidos
                        </div>
                    </div>
                    
                    <!-- Total Comentarios -->
                    <div style="background: white; border: 2px solid #e8edf2; border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 36px; font-weight: 700; color: #4facfe; margin-bottom: 5px;">
                            ${totalComentarios}
                        </div>
                        <div style="color: #5d6d7e; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-comment"></i> Comentarios
                        </div>
                    </div>
                </div>
                
                <!-- Publicación más popular -->
                ${publicacionTop && publicacionTop.likes_count > 0 ? `
                <div style="background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%); 
                            border-radius: 12px; padding: 20px; margin-bottom: 25px;
                            border-left: 4px solid #764ba2;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="width: 50px; height: 50px; background: #764ba2; color: white; 
                                    border-radius: 50%; display: flex; align-items: center; 
                                    justify-content: center; font-size: 20px;">
                            <i class="fas fa-crown"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">🔥 Publicación más popular</h4>
                            <p style="margin: 0; color: #7e8c9a; font-size: 14px;">
                                Con más likes de tu comunidad
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: white; border-radius: 10px; padding: 15px; border: 1px solid #e8edf2;">
                        <p style="margin: 0 0 10px 0; color: #5d6d7e; font-style: italic;">
                            "${publicacionTop.contenido_resumen}"
                        </p>
                        <div style="display: flex; justify-content: space-between; color: #7e8c9a; font-size: 13px;">
                            <span><i class="far fa-calendar"></i> ${publicacionTop.fecha_formateada}</span>
                            <span><i class="fas fa-heart" style="color: #f093fb;"></i> ${publicacionTop.likes_count} likes</span>
                            <span><i class="fas fa-comment" style="color: #4facfe;"></i> ${publicacionTop.comentarios_count} comentarios</span>
                        </div>
                        
                        <!-- Botones de acción para la publicación más popular -->
                        <div style="display: flex; gap: 10px; margin-top: 15px; border-top: 1px solid #f0f0f0; padding-top: 15px;">
                            <button onclick="window.Amigos.darLikePublicacion('${publicacionTop.id}')"
                                    style="flex: 1; padding: 8px 12px; background: #f8f9fa; border: 1px solid #e8edf2; 
                                           border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                           justify-content: center; gap: 6px; color: #5d6d7e; font-size: 13px;"
                                    onmouseover="this.style.background='#f0f2f5'; this.style.borderColor='#f093fb'"
                                    onmouseout="this.style.background='#f8f9fa'; this.style.borderColor='#e8edf2'">
                                <i class="fas fa-heart" style="color: #f093fb;"></i>
                                <span>Like (${publicacionTop.likes_count})</span>
                            </button>
                            
                            <button onclick="window.Amigos.mostrarComentariosPublicacion('${publicacionTop.id}')"
                                    style="flex: 1; padding: 8px 12px; background: #f8f9fa; border: 1px solid #e8edf2; 
                                           border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                           justify-content: center; gap: 6px; color: #5d6d7e; font-size: 13px;"
                                    onmouseover="this.style.background='#f0f2f5'; this.style.borderColor='#4facfe'"
                                    onmouseout="this.style.background='#f8f9fa'; this.style.borderColor='#e8edf2'">
                                <i class="fas fa-comment" style="color: #4facfe;"></i>
                                <span>Comentarios (${publicacionTop.comentarios_count})</span>
                            </button>
                            
                            <button onclick="window.Amigos.compartirPublicacion('${publicacionTop.id}', '${publicacionTop.contenido_resumen.replace(/'/g, "\\'")}')"
                                    style="flex: 1; padding: 8px 12px; background: #f8f9fa; border: 1px solid #e8edf2; 
                                           border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                           justify-content: center; gap: 6px; color: #5d6d7e; font-size: 13px;"
                                    onmouseover="this.style.background='#f0f2f5'; this.style.borderColor='#43e97b'"
                                    onmouseout="this.style.background='#f8f9fa'; this.style.borderColor='#e8edf2'">
                                <i class="fas fa-share-alt" style="color: #43e97b;"></i>
                                <span>Compartir</span>
                            </button>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- Lista de publicaciones -->
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #2c3e50; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-list-ol"></i> Todas tus publicaciones (${totalPublicaciones})
                    </h4>
                    
                    <div style="max-height: 400px; overflow-y: auto; padding-right: 5px;" id="listaPublicaciones">
                        ${publicacionesOrdenadas.map((pub, index) => `
                            <div id="publicacion-${pub.id}" style="background: white; border: 1px solid #e8edf2; border-radius: 10px; 
                                        padding: 15px; margin-bottom: 10px; transition: all 0.3s ease;"
                                 onmouseover="this.style.borderColor='#667eea'; this.style.boxShadow='0 5px 15px rgba(102, 126, 234, 0.1)'"
                                 onmouseout="this.style.borderColor='#e8edf2'; this.style.boxShadow='none'">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                            <span style="background: ${index === 0 ? '#764ba2' : index === 1 ? '#667eea' : index === 2 ? '#4facfe' : '#e8edf2'}; 
                                                  color: ${index < 3 ? 'white' : '#5d6d7e'}; 
                                                  width: 24px; height: 24px; border-radius: 50%; 
                                                  display: flex; align-items: center; justify-content: center;
                                                  font-size: 12px; font-weight: 600;">
                                                ${index + 1}
                                            </span>
                                            <span style="color: #5d6d7e; font-size: 13px;">
                                                <i class="far fa-calendar"></i> ${pub.fecha_formateada}
                                            </span>
                                        </div>
                                        <p style="margin: 0; color: #2c3e50; font-size: 14px; line-height: 1.4;">
                                            ${pub.contenido_resumen}
                                        </p>
                                    </div>
                                </div>
                                
                                <!-- Botones de acción -->
                                <div style="display: flex; gap: 10px; border-top: 1px solid #f0f0f0; padding-top: 10px;">
                                    <button onclick="window.Amigos.darLikePublicacion('${pub.id}')"
                                            style="flex: 1; padding: 8px; background: #f8f9fa; border: 1px solid #e8edf2; 
                                                   border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                                   justify-content: center; gap: 6px; color: #5d6d7e; font-size: 13px;"
                                            onmouseover="this.style.background='#f0f2f5'; this.style.borderColor='#f093fb'"
                                            onmouseout="this.style.background='#f8f9fa'; this.style.borderColor='#e8edf2'">
                                        <i class="fas fa-heart" style="color: #f093fb;"></i>
                                        <span>${pub.likes_count || 0}</span>
                                    </button>
                                    
                                    <button onclick="window.Amigos.mostrarComentariosPublicacion('${pub.id}')"
                                            style="flex: 1; padding: 8px; background: #f8f9fa; border: 1px solid #e8edf2; 
                                                   border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                                   justify-content: center; gap: 6px; color: #5d6d7e; font-size: 13px;"
                                            onmouseover="this.style.background='#f0f2f5'; this.style.borderColor='#4facfe'"
                                            onmouseout="this.style.background='#f8f9fa'; this.style.borderColor='#e8edf2'">
                                        <i class="fas fa-comment" style="color: #4facfe;"></i>
                                        <span>${pub.comentarios_count || 0}</span>
                                    </button>
                                    
                                    <button onclick="window.Amigos.compartirPublicacion('${pub.id}', '${pub.contenido_resumen.replace(/'/g, "\\'")}')"
                                            style="flex: 1; padding: 8px; background: #f8f9fa; border: 1px solid #e8edf2; 
                                                   border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                                   justify-content: center; gap: 6px; color: #5d6d7e; font-size: 13px;"
                                            onmouseover="this.style.background='#f0f2f5'; this.style.borderColor='#43e97b'"
                                            onmouseout="this.style.background='#f8f9fa'; this.style.borderColor='#e8edf2'">
                                        <i class="fas fa-share-alt" style="color: #43e97b;"></i>
                                        <span>Compartir</span>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Botón para crear nueva publicación -->
                <div style="text-align: center; padding-top: 15px; border-top: 2px solid #f0f0f0;">
                    <button onclick="window.location.href='configuracion.html#publicaciones'" 
                            style="padding: 12px 30px; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); 
                                   color: white; border: none; border-radius: 10px; cursor: pointer; 
                                   font-weight: 600; font-size: 15px; transition: all 0.3s ease;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(67, 233, 123, 0.3)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <i class="fas fa-plus-circle"></i> Crear nueva publicación
                    </button>
                </div>
            </div>
            
            <style>
                .estadisticas-publicaciones-container {
                    max-height: 70vh;
                    overflow-y: auto;
                    padding-right: 10px;
                }
                
                .estadisticas-publicaciones-container::-webkit-scrollbar {
                    width: 6px;
                }
                
                .estadisticas-publicaciones-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                
                .estadisticas-publicaciones-container::-webkit-scrollbar-thumb {
                    background: #667eea;
                    border-radius: 3px;
                }
                
                .estadisticas-publicaciones-container::-webkit-scrollbar-thumb:hover {
                    background: #764ba2;
                }
            </style>
        `;
        
        // Mostrar SweetAlert
        const { value: aceptado } = await Swal.fire({
            title: '',
            html: html,
            showCloseButton: true,
            showConfirmButton: false,
            width: 700,
            background: '#f8f9fa',
            customClass: {
                popup: 'estadisticas-publicaciones-popup'
            },
            didOpen: () => {
                // Agregar estilos al popup
                const popup = document.querySelector('.estadisticas-publicaciones-popup .swal2-popup');
                if (popup) {
                    popup.style.border = '2px solid #667eea';
                    popup.style.borderRadius = '15px';
                    popup.style.overflow = 'hidden';
                }
                
                // Actualizar fecha de última visualización de estadísticas
                // PERO NO eliminar la notificación
                localStorage.setItem('ultimaEstadisticasVistas', new Date().toISOString());
            }
        });
    },

    // Método para dar like a una publicación
    async darLikePublicacion(publicacionId) {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            
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
            const { data: likeExistente } = await window.supabase
                .from('likes')
                .select('id')
                .eq('publicacion_id', publicacionId)
                .eq('usuario_id', user.id)
                .maybeSingle();
            
            if (likeExistente) {
                // Quitar like
                await window.supabase
                    .from('likes')
                    .delete()
                    .eq('id', likeExistente.id);
                
                await window.supabase.rpc('decrement_likes', { publicacion_id: publicacionId });
                
                // Actualizar UI
                this.actualizarContadorLike(publicacionId, false);
                
                // Mostrar notificación
                this.mostrarNotificacion('info', 'Like eliminado');
                
            } else {
                // Dar like
                await window.supabase
                    .from('likes')
                    .insert({
                        publicacion_id: publicacionId,
                        usuario_id: user.id
                    });
                
                await window.supabase.rpc('increment_likes', { publicacion_id: publicacionId });
                
                // Actualizar UI
                this.actualizarContadorLike(publicacionId, true);
                
                // Mostrar notificación
                this.mostrarNotificacion('exito', '¡Like agregado!');
            }
            
            // Actualizar datos locales
            await this.actualizarDatosPublicacion(publicacionId);
            
        } catch (error) {
            console.error("Error dando like:", error);
            this.mostrarNotificacion('error', 'Error al dar like');
        }
    },

    // Actualizar contador de like en la UI
    actualizarContadorLike(publicacionId, incrementar) {
        const botonLike = document.querySelector(`#publicacion-${publicacionId} button:nth-child(1) span`);
        if (botonLike) {
            const likesActuales = parseInt(botonLike.textContent) || 0;
            botonLike.textContent = incrementar ? likesActuales + 1 : Math.max(0, likesActuales - 1);
        }
    },

    // Actualizar datos de la publicación
    async actualizarDatosPublicacion(publicacionId) {
        try {
            // Obtener datos actualizados
            const { data: publicacion } = await window.supabase
                .from('publicaciones')
                .select('likes_count, comentarios_count')
                .eq('id', publicacionId)
                .single();
            
            if (!publicacion) return;
            
            // Actualizar en window.publicacionesConLikes
            if (window.publicacionesConLikes) {
                const index = window.publicacionesConLikes.findIndex(p => p.id === publicacionId);
                if (index !== -1) {
                    window.publicacionesConLikes[index].likes_count = publicacion.likes_count || 0;
                    window.publicacionesConLikes[index].comentarios_count = publicacion.comentarios_count || 0;
                }
            }
            
        } catch (error) {
            console.error("Error actualizando datos:", error);
        }
    },

    // Método para mostrar comentarios de una publicación
    async mostrarComentariosPublicacion(publicacionId) {
        try {
            // Buscar la publicación
            const publicacion = window.publicacionesConLikes?.find(p => p.id === publicacionId);
            if (!publicacion) return;
            
            // Obtener comentarios actualizados
            const { data: comentarios } = await window.supabase
                .from('comentarios')
                .select('*, usuario:usuarios(nombre, apellidos, avatar_url)')
                .eq('publicacion_id', publicacionId)
                .order('fecha_creacion', { ascending: true });
            
            let comentariosHTML = '';
            
            if (!comentarios || comentarios.length === 0) {
                comentariosHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 48px; color: #667eea; margin-bottom: 15px;">
                            <i class="fas fa-comments"></i>
                        </div>
                        <h4 style="color: #2c3e50; margin-bottom: 10px;">No hay comentarios</h4>
                        <p style="color: #7e8c9a;">Sé el primero en comentar esta publicación</p>
                    </div>
                `;
            } else {
                comentariosHTML = `
                    <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
                        ${comentarios.map(comentario => {
                            const nombreUsuario = comentario.usuario ? 
                                `${comentario.usuario.nombre} ${comentario.usuario.apellidos}`.trim() : 
                                'Usuario';
                            const fecha = new Date(comentario.fecha_creacion);
                            const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            
                            return `
                                <div style="background: #f8f9fa; border-radius: 10px; padding: 12px; margin-bottom: 10px;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #667eea; 
                                                    color: white; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <div>
                                            <div style="font-weight: 600; color: #2c3e50;">${nombreUsuario}</div>
                                            <div style="color: #7e8c9a; font-size: 12px;">
                                                <i class="far fa-clock"></i> ${fechaFormateada}
                                            </div>
                                        </div>
                                    </div>
                                    <p style="margin: 0; color: #5d6d7e; font-size: 14px;">${comentario.contenido}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            
            // Agregar formulario para nuevo comentario
            comentariosHTML += `
                <div style="border-top: 2px solid #e8edf2; padding-top: 20px;">
                    <h5 style="color: #2c3e50; margin-bottom: 10px;">Agregar comentario</h5>
                    <textarea id="nuevoComentario-${publicacionId}" 
                              style="width: 100%; padding: 12px; border: 1px solid #e8edf2; border-radius: 8px;
                                     margin-bottom: 10px; resize: vertical; min-height: 80px;"
                              placeholder="Escribe tu comentario aquí..."></textarea>
                    <button onclick="window.Amigos.agregarComentario('${publicacionId}')"
                            style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                   color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-paper-plane"></i> Publicar comentario
                    </button>
                </div>
            `;
            
            Swal.fire({
                title: '💬 Comentarios',
                html: comentariosHTML,
                showCloseButton: true,
                showConfirmButton: false,
                width: 500,
                didOpen: () => {
                    // Enfocar el textarea
                    const textarea = document.getElementById(`nuevoComentario-${publicacionId}`);
                    if (textarea) {
                        textarea.focus();
                    }
                }
            });
            
        } catch (error) {
            console.error("Error mostrando comentarios:", error);
            this.mostrarNotificacion('error', 'Error al cargar comentarios');
        }
    },

    // Método para agregar comentario
    async agregarComentario(publicacionId) {
        try {
            const textarea = document.getElementById(`nuevoComentario-${publicacionId}`);
            const contenido = textarea?.value.trim();
            
            if (!contenido) {
                this.mostrarNotificacion('error', 'Escribe un comentario primero');
                return;
            }
            
            const { data: { user } } = await window.supabase.auth.getUser();
            
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
            await window.supabase
                .from('comentarios')
                .insert({
                    publicacion_id: publicacionId,
                    usuario_id: user.id,
                    contenido: contenido
                });
            
            // Actualizar contador
            await window.supabase.rpc('increment_comentarios', { publicacion_id: publicacionId });
            
            // Limpiar textarea
            if (textarea) {
                textarea.value = '';
            }
            
            // Mostrar notificación
            this.mostrarNotificacion('exito', '¡Comentario publicado!');
            
            // Actualizar datos locales
            await this.actualizarDatosPublicacion(publicacionId);
            
            // Actualizar contador en la UI
            const botonComentario = document.querySelector(`#publicacion-${publicacionId} button:nth-child(2) span`);
            if (botonComentario) {
                const comentariosActuales = parseInt(botonComentario.textContent) || 0;
                botonComentario.textContent = comentariosActuales + 1;
            }
            
        } catch (error) {
            console.error("Error agregando comentario:", error);
            this.mostrarNotificacion('error', 'Error al publicar comentario');
        }
    },

    // Método para compartir publicación
    async compartirPublicacion(publicacionId, contenido) {
        try {
            // Obtener datos de la publicación
            const publicacion = window.publicacionesConLikes?.find(p => p.id === publicacionId);
            if (!publicacion) return;
            
            // Generar URL de compartir
            const baseUrl = window.location.origin;
            const shareUrl = `${baseUrl}/view.html?id=${publicacionId}`;
            
            const mensaje = `¡Mira esta publicación en Messery!\n\n"${contenido}"\n\nVer publicación: ${shareUrl}`;
            
            // Mostrar opciones de compartir
            Swal.fire({
                title: '📤 Compartir Publicación',
                html: `
                    <div style="text-align: center;">
                        <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                            <p style="color: #5d6d7e; font-style: italic; margin: 0;">
                                "${contenido.substring(0, 100)}${contenido.length > 100 ? '...' : ''}"
                            </p>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                            <button onclick="window.Amigos.compartirEnRed('whatsapp', '${encodeURIComponent(mensaje)}')"
                                    style="padding: 12px; background: #25D366; color: white; border: none; 
                                           border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                           justify-content: center; gap: 8px; font-weight: 600;">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </button>
                            
                            <button onclick="window.Amigos.compartirEnRed('facebook', '${encodeURIComponent(shareUrl)}')"
                                    style="padding: 12px; background: #1877F2; color: white; border: none; 
                                           border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                           justify-content: center; gap: 8px; font-weight: 600;">
                                <i class="fab fa-facebook"></i> Facebook
                            </button>
                            
                            <button onclick="window.Amigos.compartirEnRed('twitter', '${encodeURIComponent(mensaje)}')"
                                    style="padding: 12px; background: #1DA1F2; color: white; border: none; 
                                           border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                           justify-content: center; gap: 8px; font-weight: 600;">
                                <i class="fab fa-twitter"></i> Twitter
                            </button>
                            
                            <button onclick="window.Amigos.compartirEnRed('telegram', '${encodeURIComponent(mensaje)}')"
                                    style="padding: 12px; background: #0088cc; color: white; border: none; 
                                           border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                           justify-content: center; gap: 8px; font-weight: 600;">
                                <i class="fab fa-telegram"></i> Telegram
                            </button>
                            
                            <button onclick="window.Amigos.compartirEnRed('copiar', '${encodeURIComponent(mensaje)}')"
                                    style="padding: 12px; background: #667eea; color: white; border: none; 
                                           border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                           justify-content: center; gap: 8px; font-weight: 600; grid-column: span 2;">
                                <i class="fas fa-copy"></i> Copiar enlace
                            </button>
                        </div>
                        
                        <div style="color: #7e8c9a; font-size: 13px;">
                            <i class="fas fa-link"></i> Enlace: ${shareUrl}
                        </div>
                    </div>
                `,
                showCloseButton: true,
                showConfirmButton: false,
                width: 500
            });
            
        } catch (error) {
            console.error("Error compartiendo:", error);
            this.mostrarNotificacion('error', 'Error al compartir');
        }
    },

    // Método para compartir en redes sociales
    async compartirEnRed(red, contenidoCodificado) {
        const contenido = decodeURIComponent(contenidoCodificado);
        
        switch(red) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(contenido)}`, '_blank');
                break;
                
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contenido)}`, '_blank');
                break;
                
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(contenido)}`, '_blank');
                break;
                
            case 'telegram':
                window.open(`https://t.me/share/url?url=${encodeURIComponent(contenido)}`, '_blank');
                break;
                
            case 'copiar':
                navigator.clipboard.writeText(contenido).then(() => {
                    this.mostrarNotificacion('exito', 'Enlace copiado al portapapeles');
                }).catch(() => {
                    this.mostrarNotificacion('error', 'Error al copiar');
                });
                break;
        }
        
        // Cerrar el modal de compartir
        Swal.close();
    },

    // Modificar el método mostrarNotificaciones para incluir la notificación de likes
    mostrarNotificaciones() {
        // Crear dropdown si no existe
        if (!document.getElementById('dropdownNotificaciones')) {
            this.crearDropdownNotificaciones();
        }
        
        const lista = document.getElementById('listaNotificaciones');
        if (!lista) return;
        
        if (!window.solicitudesPendientes || window.solicitudesPendientes.length === 0) {
            lista.innerHTML = `
                <div class="notification-item">
                    <div class="notification-text">No hay notificaciones</div>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        window.solicitudesPendientes.forEach(notificacion => {
            if (notificacion.tipo === 'amistad') {
                const nombreUsuario = `${notificacion.usuario.nombre} ${notificacion.usuario.apellidos}`;
                const nombreEscapado = nombreUsuario.replace(/'/g, "\\'");
                const avatarUrl = notificacion.usuario.avatar_url;
                
                // Usar las funciones de utilidad unificadas
                const obtenerIniciales = (nombre) => {
                    if (!nombre) return '??';
                    const partes = nombre.split(' ');
                    let iniciales = '';
                    partes.forEach(parte => {
                        if (parte.length > 0) {
                            iniciales += parte[0].toUpperCase();
                        }
                    });
                    return iniciales.substring(0, 2);
                };
                
                const obtenerColorAvatar = (nombre) => {
                    const colores = [
                        '#667eea', '#764ba2', '#f093fb', '#f5576c',
                        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
                        '#fa709a', '#fee140', '#a8edea', '#fed6e3'
                    ];
                    let hash = 0;
                    for (let i = 0; i < nombre.length; i++) {
                        hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    return colores[Math.abs(hash) % colores.length];
                };
                
                html += `
                    <div class="notification-item unread">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                            <div class="notification-avatar" 
                                 onclick="window.Amigos.mostrarPerfilAmigo('${notificacion.usuario_id}')"
                                 style="
                                    width: 50px;
                                    height: 50px;
                                    border-radius: 50%;
                                    overflow: hidden;
                                    cursor: pointer;
                                    flex-shrink: 0;
                                    border: 2px solid #667eea;
                                    transition: transform 0.3s ease;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                 "
                                 onmouseover="this.style.transform='scale(1.1)'"
                                 onmouseout="this.style.transform='scale(1)'">
                    `;
                
                if (avatarUrl) {
                    html += `
                        <img src="${avatarUrl}" 
                             alt="${nombreUsuario}" 
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color: white; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; background: ${obtenerColorAvatar(nombreUsuario)};\\'>${obtenerIniciales(nombreUsuario)}</div>';">
                    `;
                } else {
                    html += `
                        <div style="
                            width: 100%;
                            height: 100%;
                            background: ${obtenerColorAvatar(nombreUsuario)};
                            color: white;
                            font-size: 18px;
                            font-weight: bold;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            ${obtenerIniciales(nombreUsuario)}
                        </div>
                    `;
                }
                
                html += `
                            </div>
                            <div style="flex-grow: 1;">
                                <div class="notification-text">
                                    <strong>${nombreUsuario}</strong> quiere ser tu amigo
                                </div>
                                <div class="notification-time">Ahora</div>
                            </div>
                        </div>
                        <div class="notification-actions">
                            <button class="btn-notification-accept" onclick="window.Amigos.aceptarSolicitudAmistad('${notificacion.id}')">
                                Aceptar
                            </button>
                            <button class="btn-notification-decline" onclick="window.Amigos.rechazarSolicitudAmistad('${notificacion.id}')">
                                Rechazar
                            </button>
                        </div>
                    </div>
                `;
            } else if (notificacion.tipo === 'grupo') {
                const esCreador = notificacion.grupo.creador_id === notificacion.usuario_id;
                const nombreInvitador = esCreador ? 'Creador del grupo' : 
                    (notificacion.usuario ? `${notificacion.usuario.nombre} ${notificacion.usuario.apellidos}` : 'Usuario');
                const nombreInvitadorEscapado = nombreInvitador.replace(/'/g, "\\'");
                const nombreGrupoEscapado = notificacion.grupo.nombre.replace(/'/g, "\\'");
                
                html += `
                    <div class="notification-item unread">
                        <div class="notification-text">
                            <strong>${nombreInvitador}</strong> te ha invitado al grupo <strong>${notificacion.grupo.nombre}</strong>
                        </div>
                        <div class="notification-time">Ahora</div>
                        <div class="notification-actions">
                            <button class="btn-notification-accept" onclick="window.Amigos.verInvitacionGrupo('${notificacion.grupo_id}')">
                                Ver grupo
                            </button>
                            <button class="btn-notification-decline" onclick="window.Amigos.rechazarInvitacionGrupo('${notificacion.id}')">
                                Rechazar
                            </button>
                        </div>
                    </div>
                `;
            } else if (notificacion.tipo === 'likes') {
                // Notificación de likes de publicaciones
                const datos = notificacion.datos;
                const tieneLikes = datos.total_likes > 0;
                const tieneComentarios = datos.total_comentarios > 0;
                
                let mensaje = '';
                if (tieneLikes && tieneComentarios) {
                    mensaje = `Tus publicaciones tienen ${datos.total_likes} likes y ${datos.total_comentarios} comentarios`;
                } else if (tieneLikes) {
                    mensaje = `Tus publicaciones tienen ${datos.total_likes} likes`;
                } else if (tieneComentarios) {
                    mensaje = `Tus publicaciones tienen ${datos.total_comentarios} comentarios`;
                } else {
                    mensaje = `Tienes ${datos.total_publicaciones} publicaciones`;
                }
                
                // Determinar clase CSS según si está leída o no
                const claseLeida = notificacion.leida ? '' : 'unread';
                
                html += `
                    <div class="notification-item ${claseLeida}">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                            <div style="
                                width: 50px;
                                height: 50px;
                                border-radius: 50%;
                                overflow: hidden;
                                flex-shrink: 0;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                border: 2px solid ${notificacion.leida ? '#e8edf2' : '#667eea'};
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-size: 20px;
                            ">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div style="flex-grow: 1;">
                                <div class="notification-text">
                                    <strong>Estadísticas de tus publicaciones</strong><br>
                                    <span style="color: #5d6d7e; font-size: 14px;">${mensaje}</span>
                                </div>
                                <div class="notification-time">${this.formatearFecha(notificacion.fecha_creacion)}</div>
                            </div>
                        </div>
                        <div class="notification-actions">
                            <button class="btn-notification-accept" onclick="window.Amigos.verEstadisticasLikes('${notificacion.id}')">
                                Ver detalles
                            </button>
                            <button class="btn-notification-decline" onclick="window.Amigos.eliminarNotificacionLikes('${notificacion.id}')">
                                Eliminar
                            </button>
                        </div>
                    </div>
                `;
            }
        });
        
        lista.innerHTML = html;
    },

    // Método para ver estadísticas de likes
    async verEstadisticasLikes(notificacionId) {
        // Cerrar dropdown
        const dropdown = document.getElementById('dropdownNotificaciones');
        if (dropdown) dropdown.style.display = 'none';
        
        // Marcar como leída (pero NO eliminar)
        this.marcarNotificacionComoLeida(notificacionId);
        
        // Mostrar SweetAlert con estadísticas
        await this.mostrarEstadisticasLikesSweetAlert();
    },

    // Método para marcar notificación como leída (sin eliminarla)
    marcarNotificacionComoLeida(notificacionId) {
        if (!window.solicitudesPendientes) return;
        
        const notificacion = window.solicitudesPendientes.find(n => n.id === notificacionId);
        if (notificacion && notificacion.tipo === 'likes') {
            notificacion.leida = true;
            
            // Actualizar UI
            this.mostrarNotificaciones();
            
            // Actualizar contador (excluyendo las notificaciones leídas de likes)
            this.actualizarContadorSolicitudes();
        }
    },

    // Método para eliminar notificación de likes (manual)
    eliminarNotificacionLikes(notificacionId) {
        if (!window.solicitudesPendientes) return;
        
        // Mostrar confirmación
        window.Utilidades.mostrarConfirmacion(
            '¿Eliminar notificación?',
            'Esta acción no se puede deshacer',
            'Sí, eliminar'
        ).then((result) => {
            if (result.isConfirmed) {
                // Eliminar de la lista local
                window.solicitudesPendientes = window.solicitudesPendientes.filter(n => n.id !== notificacionId);
                
                // Actualizar UI
                this.mostrarNotificaciones();
                this.actualizarContadorSolicitudes();
                
                window.Utilidades.mostrarAlerta('Notificación eliminada', 'La notificación ha sido eliminada', 'success');
            }
        });
    },

    // Actualizar contador de solicitudes (excluye notificaciones leídas de likes)
    actualizarContadorSolicitudes() {
        if (!window.solicitudesPendientes) {
            const badge = document.querySelector('#btnNotificaciones .badge');
            if (badge) {
                badge.textContent = '';
                badge.style.display = 'none';
            }
            return;
        }
        
        // Contar solo: solicitudes de amistad, grupos, y notificaciones de likes NO leídas
        const totalSolicitudes = window.solicitudesPendientes.filter(n => {
            if (n.tipo === 'likes') {
                return !n.leida; // Solo contar likes no leídos
            }
            return true; // Contar todo lo demás
        }).length;
        
        const badge = document.querySelector('#btnNotificaciones .badge');
        if (badge) {
            badge.textContent = totalSolicitudes > 0 ? totalSolicitudes : '';
            badge.style.display = totalSolicitudes > 0 ? 'flex' : 'none';
        }
    },

    // Función auxiliar para formatear fechas
    formatearFecha(fechaString) {
        if (!fechaString) return 'Fecha no disponible';
        
        const fecha = new Date(fechaString);
        const ahora = new Date();
        const diferenciaMs = ahora - fecha;
        const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
        
        if (diferenciaDias === 0) {
            const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
            if (diferenciaHoras === 0) {
                const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
                if (diferenciaMinutos === 0) {
                    return 'Ahora mismo';
                }
                return `Hace ${diferenciaMinutos} min`;
            }
            return `Hace ${diferenciaHoras} h`;
        } else if (diferenciaDias === 1) {
            return 'Ayer';
        } else if (diferenciaDias < 7) {
            return `Hace ${diferenciaDias} días`;
        } else if (diferenciaDias < 30) {
            const semanas = Math.floor(diferenciaDias / 7);
            return `Hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
        } else {
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    },

    // Función para mostrar notificaciones
    mostrarNotificacion(tipo, mensaje) {
        const iconos = {
            exito: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        
        Swal.fire({
            icon: tipo,
            title: mensaje,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    },

    // El resto del código permanece igual...
    procesarAmistades(amistades) {
        window.listaAmigos = [];
        amistades.forEach(amistad => {
            let amigoData;
            if (amistad.usuario_id === window.usuarioIdActual) {
                amigoData = {
                    id: amistad.amigo_id,
                    nombre: amistad.amigo.nombre,
                    apellidos: amistad.amigo.apellidos,
                    email: amistad.amigo.email,
                    ciudad: amistad.amigo.ciudad,
                    pais: amistad.amigo.pais,
                    amistad_id: amistad.id
                };
            } else {
                amigoData = {
                    id: amistad.usuario_id,
                    nombre: amistad.usuario.nombre,
                    apellidos: amistad.usuario.apellidos,
                    email: amistad.usuario.email,
                    ciudad: amistad.usuario.ciudad,
                    pais: amistad.usuario.pais,
                    amistad_id: amistad.id
                };
            }
            window.listaAmigos.push(amigoData);
        });
    },

    mostrarListaAmigos() {
        const seccionAmigos = document.getElementById('seccionAmigosLista');
        if (!seccionAmigos) return;
        
        if (window.listaAmigos.length === 0) {
            seccionAmigos.innerHTML = window.Utilidades.plantillaEstadoVacio('user-friends', 'No tienes amigos', 'Agrega amigos para chatear');
            return;
        }
        
        // USAR LA MISMA FUNCIÓN DEL SCRIPT PRINCIPAL (3 BOTONES)
        if (typeof renderizarListaAmigos === 'function') {
            renderizarListaAmigos(window.listaAmigos);
        } else if (window.renderizarListaAmigos && typeof window.renderizarListaAmigos === 'function') {
            window.renderizarListaAmigos(window.listaAmigos);
        } else {
            // Fallback si la función no está disponible
            this.mostrarListaAmigosFallback();
        }
    },

    // Versión de fallback que muestra 3 botones
    mostrarListaAmigosFallback() {
        const seccionAmigos = document.getElementById('seccionAmigosLista');
        let html = '';
        
        window.listaAmigos.forEach(amigo => {
            const nombreCompleto = `${amigo.nombre} ${amigo.apellidos}`;
            const iniciales = window.Utilidades.obtenerIniciales(nombreCompleto);
            const ubicacion = amigo.ciudad && amigo.pais 
                ? `${amigo.ciudad}, ${amigo.pais}` 
                : 'Ubicación no especificada';
            
            // Escapar comillas simples en las cadenas para evitar errores de JavaScript
            const emailEscapado = amigo.email.replace(/'/g, "\\'");
            const nombreEscapado = amigo.nombre.replace(/'/g, "\\'");
            
            html += `
                <div class="friend-item" data-amigo-id="${amigo.id}">
                    <div class="friend-avatar">
                        <span>${iniciales}</span>
                    </div>
                    <div class="friend-content">
                        <div class="friend-header">
                            <h3 class="friend-name">${nombreCompleto}</h3>
                            <span class="friend-info">${amigo.email}</span>
                        </div>
                        <p class="friend-description">${ubicacion}</p>
                        <div class="friend-actions">
                            <button class="friend-btn friend-btn-chat" onclick="window.Amigos.enviarMensajeAAmigo('${emailEscapado}', '${nombreEscapado}')">
                                <i class="fas fa-paper-plane"></i> Mensaje
                            </button>
                            <button class="friend-btn friend-btn-info" onclick="window.Amigos.mostrarPerfilAmigo('${amigo.id}')">
                                <i class="fas fa-user-circle"></i> Ver Perfil
                            </button>
                            <button class="friend-btn friend-btn-remove" onclick="window.Amigos.eliminarAmigo('${amigo.amistad_id}')">
                                <i class="fas fa-user-times"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        seccionAmigos.innerHTML = html;
    },

    enviarMensajeAAmigo(email, nombre) {
        if (window.Interfaz && window.Interfaz.mostrarSeccion) {
            window.Interfaz.mostrarSeccion('seccionNuevoMensaje');
        }
        
        const destinatarioInput = document.getElementById('destinatario');
        const asuntoInput = document.getElementById('asunto');
        const contenidoInput = document.getElementById('contenido');
        
        if (destinatarioInput) destinatarioInput.value = email;
        if (asuntoInput) asuntoInput.value = `Hola ${nombre}`;
        if (contenidoInput) {
            contenidoInput.value = `Hola ${nombre},\n\n`;
            contenidoInput.focus();
        }
    },

    async eliminarAmigo(amistadId) {
        const confirmacion = await window.Utilidades.mostrarConfirmacion(
            '¿Eliminar amigo?',
            'Esta acción no se puede deshacer',
            'Sí, eliminar'
        );
        
        if (confirmacion.isConfirmed) {
            try {
                const { error } = await window.supabase
                    .from('amistades')
                    .delete()
                    .eq('id', amistadId);
                
                if (error) throw error;
                
                await this.cargarAmigos();
                window.Utilidades.mostrarAlerta('Amigo eliminado', 'El amigo ha sido eliminado', 'success');
                
            } catch (error) {
                console.error('Error al eliminar amigo:', error);
                window.Utilidades.mostrarAlerta('Error', 'No se pudo eliminar el amigo', 'error');
            }
        }
    },

    async cargarSolicitudesPendientes() {
        try {
            // Cargar solicitudes de amistad
            const { data: solicitudesAmistad, error: errorAmistad } = await window.supabase
                .from('amistades')
                .select(`
                    id,
                    usuario_id,
                    amigo_id,
                    estado,
                    usuario:usuarios!amistades_usuario_id_fkey(
                        nombre, 
                        apellidos, 
                        email,
                        avatar_url
                    )
                `)
                .eq('amigo_id', window.usuarioIdActual)
                .eq('estado', 'pendiente');
            
            if (errorAmistad) throw errorAmistad;
            
            // Cargar invitaciones a grupos
            const { data: invitacionesGrupo, error: errorGrupo } = await window.supabase
                .from('miembros_grupo')
                .select(`
                    id,
                    grupo_id,
                    usuario_id,
                    estado,
                    grupo:grupos!inner(nombre, creador_id),
                    usuario:usuarios!miembros_grupo_usuario_id_fkey(nombre, apellidos)
                `)
                .eq('usuario_id', window.usuarioIdActual)
                .eq('estado', 'pendiente');
            
            if (errorGrupo) throw errorGrupo;
            
            // Combinar ambas listas
            const nuevasSolicitudes = [
                ...(solicitudesAmistad || []).map(s => ({
                    ...s,
                    tipo: 'amistad'
                })),
                ...(invitacionesGrupo || []).map(i => ({
                    ...i,
                    tipo: 'grupo'
                }))
            ];
            
            // Verificar si ya existe notificación de likes para no duplicar
            const notificacionLikesExistente = window.solicitudesPendientes ? 
                window.solicitudesPendientes.find(n => n.tipo === 'likes') : null;
            
            if (notificacionLikesExistente) {
                // Mantener la notificación de likes y agregar las nuevas
                window.solicitudesPendientes = [
                    notificacionLikesExistente,
                    ...nuevasSolicitudes
                ];
            } else {
                window.solicitudesPendientes = nuevasSolicitudes;
            }
            
            this.actualizarContadorSolicitudes();
            this.mostrarNotificaciones();
            
            return window.solicitudesPendientes;
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            window.solicitudesPendientes = [];
            this.actualizarContadorSolicitudes();
            return [];
        }
    },

    crearDropdownNotificaciones() {
        const dropdownHTML = `
            <div class="notification-dropdown" id="dropdownNotificaciones" style="display: none;">
                <div class="notification-header">
                    <h4>Notificaciones</h4>
                    <button class="btn-icon" onclick="document.getElementById('dropdownNotificaciones').style.display = 'none'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-list" id="listaNotificaciones">
                    <!-- Notificaciones se cargarán aquí -->
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dropdownHTML);
        
        // Configurar toggle del dropdown
        const btnNotificaciones = document.getElementById('btnNotificaciones');
        if (btnNotificaciones) {
            btnNotificaciones.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('dropdownNotificaciones');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    // Actualizar notificaciones cuando se abre
                    if (dropdown.style.display === 'block') {
                        this.mostrarNotificaciones();
                    }
                }
            });
        }
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('dropdownNotificaciones');
            if (dropdown && !dropdown.contains(e.target) && e.target.id !== 'btnNotificaciones') {
                dropdown.style.display = 'none';
            }
        });
    },

    verInvitacionGrupo(grupoId) {
        const dropdown = document.getElementById('dropdownNotificaciones');
        if (dropdown) dropdown.style.display = 'none';
        
        if (window.Grupos && window.Grupos.verDetalleGrupo) {
            window.Grupos.verDetalleGrupo(grupoId);
        }
    },

    async rechazarInvitacionGrupo(miembroId) {
        try {
            const { error } = await window.supabase
                .from('miembros_grupo')
                .update({ estado: 'rechazado' })
                .eq('id', miembroId)
                .eq('usuario_id', window.usuarioIdActual);
            
            if (error) throw error;
            
            // Eliminar de la lista local
            if (window.solicitudesPendientes) {
                window.solicitudesPendientes = window.solicitudesPendientes.filter(n => n.id !== miembroId);
            }
            
            this.mostrarNotificaciones();
            this.actualizarContadorSolicitudes();
            
            window.Utilidades.mostrarAlerta('Invitación rechazada', 'Has rechazado la invitación al grupo', 'info');
            
        } catch (error) {
            console.error('Error al rechazar invitación:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo rechazar la invitación', 'error');
        }
    },

    async aceptarSolicitudAmistad(solicitudId) {
        try {
            const { error } = await window.supabase
                .from('amistades')
                .update({ estado: 'aceptada' })
                .eq('id', solicitudId);
            
            if (error) throw error;
            
            // Eliminar de la lista local
            if (window.solicitudesPendientes) {
                window.solicitudesPendientes = window.solicitudesPendientes.filter(n => n.id !== solicitudId);
            }
            
            // Recargar amigos
            await this.cargarAmigos();
            this.mostrarNotificaciones();
            this.actualizarContadorSolicitudes();
            
            window.Utilidades.mostrarAlerta('Solicitud aceptada', 'Ahora son amigos', 'success');
            
        } catch (error) {
            console.error('Error al aceptar solicitud:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo aceptar la solicitud', 'error');
        }
    },

    async rechazarSolicitudAmistad(solicitudId) {
        try {
            const { error } = await window.supabase
                .from('amistades')
                .delete()
                .eq('id', solicitudId);
            
            if (error) throw error;
            
            // Eliminar de la lista local
            if (window.solicitudesPendientes) {
                window.solicitudesPendientes = window.solicitudesPendientes.filter(n => n.id !== solicitudId);
            }
            
            this.mostrarNotificaciones();
            this.actualizarContadorSolicitudes();
            
            window.Utilidades.mostrarAlerta('Solicitud rechazada', 'Has rechazado la solicitud de amistad', 'info');
            
        } catch (error) {
            console.error('Error al rechazar solicitud:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo rechazar la solicitud', 'error');
        }
    },

    mostrarErrorAmigos() {
        const seccionAmigos = document.getElementById('seccionAmigosLista');
        if (seccionAmigos) {
            seccionAmigos.innerHTML = window.Utilidades.plantillaEstadoVacio('exclamation-triangle', 'Error', 'Intenta recargar la página');
        }
    }
}

// Hacer disponible globalmente
window.Amigos = Amigos;