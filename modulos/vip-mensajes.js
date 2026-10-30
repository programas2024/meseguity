// ============================================
// GESTIÓN DE ESTILOS DE MENSAJE
// ============================================

async function cargarEstilosMensaje() {
    try {
        const { data: estilos, error } = await supabaseClient
            .from('estilos_mensaje')
            .select('*')
            .eq('activo', true)
            .order('precio_diamantes', { ascending: true });
        
        if (error) {
            console.error('Error cargando estilos:', error);
            return;
        }
        
        const { data: estilosAdquiridos, error: errorAdquiridos } = await supabaseClient
            .from('estilos_mensaje_usuario')
            .select('estilo_id')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .eq('activo', true);
        
        const estilosAdquiridosIds = new Set();
        if (estilosAdquiridos) {
            estilosAdquiridos.forEach(e => estilosAdquiridosIds.add(e.estilo_id));
        }
        
        estilosAdquiridosIds.add(estilos.find(e => e.precio_diamantes === 0)?.id);
        
        const container = document.getElementById('mensajesContainer');
        if (!container) return;
        
        container.innerHTML = estilos.map(estilo => {
            const yaAdquirido = estilosAdquiridosIds.has(estilo.id);
            const esGratis = estilo.precio_diamantes === 0;
            const puedeComprar = window.datosUsuarioVIP.diamantesCanjeables >= estilo.precio_diamantes && !yaAdquirido;
            
            return `
                <div class="mensaje-card">
                    <div class="mensaje-header">
                        <div class="mensaje-icon" style="background: ${estilo.color_fondo}; color: ${estilo.color_texto}; border: ${estilo.borde || 'none'}">
                            <i class="fas fa-comment-alt"></i>
                        </div>
                        <div class="mensaje-info">
                            <h4>${estilo.nombre}</h4>
                            <div class="precio">${esGratis ? 'Gratis' : 'Estilo premium'}</div>
                        </div>
                    </div>
                    <div class="mensaje-preview" style="background: ${estilo.color_fondo}; color: ${estilo.color_texto}; border: ${estilo.borde || 'none'}">
                        ¡Este es un mensaje de ejemplo con estilo ${estilo.nombre.toLowerCase()}!
                    </div>
                    <div class="mensaje-precio">
                        <div class="mensaje-diamantes">
                            <i class="fas fa-gem"></i>
                            <span>${estilo.precio_diamantes}</span>
                        </div>
                        ${yaAdquirido || esGratis ? 
                            `<button class="btn-mensaje" onclick="usarEstiloMensaje('${estilo.id}', '${estilo.nombre}')">
                                <i class="fas fa-check"></i>
                                Usar Estilo
                            </button>` :
                            `<button class="btn-mensaje" onclick="comprarEstiloMensaje('${estilo.id}', '${estilo.nombre}', ${estilo.precio_diamantes})" ${!puedeComprar ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i>
                                ${puedeComprar ? 'Comprar' : 'Diamantes insuficientes'}
                            </button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error en cargarEstilosMensaje:', error);
    }
}

async function comprarEstiloMensaje(estiloId, nombreEstilo, precioDiamantes) {
    try {
        if (window.datosUsuarioVIP.diamantesCanjeables < precioDiamantes) {
            Swal.fire({
                title: '❌ Diamantes Insuficientes',
                html: `Necesitas <strong>${precioDiamantes} diamantes</strong> para comprar este estilo.<br>
                       Actualmente tienes: <strong>${window.datosUsuarioVIP.diamantesCanjeables} diamantes</strong>`,
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444'
            });
            return;
        }
        
        const confirmacion = await Swal.fire({
            title: '💬 ¿Comprar Estilo?',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 60px; color: #8b5cf6; margin-bottom: 15px;">
                        <i class="fas fa-comment-alt"></i>
                    </div>
                    <div style="font-size: 22px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px;">
                        ${nombreEstilo}
                    </div>
                    <div style="color: #666; font-size: 16px; margin-bottom: 20px;">
                        ¿Estás seguro de comprar este estilo de mensaje?
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '¡Sí, Comprar!',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            reverseButtons: true
        });
        
        if (!confirmacion.isConfirmed) return;
        
        const horaActual = new Date().toISOString();
        
        const { error: errorComprar } = await supabaseClient
            .from('estilos_mensaje_usuario')
            .insert({
                usuario_id: window.datosUsuarioVIP.id,
                estilo_id: estiloId,
                adquirido_en: horaActual
            });
        
        if (errorComprar) throw errorComprar;
        
        const nuevosDiamantesCanjeables = window.datosUsuarioVIP.diamantesCanjeables - precioDiamantes;
        const { error: errorDiamantes } = await supabaseClient
            .from('diamantes_vip')
            .update({
                diamantes_canjeables: nuevosDiamantesCanjeables,
                updated_at: horaActual
            })
            .eq('usuario_id', window.datosUsuarioVIP.id);
        
        if (errorDiamantes) throw errorDiamantes;
        
        const { error: errorHistorial } = await supabaseClient
            .from('historial_puntos_vip')
            .insert({
                usuario_id: window.datosUsuarioVIP.id,
                accion: `Estilo de mensaje comprado: ${nombreEstilo}`,
                puntos: -precioDiamantes,
                tipo: 'estilo_mensaje',
                created_at: horaActual
            });
        
        if (errorHistorial) console.error('Error registrando en historial:', errorHistorial);
        
        window.datosUsuarioVIP.diamantesCanjeables = nuevosDiamantesCanjeables;
        
        Swal.fire({
            title: '🎉 ¡Estilo Adquirido!',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 60px; color: #10b981; margin-bottom: 15px;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div style="font-size: 22px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px;">
                        ${nombreEstilo}
                    </div>
                    <div style="color: #666; font-size: 16px; margin-bottom: 20px;">
                        ¡Tu estilo de mensaje ha sido adquirido!
                    </div>
                </div>
            `,
            confirmButtonText: '¡Genial!',
            confirmButtonColor: '#10b981'
        });
        
        actualizarEstadisticas();
        await cargarEstilosMensaje();
        document.getElementById('diamantesTotal').textContent = nuevosDiamantesCanjeables;
        
    } catch (error) {
        console.error('Error comprando estilo:', error);
        Swal.fire({
            title: '❌ Error',
            text: 'No se pudo comprar el estilo. Por favor, intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function usarEstiloMensaje(estiloId, nombreEstilo) {
    try {
        window.datosUsuarioVIP.estiloMensajeActivo = estiloId;
        
        localStorage.setItem('estiloMensajeActivo', estiloId);
        localStorage.setItem('nombreEstiloMensaje', nombreEstilo);
        
        Swal.fire({
            title: '✅ Estilo Seleccionado',
            text: `Ahora usas el estilo: ${nombreEstilo}`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error usando estilo:', error);
        Swal.fire({
            title: '❌ Error',
            text: 'No se pudo seleccionar el estilo.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#ef4444'
        });
    }
}