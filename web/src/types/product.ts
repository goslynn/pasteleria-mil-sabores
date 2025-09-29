import {StrapiBase} from "@/types/strapi/common";
import {BlocksContent} from "@strapi/blocks-react-renderer"
import {StrapiImageSource} from "@/components/ui/strapi-image";

export interface Discount {
    type: "percentage" | "fixed"
    value: number
}

export interface ProductDTO {
    code: string;
    name: string;
    description?: BlocksContent
    price: number;
    images?: StrapiImageSource[];
    keyImage?: StrapiImageSource;
    category?: CategoryDTO;
}

export interface CategoryDTO extends StrapiBase  {
    name: string;
    slug: string;
    description?: string;
    image?: StrapiImageSource
}
