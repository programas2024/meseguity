// ============================================
// GESTIÓN DE TÍTULOS VIP
// ============================================

async function cargarTitulos() {
    try {
        const { data: titulos, error } = await supabaseClient
            .from('titulos_usuario')
            .select('*')
            .eq('activo', true)
            .order('precio_diamantes', { ascending: true });
        
        if (error) {
            console.error('Error cargando títulos:', error);
            return;
        }
        
        const { data: titulosAdquiridos, error: errorAdquiridos } = await supabaseClient
            .from('titulos_usuario')
            .select('id')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .not('adquirido_en', 'is', null);
        
        const titulosAdquiridosIds = new Set();
        if (titulosAdquiridos) {
            titulosAdquiridos.forEach(t => titulosAdquiridosIds.add(t.id));
        }
        
        const { data: tituloActivoData, error: errorActivo } = await supabaseClient
            .from('titulo_activo_usuario')
            .select('titulo_id')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .eq('activo', true)
            .single();
        
        const tituloActivoId = tituloActivoData?.titulo_id;
        
        const container = document.getElementById('titulosContainer');
        if (!container) return;
        
        container.innerHTML = titulos.map(titulo => {
            const yaAdquirido = titulosAdquiridosIds.has(titulo.id);
            const esActivo = titulo.id === tituloActivoId;
            const puedeComprar = window.datosUsuarioVIP.diamantesCanjeables >= titulo.precio_diamantes && !yaAdquirido;
            
            return `
                <div class="titulo-card ${esActivo ? 'activo' : ''}">
                    ${esActivo ? '<div class="titulo-badge">Activo</div>' : ''}
                    <div class="titulo-header">
                        <div class="titulo-icon">
                            <i class="fas fa-medal"></i>
                        </div>
                        <div class="titulo-info">
                            <h4>${titulo.titulo}</h4>
                            <div class="precio">Título exclusivo</div>
                        </div>
                    </div>
                    <div class="titulo-descripcion">
                        ${titulo.descripcion || 'Título especial para destacar en la comunidad'}
                    </div>
                    <div class="titulo-precio">
                        <div class="titulo-diamantes">
                            <i class="fas fa-gem"></i>
                            <span>${titulo.precio_diamantes}</span>
                        </div>
                        ${yaAdquirido ? 
                            `<button class="btn-titulo ${esActivo ? 'activo' : ''}" onclick="activarTitulo('${titulo.id}', '${titulo.titulo}')" ${esActivo ? 'disabled' : ''}>
                                <i class="fas ${esActivo ? 'fa-check-circle' : 'fa-toggle-off'}"></i>
                                ${esActivo ? 'Activo' : 'Activar'}
                            </button>` :
                            `<button class="btn-titulo" onclick="comprarTitulo('${titulo.id}', '${titulo.titulo}', ${titulo.precio_diamantes})" ${!puedeComprar ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i>
                                ${puedeComprar ? 'Comprar' : 'Diamantes insuficientes'}
                            </button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error en cargarTitulos:', error);
    }
}

async function cargarTituloActivo() {
    try {
        console.log('Intentando cargar título activo para usuario:', window.datosUsuarioVIP.id);
        
        const { data: tituloActivo, error } = await supabaseClient
            .from('titulo_activo_usuario')
            .select('titulo_id')
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .eq('activo', true)
            .maybeSingle();
        
        console.log('Resultado de consulta título activo:', { tituloActivo, error });
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('No se encontró título activo para este usuario');
            } else if (error.code === '42P01') {
                console.error('La tabla titulo_activo_usuario no existe');
                await crearTablaTituloActivoSiNoExiste();
            } else {
                console.error('Error cargando título activo:', error);
            }
            
            window.datosUsuarioVIP.tituloActivo = null;
            actualizarTituloSidebar(null);
            return;
        }
        
        if (!tituloActivo || !tituloActivo.titulo_id) {
            window.datosUsuarioVIP.tituloActivo = null;
            actualizarTituloSidebar(null);
            return;
        }
        
        console.log('Buscando información del título ID:', tituloActivo.titulo_id);
        const { data: tituloInfo, error: errorTitulo } = await supabaseClient
            .from('titulos_usuario')
            .select('titulo, nombre')
            .eq('id', tituloActivo.titulo_id)
            .maybeSingle();
        
        console.log('Resultado de consulta información título:', { tituloInfo, errorTitulo });
        
        if (errorTitulo) {
            console.error('Error obteniendo información del título:', errorTitulo);
            window.datosUsuarioVIP.tituloActivo = null;
        } else if (tituloInfo) {
            window.datosUsuarioVIP.tituloActivo = tituloInfo.titulo || tituloInfo.nombre || 'Título VIP';
        }
        
        console.log('Título activo establecido como:', window.datosUsuarioVIP.tituloActivo);
        actualizarTituloSidebar(window.datosUsuarioVIP.tituloActivo);
        
    } catch (error) {
        console.error('Error en cargarTituloActivo:', error);
        window.datosUsuarioVIP.tituloActivo = null;
        actualizarTituloSidebar(null);
    }
}

async function comprarTitulo(tituloId, nombreTitulo, precioDiamantes) {
    try {
        if (window.datosUsuarioVIP.diamantesCanjeables < precioDiamantes) {
            Swal.fire({
                title: '❌ Diamantes Insuficientes',
                html: `Necesitas <strong>${precioDiamantes} diamantes</strong> para comprar este título.<br>
                       Actualmente tienes: <strong>${window.datosUsuarioVIP.diamantesCanjeables} diamantes</strong>`,
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444'
            });
            return;
        }
        
        const confirmacion = await Swal.fire({
            title: '🏆 ¿Comprar Título?',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 60px; color: #f59e0b; margin-bottom: 15px;">
                        <i class="fas fa-medal"></i>
                    </div>
                    <div style="font-size: 22px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px;">
                        ${nombreTitulo}
                    </div>
                    <div style="color: #666; font-size: 16px; margin-bottom: 20px;">
                        ¿Estás seguro de comprar este título?
                    </div>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin-top: 20px;">
                        <div style="font-size: 14px; color: #666; text-align: left;">
                            <i class="fas fa-gem" style="color: #0ea5e9; margin-right: 8px;"></i>
                            <strong>Coste:</strong> ${precioDiamantes} diamantes<br>
                            <i class="fas fa-wallet" style="color: #10b981; margin-right: 8px;"></i>
                            <strong>Diamantes disponibles:</strong> ${window.datosUsuarioVIP.diamantesCanjeables}<br>
                            <i class="fas fa-coins" style="color: #f59e0b; margin-right: 8px;"></i>
                            <strong>Diamantes después:</strong> ${window.datosUsuarioVIP.diamantesCanjeables - precioDiamantes}
                        </div>
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
        
        const { error: errorAdquirir } = await supabaseClient
            .from('titulos_usuario')
            .update({
                usuario_id: window.datosUsuarioVIP.id,
                adquirido_en: horaActual
            })
            .eq('id', tituloId);
        
        if (errorAdquirir) {
            console.error('Error adquiriendo título:', errorAdquirir);
        }
        
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
                accion: `Título comprado: ${nombreTitulo}`,
                puntos: -precioDiamantes,
                tipo: 'titulo',
                created_at: horaActual
            });
        
        if (errorHistorial) console.error('Error registrando en historial:', errorHistorial);
        
        await activarTitulo(tituloId, nombreTitulo, true);
        
        window.datosUsuarioVIP.diamantesCanjeables = nuevosDiamantesCanjeables;
        
        Swal.fire({
            title: '🎉 ¡Título Adquirido!',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 60px; color: #10b981; margin-bottom: 15px;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div style="font-size: 22px; font-weight: 700; color: #1e3a8a; margin-bottom: 10px;">
                        ${nombreTitulo}
                    </div>
                    <div style="color: #666; font-size: 16px; margin-bottom: 20px;">
                        ¡Tu título ha sido adquirido y activado!
                    </div>
                </div>
            `,
            confirmButtonText: '¡Genial!',
            confirmButtonColor: '#10b981'
        });
        
        actualizarEstadisticas();
        await cargarTitulos();
        await cargarTituloActivo();
        document.getElementById('diamantesTotal').textContent = nuevosDiamantesCanjeables;
        
    } catch (error) {
        console.error('Error comprando título:', error);
        Swal.fire({
            title: '❌ Error',
            text: 'No se pudo comprar el título. Por favor, intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#ef4444'
        });
    }
}

async function activarTitulo(tituloId, nombreTitulo, esNuevo = false) {
    try {
        console.log('Activando título:', { tituloId, nombreTitulo, esNuevo });
        
        try {
            const { error: checkError } = await supabaseClient
                .from('titulo_activo_usuario')
                .select('id')
                .limit(1);
            
            if (checkError && checkError.code === '42P01') {
                throw new Error('Tabla no existe');
            }
        } catch (tableError) {
            console.error('Error verificando tabla:', tableError);
            await crearTablaTituloActivoSiNoExiste();
            throw new Error('La tabla titulo_activo_usuario no está configurada');
        }
        
        const { error: errorDesactivar } = await supabaseClient
            .from('titulo_activo_usuario')
            .update({ 
                activo: false,
                updated_at: new Date().toISOString()
            })
            .eq('usuario_id', window.datosUsuarioVIP.id)
            .eq('activo', true);
        
        if (errorDesactivar && errorDesactivar.code !== 'PGRST116') {
            console.error('Error desactivando título anterior:', errorDesactivar);
        }
        
        const horaActual = new Date().toISOString();
        const { error: errorActivar } = await supabaseClient
            .from('titulo_activo_usuario')
            .upsert({
                usuario_id: window.datosUsuarioVIP.id,
                titulo_id: tituloId,
                activo: true,
                created_at: horaActual,
                updated_at: horaActual
            }, {
                onConflict: 'usuario_id, titulo_id',
                ignoreDuplicates: false
            });
        
        if (errorActivar) {
            console.error('Error activando título:', errorActivar);
            
            if (errorActivar.code === '42501' || errorActivar.message.includes('permission')) {
                console.log('Intentando inserción simple debido a error de permisos');
                
                await supabaseClient
                    .from('titulo_activo_usuario')
                    .delete()
                    .eq('usuario_id', window.datosUsuarioVIP.id);
                
                const { error: insertError } = await supabaseClient
                    .from('titulo_activo_usuario')
                    .insert({
                        usuario_id: window.datosUsuarioVIP.id,
                        titulo_id: tituloId,
                        activo: true,
                        created_at: horaActual,
                        updated_at: horaActual
                    });
                
                if (insertError) throw insertError;
            } else {
                throw errorActivar;
            }
        }
        
        window.datosUsuarioVIP.tituloActivo = nombreTitulo;
        
        actualizarTituloSidebar(nombreTitulo);
        
        if (!esNuevo) {
            Swal.fire({
                title: '✅ Título Activado',
                text: `Ahora luces el título: ${nombreTitulo}`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
        
        await cargarTitulos();
        
        console.log('Título activado exitosamente:', nombreTitulo);
        
    } catch (error) {
        console.error('Error activando título:', error);
        if (!esNuevo) {
            Swal.fire({
                title: '❌ Error',
                html: `
                    <div style="text-align: left; padding: 20px;">
                        <p>No se pudo activar el título.</p>
                        <p><strong>Error:</strong> ${error.message || 'Desconocido'}</p>
                        <p>Verifica que la tabla <code>titulo_activo_usuario</code> exista y tengas permisos.</p>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444',
                width: 600
            });
        }
    }
}

