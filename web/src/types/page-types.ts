import {StrapiBase, StrapiMedia} from "@/types/strapi/common";
import {SocialLink} from "@/types/general";
import {FooterSection} from "@/components/ui/footer";
import {BlocksContent} from "@strapi/blocks-react-renderer";
import {ArticleSectionVariant} from "@/components/ui/article-renderer";

type Image = StrapiMedia | string;

export type FooterDTO = {
    socials: SocialLink[];
    footer_sections: FooterSection[];
}

export interface BrandDTO extends StrapiBase {
    name?: string;
    logo?: StrapiMedia
}

export interface ArticleSection {
    title: string;
    /** Rich text (Blocks) de Strapi */
    paragraph: BlocksContent;
    /** Variante de presentación (imageLeft, imageRight, centered) */
    variant: ArticleSectionVariant;
    /** Imagen (en centered normalmente no viene desde Strapi) */
    image?: Image;
}

export interface ArticleSectionDTO {
    title: string;
    /** Rich text (Blocks) de Strapi */
    paragraph: BlocksContent;
    /** Variante de presentación (imageLeft, imageRight, centered) */
    variant: ArticleSectionVariant;
    /** Imagen (en centered normalmente no viene desde Strapi) */
    image?: Image;
    active?: boolean;
    slug?: string;
}

export interface AboutPageDTO {
    header: string;
    background: Image
    about_sections: ArticleSection[];
}