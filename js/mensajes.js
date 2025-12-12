import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ⚠️ REEMPLAZA CON TUS CREDENCIALES REALES
const supabaseUrl = 'https://enmiomqkkdlmodrjmfak.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubWlvbXFra2RsbW9kcmptZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA0OTEsImV4cCI6MjA4MDk3NjQ5MX0.HeiJGnnkUjutlZkMTopFK7AIRZzRLxBTXvWk96OcAxg'

const supabase = createClient(supabaseUrl, supabaseKey)

let currentUser = null

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    const { data: authData } = await supabase.auth.getSession()
    if (!authData.session) {
        window.location.href = 'index.html'
        return
    }

    currentUser = authData.session.user
    await loadUserData()
    setupEventListeners()
    loadMessages()
})

async function loadUserData() {
    // Cargar datos del usuario
    const { data: userData } = await supabase
        .from('usuarios')
        .select('nombre, apellidos, email')
        .eq('id', currentUser.id)
        .single()

    if (userData) {
        document.getElementById('userName').textContent = 
            `${userData.nombre} ${userData.apellidos}`
        document.getElementById('userEmail').textContent = userData.email
    }
}

function setupEventListeners() {
    // Navegación
    document.getElementById('btnNuevoMensaje').addEventListener('click', () => {
        showSection('seccionNuevoMensaje')
        updateActiveNav('btnNuevoMensaje')
    })

    document.getElementById('btnBandeja').addEventListener('click', () => {
        showSection('seccionBandeja')
        updateActiveNav('btnBandeja')
        loadMessages()
    })

    document.getElementById('btnEnviados').addEventListener('click', () => {
        showSection('seccionEnviados')
        updateActiveNav('btnEnviados')
        loadSentMessages()
    })

    document.getElementById('btnLogout').addEventListener('click', logout)

    // Formulario de nuevo mensaje
    document.getElementById('formNuevoMensaje').addEventListener('submit', sendMessage)
    document.getElementById('btnCancelar').addEventListener('click', () => {
        document.getElementById('formNuevoMensaje').reset()
    })

    // Buscar mensajes
    document.getElementById('buscarMensajes').addEventListener('input', (e) => {
        searchMessages(e.target.value)
    })

    // Refrescar mensajes
    document.getElementById('btnRefresh').addEventListener('click', loadMessages)
}

function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden')
    })
    
    // Mostrar la sección seleccionada
    document.getElementById(sectionId).classList.remove('hidden')
}

function updateActiveNav(buttonId) {
    // Remover active de todos los botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    
    // Agregar active al botón seleccionado
    document.getElementById(buttonId).classList.add('active')
}

