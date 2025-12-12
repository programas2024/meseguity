// modulos/archivos.js - VERSIÓN FINAL CORREGIDA
const Archivos = {
    MAX_SIZE_MB: 50, // Aumentado a 50MB
    MAX_SIZE_BYTES: 50 * 1024 * 1024,
    MIN_SIZE_BYTES: 1,
    
    BUCKET_NAME: 'mensajes-archivos',
    supabase: null,
    bucketConfigurado: false,
    
    async inicializarStorage() {
        try {
            console.log('🚀 Inicializando sistema de archivos...');
            
            if (!window.supabase) {
                console.error('❌ Supabase no está disponible');
                return false;
            }
            
            this.supabase = window.supabase;
            
            // Intentar acceder al bucket para verificar si existe
            try {
                const { data, error } = await this.supabase
                    .storage
                    .from(this.BUCKET_NAME)
                    .list();
                
                if (error) {
                    if (error.message.includes('not found') || error.message.includes('bucket')) {
                        console.error('❌ El bucket no existe:', error.message);
                        this.mostrarInstruccionesCrearBucket();
                        return false;
                    }
                    throw error;
                }
                
                console.log('✅ Bucket encontrado y accesible');
                this.bucketConfigurado = true;
                return true;
                
            } catch (error) {
                console.error('❌ Error accediendo al bucket:', error);
                this.mostrarInstruccionesCrearBucket();
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error al inicializar storage:', error);
            return false;
        }
    },
    
    mostrarInstruccionesCrearBucket() {
        console.log(`
        ⚠️ **EL BUCKET NO EXISTE O NO ESTÁ CONFIGURADO**
        
        1. Ve a tu proyecto en Supabase: https://supabase.com
        2. Haz clic en "Storage" en el menú lateral
        3. Haz clic en "Create new bucket"
        4. Configuración:
           - **Bucket name:** ${this.BUCKET_NAME}
           - **Public bucket:** ✅ Activado
           - **File size limit:** ${this.MAX_SIZE_MB}MB o más
           - **Allowed MIME types:** Dejar vacío para permitir todos
        
        5. **CONFIGURA LAS POLÍTICAS (IMPORTANTE):**
           a. Haz clic en el bucket "${this.BUCKET_NAME}"
           b. Haz clic en "Policies"
           c. Haz clic en "New Policy" → "Create a policy from scratch"
           
           **Política 1 - Lectura pública:**
           - Name: Public read access
           - Operation: SELECT
           - Expression: true
           
           **Política 2 - Subida por usuarios autenticados:**
           - Name: Authenticated users can upload
           - Operation: INSERT
           - Expression: auth.role() = 'authenticated'
        
        Sin estas políticas, no podrás subir archivos.
        `);
    },

    async mostrarSelectorArchivos(grupoId) {
        try {
            // Verificar inicialización
            if (!this.supabase) {
                const inicializado = await this.inicializarStorage();
                if (!inicializado) {
                    window.Utilidades.mostrarAlerta(
                        'Sistema de archivos no disponible',
                        'El bucket de almacenamiento no está configurado. Contacta al administrador.',
                        'error'
                    );
                    return null;
                }
            }
            
            const inputId = `file-input-${Date.now()}`;
            
            // Remover input anterior si existe
            const inputExistente = document.getElementById(inputId);
            if (inputExistente) inputExistente.remove();
            
            // Crear input de archivo
            const fileInput = document.createElement('input');
            fileInput.id = inputId;
            fileInput.type = 'file';
            fileInput.style.display = 'none';
            fileInput.accept = '*/*'; // Permitir todos los tipos
            fileInput.multiple = false;
            
            fileInput.addEventListener('change', async (e) => {
                const archivos = Array.from(e.target.files);
                
                if (archivos.length === 0) return;
                
                const archivo = archivos[0];
                
                try {
                    // Validar tamaño
                    if (archivo.size > this.MAX_SIZE_BYTES) {
                        window.Utilidades.mostrarAlerta(
                            'Archivo muy grande', 
                            `Máximo permitido: ${this.MAX_SIZE_MB}MB`, 
                            'error'
                        );
                        return;
                    }
                    
                    // Mostrar indicador de carga
                    const indicadorId = this.mostrarIndicadorCarga(archivo);
                    
                    // Subir archivo
                    const resultado = await this.subirArchivoSimple(archivo, grupoId);
                    
                    if (resultado && resultado.url) {
                        // Actualizar indicador a éxito
                        this.actualizarIndicadorCarga(indicadorId, 'success', 'Subido correctamente');
                        
                        // Añadir al textarea
                        await this.agregarArchivoATextarea(archivo, resultado.url, grupoId);
                        
                        // Remover indicador después de 3 segundos
                        setTimeout(() => {
                            this.removerIndicadorCarga(indicadorId);
                        }, 3000);
                    }
                    
                } catch (error) {
                    console.error('Error procesando archivo:', error);
                    window.Utilidades.mostrarAlerta('Error', 'No se pudo subir el archivo', 'error');
                } finally {
                    // Limpiar input
                    fileInput.value = '';
                    // Remover input del DOM después de un tiempo
                    setTimeout(() => {
                        if (document.getElementById(inputId)) {
                            document.getElementById(inputId).remove();
                        }
                    }, 1000);
                }
            });
            
            document.body.appendChild(fileInput);
            fileInput.click();
            
            return fileInput;
            
        } catch (error) {
            console.error('Error mostrando selector de archivos:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo abrir el selector de archivos', 'error');
            return null;
        }
    },

    async subirArchivoSimple(archivo, grupoId) {
        try {
            console.log(`📤 Subiendo archivo: ${archivo.name}`);
            
            // Generar nombre único para el archivo
            const nombreOriginal = archivo.name;
            const extension = nombreOriginal.split('.').pop().toLowerCase();
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 10);
            const nombreSeguro = `${timestamp}-${randomId}.${extension}`;
            
            // Ruta CORREGIDA: grupos/{grupoId}/{archivo}
            const ruta = `grupos/${grupoId}/${nombreSeguro}`;
            
            console.log(`📁 Ruta de almacenamiento: ${ruta}`);
            
            // Subir archivo a Supabase Storage
            const { data, error } = await this.supabase.storage
                .from(this.BUCKET_NAME)
                .upload(ruta, archivo, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: archivo.type || 'application/octet-stream'
                });
            
            if (error) {
                console.error('❌ Error al subir:', error);
                
                if (error.message.includes('not found') || error.message.includes('bucket')) {
                    throw new Error(`El bucket "${this.BUCKET_NAME}" no existe. Créalo manualmente en Supabase.`);
                } else if (error.message.includes('row-level security')) {
                    throw new Error('Faltan políticas de seguridad. Configura las políticas en Supabase Storage.');
                }
                throw error;
            }
            
            console.log('✅ Archivo subido exitosamente:', data);
            
            // Obtener URL pública - FORMA SEGURA
            const { data: urlData } = this.supabase.storage
                .from(this.BUCKET_NAME)
                .getPublicUrl(ruta);
            
            console.log('📊 URL Data recibida:', urlData);
            
            // EXTRAER LA URL - ESTO ES IMPORTANTE
            let urlPublica = '';
            
            if (urlData && typeof urlData === 'object') {
                // La URL está en urlData.publicUrl
                urlPublica = urlData.publicUrl;
                console.log('🔗 URL extraída:', urlPublica);
            }
            
            // Si no se pudo extraer, crear URL manualmente
            if (!urlPublica || typeof urlPublica !== 'string') {
                urlPublica = this.crearUrlManual(ruta);
                console.log('⚠️ Usando URL manual:', urlPublica);
            }
            
            return {
                nombre: nombreOriginal,
                url: urlPublica, // ¡ESTO DEBE SER UNA STRING!
                ruta: data.path,
                tipo: archivo.type,
                tamaño: archivo.size
            };
            
        } catch (error) {
            console.error('❌ Error al subir archivo:', error);
            
            let mensaje = 'No se pudo subir el archivo. ';
            if (error.message.includes('bucket')) {
                mensaje += 'El bucket de almacenamiento no está configurado. ';
                mensaje += 'Contacta al administrador.';
            } else if (error.message.includes('security')) {
                mensaje += 'Faltan políticas de seguridad en el bucket. ';
                mensaje += 'Configura las políticas en Supabase Storage.';
            } else {
                mensaje += error.message || 'Error desconocido.';
            }
            
            window.Utilidades.mostrarAlerta('Error', mensaje, 'error');
            throw error;
        }
    },

    crearUrlManual(ruta) {
        if (!this.supabase || !this.supabase.supabaseUrl) {
            console.error('No se puede crear URL: supabase no está inicializado');
            return '';
        }
        
        // Construir URL manualmente
        const url = `${this.supabase.supabaseUrl}/storage/v1/object/public/${this.BUCKET_NAME}/${ruta}`;
        console.log('🔧 URL manual creada:', url);
        return url;
    },

   async agregarArchivoATextarea(archivo, url, grupoId) {
    try {
        const textarea = document.getElementById('mensajeGrupo');
        if (!textarea) {
            console.error('No se encontró el textarea');
            return;
        }
        
        const mensajeActual = textarea.value.trim();
        const extension = archivo.name.split('.').pop().toLowerCase();
        
        // Determinar emoji según tipo de archivo
        let emoji = '📎';
        const esImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension);
        const esPDF = extension === 'pdf';
        const esDocumento = ['doc', 'docx', 'txt', 'rtf'].includes(extension);
        const esHojaCalculo = ['xls', 'xlsx', 'csv'].includes(extension);
        const esPresentacion = ['ppt', 'pptx'].includes(extension);
        const esAudio = ['mp3', 'wav', 'ogg'].includes(extension);
        const esVideo = ['mp4', 'avi', 'mov', 'wmv'].includes(extension);
        const esComprimido = ['zip', 'rar', '7z'].includes(extension);
        
        if (esImagen) emoji = '🖼️';
        else if (esPDF) emoji = '📄';
        else if (esDocumento) emoji = '📝';
        else if (esHojaCalculo) emoji = '📊';
        else if (esPresentacion) emoji = '📽️';
        else if (esAudio) emoji = '🎵';
        else if (esVideo) emoji = '🎬';
        else if (esComprimido) emoji = '🗜️';
        
        // Crear HTML del archivo para mostrar en el chat
        const idArchivo = `archivo-${Date.now()}`;
        const htmlArchivo = this.generarHTMLArchivoChat(archivo, url, idArchivo, esImagen);
        
        // Agregar marcador especial al textarea
        const marcador = `[ARCHIVO:${idArchivo}]`;
        
        if (mensajeActual) {
            textarea.value = `${mensajeActual}\n\n${marcador}`;
        } else {
            textarea.value = marcador;
        }
        
        // Ajustar altura del textarea
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
        
        // Enfocar el textarea
        textarea.focus();
        
        // Almacenar el HTML del archivo en data attribute
        textarea.dataset[`archivo_${idArchivo}`] = htmlArchivo;
        
        // Mostrar mensaje de éxito
        window.Utilidades.mostrarAlerta(
            'Archivo preparado',
            'El archivo está listo para enviar. Haz clic en "Enviar" para compartirlo.',
            'success',
            3000
        );
        
    } catch (error) {
        console.error('Error agregando archivo al textarea:', error);
    }
},

