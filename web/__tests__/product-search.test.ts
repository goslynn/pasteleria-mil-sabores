import { searchProductsByCategory } from "@/app/services/product-search.service"
import { ValidationError, NotFoundError } from "@/lib/exceptions"


jest.mock("@/lib/fetching", () => ({
    strapi: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    },
}))
import { strapi } from "@/lib/fetching"
import {FindProductsParams, ProductQueryResponse} from "@/types/server";

describe("searchProductsByCategory", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("debe lanzar ValidationError si falta el parámetro category", async () => {
        const params: FindProductsParams = { page: 1, pageSize: 10 }
        await expect(searchProductsByCategory(params)).rejects.toThrow(ValidationError)
    })

    it("debe retornar productos correctamente cuando Strapi responde datos", async () => {
        const mockResponse: ProductQueryResponse = {
                data: [
                    {
                        code: "TC001",
                        name: "Torta Cuadrada de Chocolate",
                        price: 45000,
                    },
                ],
                meta: {
                    pagination: { page: 1, pageSize: 10, pageCount: 1, total: 1 },
                },
            }

        ;(strapi.get as jest.Mock).mockResolvedValueOnce(mockResponse)

        const params: FindProductsParams = {
            page: 1,
            pageSize: 10,
            category: "tortas-cuadradas",
        }

        const result = await searchProductsByCategory(params)

        expect(strapi.get).toHaveBeenCalledTimes(1)
        expect(result).toEqual(mockResponse)
    })

    it("debe lanzar NotFoundError si Strapi retorna una lista vacía", async () => {
        const mockEmptyResponse: ProductQueryResponse = {
                data: [],
                meta: { pagination: { total: 0 } },
            }
        ;(strapi.get as jest.Mock).mockResolvedValueOnce(mockEmptyResponse)

        const params: FindProductsParams = {
            page: 1,
            pageSize: 10,
            category: "categoria-inexistente",
        }

        await expect(searchProductsByCategory(params)).rejects.toThrow(NotFoundError)
    })
})