function actualizarTituloSidebar(titulo) {
    const tituloSidebar = document.getElementById('tituloActivoSidebar');
    const tituloActual = document.getElementById('tituloActual');
    const etiquetaTitulo = document.getElementById('etiquetaTitulo');
    
    if (!tituloSidebar || !tituloActual || !etiquetaTitulo) {
        console.warn('Elementos del sidebar de título no encontrados');
        return;
    }
    
    if (titulo) {
        tituloSidebar.style.display = 'block';
        tituloActual.textContent = titulo;
        etiquetaTitulo.textContent = titulo.toUpperCase();
        console.log('Sidebar actualizado con título:', titulo);
    } else {
        tituloSidebar.style.display = 'none';
        console.log('Sidebar ocultado (sin título)');
    }
}

async function crearTablaTituloActivoSiNoExiste() {
    try {
        console.log('Intentando verificar/crear tabla titulo_activo_usuario');
        
        const { error: checkError } = await supabaseClient
            .from('titulo_activo_usuario')
            .select('*')
            .limit(1);
        
        if (checkError && checkError.code === '42P01') {
            console.warn('La tabla titulo_activo_usuario no existe. Debes crearla en la consola de Supabase.');
            
            Swal.fire({
                title: '⚠️ Configuración Requerida',
                html: `
                    <div style="text-align: left; padding: 20px;">
                        <p>La tabla <strong>titulo_activo_usuario</strong> no existe.</p>
                        <p>Ejecuta este SQL en la consola de Supabase:</p>
                        <pre style="background: #f1f5f9; padding: 10px; border-radius: 5px; overflow-x: auto;">
CREATE TABLE titulo_activo_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo_id UUID,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE titulo_activo_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propios títulos activos" 
ON titulo_activo_usuario FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden insertar sus propios títulos activos" 
ON titulo_activo_usuario FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios títulos activos" 
ON titulo_activo_usuario FOR UPDATE 
USING (auth.uid() = usuario_id);
                        </pre>
                    </div>
                `,
                icon: 'warning',
                confirmButtonText: 'Entendido',
                width: 800
            });
        }
    } catch (error) {
        console.error('Error verificando tabla:', error);
    }
}