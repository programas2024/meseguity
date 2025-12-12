

// Variables globales (para acceso desde módulos)
window.usuarioActual = null;
window.usuarioIdActual = null;
window.listaAmigos = [];
window.solicitudesPendientes = [];
window.supabase = supabase;
window.Autenticacion = Autenticacion;
window.Mensajes = Mensajes;
window.Amigos = Amigos;
window.UsuariosDisponibles = UsuariosDisponibles;
window.Interfaz = Interfaz;

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar sesión
    const usuarioAuth = await Autenticacion.verificarSesion();
    if (!usuarioAuth) return;
    
    // Cargar información del usuario
    await Usuario.cargarInformacion(usuarioAuth);
    
    // Cargar datos iniciales
    await Mensajes.cargarBandejaEntrada();
    await Mensajes.actualizarContadorNoLeidos();
    await Amigos.cargarAmigos();
    await Amigos.cargarSolicitudesPendientes();
    
    // Configurar interfaz
    Interfaz.configurarEventos();
    
    // Configurar refrescar bandeja
    document.getElementById('btnRefreshBandeja').addEventListener('click', async () => {
        await Mensajes.cargarBandejaEntrada();
        Utilidades.mostrarAlerta('Bandeja actualizada', 'Los mensajes se han actualizado', 'info');
    });
    
    // Configurar refrescar amigos
    document.getElementById('btnRefreshAmigos').addEventListener('click', async () => {
        await UsuariosDisponibles.cargarUsuariosDisponibles();
        Utilidades.mostrarAlerta('Lista actualizada', 'Los usuarios se han actualizado', 'info');
    });
    
    // Ocultar mensaje de bienvenida después de 5 segundos
    setTimeout(() => {
        document.getElementById('welcomeMessage').style.display = 'none';
    }, 5000);
});