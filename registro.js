// registro.js - Adaptado para tu tabla de Supabase

// Importar Supabase dinámicamente
let supabase = null;

async function initSupabase() {
    try {
        if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.key) {
            throw new Error('Configuración de Supabase no encontrada');
        }

        console.log('🔗 Conectando a Supabase...');
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
        
        supabase = createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.key);
        
        // Verificar conexión
        const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ Error conectando a Supabase:', error);
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        console.log('✅ Supabase conectado correctamente');
        return supabase;
        
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        showNotification('Error de conexión: ' + error.message, 'error');
        return null;
    }
}

// Función principal
async function main() {
    console.log('🚀 Iniciando aplicación de registro...');
    
    const supabase = await initSupabase();
    if (!supabase) {
        console.log('⚠️ Usando modo demo (localStorage)');
        setupDemoMode();
        return;
    }
    
    setupFormWithSupabase(supabase);
}

// Configurar formulario con Supabase
function setupFormWithSupabase(supabase) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ Formulario configurado con Supabase');
        
        const form = document.getElementById('registroForm');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');
        const notification = document.getElementById('notification');

        // Configurar eventos del formulario
        setupFormEvents(form, passwordInput, confirmPasswordInput, strengthBar, strengthText, notification, supabase);
    });
}

// Configurar eventos del formulario
function setupFormEvents(form, passwordInput, confirmPasswordInput, strengthBar, strengthText, notification, supabase) {
    
    // Mostrar/Ocultar contraseña
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Validar fortaleza de contraseña
    if (passwordInput && strengthBar) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            
            strengthBar.style.width = strength.percent + '%';
            strengthBar.style.backgroundColor = strength.color;
            
            if (strengthText) {
                strengthText.textContent = 'Seguridad: ' + strength.text;
                strengthText.style.color = strength.color;
            }
        });
    }

    // Validar coincidencia de contraseñas
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) {
                this.style.borderColor = 'var(--danger)';
                this.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            } else {
                this.style.borderColor = 'var(--success)';
                this.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            }
        });
    }

    // Manejar envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Recoger datos del formulario
        const userData = {
            nombre: document.getElementById('nombre').value.trim(),
            apellidos: document.getElementById('apellidos').value.trim(),
            email: document.getElementById('email').value.trim(),
            fecha_nacimiento: document.getElementById('fechaNacimiento').value,
            pais: document.getElementById('pais').value,
            ciudad: document.getElementById('ciudad').value.trim(),
            genero: document.getElementById('genero').value,
            tipo_cuenta: document.getElementById('tipoCuenta').value,
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value
        };

        console.log('📝 Datos del usuario:', userData);

        // Validaciones
        if (!validateForm(userData)) return;

        // Deshabilitar botón y mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
        submitBtn.disabled = true;

        try {
            // Registrar usuario
            await registerUser(supabase, userData);
            
        } catch (error) {
            console.error('❌ Error en registro:', error);
            showNotification(error.message, 'error', notification);
            
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Función para registrar usuario en Supabase
async function registerUser(supabase, userData) {
    console.log('🔄 Registrando usuario en Supabase...');
    
    try {
        // 1. Registrar en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    nombre: userData.nombre,
                    apellidos: userData.apellidos
                },
                emailRedirectTo: window.location.origin + '/index.html'
            }
        });

        if (authError) {
            console.error('❌ Error en Auth:', authError);
            
            if (authError.message.includes('already registered')) {
                throw new Error('Este correo ya está registrado');
            } else if (authError.message.includes('Invalid email')) {
                throw new Error('El correo electrónico no es válido');
            } else {
                throw new Error('Error de autenticación: ' + authError.message);
            }
        }

        console.log('✅ Usuario registrado en Auth:', authData.user?.id);

        // 2. Insertar en la tabla usuarios
        const userRecord = {
            id: authData.user?.id || generateUUID(),
            email: userData.email,
            password_hash: userData.password, // En producción usaría hash
            nombre: userData.nombre,
            apellidos: userData.apellidos,
            fecha_nacimiento: userData.fecha_nacimiento,
            pais: userData.pais,
            ciudad: userData.ciudad,
            genero: userData.genero,
            tipo_cuenta: userData.tipo_cuenta,
            confirmado: false,
            created_at: new Date().toISOString()
        };

        console.log('📊 Insertando en tabla usuarios:', userRecord);

        const { data: dbData, error: dbError } = await supabase
            .from('usuarios')
            .insert([userRecord])
            .select();

        if (dbError) {
            console.error('❌ Error en base de datos:', dbError);
            
            // Si hay error, intentar eliminar el usuario de Auth
            if (authData.user) {
                await supabase.auth.signOut();
            }
            
            if (dbError.code === '23505') {
                throw new Error('Este correo ya está registrado en el sistema');
            } else if (dbError.message.includes('check constraint')) {
                throw new Error('Tipo de cuenta no válido');
            } else {
                throw new Error('Error al guardar datos: ' + dbError.message);
            }
        }

        console.log('✅ Usuario insertado en BD:', dbData);

        // 3. Mostrar éxito
        const notification = document.getElementById('notification');
        showNotification('¡Cuenta creada exitosamente! Revisa tu correo para confirmar.', 'success', notification);
        
        // Mostrar SweetAlert con instrucciones
        await Swal.fire({
            title: '🎉 ¡Registro exitoso!',
            html: `
                <div style="text-align: center;">
                    <div style="font-size: 48px; color: #10b981; margin-bottom: 20px;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>¡Bienvenido a Messery!</h3>
                    <p>Tu cuenta ha sido creada correctamente.</p>
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; margin: 20px 0; border: 1px solid #a7f3d0;">
                        <p><strong>📧 Confirmación requerida</strong></p>
                        <p>Hemos enviado un enlace de activación a:</p>
                        <p style="font-weight: bold; color: #059669;">${userData.email}</p>
                        <p style="font-size: 0.9rem; margin-top: 10px;">
                            <i class="fas fa-info-circle"></i>
                            Revisa tu bandeja de entrada y carpeta de spam
                        </p>
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'Entendido',
            allowOutsideClick: false
        });

        // Redirigir después de 3 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);

    } catch (error) {
        console.error('❌ Error completo en registro:', error);
        throw error;
    }
}

// Funciones auxiliares
function validateForm(data) {
    console.log('🔍 Validando formulario...');
    
    // Validar campos requeridos
    const camposRequeridos = ['nombre', 'apellidos', 'email', 'fecha_nacimiento', 'pais', 'ciudad', 'genero', 'tipo_cuenta', 'password'];
    
    for (const campo of camposRequeridos) {
        if (!data[campo]) {
            showNotification(`Por favor, completa el campo: ${campo}`, 'error');
            return false;
        }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Por favor, ingresa un email válido', 'error');
        return false;
    }

    // Validar contraseñas
    if (data.password !== data.confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return false;
    }

    if (data.password.length < 8) {
        showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
        return false;
    }

    // Validar fecha de nacimiento (mayor de 13 años)
    const birthDate = new Date(data.fecha_nacimiento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13) {
        showNotification('Debes tener al menos 13 años para registrarte', 'error');
        return false;
    }

    // Validar que se aceptaron términos
    const terminos = document.getElementById('terminos');
    if (!terminos.checked) {
        showNotification('Debes aceptar los términos y condiciones', 'error');
        return false;
    }

    console.log('✅ Validación exitosa');
    return true;
}

function checkPasswordStrength(password) {
    let score = 0;
    let text = 'Débil';
    let color = '#ef4444'; // rojo
    let percent = 25;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch(score) {
        case 1:
            text = 'Débil';
            color = '#ef4444';
            percent = 25;
            break;
        case 2:
            text = 'Regular';
            color = '#f59e0b';
            percent = 50;
            break;
        case 3:
            text = 'Buena';
            color = '#10b981';
            percent = 75;
            break;
        case 4:
            text = 'Excelente';
            color = '#059669';
            percent = 100;
            break;
        default:
            text = 'Muy débil';
            color = '#dc2626';
            percent = 10;
    }

    return { text, color, percent };
}

function showNotification(message, type, element = null) {
    const notification = element || document.getElementById('notification');
    if (!notification) {
        console.log('📢 ' + message);
        return;
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Modo demo (si Supabase falla)
function setupDemoMode() {
    console.log('🔄 Configurando modo demo...');
    
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('registroForm');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');
        const notification = document.getElementById('notification');

        showNotification('Usando modo DEMO (localStorage). Los datos se guardarán localmente.', 'warning', notification);

        // Configurar eventos sin Supabase
        const eventos = setupFormEvents(form, passwordInput, confirmPasswordInput, strengthBar, strengthText, notification, null);
        
        // Sobrescribir el submit para usar localStorage
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userData = {
                nombre: document.getElementById('nombre').value.trim(),
                apellidos: document.getElementById('apellidos').value.trim(),
                email: document.getElementById('email').value.trim(),
                fecha_nacimiento: document.getElementById('fechaNacimiento').value,
                pais: document.getElementById('pais').value,
                ciudad: document.getElementById('ciudad').value.trim(),
                genero: document.getElementById('genero').value,
                tipo_cuenta: document.getElementById('tipoCuenta').value,
                password: passwordInput.value,
                confirmPassword: confirmPasswordInput.value
            };

            if (!validateForm(userData)) return;

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            submitBtn.disabled = true;

            try {
                // Guardar en localStorage
                const users = JSON.parse(localStorage.getItem('messery_users') || '[]');
                
                // Verificar si el email ya existe
                if (users.some(user => user.email === userData.email)) {
                    throw new Error('Este correo ya está registrado');
                }
                
                users.push({
                    ...userData,
                    id: generateUUID(),
                    confirmado: true,
                    created_at: new Date().toISOString()
                });
                
                localStorage.setItem('messery_users', JSON.stringify(users));
                
                showNotification('¡Cuenta creada en modo DEMO! (Datos guardados localmente)', 'success', notification);
                
                await Swal.fire({
                    title: '✅ Registro DEMO exitoso',
                    text: 'Los datos se guardaron en localStorage. En producción se conectarían a Supabase.',
                    icon: 'info',
                    confirmButtonText: 'Entendido'
                });
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                
            } catch (error) {
                showNotification(error.message, 'error', notification);
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }, { once: true });
    });
}

// Iniciar aplicación
main();