generarHTMLArchivoChat(archivo, url, idArchivo, esImagen) {
    const extension = archivo.name.split('.').pop().toLowerCase();
    const tamañoFormateado = this.formatearTamano(archivo.size);
    
    // Icono según tipo de archivo
    let icono = 'fa-file';
    let color = '#666';
    
    if (esImagen) {
        icono = 'fa-image';
        color = '#4CAF50';
    } else if (extension === 'pdf') {
        icono = 'fa-file-pdf';
        color = '#F44336';
    } else if (['doc', 'docx'].includes(extension)) {
        icono = 'fa-file-word';
        color = '#2196F3';
    } else if (['xls', 'xlsx'].includes(extension)) {
        icono = 'fa-file-excel';
        color = '#4CAF50';
    } else if (['ppt', 'pptx'].includes(extension)) {
        icono = 'fa-file-powerpoint';
        color = '#FF9800';
    } else if (['zip', 'rar', '7z'].includes(extension)) {
        icono = 'fa-file-archive';
        color = '#795548';
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        icono = 'fa-file-audio';
        color = '#9C27B0';
    } else if (['mp4', 'avi', 'mov'].includes(extension)) {
        icono = 'fa-file-video';
        color = '#E91E63';
    }
    
    if (esImagen) {
        // HTML para imágenes con miniatura
        return `
            <div class="mensaje-archivo-chat" id="${idArchivo}">
                <div class="archivo-header">
                    <i class="fas ${icono}" style="color: ${color};"></i>
                    <span class="archivo-nombre">${archivo.name}</span>
                    <span class="archivo-tamano">(${tamañoFormateado})</span>
                </div>
                <div class="archivo-contenido">
                    <div class="imagen-miniatura" onclick="Archivos.mostrarImagenCompleta('${url}', '${archivo.name}')">
                        <img src="${url}" alt="${archivo.name}" loading="lazy" style="max-width: 200px; max-height: 150px; border-radius: 5px;">
                        <div class="imagen-overlay">
                            <i class="fas fa-expand"></i>
                        </div>
                    </div>
                    <div class="archivo-acciones">
                        <button onclick="Archivos.descargarArchivo('${url}', '${archivo.name}')">
                            <i class="fas fa-download"></i> Descargar
                        </button>
                        <button onclick="window.open('${url}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> Abrir
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        // HTML para otros tipos de archivo
        return `
            <div class="mensaje-archivo-chat" id="${idArchivo}">
                <div class="archivo-header">
                    <i class="fas ${icono}" style="color: ${color}; font-size: 24px;"></i>
                    <div class="archivo-info">
                        <div class="archivo-nombre">${archivo.name}</div>
                        <div class="archivo-detalles">
                            <span>${tamañoFormateado}</span>
                            <span>•</span>
                            <span>${extension.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <div class="archivo-acciones">
                    <button onclick="Archivos.descargarArchivo('${url}', '${archivo.name}')">
                        <i class="fas fa-download"></i> Descargar
                    </button>
                    <button onclick="window.open('${url}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Abrir
                    </button>
                    ${extension === 'pdf' ? `
                    <button onclick="Archivos.verPDF('${url}', '${archivo.name}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
},

// Agrega estas funciones también
mostrarImagenCompleta(url, nombre) {
    const modalHTML = `
        <div class="modal-imagen-full" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        ">
            <div style="
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
            ">
                <img src="${url}" alt="${nombre}" style="
                    max-width: 100%;
                    max-height: 90vh;
                    border-radius: 5px;
                ">
                <div style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    font-size: 14px;
                ">
                    ${nombre}
                </div>
                <button onclick="this.parentNode.parentNode.remove()" style="
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <i class="fas fa-times"></i>
                </button>
                <button onclick="Archivos.descargarArchivo('${url}', '${nombre}')" style="
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <i class="fas fa-download"></i> Descargar
                </button>
            </div>
        </div>
    `;
    
    // Remover modal existente
    const modalExistente = document.querySelector('.modal-imagen-full');
    if (modalExistente) modalExistente.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
},

async descargarArchivo(url, nombre) {
    try {
        // Crear enlace temporal para descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = nombre;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.Utilidades.mostrarAlerta('Descarga iniciada', `Descargando: ${nombre}`, 'info', 2000);
    } catch (error) {
        console.error('Error al descargar:', error);
        window.Utilidades.mostrarAlerta('Error', 'No se pudo descargar el archivo', 'error');
    }
},

verPDF(url, nombre) {
    // Abrir PDF en nueva pestaña
    window.open(url, '_blank');
    
    // O mostrar en modal
    const modalHTML = `
        <div class="modal-pdf" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 10000;
            display: flex;
            flex-direction: column;
        ">
            <div style="
                padding: 15px;
                background: #f5f5f5;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #ddd;
            ">
                <h3 style="margin: 0;">${nombre}</h3>
                <button onclick="this.parentNode.parentNode.remove()" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <iframe src="${url}" style="
                flex: 1;
                border: none;
                width: 100%;
            "></iframe>
            <div style="
                padding: 15px;
                background: #f5f5f5;
                border-top: 1px solid #ddd;
                display: flex;
                gap: 10px;
            ">
                <button onclick="Archivos.descargarArchivo('${url}', '${nombre}')" style="
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <i class="fas fa-download"></i> Descargar
                </button>
                <button onclick="window.open('${url}', '_blank')" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <i class="fas fa-external-link-alt"></i> Abrir en nueva pestaña
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
},

    mostrarIndicadorCarga(archivo) {
        const indicadorId = `carga-${Date.now()}`;
        
        const indicadorHTML = `
            <div id="${indicadorId}" class="indicador-carga-archivo">
                <div class="indicador-contenido">
                    <div class="indicador-info">
                        <i class="fas fa-file-upload"></i>
                        <div>
                            <div class="indicador-nombre" title="${archivo.name}">${archivo.name}</div>
                            <div class="indicador-progreso">
                                <div class="progreso-bar">
                                    <div class="progreso-fill"></div>
                                </div>
                                <span>Subiendo...</span>
                            </div>
                        </div>
                    </div>
                    <div class="indicador-tamano">${this.formatearTamano(archivo.size)}</div>
                </div>
            </div>
        `;
        
        // Añadir al contenedor de indicadores
        let contenedor = document.getElementById('indicadores-carga');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'indicadores-carga';
            contenedor.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(contenedor);
        }
        
        contenedor.insertAdjacentHTML('afterbegin', indicadorHTML);
        return indicadorId;
    },

    actualizarIndicadorCarga(indicadorId, estado, mensaje) {
        const indicador = document.getElementById(indicadorId);
        if (!indicador) return;
        
        const progresoFill = indicador.querySelector('.progreso-fill');
        const textoProgreso = indicador.querySelector('.indicador-progreso span');
        const icono = indicador.querySelector('.indicador-info i');
        
        if (estado === 'success') {
            indicador.classList.add('indicador-success');
            if (progresoFill) {
                progresoFill.style.width = '100%';
                progresoFill.style.background = '#4caf50';
                progresoFill.style.animation = 'none';
            }
            if (textoProgreso) textoProgreso.textContent = mensaje;
            if (icono) {
                icono.className = 'fas fa-check-circle';
                icono.style.color = '#4caf50';
            }
        } else if (estado === 'error') {
            indicador.classList.add('indicador-error');
            if (progresoFill) {
                progresoFill.style.width = '100%';
                progresoFill.style.background = '#f44336';
                progresoFill.style.animation = 'none';
            }
            if (textoProgreso) textoProgreso.textContent = mensaje;
            if (icono) {
                icono.className = 'fas fa-times-circle';
                icono.style.color = '#f44336';
            }
        }
    },

    removerIndicadorCarga(indicadorId) {
        const indicador = document.getElementById(indicadorId);
        if (indicador) {
            indicador.style.transition = 'all 0.3s ease';
            indicador.style.opacity = '0';
            indicador.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (indicador.parentNode) {
                    indicador.parentNode.removeChild(indicador);
                }
            }, 300);
        }
    },

    formatearTamano(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const unidades = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        const tamanoFormateado = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        return `${tamanoFormateado} ${unidades[i]}`;
    },

    agregarBotonArchivosAGrupo(grupoId) {
        const formMensaje = document.getElementById('formMensajeGrupo');
        if (!formMensaje) return;
        
        const textarea = formMensaje.querySelector('textarea');
        if (!textarea) return;
        
        // Buscar o crear contenedor de botones
        let botonesContenedor = textarea.parentNode.querySelector('.mensaje-botones');
        if (!botonesContenedor) {
            botonesContenedor = document.createElement('div');
            botonesContenedor.className = 'mensaje-botones';
            botonesContenedor.style.cssText = `
                display: flex;
                gap: 10px;
                margin-top: 10px;
                align-items: center;
            `;
            
            // Insertar después del textarea
            textarea.parentNode.insertBefore(botonesContenedor, textarea.nextSibling);
        }
        
        // Verificar si ya existe el botón
        if (botonesContenedor.querySelector('.btn-adjuntar-archivo')) {
            return;
        }
        
        // Crear botón de adjuntar
        const btnAdjuntar = document.createElement('button');
        btnAdjuntar.type = 'button';
        btnAdjuntar.className = 'btn-adjuntar-archivo';
        btnAdjuntar.innerHTML = '<i class="fas fa-paperclip"></i> Adjuntar archivo';
        btnAdjuntar.title = 'Adjuntar archivo';
        btnAdjuntar.style.cssText = `
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 20px;
            padding: 8px 16px;
            cursor: pointer;
            color: #495057;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        `;
        
        btnAdjuntar.addEventListener('mouseenter', () => {
            btnAdjuntar.style.background = '#e9ecef';
            btnAdjuntar.style.borderColor = '#adb5bd';
            btnAdjuntar.style.color = '#212529';
        });
        
        btnAdjuntar.addEventListener('mouseleave', () => {
            btnAdjuntar.style.background = '#f8f9fa';
            btnAdjuntar.style.borderColor = '#dee2e6';
            btnAdjuntar.style.color = '#495057';
        });
        
        btnAdjuntar.addEventListener('click', async () => {
            await this.mostrarSelectorArchivos(grupoId);
        });
        
        botonesContenedor.appendChild(btnAdjuntar);
    }
};

