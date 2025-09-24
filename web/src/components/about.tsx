import {AboutPageDTO} from "@/types/page-types";


export async function About(props : AboutPageDTO,
                            className?: string) {
    return (
        <main>
            <h1>{props.header}</h1>
            {/* Strapi Image*/}
            {/* Article sections*/}
        </main>
    )


}