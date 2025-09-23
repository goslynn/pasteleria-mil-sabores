import Image from "next/image"
import {cn} from "@/lib/utils";

export type AboutSection = {
    title: string,
    description: string,
    media? : { url: string },
    variant: "imageLeft" | "imageRight" | "centeredText"
}

export function AboutSectionBlock( section : AboutSection, className?: string ) {
    const imageUrl = section.media?.url ?? null

    switch (section.variant) {
        case "imageLeft":
            return (
                <div className={cn("flex flex-col md:flex-row items-center gap-6 py-10", className)}>
                    {imageUrl && (
                        <div className="w-full md:w-1/2">
                            <Image src={imageUrl} alt={section.title} width={600} height={400} className="rounded-2xl object-cover" />
                        </div>
                    )}
                    <div className="w-full md:w-1/2 space-y-4">
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.description }} />
                    </div>
                </div>
            )

        case "imageRight":
            return (
                <div className={cn("flex flex-col md:flex-row-reverse items-center gap-6 py-10", className)}>
                    {imageUrl && (
                        <div className="w-full md:w-1/2">
                            <Image src={imageUrl} alt={section.title} width={600} height={400} className="rounded-2xl object-cover" />
                        </div>
                    )}
                    <div className="w-full md:w-1/2 space-y-4">
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.description }} />
                    </div>
                </div>
            )

        case "centeredText":
        default:
            return (
                <div className={cn("py-10 text-center max-w-3xl mx-auto space-y-4")}>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                    <div className="prose max-w-none text-justify" dangerouslySetInnerHTML={{ __html: section.description }} />
                </div>
            )
    }
}
