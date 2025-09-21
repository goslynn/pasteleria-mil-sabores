'use server';

import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import {SimpleState} from "@/types/state";

const SignupSchema = z.object({
  nombre: z.string().min(2),
  email: z.email(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "La contraseña debe tener al menos un símbolo"),
  confirmPassword: z.string(),
  fechaNacimiento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
}) .refine(
    (data) => data.password === data.confirmPassword,
    { message: "Las contraseñas no coinciden", path: ["confirmPassword"],
});


export async function signup(_prev : SimpleState, formData: FormData) : Promise<SimpleState> {
  const data = {
    nombre: String(formData.get("nombre") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirm-password") ?? ""),
    fechaNacimiento: String(formData.get("fecha_nacimiento") ?? ""),
  };

  const parsed = SignupSchema.safeParse(data);
    if (!parsed.success) {
        return { ok: false,
            error: parsed.error.issues.map((e) => e.message).join(", "),
        };
    }

  const existing = await prisma.usuario.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    return { ok: false, error: "Este email ya está registrado." };
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.usuario.create({
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
