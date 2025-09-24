import {strapi} from "@/lib/fetching";
import {ArticleSection} from "@/types/page-types";
import {ArticleRenderer} from "@/components/ui/article-renderer";
import {StrapiCollection} from "@/types/strapi/common";

export default async function TermsPage() {
    const resp = await strapi.get<StrapiCollection<ArticleSection>>(
        "/api/article-sections",
        {
            query: {
                "filters[slug][$eq]": "terms",
            },
        }
    );

    const item = Array.isArray(resp?.data) ? resp.data[0] : undefined;

    return (
        <main className="max-w-4xl mx-auto p-4 m-12 article-scope">
            <ArticleRenderer headingLevel={1} content={item}/>
        </main>
    );
}