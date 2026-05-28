"use strict";

import axios from "./root.service.js";

export async function getMateriales() {
    try{
        const {data}= await axios.get('/inventario/materiales');
        return data.data;
    }catch(error){
        return error.response.data;
    }
}
export async function getMaterialPorId(id){
    try{
        const {data}=await axios.get('/inventario/materiales/${id}');
        return data.data
    }catch(error){
        return error.response.data;
    }
}
export async function crearMaterial(dataMaterial){
    try{
        const {data}= await axios.post('/inventario/materiales',dataMaterial);
        return data;
    }catch(error){
        return error.response.data;
    }
}
export async function updateMaterial(id, dataMovimiento){
    try{
        const{data} = await axios.put('/inventario/materiales/${id}',dataMovimiento);
        return response.data.data;
    }catch(error){
        return error.response.data;
    }
}
export async function getMovimientos(materialId = null){
    try{
        const url = materialId ? `/inventario/movimientos?materialId=${materialId}` : '/inventario/movimientos';
        const{data}= await axios.get(url);
        return data.data;
    }catch(error){
        return error.response.data;
    }
}
export async function registrarMovimiento(dataMovimiento){
    try{
        const{data} =await axios.post(`/inventario/movimientos/`, dataMovimiento);
        return data.data;
    }catch(error){
        return error.response.data;
    }
}
export async function solicitarMaterial(dataSolicitud){
    try{
        const response = await axios.post('/inventario/solicitudes',dataSolicitud);
        return response.data;
    }catch(error){
        return error.response.data;
    }
}

export async function getSolicitudes(){
    try{
        const {data} = await axios.get('/inventario/solicitudes');
        return data.data;
    }catch(error){
        return error.response.data;
    }
}

export async function getMisSolicitudes(){
    try{
        const {data} = await axios.get('/inventario/solicitudes/mis');
        return data.data;
    }catch(error){
        return error.response.data;
    }
}

export async function actualizarEstadoSolicitud(id, estado){
    try{
        const {data} = await axios.patch(`/inventario/solicitudes/${id}/estado`, { estado });
        return data.data;
    }catch(error){
        return error.response.data;
    }
}
