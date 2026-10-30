// ============================================
// GESTIÓN DE HISTORIAL VIP
// ============================================

async function cargarHistorial() {
    try {
        const { data: historial, error } = await supabaseClient
            .from('historial_puntos_vip')
            .select('*')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) {
            console.error('Error cargando historial:', error);
            mostrarHistorialVacio();
            return;
        }
        
        const container = document.getElementById('historialContainer');
        if (!container) return;
        
        if (!historial || historial.length === 0) {
            mostrarHistorialVacio();
            return;
        }
        
        container.innerHTML = historial.map(item => {
            const fecha = new Date(item.created_at);
            const icono = obtenerIconoPorTipoHistorial(item.tipo);
            const color = obtenerColorPorTipoHistorial(item.tipo);
            const esPositivo = item.puntos > 0;
            
            let textoPuntos = '';
            let claseColor = '';
            
            if (item.tipo === 'titulo' || item.tipo === 'estilo_mensaje') {
                textoPuntos = `${item.puntos} diamantes`;
                claseColor = 'historial-negativo';
            } else {
                textoPuntos = `${esPositivo ? '+' : ''}${item.puntos} puntos`;
                claseColor = esPositivo ? 'historial-positivo' : 'historial-negativo';
            }
            
            return `
                <div class="historial-item">
                    <div class="historial-info">
                        <div class="historial-icon" style="background: ${color};">
                            <i class="${icono}"></i>
                        </div>
                        <div class="historial-details">
                            <h4>${item.accion}</h4>
                            <p>
                                <span class="${claseColor}">${textoPuntos}</span>
                                • ${obtenerNombreTipoHistorial(item.tipo)}
                            </p>
                        </div>
                    </div>
                    <div class="historial-fecha">
                        ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error en cargarHistorial:', error);
        mostrarHistorialVacio();
    }
}

function mostrarHistorialVacio() {
    const container = document.getElementById('historialContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
            <div style="font-size: 60px; color: #d1d5db; margin-bottom: 20px;">
                <i class="fas fa-history"></i>
            </div>
            <div style="font-size: 18px; font-weight: 600; color: #9ca3af; margin-bottom: 10px;">
                No hay historial aún
            </div>
            <p style="color: #9ca3af; font-size: 14px;">
                Tus recompensas, logros y actividades VIP aparecerán aquí
            </p>
        </div>
    `;
}

function obtenerIconoPorTipoHistorial(tipo) {
    switch(tipo) {
        case 'diario': return 'fas fa-calendar-day';
        case 'titulo': return 'fas fa-medal';
        case 'estilo_mensaje': return 'fas fa-comment-alt';
        case 'logro': return 'fas fa-trophy';
        case 'invitacion': return 'fas fa-user-plus';
        case 'actividad': return 'fas fa-running';
        default: return 'fas fa-star';
    }
}

function obtenerColorPorTipoHistorial(tipo) {
    switch(tipo) {
        case 'diario': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        case 'titulo': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        case 'estilo_mensaje': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
        case 'logro': return 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)';
        case 'invitacion': return 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
        case 'actividad': return 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
        default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
}

function obtenerNombreTipoHistorial(tipo) {
    const nombres = {
        'diario': 'Recompensa Diaria',
        'titulo': 'Título',
        'estilo_mensaje': 'Estilo de Mensaje',
        'logro': 'Logro',
        'invitacion': 'Invitación',
        'actividad': 'Actividad'
    };
    return nombres[tipo] || tipo;
}