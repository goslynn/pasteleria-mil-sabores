import { TextEncoder, TextDecoder } from "util"
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder

process.env.AUTH_SECRET = "test_secret_123456789"
process.env.SESSION_COOKIE_NAME = "jwt_token"
