// modulos/afinidad.js
const Afinidad = {
    tiposAfinidad: [
        { value: 'hermanos', label: 'Hermanos', icon: 'fas fa-handshake', color: '#FF6B6B', description: 'Como de la familia' },
        { value: 'confidentes', label: 'Confidentes', icon: 'fas fa-heart', color: '#4ECDC4', description: 'Comparten secretos' },
        { value: 'amigos', label: 'Amigos', icon: 'fas fa-user-friends', color: '#45B7D1', description: 'Buena amistad' }
    ],

    async cargarAfinidades() {
        try {
            console.log("🤝 Cargando afinidades...");
            
            if (!window.usuarioIdActual) {
                console.error('❌ No hay usuarioIdActual disponible');
                return [];
            }
            
            const { data: afinidades, error } = await window.supabase
                .from('afinidades')
                .select(`
                    id,
                    usuario_id,
                    amigo_id,
                    tipo_afinidad,
                    estado,
                    nota,
                    creado_en,
                    actualizado_en,
                    usuario:usuarios!afinidades_usuario_id_fkey(id, nombre, apellidos, email, avatar_url),
                    amigo:usuarios!afinidades_amigo_id_fkey(id, nombre, apellidos, email, avatar_url)
                `)
                .or(`usuario_id.eq.${window.usuarioIdActual},amigo_id.eq.${window.usuarioIdActual}`)
                .order('actualizado_en', { ascending: false });
            
            if (error) {
                console.error('❌ Error al cargar afinidades:', error);
                throw error;
            }
            
            console.log(`✅ ${afinidades?.length || 0} afinidades cargadas`);
            
            this.procesarAfinidades(afinidades);
            this.mostrarListaAfinidades();
            this.actualizarContadorAfinidades();
            
            window.afinidades = afinidades || [];
            return window.afinidades;
            
        } catch (error) {
            console.error('❌ Error en cargarAfinidades:', error);
            window.afinidades = [];
            this.mostrarErrorAfinidades();
            return [];
        }
    },

    procesarAfinidades(afinidades) {
        window.afinidades = afinidades || [];
    },

    async mostrarModalSeleccionAfinidad() {
        try {
            console.log('🎯 Mostrando modal de selección de afinidad...');
            
            // Cargar amigos primero si no están cargados
            if (!window.listaAmigos || window.listaAmigos.length === 0) {
                await window.Amigos.cargarAmigos();
            }
            
            if (!window.listaAmigos || window.listaAmigos.length === 0) {
                await Swal.fire({
                    title: '✨ No tienes amigos',
                    html: `
                        <div style="text-align: center; padding: 20px;">
                            <div style="font-size: 60px; color: #667eea; margin-bottom: 20px;">
                                <i class="fas fa-user-friends"></i>
                            </div>
                            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                                Agrega amigos primero para establecer afinidades
                            </p>
                            <button onclick="Interfaz.mostrarSeccion('seccionNuevosAmigos')" 
                                    style="background: linear-gradient(135deg, #667eea, #764ba2); 
                                           color: white; 
                                           border: none; 
                                           padding: 12px 24px; 
                                           border-radius: 8px; 
                                           font-size: 14px; 
                                           cursor: pointer;
                                           transition: transform 0.3s ease;">
                                <i class="fas fa-user-plus"></i> Explorar amigos
                            </button>
                        </div>
                    `,
                    showConfirmButton: false,
                    width: 500
                });
                return;
            }
            
            // Crear opciones con avatar y nombre
            const opcionesHTML = window.listaAmigos.map(amigo => {
                const iniciales = window.Utilidades.obtenerIniciales(`${amigo.nombre || ''} ${amigo.apellidos || ''}`);
                return `
                    <div class="amigo-option" data-id="${amigo.id}" 
                         onclick="document.querySelector('#amigoSeleccionado').value='${amigo.id}'; 
                                  document.querySelectorAll('.amigo-option').forEach(el => el.classList.remove('selected'));
                                  this.classList.add('selected');"
                         style="display: flex; align-items: center; gap: 15px; padding: 15px; border-radius: 10px; border: 2px solid #e0e0e0; margin-bottom: 10px; cursor: pointer; transition: all 0.3s ease;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; overflow: hidden;">
                            ${amigo.avatar_url ? 
                                `<img src="${amigo.avatar_url}" alt="${amigo.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                                `<span>${iniciales}</span>`
                            }
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #333; font-size: 16px;">
                                ${amigo.nombre || ''} ${amigo.apellidos || ''}
                            </div>
                            <div style="color: #666; font-size: 14px; margin-top: 4px;">
                                ${amigo.email}
                            </div>
                        </div>
                        <div class="check-icon" style="color: #667eea; font-size: 20px; opacity: 0;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                `;
            }).join('');

            const { value: formValues } = await Swal.fire({
                title: '<div style="display: flex; align-items: center; gap: 10px; color: #667eea; font-size: 24px; font-weight: 600;"><i class="fas fa-handshake"></i> Establecer Afinidad</div>',
                html: `
                    <div style="text-align: center;">
                        <div style="margin-bottom: 25px; color: #666; font-size: 16px;">
                            Selecciona un amigo para establecer una afinidad especial
                        </div>
                        
                        <div id="amigosLista" style="max-height: 300px; overflow-y: auto; padding: 10px;">
                            ${opcionesHTML}
                        </div>
                        
                        <input type="hidden" id="amigoSeleccionado">
                        
                        <style>
                            .amigo-option:hover {
                                border-color: #667eea !important;
                                background: #f8f9ff;
                                transform: translateY(-2px);
                                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
                            }
                            .amigo-option.selected {
                                border-color: #667eea !important;
                                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                            }
                            .amigo-option.selected .check-icon {
                                opacity: 1 !important;
                            }
                        </style>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-arrow-right"></i> Siguiente',
                cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
                confirmButtonColor: '#667eea',
                cancelButtonColor: '#6c757d',
                width: 600,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                },
                customClass: {
                    confirmButton: 'swal2-confirm-custom',
                    cancelButton: 'swal2-cancel-custom'
                },
                preConfirm: () => {
                    const amigoId = document.getElementById('amigoSeleccionado').value;
                    if (!amigoId) {
                        Swal.showValidationMessage('Por favor selecciona un amigo');
                        return false;
                    }
                    return { amigoId };
                }
            });

            if (formValues && formValues.amigoId) {
                const amigo = window.listaAmigos.find(a => a.id === formValues.amigoId);
                if (amigo) {
                    await this.mostrarModalAfinidadElegante(amigo.id);
                }
            }
        } catch (error) {
            console.error('❌ Error al mostrar modal de selección:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No se pudo abrir el modal',
                confirmButtonColor: '#667eea'
            });
        }
    },

    async mostrarModalAfinidadElegante(amigoId) {
        try {
            console.log('🎯 Mostrando modal de afinidad para amigo ID:', amigoId);
            
            const { data: amigo, error } = await window.supabase
                .from('usuarios')
                .select('*')
                .eq('id', amigoId)
                .single();
            
            if (error) {
                console.error('❌ Error al obtener datos del amigo:', error);
                throw error;
            }
            
            console.log('✅ Datos del amigo obtenidos:', amigo);
            
            // Verificar si existe afinidad (en cualquier estado)
            const afinidadExistente = await this.obtenerAfinidadExistente(amigoId);
            console.log('🔍 Afinidad existente:', afinidadExistente);
            
            const iniciales = window.Utilidades.obtenerIniciales(`${amigo.nombre || ''} ${amigo.apellidos || ''}`);
            
            // Opciones de afinidad con diseño mejorado
            const opcionesHTML = this.tiposAfinidad.map(tipo => {
                const isSelected = afinidadExistente && afinidadExistente.tipo_afinidad === tipo.value;
                return `
                    <div class="afinidad-option-elegante" data-value="${tipo.value}"
                         onclick="document.querySelectorAll('.afinidad-option-elegante').forEach(el => el.classList.remove('selected'));
                                  this.classList.add('selected');
                                  document.querySelector('#tipoAfinidad').value='${tipo.value}';"
                         style="background: white; border-radius: 15px; padding: 20px; border: 2px solid ${isSelected ? tipo.color : '#e0e0e0'}; margin-bottom: 15px; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;">
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <div class="afinidad-icon" style="width: 60px; height: 60px; border-radius: 50%; background: ${tipo.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                                <i class="${tipo.icon}"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 700; color: #333; font-size: 18px; margin-bottom: 5px;">
                                    ${tipo.label}
                                </div>
                                <div style="color: #666; font-size: 14px;">
                                    ${tipo.description}
                                </div>
                            </div>
                            <div class="check-icon" style="color: ${tipo.color}; font-size: 24px; opacity: ${isSelected ? '1' : '0'};">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                        <div class="selected-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, ${tipo.color}20, ${tipo.color}10); opacity: ${isSelected ? '1' : '0'}; transition: opacity 0.3s ease;"></div>
                    </div>
                `;
            }).join('');

            const { value: formValues } = await Swal.fire({
                title: '<div style="display: flex; align-items: center; gap: 10px; color: #667eea; font-size: 28px; font-weight: 700;"><i class="fas fa-handshake"></i> Establecer Afinidad</div>',
                html: `
                    <div style="text-align: left;">
                        <!-- Header con información del amigo -->
                        <div style="background: linear-gradient(135deg, #f8f9ff, #eef1ff); border-radius: 15px; padding: 25px; margin-bottom: 30px; display: flex; align-items: center; gap: 20px;">
                            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 28px; overflow: hidden; border: 4px solid white; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);">
                                ${amigo.avatar_url ? 
                                    `<img src="${amigo.avatar_url}" alt="${amigo.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                                    `<span>${iniciales}</span>`
                                }
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #333; font-size: 22px; margin-bottom: 5px;">
                                    ${amigo.nombre || ''} ${amigo.apellidos || ''}
                                </div>
                                <div style="color: #666; font-size: 16px; margin-bottom: 10px;">
                                    <i class="fas fa-envelope"></i> ${amigo.email}
                                </div>
                                ${afinidadExistente ? 
                                    `<div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 8px 15px; border-radius: 20px; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: #1976d2;">
                                        <i class="fas fa-tag"></i>
                                        Afinidad actual: <strong style="margin-left: 5px;">${this.getTipoAfinidadLabel(afinidadExistente.tipo_afinidad)}</strong>
                                        <span style="margin-left: 8px; padding: 2px 8px; border-radius: 10px; background: ${afinidadExistente.estado === 'aceptada' ? '#4CAF50' : '#FF9800'}; color: white; font-size: 12px;">
                                            ${afinidadExistente.estado === 'aceptada' ? 'Aceptada' : 'Pendiente'}
                                        </span>
                                    </div>` : ''
                                }
                            </div>
                        </div>

                        <!-- Opciones de afinidad -->
                        <div style="margin-bottom: 25px;">
                            <div style="font-weight: 600; color: #333; font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-star" style="color: #FFC107;"></i>
                                Selecciona el tipo de afinidad:
                            </div>
                            <div id="opcionesAfinidad" style="max-height: 350px; overflow-y: auto; padding-right: 10px;">
                                ${opcionesHTML}
                            </div>
                            <input type="hidden" id="tipoAfinidad" value="${afinidadExistente ? afinidadExistente.tipo_afinidad : 'hermanos'}">
                        </div>

                        <!-- Nota personalizada -->
                        <div style="margin-bottom: 25px;">
                            <div style="font-weight: 600; color: #333; font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-edit" style="color: #9C27B0;"></i>
                                Nota personal (opcional):
                            </div>
                            <textarea id="notaAfinidad" 
                                    placeholder="Escribe un mensaje especial para tu amigo..."
                                    style="width: 100%; padding: 15px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; resize: vertical; min-height: 100px; transition: border-color 0.3s ease;"
                                    onfocus="this.style.borderColor='#667eea';"
                                    onblur="this.style.borderColor='#e0e0e0';">${afinidadExistente ? (afinidadExistente.nota || '') : ''}</textarea>
                        </div>
                    </div>

                    <style>
                        .afinidad-option-elegante:hover {
                            border-color: #667eea !important;
                            transform: translateY(-3px);
                            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
                        }
                        .afinidad-option-elegante.selected {
                            border-color: #667eea !important;
                            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
                        }
                        .afinidad-option-elegante.selected .check-icon {
                            opacity: 1 !important;
                            animation: bounceIn 0.5s ease;
                        }
                        .afinidad-option-elegante.selected .selected-overlay {
                            opacity: 1 !important;
                        }
                        @keyframes bounceIn {
                            0% { transform: scale(0.8); opacity: 0; }
                            50% { transform: scale(1.1); }
                            100% { transform: scale(1); opacity: 1; }
                        }
                        /* Scrollbar personalizado */
                        #opcionesAfinidad::-webkit-scrollbar {
                            width: 8px;
                        }
                        #opcionesAfinidad::-webkit-scrollbar-track {
                            background: #f1f1f1;
                            border-radius: 10px;
                        }
                        #opcionesAfinidad::-webkit-scrollbar-thumb {
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            border-radius: 10px;
                        }
                    </style>
                `,
                showCancelButton: true,
                confirmButtonText: `<i class="fas fa-paper-plane"></i> ${afinidadExistente ? 'Actualizar Afinidad' : 'Enviar Solicitud'}`,
                cancelButtonText: '<i class="fas fa-arrow-left"></i> Volver',
                confirmButtonColor: '#667eea',
                cancelButtonColor: '#6c757d',
                width: 700,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                },
                customClass: {
                    confirmButton: 'swal2-confirm-elegante',
                    cancelButton: 'swal2-cancel-elegante'
                },
                preConfirm: () => {
                    const tipoAfinidad = document.getElementById('tipoAfinidad').value;
                    const nota = document.getElementById('notaAfinidad').value;
                    
                    if (!tipoAfinidad) {
                        Swal.showValidationMessage('Por favor selecciona un tipo de afinidad');
                        return false;
                    }
                    
                    return { tipoAfinidad, nota };
                }
            });

            if (formValues) {
                console.log('📤 Enviando solicitud con datos:', formValues);
                
                // Mostrar loader elegante
                Swal.fire({
                    title: '<div style="font-size: 24px; color: #667eea;"><i class="fas fa-spinner fa-spin"></i></div>',
                    html: '<div style="margin-top: 20px; font-size: 16px; color: #666;">Enviando solicitud de afinidad...</div>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    width: 400
                });
                
                try {
                    // Enviar solicitud
                    console.log('🚀 Llamando a crearSolicitudAfinidad...');
                    const resultado = await this.crearSolicitudAfinidad(amigoId, formValues.tipoAfinidad, formValues.nota);
                    
                    console.log('📨 Resultado de crearSolicitudAfinidad:', resultado);
                    
                    if (resultado.success) {
                        console.log('✅ Solicitud enviada exitosamente');
                        Swal.close();
                        await Swal.fire({
                            title: '<div style="display: flex; align-items: center; gap: 10px; color: #4CAF50; font-size: 28px;"><i class="fas fa-check-circle"></i> ¡Éxito!</div>',
                            html: `
                                <div style="text-align: center; padding: 20px;">
                                    <div style="font-size: 60px; color: #4CAF50; margin-bottom: 20px;">
                                        <i class="fas fa-handshake"></i>
                                    </div>
                                    <div style="font-size: 20px; color: #333; font-weight: 600; margin-bottom: 15px;">
                                        ${afinidadExistente ? 'Afinidad actualizada' : 'Solicitud enviada'}
                                    </div>
                                    <div style="color: #666; font-size: 16px; margin-bottom: 25px;">
                                        ${afinidadExistente ? 
                                            'Tu afinidad ha sido actualizada exitosamente.' : 
                                            'Tu solicitud de afinidad ha sido enviada a tu amigo.'
                                        }
                                    </div>
                                    <div style="background: linear-gradient(135deg, #f1f8e9, #e8f5e9); border-radius: 10px; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                                        <div style="font-weight: 600; color: #2E7D32; margin-bottom: 5px;">
                                            Tipo de afinidad:
                                        </div>
                                        <div style="font-size: 18px; color: #333;">
                                            ${this.getTipoAfinidadLabel(formValues.tipoAfinidad)}
                                        </div>
                                    </div>
                                </div>
                            `,
                            confirmButtonText: '<i class="fas fa-check"></i> Continuar',
                            confirmButtonColor: '#4CAF50',
                            width: 500,
                            showClass: {
                                popup: 'animate__animated animate__zoomIn'
                            },
                            hideClass: {
                                popup: 'animate__animated animate__zoomOut'
                            }
                        });
                        
                        // Recargar afinidades
                        await this.cargarAfinidades();
                    } else {
                        console.error('❌ Error en crearSolicitudAfinidad:', resultado);
                        Swal.close();
                        throw new Error(resultado.message || 'Error al enviar la solicitud');
                    }
                } catch (error) {
                    console.error('❌ Error al procesar la solicitud:', error);
                    Swal.close();
                    await Swal.fire({
                        icon: 'error',
                        title: '<div style="color: #f44336; font-size: 24px;"><i class="fas fa-exclamation-triangle"></i> Error</div>',
                        html: `
                            <div style="color: #666; font-size: 16px;">
                                No se pudo enviar la solicitud de afinidad
                            </div>
                            ${error.message ? `<div style="color: #999; font-size: 14px; margin-top: 10px;">${error.message}</div>` : ''}
                        `,
                        confirmButtonText: '<i class="fas fa-redo"></i> Intentar nuevamente',
                        confirmButtonColor: '#f44336',
                        width: 450
                    });
                }
            }
            
        } catch (error) {
            console.error('❌ Error en mostrarModalAfinidadElegante:', error);
            Swal.close();
            await Swal.fire({
                icon: 'error',
                title: '<div style="color: #f44336; font-size: 24px;"><i class="fas fa-exclamation-triangle"></i> Error</div>',
                html: `
                    <div style="color: #666; font-size: 16px;">
                        No se pudo procesar la solicitud de afinidad
                    </div>
                    ${error.message ? `<div style="color: #999; font-size: 14px; margin-top: 10px;">${error.message}</div>` : ''}
                `,
                confirmButtonText: '<i class="fas fa-redo"></i> Intentar nuevamente',
                confirmButtonColor: '#f44336',
                width: 450
            });
        }
    },

    // FUNCIÓN CORREGIDA: crearSolicitudAfinidad
    async crearSolicitudAfinidad(amigoId, tipoAfinidad, nota = '') {
        try {
            console.log('📤 Iniciando crearSolicitudAfinidad...');
            console.log('📝 Parámetros:', { amigoId, tipoAfinidad, nota });
            
            const userId = window.usuarioIdActual;
            if (!userId) {
                throw new Error('No hay usuario autenticado');
            }
            
            if (!amigoId) {
                throw new Error('ID de amigo no proporcionado');
            }
            
            // Validar tipo de afinidad
            const tiposValidos = ['hermanos', 'confidentes', 'amigos'];
            if (!tiposValidos.includes(tipoAfinidad)) {
                throw new Error(`Tipo de afinidad no válido: ${tipoAfinidad}`);
            }
            
            console.log('🔍 Verificando si ya existe afinidad...');
            // Verificar si ya existe una afinidad entre estos usuarios
            const { data: afinidadExistente, error: errorExistente } = await window.supabase
                .from('afinidades')
                .select('*')
                .or(`and(usuario_id.eq.${userId},amigo_id.eq.${amigoId}),and(usuario_id.eq.${amigoId},amigo_id.eq.${userId})`)
                .single();

            console.log('✅ Resultado de verificación:', { afinidadExistente, errorExistente });

            let result;
            
            if (afinidadExistente) {
                console.log('🔄 Afinidad existente encontrada, actualizando...');
                
                // Verificar si el usuario actual es el que creó la afinidad
                const puedeActualizar = afinidadExistente.usuario_id === userId;
                
                if (!puedeActualizar) {
                    throw new Error('Solo el creador de la afinidad puede actualizarla');
                }
                
                // Si existe, actualizar
                const updateData = {
                    tipo_afinidad: tipoAfinidad,
                    actualizado_en: new Date().toISOString()
                };
                
                // Solo agregar nota si no está vacía
                if (nota && nota.trim() !== '') {
                    updateData.nota = nota.trim();
                }
                
                console.log('📝 Datos para actualizar:', updateData);
                
                const { data, error } = await window.supabase
                    .from('afinidades')
                    .update(updateData)
                    .eq('id', afinidadExistente.id)
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Error al actualizar afinidad:', error);
                    throw error;
                }
                
                result = data;
                console.log('✅ Afinidad actualizada exitosamente:', data);
            } else {
                console.log('🆕 Creando nueva afinidad...');
                // Si no existe, crear nueva
                const insertData = {
                    usuario_id: userId,
                    amigo_id: amigoId,
                    tipo_afinidad: tipoAfinidad,
                    estado: 'pendiente',
                    nota: nota && nota.trim() !== '' ? nota.trim() : null
                };
                
                console.log('📝 Datos para insertar:', insertData);
                
                const { data, error } = await window.supabase
                    .from('afinidades')
                    .insert([insertData])
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Error al crear afinidad:', error);
                    console.error('❌ Detalles del error:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                    
                    // Manejar error específico de duplicados
                    if (error.code === '23505') {
                        throw new Error('Ya existe una afinidad entre estos usuarios');
                    }
                    throw error;
                }
                
                result = data;
                console.log('✅ Nueva afinidad creada exitosamente:', data);
            }
            
            return { success: true, data: result };
            
        } catch (error) {
            console.error('❌ Error completo en crearSolicitudAfinidad:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return { 
                success: false, 
                message: error.message,
                details: error.details,
                code: error.code
            };
        }
    },

    // NUEVA FUNCIÓN: Obtener afinidad existente (cualquier estado)
    async obtenerAfinidadExistente(amigoId) {
        try {
            const { data: afinidad, error } = await window.supabase
                .from('afinidades')
                .select('*')
                .or(`and(usuario_id.eq.${window.usuarioIdActual},amigo_id.eq.${amigoId}),and(usuario_id.eq.${amigoId},amigo_id.eq.${window.usuarioIdActual})`)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return afinidad || null;
        } catch (error) {
            console.error('Error al obtener afinidad existente:', error);
            return null;
        }
    },

    async eliminarAfinidad(afinidadId) {
        const { isConfirmed } = await Swal.fire({
            title: '<div style="color: #f44336; font-size: 28px;"><i class="fas fa-trash-alt"></i> Eliminar Afinidad</div>',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 60px; color: #f44336; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div style="font-size: 18px; color: #333; font-weight: 600; margin-bottom: 15px;">
                        ¿Estás seguro de eliminar esta afinidad?
                    </div>
                    <div style="color: #666; font-size: 16px;">
                        Esta acción eliminará permanentemente la afinidad y no se puede deshacer.
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
            cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
            confirmButtonColor: '#f44336',
            cancelButtonColor: '#6c757d',
            width: 500,
            showClass: {
                popup: 'animate__animated animate__shakeX'
            }
        });
        
        if (isConfirmed) {
            try {
                const { error } = await window.supabase
                    .from('afinidades')
                    .delete()
                    .eq('id', afinidadId);

                if (error) throw error;
                
                await this.cargarAfinidades();
                
                await Swal.fire({
                    title: '<div style="color: #4CAF50; font-size: 28px;"><i class="fas fa-check-circle"></i> Eliminada</div>',
                    html: `
                        <div style="text-align: center; padding: 20px;">
                            <div style="font-size: 60px; color: #4CAF50; margin-bottom: 20px;">
                                <i class="fas fa-check"></i>
                            </div>
                            <div style="font-size: 18px; color: #333; font-weight: 600;">
                                Afinidad eliminada exitosamente
                            </div>
                        </div>
                    `,
                    confirmButtonText: '<i class="fas fa-check"></i> Aceptar',
                    confirmButtonColor: '#4CAF50',
                    width: 400,
                    timer: 2000,
                    timerProgressBar: true
                });
            } catch (error) {
                console.error('Error al eliminar afinidad:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar la afinidad',
                    confirmButtonColor: '#f44336'
                });
            }
        }
    },

    async verDetalleAfinidad(afinidadId) {
        try {
            const { data: afinidad, error } = await window.supabase
                .from('afinidades')
                .select(`
                    *,
                    usuario:usuarios!afinidades_usuario_id_fkey(nombre, apellidos, email, avatar_url),
                    amigo:usuarios!afinidades_amigo_id_fkey(nombre, apellidos, email, avatar_url)
                `)
                .eq('id', afinidadId)
                .single();
            
            if (error) throw error;
            
            const esUsuarioSolicitante = afinidad.usuario_id === window.usuarioIdActual;
            const amigo = esUsuarioSolicitante ? afinidad.amigo : afinidad.usuario;
            const tipoInfo = this.getTipoAfinidadInfo(afinidad.tipo_afinidad);
            const iniciales = window.Utilidades.obtenerIniciales(`${amigo.nombre || ''} ${amigo.apellidos || ''}`);
            
            let estadoBadge = '';
            switch (afinidad.estado) {
                case 'aceptada':
                    estadoBadge = '<span style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">✓ Aceptada</span>';
                    break;
                case 'pendiente':
                    estadoBadge = '<span style="background: linear-gradient(135deg, #FF9800, #F57C00); color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">⏳ Pendiente</span>';
                    break;
                case 'rechazada':
                    estadoBadge = '<span style="background: linear-gradient(135deg, #f44336, #c62828); color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">✗ Rechazada</span>';
                    break;
                case 'cancelada':
                    estadoBadge = '<span style="background: linear-gradient(135deg, #9E9E9E, #616161); color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">⎋ Cancelada</span>';
                    break;
            }
            
            await Swal.fire({
                title: `<div style="display: flex; align-items: center; gap: 10px; color: ${tipoInfo.color}; font-size: 28px; font-weight: 700;"><i class="${tipoInfo.icon}"></i> Detalles de Afinidad</div>`,
                html: `
                    <div style="text-align: left;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, ${tipoInfo.color}20, ${tipoInfo.color}10); border-radius: 15px; padding: 25px; margin-bottom: 25px; text-align: center;">
                            <div style="display: inline-block; width: 100px; height: 100px; border-radius: 50%; background: ${tipoInfo.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px; margin-bottom: 20px; border: 4px solid white; box-shadow: 0 5px 20px ${tipoInfo.color}40;">
                                <i class="${tipoInfo.icon}"></i>
                            </div>
                            <div style="font-weight: 700; color: ${tipoInfo.color}; font-size: 24px; margin-bottom: 10px;">
                                ${tipoInfo.label}
                            </div>
                            <div style="color: #666; font-size: 16px;">
                                ${tipoInfo.description}
                            </div>
                        </div>

                        <!-- Información del amigo -->
                        <div style="background: white; border-radius: 15px; padding: 25px; margin-bottom: 25px; border: 2px solid #f0f0f0;">
                            <div style="font-weight: 600; color: #333; font-size: 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-user" style="color: #667eea;"></i>
                                Información del amigo
                            </div>
                            <div style="display: flex; align-items: center; gap: 20px;">
                                <div style="width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; overflow: hidden;">
                                    ${amigo.avatar_url ? 
                                        `<img src="${amigo.avatar_url}" alt="${amigo.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                                        `<span>${iniciales}</span>`
                                    }
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; color: #333; font-size: 20px; margin-bottom: 5px;">
                                        ${amigo.nombre || ''} ${amigo.apellidos || ''}
                                    </div>
                                    <div style="color: #666; font-size: 16px; margin-bottom: 10px;">
                                        <i class="fas fa-envelope"></i> ${amigo.email}
                                    </div>
                                    <div>
                                        ${estadoBadge}
                                        <span style="margin-left: 10px; font-size: 14px; color: #999;">
                                            ${esUsuarioSolicitante ? '(Tú enviaste la solicitud)' : '(Tú recibiste la solicitud)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Nota si existe -->
                        ${afinidad.nota ? `
                            <div style="background: linear-gradient(135deg, #FFF9C4, #FFF59D); border-radius: 15px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #FFC107;">
                                <div style="font-weight: 600; color: #333; font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-sticky-note" style="color: #FF9800;"></i>
                                    Nota personal
                                </div>
                                <div style="color: #666; font-size: 16px; line-height: 1.6; padding: 15px; background: white; border-radius: 10px;">
                                    ${afinidad.nota}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Información de fechas -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                            <div style="background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-radius: 15px; padding: 20px; text-align: center;">
                                <div style="font-size: 40px; color: #2196F3; margin-bottom: 10px;">
                                    <i class="fas fa-calendar-plus"></i>
                                </div>
                                <div style="font-weight: 600; color: #333; font-size: 16px; margin-bottom: 5px;">
                                    Creada
                                </div>
                                <div style="color: #666; font-size: 14px;">
                                    ${new Date(afinidad.creado_en).toLocaleDateString('es-ES', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <div style="background: linear-gradient(135deg, #E8F5E9, #C8E6C9); border-radius: 15px; padding: 20px; text-align: center;">
                                <div style="font-size: 40px; color: #4CAF50; margin-bottom: 10px;">
                                    <i class="fas fa-calendar-check"></i>
                                </div>
                                <div style="font-weight: 600; color: #333; font-size: 16px; margin-bottom: 5px;">
                                    Actualizada
                                </div>
                                <div style="color: #666; font-size: 14px;">
                                    ${new Date(afinidad.actualizado_en).toLocaleDateString('es-ES', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                width: 700,
                showCloseButton: true,
                showConfirmButton: false,
                showClass: {
                    popup: 'animate__animated animate__fadeInUp'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutDown'
                }
            });
            
        } catch (error) {
            console.error('Error al ver detalle:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los detalles',
                confirmButtonColor: '#f44336'
            });
        }
    },

    async cargarSolicitudesPendientes() {
        try {
            const { data: solicitudes, error } = await window.supabase
                .from('afinidades')
                .select(`
                    id,
                    usuario_id,
                    amigo_id,
                    tipo_afinidad,
                    estado,
                    nota,
                    creado_en,
                    usuario:usuarios!afinidades_usuario_id_fkey(nombre, apellidos, email, avatar_url)
                `)
                .eq('amigo_id', window.usuarioIdActual)
                .eq('estado', 'pendiente')
                .order('creado_en', { ascending: false });

            if (error) throw error;
            
            window.solicitudesAfinidad = solicitudes || [];
            return window.solicitudesAfinidad;
            
        } catch (error) {
            console.error('Error al cargar solicitudes de afinidad:', error);
            window.solicitudesAfinidad = [];
            return [];
        }
    },

    async contarSolicitudesPendientes() {
        try {
            const { count, error } = await window.supabase
                .from('afinidades')
                .select('*', { count: 'exact', head: true })
                .eq('amigo_id', window.usuarioIdActual)
                .eq('estado', 'pendiente');

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error al contar solicitudes pendientes:', error);
            return 0;
        }
    },

    mostrarListaAfinidades() {
        const contenedor = document.getElementById('listaAfinidades');
        if (!contenedor) return;
        
        if (!window.afinidades || window.afinidades.length === 0) {
            contenedor.innerHTML = window.Utilidades.plantillaEstadoVacio('handshake', 'No tienes afinidades', 'Establece afinidades con tus amigos');
            return;
        }
        
        let html = '';
        
        // Separar por estado
        const afinidadesAceptadas = window.afinidades.filter(a => a.estado === 'aceptada');
        const afinidadesPendientes = window.afinidades.filter(a => a.estado === 'pendiente');
        const afinidadesOtras = window.afinidades.filter(a => !['aceptada', 'pendiente'].includes(a.estado));
        
        // Afinidades aceptadas
        if (afinidadesAceptadas.length > 0) {
            html += `
                <div class="afinidad-section">
                    <h3 class="section-subtitle">
                        <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                        Afinidades Aceptadas (${afinidadesAceptadas.length})
                    </h3>
                    <div class="afinidades-grid">
                        ${afinidadesAceptadas.map(afinidad => this.renderizarItemAfinidad(afinidad)).join('')}
                    </div>
                </div>
            `;
        }
        
        // Solicitudes pendientes (recibidas)
        if (afinidadesPendientes.length > 0) {
            html += `
                <div class="afinidad-section">
                    <h3 class="section-subtitle">
                        <i class="fas fa-clock" style="color: #FFA726;"></i>
                        Solicitudes Pendientes (${afinidadesPendientes.length})
                    </h3>
                    <div class="afinidades-grid">
                        ${afinidadesPendientes.map(afinidad => this.renderizarItemAfinidad(afinidad)).join('')}
                    </div>
                </div>
            `;
        }
        
        // Otras afinidades
        if (afinidadesOtras.length > 0) {
            html += `
                <div class="afinidad-section">
                    <h3 class="section-subtitle">
                        <i class="fas fa-history" style="color: #9E9E9E;"></i>
                        Otras Afinidades (${afinidadesOtras.length})
                    </h3>
                    <div class="afinidades-grid">
                        ${afinidadesOtras.map(afinidad => this.renderizarItemAfinidad(afinidad)).join('')}
                    </div>
                </div>
            `;
        }
        
        contenedor.innerHTML = html;
    },

  renderizarItemAfinidad(afinidad) {
    const esUsuarioSolicitante = afinidad.usuario_id === window.usuarioIdActual;
    const amigo = esUsuarioSolicitante ? afinidad.amigo : afinidad.usuario;
    const tipoInfo = this.getTipoAfinidadInfo(afinidad.tipo_afinidad);
    const fecha = new Date(afinidad.creado_en).toLocaleDateString('es-ES');
    const iniciales = window.Utilidades.obtenerIniciales(`${amigo.nombre || ''} ${amigo.apellidos || ''}`);
    
    let estadoBadge = '';
    let estadoClase = '';
    let esNuevaSolicitud = false;
    
    switch (afinidad.estado) {
        case 'aceptada':
           
            estadoClase = 'aceptada';
            break;
        case 'pendiente':
            if (esUsuarioSolicitante) {
               
                estadoClase = 'pendiente-enviada';
            } else {
               
                estadoClase = 'nueva-solicitud';
                esNuevaSolicitud = true;
            }
            break;
        case 'rechazada':
            estadoBadge = '<span class="badge badge-danger" style="background: linear-gradient(135deg, #f44336, #c62828); color: white; padding: 4px 12px; font-size: 12px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;"><i class="fas fa-times-circle"></i> Rechazada</span>';
            estadoClase = 'rechazada';
            break;
        case 'cancelada':
            estadoBadge = '<span class="badge badge-secondary" style="background: linear-gradient(135deg, #9E9E9E, #616161); color: white; padding: 4px 12px; font-size: 12px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px;"><i class="fas fa-ban"></i> Cancelada</span>';
            estadoClase = 'cancelada';
            break;
    }
    
    return `
        <div class="afinidad-item ${estadoClase}" data-afinidad-id="${afinidad.id}" style="border-radius: 12px; border: 1px solid #e0e0e0; padding: 18px; margin-bottom: 15px; background: white; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div class="afinidad-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                <div class="afinidad-avatar" style="width: 55px; height: 55px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; overflow: hidden; flex-shrink: 0;">
                    ${amigo.avatar_url ? 
                        `<img src="${amigo.avatar_url}" alt="${amigo.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        `<span>${iniciales}</span>`
                    }
                </div>
                <div class="afinidad-info" style="flex: 1; min-width: 0;">
                    <h4 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 10px;">
                        ${amigo.nombre || ''} ${amigo.apellidos || ''}
                        ${esNuevaSolicitud ? estadoBadge : ''}
                    </h4>
                    <div class="afinidad-meta" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span class="afinidad-tipo" style="color: ${tipoInfo.color}; font-size: 13px; display: flex; align-items: center; gap: 4px; background: ${tipoInfo.color}15; padding: 4px 10px; border-radius: 10px;">
                            <i class="${tipoInfo.icon}" style="font-size: 11px;"></i> ${tipoInfo.label}
                        </span>
                        <span class="afinidad-fecha" style="color: #666; font-size: 12px; display: flex; align-items: center; gap: 4px;">
                            <i class="fas fa-calendar" style="font-size: 11px;"></i> ${fecha}
                        </span>
                        ${!esNuevaSolicitud ? `
                            <div style="margin-left: auto;">
                                ${estadoBadge}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            ${afinidad.nota ? `
                <div class="afinidad-nota-preview" style="background: #f8f9fa; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; border-left: 3px solid #667eea; font-size: 13px; color: #555; line-height: 1.4; display: flex; align-items: flex-start; gap: 8px;">
                    <i class="fas fa-sticky-note" style="color: #667eea; font-size: 12px; margin-top: 2px; flex-shrink: 0;"></i>
                    <span style="flex: 1;">${afinidad.nota.length > 100 ? afinidad.nota.substring(0, 100) + '...' : afinidad.nota}</span>
                </div>
            ` : ''}
            
            <div class="afinidad-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${afinidad.estado === 'pendiente' && !esUsuarioSolicitante ? `
                    <button class="btn-success btn-sm" onclick="Afinidad.responderSolicitud('${afinidad.id}', 'aceptada')" 
                            style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;">
                        <i class="fas fa-check" style="font-size: 11px;"></i> Aceptar
                    </button>
                    <button class="btn-danger btn-sm" onclick="Afinidad.responderSolicitud('${afinidad.id}', 'rechazada')" 
                            style="background: linear-gradient(135deg, #f44336, #d32f2f); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;">
                        <i class="fas fa-times" style="font-size: 11px;"></i> Rechazar
                    </button>
                ` : ''}
                
                ${afinidad.estado === 'pendiente' && esUsuarioSolicitante ? `
                    <button class="btn-warning btn-sm" onclick="Afinidad.cancelarSolicitud('${afinidad.id}')" 
                            style="background: linear-gradient(135deg, #9C27B0, #7B1FA2); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;">
                        <i class="fas fa-ban" style="font-size: 11px;"></i> Cancelar
                    </button>
                ` : ''}
                
                <button class="btn-info btn-sm" onclick="Afinidad.verDetalleAfinidad('${afinidad.id}')" 
                        style="background: linear-gradient(135deg, #00BCD4, #0097A7); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;">
                    <i class="fas fa-eye" style="font-size: 11px;"></i> Ver
                </button>
                
                <button class="btn-danger btn-sm" onclick="Afinidad.eliminarAfinidad('${afinidad.id}')" 
                        style="background: linear-gradient(135deg, #757575, #616161); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;">
                    <i class="fas fa-trash" style="font-size: 11px;"></i> Eliminar
                </button>
            </div>
        </div>
    `;
},

    async responderSolicitud(afinidadId, respuesta) {
        try {
            const confirmacion = await window.Utilidades.mostrarConfirmacion(
                `¿${respuesta === 'aceptada' ? 'Aceptar' : 'Rechazar'} solicitud?`,
                respuesta === 'aceptada' 
                    ? '¿Estás seguro de aceptar esta afinidad?' 
                    : '¿Estás seguro de rechazar esta solicitud?',
                respuesta === 'aceptada' ? 'Sí, aceptar' : 'Sí, rechazar'
            );
            
            if (confirmacion.isConfirmed) {
                const { data, error } = await window.supabase
                    .from('afinidades')
                    .update({
                        estado: respuesta,
                        actualizado_en: new Date().toISOString()
                    })
                    .eq('id', afinidadId)
                    .select()
                    .single();

                if (error) throw error;
                
                await this.cargarAfinidades();
                window.Utilidades.mostrarAlerta(
                    respuesta === 'aceptada' ? '¡Aceptada!' : '¡Rechazada!',
                    `La solicitud ha sido ${respuesta}`,
                    'success'
                );
                
                return { success: true, data };
            }
            
            return { success: false, message: 'Cancelado por el usuario' };
        } catch (error) {
            console.error('Error al responder solicitud:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo procesar la respuesta', 'error');
            return { success: false, message: error.message };
        }
    },

    async cancelarSolicitud(afinidadId) {
        try {
            const confirmacion = await window.Utilidades.mostrarConfirmacion(
                '¿Cancelar solicitud?',
                'Esta acción cancelará la solicitud de afinidad enviada',
                'Sí, cancelar'
            );
            
            if (confirmacion.isConfirmed) {
                const { error } = await window.supabase
                    .from('afinidades')
                    .update({
                        estado: 'cancelada',
                        actualizado_en: new Date().toISOString()
                    })
                    .eq('id', afinidadId);

                if (error) throw error;
                
                await this.cargarAfinidades();
                window.Utilidades.mostrarAlerta('Solicitud cancelada', 'La solicitud ha sido cancelada', 'success');
            }
        } catch (error) {
            console.error('Error al cancelar solicitud:', error);
            window.Utilidades.mostrarAlerta('Error', 'No se pudo cancelar la solicitud', 'error');
        }
    },

    async obtenerAfinidadEntreUsuarios(amigoId) {
        try {
            const { data: afinidad, error } = await window.supabase
                .from('afinidades')
                .select('*')
                .or(`and(usuario_id.eq.${window.usuarioIdActual},amigo_id.eq.${amigoId}),and(usuario_id.eq.${amigoId},amigo_id.eq.${window.usuarioIdActual})`)
                .eq('estado', 'aceptada')
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return afinidad || null;
        } catch (error) {
            console.error('Error al obtener afinidad entre usuarios:', error);
            return null;
        }
    },

    async obtenerEstadisticasAfinidad() {
        try {
            const { data: afinidades, error } = await window.supabase
                .from('afinidades')
                .select('tipo_afinidad, estado')
                .or(`usuario_id.eq.${window.usuarioIdActual},amigo_id.eq.${window.usuarioIdActual}`);

            if (error) throw error;

            const estadisticas = {
                total: 0,
                hermanos: 0,
                confidentes: 0,
                amigos: 0,
                pendientes: 0
            };

            (afinidades || []).forEach(item => {
                estadisticas.total++;
                if (item.estado === 'aceptada') {
                    estadisticas[item.tipo_afinidad]++;
                } else if (item.estado === 'pendiente') {
                    estadisticas.pendientes++;
                }
            });

            return estadisticas;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                total: 0,
                hermanos: 0,
                confidentes: 0,
                amigos: 0,
                pendientes: 0
            };
        }
    },

    mostrarEstadisticasAfinidad() {
        const contenedor = document.getElementById('estadisticasAfinidad');
        if (!contenedor) return;
        
        this.obtenerEstadisticasAfinidad().then(estadisticas => {
            contenedor.innerHTML = `
                <div class="estadisticas-grid">
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.total}</h3>
                            <p>Total Afinidades</p>
                        </div>
                    </div>
                    
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.confidentes}</h3>
                            <p>Confidentes</p>
                        </div>
                    </div>
                    
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                            <i class="fas fa-user-friends"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.amigos}</h3>
                            <p>Amigos</p>
                        </div>
                    </div>
                    
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.hermanos}</h3>
                            <p>Hermanos</p>
                        </div>
                    </div>
                    
                    <div class="estadistica-card">
                        <div class="estadistica-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="estadistica-info">
                            <h3>${estadisticas.pendientes}</h3>
                            <p>Pendientes</p>
                        </div>
                    </div>
                </div>
            `;
        }).catch(error => {
            console.error('Error al mostrar estadísticas:', error);
            contenedor.innerHTML = window.Utilidades.plantillaEstadoVacio('exclamation-triangle', 'Error', 'No se pudieron cargar las estadísticas');
        });
    },

    mostrarListaAmigosParaAfinidad() {
        const contenedor = document.getElementById('listaAmigosAfinidad');
        if (!contenedor) return;
        
        if (!window.listaAmigos || window.listaAmigos.length === 0) {
            contenedor.innerHTML = window.Utilidades.plantillaEstadoVacio('user-friends', 'No tienes amigos', 'Agrega amigos primero para establecer afinidades');
            return;
        }
        
        let html = '';
        window.listaAmigos.forEach((amigo, index) => {
            const iniciales = window.Utilidades.obtenerIniciales(`${amigo.nombre || ''} ${amigo.apellidos || ''}`);
            
            html += `
                <div class="amigo-item" data-amigo-id="${amigo.id}" style="--item-index: ${index};">
                    <div class="amigo-avatar">
                        ${amigo.avatar_url ? 
                            `<img src="${amigo.avatar_url}" alt="${amigo.nombre}" loading="lazy">` : 
                            `<span>${iniciales}</span>`
                        }
                    </div>
                    <div class="amigo-info">
                        <h3 class="amigo-nombre">${amigo.nombre || ''} ${amigo.apellidos || ''}</h3>
                        <p class="amigo-email">${amigo.email}</p>
                    </div>
                    <div class="amigo-acciones">
                        <button class="btn-afinidad-select" onclick="Afinidad.mostrarModalSeleccionAfinidad()">
                            <i class="fas fa-handshake"></i> Establecer Afinidad
                        </button>
                    </div>
                </div>
            `;
        });
        
        contenedor.innerHTML = html;
    },

    actualizarContadorAfinidades() {
        this.contarSolicitudesPendientes().then(count => {
            const badge = document.getElementById('contadorAfinidades');
            if (badge) {
                badge.textContent = count > 0 ? count : '0';
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        }).catch(error => {
            console.error('Error al actualizar contador:', error);
        });
    },

    getTipoAfinidadInfo(tipo) {
        return this.tiposAfinidad.find(t => t.value === tipo) || 
               { label: tipo, icon: 'fas fa-question', color: '#999' };
    },

    getTipoAfinidadLabel(tipo) {
        const info = this.getTipoAfinidadInfo(tipo);
        return info.label || tipo;
    },

    mostrarErrorAfinidades() {
        const contenedor = document.getElementById('listaAfinidades');
        if (contenedor) {
            contenedor.innerHTML = window.Utilidades.plantillaEstadoVacio('exclamation-triangle', 'Error', 'No se pudieron cargar las afinidades');
        }
    },

    inicializar() {
        const cambiarTabAfinidad = (tab) => {
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            const pane = document.getElementById(`tab-${tab}`);
            if (pane) {
                pane.classList.add('active');
            }
            
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tab === tab) {
                    btn.classList.add('active');
                }
            });
            
            if (tab === 'mis-afinidades') {
                this.mostrarListaAfinidades();
            } else if (tab === 'seleccionar-amigos') {
                this.mostrarListaAmigosParaAfinidad();
            } else if (tab === 'solicitudes-pendientes') {
                this.mostrarSolicitudesPendientes();
            }
        };

        window.cambiarTabAfinidad = cambiarTabAfinidad;

        const btnRefreshAfinidad = document.getElementById('btnRefreshAfinidad');
        if (btnRefreshAfinidad) {
            btnRefreshAfinidad.addEventListener('click', async () => {
                btnRefreshAfinidad.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                await this.cargarAfinidades();
                setTimeout(() => {
                    btnRefreshAfinidad.innerHTML = '<i class="fas fa-sync-alt"></i>';
                }, 500);
            });
        }

        const btnEstablecerAfinidad = document.getElementById('btnEstablecerAfinidad');
        if (btnEstablecerAfinidad) {
            btnEstablecerAfinidad.onclick = async () => {
                await this.mostrarModalSeleccionAfinidad();
            };
        }
    }
};

// Hacer disponible globalmente
window.Afinidad = Afinidad;