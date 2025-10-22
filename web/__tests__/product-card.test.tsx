/**
 * @jest-environment jsdom
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { ProductCard, ProductCardProps } from "@/components/ui/product-card"


jest.mock("next/link", () => {
    interface MockLinkProps {
        href: string
        children: React.ReactNode
    }

    const MockLink: React.FC<MockLinkProps> = ({ href, children }) => <a href={href}>{children}</a>
    MockLink.displayName = "MockLink"
    return MockLink
})

jest.mock("@/components/ui/strapi-image", () => {
    interface MockStrapiImageProps {
        alt: string
    }

    // eslint-disable-next-line @next/next/no-img-element
    const MockStrapiImage: React.FC<MockStrapiImageProps> = ({ alt }) => <img alt={alt} />
    MockStrapiImage.displayName = "MockStrapiImage"
    return { StrapiImage: MockStrapiImage }
})

jest.mock("@/components/cart-button", () => {
    interface MockCartButtonProps {
        label: string
    }

    const MockCartButton: React.FC<MockCartButtonProps> = ({ label }) => <button>{label}</button>
    MockCartButton.displayName = "MockCartButton"
    return { CartButton: MockCartButton }
})

describe("ProductCard", () => {
    const mockBaseProps: ProductCardProps = {
        id: "TC001",
        name: "Torta de Chocolate",
        price: 45000,
        category: "Tortas Cuadradas",
        imageSrc: "my/fake/image.webp",
        href: "/site/product/tc001",
    }

    it("renderiza nombre, precio y categoría correctamente", () => {

        render(<ProductCard {...mockBaseProps} />)
        // validando que todos los datos que creamos esten renderizados.
        expect(screen.getByText("Torta de Chocolate")).toBeInTheDocument()
        expect(screen.getByText("$45.000")).toBeInTheDocument()
        expect(screen.getByText("Tortas Cuadradas")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeInTheDocument()
    })

    it("muestra el descuento cuando existe", () => {
        const discountProps: ProductCardProps = {
            ...mockBaseProps,
            discount: { type: "percentage", value: 10 },
        }

        render(<ProductCard {...discountProps} />)

        //validando que cuando se envie descuento este sea renderizado y con el calculo bien hecho
        expect(screen.getByText(/-10%/)).toBeInTheDocument()
        expect(screen.getByText("$45.000")).toBeInTheDocument()
        expect(screen.getByText("$40.500")).toBeInTheDocument()
    })

    it("no muestra badge de descuento si no hay descuento", () => {
        //validando que si no enviamos descuento no se renderiza nada.
        render(<ProductCard {...mockBaseProps} />)
        expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    })
})
