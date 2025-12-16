// ayuda-soporte.js
// Modales de ayuda y soporte mejorados

// Modal de Ayuda - Mejorado
function mostrarAyuda() {
    let contenido = '';
    let titulo = '';
    let ancho = 650;
    
    if (seccionActual === 'perfil') {
        titulo = '👤 Ayuda - Configuración de Perfil';
        ancho = 700;
        contenido = generarContenidoAyudaPerfil();
    } else if (seccionActual === 'redes') {
        titulo = '📱 Ayuda - Redes Sociales';
        ancho = 700;
        contenido = generarContenidoAyudaRedes();
    } else if (seccionActual === 'seguridad') {
        titulo = '🔒 Ayuda - Seguridad';
        ancho = 700;
        contenido = generarContenidoAyudaSeguridad();
    }
    
    Swal.fire({
        title: titulo,
        html: contenido,
        width: ancho,
        background: '#ffffff',
        color: '#1f2937',
        showConfirmButton: true,
        confirmButtonText: '¡Entendido!',
        confirmButtonColor: '#1a73e8',
        showCloseButton: true,
        customClass: {
            popup: 'ayuda-popup',
            title: 'ayuda-titulo',
            htmlContainer: 'ayuda-contenido'
        }
    });
}

// Generar contenido de ayuda para perfil
function generarContenidoAyudaPerfil() {
    return `
        <div style="text-align: left; max-height: 500px; overflow-y: auto; padding-right: 10px;">
            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #1a73e8, #0d47a1); 
                            border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-circle" style="color: white; font-size: 30px;"></i>
                    </div>
                    <div>
                        <h4 style="color: #1565c0; margin: 0 0 5px 0; font-size: 18px;">Configuración Completa de Perfil</h4>
                        <p style="color: #37474f; margin: 0; font-size: 14px;">Personaliza toda tu información en Messery</p>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <h5 style="color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-size: 16px;">
                    <div style="width: 32px; height: 32px; background: #d32f2f; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-asterisk" style="color: white; font-size: 14px;"></i>
                    </div>
                    <span>Campos Obligatorios</span>
                </h5>
                <p style="color: #6b7280; margin: 0 0 20px 0; line-height: 1.6;">
                    Los campos marcados con <span style="color: #d32f2f;">*</span> son obligatorios para completar tu perfil. 
                    Sin ellos, no podrás guardar los cambios.
                </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 20px; border-radius: 12px; border-left: 4px solid #3498db;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                        <div style="width: 48px; height: 48px; background: #3498db; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-id-card" style="color: white; font-size: 20px;"></i>
                        </div>
                        <h6 style="color: #2c3e50; margin: 0; font-size: 16px;">Información Personal</h6>
                    </div>
                    <ul style="color: #7f8c8d; padding-left: 20px; margin: 0; font-size: 14px; line-height: 1.8;">
                        <li><strong>Nombre/Apellidos:</strong> Tu nombre real ayuda a que amigos te reconozcan</li>
                        <li><strong>Teléfono:</strong> Opcional, útil para contactos y recuperación</li>
                        <li><strong>Email:</strong> Principal, no se puede modificar desde aquí</li>
                        <li><strong>Fecha Nacimiento:</strong> Para contenido personalizado por edad</li>
                    </ul>
                </div>
                
                <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 20px; border-radius: 12px; border-left: 4px solid #27ae60;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                        <div style="width: 48px; height: 48px; background: #27ae60; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-globe" style="color: white; font-size: 20px;"></i>
                        </div>
                        <h6 style="color: #2c3e50; margin: 0; font-size: 16px;">Datos Demográficos</h6>
                    </div>
                    <ul style="color: #7f8c8d; padding-left: 20px; margin: 0; font-size: 14px; line-height: 1.8;">
                        <li><strong>País/Ciudad:</strong> Para recomendaciones y eventos locales</li>
                        <li><strong>Género:</strong> Mejora estadísticas y personalización</li>
                        <li><strong>Biografía:</strong> Cuéntanos sobre ti (máx. 500 caracteres)</li>
                        <li><strong>Tipo Cuenta:</strong> Personal, Educativa o Empresarial</li>
                    </ul>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #fff8e1, #ffecb3); padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #ff9800;">
                <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <div style="flex-shrink: 0; width: 48px; height: 48px; background: #ff9800; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-exclamation-triangle" style="color: white; font-size: 20px;"></i>
                    </div>
                    <div>
                        <h6 style="color: #e65100; margin: 0 0 12px 0; font-size: 16px;">Información Importante</h6>
                        <ul style="color: #5d4037; padding-left: 20px; margin: 0; font-size: 14px; line-height: 1.8;">
                            <li>Tu email principal no se puede cambiar desde esta sección</li>
                            <li>La biografía tiene un límite de 500 caracteres</li>
                            <li>La fecha de nacimiento debe ser válida</li>
                            <li>Todos los cambios se guardan automáticamente al enviar</li>
                            <li>Revisa tu configuración de privacidad regularmente</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 20px; border-radius: 12px; border-left: 4px solid #4caf50;">
                <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <div style="flex-shrink: 0; width: 48px; height: 48px; background: #4caf50; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-lightbulb" style="color: white; font-size: 20px;"></i>
                    </div>
                    <div>
                        <h6 style="color: #2e7d32; margin: 0 0 12px 0; font-size: 16px;">Consejos Prácticos</h6>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <p style="color: #33691e; margin: 0 0 8px 0; font-weight: 500; font-size: 14px;">
                                    <i class="fas fa-user-check" style="color: #4caf50; margin-right: 8px;"></i>Perfil Completo
                                </p>
                                <p style="color: #33691e; margin: 0; font-size: 13px; line-height: 1.6;">
                                    Los perfiles completos tienen un 60% más de interacciones
                                </p>
                            </div>
                            <div>
                                <p style="color: #33691e; margin: 0 0 8px 0; font-weight: 500; font-size: 14px;">
                                    <i class="fas fa-camera" style="color: #4caf50; margin-right: 8px;"></i>Foto de Perfil
                                </p>
                                <p style="color: #33691e; margin: 0; font-size: 13px; line-height: 1.6;">
                                    Una foto mejora tu visibilidad en un 40%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generar contenido de ayuda para redes sociales
function generarContenidoAyudaRedes() {
    return `
        <div style="text-align: left; max-height: 500px; overflow-y: auto; padding-right: 10px;">
            <div style="background: linear-gradient(135deg, #f0f7ff, #dbeafe); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #1a73e8, #0d47a1); 
                            border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-share-alt" style="color: white; font-size: 30px;"></i>
                    </div>
                    <div>
                        <h4 style="color: #1a73e8; margin: 0 0 5px 0; font-size: 18px;">Conecta tus Redes Sociales</h4>
                        <p style="color: #4b5563; margin: 0; font-size: 14px;">Comparte tus perfiles y conéctate con otros</p>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <h5 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-size: 16px;">
                    <div style="width: 32px; height: 32px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-toggle-on" style="color: white; font-size: 16px;"></i>
                    </div>
                    <span>Cómo Funciona</span>
                </h5>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border: 2px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                            <div style="width: 36px; height: 36px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-power-off" style="color: white; font-size: 16px;"></i>
                            </div>
                            <span style="font-weight: 600; color: #374151; font-size: 15px;">Activar/Desactivar</span>
                        </div>
                        <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                            Haz clic en el interruptor circular para activar cada red social. Se volverá verde cuando esté activa.
                        </p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border: 2px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                            <div style="width: 36px; height: 36px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-link" style="color: white; font-size: 16px;"></i>
                            </div>
                            <span style="font-weight: 600; color: #374151; font-size: 15px;">Pegar URL</span>
                        </div>
                        <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                            Copia la URL completa de tu perfil y pégala en el campo correspondiente.
                        </p>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <h5 style="color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-size: 16px;">
                    <div style="width: 32px; height: 32px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-traffic-light" style="color: white; font-size: 16px;"></i>
                    </div>
                    <span>Estados de las Redes</span>
                </h5>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 15px;">
                    <div style="background: #d1fae5; padding: 12px; border-radius: 8px; text-align: center; border: 2px solid #10b981;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                            <div style="width: 16px; height: 16px; background: #10b981; border-radius: 50%;"></div>
                            <span style="color: #065f46; font-size: 14px; font-weight: 600;">Conectado</span>
                        </div>
                        <p style="color: #065f46; margin: 0; font-size: 12px;">Red activa con URL válida</p>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; text-align: center; border: 2px solid #f59e0b;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                            <div style="width: 16px; height: 16px; background: #f59e0b; border-radius: 50%;"></div>
                            <span style="color: #92400e; font-size: 14px; font-weight: 600;">Pendiente</span>
                        </div>
                        <p style="color: #92400e; margin: 0; font-size: 12px;">Activa sin URL o URL inválida</p>
                    </div>
                    
                    <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; text-align: center; border: 2px solid #9ca3af;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
                            <div style="width: 16px; height: 16px; background: #9ca3af; border-radius: 50%;"></div>
                            <span style="color: #4b5563; font-size: 14px; font-weight: 600;">Inactivo</span>
                        </div>
                        <p style="color: #4b5563; margin: 0; font-size: 12px;">Red desactivada</p>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <h5 style="color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; font-size: 16px;">
                    <div style="width: 32px; height: 32px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-link" style="color: white; font-size: 16px;"></i>
                    </div>
                    <span>Ejemplos de URLs Válidas</span>
                </h5>
                
                <div style="background: #f5f3ff; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <p style="color: #6d28d9; margin: 0 0 8px 0; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                                <i class="fab fa-facebook" style="color: #1877f2;"></i> Facebook:
                            </p>
                            <code style="display: block; background: white; padding: 8px; border-radius: 6px; 
                                   border: 1px solid #ddd; color: #6b7280; font-size: 12px; word-break: break-all;">
                                https://facebook.com/tu.usuario
                            </code>
                        </div>
                        <div>
                            <p style="color: #6d28d9; margin: 0 0 8px 0; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                                <i class="fab fa-instagram" style="color: #e4405f;"></i> Instagram:
                            </p>
                            <code style="display: block; background: white; padding: 8px; border-radius: 6px; 
                                   border: 1px solid #ddd; color: #6b7280; font-size: 12px; word-break: break-all;">
                                https://instagram.com/tu.usuario
                            </code>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin-top: 15px;">
                    <p style="color: #0369a1; margin: 0; font-size: 13px; display: flex; align-items: flex-start; gap: 10px;">
                        <i class="fas fa-lightbulb" style="color: #0ea5e9; flex-shrink: 0; margin-top: 2px;"></i>
                        <span>
                            <strong>Tip:</strong> Copia la URL directamente desde la barra de direcciones de tu navegador 
                            para evitar errores de escritura.
                        </span>
                    </p>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 15px; border-radius: 10px; border-left: 4px solid #d97706;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="flex-shrink: 0; width: 36px; height: 36px; background: #d97706; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-exclamation-circle" style="color: white; font-size: 16px;"></i>
                    </div>
                    <div>
                        <h6 style="color: #92400e; margin: 0 0 8px 0; font-size: 15px;">Solución de Problemas</h6>
                        <ul style="color: #92400e; padding-left: 20px; margin: 0; font-size: 13px; line-height: 1.6;">
                            <li><strong>URL no válida:</strong> Asegúrate de que comience con https://</li>
                            <li><strong>No se guarda:</strong> Verifica que la red esté activada (interruptor verde)</li>
                            <li><strong>Error de conexión:</strong> Revisa que el perfil sea público</li>
                            <li><strong>Problemas técnicos:</strong> Intenta limpiar la URL y volver a pegarla</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generar contenido de ayuda para seguridad
function generarContenidoAyudaSeguridad() {
    return `
        <div style="text-align: left; max-height: 500px; overflow-y: auto; padding-right: 10px;">
            <div style="background: linear-gradient(135deg, #fff8e1, #ffecb3); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f57c00, #e65100); 
                            border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-shield-alt" style="color: white; font-size: 30px;"></i>
                    </div>
                    <div>
                        <h4 style="color: #f57c00; margin: 0 0 5px 0; font-size: 18px;">Seguridad de la Cuenta</h4>
                        <p style="color: #5d4037; margin: 0; font-size: 14px;">Protege tu cuenta y datos personales</p>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 30px;">
                <h5 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-size: 16px;">
                    <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-key" style="color: white; font-size: 16px;"></i>
                    </div>
                    <span>Contraseña Segura</span>
                </h5>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #eff6ff; padding: 15px; border-radius: 10px; border: 2px solid #dbeafe;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                            <div style="width: 32px; height: 32px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-check" style="color: white; font-size: 14px;"></i>
                            </div>
                            <span style="font-weight: 600; color: #065f46; font-size: 15px;">Recomendado</span>
                        </div>
                        <ul style="color: #374151; padding-left: 20px; margin: 0; font-size: 13px; line-height: 1.8;">
                            <li>12+ caracteres mínimo</li>
                            <li>Mayúsculas y minúsculas</li>
                            <li>Números y símbolos</li>
                            <li>Cambio cada 3-6 meses</li>
                            <li>Única para cada servicio</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fef2f2; padding: 15px; border-radius: 10px; border: 2px solid #fee2e2;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                            <div style="width: 32px; height: 32px; background: #ef4444; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-times" style="color: white; font-size: 14px;"></i>
                            </div>
                            <span style="font-weight: 600; color: #b91c1c; font-size: 15px;">Evitar</span>
                        </div>
                        <ul style="color: #374151; padding-left: 20px; margin: 0; font-size: 13px; line-height: 1.8;">
                            <li>Información personal</li>
                            <li>Palabras comunes</li>
                            <li>Secuencias simples</li>
                            <li>Contraseñas repetidas</li>
                            <li>Guardar en navegador</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 30px;">
                <h5 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-size: 16px;">
                    <div style="width: 32px; height: 32px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-mobile-alt" style="color: white; font-size: 16px;"></i>
                    </div>
                    <span>Autenticación de Dos Factores (2FA)</span>
                </h5>
                
                <div style="background: #f5f3ff; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; margin-bottom: 20px;">
                        <div>
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #4285f4, #0d47a1); 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto;">
                                <i class="fab fa-google" style="color: white; font-size: 24px;"></i>
                            </div>
                            <p style="color: #374151; margin: 0; font-size: 13px; font-weight: 500;">Google Authenticator</p>
                        </div>
                        <div>
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #000, #333); 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto;">
                                <i class="fas fa-user-secret" style="color: white; font-size: 24px;"></i>
                            </div>
                            <p style="color: #374151; margin: 0; font-size: 13px; font-weight: 500;">Authy</p>
                        </div>
                        <div>
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #00a4ef, #0078d7); 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto;">
                                <i class="fas fa-lock" style="color: white; font-size: 24px;"></i>
                            </div>
                            <p style="color: #374151; margin: 0; font-size: 13px; font-weight: 500;">Microsoft Authenticator</p>
                        </div>
                    </div>
                    
                    <div style="background: #ede9fe; padding: 12px; border-radius: 8px;">
                        <p style="color: #5b21b6; margin: 0; font-size: 13px; display: flex; align-items: flex-start; gap: 10px;">
                            <i class="fas fa-info-circle" style="color: #6d28d9; flex-shrink: 0; margin-top: 2px;"></i>
                            <span><strong>Beneficios:</strong> 2FA previene el 99.9% de los ataques automatizados y protege tu cuenta incluso si tu contraseña es comprometida.</span>
                        </p>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <h5 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-size: 16px;">
                    <div style="width: 32px; height: 32px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-shield" style="color: white; font-size: 16px;"></i>
                    </div>
                    <span>Privacidad y Sesiones</span>
                </h5>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: #ecfdf5; padding: 15px; border-radius: 10px; border: 2px solid #d1fae5;">
                        <h6 style="color: #065f46; margin: 0 0 10px 0; font-size: 14px;">
                            <i class="fas fa-eye-slash" style="color: #10b981; margin-right: 8px;"></i>
                            Control de Visibilidad
                        </h6>
                        <p style="color: #374151; margin: 0; font-size: 13px; line-height: 1.6;">
                            Decide qué información ven otros usuarios: perfil público, estado en línea, quién puede enviarte mensajes.
                        </p>
                    </div>
                    
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; border: 2px solid #e0f2fe;">
                        <h6 style="color: #0369a1; margin: 0 0 10px 0; font-size: 14px;">
                            <i class="fas fa-clock" style="color: #0ea5e9; margin-right: 8px;"></i>
                            Gestión de Sesiones
                        </h6>
                        <p style="color: #374151; margin: 0; font-size: 13px; line-height: 1.6;">
                            Revisa y cierra sesiones activas en otros dispositivos. Detecta actividad inusual.
                        </p>
                    </div>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444;">
                <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <div style="flex-shrink: 0; width: 48px; height: 48px; background: #ef4444; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-exclamation-triangle" style="color: white; font-size: 20px;"></i>
                    </div>
                    <div>
                        <h6 style="color: #b91c1c; margin: 0 0 12px 0; font-size: 16px;">Acciones Críticas</h6>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <p style="color: #b91c1c; margin: 0 0 8px 0; font-weight: 500; font-size: 14px;">
                                    <i class="fas fa-sign-out-alt" style="color: #ef4444; margin-right: 8px;"></i>
                                    Cerrar Todas las Sesiones
                                </p>
                                <p style="color: #b91c1c; margin: 0; font-size: 13px; line-height: 1.6;">
                                    Desconecta tu cuenta de todos los dispositivos excepto este.
                                </p>
                            </div>
                            <div>
                                <p style="color: #b91c1c; margin: 0 0 8px 0; font-weight: 500; font-size: 14px;">
                                    <i class="fas fa-trash-alt" style="color: #ef4444; margin-right: 8px;"></i>
                                    Eliminar Cuenta
                                </p>
                                <p style="color: #b91c1c; margin: 0; font-size: 13px; line-height: 1.6;">
                                    Eliminación permanente. Todos los datos se pierden irreversiblemente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Modal de Soporte - Contacto directo mejorado
function mostrarSoporte() {
    Swal.fire({
        title: '📞 Soporte Técnico',
        html: `
            <div style="text-align: left; max-height: 600px; overflow-y: auto; padding-right: 10px;">
                <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                        <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #10b981, #047857); 
                                border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-headset" style="color: white; font-size: 32px;"></i>
                        </div>
                        <div>
                            <h4 style="color: #065f46; margin: 0 0 8px 0; font-size: 20px;">¿Necesitas Ayuda?</h4>
                            <p style="color: #047857; margin: 0; font-size: 15px;">Estamos aquí para ayudarte 24/7</p>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 20px; border-radius: 12px; 
                            text-align: center; cursor: pointer; transition: all 0.3s;" 
                         onclick="abrirChatSoporte()">
                        <div style="width: 60px; height: 60px; background: #0ea5e9; border-radius: 50%; display: flex; 
                             align-items: center; justify-content: center; margin: 0 auto 15px auto;">
                            <i class="fas fa-comment-dots" style="color: white; font-size: 24px;"></i>
                        </div>
                        <h5 style="color: #0369a1; margin: 0 0 10px 0; font-size: 16px;">Chat en Vivo</h5>
                        <p style="color: #0c4a6e; margin: 0; font-size: 13px; line-height: 1.6;">
                            Soporte inmediato con nuestro equipo técnico
                        </p>
                        <div style="background: #38bdf8; color: white; padding: 6px 12px; border-radius: 20px; 
                             font-size: 12px; font-weight: 500; margin-top: 12px; display: inline-block;">
                            <i class="fas fa-circle" style="color: #22c55e; font-size: 8px; margin-right: 6px;"></i>
                            Disponible ahora
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #fdf4ff, #fae8ff); padding: 20px; border-radius: 12px; 
                            text-align: center; cursor: pointer; transition: all 0.3s;"
                         onclick="enviarEmailSoporte()">
                        <div style="width: 60px; height: 60px; background: #c026d3; border-radius: 50%; display: flex; 
                             align-items: center; justify-content: center; margin: 0 auto 15px auto;">
                            <i class="fas fa-envelope" style="color: white; font-size: 24px;"></i>
                        </div>
                        <h5 style="color: #86198f; margin: 0 0 10px 0; font-size: 16px;">Email de Soporte</h5>
                        <p style="color: #701a75; margin: 0; font-size: 13px; line-height: 1.6;">
                            Respuesta en menos de 24 horas
                        </p>
                        <div style="color: #c026d3; font-size: 11px; margin-top: 12px;">
                            soporte@messery.com
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    <h5 style="color: #374151; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-size: 16px;">
                        <div style="width: 32px; height: 32px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-question-circle" style="color: white; font-size: 16px;"></i>
                        </div>
                        <span>Preguntas Frecuentes</span>
                    </h5>
                    
                    <div style="background: #fffbeb; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" 
                             onclick="toggleFAQ(1)">
                            <h6 style="color: #92400e; margin: 0; font-size: 14px;">
                                ¿Cómo recupero mi contraseña?
                            </h6>
                            <i class="fas fa-chevron-down" style="color: #d97706; transition: transform 0.3s;" id="faqIcon1"></i>
                        </div>
                        <div id="faqContent1" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px solid #fde68a;">
                            <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.6;">
                                Ve a la página de inicio de sesión y haz clic en "¿Olvidaste tu contraseña?". 
                                Ingresa tu email y sigue las instrucciones que recibirás.
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: #fffbeb; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" 
                             onclick="toggleFAQ(2)">
                            <h6 style="color: #92400e; margin: 0; font-size: 14px;">
                                ¿Mi información está segura?
                            </h6>
                            <i class="fas fa-chevron-down" style="color: #d97706; transition: transform 0.3s;" id="faqIcon2"></i>
                        </div>
                        <div id="faqContent2" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px solid #fde68a;">
                            <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.6;">
                                Sí, usamos encriptación de grado bancario y cumplimos con las normativas de protección de datos. 
                                Nunca compartimos tu información con terceros.
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: #fffbeb; padding: 15px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" 
                             onclick="toggleFAQ(3)">
                            <h6 style="color: #92400e; margin: 0; font-size: 14px;">
                                ¿Cómo elimino mi cuenta permanentemente?
                            </h6>
                            <i class="fas fa-chevron-down" style="color: #d97706; transition: transform 0.3s;" id="faqIcon3"></i>
                        </div>
                        <div id="faqContent3" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px solid #fde68a;">
                            <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.6;">
                                Ve a la sección de Seguridad y haz clic en "Eliminar Mi Cuenta". 
                                Sigue los pasos de confirmación. Esta acción es irreversible.
                            </p>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; border-left: 4px solid #d97706;">
                    <div style="display: flex; align-items: flex-start; gap: 15px;">
                        <div style="flex-shrink: 0; width: 48px; height: 48px; background: #d97706; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-clock" style="color: white; font-size: 20px;"></i>
                        </div>
                        <div>
                            <h6 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Horarios de Atención</h6>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <p style="color: #92400e; margin: 0 0 5px 0; font-weight: 500; font-size: 14px;">Chat en Vivo</p>
                                    <p style="color: #92400e; margin: 0; font-size: 13px;">24/7 - 365 días al año</p>
                                </div>
                                <div>
                                    <p style="color: #92400e; margin: 0 0 5px 0; font-weight: 500; font-size: 14px;">Soporte por Email</p>
                                    <p style="color: #92400e; margin: 0; font-size: 13px;">Lunes a Viernes: 8AM - 8PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 25px; text-align: center;">
                    <button onclick="descargarGuiaUsuario()" 
                            style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; border: none; 
                                   padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;">
                        <i class="fas fa-download" style="margin-right: 8px;"></i>
                        Descargar Guía del Usuario (PDF)
                    </button>
                </div>
            </div>
        `,
        width: 700,
        showConfirmButton: false,
        showCloseButton: true,
        background: '#ffffff'
    });
}

// Funciones auxiliares para soporte
function toggleFAQ(num) {
    const content = document.getElementById('faqContent' + num);
    const icon = document.getElementById('faqIcon' + num);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

function abrirChatSoporte() {
    Swal.fire({
        title: '💬 Iniciando Chat...',
        html: `
            <div style="text-align: center; padding: 30px;">
                <div style="width: 80px; height: 80px; border: 3px solid #e5e7eb; border-top: 3px solid #0ea5e9; 
                        border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px auto;"></div>
                <p style="color: #4b5563; margin-bottom: 15px;">Conectando con nuestro equipo de soporte...</p>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 10px;">
                    <p style="color: #0369a1; margin: 0; font-size: 14px;">
                        <i class="fas fa-user-headset" style="color: #0ea5e9; margin-right: 8px;"></i>
                        Te atenderá: <strong>Carlos - Especialista Técnico</strong>
                    </p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `,
        showConfirmButton: false,
        background: '#ffffff',
        allowOutsideClick: false,
        timer: 2000
    }).then(() => {
        Swal.fire({
            title: '✅ Conectado',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0ea5e9, #0369a1); 
                            border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                        <i class="fas fa-comments" style="color: white; font-size: 40px;"></i>
                    </div>
                    <p style="color: #0369a1; font-weight: 500; margin-bottom: 10px;">
                        ¡Hola! Soy Carlos, ¿en qué puedo ayudarte hoy?
                    </p>
                    <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin-top: 15px;">
                        <p style="color: #0c4a6e; margin: 0; font-size: 13px;">
                            <i class="fas fa-info-circle" style="color: #0ea5e9; margin-right: 8px;"></i>
                            El chat se abrirá en una nueva ventana en unos segundos
                        </p>
                    </div>
                </div>
            `,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#0ea5e9',
            background: '#ffffff'
        });
    });
}

