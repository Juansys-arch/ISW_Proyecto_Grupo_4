import React from 'react';
import '@styles/profileModal.css';
import CloseIcon from '@assets/XIcon.svg';

const ProfileModal = ({ isOpen, onClose, user, userRoleLabel, userInitials }) => {
    if (!isOpen) return null;

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="profile-modal-close" onClick={onClose} aria-label="Cerrar perfil">
                    <img src={CloseIcon} alt="Cerrar" />
                </button>

                <div className="profile-modal-header">
                    <div className="profile-modal-avatar-wrapper">
                        <div className="profile-modal-avatar">{userInitials || 'U'}</div>
                    </div>
                </div>

                <div className="profile-modal-body">
                    <h2 className="profile-modal-title">Mi Perfil</h2>
                    <p className="profile-modal-subtitle">Detalles de tu cuenta de usuario</p>

                    <div className="profile-modal-details">
                        <div className="profile-modal-field">
                            <span className="profile-modal-field-label">Nombre Completo</span>
                            <span className="profile-modal-field-value">{user?.nombreCompleto || 'No especificado'}</span>
                        </div>

                        <div className="profile-modal-field">
                            <span className="profile-modal-field-label">Correo Electrónico</span>
                            <span className="profile-modal-field-value">{user?.email || 'No especificado'}</span>
                        </div>

                        <div className="profile-modal-field">
                            <span className="profile-modal-field-label">RUT</span>
                            <span className="profile-modal-field-value">{user?.rut || 'No especificado'}</span>
                        </div>

                        <div className="profile-modal-field">
                            <span className="profile-modal-field-label">Rol Asignado</span>
                            <span className="profile-modal-role-badge">{userRoleLabel || 'Sin rol'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
