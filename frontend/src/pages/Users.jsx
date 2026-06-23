import Table from '@components/Table';
import useUsers from '@hooks/users/useGetUsers.jsx';
import Search from '../components/Search';
import Popup from '../components/Popup';
import PlusIcon from '../assets/plusIcon.svg';
import DeleteIcon from '../assets/deleteIcon.svg';
import UpdateIcon from '../assets/updateIcon.svg';
import UpdateIconDisable from '../assets/updateIconDisabled.svg';
import DeleteIconDisable from '../assets/deleteIconDisabled.svg';
import { useCallback, useState } from 'react';
import '@styles/users.css';
import useEditUser from '@hooks/users/useEditUser';
import useDeleteUser from '@hooks/users/useDeleteUser';
import { createVolunteerOnSite } from '@services/volunteer.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';

const Users = () => {
  const { users, fetchUsers, setUsers } = useUsers();
  const [filterRut, setFilterRut] = useState('');
  const [popupMode, setPopupMode] = useState('edit');

  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataUser,
    setDataUser
  } = useEditUser(setUsers);
  const { handleDelete } = useDeleteUser(fetchUsers, setDataUser);

  const handleClickAdd = () => {
    setDataUser([]);
    setPopupMode('create');
    setIsPopupOpen(true);
  };

  const handleCreate = async (newVolunteerData) => {
    try {
      const payload = {
        ...newVolunteerData,
        rol: 'voluntario',
      };
      const response = await createVolunteerOnSite(payload);

      if (!response || response.status === 'Client error' || response.status === 'Server error') {
        const message = response?.details || response?.message || 'Ocurrió un error al agregar el voluntario.';
        return showErrorAlert('Error', message);
      }

      const createdVolunteer = response.data;
      if (!createdVolunteer) {
        return showErrorAlert('Error', 'Respuesta inválida del servidor.');
      }

      showSuccessAlert('¡Agregado!', 'El voluntario ha sido agregado correctamente.');
      setIsPopupOpen(false);
      setUsers((prevUsers) => [...prevUsers, createdVolunteer]);
      setDataUser([]);
    } catch (error) {
      console.error('Error al añadir voluntario:', error);
      showErrorAlert('Cancelado', 'Ocurrió un error al añadir el voluntario.');
    }
  };

  const handleRutFilterChange = (e) => {
    setFilterRut(e.target.value);
  };

  const handleSelectionChange = useCallback((selectedUsers) => {
    setDataUser(selectedUsers);
  }, [setDataUser]);

  const columns = [
    { title: "Nombre", field: "nombreCompleto", width: 350, responsive: 0 },
    { title: "Correo electrónico", field: "email", width: 300, responsive: 3 },
    { title: "Teléfono", field: "numeroContacto", width: 200, responsive: 3 },
    { title: "Rut", field: "rut", width: 150, responsive: 2 },
    { title: "Rol", field: "rol", width: 200, responsive: 2 },
    { title: "Creado", field: "createdAt", width: 200, responsive: 2 }
  ];

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Voluntarios</h1>
          <div className='filter-actions'>
            <Search value={filterRut} onChange={handleRutFilterChange} placeholder={'Filtrar por rut'} />
            <button className='edit-user-button' type='button' onClick={handleClickUpdate} disabled={dataUser.length === 0}>
              {dataUser.length === 0 ? (
                <img src={UpdateIconDisable} alt="edit-disabled" />
              ) : (
                <img src={UpdateIcon} alt="edit" />
              )}
              <span>Editar</span>
            </button>
            <button className='add-user-button' type='button' onClick={handleClickAdd}>
              <img src={PlusIcon} alt="add" />
              <span>Añadir</span>
            </button>
            <button className='delete-user-button' type='button' disabled={dataUser.length === 0} onClick={() => handleDelete(dataUser)}>
              {dataUser.length === 0 ? (
                <img src={DeleteIconDisable} alt="delete-disabled" />
              ) : (
                <img src={DeleteIcon} alt="delete" />
              )}
              <span>Eliminar</span>
            </button>
          </div>
        </div>
        <Table
          data={users}
          columns={columns}
          filter={filterRut}
          dataToFilter={'rut'}
          initialSortName={'nombreCompleto'}
          onSelectionChange={handleSelectionChange}
        />
      </div>
      <Popup
        show={isPopupOpen}
        setShow={setIsPopupOpen}
        data={dataUser}
        action={popupMode === 'create' ? handleCreate : handleUpdate}
        mode={popupMode}
      />
    </div>
  );
};

export default Users;