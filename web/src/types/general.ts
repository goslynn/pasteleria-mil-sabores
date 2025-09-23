export interface Link {
    label: string;
    link: string;
    external?: boolean;
}

export type SocialKind =
    | "facebook"
    | "instagram"
    | "x"
    | "tiktok"
    | "youtube"
    | "linkedin"
    | "github"
    | "whatsapp";

export type SocialLink = Link & {
    kind: SocialKind;
};

export type SimpleState = {ok: boolean, error?: string;};