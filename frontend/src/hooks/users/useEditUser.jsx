import { useState } from 'react';
import { updateUser } from '@services/user.service';

const useEditUser = (setUsers) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [dataUser, setDataUser] = useState([]);

  const handleClickUpdate = () => {
    if (dataUser.length > 0) {
      setIsPopupOpen(true);
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      if (dataUser.length === 1) {
        const rut = dataUser[0].rut;
        await updateUser(updatedData, rut);
        
        // Update the users list with the new data
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.rut === rut ? { ...user, ...updatedData } : user
          )
        );
        
        setIsPopupOpen(false);
        setDataUser([]);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataUser,
    setDataUser,
  };
};

export default useEditUser;
