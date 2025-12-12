// modulos/interfaz.js
const Interfaz = {
    mostrarSeccion(seccionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        
        document.getElementById('welcomeMessage').style.display = 'none';
        
        const section = document.getElementById(seccionId);
        if (section) {
            section.classList.remove('hidden');
        }
        
        this.actualizarBotonActivo(seccionId);
    },

    actualizarBotonActivo(seccionId) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const btnMap = {
            'seccionBandeja': 'btnBandeja',
            'seccionNuevoMensaje': 'btnNuevoMensaje',
            'seccionNuevosAmigos': 'btnNuevosAmigos',
            'seccionMisAmigos': 'btnMisAmigos',
            'seccionMisGrupos': 'btnMisGrupos',
            'seccionCrearGrupo': 'btnCrearGrupo',
            'seccionEnviados': 'btnEnviados',
            'seccionPapelera': 'btnPapelera'
        };
        
        if (btnMap[seccionId]) {
            document.getElementById(btnMap[seccionId]).classList.add('active');
        }
    },

    configurarEventos() {
        this.configurarNavegacion();
        this.configurarBienvenida();
        this.configurarMensajes();
        this.configurarGrupos();
        this.configurarLogout();
        this.configurarActualizaciones();
    },

    configurarNavegacion() {
        document.getElementById('btnBandeja').addEventListener('click', async () => {
            this.mostrarSeccion('seccionBandeja');
            await window.Mensajes.cargarBandejaEntrada();
        });
        
        document.getElementById('btnNuevoMensaje').addEventListener('click', () => {
            this.mostrarSeccion('seccionNuevoMensaje');
        });
        
        document.getElementById('btnNuevosAmigos').addEventListener('click', async () => {
            this.mostrarSeccion('seccionNuevosAmigos');
            await window.UsuariosDisponibles.cargarUsuariosDisponibles();
        });
        
        document.getElementById('btnMisAmigos').addEventListener('click', async () => {
            this.mostrarSeccion('seccionMisAmigos');
            await window.Amigos.cargarAmigos();
        });
        
        document.getElementById('btnMisGrupos').addEventListener('click', async () => {
            this.mostrarSeccion('seccionMisGrupos');
            await window.Grupos.cargarMisGrupos();
        });
        
        document.getElementById('btnCrearGrupo').addEventListener('click', async () => {
            this.mostrarSeccion('seccionCrearGrupo');
            await window.Grupos.cargarAmigosParaGrupo();
        });
        
        document.getElementById('btnEnviados').addEventListener('click', () => {
            this.mostrarSeccion('seccionEnviados');
        });
        
        document.getElementById('btnPapelera').addEventListener('click', () => {
            this.mostrarSeccion('seccionPapelera');
        });
    },

    configurarBienvenida() {
        document.getElementById('btnExplorarAmigos').addEventListener('click', async () => {
            this.mostrarSeccion('seccionNuevosAmigos');
            await window.UsuariosDisponibles.cargarUsuariosDisponibles();
        });
        
        document.getElementById('btnEnviarPrimerMensaje').addEventListener('click', () => {
            this.mostrarSeccion('seccionNuevoMensaje');
        });
    },

    configurarMensajes() {
        const form = document.getElementById('formNuevoMensaje');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const destinatario = document.getElementById('destinatario').value.trim();
                const asunto = document.getElementById('asunto').value.trim();
                const contenido = document.getElementById('contenido').value.trim();
                
                if (!destinatario || !asunto || !contenido) {
                    window.Utilidades.mostrarAlerta('Error', 'Completa todos los campos', 'error');
                    return;
                }
                
                try {
                    const { data: destinatarioData, error } = await window.supabase
                        .from('usuarios')
                        .select('id')
                        .eq('email', destinatario)
                        .single();
                    
                    if (error) throw error;
                    
                    const { data: mensajeEnviado, error: insertError } = await window.supabase
                        .from('mensajes')
                        .insert([{
                            remitente_id: window.usuarioIdActual,
                            destinatario_email: destinatario,
                            asunto: asunto,
                            contenido: contenido,
                            leido: false
                        }])
                        .select()
                        .single();
                    
                    if (insertError) throw insertError;
                    
                    document.getElementById('formNuevoMensaje').reset();
                    window.Utilidades.mostrarAlerta('Mensaje enviado', 'Tu mensaje ha sido enviado', 'success');
                    this.mostrarSeccion('seccionBandeja');
                    await window.Mensajes.cargarBandejaEntrada();
                    
                } catch (error) {
                    console.error('Error al enviar mensaje:', error);
                    window.Utilidades.mostrarAlerta('Error', 'No se pudo enviar el mensaje', 'error');
                }
            });
        }
        
        document.getElementById('btnCancelarMensaje').addEventListener('click', () => {
            document.getElementById('formNuevoMensaje').reset();
            this.mostrarSeccion('seccionBandeja');
        });
    },

    configurarGrupos() {
    // Formulario crear grupo (existente)
    const formCrearGrupo = document.getElementById('formCrearGrupo');
    if (formCrearGrupo) {
        formCrearGrupo.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombreGrupo').value.trim();
            const descripcion = document.getElementById('descripcionGrupo').value.trim();
            
            if (!nombre) {
                window.Utilidades.mostrarAlerta('Error', 'El nombre del grupo es requerido', 'error');
                return;
            }
            
            try {
                const nuevoGrupo = await window.Grupos.crearGrupo(nombre, descripcion);
                
                document.getElementById('formCrearGrupo').reset();
                window.Utilidades.mostrarAlerta('Grupo creado', `El grupo "${nombre}" ha sido creado`, 'success');
                
                this.mostrarSeccion('seccionMisGrupos');
                await window.Grupos.cargarMisGrupos();
                
            } catch (error) {
                console.error('Error al crear grupo:', error);
                window.Utilidades.mostrarAlerta('Error', 'No se pudo crear el grupo', 'error');
            }
        });
    }
    
    document.getElementById('btnCancelarGrupo').addEventListener('click', () => {
        document.getElementById('formCrearGrupo').reset();
        this.mostrarSeccion('seccionMisGrupos');
    });
    
    // Configurar formulario de mensajes de grupo CON ARCHIVOS
    this.configurarFormularioMensajeGrupo();
    
    // Configurar botón volver de detalle de grupo
    document.getElementById('btnVolverGrupos').addEventListener('click', () => {
        this.mostrarSeccion('seccionMisGrupos');
    });
},

