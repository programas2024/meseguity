// modulos/amigos.js
const Amigos = {
    // Variable para controlar si ya se mostró la notificación
    notificacionLikesMostrada: false,

    // ======================
    // FUNCIONES DE UTILIDAD
    // ======================
    
    obtenerIniciales(nombre) {
        if (!nombre) return '??';
        const partes = nombre.split(' ');
        let iniciales = '';
        partes.forEach(parte => {
            if (parte.length > 0) {
                iniciales += parte[0].toUpperCase();
            }
        });
        return iniciales.substring(0, 2);
    },
    
    obtenerColorAvatar(nombre) {
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
    },
    
    formatearUbicacion(ciudad, pais) {
        if (ciudad && pais) {
            return `${ciudad}, ${pais}`;
        } else if (ciudad) {
            return ciudad;
        } else if (pais) {
            return pais;
        }
        return 'No especificada';
    },
    
    calcularEdad(fechaNacimiento) {
        if (!fechaNacimiento) return 'No especificada';
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return `${edad} años`;
    },
    
    formatearFecha(fecha) {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    formatearFechaCompleta(fecha) {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    calcularTiempoEnPlataforma(createdAt) {
        if (!createdAt) return 'No disponible';
        
        const fechaCreacion = new Date(createdAt);
        const hoy = new Date();
        const diferencia = hoy - fechaCreacion;
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        
        if (dias === 0) return 'Hoy';
        if (dias === 1) return 'Ayer';
        if (dias < 30) return `Hace ${dias} días`;
        if (dias < 365) {
            const meses = Math.floor(dias / 30);
            return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
        }
        
        const años = Math.floor(dias / 365);
        return `Hace ${años} ${años === 1 ? 'año' : 'años'}`;
    },
    
    // ======================
    // FUNCIÓN PARA OBTENER DATOS COMPLETOS DEL USUARIO
    // ======================
    async obtenerDatosUsuarioCompletos(userId) {
        console.log('🔍 Obteniendo datos COMPLETOS del usuario ID:', userId);
        
        // PRIMERO: Intentar con la función RPC actualizada
        try {
            console.log('🔄 Intentando obtener datos con RPC get_public_user_data...');
            const { data: rpcData, error: rpcError } = await window.supabase.rpc(
                'get_public_user_data',
                { user_uuid: userId }
            );
            
            if (!rpcError && rpcData && rpcData.length > 0) {
                console.log('✅ Datos completos obtenidos via RPC:', rpcData[0]);
                
                // Guardar en localStorage para uso futuro
                try {
                    localStorage.setItem(`user_complete_${userId}`, JSON.stringify(rpcData[0]));
                    localStorage.setItem(`user_${userId}`, JSON.stringify({
                        nombre: rpcData[0].nombre,
                        apellidos: rpcData[0].apellidos,
                        avatar_url: rpcData[0].avatar_url,
                        email: rpcData[0].email,
                        pais: rpcData[0].pais,
                        ciudad: rpcData[0].ciudad,
                        biografia: rpcData[0].biografia
                    }));
                } catch (e) {
                    console.log('⚠️ No se pudo guardar en localStorage');
                }
                
                return rpcData[0];
            } else if (rpcError) {
                console.log('⚠️ Función RPC no disponible:', rpcError.message);
            }
        } catch (rpcError) {
            console.log('⚠️ Error en RPC:', rpcError.message);
        }
        
        // SEGUNDO: Si RPC falla, verificar datos locales
        try {
            const storedKey = `user_complete_${userId}`;
            const storedData = localStorage.getItem(storedKey);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                console.log('✅ Datos obtenidos de localStorage:', parsed);
                return parsed;
            }
        } catch (error) {
            console.log('⚠️ Error obteniendo de localStorage:', error.message);
        }
        
        // TERCERO: Intentar obtener datos básicos (fallback)
        try {
            const { data, error } = await window.supabase
                .from('usuarios')
                .select('nombre, apellidos, avatar_url, email, pais, ciudad, biografia, perfil_publico, fecha_nacimiento, genero, tipo_cuenta, puntos, created_at, mostrar_en_linea')
                .eq('id', userId)
                .maybeSingle();
            
            if (!error && data) {
                console.log('✅ Datos básicos obtenidos directamente:', data);
                return data;
            }
        } catch (error) {
            console.log('⚠️ Error en consulta directa:', error.message);
        }
        
        // CUARTO: Datos por defecto
        console.log('⚠️ Usando datos por defecto');
        return {
            nombre: `Usuario_${userId.substring(0, 8)}`,
            avatar_url: null,
            email: null,
            perfil_publico: false
        };
    },
    
    // ======================
    // FUNCIÓN ORIGINAL PARA OBTENER DATOS BÁSICOS DEL USUARIO
    // ======================
    async obtenerDatosUsuario(userId) {
        console.log('🔍 Obteniendo datos básicos del usuario ID:', userId);
        
        try {
            const { data: rpcData, error: rpcError } = await window.supabase.rpc(
                'get_public_user_data',
                { user_uuid: userId }
            );
            
            if (!rpcError && rpcData && rpcData.length > 0) {
                const datos = rpcData[0];
                return {
                    nombre: datos.nombre,
                    apellidos: datos.apellidos,
                    avatar_url: datos.avatar_url,
                    email: datos.email,
                    pais: datos.pais,
                    ciudad: datos.ciudad,
                    biografia: datos.biografia,
                    perfil_publico: datos.perfil_publico
                };
            }
        } catch (error) {
            console.log('⚠️ Error en RPC:', error.message);
        }
        
        // Fallback a datos locales
        try {
            const storedKey = `user_${userId}`;
            const storedData = localStorage.getItem(storedKey);
            if (storedData) return JSON.parse(storedData);
        } catch (error) {
            console.log('⚠️ Error obteniendo de localStorage:', error.message);
        }
        
        return {
            nombre: `Usuario_${userId.substring(0, 8)}`,
            avatar_url: null,
            email: null
        };
    },

    // Función para mostrar error de perfil
    mostrarErrorPerfil(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar perfil',
            text: mensaje,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#667eea'
        });
    },

    // Función para mostrar perfil privado
    mostrarMensajePerfilPrivado() {
        Swal.fire({
            icon: 'info',
            title: 'Perfil Privado',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 60px; color: #667eea; margin-bottom: 20px;">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">Este perfil es privado</h3>
                    <p style="color: #7e8c9a; margin-bottom: 25px;">
                        El usuario ha configurado su perfil como privado.<br>
                        Solo amigos pueden ver esta información.
                    </p>
                    <button onclick="window.location.href='registro.html'" 
                            style="padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                   color: white; border: none; border-radius: 10px; cursor: pointer; 
                                   font-weight: 600; font-size: 15px; transition: transform 0.3s ease;"
                            onmouseover="this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.transform='translateY(0)'">
                        <i class="fas fa-user-plus"></i> Registrarse en Messery
                    </button>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            width: 500
        });
    },

    async cargarAmigos() {
        try {
            const { data: amistades, error } = await window.supabase
                .from('amistades')
                .select(`
                    id,
                    usuario_id,
                    amigo_id,
                    estado,
                    usuario:usuarios!amistades_usuario_id_fkey(id, nombre, apellidos, email, ciudad, pais, avatar_url),
                    amigo:usuarios!amistades_amigo_id_fkey(id, nombre, apellidos, email, ciudad, pais, avatar_url)
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

    // Función para mostrar perfil del amigo (ACTUALIZADA CON NUEVO DISEÑO)
    async mostrarPerfilAmigo(amigoId) {
        // Mostrar loader personalizado
        const loaderHTML = `
            <div style="
                text-align: center; 
                padding: 40px 20px; 
                background: white; 
                border-radius: 15px; 
                border: 2px solid #667eea;
                box-shadow: 0 5px 30px rgba(102, 126, 234, 0.15);
                max-width: 500px;
                margin: 0 auto;
            ">
                <div style="
                    width: 80px; 
                    height: 80px; 
                    margin: 0 auto 25px; 
                    border-radius: 50%; 
                    border: 4px solid #f0f0f0; 
                    border-top: 4px solid #764ba2; 
                    animation: spin 1s linear infinite;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <i class="fas fa-user" style="font-size: 30px; color: #764ba2;"></i>
                </div>
                
                <h3 style="
                    color: #764ba2; 
                    font-size: 24px; 
                    margin-bottom: 15px; 
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <i class="fas fa-user-circle"></i>
                    Cargando perfil completo...
                </h3>
                
                <p style="color: #5d6d7e; margin-bottom: 20px;">
                    Obteniendo todos los datos públicos del usuario
                </p>
                
                <div style="
                    margin: 25px 0 15px 0; 
                    height: 6px; 
                    background: #f0f0f0; 
                    border-radius: 3px; 
                    overflow: hidden;
                ">
                    <div id="profileLoaderBar" style="
                        height: 100%; 
                        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); 
                        width: 30%; 
                        border-radius: 3px;
                        animation: loadingBar 2s ease-in-out infinite;
                    "></div>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
                    <div style="text-align: center; min-width: 100px;">
                        <div style="
                            width: 12px; 
                            height: 12px; 
                            background: #667eea; 
                            border-radius: 50%; 
                            margin: 0 auto 8px;
                            animation: pulse 1.5s infinite;
                        "></div>
                        <span style="color: #2c3e50; font-size: 12px; font-weight: 500;">Datos personales</span>
                    </div>
                    
                    <div style="text-align: center; min-width: 100px;">
                        <div style="
                            width: 12px; 
                            height: 12px; 
                            background: #764ba2; 
                            border-radius: 50%; 
                            margin: 0 auto 8px;
                            animation: pulse 1.5s infinite 0.3s;
                        "></div>
                        <span style="color: #2c3e50; font-size: 12px; font-weight: 500;">Información</span>
                    </div>
                    
                    <div style="text-align: center; min-width: 100px;">
                        <div style="
                            width: 12px; 
                            height: 12px; 
                            background: #9f7aea; 
                            border-radius: 50%; 
                            margin: 0 auto 8px;
                            animation: pulse 1.5s infinite 0.6s;
                        "></div>
                        <span style="color: #2c3e50; font-size: 12px; font-weight: 500;">Estadísticas</span>
                    </div>
                </div>
                
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @keyframes loadingBar {
                        0% { width: 30%; transform: translateX(-100%); }
                        50% { width: 60%; }
                        100% { width: 30%; transform: translateX(250%); }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(0.9); }
                    }
                </style>
            </div>
        `;
        
        Swal.fire({
            html: loaderHTML,
            showConfirmButton: false,
            showCloseButton: true,
            width: '600px',
            backdrop: 'rgba(0,0,0,0.4)',
            customClass: {
                popup: 'profile-loader-popup'
            },
            didOpen: () => {
                const loaderBar = document.getElementById('profileLoaderBar');
                if (loaderBar) {
                    loaderBar.style.animation = 'loadingBar 2s ease-in-out infinite';
                }
            }
        });
        
        try {
            console.log('🔍 Cargando perfil completo del usuario ID:', amigoId);
            
            // Obtener datos COMPLETOS del usuario usando la nueva función
            const usuario = await this.obtenerDatosUsuarioCompletos(amigoId);
            console.log('✅ Datos completos obtenidos:', usuario);
            
            // Verificar si el perfil es público
            if (usuario.perfil_publico === false) {
                Swal.close();
                this.mostrarMensajePerfilPrivado();
                return;
            }
            
            // Si no hay datos suficientes, mostrar error
            if (!usuario || (!usuario.nombre && !usuario.email)) {
                Swal.close();
                this.mostrarErrorPerfil('No se pudieron cargar los datos del perfil');
                return;
            }
            
            // Generar HTML del perfil con TODOS los datos
            const perfilHTML = this.generarHTMLPerfilCompleto(usuario, amigoId);
            
            // Cerrar loader y mostrar perfil
            Swal.close();
            
            Swal.fire({
                html: perfilHTML,
                showCloseButton: true,
                showConfirmButton: false,
                width: '750px',
                customClass: {
                    popup: 'profile-complete-modal'
                },
                background: 'white',
                didOpen: () => {
                    // Agregar estilos adicionales
                    const popup = document.querySelector('.profile-complete-modal .swal2-popup');
                    if (popup) {
                        popup.style.border = '2px solid #764ba2';
                        popup.style.borderRadius = '15px';
                        popup.style.overflow = 'hidden';
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error al cargar perfil completo:', error);
            Swal.close();
            this.mostrarErrorPerfil('Error inesperado: ' + error.message);
        }
    },

   // ======================
// FUNCIÓN PARA GENERAR HTML DEL PERFIL COMPLETO
// ======================
generarHTMLPerfilCompleto(usuario, amigoId) {
    // Datos básicos
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() || 
                          (usuario.email ? usuario.email.split('@')[0] : 'Usuario Messery');
    const email = usuario.email || 'No especificado';
    const ubicacion = this.formatearUbicacion(usuario.ciudad, usuario.pais);
    const edad = usuario.fecha_nacimiento ? this.calcularEdad(usuario.fecha_nacimiento) : 'No especificada';
    const fechaNacimiento = usuario.fecha_nacimiento ? this.formatearFecha(usuario.fecha_nacimiento) : 'No especificada';
    const genero = usuario.genero || 'No especificado';
    const tipoCuenta = usuario.tipo_cuenta === 'personal' ? 'Personal' : 
                      usuario.tipo_cuenta === 'empresa' ? 'Empresa' : 
                      usuario.tipo_cuenta || 'No especificado';
    
    // Estadísticas
    const puntos = usuario.puntos || 0;
    const fechaRegistro = usuario.created_at ? this.formatearFechaCompleta(usuario.created_at) : 'No disponible';
    const tiempoEnPlataforma = usuario.created_at ? this.calcularTiempoEnPlataforma(usuario.created_at) : 'No disponible';
    const estadoEnLinea = usuario.mostrar_en_linea ? 'En línea' : 'Desconectado';
    
    // Obtener estadísticas adicionales del amigo
    let estadisticasAmigo = '';
    try {
        const amigo = window.listaAmigos?.find(a => a.id === amigoId);
        if (amigo) {
            estadisticasAmigo = `
                <div class="amistad-badge" style="
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                    padding: 15px;
                    border-radius: 10px;
                    color: white;
                    margin: 0 20px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <div>
                        <div style="font-size: 12px; opacity: 0.9;">Estado de amistad</div>
                        <div style="font-size: 18px; font-weight: 600;">Amigos</div>
                    </div>
                    <div style="font-size: 24px;">
                        <i class="fas fa-user-friends"></i>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.log('No se pudieron obtener estadísticas adicionales del amigo');
    }
    
    // Función para manejar el envío de mensaje
    const manejarEnvioMensaje = () => {
        // Primero cerramos el modal del perfil
        if (typeof Swal !== 'undefined') {
            Swal.close();
        }
        
        // Esperamos un momento para que se cierre el modal
        setTimeout(() => {
            // Llamamos a la función para abrir el modal de mensaje
            if (typeof enviarMensajeUsuarioPremium === 'function') {
                enviarMensajeUsuarioPremium(email, usuario.nombre || '');
            } else {
                console.error('La función enviarMensajeUsuarioPremium no está definida');
                // Fallback: mostrar un mensaje simple
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Enviar mensaje',
                        text: `Enviar mensaje a ${usuario.nombre || nombreCompleto}`,
                        icon: 'info'
                    });
                }
            }
        }, 300);
    };
    
    // HTML del perfil
    return `
        <div class="perfil-completo-container">
            <!-- HEADER DEL PERFIL -->
            <div class="perfil-header" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 20px 35px;
                border-radius: 15px 15px 0 0;
                color: white;
                text-align: center;
                margin-bottom: 30px;
                position: relative;
                min-height: 240px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            ">
                <!-- Avatar -->
                <div class="perfil-avatar-grande" onclick="window.Amigos.ampliarAvatar('${usuario.avatar_url}', '${nombreCompleto}')" 
                     style="
                        width: 120px;
                        height: 120px;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        border: 5px solid rgba(255,255,255,0.3);
                        overflow: hidden;
                        cursor: pointer;
                        background: ${this.obtenerColorAvatar(nombreCompleto)};
                        flex-shrink: 0;
                     ">
                    ${usuario.avatar_url ? 
                        `<img src="${usuario.avatar_url}" 
                              alt="${nombreCompleto}" 
                              style="width: 100%; height: 100%; object-fit: cover;"
                              onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color: white; font-size: 48px; display: flex; align-items: center; justify-content: center; height: 100%; font-weight: bold;\\'>${this.obtenerIniciales(nombreCompleto)}</div>';">
                        ` :
                        `<div style="color: white; font-size: 48px; display: flex; align-items: center; justify-content: center; height: 100%; font-weight: bold;">
                            ${this.obtenerIniciales(nombreCompleto)}
                        </div>`
                    }
                </div>
                
                <!-- Nombre y título -->
                <div style="flex-grow: 1; padding: 0 10px;">
                    <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; line-height: 1.3;">${nombreCompleto}</h2>
                    <p style="margin: 0 0 20px 0; opacity: 0.9; font-size: 15px;">
                        <i class="fas fa-user-check" style="margin-right: 8px;"></i>
                        Perfil público verificado
                    </p>
                </div>
                
                <!-- Estadísticas rápidas -->
                <div style="display: flex; justify-content: center; gap: 25px; margin-top: 25px; flex-wrap: wrap; padding: 0 10px;">
                    <div style="text-align: center; min-width: 70px;">
                        <div style="font-size: 26px; font-weight: 700; margin-bottom: 5px;">${puntos}</div>
                        <div style="font-size: 13px; opacity: 0.9; display: flex; align-items: center; justify-content: center; gap: 5px;">
                            <i class="fas fa-star" style="font-size: 11px;"></i>
                            Puntos
                        </div>
                    </div>
                    
                    <div style="text-align: center; min-width: 70px;">
                        <div style="font-size: 26px; font-weight: 700; margin-bottom: 5px;">
                            <i class="fas fa-circle" style="color: ${estadoEnLinea === 'En línea' ? '#43e97b' : '#e74c3c'}; font-size: 22px;"></i>
                        </div>
                        <div style="font-size: 13px; opacity: 0.9;">${estadoEnLinea}</div>
                    </div>
                    
                    <div style="text-align: center; min-width: 70px;">
                        <div style="font-size: 26px; font-weight: 700; margin-bottom: 5px;">
                            <i class="fas fa-${tipoCuenta === 'Empresa' ? 'building' : 'user'}" style="font-size: 22px;"></i>
                        </div>
                        <div style="font-size: 13px; opacity: 0.9;">${tipoCuenta}</div>
                    </div>
                </div>
            </div>
            
            ${estadisticasAmigo}
            
            <!-- SECCIÓN DE INFORMACIÓN PERSONAL -->
            <div class="perfil-seccion" style="padding: 0 20px 20px;">
                <h3 style="color: #764ba2; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-id-card"></i>
                    Información Personal
                </h3>
                
                <div class="info-grid" style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                    <!-- Email -->
                    <div class="info-item" style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 10px;
                        border-left: 4px solid #667eea;
                    ">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-envelope" style="color: #667eea; margin-right: 10px; font-size: 16px;"></i>
                            <strong style="color: #2c3e50; font-size: 14px;">Email</strong>
                        </div>
                        <div style="color: #5d6d7e; font-size: 14px; word-break: break-all;">${email}</div>
                    </div>
                    
                    <!-- Ubicación -->
                    <div class="info-item" style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 10px;
                        border-left: 4px solid #9f7aea;
                    ">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-map-marker-alt" style="color: #9f7aea; margin-right: 10px; font-size: 16px;"></i>
                            <strong style="color: #2c3e50; font-size: 14px;">Ubicación</strong>
                        </div>
                        <div style="color: #5d6d7e; font-size: 14px;">${ubicacion}</div>
                    </div>
                    
                    <!-- Edad y Fecha de Nacimiento -->
                    <div class="info-item" style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 10px;
                        border-left: 4px solid #f093fb;
                    ">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-birthday-cake" style="color: #f093fb; margin-right: 10px; font-size: 16px;"></i>
                            <strong style="color: #2c3e50; font-size: 14px;">Edad / Fecha de Nacimiento</strong>
                        </div>
                        <div style="color: #5d6d7e; font-size: 14px;">
                            ${edad} (${fechaNacimiento})
                        </div>
                    </div>
                    
                    <!-- Género -->
                    <div class="info-item" style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 10px;
                        border-left: 4px solid #4facfe;
                    ">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <i class="fas fa-venus-mars" style="color: #4facfe; margin-right: 10px; font-size: 16px;"></i>
                            <strong style="color: #2c3e50; font-size: 14px;">Género</strong>
                        </div>
                        <div style="color: #5d6d7e; font-size: 14px;">${genero}</div>
                    </div>
                </div>
            </div>
            
            <!-- SECCIÓN DE INFORMACIÓN DE LA CUENTA -->
            <div class="perfil-seccion" style="padding: 0 20px 20px;">
                <h3 style="color: #764ba2; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-user-cog"></i>
                    Información de la Cuenta
                </h3>
                
                <div class="account-info-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <!-- Tipo de Cuenta -->
                    <div class="account-item" style="
                        background: #fff;
                        padding: 15px 10px;
                        border-radius: 10px;
                        border: 2px solid #e8edf2;
                        text-align: center;
                    ">
                        <div style="margin-bottom: 10px;">
                            <i class="fas fa-${tipoCuenta === 'Empresa' ? 'building' : 'user'}" 
                               style="font-size: 26px; color: #667eea;"></i>
                        </div>
                        <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px; font-size: 13px;">Tipo de Cuenta</div>
                        <div style="color: #5d6d7e; font-size: 13px;">${tipoCuenta}</div>
                    </div>
                    
                    <!-- Fecha de Registro -->
                    <div class="account-item" style="
                        background: #fff;
                        padding: 15px 10px;
                        border-radius: 10px;
                        border: 2px solid #e8edf2;
                        text-align: center;
                    ">
                        <div style="margin-bottom: 10px;">
                            <i class="fas fa-calendar-plus" style="font-size: 26px; color: #764ba2;"></i>
                        </div>
                        <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px; font-size: 13px;">Fecha de Registro</div>
                        <div style="color: #5d6d7e; font-size: 13px;">${fechaRegistro}</div>
                    </div>
                    
                    <!-- Tiempo en Plataforma -->
                    <div class="account-item" style="
                        background: #fff;
                        padding: 15px 10px;
                        border-radius: 10px;
                        border: 2px solid #e8edf2;
                        text-align: center;
                    ">
                        <div style="margin-bottom: 10px;">
                            <i class="fas fa-clock" style="font-size: 26px; color: #9f7aea;"></i>
                        </div>
                        <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px; font-size: 13px;">Tiempo en Messery</div>
                        <div style="color: #5d6d7e; font-size: 13px;">${tiempoEnPlataforma}</div>
                    </div>
                    
                    <!-- Estado -->
                    <div class="account-item" style="
                        background: #fff;
                        padding: 15px 10px;
                        border-radius: 10px;
                        border: 2px solid #e8edf2;
                        text-align: center;
                    ">
                        <div style="margin-bottom: 10px;">
                            <i class="fas fa-circle" style="font-size: 26px; color: ${estadoEnLinea === 'En línea' ? '#43e97b' : '#e74c3c'};"></i>
                        </div>
                        <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px; font-size: 13px;">Estado</div>
                        <div style="color: #5d6d7e; font-size: 13px;">${estadoEnLinea}</div>
                    </div>
                </div>
            </div>
            
            <!-- SECCIÓN DE BIOGRAFÍA -->
            ${usuario.biografia ? `
            <div class="perfil-seccion" style="padding: 0 20px 20px;">
                <h3 style="color: #764ba2; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-quote-left"></i>
                    Biografía
                </h3>
                <div style="
                    background: linear-gradient(135deg, #f8f9fa 0%, #e8edf2 100%);
                    padding: 18px;
                    border-radius: 10px;
                    border-left: 4px solid #764ba2;
                    font-style: italic;
                    color: #5d6d7e;
                    line-height: 1.5;
                    font-size: 15px;
                ">
                    <i class="fas fa-quote-right" style="float: right; color: #667eea; font-size: 18px; opacity: 0.5;"></i>
                    ${usuario.biografia}
                </div>
            </div>
            ` : ''}
            
            <!-- SECCIÓN DE PUNTOS Y LOGROS -->
            <div class="perfil-seccion" style="padding: 0 20px 20px;">
                <h3 style="color: #764ba2; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-trophy"></i>
                    Puntos y Participación
                </h3>
                <div style="
                    background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
                    padding: 20px;
                    border-radius: 10px;
                    border: 2px solid #e8edf2;
                    text-align: center;
                ">
                    <div style="font-size: 40px; font-weight: 700; color: #764ba2; margin-bottom: 10px;">
                        ${puntos}
                    </div>
                    <div style="color: #5d6d7e; margin-bottom: 20px; font-size: 14px;">
                        Puntos acumulados en Messery
                    </div>
                    
                    ${puntos > 0 ? `
                    <div style="
                        width: 100%;
                        height: 16px;
                        background: #e8edf2;
                        border-radius: 8px;
                        overflow: hidden;
                        margin-bottom: 15px;
                    ">
                        <div style="
                            height: 100%;
                            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                            width: ${Math.min(puntos / 1000 * 100, 100)}%;
                            border-radius: 8px;
                            transition: width 1s ease;
                        "></div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #7f8c8d;">
                        <span>Nuevo</span>
                        <span>Activo</span>
                        <span>Experto</span>
                        <span>Líder</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- ACCIONES ESPECÍFICAS PARA AMIGOS -->
            <div class="perfil-acciones" style="
                padding: 25px 20px 20px;
                border-top: 2px solid #e8edf2;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                justify-content: center;
            ">
                <button onclick="(function() { 
                    const modal = Swal.getPopup();
                    if (modal) {
                        Swal.close();
                        setTimeout(() => {
                            if (typeof enviarMensajeUsuarioPremium === 'function') {
                                enviarMensajeUsuarioPremium('${email}', '${usuario.nombre || ''}');
                            }
                        }, 300);
                    }
                })()" 
                        style="
                            padding: 12px 20px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            transition: transform 0.3s ease;
                            font-size: 14px;
                            flex: 1;
                            min-width: 150px;
                            justify-content: center;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'">
                    <i class="fas fa-paper-plane"></i>
                    Enviar mensaje
                </button>
                
                <button onclick="window.Amigos.verPublicacionesAmigo('${amigoId}')"
                        style="
                            padding: 12px 20px;
                            background: #4facfe;
                            color: white;
                            border: none;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            transition: transform 0.3s ease;
                            font-size: 14px;
                            flex: 1;
                            min-width: 150px;
                            justify-content: center;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'">
                    <i class="fas fa-newspaper"></i>
                    Ver publicaciones
                </button>
            </div>
            
            <!-- FOOTER -->
            <div style="
                text-align: center;
                padding: 20px;
                color: #7f8c8d;
                font-size: 11px;
                border-top: 1px solid #e8edf2;
                margin-top: 20px;
            ">
                <p>
                    <i class="fas fa-shield-alt" style="color: #667eea; margin-right: 5px; font-size: 12px;"></i>
                    Perfil verificado y seguro • Todos los datos son públicos y verificados
                </p>
            </div>
        </div>
        
        <style>
            .perfil-completo-container {
                max-height: 80vh;
                overflow-y: auto;
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }
            
            .perfil-completo-container::-webkit-scrollbar {
                display: none; /* Chrome, Safari and Opera */
            }
            
            /* Media queries para responsive */
            @media (min-width: 768px) {
                .info-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
                
                .account-info-grid {
                    grid-template-columns: repeat(4, 1fr) !important;
                }
                
                .perfil-avatar-grande {
                    width: 140px !important;
                    height: 140px !important;
                }
                
                h2 {
                    font-size: 28px !important;
                }
                
                .perfil-acciones button {
                    flex: none !important;
                    min-width: auto !important;
                }
            }
            
            @media (max-width: 480px) {
                .perfil-header {
                    padding: 30px 15px 25px !important;
                    min-height: 200px !important;
                }
                
                .perfil-avatar-grande {
                    width: 100px !important;
                    height: 100px !important;
                }
                
                h2 {
                    font-size: 20px !important;
                }
                
                .account-info-grid {
                    grid-template-columns: 1fr !important;
                }
            }
        </style>
    `;
},




    // Función para ampliar avatar
    ampliarAvatar(avatarUrl, nombre) {
        if (!avatarUrl) return;
        
        Swal.fire({
            html: `
                <div style="text-align: center;">
                    <img src="${avatarUrl}" 
                         alt="${nombre}" 
                         style="max-width: 100%; max-height: 70vh; border-radius: 10px;"
                         onerror="this.src='https://via.placeholder.com/400x400?text=Avatar+no+disponible'">
                    <div style="margin-top: 15px; color: #2c3e50; font-weight: 600;">${nombre}</div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            width: 500,
            background: '#f8f9fa'
        });
    },

    // Función para compartir perfil
    compartirPerfil(nombreCompleto, ubicacion) {
        const mensaje = `¡Mira el perfil de ${nombreCompleto} en Messery! ${ubicacion ? `Ubicación: ${ubicacion}` : ''}`;
        const urlCompartir = window.location.href;
        
        Swal.fire({
            title: '📤 Compartir Perfil',
            html: `
                <div style="text-align: center;">
                    <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                        <p style="color: #5d6d7e; margin: 0;">
                            Compartir perfil de <strong>${nombreCompleto}</strong>
                        </p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                        <button onclick="window.Amigos.compartirEnRed('whatsapp', '${encodeURIComponent(mensaje + '\\n\\n' + urlCompartir)}')"
                                style="padding: 12px; background: #25D366; color: white; border: none; 
                                       border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                       justify-content: center; gap: 8px; font-weight: 600;">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        
                        <button onclick="window.Amigos.compartirEnRed('copiar', '${encodeURIComponent(mensaje + '\\n\\n' + urlCompartir)}')"
                                style="padding: 12px; background: #667eea; color: white; border: none; 
                                       border-radius: 8px; cursor: pointer; display: flex; align-items: center; 
                                       justify-content: center; gap: 8px; font-weight: 600;">
                            <i class="fas fa-copy"></i> Copiar enlace
                        </button>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            width: 400
        });
    },

    // Función para ver publicaciones del amigo
async verPublicacionesAmigo(amigoId) {
    try {
        // Obtener datos del amigo
        const { data: amigo } = await window.supabase
            .from('usuarios')
            .select('nombre, apellidos, avatar_url')
            .eq('id', amigoId)
            .single();
        
        const nombreAmigo = amigo ? `${amigo.nombre} ${amigo.apellidos}` : 'Amigo';
        const avatarAmigo = amigo?.avatar_url || '';
        
        // Función auxiliar para obtener publicaciones según tipo
        const obtenerPublicacionesPorTipo = async (tipo) => {
            const { data } = await window.supabase
                .from('publicaciones')
                .select(`
                    id, 
                    contenido, 
                    tipo, 
                    url_media,
                    visibilidad,
                    fecha_creacion, 
                    likes_count, 
                    comentarios_count,
                    usuario:usuarios(id, nombre, apellidos, avatar_url)
                `)
                .eq('usuario_id', amigoId)
                .eq('tipo', tipo)
                .order('fecha_creacion', { ascending: false })
                .limit(15);
            return data || [];
        };
        
        // Obtener todas las publicaciones por tipo
        const [textoPublicaciones, imagenPublicaciones, videoPublicaciones, enlacePublicaciones] = 
            await Promise.all([
                obtenerPublicacionesPorTipo('texto'),
                obtenerPublicacionesPorTipo('imagen'),
                obtenerPublicacionesPorTipo('video'),
                obtenerPublicacionesPorTipo('enlace')
            ]);
        
        const todasPublicaciones = [
            ...textoPublicaciones,
            ...imagenPublicaciones,
            ...videoPublicaciones,
            ...enlacePublicaciones
        ];
        
        if (todasPublicaciones.length === 0) {
            Swal.fire({
                title: '📝 Publicaciones de ' + nombreAmigo,
                html: `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 80px; color: #e8edf2; margin-bottom: 20px;">
                            <i class="fas fa-newspaper"></i>
                        </div>
                        <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 22px;">
                            ${nombreAmigo} no tiene publicaciones
                        </h4>
                        <p style="color: #7e8c9a; font-size: 15px;">
                            Este usuario aún no ha compartido publicaciones
                        </p>
                    </div>
                `,
                showConfirmButton: false,
                showCloseButton: true,
                width: 500
            });
            return;
        }
        
        // Contadores por tipo
        const contadorTexto = textoPublicaciones.length;
        const contadorImagen = imagenPublicaciones.length;
        const contadorVideo = videoPublicaciones.length;
        const contadorEnlace = enlacePublicaciones.length;
        
        // Crear HTML con pestañas mejoradas
        const html = `
            <div style="
                -ms-overflow-style: none;
                scrollbar-width: none;
                width: 100%;
            ">
                <!-- Header mejorado -->
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 12px 12px 0 0;
                    margin-bottom: 25px;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
                ">
                    <div style="
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        border: 4px solid rgba(255,255,255,0.4);
                        overflow: hidden;
                        background: white;
                        margin: 0 auto 20px;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    ">
                        ${avatarAmigo ? 
                            `<img src="${avatarAmigo}" style="width: 100%; height: 100%; object-fit: cover;">` :
                            `<div style="
                                width: 100%;
                                height: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                font-weight: bold;
                                font-size: 32px;
                            ">${amigo?.nombre?.charAt(0) || 'A'}</div>`
                        }
                    </div>
                    <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">
                        <i class="fas fa-newspaper"></i> Publicaciones de ${nombreAmigo}
                    </h3>
                    <p style="margin: 0; opacity: 0.9; font-size: 15px; font-weight: 500;">
                        ${todasPublicaciones.length} publicaciones encontradas
                    </p>
                </div>
                
                <!-- Pestañas de clasificación mejoradas -->
                <div style="
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 25px;
                    padding: 0 20px;
                    flex-wrap: wrap;
                ">
                    <button id="btnTexto" 
                            style="
                                background: white;
                                color: #667eea;
                                border: 2px solid #667eea;
                                padding: 12px 25px;
                                border-radius: 30px;
                                cursor: pointer;
                                font-weight: 700;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                transition: all 0.3s ease;
                                position: relative;
                                min-width: 140px;
                                justify-content: center;
                            "
                            onmouseover="this.style.backgroundColor='#667eea'; this.style.color='white'"
                            onmouseout="this.style.backgroundColor='white'; this.style.color='#667eea'">
                        <i class="fas fa-font"></i> Texto
                        <span id="badgeTexto" style="
                            position: absolute;
                            top: -8px;
                            right: -8px;
                            background: #e74c3c;
                            color: white;
                            border-radius: 50%;
                            width: 28px;
                            height: 28px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            font-weight: 700;
                            box-shadow: 0 2px 5px rgba(231, 76, 60, 0.3);
                        ">${contadorTexto}</span>
                    </button>
                    
                    <button id="btnImagen" 
                            style="
                                background: white;
                                color: #667eea;
                                border: 2px solid #667eea;
                                padding: 12px 25px;
                                border-radius: 30px;
                                cursor: pointer;
                                font-weight: 700;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                transition: all 0.3s ease;
                                position: relative;
                                min-width: 140px;
                                justify-content: center;
                            "
                            onmouseover="this.style.backgroundColor='#667eea'; this.style.color='white'"
                            onmouseout="this.style.backgroundColor='white'; this.style.color='#667eea'">
                        <i class="fas fa-image"></i> Imágenes
                        <span id="badgeImagen" style="
                            position: absolute;
                            top: -8px;
                            right: -8px;
                            background: #e74c3c;
                            color: white;
                            border-radius: 50%;
                            width: 28px;
                            height: 28px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            font-weight: 700;
                            box-shadow: 0 2px 5px rgba(231, 76, 60, 0.3);
                        ">${contadorImagen}</span>
                    </button>
                    
                    <button id="btnVideo" 
                            style="
                                background: white;
                                color: #667eea;
                                border: 2px solid #667eea;
                                padding: 12px 25px;
                                border-radius: 30px;
                                cursor: pointer;
                                font-weight: 700;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                transition: all 0.3s ease;
                                position: relative;
                                min-width: 140px;
                                justify-content: center;
                            "
                            onmouseover="this.style.backgroundColor='#667eea'; this.style.color='white'"
                            onmouseout="this.style.backgroundColor='white'; this.style.color='#667eea'">
                        <i class="fas fa-video"></i> Videos
                        <span id="badgeVideo" style="
                            position: absolute;
                            top: -8px;
                            right: -8px;
                            background: #e74c3c;
                            color: white;
                            border-radius: 50%;
                            width: 28px;
                            height: 28px;
                            display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 12px;
                                font-weight: 700;
                                box-shadow: 0 2px 5px rgba(231, 76, 60, 0.3);
                        ">${contadorVideo}</span>
                    </button>
                    
                    <button id="btnEnlace" 
                            style="
                                background: white;
                                color: #667eea;
                                border: 2px solid #667eea;
                                padding: 12px 25px;
                                border-radius: 30px;
                                cursor: pointer;
                                font-weight: 700;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                transition: all 0.3s ease;
                                position: relative;
                                min-width: 140px;
                                justify-content: center;
                            "
                            onmouseover="this.style.backgroundColor='#667eea'; this.style.color='white'"
                            onmouseout="this.style.backgroundColor='white'; this.style.color='#667eea'">
                        <i class="fas fa-link"></i> Enlaces
                        <span id="badgeEnlace" style="
                            position: absolute;
                            top: -8px;
                            right: -8px;
                            background: #e74c3c;
                            color: white;
                            border-radius: 50%;
                            width: 28px;
                            height: 28px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            font-weight: 700;
                            box-shadow: 0 2px 5px rgba(231, 76, 60, 0.3);
                        ">${contadorEnlace}</span>
                    </button>
                </div>
                
                <!-- Contenedor de publicaciones mejorado -->
                <div id="contenedorPublicaciones" style="
                    padding: 0 20px 25px;
                    height: 450px;
                    overflow-y: auto;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                ">
                    ${textoPublicaciones.length > 0 ? 
                        this.renderizarPublicacionesPorTipo(textoPublicaciones) :
                        `<div style="text-align: center; padding: 50px; color: #7e8c9a;">
                            <i class="fas fa-font" style="font-size: 60px; margin-bottom: 15px; opacity: 0.3;"></i>
                            <h4 style="color: #95a5a6; margin-bottom: 10px; font-size: 18px;">No hay publicaciones de texto</h4>
                            <p style="font-size: 14px;">${nombreAmigo} no ha publicado contenido de texto aún</p>
                        </div>`
                    }
                </div>
            </div>
            
            <style>
                #contenedorPublicaciones::-webkit-scrollbar {
                    display: none;
                }
                
                .btn-activo {
                    background: #667eea !important;
                    color: white !important;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
                    transform: translateY(-2px);
                }
                
                .publicacion-contenedor {
                    background: white;
                    border: 2px solid #e8edf2;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.05);
                }
                
                .publicacion-contenedor:hover {
                    border-color: #667eea;
                    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.15);
                    transform: translateY(-2px);
                }
            </style>
        `;
        
        // Guardar referencia al modal principal
        this.modalPublicaciones = Swal.fire({
            title: '',
            html: html,
            showCloseButton: true,
            showConfirmButton: false,
            width: 700,
            heightAuto: false,
            background: '#f8f9fa',
            customClass: {
                container: 'modal-sin-scrollbar',
                popup: 'modal-grande-publicaciones'
            },
            allowOutsideClick: false, // No cerrar al hacer clic fuera
            allowEscapeKey: true, // Permitir cerrar con ESC
            didOpen: () => {
                // Ocultar scrollbar del modal
                const modal = document.querySelector('.swal2-popup');
                if (modal) {
                    modal.style.overflow = 'hidden';
                }
                
                // Almacenar datos globalmente
                window.publicacionesData = {
                    texto: textoPublicaciones,
                    imagen: imagenPublicaciones,
                    video: videoPublicaciones,
                    enlace: enlacePublicaciones
                };
                
                // Marcar botón de texto como activo inicialmente
                this.marcarBotonActivo('btnTexto');
                
                // Configurar event listeners para los botones
                const configurarBoton = (id, tipo) => {
                    const btn = document.getElementById(id);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            this.mostrarPublicacionesPorTipoMejorado(tipo);
                            this.marcarBotonActivo(id);
                        });
                    }
                };
                
                configurarBoton('btnTexto', 'texto');
                configurarBoton('btnImagen', 'imagen');
                configurarBoton('btnVideo', 'video');
                configurarBoton('btnEnlace', 'enlace');
            }
        });
        
    } catch (error) {
        console.error('Error al cargar publicaciones del amigo:', error);
        this.mostrarNotificacion('error', 'No se pudieron cargar las publicaciones');
    }
},

// Función para marcar botón activo
marcarBotonActivo(botonId) {
    // Resetear todos los botones
    ['btnTexto', 'btnImagen', 'btnVideo', 'btnEnlace'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.remove('btn-activo');
            btn.style.backgroundColor = 'white';
            btn.style.color = '#667eea';
            btn.style.borderColor = '#667eea';
            btn.style.transform = 'translateY(0)';
        }
    });
    
    // Activar el botón seleccionado
    const btnActivo = document.getElementById(botonId);
    if (btnActivo) {
        btnActivo.classList.add('btn-activo');
        btnActivo.style.backgroundColor = '#667eea';
        btnActivo.style.color = 'white';
        btnActivo.style.borderColor = '#667eea';
        btnActivo.style.transform = 'translateY(-2px)';
    }
},

// Función mejorada para mostrar publicaciones por tipo
mostrarPublicacionesPorTipoMejorado(tipo) {
    const contenedor = document.getElementById('contenedorPublicaciones');
    
    if (!contenedor || !window.publicacionesData) return;
    
    const publicaciones = window.publicacionesData[tipo] || [];
    
    if (publicaciones.length > 0) {
        contenedor.innerHTML = this.renderizarPublicacionesPorTipo(publicaciones);
    } else {
        const iconos = {
            'texto': 'fas fa-font',
            'imagen': 'fas fa-image',
            'video': 'fas fa-video',
            'enlace': 'fas fa-link'
        };
        
        const nombres = {
            'texto': 'texto',
            'imagen': 'imágenes',
            'video': 'videos',
            'enlace': 'enlaces'
        };
        
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #7e8c9a;">
                <i class="${iconos[tipo] || 'fas fa-newspaper'}" 
                   style="font-size: 60px; margin-bottom: 15px; opacity: 0.3;"></i>
                <h4 style="color: #95a5a6; margin-bottom: 10px; font-size: 18px;">
                    No hay publicaciones de ${nombres[tipo]}
                </h4>
                <p style="font-size: 14px;">No se encontraron publicaciones de este tipo</p>
            </div>
        `;
    }
},

