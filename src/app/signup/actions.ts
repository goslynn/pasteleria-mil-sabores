"use server";

import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import {SimpleState} from "@/lib/state";

const SignupSchema = z.object({
  nombre: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  fecha_nacimiento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
});

export async function signup(_prev : SimpleState, formData: FormData) : Promise<SimpleState> {
  const data = {
    nombre: String(formData.get("nombre") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    fechaNacimiento: String(formData.get("fecha_nacimiento") ?? ""),
  };

  const parsed = SignupSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  const existing = await prisma.usuario.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    return { ok: false, error: "Este email ya está registrado." };
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.Usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      password: passwordHash,
      fechaNacimiento: new Date(data.fechaNacimiento),
    },
    select: { idUsuario: true },
  });

  await createSession(user.idUsuario);
  redirect("/");
}
