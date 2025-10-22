import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { login } from "@/app/auth/login/actions"

// --- mocks ---
jest.mock("@/lib/db", () => ({
    prisma: {
        usuario: {
            findUnique: jest.fn(),
        },
    },
}))


jest.mock("@/lib/auth", () => {
    const actual = jest.requireActual("@/lib/auth")
    return {
        ...actual,
        verifyPassword: jest.fn(),
    }
})

jest.mock("jose", () => ({
    SignJWT: jest.fn().mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue("fake.jwt.token"),
    })),
}))

jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}))

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}))

describe("login (server action)", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const makeFormData = (email: string, password: string): FormData => {
        const fd = new FormData()
        fd.set("email", email)
        fd.set("password", password)
        return fd
    }

    it("retorna error si las credenciales no cumplen el schema", async () => {
        const fd = makeFormData("no-es-email", "123")
        const result = await login({ ok: false }, fd)
        expect(result).toEqual({ ok: false, error: "Credenciales inválidas." })
    })

    it("retorna error si el usuario no existe", async () => {
        ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValueOnce(null)
        const fd = makeFormData("test@example.com", "password123")

        const result = await login({ ok: false }, fd)
        expect(result).toEqual({ ok: false, error: "Email o password incorrectos." })
    })

    it("retorna error si la contraseña es incorrecta", async () => {
        ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValueOnce({
            idUsuario: 1,
            password: "hashfake",
        })
        ;(verifyPassword as jest.Mock).mockResolvedValueOnce(false)

        const fd = makeFormData("test@example.com", "wrongpass123")

        const result = await login({ ok: false }, fd)
        expect(result).toEqual({ ok: false, error: "Email o password incorrectos." })
    })

    it("crea sesión, guarda el JWT en cookies y redirige al home", async () => {
        ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValueOnce({
            idUsuario: 1,
            password: "hashcorrecto",
        })
        ;(verifyPassword as jest.Mock).mockResolvedValueOnce(true)

        const mockSet = jest.fn()
        ;(cookies as jest.Mock).mockReturnValue({ set: mockSet })

        const fd = makeFormData("test@example.com", "password123")

        await login({ ok: false }, fd)

        expect(redirect).toHaveBeenCalledWith("/")
        expect(mockSet).toHaveBeenCalledTimes(1)

        const [cookieName, token, opts] = mockSet.mock.calls[0]
        expect(typeof token).toBe("string")
        expect(token).toBe("fake.jwt.token")
        expect(cookieName).toBe("jwt_token")
        expect(opts).toBeDefined()
    })
})
