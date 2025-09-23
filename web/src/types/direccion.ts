import {UsuarioDTO} from "@/types/user";

export type DireccionForm = {
    idDireccion?: number;
    calle: string;
    numero: string;
    departamento?: string;
    region: number;
    comuna: number;
};

export type ConfigPageProps = {
    usuario: UsuarioDTO;
    direcciones: DireccionForm[];
    regiones: { idRegion: number; nombre: string }[];
    comunasPorRegion: Record<number, { idComuna: number; nombre: string }[]>;
};