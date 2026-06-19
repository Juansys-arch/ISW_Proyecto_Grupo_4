"use strict";

import axios from './root.service.js';

export async function getNotificaciones(){
    try{
        const {data}=await axios.get('/notificaciones');
        return data.data;
    }catch(error){
        return error.response.data;
    }
}
export async function marcarNotificacionLeida(id){
    try{
        const response= await axios.patch(`/notificaciones/${id}/leer`);
        return response.data;

    }catch(error){
        return error.response.data;
    }
}