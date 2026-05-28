"use strict";

import axios from "./root.service.js";

export async function crearIncidencia(dataIncidencia) {
    try{
        const response =await axios.post('/incidencias', dataIncidencia);
        return response.data;
    }catch(error){
        return error.response.data;
    }
}
export async function getIncidencias() {
    try{
        const {data}= await axios.get('incidencias');
        return data.data;

    }catch(error){
        return error.response.data;
    }
}
export async function getIncidenciaPorId(id){
    try{
        const {data}=await axios.get(`incidencias/${id}`);
        return data.data;
    }catch(error){
        return error.response.data;
    }
}