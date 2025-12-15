// Eventos y funciones globales para Afinidad

// Función global para seleccionar amigo para afinidad
async function seleccionarAmigoParaAfinidad(amigoId) {
    try {
        await window.InterfazAfinidad.mostrarModalSeleccionAfinidad(amigoId);
    } catch (error) {
        console.error('Error al seleccionar amigo:', error);
        window.Utilidades.mostrarAlerta('Error', 'No se pudo abrir el modal de afinidad', 'error');
    }
}

// Función global para enviar solicitud de afinidad
async function enviarSolicitudAfinidad(amigoId) {
    try {
        const tipoSeleccionado = document.querySelector('.afinidad-option.selected');
        if (!tipoSeleccionado) {
            window.Utilidades.mostrarAlerta('Advertencia', 'Por favor selecciona un tipo de afinidad', 'warning');
            return;
        }
        
        const tipoAfinidad = tipoSeleccionado.dataset.tipo;
        const nota = document.getElementById('notaAfinidad').value;
        
        // Mostrar loader
        Swal.fire({
            title: 'Enviando solicitud...',
            text: 'Por favor espera un momento',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Enviar solicitud
        const resultado = await window.Afinidad.crearSolicitudAfinidad(amigoId, tipoAfinidad, nota);
        
        // Cerrar modal
        cerrarModalAfinidad();
        
        // Mostrar resultado
        if (resultado.success) {
            Swal.fire('¡Éxito!', resultado.message, 'success');
            
            // Actualizar contador si está disponible
            if (window.Amigos && window.Amigos.actualizarContadorAfinidades) {
                await window.Amigos.actualizarContadorAfinidades();
            }
            
            // Recargar sección de afinidades si está visible
            if (window.InterfazAfinidad && window.InterfazAfinidad.renderizarListaAfinidades) {
                await window.InterfazAfinidad.renderizarListaAfinidades();
            }
        } else {
            Swal.fire('Error', resultado.message, 'error');
        }
        
    } catch (error) {
        console.error('Error al enviar solicitud:', error);
        Swal.fire('Error', 'No se pudo enviar la solicitud', 'error');
    }
}

// Función global para responder a solicitud
async function responderSolicitudAfinidad(afinidadId, respuesta) {
    try {
        const confirmacion = await Swal.fire({
            title: `¿${respuesta === 'aceptada' ? 'Aceptar' : 'Rechazar'} solicitud?`,
            text: respuesta === 'aceptada' 
                ? '¿Estás seguro de aceptar esta afinidad?' 
                : '¿Estás seguro de rechazar esta solicitud?',
            icon: respuesta === 'aceptada' ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonText: respuesta === 'aceptada' ? 'Sí, aceptar' : 'Sí, rechazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: respuesta === 'aceptada' ? '#4CAF50' : '#d33',
            cancelButtonColor: '#3085d6'
        });
        
        if (confirmacion.isConfirmed) {
            const resultado = await window.Afinidad.responderSolicitudAfinidad(afinidadId, respuesta);
            
            if (resultado.success) {
                Swal.fire(
                    respuesta === 'aceptada' ? '¡Aceptada!' : '¡Rechazada!',
                    resultado.message,
                    'success'
                );
                
                // Actualizar interfaz
                if (window.InterfazAfinidad && window.InterfazAfinidad.renderizarListaAfinidades) {
                    await window.InterfazAfinidad.renderizarListaAfinidades();
                }
                
                // Actualizar contador
                if (window.Amigos && window.Amigos.actualizarContadorAfinidades) {
                    await window.Amigos.actualizarContadorAfinidades();
                }
            } else {
                Swal.fire('Error', resultado.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error al responder solicitud:', error);
        Swal.fire('Error', 'No se pudo procesar la respuesta', 'error');
    }
}

// Función global para cancelar solicitud
async function cancelarSolicitudAfinidad(afinidadId) {
    try {
        const confirmacion = await Swal.fire({
            title: '¿Cancelar solicitud?',
            text: 'Esta acción cancelará la solicitud de afinidad enviada.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        });
        
        if (confirmacion.isConfirmed) {
            const resultado = await window.Afinidad.responderSolicitudAfinidad(afinidadId, 'cancelada');
            
            if (resultado.success) {
                Swal.fire('¡Cancelada!', 'La solicitud ha sido cancelada', 'success');
                
                // Actualizar interfaz
                if (window.InterfazAfinidad && window.InterfazAfinidad.renderizarListaAfinidades) {
                    await window.InterfazAfinidad.renderizarListaAfinidades();
                }
            } else {
                Swal.fire('Error', resultado.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error al cancelar solicitud:', error);
        Swal.fire('Error', 'No se pudo cancelar la solicitud', 'error');
    }
}

// Función global para eliminar afinidad
async function eliminarAfinidad(afinidadId) {
    try {
        const confirmacion = await Swal.fire({
            title: '¿Eliminar afinidad?',
            text: 'Esta acción eliminará permanentemente la afinidad.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        });
        
        if (confirmacion.isConfirmed) {
            const resultado = await window.Afinidad.eliminarAfinidad(afinidadId);
            
            if (resultado.success) {
                Swal.fire('¡Eliminada!', 'La afinidad ha sido eliminada', 'success');
                
                // Actualizar interfaz
                if (window.InterfazAfinidad && window.InterfazAfinidad.renderizarListaAfinidades) {
                    await window.InterfazAfinidad.renderizarListaAfinidades();
                }
                
                // Actualizar estadísticas
                if (window.InterfazAfinidad && window.InterfazAfinidad.renderizarEstadisticasAfinidad) {
                    await window.InterfazAfinidad.renderizarEstadisticasAfinidad();
                }
            } else {
                Swal.fire('Error', resultado.message, 'error');
            }
        }
    } catch (error) {
        console.error('Error al eliminar afinidad:', error);
        Swal.fire('Error', 'No se pudo eliminar la afinidad', 'error');
    }
}

// Función global para eliminar afinidad existente desde el modal
async function eliminarAfinidadExistente(afinidadId) {
    await eliminarAfinidad(afinidadId);
    cerrarModalAfinidad();
}

// Función global para ver detalle de afinidad
async function verDetalleAfinidad(afinidadId) {
    try {
        // Aquí podrías implementar un modal con más detalles
        const { data: afinidad, error } = await supabase
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
        const tipoInfo = window.InterfazAfinidad.getTipoAfinidadInfo(afinidad.tipo_afinidad);
        
        const detallesHtml = `
            <div class="afinidad-detalle">
                <div class="detalle-header">
                    <div class="detalle-avatar" style="background: ${tipoInfo.color};">
                        <i class="${tipoInfo.icon}"></i>
                    </div>
                    <div class="detalle-info">
                        <h3>Afinidad con ${amigo.nombre} ${amigo.apellidos}</h3>
                        <p>Tipo: <strong>${tipoInfo.label}</strong></p>
                        <p>Estado: <span class="badge">${afinidad.estado}</span></p>
                    </div>
                </div>
                
                <div class="detalle-body">
                    ${afinidad.nota ? `
                        <div class="detalle-nota">
                            <h4><i class="fas fa-sticky-note"></i> Nota:</h4>
                            <p>${afinidad.nota}</p>
                        </div>
                    ` : ''}
                    
                    <div class="detalle-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar-plus"></i>
                            <div>
                                <strong>Creada:</strong>
                                <p>${new Date(afinidad.creado_en).toLocaleString('es-ES')}</p>
                            </div>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar-check"></i>
                            <div>
                                <strong>Actualizada:</strong>
                                <p>${new Date(afinidad.actualizado_en).toLocaleString('es-ES')}</p>
                            </div>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <div>
                                <strong>${esUsuarioSolicitante ? 'Amigo' : 'Solicitante'}:</strong>
                                <p>${amigo.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'Detalles de Afinidad',
            html: detallesHtml,
            width: 600,
            showCloseButton: true,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error al ver detalle:', error);
        Swal.fire('Error', 'No se pudieron cargar los detalles', 'error');
    }
}

// Función global para cerrar modal de afinidad
function cerrarModalAfinidad() {
    const modal = document.getElementById('modalAfinidad');
    if (modal) {
        modal.remove();
    }
}

// Inicializar eventos al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Hacer funciones globales
    window.seleccionarAmigoParaAfinidad = seleccionarAmigoParaAfinidad;
    window.enviarSolicitudAfinidad = enviarSolicitudAfinidad;
    window.responderSolicitudAfinidad = responderSolicitudAfinidad;
    window.cancelarSolicitudAfinidad = cancelarSolicitudAfinidad;
    window.eliminarAfinidad = eliminarAfinidad;
    window.eliminarAfinidadExistente = eliminarAfinidadExistente;
    window.verDetalleAfinidad = verDetalleAfinidad;
    window.cerrarModalAfinidad = cerrarModalAfinidad;
});