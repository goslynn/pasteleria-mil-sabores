import {AboutPageDTO} from "@/types/page-types";
import {strapi} from "@/lib/fetching";
import About from "@/components/about";

export default async function AboutPage() {
    const { data } = await strapi.get<{ data : AboutPageDTO }>("/api/about-page", {
        query: {
            "fields[0]": "header",
            "populate[0]": "background",
            "populate[1]": "about_sections.image",
            "publicationState": "live"
        }
    });
    console.log("about: ", data);
    return (
        <About {...data} />
    )
}