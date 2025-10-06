'use server'

import {redirect} from "next/navigation";

export async function searchAction(formData: FormData) {
    const q = (formData.get("q") ?? "").toString().trim();
    const page = "1";
    if (q.length > 0) {
        redirect(`/site/product?q=${encodeURIComponent(q)}&page=${page}`);
    }
}