configurarFormularioMensajeGrupo() {
    const formMensajeGrupo = document.getElementById('formMensajeGrupo');
    const btnAdjuntar = document.getElementById('btnAdjuntarArchivoGrupo');
    const inputArchivo = document.getElementById('inputArchivoGrupo');
    const contenedorArchivos = document.getElementById('archivosSeleccionadosGrupo');
    
    let archivosSeleccionados = [];
    
    // Configurar botón de adjuntar
    if (btnAdjuntar && inputArchivo) {
        btnAdjuntar.addEventListener('click', () => {
            inputArchivo.click();
        });
        
        inputArchivo.addEventListener('change', (e) => {
            const nuevosArchivos = Array.from(e.target.files);
            
            // Validar tamaño total de archivos (máximo 10MB por ahora)
            const tamañoTotal = nuevosArchivos.reduce((total, file) => total + file.size, 0);
            const tamañoMaximo = 10 * 1024 * 1024; // 10MB
            
            if (tamañoTotal > tamañoMaximo) {
                window.Utilidades.mostrarAlerta('Error', 'El tamaño total de los archivos no debe exceder 10MB', 'error');
                return;
            }
            
            // Agregar nuevos archivos a la lista
            archivosSeleccionados = [...archivosSeleccionados, ...nuevosArchivos];
            this.actualizarVistaArchivosGrupo(archivosSeleccionados, contenedorArchivos);
        });
    }
    
    // Configurar envío del formulario
    if (formMensajeGrupo) {
        formMensajeGrupo.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const mensaje = document.getElementById('mensajeGrupo').value.trim();
            const grupoActual = window.Grupos.grupoActual;
            
            if ((!mensaje || mensaje.trim() === '') && archivosSeleccionados.length === 0) {
                window.Utilidades.mostrarAlerta('Error', 'Escribe un mensaje o selecciona un archivo', 'error');
                return;
            }
            
            if (!grupoActual) {
                window.Utilidades.mostrarAlerta('Error', 'No hay grupo seleccionado', 'error');
                return;
            }
            
            try {
                // Si hay archivos, subirlos primero
                if (archivosSeleccionados.length > 0) {
                    // Mostrar indicador de carga
                    const btnEnviar = formMensajeGrupo.querySelector('.btn-send');
                    const iconoOriginal = btnEnviar.innerHTML;
                    btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    btnEnviar.disabled = true;
                    
                    try {
                        // Subir cada archivo
                        for (const archivo of archivosSeleccionados) {
                            const enlaceArchivo = await window.Archivos.subirArchivoSimple(archivo, 'grupos');
                            
                            // Crear mensaje con el archivo
                            const mensajeArchivo = mensaje 
                                ? `${mensaje}\n\n📎 Archivo: ${archivo.name}\n🔗 ${enlaceArchivo}`
                                : `📎 ${archivo.name}\n🔗 ${enlaceArchivo}`;
                            
                            // Enviar mensaje con el archivo
                            const exito = await window.Grupos.enviarMensajeGrupo(
                                grupoActual.id, 
                                mensajeArchivo
                            );
                            
                            if (!exito) {
                                throw new Error('Error al enviar mensaje con archivo');
                            }
                        }
                        
                        // Si hay mensaje de texto además de archivos
                        if (mensaje && archivosSeleccionados.length === 0) {
                            await window.Grupos.enviarMensajeGrupo(grupoActual.id, mensaje);
                        }
                        
                        // Limpiar formulario
                        document.getElementById('mensajeGrupo').value = '';
                        archivosSeleccionados = [];
                        this.actualizarVistaArchivosGrupo(archivosSeleccionados, contenedorArchivos);
                        
                        // Recargar el detalle del grupo
                        await window.Grupos.verDetalleGrupo(grupoActual.id);
                        
                    } finally {
                        // Restaurar botón
                        btnEnviar.innerHTML = iconoOriginal;
                        btnEnviar.disabled = false;
                    }
                } else {
                    // Solo mensaje de texto
                    const exito = await window.Grupos.enviarMensajeGrupo(grupoActual.id, mensaje);
                    
                    if (exito) {
                        document.getElementById('mensajeGrupo').value = '';
                        // Recargar el detalle del grupo
                        await window.Grupos.verDetalleGrupo(grupoActual.id);
                    } else {
                        window.Utilidades.mostrarAlerta('Error', 'No se pudo enviar el mensaje', 'error');
                    }
                }
                
            } catch (error) {
                console.error('Error al enviar mensaje con archivos:', error);
                window.Utilidades.mostrarAlerta('Error', 'No se pudo enviar el mensaje', 'error');
            }
        });
    }
},

