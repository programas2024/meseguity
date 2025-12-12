// modulos/usuarios-disponibles.js
const UsuariosDisponibles = {
    async cargarUsuariosDisponibles() {
        try {
            const { data: usuarios, error } = await window.supabase
                .from('usuarios')
                .select('id, nombre, apellidos, email, ciudad, pais')
                .neq('id', window.usuarioIdActual);
            
            if (error) throw error;
            
            window.listaUsuarios = usuarios || [];
            this.mostrarUsuariosDisponibles();
            return window.listaUsuarios;
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            window.listaUsuarios = [];
            this.mostrarErrorUsuarios();
            return [];
        }
    },

    mostrarUsuariosDisponibles() {
        const lista = document.getElementById('listaAmigos');
        const contador = document.getElementById('contadorAmigos');
        
        if (!lista) return;
        
        const usuariosFiltrados = this.filtrarUsuarios();
        contador.textContent = usuariosFiltrados.length;
        
        if (usuariosFiltrados.length === 0) {
            lista.innerHTML = window.Utilidades.plantillaEstadoVacio('users', 'No hay usuarios', 'Todos ya son tus amigos');
            return;
        }
        
        let html = '';
        usuariosFiltrados.forEach(usuario => {
            const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`;
            const iniciales = window.Utilidades.obtenerIniciales(nombreCompleto);
            const ubicacion = usuario.ciudad && usuario.pais 
                ? `${usuario.ciudad}, ${usuario.pais}` 
                : 'Ubicación no especificada';
            
            const tieneSolicitud = window.solicitudesPendientes?.some(
                solicitud => solicitud.usuario_id === window.usuarioIdActual && solicitud.amigo_id === usuario.id
            );
            
            html += `
                <div class="friend-card" data-user-id="${usuario.id}">
                    <div class="friend-avatar">${iniciales}</div>
                    <div class="friend-info">
                        <div class="friend-name">${nombreCompleto}</div>
                        <div class="friend-email">${usuario.email}</div>
                        <div class="friend-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${ubicacion}
                        </div>
                    </div>
                    <div class="friend-actions">
                        ${tieneSolicitud ? `
                            <button class="btn-small btn-secondary" disabled>
                                <i class="fas fa-clock"></i> Pendiente
                            </button>
                        ` : `
                            <button class="btn-small btn-add" onclick="UsuariosDisponibles.enviarSolicitud('${usuario.id}')">
                                <i class="fas fa-user-plus"></i> Agregar
                            </button>
                        `}
                        <button class="btn-small btn-secondary" onclick="UsuariosDisponibles.enviarMensaje('${usuario.email}', '${usuario.nombre}')">
                            <i class="fas fa-envelope"></i> Mensaje
                        </button>
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html;
    },

    filtrarUsuarios() {
        return window.listaUsuarios.filter(usuario => 
            !window.listaAmigos?.some(amigo => amigo.id === usuario.id)
        );
    },

    async enviarSolicitud(amigoId) {
        try {
            const { error } = await window.supabase
                .from('amistades')
                .insert([{
                    usuario_id: window.usuarioIdActual,
                    amigo_id: amigoId,
                    estado: 'pendiente'
                }]);
            
            if (error) throw error;
            
            window.Utilidades.mostrarAlerta('Solicitud enviada', 'La solicitud ha sido enviada', 'success');
            await window.Amigos.cargarSolicitudesPendientes();
            this.mostrarUsuariosDisponibles();
            
        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            
            if (error.code === '23505') {
                window.Utilidades.mostrarAlerta('Solicitud ya enviada', 'Ya has enviado una solicitud', 'info');
            } else {
                window.Utilidades.mostrarAlerta('Error', 'No se pudo enviar la solicitud', 'error');
            }
        }
    },

    enviarMensaje(email, nombre) {
        window.Interfaz.mostrarSeccion('seccionNuevoMensaje');
        document.getElementById('destinatario').value = email;
        document.getElementById('asunto').value = `Hola ${nombre}`;
        document.getElementById('contenido').value = `Hola ${nombre},\n\n`;
        document.getElementById('contenido').focus();
    },

    mostrarErrorUsuarios() {
        const lista = document.getElementById('listaAmigos');
        if (lista) {
            lista.innerHTML = window.Utilidades.plantillaEstadoVacio('exclamation-triangle', 'Error', 'Intenta recargar la página');
        }
    }
};

// Hacer disponible globalmente
window.UsuariosDisponibles = UsuariosDisponibles;