// Hacer disponible globalmente
window.Archivos = Archivos;

// Agregar estilos CSS dinámicamente
document.addEventListener('DOMContentLoaded', () => {
    const estilos = `
        <style>
            .indicador-carga-archivo {
                background: white;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-left: 4px solid #1a73e8;
                animation: slideIn 0.3s ease;
                max-width: 350px;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .indicador-contenido {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .indicador-info {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .indicador-info i {
                font-size: 20px;
                color: #1a73e8;
            }
            
            .indicador-nombre {
                font-weight: 600;
                font-size: 14px;
                color: #333;
                margin-bottom: 4px;
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .indicador-progreso {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .progreso-bar {
                width: 120px;
                height: 6px;
                background: #f0f0f0;
                border-radius: 3px;
                overflow: hidden;
            }
            
            .progreso-fill {
                width: 30%;
                height: 100%;
                background: #1a73e8;
                border-radius: 3px;
                animation: progressAnimation 2s infinite linear;
            }
            
            @keyframes progressAnimation {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
            }
            
            .indicador-progreso span {
                font-size: 12px;
                color: #666;
            }
            
            .indicador-tamano {
                font-size: 12px;
                color: #888;
                white-space: nowrap;
            }
            
            .indicador-success {
                border-left-color: #4caf50;
            }
            
            .indicador-error {
                border-left-color: #f44336;
            }
            
            .mensaje-botones {
                display: flex;
                gap: 10px;
                margin-top: 10px;
                align-items: center;
            }
            
            .btn-adjuntar-archivo {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 20px;
                padding: 8px 16px;
                cursor: pointer;
                color: #495057;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .btn-adjuntar-archivo:hover {
                background: #e9ecef;
                border-color: #adb5bd;
                color: #212529;
            }
        </style>
    `;
    
    // Agregar estilos al head
    if (!document.querySelector('#estilos-archivos')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'estilos-archivos';
        styleElement.innerHTML = estilos;
        document.head.appendChild(styleElement);
    }
});