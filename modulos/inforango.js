// Función para mostrar información sobre la página
function mostrarInformacionRank() {
    Swal.fire({
        title: '🏆 ¡Bienvenido a Messery Rango!',
        html: `
            <div style="text-align: center; line-height: 1.6; color: #555;">
                <!-- Mensaje principal -->
                <div style="margin-bottom: 30px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); padding: 25px; border-radius: 12px; border: 2px solid rgba(102, 126, 234, 0.2);">
                    <div style="font-size: 20px; color: #667eea; font-weight: 700; margin-bottom: 15px;">
                        <i class="fas fa-crown" style="margin-right: 10px;"></i>
                        ¡Tu Centro de Clasificación!
                    </div>
                    <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 20px;">
                        Aquí podrás ver la clasificación tuya y la de tus amigos<br>
                        <span style="color: #667eea;">¡Para que estés enterado!</span>
                    </div>
                    <div style="font-size: 17px; color: #666; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
                        <i class="fas fa-star" style="color: #FFD700; margin-right: 8px;"></i>
                        También podrás ver a todos los usuarios y las cosas interesantes que hagan fuera
                    </div>
                </div>
                
                <!-- Mensaje motivacional -->
                <div style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #6B7AFFFF 0%, #FF8EF9FF 100%); border-radius: 12px; color: white; text-align: center; box-shadow: 0 5px 20px rgba(255, 107, 107, 0.3);">
                    <div style="font-size: 22px; font-weight: 800; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <i class="fas fa-trophy" style="margin-right: 10px;"></i>
                        ¡Y SE EL MEJOR!
                    </div>
                    <div style="font-size: 16px; opacity: 0.95;">
                        Supera tus límites y alcanza la cima del ranking
                    </div>
                </div>
                
                <!-- Características principales -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #667eea; margin-bottom: 20px; font-size: 22px; border-bottom: 3px solid #667eea; padding-bottom: 10px; display: inline-block;">
                        <i class="fas fa-bolt" style="margin-right: 10px;"></i>
                        Lo que puedes hacer aquí:
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 25px;">
                        <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e9ecef; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s ease;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; margin: 0 auto 15px;">
                                <i class="fas fa-user-friends"></i>
                            </div>
                            <div style="font-weight: 700; color: #333; margin-bottom: 8px; font-size: 16px;">
                                Ver tu posición
                            </div>
                            <div style="font-size: 14px; color: #666;">
                                Descubre dónde estás en el ranking general
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e9ecef; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s ease;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; margin: 0 auto 15px;">
                                <i class="fas fa-users"></i>
                            </div>
                            <div style="font-weight: 700; color: #333; margin-bottom: 8px; font-size: 16px;">
                                Seguir a amigos
                            </div>
                            <div style="font-size: 14px; color: #666;">
                                Monitorea el progreso de tus amigos
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                        <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e9ecef; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s ease;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; margin: 0 auto 15px;">
                                <i class="fas fa-eye"></i>
                            </div>
                            <div style="font-weight: 700; color: #333; margin-bottom: 8px; font-size: 16px;">
                                Ver a todos
                            </div>
                            <div style="font-size: 14px; color: #666;">
                                Explora todos los usuarios de la comunidad
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #e9ecef; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s ease;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #9C27B0 0%, #673AB7 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; margin: 0 auto 15px;">
                                <i class="fas fa-fire"></i>
                            </div>
                            <div style="font-weight: 700; color: #333; margin-bottom: 8px; font-size: 16px;">
                                Actividades interesantes
                            </div>
                            <div style="font-size: 14px; color: #666;">
                                Descubre lo mejor que hacen los usuarios
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Medallas disponibles -->
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 2px dashed #667eea;">
                    <h4 style="color: #667eea; margin-bottom: 15px; font-size: 18px; text-align: center;">
                        <i class="fas fa-medal" style="margin-right: 8px;"></i>
                        Medallas que puedes conseguir:
                    </h4>
                    <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                        <div style="text-align: center;">
                            <div style="font-size: 28px;">🥇</div>
                            <div style="font-size: 12px; font-weight: 600; color: #333;">Primer Lugar</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 28px;">🥈</div>
                            <div style="font-size: 12px; font-weight: 600; color: #333;">Segundo Lugar</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 28px;">🥉</div>
                            <div style="font-size: 12px; font-weight: 600; color: #333;">Tercer Lugar</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 28px;">⭐</div>
                            <div style="font-size: 12px; font-weight: 600; color: #333;">Top 10</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 28px;">🏆</div>
                            <div style="font-size: 12px; font-weight: 600; color: #333;">Top 50</div>
                        </div>
                    </div>
                </div>
                
                <!-- Consejo final -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);">
                    <div style="font-size: 18px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <i class="fas fa-lightbulb"></i>
                        ¡Un consejo para ti!
                    </div>
                    <div style="font-size: 16px; opacity: 0.95;">
                        Mantente activo, interactúa con la comunidad y sé constante.<br>
                        ¡Así llegarás a la cima del ranking!
                    </div>
                </div>
            </div>
        `,
        width: 800,
        padding: '30px 25px',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: '¡Vamos a competir!',
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
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        }
    });
}