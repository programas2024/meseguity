// modulos/utilidades.js
const Utilidades = {
    obtenerIniciales(nombre) {
        if (!nombre) return '?';
        const nombres = nombre.split(' ');
        if (nombres.length === 1) return nombres[0].charAt(0).toUpperCase();
        return (nombres[0].charAt(0) + nombres[nombres.length - 1].charAt(0)).toUpperCase();
    },

    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    mostrarAlerta(titulo, mensaje, tipo = 'success') {
        return Swal.fire({
            title: titulo,
            text: mensaje,
            icon: tipo,
            confirmButtonText: 'OK',
            confirmButtonColor: '#1a73e8'
        });
    },

    mostrarConfirmacion(titulo, texto, textoConfirmar = 'Sí', textoCancelar = 'Cancelar') {
        return Swal.fire({
            title: titulo,
            text: texto,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d32f2f',
            cancelButtonColor: '#666',
            confirmButtonText: textoConfirmar,
            cancelButtonText: textoCancelar
        });
    },

    plantillaEstadoVacio(icono, titulo, mensaje) {
        return `
            <div class="empty-state">
                <i class="fas fa-${icono} fa-3x"></i>
                <h3>${titulo}</h3>
                <p>${mensaje}</p>
            </div>
        `;
    }
};

// Hacer disponible globalmente
window.Utilidades = Utilidades;