actualizarVistaArchivosGrupo(archivos, contenedor) {
    if (!contenedor) return;
    
    if (archivos.length === 0) {
        contenedor.style.display = 'none';
        contenedor.innerHTML = '';
        return;
    }
    
    contenedor.style.display = 'block';
    
    let html = '<div style="margin-bottom: 5px; font-size: 12px; color: #666;">Archivos seleccionados:</div>';
    
    archivos.forEach((archivo, index) => {
        const tamaño = this.formatearTamañoArchivo(archivo.size);
        const icono = this.obtenerIconoArchivo(archivo.name);
        
        html += `
            <div class="selected-file-item" data-index="${index}">
                <div class="selected-file-info">
                    <i class="${icono} file-icon"></i>
                    <div style="flex: 1;">
                        <div class="file-name" title="${archivo.name}">${archivo.name}</div>
                        <div class="file-size">${tamaño}</div>
                    </div>
                </div>
                <button type="button" class="btn-remove-file" onclick="Interfaz.removerArchivoGrupo(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Mostrar vista previa para imágenes
        if (archivo.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('img');
                preview.src = e.target.result;
                preview.className = 'file-preview';
                preview.style.display = 'none';
                
                const fileItem = contenedor.querySelector(`[data-index="${index}"]`);
                if (fileItem) {
                    fileItem.insertAdjacentElement('afterend', preview);
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(archivo);
        }
    });
    
    contenedor.innerHTML = html;
},

formatearTamañoArchivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
},

obtenerIconoArchivo(nombreArchivo) {
    const extension = nombreArchivo.split('.').pop().toLowerCase();
    
    const iconos = {
        // Documentos
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'txt': 'fas fa-file-alt',
        'rtf': 'fas fa-file-alt',
        
        // Hojas de cálculo
        'xls': 'fas fa-file-excel',
        'xlsx': 'fas fa-file-excel',
        'csv': 'fas fa-file-csv',
        
        // Presentaciones
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        
        // Imágenes
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'gif': 'fas fa-file-image',
        'bmp': 'fas fa-file-image',
        'svg': 'fas fa-file-image',
        
        // Archivos
        'zip': 'fas fa-file-archive',
        'rar': 'fas fa-file-archive',
        '7z': 'fas fa-file-archive',
        
        // Código
        'js': 'fas fa-file-code',
        'html': 'fas fa-file-code',
        'css': 'fas fa-file-code',
        'json': 'fas fa-file-code',
        'xml': 'fas fa-file-code',
        
        // Audio/video
        'mp3': 'fas fa-file-audio',
        'wav': 'fas fa-file-audio',
        'mp4': 'fas fa-file-video',
        'avi': 'fas fa-file-video',
        'mov': 'fas fa-file-video'
    };
    
    return iconos[extension] || 'fas fa-file';
},

removerArchivoGrupo(index) {
    // Esta función debe ser global para que funcione desde el onclick
    const inputArchivo = document.getElementById('inputArchivoGrupo');
    const contenedorArchivos = document.getElementById('archivosSeleccionadosGrupo');
    
    // Obtener archivos actuales del input
    const dt = new DataTransfer();
    const archivosInput = inputArchivo.files;
    
    // Reconstruir lista de archivos excluyendo el índice
    for (let i = 0; i < archivosInput.length; i++) {
        if (i !== index) {
            dt.items.add(archivosInput[i]);
        }
    }
    
    // Actualizar input de archivos
    inputArchivo.files = dt.files;
    
    // Actualizar lista de archivos seleccionados
    const nuevosArchivos = Array.from(inputArchivo.files);
    this.actualizarVistaArchivosGrupo(nuevosArchivos, contenedorArchivos);
},

    configurarDetalleMensaje() {
        
        // Configurar botón volver de detalle de grupo
        document.getElementById('btnVolverGrupos').addEventListener('click', () => {
            this.mostrarSeccion('seccionMisGrupos');
        });
    },

    configurarLogout() {
        document.getElementById('btnLogout').addEventListener('click', () => {
            window.Autenticacion.cerrarSesion();
        });
    },

    configurarActualizaciones() {
        document.getElementById('btnRefreshBandeja').addEventListener('click', async () => {
            await window.Mensajes.cargarBandejaEntrada();
            window.Utilidades.mostrarAlerta('Bandeja actualizada', 'Los mensajes se han actualizado', 'info');
        });
        
        document.getElementById('btnRefreshAmigos').addEventListener('click', async () => {
            await window.UsuariosDisponibles.cargarUsuariosDisponibles();
            window.Utilidades.mostrarAlerta('Lista actualizada', 'Los usuarios se han actualizado', 'info');
        });
        
        document.getElementById('btnRefreshAmigosLista').addEventListener('click', async () => {
            await window.Amigos.cargarAmigos();
            window.Utilidades.mostrarAlerta('Amigos actualizados', 'Tu lista de amigos se ha actualizado', 'info');
        });
        
        document.getElementById('btnRefreshGrupos').addEventListener('click', async () => {
            await window.Grupos.cargarMisGrupos();
            window.Utilidades.mostrarAlerta('Grupos actualizados', 'La lista de grupos se ha actualizado', 'info');
        });
    }
};

// Hacer disponible globalmente
window.Interfaz = Interfaz;

// Función global para remover archivos (necesaria para onclick)
window.Interfaz.removerArchivoGrupo = function(index) {
    const inputArchivo = document.getElementById('inputArchivoGrupo');
    const contenedorArchivos = document.getElementById('archivosSeleccionadosGrupo');
    
    if (!inputArchivo || !contenedorArchivos) return;
    
    // Obtener archivos actuales
    const archivosActuales = Array.from(inputArchivo.files);
    
    // Remover archivo por índice
    archivosActuales.splice(index, 1);
    
    // Actualizar input de archivos
    const dt = new DataTransfer();
    archivosActuales.forEach(archivo => dt.items.add(archivo));
    inputArchivo.files = dt.files;
    
    // Actualizar vista
    this.actualizarVistaArchivosGrupo(archivosActuales, contenedorArchivos);
};