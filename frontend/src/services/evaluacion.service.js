import axios from './root.service';

export const crearEvaluacion = async (data) => {
  try {
    const response = await axios.post('/evaluacion', data);
    return response.data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error de red' };
  }
};

export const obtenerEvaluaciones = async () => {
  try {
    const response = await axios.get('/evaluacion');
    return response.data;
  } catch (error) {
    return error.response?.data || { status: 'Error', message: 'Error de red' };
  }
};