function enviarEmailSoporte() {
    Swal.fire({
        title: '✉️ Contactar por Email',
        html: `
            <div style="text-align: left;">
                <div style="background: #fdf4ff; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="color: #86198f; margin: 0; font-size: 14px;">
                        <i class="fas fa-envelope-open-text" style="color: #c026d3; margin-right: 8px;"></i>
                        Envía tu consulta a: <strong>soporte@messery.com</strong>
                    </p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #374151; font-weight: 500; display: block; margin-bottom: 8px;">
                        <i class="fas fa-user" style="color: #8b5cf6; margin-right: 8px;"></i>
                        Tu Nombre
                    </label>
                    <input type="text" id="supportName" class="swal2-input" placeholder="Ingresa tu nombre completo" 
                           value="${usuarioActual ? usuarioActual.nombre + ' ' + usuarioActual.apellidos : ''}">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #374151; font-weight: 500; display: block; margin-bottom: 8px;">
                        <i class="fas fa-at" style="color: #3b82f6; margin-right: 8px;"></i>
                        Tu Email
                    </label>
                    <input type="email" id="supportEmail" class="swal2-input" placeholder="tu@email.com" 
                           value="${usuarioActual ? usuarioActual.email : ''}">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="color: #374151; font-weight: 500; display: block; margin-bottom: 8px;">
                        <i class="fas fa-tag" style="color: #10b981; margin-right: 8px;"></i>
                        Tipo de Problema
                    </label>
                    <select id="supportType" class="swal2-input" style="width: 100%; padding: 8px 12px; border: 2px solid #e5e7eb; 
                           border-radius: 8px; background: white; color: #374151; font-size: 14px;">
                        <option value="">Selecciona una opción...</option>
                        <option value="tecnico">Problema Técnico</option>
                        <option value="cuenta">Cuenta y Acceso</option>
                        <option value="pago">Facturación y Pagos</option>
                        <option value="privacy">Privacidad y Seguridad</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="color: #374151; font-weight: 500; display: block; margin-bottom: 8px;">
                        <i class="fas fa-comment-dots" style="color: #f59e0b; margin-right: 8px;"></i>
                        Descripción del Problema
                    </label>
                    <textarea id="supportMessage" class="swal2-textarea" placeholder="Describe detalladamente tu problema..." 
                              rows="5" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; 
                              font-size: 14px; resize: vertical;"></textarea>
                </div>
                
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px;">
                    <p style="color: #92400e; margin: 0; font-size: 13px; display: flex; align-items: flex-start; gap: 8px;">
                        <i class="fas fa-info-circle" style="color: #f59e0b;"></i>
                        <span>Incluye capturas de pantalla si es posible. Te responderemos en menos de 24 horas.</span>
                    </p>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Enviar Email',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#c026d3',
        cancelButtonColor: '#6b7280',
        background: '#ffffff',
        width: 500,
        preConfirm: () => {
            const name = document.getElementById('supportName').value;
            const email = document.getElementById('supportEmail').value;
            const type = document.getElementById('supportType').value;
            const message = document.getElementById('supportMessage').value;
            
            if (!name || !email || !type || !message) {
                Swal.showValidationMessage('Todos los campos son requeridos');
                return false;
            }
            
            if (!isValidEmail(email)) {
                Swal.showValidationMessage('Ingresa un email válido');
                return false;
            }
            
            return { name, email, type, message };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: '📤 Enviando...',
                html: `
                    <div style="text-align: center; padding: 30px;">
                        <div style="width: 80px; height: 80px; border: 3px solid #e5e7eb; border-top: 3px solid #c026d3; 
                                border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px auto;"></div>
                        <p style="color: #4b5563; margin-bottom: 15px;">Enviando tu mensaje al equipo de soporte...</p>
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                `,
                showConfirmButton: false,
                background: '#ffffff',
                allowOutsideClick: false,
                timer: 2000
            }).then(() => {
                Swal.fire({
                    title: '✅ Mensaje Enviado',
                    html: `
                        <div style="text-align: center; padding: 20px;">
                            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #c026d3, #86198f); 
                                    border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                                <i class="fas fa-paper-plane" style="color: white; font-size: 40px;"></i>
                            </div>
                            <p style="color: #86198f; font-weight: 500; margin-bottom: 10px;">
                                ¡Mensaje enviado exitosamente!
                            </p>
                            <p style="color: #4b5563; font-size: 14px; margin-bottom: 15px;">
                                Hemos recibido tu consulta. Te responderemos a:
                            </p>
                            <div style="background: #fdf4ff; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                                <p style="color: #86198f; margin: 0; font-size: 14px;">
                                    <strong>${result.value.email}</strong>
                                </p>
                            </div>
                            <div style="background: #f0f9ff; padding: 12px; border-radius: 8px;">
                                <p style="color: #0369a1; margin: 0; font-size: 13px;">
                                    <i class="fas fa-clock" style="color: #0ea5e9; margin-right: 8px;"></i>
                                    Número de referencia: <strong>SR-${Date.now().toString().slice(-6)}</strong>
                                </p>
                            </div>
                        </div>
                    `,
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#c026d3',
                    background: '#ffffff'
                });
            });
        }
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function descargarGuiaUsuario() {
    Swal.fire({
        title: '📥 Descargando Guía',
        html: `
            <div style="text-align: center; padding: 30px;">
                <div style="width: 80px; height: 80px; border: 3px solid #e5e7eb; border-top: 3px solid #8b5cf6; 
                        border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px auto;"></div>
                <p style="color: #4b5563; margin-bottom: 15px;">Preparando la Guía del Usuario...</p>
                <div style="background: #f5f3ff; padding: 12px; border-radius: 8px;">
                    <p style="color: #6d28d9; margin: 0; font-size: 13px;">
                        <i class="fas fa-file-pdf" style="color: #8b5cf6; margin-right: 8px;"></i>
                        Guía_completa_Messery.pdf (5.2 MB)
                    </p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `,
        showConfirmButton: false,
        background: '#ffffff',
        timer: 2000
    }).then(() => {
        Swal.fire({
            title: '✅ Descarga Completa',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); 
                            border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                        <i class="fas fa-check" style="color: white; font-size: 40px;"></i>
                    </div>
                    <p style="color: #5b21b6; font-weight: 500; margin-bottom: 10px;">
                        Guía descargada exitosamente
                    </p>
                    <div style="background: #f5f3ff; padding: 12px; border-radius: 8px; margin-top: 15px;">
                        <p style="color: #6d28d9; margin: 0; font-size: 13px;">
                            <i class="fas fa-info-circle" style="color: #8b5cf6; margin-right: 8px;"></i>
                            La guía se ha guardado en tu carpeta de descargas
                        </p>
                    </div>
                </div>
            `,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b5cf6',
            background: '#ffffff'
        });
    });
}