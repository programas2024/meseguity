// Función para mostrar información sobre los logros
function mostrarInformacionRank() {
    Swal.fire({
        title: '🏆 ¡Bienvenido a Messery Logros!',
        html: `
            <div style="text-align: center; line-height: 1.6; color: #555;">
                <!-- Mensaje principal -->
                <div style="margin-bottom: 30px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); padding: 25px; border-radius: 12px; border: 2px solid rgba(102, 126, 234, 0.2);">
                    <div style="font-size: 20px; color: #667eea; font-weight: 700; margin-bottom: 15px;">
                        <i class="fas fa-trophy" style="margin-right: 10px;"></i>
                        ¡Tu Centro de Logros y Recompensas!
                    </div>
                    <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 20px;">
                        Desbloquea logros especiales, gana puntos<br>
                        <span style="color: #667eea;">¡Y reclama increíbles recompensas!</span>
                    </div>
                    <div style="font-size: 17px; color: #666; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
                        <i class="fas fa-gem" style="color: #FFC107; margin-right: 8px;"></i>
                        Cada logro completado te otorga puntos que puedes usar dentro de la plataforma
                    </div>
                </div>
                
                <!-- Mensaje motivacional -->
                <div style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; text-align: center; box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);">
                    <div style="font-size: 22px; font-weight: 800; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <i class="fas fa-medal" style="margin-right: 10px;"></i>
                        ¡DESBLOQUEA TODOS LOS LOGROS!
                    </div>
                    <div style="font-size: 16px; opacity: 0.95;">
                        Completa desafíos y gana recompensas exclusivas
                    </div>
                </div>
                
                <!-- Tipos de logros -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #667eea; margin-bottom: 20px; font-size: 22px; border-bottom: 3px solid #667eea; padding-bottom: 10px; display: inline-block;">
                        <i class="fas fa-bolt" style="margin-right: 10px;"></i>
                        Tipos de Logros Disponibles:
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 25px;">
                        <!-- Logros de Mensajes -->
                        <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #667eea; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1); transition: transform 0.3s ease;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 26px; margin: 0 auto 15px;">
                                <i class="fas fa-comment-alt"></i>
                            </div>
                            <div style="font-weight: 700; color: #667eea; margin-bottom: 8px; font-size: 16px;">
                                Logros de Mensajes
                            </div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
                                    <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 12px;"></i>
                                    <span>Primer mensaje recibido</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
                                    <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 12px;"></i>
                                    <span>Mensajero activo (20 mensajes)</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 12px;"></i>
                                    <span>Popularidad (30 mensajes)</span>
                                </div>
                            </div>
                            <div style="background: rgba(102, 126, 234, 0.1); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #667eea;">
                                4 Logros disponibles
                            </div>
                        </div>
                        
                        <!-- Logros de Grupos -->
                        <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #4CAF50; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.1); transition: transform 0.3s ease;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 26px; margin: 0 auto 15px;">
                                <i class="fas fa-users"></i>
                            </div>
                            <div style="font-weight: 700; color: #4CAF50; margin-bottom: 8px; font-size: 16px;">
                                Logros de Grupos
                            </div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
                                    <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 12px;"></i>
                                    <span>Fundador de grupo</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 12px;"></i>
                                    <span>Integrante social</span>
                                </div>
                            </div>
                            <div style="background: rgba(76, 175, 80, 0.1); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #4CAF50;">
                                2 Logros disponibles
                            </div>
                        </div>
                        
                        <!-- Logros de Amigos -->
                        <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #FF9800; box-shadow: 0 4px 15px rgba(255, 152, 0, 0.1); transition: transform 0.3s ease;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 26px; margin: 0 auto 15px;">
                                <i class="fas fa-user-friends"></i>
                            </div>
                            <div style="font-weight: 700; color: #FF9800; margin-bottom: 8px; font-size: 16px;">
                                Logros de Amigos
                            </div>
                            <div style="font-size: 13px; color: #666; margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
                                    <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 12px;"></i>
                                    <span>Primera conexión</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 12px;"></i>
                                    <span>Socializador (2+ amigos)</span>
                                </div>
                            </div>
                            <div style="background: rgba(255, 152, 0, 0.1); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #FF9800;">
                                2 Logros disponibles
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cómo funciona el sistema -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #667eea; margin-bottom: 20px; font-size: 22px; text-align: center;">
                        <i class="fas fa-cogs" style="margin-right: 10px;"></i>
                        ¿Cómo funcionan los logros?
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #666; font-size: 18px; margin: 0 auto 10px;">
                                <i class="fas fa-lock"></i>
                            </div>
                            <div style="font-weight: 600; color: #333; font-size: 13px;">1. Bloqueado</div>
                        </div>
                        
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(102, 126, 234, 0.1); display: flex; align-items: center; justify-content: center; color: #667eea; font-size: 18px; margin: 0 auto 10px;">
                                <i class="fas fa-spinner"></i>
                            </div>
                            <div style="font-weight: 600; color: #333; font-size: 13px;">2. En progreso</div>
                        </div>
                        
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(102, 126, 234, 0.2); display: flex; align-items: center; justify-content: center; color: #667eea; font-size: 18px; margin: 0 auto 10px;">
                                <i class="fas fa-unlock"></i>
                            </div>
                            <div style="font-weight: 600; color: #333; font-size: 13px;">3. Desbloqueado</div>
                        </div>
                        
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(76, 175, 80, 0.2); display: flex; align-items: center; justify-content: center; color: #4CAF50; font-size: 18px; margin: 0 auto 10px;">
                                <i class="fas fa-gift"></i>
                            </div>
                            <div style="font-weight: 600; color: #333; font-size: 13px;">4. Reclamado</div>
                        </div>
                    </div>
                    
                    <div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                            <i class="fas fa-info-circle" style="color: #667eea; margin-right: 8px;"></i>
                            <strong>Importante:</strong> No olvides reclamar tus logros desbloqueados para obtener los puntos de recompensa
                        </p>
                    </div>
                </div>
                
                <!-- Recompensas y puntos -->
                <div style="background: #fff8e1; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 2px solid #ffecb3;">
                    <h4 style="color: #FF9800; margin-bottom: 15px; font-size: 18px; text-align: center;">
                        <i class="fas fa-coins" style="margin-right: 8px;"></i>
                        Sistema de Recompensas:
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 1px solid #FFC107;">
                            <div style="font-size: 24px; font-weight: 800; color: #FFC107; margin-bottom: 5px;">
                                100-500
                            </div>
                            <div style="font-size: 12px; font-weight: 600; color: #333;">Puntos por logro</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border: 1px solid #FFC107;">
                            <div style="font-size: 24px; font-weight: 800; color: #FFC107; margin-bottom: 5px;">
                                1,800
                            </div>
                            <div style="font-size: 12px; font-weight: 600; color: #333;">Puntos totales posibles</div>
                        </div>
                    </div>
                    <div style="text-align: center; font-size: 14px; color: #FF9800; font-weight: 600;">
                        <i class="fas fa-gem" style="margin-right: 5px;"></i>
                        Los puntos se acumulan y puedes usarlos en futuras funciones de la plataforma
                    </div>
                </div>
                
                <!-- Consejos para ganar logros -->
                <div style="margin-bottom: 25px;">
                    <h4 style="color: #667eea; margin-bottom: 15px; font-size: 18px; text-align: center;">
                        <i class="fas fa-lightbulb" style="margin-right: 8px;"></i>
                        Consejos para ganar logros rápidamente:
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
                            <div style="font-weight: 600; color: #667eea; font-size: 14px; margin-bottom: 5px;">
                                <i class="fas fa-comments" style="margin-right: 8px;"></i>
                                Sé activo en mensajes
                            </div>
                            <div style="font-size: 12px; color: #666;">
                                Envía y responde mensajes regularmente
                            </div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
                            <div style="font-weight: 600; color: #4CAF50; font-size: 14px; margin-bottom: 5px;">
                                <i class="fas fa-user-plus" style="margin-right: 8px;"></i>
                                Conecta con otros
                            </div>
                            <div style="font-size: 12px; color: #666;">
                                Agrega amigos y únete a grupos
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Llamado a la acción -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);">
                    <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <i class="fas fa-rocket"></i>
                        ¡Comienza tu aventura de logros!
                    </div>
                    <div style="font-size: 16px; opacity: 0.95;">
                        Cada interacción te acerca a nuevas recompensas.<br>
                        ¡Sé constante y verás cómo tus puntos aumentan!
                    </div>
                    <div style="margin-top: 15px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; font-size: 14px;">
                        <i class="fas fa-sync-alt" style="margin-right: 8px;"></i>
                        Recuerda usar el botón "Actualizar" para ver tu progreso en tiempo real
                    </div>
                </div>
            </div>
        `,
        width: 850,
        padding: '30px 25px',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: '¡A ganar logros!',
        confirmButtonColor: '#667eea',
        backdrop: true,
        allowOutsideClick: true,
        customClass: {
            popup: 'swal2-popup-info',
            title: 'swal2-title-info',
            confirmButton: 'swal2-confirm-button-info'
        },
        // Añadir efectos al hacer hover sobre las tarjetas
        didOpen: () => {
            document.querySelectorAll('.swal2-popup .swal2-html-container > div > div > div > div').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                    this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                });
            });
            
            // Efecto especial para tarjetas de logros
            document.querySelectorAll('.swal2-popup .swal2-html-container > div > div > div:nth-child(3) > div > div').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    const borderColor = getComputedStyle(this).borderColor;
                    this.style.boxShadow = `0 8px 25px ${borderColor}40`;
                });
            });
        }
    });
}