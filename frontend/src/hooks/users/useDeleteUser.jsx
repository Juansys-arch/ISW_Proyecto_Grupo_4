import { deleteUser } from '@services/user.service';

const useDeleteUser = (fetchUsers, setDataUser) => {
  const handleDelete = async (usersToDelete) => {
    try {
      // Delete each selected user
      for (const user of usersToDelete) {
        await deleteUser(user.rut);
      }
      
      // Refresh the users list
      fetchUsers();
      setDataUser([]);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return {
    handleDelete,
  };
};

export default useDeleteUser;
