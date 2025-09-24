import {AboutPageDTO} from "@/types/page-types";
import {strapi} from "@/lib/fetching";
import About from "@/components/about";

export default async function AboutPage() {
    const { data } = await strapi.get<{ data : AboutPageDTO }>("/api/about-page?populate=*");
    console.log(data);
    return (
        <About {...data}/>
    )
}