// Función para renderizar publicaciones
renderizarPublicacionesPorTipo(publicaciones) {
    if (!publicaciones || publicaciones.length === 0) {
        return '';
    }
    
    return publicaciones.map(pub => {
        const fecha = new Date(pub.fecha_creacion);
        const tiempoTranscurrido = this.calcularTiempoTranscurrido(pub.fecha_creacion);
        
        // Determinar tipo de contenido multimedia
        let tipoMultimedia = 'archivo';
        if (pub.url_media) {
            const urlLower = pub.url_media.toLowerCase();
            if (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg') || 
                urlLower.endsWith('.png') || urlLower.endsWith('.gif') || 
                urlLower.endsWith('.webp')) {
                tipoMultimedia = 'imagen';
            } else if (urlLower.endsWith('.mp4') || urlLower.endsWith('.avi') || 
                       urlLower.endsWith('.mov') || urlLower.endsWith('.wmv')) {
                tipoMultimedia = 'video';
            } else if (urlLower.endsWith('.mp3') || urlLower.endsWith('.wav') || 
                       urlLower.endsWith('.ogg')) {
                tipoMultimedia = 'audio';
            }
        }
        
        // Determinar visibilidad
        const visibilidadIcono = {
            'publico': 'fas fa-globe-americas',
            'privado': 'fas fa-lock',
            'solo_amigos': 'fas fa-user-friends'
        }[pub.visibilidad] || 'fas fa-question-circle';
        
        const visibilidadTexto = {
            'publico': 'Público',
            'privado': 'Privado',
            'solo_amigos': 'Solo amigos'
        }[pub.visibilidad] || 'Desconocido';
        
        return `
            <div class="publicacion-contenedor" data-publicacion-id="${pub.id}">
                <!-- Encabezado mejorado -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; flex: 1;">
                        <div style="
                            width: 45px;
                            height: 45px;
                            border-radius: 50%;
                            margin-right: 15px;
                            overflow: hidden;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border: 2px solid #e8edf2;
                        ">
                            ${pub.usuario?.avatar_url ? 
                                `<img src="${pub.usuario.avatar_url}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                `<div style="
                                    width: 100%;
                                    height: 100%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: white;
                                    font-weight: bold;
                                    font-size: 18px;
                                ">${pub.usuario?.nombre?.charAt(0) || 'U'}</div>`
                            }
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: #2c3e50; font-size: 16px; margin-bottom: 3px;">
                                ${pub.usuario?.nombre || ''} ${pub.usuario?.apellidos || ''}
                            </div>
                            <div style="font-size: 13px; color: #7e8c9a; display: flex; align-items: center; gap: 10px;">
                                <span><i class="far fa-clock"></i> ${tiempoTranscurrido}</span>
                                <span><i class="${visibilidadIcono}" style="color: #667eea;"></i> ${visibilidadTexto}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botón de denuncia (3 puntos) -->
                    <button onclick="window.Amigos.abrirDenunciaPublicacion('${pub.id}', '${pub.usuario?.id}')"
                            style="
                                background: none;
                                border: none;
                                color: #95a5a6;
                                cursor: pointer;
                                font-size: 18px;
                                padding: 5px;
                                border-radius: 50%;
                                width: 36px;
                                height: 36px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.backgroundColor='#f8f9fa'; this.style.color='#667eea'"
                            onmouseout="this.style.backgroundColor='transparent'; this.style.color='#95a5a6'">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
                
                <!-- Contenido mejorado -->
                <div style="margin-bottom: 20px;">
                    ${pub.contenido ? `
                        <div style="
                            color: #2c3e50;
                            line-height: 1.6;
                            font-size: 15px;
                            margin-bottom: ${pub.url_media ? '20px' : '0'};
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 10px;
                            border-left: 4px solid #667eea;
                        ">${this.escapeHtml(pub.contenido)}</div>
                    ` : ''}
                    
                    <!-- Multimedia mejorado -->
                    ${pub.url_media ? `
                        <div style="border-radius: 12px; overflow: hidden; background: #f8f9fa; margin-top: ${pub.contenido ? '0' : '0'};">
                            ${tipoMultimedia === 'imagen' ? `
                                <div style="position: relative;">
                                    <img src="${pub.url_media}" 
                                         alt="Imagen"
                                         style="
                                            width: 100%;
                                            max-height: 300px;
                                            object-fit: contain;
                                            cursor: pointer;
                                            display: block;
                                         "
                                         onclick="window.Amigos.ampliarImagen('${pub.url_media}')">
                                    <div style="
                                        position: absolute;
                                        bottom: 10px;
                                        right: 10px;
                                        background: rgba(0,0,0,0.6);
                                        color: white;
                                        padding: 5px 10px;
                                        border-radius: 15px;
                                        font-size: 12px;
                                        font-weight: 600;
                                        display: flex;
                                        align-items: center;
                                        gap: 5px;
                                    ">
                                        <i class="fas fa-image"></i> Imagen
                                    </div>
                                </div>
                            ` : tipoMultimedia === 'video' ? `
                                <div style="position: relative;">
                                    <video controls 
                                           style="
                                            width: 100%;
                                            max-height: 300px;
                                            border-radius: 12px;
                                           ">
                                        <source src="${pub.url_media}" type="video/mp4">
                                    </video>
                                    <div style="
                                        position: absolute;
                                        bottom: 10px;
                                        right: 10px;
                                        background: rgba(0,0,0,0.6);
                                        color: white;
                                        padding: 5px 10px;
                                        border-radius: 15px;
                                        font-size: 12px;
                                        font-weight: 600;
                                        display: flex;
                                        align-items: center;
                                        gap: 5px;
                                    ">
                                        <i class="fas fa-video"></i> Video
                                    </div>
                                </div>
                            ` : tipoMultimedia === 'audio' ? `
                                <div style="padding: 20px; text-align: center;">
                                    <div style="font-size: 50px; color: #667eea; margin-bottom: 15px;">
                                        <i class="fas fa-music"></i>
                                    </div>
                                    <audio controls style="width: 100%;">
                                        <source src="${pub.url_media}" type="audio/mpeg">
                                    </audio>
                                </div>
                            ` : `
                                <div style="padding: 25px; text-align: center;">
                                    <div style="font-size: 50px; color: #667eea; margin-bottom: 15px;">
                                        <i class="fas fa-paperclip"></i>
                                    </div>
                                    <a href="${pub.url_media}" 
                                       target="_blank" 
                                       style="
                                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        color: white;
                                        text-decoration: none;
                                        font-weight: 600;
                                        font-size: 14px;
                                        padding: 10px 25px;
                                        border-radius: 25px;
                                        display: inline-flex;
                                        align-items: center;
                                        gap: 10px;
                                        transition: transform 0.3s ease;
                                       "
                                       onmouseover="this.style.transform='translateY(-2px)'"
                                       onmouseout="this.style.transform='translateY(0)'">
                                        <i class="fas fa-external-link-alt"></i>
                                        Ver archivo adjunto
                                    </a>
                                </div>
                            `}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Estadísticas mejoradas -->
                <div style="
                    border-top: 2px solid #f8f9fa;
                    padding-top: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="display: flex; gap: 25px;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #f093fb;">
                            <i class="fas fa-heart" style="font-size: 18px;"></i>
                            <div>
                                <div style="font-weight: 700; font-size: 16px;">${pub.likes_count || 0}</div>
                                <div style="font-size: 11px; color: #7e8c9a; margin-top: 2px;">Me gusta</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; color: #4facfe;">
                            <i class="fas fa-comment" style="font-size: 18px;"></i>
                            <div>
                                <div style="font-weight: 700; font-size: 16px;">${pub.comentarios_count || 0}</div>
                                <div style="font-size: 11px; color: #7e8c9a; margin-top: 2px;">Comentarios</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tipo de publicación -->
                    <div style="
                        background: ${this.getColorByType(pub.tipo)};
                        color: white;
                        padding: 6px 15px;
                        border-radius: 25px;
                        font-size: 13px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    ">
                        <i class="${this.getIconByType(pub.tipo)}"></i>
                        ${this.getLabelByType(pub.tipo)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
},

// Función para abrir denuncia de publicación (solo muestra modal de denuncia)
async abrirDenunciaPublicacion(publicacionId, usuarioReportadoId) {
    // Primero obtener información de la publicación
    const { data: publicacion } = await window.supabase
        .from('publicaciones')
        .select('contenido')
        .eq('id', publicacionId)
        .single();
    
    if (!publicacion) {
        this.mostrarNotificacion('error', 'No se pudo encontrar la publicación');
        return;
    }
    
    // Mostrar modal de denuncia (este modal SI se puede cerrar)
    Swal.fire({
        title: '<div style="color: #e74c3c; font-size: 22px; margin-bottom: 5px;"><i class="fas fa-exclamation-triangle"></i> Denunciar publicación</div>',
        html: `
            <div style="text-align: left; padding: 10px;">
                <div style="
                    background: #fff8f8;
                    border: 2px solid #ffeaea;
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 20px;
                ">
                    <p style="color: #e74c3c; margin: 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-info-circle"></i>
                        Al denunciar una publicación, el autor será notificado del motivo
                    </p>
                </div>
                
                <p style="color: #5d6d7e; margin-bottom: 20px; font-size: 15px; text-align: center;">
                    Selecciona el motivo de tu denuncia:
                </p>
                
                <div style="max-height: 300px; overflow-y: auto; padding-right: 10px; margin-bottom: 20px;">
                    ${this.renderizarOpcionesDenuncia()}
                </div>
                
                <!-- Campo para comentarios adicionales -->
                <div style="margin-top: 20px;">
                    <label style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 14px;">
                        <i class="fas fa-comment-dots" style="color: #667eea; margin-right: 8px;"></i>
                        Comentarios adicionales (opcional)
                    </label>
                    <textarea id="comentarioDenuncia" 
                              rows="3" 
                              placeholder="Describe brevemente por qué estás denunciando esta publicación..."
                              style="
                                width: 100%;
                                padding: 12px;
                                border: 2px solid #e8edf2;
                                border-radius: 10px;
                                font-size: 14px;
                                color: #2c3e50;
                                resize: vertical;
                                font-family: inherit;
                              "></textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Enviar denuncia',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#95a5a6',
        width: 600,
        background: '#fff',
        allowOutsideClick: true,
        allowEscapeKey: true,
        preConfirm: async () => {
            // Obtener motivo seleccionado
            const motivoSeleccionado = document.querySelector('input[name="motivoDenuncia"]:checked');
            if (!motivoSeleccionado) {
                Swal.showValidationMessage('Por favor, selecciona un motivo para la denuncia');
                return false;
            }
            
            const motivo = motivoSeleccionado.value;
            const comentario = document.getElementById('comentarioDenuncia').value;
            
            // Obtener usuario actual
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) {
                Swal.showValidationMessage('Debes iniciar sesión para denunciar');
                return false;
            }
            
            // Traducir motivo a texto
            const motivosTexto = {
                'spam': 'Spam o publicidad no deseada',
                'odio': 'Discurso de odio',
                'acoso': 'Acoso o bullying',
                'sexual': 'Contenido sexual inapropiado',
                'violencia': 'Violencia o incitación',
                'suplantacion': 'Suplantación de identidad',
                'informacion_falsa': 'Información falsa',
                'propiedad_intelectual': 'Violación de derechos de autor',
                'privacidad': 'Violación de privacidad',
                'otro': 'Otro motivo'
            };
            
            const motivoTexto = motivosTexto[motivo] || motivo;
            
            return { 
                motivo, 
                motivoTexto,
                comentario, 
                denuncianteId: user.id,
                usuarioReportadoId: usuarioReportadoId
            };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { motivo, motivoTexto, comentario, denuncianteId, usuarioReportadoId } = result.value;
            
            try {
                // Guardar denuncia en la tabla
                const response = await window.supabase
                    .from('denuncias_publicaciones')
                    .insert({
                        publicacion_id: publicacionId,
                        denunciante_id: denuncianteId,
                        usuario_reportado_id: usuarioReportadoId,
                        motivo: motivo,
                        comentario: comentario || null,
                        estado: 'pendiente',
                        fecha_denuncia: new Date().toISOString()
                    });
                
                if (response.error) {
                    throw new Error('No se pudo registrar la denuncia');
                }
                
                // Enviar notificación al usuario que publicó
                await this.enviarNotificacionDenuncia(
                    usuarioReportadoId,
                    publicacionId,
                    motivoTexto,
                    comentario
                );
                
                // Mostrar confirmación
                Swal.fire({
                    icon: 'success',
                    title: 'Denuncia enviada',
                    html: `
                        <div style="text-align: center; padding: 20px;">
                            <div style="font-size: 60px; color: #2ecc71; margin-bottom: 20px;">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 20px;">
                                ¡Denuncia registrada correctamente!
                            </h4>
                            <p style="color: #5d6d7e; margin-bottom: 15px;">
                                Hemos recibido tu denuncia y el autor ha sido notificado.
                            </p>
                            <div style="
                                background: #f8f9fa;
                                border-radius: 10px;
                                padding: 15px;
                                margin-top: 20px;
                                border-left: 4px solid #667eea;
                            ">
                                <p style="margin: 0; color: #667eea; font-size: 14px; font-weight: 600;">
                                    <i class="fas fa-bell"></i> El autor de la publicación ha sido notificado del motivo: "${motivoTexto}"
                                </p>
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#667eea',
                    confirmButtonText: 'Entendido',
                    width: 500,
                    allowOutsideClick: true,
                    allowEscapeKey: true
                });
                
            } catch (error) {
                console.error('Error al denunciar publicación:', error);
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error al denunciar',
                    text: 'No se pudo registrar tu denuncia. Por favor, intenta de nuevo más tarde.',
                    confirmButtonColor: '#667eea',
                    allowOutsideClick: true,
                    allowEscapeKey: true
                });
            }
        }
    });
},

// Función para enviar notificación al usuario denunciado
async enviarNotificacionDenuncia(usuarioId, publicacionId, motivo, comentario) {
    try {
        // Obtener información del denunciante
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) return;
        
        // Obtener información del denunciante (si es un usuario registrado)
        const { data: denunciante } = await window.supabase
            .from('usuarios')
            .select('nombre, apellidos')
            .eq('id', user.id)
            .single();
        
        const nombreDenunciante = denunciante ? 
            `${denunciante.nombre} ${denunciante.apellidos}` : 
            'Un usuario';
        
        // Obtener información de la publicación denunciada
        const { data: publicacion } = await window.supabase
            .from('publicaciones')
            .select('contenido')
            .eq('id', publicacionId)
            .single();
        
        const contenidoPublicacion = publicacion?.contenido ? 
            (publicacion.contenido.length > 100 ? 
                publicacion.contenido.substring(0, 100) + '...' : 
                publicacion.contenido) : 
            'una publicación tuya';
        
        // Crear mensaje de notificación
        const mensajeNotificacion = `
            <div style="padding: 15px;">
                <div style="
                    background: #fff8f8;
                    border: 2px solid #ffeaea;
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 15px;
                ">
                    <h4 style="color: #e74c3c; margin: 0 0 10px 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-exclamation-triangle"></i> Publicación Denunciada
                    </h4>
                    <p style="color: #5d6d7e; margin: 0; font-size: 14px;">
                        Tu publicación ha sido denunciada por ${nombreDenunciante}
                    </p>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #2c3e50; font-size: 14px;">
                        <i class="fas fa-newspaper"></i> Publicación denunciada:
                    </p>
                    <p style="margin: 0; color: #5d6d7e; font-size: 13px; font-style: italic; padding-left: 20px;">
                        "${contenidoPublicacion}"
                    </p>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 8px; padding: 15px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #2c3e50; font-size: 14px;">
                        <i class="fas fa-flag"></i> Motivo de la denuncia:
                    </p>
                    <p style="margin: 0; color: #e74c3c; font-size: 14px; font-weight: 600; padding-left: 20px;">
                        ${motivo}
                    </p>
                    ${comentario ? `
                        <p style="margin: 10px 0 0 0; font-weight: 600; color: #2c3e50; font-size: 14px;">
                            <i class="fas fa-comment"></i> Comentario adicional:
                        </p>
                        <p style="margin: 0; color: #5d6d7e; font-size: 13px; padding-left: 20px;">
                            "${comentario}"
                        </p>
                    ` : ''}
                </div>
                
                <div style="
                    background: #e8f5e9;
                    border: 2px solid #c8e6c9;
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 15px;
                    text-align: center;
                ">
                    <p style="margin: 0; color: #2e7d32; font-size: 13px; font-weight: 600;">
                        <i class="fas fa-info-circle"></i> Esta es una notificación informativa. Revisa nuestras políticas de comunidad.
                    </p>
                </div>
            </div>
        `;
        
        // Guardar notificación en la base de datos (puedes usar tu tabla de notificaciones)
        const notificacionData = {
            usuario_id: usuarioId,
            tipo: 'denuncia',
            titulo: 'Publicación Denunciada',
            mensaje: `Tu publicación ha sido denunciada por ${nombreDenunciante}. Motivo: ${motivo}`,
            datos_adicionales: JSON.stringify({
                publicacion_id: publicacionId,
                motivo: motivo,
                comentario: comentario,
                denunciante_id: user.id
            }),
            leido: false,
            fecha_creacion: new Date().toISOString()
        };
        
        // Intentar insertar en la tabla de notificaciones
        await window.supabase
            .from('notificaciones')
            .insert(notificacionData);
        
        console.log('Notificación enviada al usuario:', usuarioId);
        
    } catch (error) {
        console.error('Error al enviar notificación:', error);
    }
},

// Función para renderizar opciones de denuncia (la misma que antes)
renderizarOpcionesDenuncia() {
    const motivos = [
        { id: 'spam', icon: 'fas fa-ban', text: 'Spam o publicidad no deseada', desc: 'Contenido promocional no solicitado' },
        { id: 'odio', icon: 'fas fa-angry', text: 'Discurso de odio', desc: 'Contenido que promueve la discriminación' },
        { id: 'acoso', icon: 'fas fa-user-slash', text: 'Acoso o bullying', desc: 'Contenido que hostiga o intimida' },
        { id: 'sexual', icon: 'fas fa-exclamation-triangle', text: 'Contenido sexual inapropiado', desc: 'Material sexual explícito' },
        { id: 'violencia', icon: 'fas fa-fist-raised', text: 'Violencia o incitación', desc: 'Promueve o glorifica la violencia' },
        { id: 'suplantacion', icon: 'fas fa-user-secret', text: 'Suplantación de identidad', desc: 'Pretende ser otra persona' },
        { id: 'informacion_falsa', icon: 'fas fa-exclamation-circle', text: 'Información falsa', desc: 'Noticias falsas o engañosas' },
        { id: 'propiedad_intelectual', icon: 'fas fa-copyright', text: 'Violación de derechos de autor', desc: 'Uso no autorizado de contenido' },
        { id: 'privacidad', icon: 'fas fa-user-shield', text: 'Violación de privacidad', desc: 'Expone información personal' },
        { id: 'otro', icon: 'fas fa-ellipsis-h', text: 'Otro motivo', desc: 'Especifica en los comentarios' }
    ];
    
    return motivos.map(motivo => `
        <label style="
            display: flex;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            background: #f8f9fa;
            border: 2px solid #e8edf2;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        " onmouseover="this.style.borderColor='#667eea'; this.style.backgroundColor='#f0f4ff'"
           onmouseout="this.style.borderColor='#e8edf2'; this.style.backgroundColor='#f8f9fa'">
            <input type="radio" 
                   name="motivoDenuncia" 
                   value="${motivo.id}" 
                   style="margin-right: 15px; transform: scale(1.2); cursor: pointer;">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <i class="${motivo.icon}" style="color: #667eea; font-size: 18px; margin-right: 10px;"></i>
                    <span style="font-weight: 600; color: #2c3e50; font-size: 15px;">${motivo.text}</span>
                </div>
                <div style="color: #7e8c9a; font-size: 13px; padding-left: 28px;">${motivo.desc}</div>
            </div>
        </label>
    `).join('');
},

// Otras funciones auxiliares (ya definidas previamente)
getColorByType(tipo) {
    const colores = {
        'texto': '#667eea',
        'imagen': '#f093fb',
        'video': '#43e97b',
        'enlace': '#4facfe'
    };
    return colores[tipo] || '#667eea';
},

getIconByType(tipo) {
    const iconos = {
        'texto': 'fas fa-font',
        'imagen': 'fas fa-image',
        'video': 'fas fa-video',
        'enlace': 'fas fa-link'
    };
    return iconos[tipo] || 'fas fa-newspaper';
},

getLabelByType(tipo) {
    const etiquetas = {
        'texto': 'TEXTO',
        'imagen': 'IMAGEN',
        'video': 'VIDEO',
        'enlace': 'ENLACE'
    };
    return etiquetas[tipo] || 'PUBLICACIÓN';
},

escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
},

calcularTiempoTranscurrido(fechaString) {
    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diferencia = ahora - fecha;
    
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 7) {
        return fecha.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        });
    } else if (dias > 0) {
        return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    } else if (horas > 0) {
        return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    } else if (minutos > 0) {
        return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    } else {
        return 'Hace unos momentos';
    }
},

// En el mismo archivo donde está verPublicacionesAmigo, agrega:
ampliarImagen(url) {
    Swal.fire({
        imageUrl: url,
        imageAlt: 'Imagen',
        showConfirmButton: false,
        showCloseButton: true,
        background: 'rgba(0,0,0,0.9)'
    });
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
    
    // Primero ordenar notificaciones por tipo y fecha
    const notificacionesOrdenadas = [...window.solicitudesPendientes].sort((a, b) => {
        // Orden: 1. Denuncias (urgente), 2. Amistad, 3. Grupo, 4. Likes
        const prioridad = {
            'denuncia_publicacion': 1,
            'amistad': 2,
            'grupo': 3,
            'likes': 4
        };
        
        const prioridadA = prioridad[a.tipo] || 5;
        const prioridadB = prioridad[b.tipo] || 5;
        
        if (prioridadA !== prioridadB) {
            return prioridadA - prioridadB;
        }
        
        // Mismo tipo, ordenar por fecha (más reciente primero)
        return new Date(b.fecha || b.created_at || b.fecha_creacion) - 
               new Date(a.fecha || a.created_at || a.fecha_creacion);
    });
    
    notificacionesOrdenadas.forEach(notificacion => {
        if (notificacion.tipo === 'denuncia_publicacion') {
            // Renderizar notificación de denuncia
            html += this.renderizarNotificacionDenuncia(notificacion);
            
        } else if (notificacion.tipo === 'amistad') {
            // CÓDIGO PARA AMISTAD - MOVIDO AQUÍ EN LUGAR DE LLAMAR A UN MÉTODO
            const nombreUsuario = `${notificacion.usuario.nombre} ${notificacion.usuario.apellidos}`;
            const nombreEscapado = nombreUsuario.replace(/'/g, "\\'");
            const avatarUrl = notificacion.usuario.avatar_url;
            
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
                         onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color: white; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; background: ${this.obtenerColorAvatar(nombreUsuario)};\\'>${this.obtenerIniciales(nombreUsuario)}</div>';">
                `;
            } else {
                html += `
                    <div style="
                        width: 100%;
                        height: 100%;
                        background: ${this.obtenerColorAvatar(nombreUsuario)};
                        color: white;
                        font-size: 18px;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        ${this.obtenerIniciales(nombreUsuario)}
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
            // CÓDIGO PARA GRUPO - MOVIDO AQUÍ EN LUGAR DE LLAMAR A UN MÉTODO
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
            // CÓDIGO PARA LIKES - MOVIDO AQUÍ EN LUGAR DE LLAMAR A UN MÉTODO
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

actualizarContadorSolicitudes() {
    if (!window.solicitudesPendientes) {
        const badge = document.querySelector('#btnNotificaciones .badge');
        if (badge) {
            badge.textContent = '';
            badge.style.display = 'none';
        }
        return;
    }
    
    // Contar: denuncias (siempre), solicitudes de amistad, grupos, y notificaciones de likes NO leídas
    const totalSolicitudes = window.solicitudesPendientes.filter(n => {
        if (n.tipo === 'denuncia_publicacion') {
            return true; // Siempre contar denuncias
        } else if (n.tipo === 'likes') {
            return !n.leida; // Solo contar likes no leídos
        }
        return true; // Contar amistad y grupo
    }).length;
    
    const badge = document.querySelector('#btnNotificaciones .badge');
    if (badge) {
        badge.textContent = totalSolicitudes > 0 ? totalSolicitudes : '';
        badge.style.display = totalSolicitudes > 0 ? 'flex' : 'none';
        
        // Cambiar color si hay denuncias
        const tieneDenuncias = window.solicitudesPendientes.some(n => n.tipo === 'denuncia_publicacion');
        if (tieneDenuncias) {
            badge.style.backgroundColor = '#e74c3c'; // Rojo para denuncias
        } else {
            badge.style.backgroundColor = '#667eea'; // Morado normal
        }
    }
},

renderizarPublicacionIndividual(publicacion) {
    const fecha = new Date(publicacion.fecha_creacion);
    const tiempoTranscurrido = this.formatearFecha(publicacion.fecha_creacion);
    
    return `
        <div class="publicacion-contenedor">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    ${publicacion.usuario?.avatar_url ? 
                        `<img src="${publicacion.usuario.avatar_url}" style="width: 100%; height: 100%; object-fit: cover;">` :
                        `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${publicacion.usuario?.nombre?.charAt(0) || 'U'}</div>`
                    }
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: #2c3e50; font-size: 16px;">
                        ${publicacion.usuario?.nombre || ''} ${publicacion.usuario?.apellidos || ''}
                    </div>
                    <div style="font-size: 12px; color: #7e8c9a;">
                        <i class="far fa-clock"></i> ${tiempoTranscurrido}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                ${publicacion.contenido ? `
                    <div style="color: #2c3e50; line-height: 1.6; font-size: 15px; white-space: pre-wrap; word-wrap: break-word; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #667eea;">
                        ${this.escapeHtml(publicacion.contenido)}
                    </div>
                ` : ''}
            </div>
            
            <div style="border-top: 1px solid #e8edf2; padding-top: 15px; display: flex; gap: 20px; font-size: 14px;">
                <div style="color: #f093fb;">
                    <i class="fas fa-heart"></i> ${publicacion.likes_count || 0} Me gusta
                </div>
                <div style="color: #4facfe;">
                    <i class="fas fa-comment"></i> ${publicacion.comentarios_count || 0} Comentarios
                </div>
            </div>
        </div>
    `;
},

// Método auxiliar para escapar HTML
escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
},

renderizarNotificacionDenuncia(notif) {
    const fecha = this.formatearFecha(notif.fecha || notif.fecha_denuncia);
    const contenidoResumen = notif.publicacion?.contenido ? 
        (notif.publicacion.contenido.length > 50 ? 
            notif.publicacion.contenido.substring(0, 50) + '...' : 
            notif.publicacion.contenido) : 
        'una publicación tuya';
    
    const motivoTextos = {
        'spam': 'Spam o publicidad no deseada',
        'odio': 'Discurso de odio',
        'acoso': 'Acoso o bullying',
        'sexual': 'Contenido sexual inapropiado',
        'violencia': 'Violencia o incitación',
        'suplantacion': 'Suplantación de identidad',
        'informacion_falsa': 'Información falsa',
        'propiedad_intelectual': 'Violación de derechos de autor',
        'privacidad': 'Violación de privacidad',
        'otro': 'Otro motivo'
    };
    
    const motivoTexto = motivoTextos[notif.motivo] || notif.motivo;
    const nombreDenunciante = notif.denunciante ? 
        `${notif.denunciante.nombre || ''} ${notif.denunciante.apellidos || ''}`.trim() : 
        'un usuario';
    
    return `
        <div class="notification-item unread denuncia-notification">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                <div class="notification-icon-denuncia" 
                     style="
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        overflow: hidden;
                        flex-shrink: 0;
                        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                        border: 2px solid #e74c3c;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 20px;
                        cursor: pointer;
                     "
                     onclick="window.Amigos.verPublicacionDenunciada('${notif.publicacion_id}')">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div style="flex-grow: 1;">
                    <div class="notification-text">
                        <strong style="color: #e74c3c;">Publicación Denunciada</strong><br>
                        <span style="color: #5d6d7e; font-size: 14px;">
                            ${nombreDenunciante} denunció tu publicación
                        </span>
                    </div>
                    <div class="notification-time">${fecha}</div>
                </div>
            </div>
            
            <div class="notification-details-denuncia" style="
                background-color: #f9f9f9;
                border: 1px solid #eee;
                border-radius: 8px;
                padding: 12px;
                margin: 10px 0;
                font-size: 13px;
            ">
                <p style="margin: 5px 0; color: #555;">
                    <strong>Motivo:</strong> ${motivoTexto}
                </p>
                <p style="margin: 5px 0; color: #555;">
                    <strong>Publicación:</strong> "${contenidoResumen}"
                </p>
                ${notif.comentario ? `
                    <p style="margin: 5px 0; color: #555;">
                        <strong>Comentario:</strong> "${notif.comentario}"
                    </p>
                ` : ''}
            </div>
            
            <div class="notification-actions">
                <button class="btn-notification-accept" onclick="window.Amigos.verPublicacionDenunciada('${notif.publicacion_id}')">
                    <i class="fas fa-eye"></i> Ver publicación
                </button>
                <button class="btn-notification-decline" onclick="window.Amigos.marcarDenunciaComoRevisada('${notif.id}')">
                    <i class="fas fa-check"></i> Entendido
                </button>
            </div>
        </div>
    `;
},

async verPublicacionDenunciada(publicacionId) {
    try {
        // Cerrar dropdown de notificaciones
        const dropdown = document.getElementById('dropdownNotificaciones');
        if (dropdown) dropdown.style.display = 'none';
        
        // Obtener detalles de la publicación
        const { data: publicacion, error } = await window.supabase
            .from('publicaciones')
            .select(`
                *,
                usuario:usuarios(*)
            `)
            .eq('id', publicacionId)
            .single();
        
        if (error) throw error;
        
        if (!publicacion) {
            this.mostrarNotificacion('error', 'La publicación no existe o fue eliminada');
            return;
        }
        
        // Mostrar modal con la publicación
        const html = `
            <div style="max-width: 600px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                    <h3 style="margin: 0; font-size: 20px;">
                        <i class="fas fa-exclamation-triangle"></i> Publicación Denunciada
                    </h3>
                </div>
                <div style="padding: 20px;">
                    ${this.renderizarPublicacionIndividual(publicacion)}
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #f8f9fa;">
                        <p style="color: #e74c3c; font-weight: 600; margin-bottom: 10px;">
                            <i class="fas fa-info-circle"></i> Esta publicación ha sido denunciada
                        </p>
                        <button onclick="window.Amigos.eliminarPublicacion('${publicacionId}')" 
                                style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-right: 10px;">
                            <i class="fas fa-trash"></i> Eliminar publicación
                        </button>
                        <button onclick="Swal.close()" 
                                style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        Swal.fire({
            html: html,
            showConfirmButton: false,
            showCloseButton: true,
            width: 650
        });
        
    } catch (error) {
        console.error('Error al cargar publicación denunciada:', error);
        this.mostrarNotificacion('error', 'No se pudo cargar la publicación');
    }
},

async marcarDenunciaComoRevisada(denunciaId) {
    try {
        const { error } = await window.supabase
            .from('denuncias_publicaciones')
            .update({ estado: 'revisada' })
            .eq('id', denunciaId);
        
        if (error) throw error;
        
        // Eliminar de la lista local
        if (window.solicitudesPendientes) {
            window.solicitudesPendientes = window.solicitudesPendientes.filter(n => 
                !(n.tipo === 'denuncia_publicacion' && n.id === denunciaId)
            );
        }
        
        this.mostrarNotificaciones();
        this.actualizarContadorSolicitudes();
        
        this.mostrarNotificacion('success', 'Denuncia marcada como revisada');
        
    } catch (error) {
        console.error('Error al marcar denuncia:', error);
        this.mostrarNotificacion('error', 'No se pudo actualizar la denuncia');
    }
},

async eliminarPublicacion(publicacionId) {
    try {
        const { error } = await window.supabase
            .from('publicaciones')
            .delete()
            .eq('id', publicacionId);
        
        if (error) throw error;
        
        // También actualizar el estado de las denuncias relacionadas
        await window.supabase
            .from('denuncias_publicaciones')
            .update({ estado: 'resuelta', acciones_tomadas: 'Publicación eliminada' })
            .eq('publicacion_id', publicacionId);
        
        // Eliminar de la lista local
        if (window.solicitudesPendientes) {
            window.solicitudesPendientes = window.solicitudesPendientes.filter(n => 
                !(n.tipo === 'denuncia_publicacion' && n.publicacion_id === publicacionId)
            );
        }
        
        Swal.close();
        this.mostrarNotificaciones();
        this.actualizarContadorSolicitudes();
        
        this.mostrarNotificacion('success', 'Publicación eliminada correctamente');
        
    } catch (error) {
        console.error('Error al eliminar publicación:', error);
        this.mostrarNotificacion('error', 'No se pudo eliminar la publicación');
    }
},

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
                avatar_url: amistad.amigo.avatar_url,
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
                avatar_url: amistad.usuario.avatar_url,
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
        const iniciales = this.obtenerIniciales(nombreCompleto);
        const ubicacion = this.formatearUbicacion(amigo.ciudad, amigo.pais);
        
        // Escapar comillas simples en las cadenas para evitar errores de JavaScript
        const emailEscapado = amigo.email.replace(/'/g, "\\'");
        const nombreEscapado = amigo.nombre.replace(/'/g, "\\'");
        
        html += `
            <div class="friend-item" data-amigo-id="${amigo.id}">
                <div class="friend-avatar">
                    ${amigo.avatar_url ? 
                        `<img src="${amigo.avatar_url}" alt="${nombreCompleto}">` : 
                        `<span>${iniciales}</span>`
                    }
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
        
        // Cargar denuncias de publicaciones (si el usuario actual es el denunciado)
        const { data: denunciasPublicaciones, error: errorDenuncias } = await window.supabase
            .from('denuncias_publicaciones')
            .select(`
                id,
                publicacion_id,
                denunciante_id,
                usuario_reportado_id,
                motivo,
                comentario,
                estado,
                fecha_denuncia,
                publicacion:publicaciones!inner(
                    contenido,
                    usuario_id,
                    tipo,
                    url_media
                ),
                denunciante:usuarios!denuncias_publicaciones_denunciante_id_fkey(
                    id,
                    nombre,
                    apellidos,
                    avatar_url
                )
            `)
            .eq('usuario_reportado_id', window.usuarioIdActual)
            .eq('estado', 'pendiente')
            .order('fecha_denuncia', { ascending: false });
        
        if (errorDenuncias && !errorDenuncias.message.includes('relation')) {
            // Solo lanzar error si la tabla existe pero hay otro problema
            throw errorDenuncias;
        }
        
        // Combinar todas las listas
        const todasNotificaciones = [
            ...(solicitudesAmistad || []).map(s => ({
                ...s,
                tipo: 'amistad',
                fecha: s.created_at || new Date().toISOString()
            })),
            ...(invitacionesGrupo || []).map(i => ({
                ...i,
                tipo: 'grupo',
                fecha: i.created_at || new Date().toISOString()
            })),
            ...(denunciasPublicaciones || []).map(d => ({
                ...d,
                tipo: 'denuncia_publicacion',
                fecha: d.fecha_denuncia
            }))
        ];
        
        // Ordenar por fecha (más recientes primero)
        todasNotificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // Verificar si ya existe notificación de likes para no duplicar
        const notificacionLikesExistente = window.solicitudesPendientes ? 
            window.solicitudesPendientes.find(n => n.tipo === 'likes') : null;
        
        if (notificacionLikesExistente) {
            // Mantener la notificación de likes y agregar las nuevas
            window.solicitudesPendientes = [
                notificacionLikesExistente,
                ...todasNotificaciones
            ];
        } else {
            window.solicitudesPendientes = todasNotificaciones;
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
},

// Función para formatear fechas (método interno para no confundir con la utilidad)
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

// Métodos auxiliares para colores e iniciales
obtenerColorAvatar(nombre) {
    const colores = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
    ];
    
    // Generar un índice basado en el nombre
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
        hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colores.length;
    return colores[index];
},

obtenerIniciales(nombre) {
    return nombre
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
},

formatearUbicacion(ciudad, pais) {
    if (ciudad && pais) {
        return `${ciudad}, ${pais}`;
    } else if (ciudad) {
        return ciudad;
    } else if (pais) {
        return pais;
    }
    return 'Ubicación no especificada';
},

// Método para mostrar notificaciones simples
mostrarNotificacion(tipo, mensaje) {
    if (tipo === 'success') {
        window.Utilidades.mostrarAlerta('Éxito', mensaje, 'success');
    } else if (tipo === 'error') {
        window.Utilidades.mostrarAlerta('Error', mensaje, 'error');
    } else {
        window.Utilidades.mostrarAlerta('Información', mensaje, 'info');
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
}
};




let mensajeModalAbierto = false;
let sugerenciasModal = null;

// Función para enviar mensaje con modal premium
function enviarMensajeUsuarioPremium(email, nombre) {
    mensajeModalAbierto = true;
    const initiales = nombre ? nombre.charAt(0).toUpperCase() : 'U';
    
    Swal.fire({
        customClass: {
            popup: 'premium-message-modal',
            container: 'swal2-container'
        },
        html: `
            <div class="message-modal-header">
                <div class="message-icon">
                    <i class="fas fa-paper-plane"></i>
                </div>
                <h3>Enviar Mensaje</h3>
            </div>
            
            <div class="message-modal-body">
                <!-- Destinatario -->
                <div class="recipient-card">
                    <div class="recipient-avatar">
                        ${initiales}
                    </div>
                    <div class="recipient-info">
                        <h4>${nombre || 'Usuario'}</h4>
                        <p class="recipient-email">${email}</p>
                    </div>
                </div>
                
                <!-- Formulario -->
                <div class="message-form">
                    <!-- Asunto -->
                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px;">
                            <div>
                                <label class="form-label">
                                    <i class="fas fa-heading"></i>
                                    <span>Asunto del mensaje</span>
                                </label>
                                <div style="font-size: 12px; color: #667eea; margin-top: 4px; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                                    <i class="fas fa-info-circle"></i>
                                    <span>Selecciona uno de las opciones disponibles</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="subject-preview" id="subjectPreview">
                            <span class="subject-text" id="subjectText">¡Hola! 👋 Un saludo cordial</span>
                            <div class="btn-change-subject" onclick="mostrarOpcionesAsunto()">
                                <i class="fas fa-chevron-down"></i>
                            </div>
                        </div>
                        
                        <div class="subject-options" id="subjectOptions" style="display: none;">
                            <!-- SALUDOS Y CORTESÍAS -->
                            <div class="category-header" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);">
                                <i class="fas fa-handshake"></i>
                                <span>Saludos y Cortesías</span>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('¡Hola! 👋 Un saludo cordial')">
                                <div class="option-content">
                                    <span class="option-text">¡Hola! 👋 Un saludo cordial</span>
                                    <span class="option-hint">Perfecto para iniciar contacto</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Buenos días ☀️ Espero te encuentres bien')">
                                <div class="option-content">
                                    <span class="option-text">Buenos días ☀️</span>
                                    <span class="option-hint">Espero te encuentres bien</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Buenas tardes 🌇 ¿Cómo ha sido tu día?')">
                                <div class="option-content">
                                    <span class="option-text">Buenas tardes 🌇</span>
                                    <span class="option-hint">¿Cómo ha sido tu día?</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('¡Buenas noches! 🌙')">
                                <div class="option-content">
                                    <span class="option-text">¡Buenas noches! 🌙</span>
                                    <span class="option-hint">Para contactar en la noche</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('¿Cómo estás? 😊 Espero que muy bien')">
                                <div class="option-content">
                                    <span class="option-text">¿Cómo estás? 😊</span>
                                    <span class="option-hint">Mostrando interés personal</span>
                                </div>
                            </div>
                            
                            <!-- AMISTAD Y CONEXIÓN -->
                            <div class="category-header" style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);">
                                <i class="fas fa-user-friends"></i>
                                <span>Amistad y Conexión</span>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('¡Hagamos conexión! 🤝 Me gustaría conocerte')">
                                <div class="option-content">
                                    <span class="option-text">¡Hagamos conexión! 🤝</span>
                                    <span class="option-hint">Para establecer nueva amistad</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Invitación a ser amigos 👫 En la plataforma')">
                                <div class="option-content">
                                    <span class="option-text">Invitación a ser amigos 👫</span>
                                    <span class="option-hint">Solicitud de amistad directa</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('¿Te gustaría conversar? 💬 Tengo algo que comentarte')">
                                <div class="option-content">
                                    <span class="option-text">¿Te gustaría conversar? 💬</span>
                                    <span class="option-hint">Iniciando diálogo amistoso</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Conectemos en la plataforma 🌐')">
                                <div class="option-content">
                                    <span class="option-text">Conectemos en la plataforma 🌐</span>
                                    <span class="option-hint">Expandir red de contactos</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Tenemos intereses en común ⚡')">
                                <div class="option-content">
                                    <span class="option-text">Tenemos intereses en común ⚡</span>
                                    <span class="option-hint">Basado en perfiles similares</span>
                                </div>
                            </div>
                            
                            <!-- DUDA Y CONSULTA -->
                            <div class="category-header" style="background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%);">
                                <i class="fas fa-question-circle"></i>
                                <span>Dudas y Consultas</span>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Tengo una duda ❓ Sobre tu perfil/experiencia')">
                                <div class="option-content">
                                    <span class="option-text">Tengo una duda ❓</span>
                                    <span class="option-hint">Consulta general</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('¿Podrías ayudarme? 🙏 Con una inquietud')">
                                <div class="option-content">
                                    <span class="option-text">¿Podrías ayudarme? 🙏</span>
                                    <span class="option-hint">Solicitud de ayuda</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Consulta sobre tu perfil 📋')">
                                <div class="option-content">
                                    <span class="option-text">Consulta sobre tu perfil 📋</span>
                                    <span class="option-hint">Preguntas específicas</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Pregunta rápida ⚡ Sobre tu experiencia')">
                                <div class="option-content">
                                    <span class="option-text">Pregunta rápida ⚡</span>
                                    <span class="option-hint">Para consultas breves</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Necesito un consejo 💡')">
                                <div class="option-content">
                                    <span class="option-text">Necesito un consejo 💡</span>
                                    <span class="option-hint">Buscando orientación</span>
                                </div>
                            </div>
                            
                            <!-- COLABORACIÓN -->
                            <div class="category-header" style="background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%);">
                                <i class="fas fa-users"></i>
                                <span>Colaboración</span>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Posible colaboración 🤝 Trabajo en equipo')">
                                <div class="option-content">
                                    <span class="option-text">Posible colaboración 🤝</span>
                                    <span class="option-hint">Propuesta de trabajo conjunto</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Trabajo en equipo 🚀 Proyecto interesante')">
                                <div class="option-content">
                                    <span class="option-text">Trabajo en equipo 🚀</span>
                                    <span class="option-hint">Para proyectos compartidos</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Proyecto interesante 💡 Para colaborar')">
                                <div class="option-content">
                                    <span class="option-text">Proyecto interesante 💡</span>
                                    <span class="option-hint">Invitación a proyecto</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Oportunidad de colaboración ✨')">
                                <div class="option-content">
                                    <span class="option-text">Oportunidad de colaboración ✨</span>
                                    <span class="option-hint">Oferta profesional</span>
                                </div>
                            </div>
                            
                            <!-- INTERÉS PERSONAL -->
                            <div class="category-header" style="background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);">
                                <i class="fas fa-heart"></i>
                                <span>Interés Personal</span>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Me gustó tu perfil 😍 Tenemos mucho en común')">
                                <div class="option-content">
                                    <span class="option-text">Me gustó tu perfil 😍</span>
                                    <span class="option-hint">Complimento sincero</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('¡Felicitaciones por tus logros! 🎉')">
                                <div class="option-content">
                                    <span class="option-text">¡Felicitaciones por tus logros! 🎉</span>
                                    <span class="option-hint">Reconocimiento de méritos</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Me inspiró tu actividad ✨')">
                                <div class="option-content">
                                    <span class="option-text">Me inspiró tu actividad ✨</span>
                                    <span class="option-hint">Motivación personal</span>
                                </div>
                            </div>
                            <div class="subject-option" onclick="seleccionarAsunto('Admiro tu progreso 🌟')">
                                <div class="option-content">
                                    <span class="option-text">Admiro tu progreso 🌟</span>
                                    <span class="option-hint">Reconocimiento de crecimiento</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mensaje -->
                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px;">
                            <div>
                                <label class="form-label">
                                    <i class="fas fa-comment-dots"></i>
                                    <span>Tu mensaje</span>
                                </label>
                                <div style="font-size: 12px; color: #4CAF50; margin-top: 4px; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                                    <i class="fas fa-lightbulb"></i>
                                    <span>Sé claro, amable y específico</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="message-container">
                            <textarea 
                                class="message-textarea" 
                                id="message-content" 
                                rows="5" 
                                placeholder="Escribe tu mensaje aquí... Ejemplo: '¡Hola! Vi tu perfil y me pareció muy interesante, especialmente [menciona algo específico]. Me gustaría [propósito del mensaje]. ¿Qué opinas?' 😊"
                                oninput="actualizarContadorCaracteres()"
                                maxlength="1000"
                            ></textarea>
                            <div class="message-char-count">
                                <span id="charCount">0</span> / 1000 caracteres
                            </div>
                        </div>
                        
                        <div class="message-tips">
                            <i class="fas fa-star" style="color: #FFD700;"></i>
                            <span><strong>Consejo Pro:</strong> Menciona algo específico del perfil del usuario (logros, intereses, actividad). ¡Demuestra que leíste su perfil con atención!</span>
                        </div>
                        
                        <!-- Sugerencias de mensaje rápido -->
                        <div style="margin-top: 20px;">
                            <div style="
                                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                                border-radius: 10px;
                                padding: 15px;
                                border: 1.5px dashed #ddd;
                            ">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                    <div style="
                                        width: 28px;
                                        height: 28px;
                                        background: #667eea;
                                        border-radius: 6px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-size: 12px;
                                    ">
                                        <i class="fas fa-bolt"></i>
                                    </div>
                                    <span style="font-size: 13px; color: #2C3E50; font-weight: 600;">
                                        Sugerencias rápidas para tu mensaje:
                                    </span>
                                    <button type="button" onclick="cambiarSugerenciasRapidas()" style="
                                        margin-left: auto;
                                        background: transparent;
                                        border: 1px solid #667eea;
                                        color: #667eea;
                                        padding: 4px 10px;
                                        border-radius: 6px;
                                        font-size: 10px;
                                        font-weight: 600;
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        gap: 4px;
                                    ">
                                        <i class="fas fa-random"></i>
                                        Cambiar
                                    </button>
                                </div>
                                
                                <div id="quickSuggestions" style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    <!-- Las sugerencias se cargan dinámicamente -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-actions-premium" style="display: flex; gap: 15px; color: rgb(255, 255, 255); justify-content: center; padding: 0 30px 30px !important;">
    <button 
        type="button"
        onclick="enviarMensajeConfirmadoPremium('${email}', '${nombre}')" 
        class="btn-send-premium"
        style="min-width: 180px; color: white;"
    >
        <i class="fas fa-paper-plane"></i> Enviar Mensaje
    </button>

                <button 
                    type="button"
                    onclick="cerrarModalMensaje()" 
                    class="btn-cancel-premium"
                    style="min-width: 120px;"
                >
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        closeButtonHtml: '<i class="fas fa-times"></i>',
        width: 800,
        backdrop: 'rgba(0,0,0,0.5)',
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then((result) => {
        // Este código se ejecuta cuando el modal se cierra
        if (result.dismiss === Swal.DismissReason.close ||
            result.dismiss === Swal.DismissReason.backdrop ||
            result.dismiss === Swal.DismissReason.esc) {
            mensajeModalAbierto = false;
        }
    });
    
    // Agregar estilos CSS
    agregarEstilosSugerencias();
    
    // Inicializar contador de caracteres
    actualizarContadorCaracteres();
    
    // Cargar sugerencias rápidas iniciales
    cargarSugerenciasRapidas();
}

// Función para cerrar el modal de mensaje
function cerrarModalMensaje() {
    mensajeModalAbierto = false;
    Swal.close();
}

// Función para agregar estilos CSS
function agregarEstilosSugerencias() {
    const style = document.createElement('style');
    style.textContent = `
        /* Botones de sugerencias rápidas mejorados */
        .quick-suggestion-btn {
            background: white;
            border: 1.5px solid #e0e0e0;
            color: #5d6d7e;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            position: relative;
            overflow: hidden;
            min-width: 120px;
            justify-content: center;
        }
        
        .quick-suggestion-btn:hover {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-color: #667eea;
            color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }
        
        .quick-suggestion-btn:active {
            transform: translateY(0);
        }
        
        .quick-suggestion-btn i {
            font-size: 11px;
        }
        
        /* Tooltip mejorado */
        .quick-suggestion-btn::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #2C3E50;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            pointer-events: none;
            margin-bottom: 8px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .quick-suggestion-btn:hover::after {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
        }
        
        /* Estilos para modales superpuestos */
        .swal2-container.swal2-shown {
            background-color: rgba(0, 0, 0, 0.5) !important;
        }
        
        .sugerencias-modal-overlay {
            background-color: rgba(0, 0, 0, 0.7) !important;
        }
        
        /* Animación para cambiar sugerencias */
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-20px); opacity: 0; }
        }
        
        @keyframes slideIn {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .suggestion-changing {
            animation: slideOut 0.3s ease forwards;
        }
        
        .suggestion-new {
            animation: slideIn 0.3s ease forwards;
        }
        
        /* Scrollbar personalizado para modales */
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
        
        /* Estilos para elementos copiables */
        .suggestion-item.copiable {
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid transparent;
        }
        
        .suggestion-item.copiable:hover {
            background: #f8f9fa;
            border-color: #e0e0e0;
            transform: translateY(-2px);
        }
        
        /* Checkmark animation */
        .checkmark__circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 2;
            stroke-miterlimit: 10;
            animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: block;
            stroke-width: 2;
            stroke: #4CAF50;
            stroke-miterlimit: 10;
            margin: 20px auto;
            box-shadow: inset 0px 0px 0px #4CAF50;
            animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }

        .checkmark__check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        @keyframes stroke {
            100% {
                stroke-dashoffset: 0;
            }
        }

        @keyframes scale {
            0%, 100% {
                transform: none;
            }
            50% {
                transform: scale3d(1.1, 1.1, 1);
            }
        }

        @keyframes fill {
            100% {
                box-shadow: inset 0px 0px 0px 30px #4CAF50;
            }
        }
    `;
    document.head.appendChild(style);
}

// Pool de sugerencias mejorado
const sugerenciasPool = [
    {
        text: '¡Hola! Vi tu perfil y me pareció muy interesante, especialmente tus logros en la plataforma.',
        icon: 'user-circle',
        label: 'Interés en perfil',
        tooltip: 'Perfecto para iniciar conversación'
    },
    {
        text: 'Me encantaría conocerte mejor y quizás ser amigos aquí en la plataforma. ¿Te parece bien?',
        icon: 'handshake',
        label: 'Amistad',
        tooltip: 'Solicitud de amistad formal'
    },
    {
        text: 'Tenemos intereses muy similares, especialmente en [área común]. ¿Te gustaría conversar sobre ello?',
        icon: 'heart',
        label: 'Intereses comunes',
        tooltip: 'Basado en intereses compartidos'
    },
    {
        text: 'Admiro mucho tu progreso en la plataforma. ¿Podrías compartir algún consejo para mejorar?',
        icon: 'graduation-cap',
        label: 'Busco consejos',
        tooltip: 'Buscando orientación'
    },
    {
        text: '¡Felicitaciones por tus recientes logros! Me inspiró mucho ver tu progreso.',
        icon: 'trophy',
        label: 'Felicitaciones',
        tooltip: 'Reconocimiento positivo'
    },
    {
        text: '¿Te gustaría colaborar en algún proyecto o iniciativa dentro de la plataforma?',
        icon: 'users',
        label: 'Colaboración',
        tooltip: 'Propuesta de colaboración'
    },
    {
        text: 'Me llamó la atención tu última actividad. Parece que tenemos mucho en común, ¿verdad?',
        icon: 'comments',
        label: 'Actividad común',
        tooltip: 'Comentario sobre actividad reciente'
    },
    {
        text: '¡Qué buen perfil tienes! Me encantaría aprender más sobre tu experiencia.',
        icon: 'star',
        label: 'Elogio',
        tooltip: 'Complimento sincero'
    },
    {
        text: 'Veo que somos nuevos en la plataforma. ¿Qué tal si nos ayudamos mutuamente?',
        icon: 'hands-helping',
        label: 'Ayuda mutua',
        tooltip: 'Propuesta de apoyo'
    },
    {
        text: '¿Qué opinas sobre [tema relevante]? Me gustaría conocer tu punto de vista.',
        icon: 'lightbulb',
        label: 'Discusión',
        tooltip: 'Iniciar debate interesante'
    }
];

// Función para cargar sugerencias rápidas
function cargarSugerenciasRapidas() {
    const container = document.getElementById('quickSuggestions');
    if (!container) return;
    
    // Mezclar y tomar 6 sugerencias
    const sugerenciasAleatorias = [...sugerenciasPool]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    
    container.innerHTML = '';
    
    sugerenciasAleatorias.forEach((sugerencia, index) => {
        const btn = document.createElement('button');
        btn.className = 'quick-suggestion-btn';
        btn.setAttribute('data-tooltip', sugerencia.tooltip);
        btn.setAttribute('data-index', index);
        btn.onclick = () => agregarSugerencia(sugerencia.text);
        
        btn.innerHTML = `
            <i class="fas fa-${sugerencia.icon}"></i>
            <span>${sugerencia.label}</span>
        `;
        
        container.appendChild(btn);
    });
}

// Función para cambiar sugerencias rápidas
function cambiarSugerenciasRapidas() {
    const container = document.getElementById('quickSuggestions');
    if (!container) return;
    
    // Animación de salida
    const botones = container.querySelectorAll('.quick-suggestion-btn');
    botones.forEach(btn => {
        btn.classList.add('suggestion-changing');
    });
    
    // Después de la animación, cambiar contenido
    setTimeout(() => {
        cargarSugerenciasRapidas();
        
        // Animación de entrada
        const nuevosBotones = container.querySelectorAll('.quick-suggestion-btn');
        nuevosBotones.forEach(btn => {
            btn.classList.add('suggestion-new');
        });
        
        // Remover clase después de animación
        setTimeout(() => {
            nuevosBotones.forEach(btn => {
                btn.classList.remove('suggestion-new');
            });
        }, 300);
    }, 300);
}

// Nueva función para mostrar modal con todas las opciones de asunto
function mostrarTodasOpcionesAsunto() {
    // Si ya hay un modal abierto, no abrir otro
    if (sugerenciasModal) return;
    
    const modal = Swal.fire({
        title: '<div style="text-align: center; color: #2C3E50; font-size: 24px; margin-bottom: 10px;">📋<br>Todas las Opciones de Asunto</div>',
        html: `
            <div style="text-align: left; max-height: 400px; overflow-y: auto; padding-right: 10px; margin-top: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0; font-size: 16px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-lightbulb"></i>
                        ¿Cómo elegir el mejor asunto?
                    </h4>
                    <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">
                        Selecciona según tu objetivo: saludo amistoso, consulta, colaboración o interés personal.
                    </p>
                </div>
                
                <!-- Ejemplos de saludos -->
                <div class="category-section" style="margin-bottom: 25px;">
                    <h4 style="color: #667eea; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-handshake"></i> 
                        Saludos (5 ejemplos populares)
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px;">
                        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; cursor: pointer;" 
                             onclick="seleccionarAsuntoDesdeEjemplos('¡Hola! 👋 Un saludo cordial')">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <strong style="color: #2C3E50;">¡Hola! 👋</strong>
                                    <p style="margin: 5px 0 0 0; color: #5d6d7e; font-size: 12px;">Un saludo cordial</p>
                                </div>
                                <span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">#1</span>
                            </div>
                        </div>
                        
                        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; cursor: pointer;" 
                             onclick="seleccionarAsuntoDesdeEjemplos('Buenos días ☀️ Espero te encuentres bien')">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <strong style="color: #2C3E50;">Buenos días ☀️</strong>
                                    <p style="margin: 5px 0 0 0; color: #5d6d7e; font-size: 12px;">Espero te encuentres bien</p>
                                </div>
                                <span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">#2</span>
                            </div>
                        </div>
                        
                        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; cursor: pointer;" 
                             onclick="seleccionarAsuntoDesdeEjemplos('Buenas tardes 🌇 ¿Cómo ha sido tu día?')">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <strong style="color: #2C3E50;">Buenas tardes 🌇</strong>
                                    <p style="margin: 5px 0 0 0; color: #5d6d7e; font-size: 12px;">¿Cómo ha sido tu día?</p>
                                </div>
                                <span style="background: #FF9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">#3</span>
                            </div>
                        </div>
                        
                        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; cursor: pointer;" 
                             onclick="seleccionarAsuntoDesdeEjemplos('¿Cómo estás? 😊 Espero que muy bien')">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <strong style="color: #2C3E50;">¿Cómo estás? 😊</strong>
                                    <p style="margin: 5px 0 0 0; color: #5d6d7e; font-size: 12px;">Espero que muy bien</p>
                                </div>
                                <span style="background: #9C27B0; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">#4</span>
                            </div>
                        </div>
                        
                        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; cursor: pointer;" 
                             onclick="seleccionarAsuntoDesdeEjemplos('¡Buenas noches! 🌙')">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <strong style="color: #2C3E50;">¡Buenas noches! 🌙</strong>
                                    <p style="margin: 5px 0 0 0; color: #5d6d7e; font-size: 12px;">Para contactar en la noche</p>
                                </div>
                                <span style="background: #2196F3; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">#5</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Otras categorías -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
                    <div style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%); padding: 15px; border-radius: 8px; border: 1px solid rgba(76, 175, 80, 0.2);">
                        <h5 style="color: #4CAF50; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-user-friends"></i> Amistad
                        </h5>
                        <p style="margin: 0; color: #5d6d7e; font-size: 12px;">
                            5 opciones para hacer amigos y conectar
                        </p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%); padding: 15px; border-radius: 8px; border: 1px solid rgba(255, 152, 0, 0.2);">
                        <h5 style="color: #FF9800; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-question-circle"></i> Consultas
                        </h5>
                        <p style="margin: 0; color: #5d6d7e; font-size: 12px;">
                            5 opciones para preguntar y pedir ayuda
                        </p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%); padding: 15px; border-radius: 8px; border: 1px solid rgba(156, 39, 176, 0.2);">
                        <h5 style="color: #9C27B0; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-users"></i> Colaboración
                        </h5>
                        <p style="margin: 0; color: #5d6d7e; font-size: 12px;">
                            4 opciones para trabajar en equipo
                        </p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%); padding: 15px; border-radius: 8px; border: 1px solid rgba(33, 150, 243, 0.2);">
                        <h5 style="color: #2196F3; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-heart"></i> Interés
                        </h5>
                        <p style="margin: 0; color: #5d6d7e; font-size: 12px;">
                            4 opciones para mostrar admiración
                        </p>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-top: 20px; border-left: 4px solid #667eea;">
                    <p style="margin: 0; color: #5d6d7e; font-size: 13px; line-height: 1.5;">
                        <strong>💡 Total: 25 opciones organizadas por categoría.</strong> Haz clic en cualquier ejemplo para seleccionarlo automáticamente en tu mensaje.
                    </p>
                </div>
            </div>
        `,
        width: 800,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#667eea',
        showCloseButton: true,
        customClass: {
            container: 'sugerencias-modal-overlay',
            popup: 'sugerencias-modal'
        },
        allowOutsideClick: true
    });
    
    // Guardar referencia del modal
    sugerenciasModal = modal;
    
    // Manejar el cierre del modal
    modal.then((result) => {
        sugerenciasModal = null;
    });
}

// Función para seleccionar asunto desde ejemplos
function seleccionarAsuntoDesdeEjemplos(asunto) {
    // Cerrar el modal de sugerencias primero
    if (sugerenciasModal) {
        Swal.close();
        sugerenciasModal = null;
    }
    
    // Seleccionar el asunto en el modal principal
    seleccionarAsunto(asunto);
    
    // Mostrar confirmación visual
    const subjectText = document.getElementById('subjectText');
    if (subjectText) {
        const originalText = subjectText.textContent;
        subjectText.textContent = asunto;
        subjectText.style.color = '#4CAF50';
        subjectText.style.fontWeight = 'bold';
        
        setTimeout(() => {
            subjectText.style.color = '';
            subjectText.style.fontWeight = '';
        }, 1500);
    }
}

// Función para mostrar más sugerencias de mensaje
function mostrarTodasSugerencias() {
    // Si ya hay un modal abierto, no abrir otro
    if (sugerenciasModal) return;
    
    const modal = Swal.fire({
        title: '<div style="text-align: center; color: #2C3E50; font-size: 24px; margin-bottom: 10px;">💡<br>Banco de Sugerencias para Mensajes</div>',
        html: `
            <div style="text-align: left; max-height: 500px; overflow-y: auto; padding-right: 10px; margin-top: 20px;">
                <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-graduation-cap"></i>
                        ¿Cómo usar estas sugerencias?
                    </h4>
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                        <strong>1.</strong> Haz clic en cualquier sugerencia para copiarla automáticamente<br>
                        <strong>2.</strong> Pega en el campo de mensaje del modal principal<br>
                        <strong>3.</strong> <strong>¡Personalízala!</strong> Agrega detalles específicos del usuario
                    </p>
                </div>
                
                <!-- Sección de saludos -->
                <div class="suggestion-section" style="margin-bottom: 30px;">
                    <h4 style="color: #667eea; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%); padding: 12px 15px; border-radius: 8px; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-comment"></i> 
                        Para iniciar conversación (Puedes copiar y pegar)
                    </h4>
                    
                    <div style="display: grid; gap: 12px;">
                        <div class="suggestion-item copiable" data-suggestion="¡Hola! Vi tu perfil y me pareció muy interesante. Me gustó especialmente [menciona algo específico]. Me gustaría conocerte mejor.">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div style="flex: 1;">
                                    <p style="margin: 0; color: #2C3E50; font-size: 14px; line-height: 1.5;">
                                        "¡Hola! Vi tu perfil y me pareció muy interesante. Me gustó especialmente [menciona algo específico]. Me gustaría conocerte mejor."
                                    </p>
                                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                                        <span style="font-size: 11px; color: #95a5a6; display: flex; align-items: center; gap: 4px;">
                                            <i class="fas fa-copy"></i> Haz clic para copiar
                                        </span>
                                        <span style="font-size: 11px; background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 4px;">
                                            Uso: Inicio de conversación
                                        </span>
                                    </div>
                                </div>
                                <div style="width: 30px; height: 30px; background: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-left: 10px; flex-shrink: 0;">
                                    <i class="fas fa-hand-point-right"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="suggestion-item copiable" data-suggestion="Me llamó la atención tu actividad en la plataforma. Parece que somos afines en [área común]. ¿Te gustaría conversar al respecto?">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div style="flex: 1;">
                                    <p style="margin: 0; color: #2C3E50; font-size: 14px; line-height: 1.5;">
                                        "Me llamó la atención tu actividad en la plataforma. Parece que somos afines en [área común]. ¿Te gustaría conversar al respecto?"
                                    </p>
                                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                                        <span style="font-size: 11px; color: #95a5a6; display: flex; align-items: center; gap: 4px;">
                                            <i class="fas fa-copy"></i> Haz clic para copiar
                                        </span>
                                        <span style="font-size: 11px; background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 4px;">
                                            Intereses compartidos
                                        </span>
                                    </div>
                                </div>
                                <div style="width: 30px; height: 30px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-left: 10px; flex-shrink: 0;">
                                    <i class="fas fa-hand-point-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sección de amistad -->
                <div class="suggestion-section" style="margin-bottom: 30px;">
                    <h4 style="color: #FF9800; background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%); padding: 12px 15px; border-radius: 8px; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-handshake"></i> 
                        Para solicitar amistad
                    </h4>
                    
                    <div class="suggestion-item copiable" data-suggestion="Me encantaría que fuéramos amigos aquí en la plataforma. Veo que tenemos valores e intereses similares. ¿Qué opinas?">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1;">
                                <p style="margin: 0; color: #2C3E50; font-size: 14px; line-height: 1.5;">
                                    "Me encantaría que fuéramos amigos aquí en la plataforma. Veo que tenemos valores e intereses similares. ¿Qué opinas?"
                                </p>
                                <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                                    <span style="font-size: 11px; color: #95a5a6; display: flex; align-items: center; gap: 4px;">
                                        <i class="fas fa-copy"></i> Haz clic para copiar
                                    </span>
                                    <span style="font-size: 11px; background: #fff3e0; color: #ef6c00; padding: 2px 8px; border-radius: 4px;">
                                        Solicitud de amistad
                                    </span>
                                </div>
                            </div>
                            <div style="width: 30px; height: 30px; background: #FF9800; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-left: 10px; flex-shrink: 0;">
                                <i class="fas fa-hand-point-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sección de consejos -->
                <div class="suggestion-section" style="margin-bottom: 30px;">
                    <h4 style="color: #9C27B0; background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%); padding: 12px 15px; border-radius: 8px; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-graduation-cap"></i> 
                        Para buscar orientación
                    </h4>
                    
                    <div class="suggestion-item copiable" data-suggestion="Admiro mucho tu progreso y experiencia en la plataforma. ¿Podrías darme algún consejo sobre [área específica]? Agradecería mucho tu orientación.">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1;">
                                <p style="margin: 0; color: #2C3E50; font-size: 14px; line-height: 1.5;">
                                    "Admiro mucho tu progreso y experiencia en la plataforma. ¿Podrías darme algún consejo sobre [área específica]? Agradecería mucho tu orientación."
                                </p>
                                <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                                    <span style="font-size: 11px; color: #95a5a6; display: flex; align-items: center; gap: 4px;">
                                        <i class="fas fa-copy"></i> Haz clic para copiar
                                    </span>
                                    <span style="font-size: 11px; background: #f3e5f5; color: #7b1fa2; padding: 2px 8px; border-radius: 4px;">
                                        Buscando consejos
                                    </span>
                                </div>
                            </div>
                            <div style="width: 30px; height: 30px; background: #9C27B0; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-left: 10px; flex-shrink: 0;">
                                <i class="fas fa-hand-point-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sección de elogios -->
                <div class="suggestion-section" style="margin-bottom: 30px;">
                    <h4 style="color: #2196F3; background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%); padding: 12px 15px; border-radius: 8px; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-heart"></i> 
                        Para elogiar o felicitar
                    </h4>
                    
                    <div class="suggestion-item copiable" data-suggestion="¡Felicitaciones por tus recientes logros! Me inspiró mucho ver cómo has crecido en la plataforma. Sigue así, ¡vas por buen camino!">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1;">
                                <p style="margin: 0; color: #2C3E50; font-size: 14px; line-height: 1.5;">
                                    "¡Felicitaciones por tus recientes logros! Me inspiró mucho ver cómo has crecido en la plataforma. Sigue así, ¡vas por buen camino!"
                                </p>
                                <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                                    <span style="font-size: 11px; color: #95a5a6; display: flex; align-items: center; gap: 4px;">
                                        <i class="fas fa-copy"></i> Haz clic para copiar
                                    </span>
                                    <span style="font-size: 11px; background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 4px;">
                                        Reconocimiento
                                    </span>
                                </div>
                            </div>
                            <div style="width: 30px; height: 30px; background: #2196F3; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-left: 10px; flex-shrink: 0;">
                                <i class="fas fa-hand-point-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 10px; padding: 20px; margin-top: 25px; border: 1px solid #a5d6a7;">
                    <p style="margin: 0; color: #2e7d32; font-size: 14px; line-height: 1.5; text-align: center;">
                        <strong>💡 Recordatorio:</strong> Estas sugerencias son solo una guía. 
                        <strong>¡Personaliza siempre tu mensaje!</strong> Agrega detalles específicos del perfil del usuario para que sea auténtico y relevante.
                    </p>
                </div>
            </div>
        `,
        width: 800,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#667eea',
        showCloseButton: true,
        customClass: {
            container: 'sugerencias-modal-overlay',
            popup: 'sugerencias-modal'
        },
        allowOutsideClick: true,
        didOpen: () => {
            // Agregar event listeners a las sugerencias copiables
            document.querySelectorAll('.suggestion-item.copiable').forEach(item => {
                item.addEventListener('click', function() {
                    const texto = this.getAttribute('data-suggestion');
                    copiarSugerenciaDesdeModal(texto, this);
                });
            });
        }
    });
    
    // Guardar referencia del modal
    sugerenciasModal = modal;
    
    // Manejar el cierre del modal
    modal.then((result) => {
        sugerenciasModal = null;
    });
}

// Función para copiar sugerencia desde modal
function copiarSugerenciaDesdeModal(texto, elemento) {
    navigator.clipboard.writeText(texto).then(() => {
        // Efecto visual de copiado
        elemento.style.background = '#e8f5e9';
        elemento.style.borderRadius = '8px';
        elemento.style.padding = '12px';
        elemento.style.margin = '8px 0';
        elemento.style.border = '2px solid #4CAF50';
        elemento.style.transition = 'all 0.3s ease';
        
        // Guardar contenido original
        const originalContent = elemento.innerHTML;
        
        // Mostrar confirmación
        elemento.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <div style="width: 40px; height: 40px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin: 0 auto 10px; font-size: 18px;">
                    <i class="fas fa-check"></i>
                </div>
                <p style="margin: 0; color: #2e7d32; font-weight: 600; font-size: 14px;">¡Sugerencia copiada!</p>
                <p style="margin: 5px 0 0 0; color: #5d6d7e; font-size: 12px;">Pega en el campo de mensaje principal</p>
                <div style="margin-top: 10px; padding: 8px; background: #f8f9fa; border-radius: 6px; font-size: 12px; color: #667eea;">
                    <i class="fas fa-mouse-pointer"></i> Vuelve al modal principal para pegar
                </div>
            </div>
        `;
        
        // Restaurar después de 2 segundos
        setTimeout(() => {
            elemento.style.background = '';
            elemento.style.border = '';
            elemento.style.padding = '';
            elemento.style.margin = '';
            elemento.innerHTML = originalContent;
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
}

// Función para agregar sugerencia rápida al mensaje
function agregarSugerencia(texto) {
    const textarea = document.getElementById('message-content');
    if (textarea) {
        const currentText = textarea.value;
        if (currentText.trim()) {
            textarea.value = currentText + '\n\n' + texto;
        } else {
            textarea.value = texto;
        }
        textarea.focus();
        textarea.scrollTop = textarea.scrollHeight;
        actualizarContadorCaracteres();
        
        // Mostrar feedback visual
        const btn = event?.target?.closest('.quick-suggestion-btn');
        if (btn) {
            btn.classList.add('suggestion-success');
            setTimeout(() => {
                btn.classList.remove('suggestion-success');
            }, 500);
        }
    }
}

// Función para actualizar contador de caracteres
function actualizarContadorCaracteres() {
    const textarea = document.getElementById('message-content');
    const charCount = document.getElementById('charCount');
    
    if (textarea && charCount) {
        const length = textarea.value.length;
        charCount.textContent = length;
        
        // Cambiar color según la longitud
        if (length > 900) {
            charCount.style.color = '#e74c3c';
            charCount.style.fontWeight = 'bold';
        } else if (length > 500) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = '#2ecc71';
        }
    }
}

// Función para mostrar/ocultar opciones de asunto
function mostrarOpcionesAsunto() {
    const options = document.getElementById('subjectOptions');
    if (options) {
        options.style.display = options.style.display === 'none' ? 'block' : 'none';
    }
}

// Función para seleccionar asunto
function seleccionarAsunto(asunto) {
    const subjectText = document.getElementById('subjectText');
    const subjectOptions = document.getElementById('subjectOptions');
    
    if (subjectText) {
        subjectText.textContent = asunto;
    }
    
    if (subjectOptions) {
        subjectOptions.style.display = 'none';
    }
}

async function enviarMensajeConfirmadoPremium(email, nombre) {
    const subjectText = document.getElementById('subjectText');
    const messageContent = document.getElementById('message-content');
    
    const subject = subjectText ? subjectText.textContent : 'Sin asunto';
    const content = messageContent ? messageContent.value.trim() : '';
    
    if (!content) {
        Swal.fire({
            icon: 'warning',
            title: 'Mensaje vacío',
            text: 'Por favor, escribe un mensaje antes de enviar.',
            confirmButtonColor: '#667eea',
            customClass: {
                popup: 'premium-message-modal'
            }
        });
        return;
    }
    
    if (content.length < 5) {
        Swal.fire({
            icon: 'warning',
            title: 'Mensaje muy corto',
            text: 'Tu mensaje debe tener al menos 5 caracteres.',
            confirmButtonColor: '#667eea',
            customClass: {
                popup: 'premium-message-modal'
            }
        });
        return;
    }
    
    // OBTENER USUARIO ACTUAL DE FORMA SEGURA
    let remitenteId = null;
    
    try {
        // PRIMERO: Intentar obtener de Supabase Auth (forma más segura)
        if (window.supabase && window.supabase.auth) {
            const { data: { user }, error: userError } = await window.supabase.auth.getUser();
            
            if (!userError && user && user.id) {
                remitenteId = user.id;
                console.log('Usuario obtenido de Supabase Auth:', remitenteId);
            }
        }
        
        // SEGUNDO: Intentar obtener de variable global
        if (!remitenteId && typeof currentUserId !== 'undefined') {
            remitenteId = currentUserId;
            console.log('Usuario obtenido de currentUserId:', remitenteId);
        }
        
        // TERCERO: Intentar obtener de localStorage
        if (!remitenteId && typeof localStorage !== 'undefined') {
            const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('userData');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    remitenteId = user.id || user.user_id || user.uid;
                    console.log('Usuario obtenido de localStorage:', remitenteId);
                } catch (e) {
                    console.error('Error parsing user from localStorage:', e);
                }
            }
        }
        
        // CUARTO: Intentar obtener del elemento HTML (si está incrustado)
        if (!remitenteId && typeof userData !== 'undefined' && userData && userData.id) {
            remitenteId = userData.id;
            console.log('Usuario obtenido de userData:', remitenteId);
        }
        
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
    }
    
    if (!remitenteId) {
        console.error('Error: No se pudo obtener el ID del usuario');
        Swal.fire({
            icon: 'error',
            title: 'Sesión no válida',
            text: 'No se pudo identificar tu usuario. Por favor, inicia sesión nuevamente.',
            confirmButtonColor: '#667eea',
            customClass: {
                popup: 'premium-message-modal'
            }
        });
        return;
    }
    
    if (!window.supabase) {
        console.error('Error: supabase no está definido en window');
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor. Por favor, intenta de nuevo más tarde.',
            confirmButtonColor: '#667eea',
            customClass: {
                popup: 'premium-message-modal'
            }
        });
        return;
    }
    
    // Cerrar modal actual
    mensajeModalAbierto = false;
    Swal.close();
    
    // Mostrar carga mientras se envía
    Swal.fire({
        title: 'Enviando mensaje...',
        html: '<div style="margin: 20px 0;"><i class="fas fa-paper-plane fa-3x" style="color: #667eea;"></i></div><p>Por favor, espera un momento...</p>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // VERIFICAR ESTRUCTURA DE LA TABLA
        console.log('Enviando mensaje con datos:', {
            remitente_id: remitenteId,
            destinatario_email: email,
            asunto: subject,
            contenido: content,
            leido: false
        });
        
        // Enviar mensaje a Supabase
        const response = await window.supabase
            .from('mensajes')
            .insert({
                remitente_id: remitenteId,
                destinatario_email: email,
                asunto: subject,
                contenido: content,
                leido: false
            });
        
        if (response.error) {
            console.error('Error al enviar mensaje:', response.error);
            
            // Cerrar modal de carga
            Swal.close();
            
            // Mostrar error específico
            let errorMessage = 'Hubo un problema al enviar tu mensaje.';
            if (response.error.message.includes('foreign key')) {
                errorMessage = 'El ID del remitente no es válido. Por favor, recarga la página.';
            } else if (response.error.message.includes('duplicate key')) {
                errorMessage = 'Este mensaje ya fue enviado.';
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar',
                text: errorMessage,
                confirmButtonColor: '#667eea',
                customClass: {
                    popup: 'premium-message-modal'
                }
            });
            return;
        }
        
        // Cerrar modal de carga
        Swal.close();
        
        // Mostrar confirmación de éxito
        Swal.fire({
            customClass: {
                popup: 'success-modal'
            },
            html: `
                <div style="text-align: center; padding: 30px;">
                    <div class="success-animation">
                        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style="width: 80px; height: 80px;">
                            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" style="stroke: #4CAF50; stroke-width: 2;"/>
                            <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" style="stroke: #4CAF50; stroke-width: 2; stroke-linecap: round;"/>
                        </svg>
                    </div>
                    <div class="success-message">
                        <h3 style="color: #2C3E50; margin-bottom: 15px; font-size: 28px;">¡Mensaje Enviado con Éxito! 🎉</h3>
                        <p style="color: #5d6d7e; margin-bottom: 10px; font-size: 16px;">
                            Tu mensaje ha sido enviado a <strong style="color: #667eea;">${nombre || 'el usuario'}</strong>
                        </p>
                        <small style="font-size: 14px;">
                            <i class="fas fa-envelope" style="color: #667eea; margin-right: 8px;"></i> ${email}
                        </small>
                        
                        <div style="
                            background: #f8f9fa;
                            border-radius: 12px;
                            padding: 20px;
                            margin: 25px 0;
                            text-align: left;
                            border-left: 4px solid #667eea;
                        ">
                            <p style="margin: 0 0 8px 0; font-weight: 600; color: #2C3E50; font-size: 15px;">
                                <i class="fas fa-tag" style="color: #667eea; margin-right: 10px;"></i> Asunto:
                            </p>
                            <p style="margin: 0 0 15px 0; color: #555; padding-left: 24px; font-size: 14px;">"${subject}"</p>
                            
                            <p style="margin: 0 0 8px 0; font-weight: 600; color: #2C3E50; font-size: 15px;">
                                <i class="fas fa-comment-alt" style="color: #667eea; margin-right: 10px;"></i> Vista previa:
                            </p>
                            <p style="margin: 0; color: #555; font-style: italic; padding-left: 24px; font-size: 14px;">
                                "${content.substring(0, 80)}${content.length > 80 ? '...' : ''}"
                            </p>
                        </div>
                        
                        <div style="
                            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
                            border-radius: 10px;
                            padding: 15px;
                            margin: 20px 0;
                            border: 1px solid #a5d6a7;
                        ">
                            <p style="margin: 0; color: #2e7d32; font-size: 14px; text-align: center;">
                                <i class="fas fa-clock" style="margin-right: 8px;"></i>
                                El usuario recibirá una notificación en su bandeja de entrada
                            </p>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: '¡Perfecto! 👍',
            confirmButtonColor: '#2ecc71',
            customClass: {
                confirmButton: 'btn-success-ok'
            },
            width: 600
        });
        
        // Log para depuración
        console.log('Mensaje enviado exitosamente:', {
            destinatario_email: email,
            destinatario_nombre: nombre,
            asunto: subject,
            contenido_longitud: content.length,
            remitente_id: remitenteId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error inesperado al enviar mensaje:', error);
        
        // Cerrar modal de carga
        Swal.close();
        
        // Mostrar error
        Swal.fire({
            icon: 'error',
            title: 'Error inesperado',
            text: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
            confirmButtonColor: '#667eea',
            customClass: {
                popup: 'premium-message-modal'
            }
        });
    }
}

// Función para copiar sugerencia (mantener compatibilidad)
function copiarSugerencia(elemento) {
    const texto = elemento.querySelector('p').textContent;
    copiarSugerenciaDesdeModal(texto, elemento);
}

// Función para mostrar sugerencias (mantener compatibilidad)
function mostrarSugerencias() {
    cambiarSugerenciasRapidas();
}

// AGREGAR ESTA FUNCIÓN PARA DEFINIR currentUserId SI NO EXISTE
// Colocar esto al inicio del archivo o antes de usar currentUserId
if (typeof currentUserId === 'undefined') {
    window.currentUserId = null;
    
    // Intentar inicializar al cargar
    document.addEventListener('DOMContentLoaded', function() {
        obtenerUsuarioActual();
    });
    
    async function obtenerUsuarioActual() {
        try {
            // 1. De Supabase Auth
            if (window.supabase && window.supabase.auth) {
                const { data: { user } } = await window.supabase.auth.getUser();
                if (user && user.id) {
                    window.currentUserId = user.id;
                    console.log('currentUserId definido desde Supabase Auth:', window.currentUserId);
                    return;
                }
            }
            
            // 2. De localStorage
            if (typeof localStorage !== 'undefined') {
                const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('userData');
                if (storedUser) {
                    try {
                        const user = JSON.parse(storedUser);
                        window.currentUserId = user.id || user.user_id || user.uid;
                        console.log('currentUserId definido desde localStorage:', window.currentUserId);
                        return;
                    } catch (e) {
                        console.error('Error parsing stored user:', e);
                    }
                }
            }
            
            // 3. De variable global
            if (typeof userData !== 'undefined' && userData && userData.id) {
                window.currentUserId = userData.id;
                console.log('currentUserId definido desde userData:', window.currentUserId);
                return;
            }
            
            console.warn('No se pudo obtener currentUserId');
            
        } catch (error) {
            console.error('Error obteniendo currentUserId:', error);
        }
    }
}
// Hacer disponible globalmente
window.Amigos = Amigos;