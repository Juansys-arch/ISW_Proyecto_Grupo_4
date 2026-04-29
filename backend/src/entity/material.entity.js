"use strict";
import { EntitySchema } from "typeorm";

const MaterialSchema = new EntitySchema({
    name:"Material",
    tableName:"material",
    columns:{
        id:{
            type:"int",
            primary:true,
            generated:true,
        },
        nombre:{
            type:"varchar",
            length:255,
            nullable:false,
        },
        descripcion:{
            type:"text",
            nullable:true,
        },
        unidadMedida:{
            type:"varchar",
            length:50,
            nullable:false,
        },
        stockActual:{
            type:"int",
            default:0,
            nullable:false,
        },
        stockMinimo:{
            type:"int",
            default:0,
            nullable:false,
        },
        createdAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            nullable: false,
        },
        updatedAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            nullable: false,
        },
    },

});
export default MaterialSchema;