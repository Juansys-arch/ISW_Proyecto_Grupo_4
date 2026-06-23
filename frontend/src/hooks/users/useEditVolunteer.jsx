import { useState } from 'react';
import { updateVolunteer } from '@services/volunteer.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const useEditVolunteer = (onSuccess) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [dataUser, setDataUser] = useState([]);

    const handleClickUpdate = () => {
        if (dataUser.length > 0) {
            setIsPopupOpen(true);
        }
    };

    const handleUpdate = async (updatedVolunteerData) => {
        if (updatedVolunteerData) {
            try {
                const id = dataUser[0]?.id;
                if (!id) {
                    return showErrorAlert('Error', 'ID de voluntario no disponible');
                }

                const updated = await updateVolunteer(updatedVolunteerData, id);
                showSuccessAlert('¡Actualizado!','El voluntario ha sido actualizado correctamente.');
                setIsPopupOpen(false);
                setDataUser([]);

                if (typeof onSuccess === 'function') onSuccess();

            } catch (error) {
                console.error('Error al actualizar el voluntario:', error);
                showErrorAlert('Cancelado','Ocurrió un error al actualizar el voluntario.');
            }
        }
    };

    return {
        handleClickUpdate,
        handleUpdate,
        isPopupOpen,
        setIsPopupOpen,
        dataUser,
        setDataUser
    };
};

export default useEditVolunteer;