async function loadMessages() {
    const lista = document.getElementById('listaMensajes')
    lista.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin fa-3x"></i><h3>Cargando mensajes...</h3></div>'

    try {
        const { data: mensajes, error } = await supabase
            .from('mensajes')
            .select('*')
            .eq('destinatario_email', currentUser.email)
            .order('created_at', { ascending: false })

        if (error) throw error

        if (mensajes.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox fa-3x"></i>
                    <h3>No hay mensajes</h3>
                    <p>Tu bandeja de entrada está vacía</p>
                </div>`
            return
        }

        // Actualizar contador
        const unreadCount = mensajes.filter(m => !m.leido).length
        document.getElementById('contadorMensajes').textContent = unreadCount

        // Renderizar mensajes
        lista.innerHTML = mensajes.map(mensaje => `
            <div class="message-item ${mensaje.leido ? '' : 'unread'}" data-id="${mensaje.id}">
                <input type="checkbox" class="message-checkbox">
                <div class="message-sender">${mensaje.remitente_id}</div>
                <div class="message-subject">
                    ${mensaje.asunto}
                    ${!mensaje.leido ? '<span class="unread-indicator"></span>' : ''}
                    <div class="message-preview">${mensaje.contenido.substring(0, 100)}...</div>
                </div>
                <div class="message-time">${formatDate(mensaje.created_at)}</div>
            </div>
        `).join('')

        // Agregar event listeners a los mensajes
        document.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('message-checkbox')) {
                    const messageId = item.getAttribute('data-id')
                    viewMessage(messageId)
                }
            })
        })

    } catch (error) {
        console.error('Error cargando mensajes:', error)
        lista.innerHTML = '<div class="notification error">Error cargando mensajes</div>'
    }
}

async function sendMessage(e) {
    e.preventDefault()
    
    const destinatario = document.getElementById('destinatario').value.trim()
    const asunto = document.getElementById('asunto').value.trim()
    const contenido = document.getElementById('contenido').value.trim()

    if (!destinatario || !asunto || !contenido) {
        showNotification('Por favor, completa todos los campos', 'error')
        return
    }

    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'
    submitBtn.disabled = true

    try {
        const { error } = await supabase
            .from('mensajes')
            .insert([{
                remitente_id: currentUser.id,
                destinatario_email: destinatario,
                asunto: asunto,
                contenido: contenido
            }])

        if (error) throw error

        showNotification('¡Mensaje enviado exitosamente!', 'success')
        document.getElementById('formNuevoMensaje').reset()
        
        // Cambiar a bandeja de enviados
        showSection('seccionEnviados')
        updateActiveNav('btnEnviados')
        loadSentMessages()

    } catch (error) {
        console.error('Error enviando mensaje:', error)
        showNotification('Error al enviar el mensaje: ' + error.message, 'error')
    } finally {
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
    }
}

async function viewMessage(messageId) {
    // Marcar como leído
    await supabase
        .from('mensajes')
        .update({ leido: true })
        .eq('id', messageId)

    // Cargar y mostrar el mensaje
    const { data: mensaje } = await supabase
        .from('mensajes')
        .select('*')
        .eq('id', messageId)
        .single()

    if (mensaje) {
        // Mostrar modal con el mensaje
        const modal = document.createElement('div')
        modal.className = 'modal'
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${mensaje.asunto}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>De:</strong> ${mensaje.remitente_id}</p>
                    <p><strong>Para:</strong> ${mensaje.destinatario_email}</p>
                    <p><strong>Fecha:</strong> ${formatDate(mensaje.created_at)}</p>
                    <hr>
                    <div class="message-content">${mensaje.contenido}</div>
                </div>
            </div>
        `
        
        document.body.appendChild(modal)
        
        // Cerrar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove()
        })
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove()
        })

        // Actualizar contador
        loadMessages()
    }
}

async function loadSentMessages() {
    const lista = document.getElementById('listaEnviados')
    
    const { data: mensajes } = await supabase
        .from('mensajes')
        .select('*')
        .eq('remitente_id', currentUser.id)
        .order('created_at', { ascending: false })

    if (mensajes.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-paper-plane fa-3x"></i>
                <h3>No has enviado mensajes</h3>
                <p>Envía tu primer mensaje</p>
            </div>`
        return
    }

    lista.innerHTML = mensajes.map(mensaje => `
        <div class="message-item" data-id="${mensaje.id}">
            <div class="message-sender">${mensaje.destinatario_email}</div>
            <div class="message-subject">
                ${mensaje.asunto}
                <div class="message-preview">${mensaje.contenido.substring(0, 100)}...</div>
            </div>
            <div class="message-time">${formatDate(mensaje.created_at)}</div>
        </div>
    `).join('')
}

function searchMessages(query) {
    const items = document.querySelectorAll('.message-item')
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase()
        item.style.display = text.includes(query.toLowerCase()) ? '' : 'none'
    })
}

function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    // Si es hoy
    if (diff < 86400000) {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
    
    // Si es ayer
    if (diff < 172800000) {
        return 'Ayer'
    }
    
    // Si es esta semana
    if (diff < 604800000) {
        return date.toLocaleDateString('es-ES', { weekday: 'short' })
    }
    
    // Más de una semana
    return date.toLocaleDateString('es-ES')
}

function showNotification(message, type) {
    // Crear notificación temporal
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message
    notification.style.position = 'fixed'
    notification.style.top = '20px'
    notification.style.right = '20px'
    notification.style.zIndex = '1000'
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.remove()
    }, 3000)
}

async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem('messery_user')
    window.location.href = 'index.html'
}

// Suscripción a nuevos mensajes en tiempo real
supabase
    .channel('mensajes')
    .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'mensajes' },
        (payload) => {
            if (payload.new.destinatario_email === currentUser.email) {
                // Mostrar notificación
                showNotification('¡Tienes un nuevo mensaje!', 'info')
                // Actualizar contador
                loadMessages()
            }
        }
    )
    .subscribe()