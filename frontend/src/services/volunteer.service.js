import axios from './root.service.js';

export async function createVolunteerOnSite(data) {
    try {
        const response = await axios.post('/volunteer/register', data);
        return response.data;
    } catch (error) {
        return error.response ? error.response.data : { status: 'Client error' };
    }
}

export async function getVolunteers() {
    try {
        const response = await axios.get('/volunteer/');
        return response.data.data;
    } catch (error) {
        return error.response ? error.response.data : { status: 'Client error' };
    }
}

export async function getRegionsList() {
    try {
        const response = await axios.get('/volunteer/regions/list');
        return response.data;
    } catch (error) {
        return error.response ? error.response.data : { status: 'Client error' };
    }
}

export async function updateVolunteer(data, id) {
    try {
        const response = await axios.put(`/volunteer/${id}`, data);
        return response.data.data;
    } catch (error) {
        return error.response ? error.response.data : { status: 'Client error' };
    }
}
