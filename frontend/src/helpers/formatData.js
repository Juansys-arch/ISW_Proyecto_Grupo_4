import { startCase } from 'lodash';
import { format as formatRut } from 'rut.js';
import { format as formatTempo } from "@formkit/tempo";

export function formatUserData(user) {
    const rolValue = user.rol;
    return {
        ...user,
        nombreCompleto: startCase(user.nombreCompleto),
        rol: rolValue,
        rolDisplay: rolValue === 'usuario' ? 'Voluntario' : startCase(rolValue),
        rut: formatRut(user.rut),
        telefono: user.telefono || '',
        createdAt: formatTempo(user.createdAt, "DD-MM-YYYY")
    };
}

export function convertirMinusculas(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].toLowerCase();
        }
    }
    return obj;
}

export function formatPostUpdate(user) {
    const rolValue = user.rol;
    return {
        nombreCompleto: startCase(user.nombreCompleto),
        rol: rolValue,
        rolDisplay: rolValue === 'usuario' ? 'Voluntario' : startCase(rolValue),
        rut: formatRut(user.rut),
        email: user.email,
        telefono: user.telefono || '',
        createdAt: formatTempo(user.createdAt, "DD-MM-YYYY")
    };
}