import {StrapiBase, StrapiMedia} from "@/types/strapi/common";
import {SocialLink} from "@/types/general";
import {FooterSection} from "@/components/ui/footer";

export type FooterDTO = {
    socials: SocialLink[];
    footer_sections: FooterSection[];
}

export interface BrandDTO extends StrapiBase {
    name?: string;
    logo?: StrapiMedia
}