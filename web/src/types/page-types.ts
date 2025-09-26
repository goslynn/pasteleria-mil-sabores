import {StrapiBase, StrapiMedia} from "@/types/strapi/common";
import {SocialLink} from "@/types/general";
import {FooterSection} from "@/components/ui/footer";
import {BlocksContent} from "@strapi/blocks-react-renderer";
import {ArticleVariant} from "@/components/ui/article-renderer";
import {StrapiImageSource} from "@/components/ui/strapi-image";

export type FooterDTO = {
    socials: SocialLink[];
    footer_sections: FooterSection[];
}

export interface BrandDTO extends StrapiBase {
    name?: string;
    logo?: StrapiMedia
    icon?: StrapiMedia
}

export interface ArticleSection {
    title: string;
    /** Rich text (Blocks) de Strapi */
    paragraph: BlocksContent;
    /** Variante de presentación (imageLeft, imageRight, centered) */
    variant: ArticleVariant | string;
    /** Imagen (en centered normalmente no viene desde Strapi) */
    image?: StrapiImageSource;
    active?: boolean;
    slug?: string;
}

export interface AboutPageDTO {
    header: string;
    background: StrapiImageSource
    about_sections: ArticleSection[];
}