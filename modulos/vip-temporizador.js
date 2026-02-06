// ============================================
// TEMPORIZADOR DE RECOMPENSA DIARIA
// ============================================

function iniciarTemporizadorRecompensa() {
    const timerDisplay = document.getElementById('timerDisplay');
    const btnClaim = document.getElementById('btnClaimDaily');
    const btnClaimText = document.getElementById('btnClaimText');
    
    if (!timerDisplay || !btnClaim) return;
    
    const ultimaReclamacionHora = localStorage.getItem('vipUltimaReclamacionHora');
    
    if (!ultimaReclamacionHora) {
        btnClaim.disabled = false;
        btnClaimText.textContent = 'Reclamar 50 Puntos';
        timerDisplay.textContent = 'Disponible ahora';
        return;
    }
    
    const ultimaReclamacion = new Date(ultimaReclamacionHora);
    const ahora = new Date();
    const tiempoTranscurridoMs = ahora - ultimaReclamacion;
    const tiempoTranscurridoHoras = tiempoTranscurridoMs / (1000 * 60 * 60);
    
    if (tiempoTranscurridoHoras >= 24) {
        btnClaim.disabled = false;
        btnClaimText.textContent = 'Reclamar 50 Puntos';
        timerDisplay.textContent = 'Disponible ahora';
        localStorage.removeItem('vipUltimaReclamacionHora');
    } else {
        const tiempoRestanteHoras = 24 - tiempoTranscurridoHoras;
        const horas = Math.floor(tiempoRestanteHoras);
        const minutos = Math.floor((tiempoRestanteHoras - horas) * 60);
        const segundos = Math.floor(((tiempoRestanteHoras - horas) * 60 - minutos) * 60);
        
        const horasStr = horas.toString().padStart(2, '0');
        const minutosStr = minutos.toString().padStart(2, '0');
        const segundosStr = segundos.toString().padStart(2, '0');
        
        timerDisplay.textContent = `${horasStr}:${minutosStr}:${segundosStr}`;
        btnClaim.disabled = true;
        btnClaimText.textContent = 'Ya Reclamado Hoy';
        
        setTimeout(iniciarTemporizadorRecompensa, 1000);
    }
}

async function reclamarRecompensaDiaria() {
    const btn = document.getElementById('btnClaimDaily');
    const btnClaimText = document.getElementById('btnClaimText');
    
    btn.disabled = true;
    btnClaimText.textContent = 'Procesando...';
    
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const { data: reclamacionesHoy, error: errorReclamaciones } = await supabaseClient
            .from('historial_puntos_vip')
            .select('id, created_at')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .eq('tipo', 'diario')
            .gte('created_at', `${hoy}T00:00:00`)
            .lte('created_at', `${hoy}T23:59:59`);
        
        if (reclamacionesHoy && reclamacionesHoy.length > 0) {
            localStorage.setItem('vipUltimaReclamacionHora', reclamacionesHoy[0].created_at);
            Swal.fire({
                title: '⏰ Ya reclamaste hoy',
                text: 'Ya has reclamado tu recompensa diaria. Vuelve mañana.',
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3b82f6'
            });
            
            btnClaimText.textContent = 'Ya Reclamado Hoy';
            iniciarTemporizadorRecompensa();
            return;
        }
        
        const { data: usuarioActual, error: errorUsuarioActual } = await supabaseClient
            .from('usuarios')
            .select('puntos')
            .eq('id', window.datosUsuarioVIP.id)
            .single();
        
        if (errorUsuarioActual) throw new Error('No se pudieron obtener los puntos actuales');
        
        const puntosActuales = usuarioActual?.puntos || 0;
        const nuevosPuntos = puntosActuales + 50;
        
        const { error: errorActualizarPuntos } = await supabaseClient
            .from('usuarios')
            .update({ 
                puntos: nuevosPuntos,
                updated_at: new Date().toISOString()
            })
            .eq('id', window.datosUsuarioVIP.id);
        
        if (errorActualizarPuntos) throw errorActualizarPuntos;
        
        const horaActual = new Date().toISOString();
        const { error: errorHistorial } = await supabaseClient
            .from('historial_puntos_vip')
            .insert({
                usuario_id: window.datosUsuarioVIP.id,
                accion: 'Recompensa diaria VIP reclamada',
                puntos: 50,
                tipo: 'diario',
                created_at: horaActual
            });
        
        if (errorHistorial) console.error('Error registrando en historial:', errorHistorial);
        
        window.datosUsuarioVIP.puntos = nuevosPuntos;
        window.datosUsuarioVIP.nivel = calcularNivel(nuevosPuntos);
        
        localStorage.setItem('vipUltimaReclamacionHora', horaActual);
        
        await calcularRachaDiaria();
        
        Swal.fire({
            title: '🎉 ¡Recompensa Reclamada!',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 60px; color: #10b981; margin-bottom: 15px;">
                        <i class="fas fa-gift"></i>
                    </div>
                    <div style="font-size: 28px; font-weight: 800; color: #10b981; margin-bottom: 15px;">
                        +50 Puntos VIP
                    </div>
                    <div style="color: #666; font-size: 16px; margin-bottom: 20px;">
                        ¡Recompensa diaria reclamada exitosamente!
                    </div>
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; border: 2px solid #10b981; margin-top: 20px;">
                        <div style="font-size: 14px; color: #065f46; text-align: left;">
                            <i class="fas fa-fire" style="margin-right: 8px;"></i>
                            <strong>Racha actual:</strong> ${window.datosUsuarioVIP.streakActual} días<br>
                            <i class="fas fa-star" style="margin-right: 8px;"></i>
                            <strong>Puntos totales:</strong> ${nuevosPuntos}<br>
                            <i class="fas fa-trophy" style="margin-right: 8px;"></i>
                            <strong>Nivel actual:</strong> ${window.datosUsuarioVIP.nivel}
                        </div>
                    </div>
                </div>
            `,
            confirmButtonText: '¡Excelente!',
            confirmButtonColor: '#10b981',
            timer: 5000,
            timerProgressBar: true
        });
        
        actualizarEstadisticas();
        iniciarTemporizadorRecompensa();
        document.getElementById('puntosTotal').textContent = nuevosPuntos;
        
    } catch (error) {
        console.error('Error reclamando recompensa diaria:', error);
        Swal.fire({
            title: '❌ Error',
            text: 'No se pudo reclamar la recompensa. Por favor, intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#ef4444'
        });
        
        btn.disabled = false;
        btnClaimText.textContent = 'Reclamar 50 Puntos';
    }
}