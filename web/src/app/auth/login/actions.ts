'use server';

import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import {SimpleState} from "@/types/general";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function login(_prev: SimpleState, formData: FormData) : Promise<SimpleState> {
  const data = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Credenciales inválidas." };
  }

  const user = await prisma.usuario.findUnique({
    where: { email: data.email },
    select: { idUsuario: true, password: true },
  });

  if (!user) return { ok: false, error: "Email o password incorrectos." };

  const ok = await verifyPassword(data.password, user.password);
  if (!ok) return { ok: false, error: "Email o password incorrectos." };

  await createSession(user.idUsuario);
  redirect("/");
}
