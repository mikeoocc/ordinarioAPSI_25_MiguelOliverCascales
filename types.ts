import type { OptionalId } from "mongodb";

export type Restaurant = OptionalId<{
    nombre: string,
    direccion: string,
    ciudad: string,
    telefono: string,
    pais: string,
    timezone: string
}>