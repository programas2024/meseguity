import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ⚠️ REEMPLAZA CON TUS CREDENCIALES REALES
const supabaseUrl = 'https://enmiomqkkdlmodrjmfak.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubWlvbXFra2RsbW9kcmptZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA0OTEsImV4cCI6MjA4MDk3NjQ5MX0.HeiJGnnkUjutlZkMTopFK7AIRZzRLxBTXvWk96OcAxg'

const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm')
    const toggleBtn = document.getElementById('togglePassword')
    const passwordInput = document.getElementById('password')
    const notification = document.getElementById('notification')

    // Mostrar/Ocultar contraseña
    toggleBtn.addEventListener('click', () => {
        const icon = toggleBtn.querySelector('i')
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text'
            icon.classList.replace('fa-eye', 'fa-eye-slash')
        } else {
            passwordInput.type = 'password'
            icon.classList.replace('fa-eye-slash', 'fa-eye')
        }
    })

    // Manejo del Login
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const email = document.getElementById('email').value.trim()
        const password = document.getElementById('password').value
        
        // Validación básica
        if (!email || !password) {
            showNotification('Por favor, completa todos los campos', 'error')
            return
        }

        const submitBtn = form.querySelector('button[type="submit"]')
        const originalText = submitBtn.innerHTML
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...'
        submitBtn.disabled = true

        try {
            // 1. Iniciar sesión con Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError) throw authError

            // 2. Verificar si el usuario está confirmado en nuestra tabla
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('confirmado')
                .eq('email', email)
                .single()

            if (userError) throw userError

            if (!userData.confirmado) {
                showNotification('Por favor, confirma tu correo electrónico antes de iniciar sesión.', 'error')
                await supabase.auth.signOut()
                return
            }

            // 3. Redirigir a la página principal
            showNotification('¡Inicio de sesión exitoso! Redirigiendo...', 'success')
            
            // Guardar datos del usuario en localStorage
            localStorage.setItem('messery_user', JSON.stringify({
                email: authData.user.email,
                id: authData.user.id
            }))
            
            setTimeout(() => {
                window.location.href = 'principal.html'
            }, 1500)

        } catch (error) {
            console.error('Error en login:', error)
            
            if (error.message.includes('Invalid login credentials')) {
                showNotification('Correo o contraseña incorrectos', 'error')
            } else if (error.message.includes('Email not confirmed')) {
                showNotification('Confirma tu correo electrónico primero', 'error')
            } else {
                showNotification('Error al iniciar sesión: ' + error.message, 'error')
            }
        } finally {
            submitBtn.innerHTML = originalText
            submitBtn.disabled = false
        }
    })

    function showNotification(message, type) {
        notification.textContent = message
        notification.className = `notification ${type}`
        notification.classList.remove('hidden')
        
        setTimeout(() => {
            notification.classList.add('hidden')
        }, 5000)
    }

    // Verificar si ya hay sesión activa
    checkSession()
})

async function checkSession() {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
        window.location.href = 'principal.html'
    }
}