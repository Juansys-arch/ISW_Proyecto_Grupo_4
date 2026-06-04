"use strict";
import { EntitySchema } from "typeorm";

const MovimientoInventarioSchema = new EntitySchema({
    name:"MovimientoInventario",
    tableName:"movimiento_inventario",
    columns:{
        id:{
            type:"int",
            primary:true,
            generated:true,
        },
        materialId:{
            type:"int",
            nullable:false,
        },
        tipo:{
            type:"varchar",
            length:10,
            nullable:false,
        },
        cantidad:{
            type:"int",
            nullable:false,
        },
        fecha:{
            type: "timestamp with time zone",
            nullable: false,
            default: () => "CURRENT_TIMESTAMP",
        },
        responsableId:{
            type:"int",
            nullable:false,
        },
        observacion:{
            type:"text",
            nullable:true,
        },
         createdAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            nullable: false,
        },


    },
    relations:{
        material:{
            type:"many-to-one",
            target:"Material",
            joinColumn:{name:"materialId"},
            eager:true,
        },
        responsable:{
            type:"many-to-one",
            target:"User",
            joinColumn:{name:"responsableId"},
            eager:true,
        },
    },

});
export default MovimientoInventarioSchema;