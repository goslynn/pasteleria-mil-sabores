'use client';

import * as React from 'react';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';

export default function StrapiBlocks({
                                         content,
                                     }: {
    content: BlocksContent | null | undefined;
}) {
    if (!content || content.length === 0) {
        return <p>No hay nada aquí :/</p>;
    }

    return (
        <article
            className="prose prose-neutral dark:prose-invert max-w-none article-scope"
            itemProp="articleBody"
        >
            <BlocksRenderer
                content={content}
                blocks={{
                    // Headings (Strapi envía level: 1..6)
                    heading: ({ children, level }) => {
                        const L = Math.min(Math.max(level, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
                        const Tag = `h${L}` as const;

                        // tamaños + sangría visual por nivel (desde h3)
                        const levelClasses: Record<number, string> = {
                            1: 'text-3xl md:text-4xl font-bold tracking-tight',
                            2: 'text-2xl md:text-3xl font-bold tracking-tight',
                            3: 'text-xl md:text-2xl font-semibold ml-4',
                            4: 'text-lg md:text-xl font-semibold ml-6',
                            5: 'text-base md:text-lg font-semibold ml-8',
                            6: 'text-sm md:text-base font-semibold ml-10',
                        };

                        return <Tag className={`scroll-m-20 ${levelClasses[L]}`}>{children}</Tag>;
                    },

                    // Párrafos
                    paragraph: ({ children }) => <p>{children}</p>,

                    // Listas (Strapi envía format: 'unordered' | 'ordered')
                    list: ({ children, format }) =>
                        format === 'ordered' ? (
                            <ol className="list-decimal pl-6">{children}</ol>
                        ) : (
                            <ul className="list-disc pl-6">{children}</ul>
                        ),

                    'list-item': ({ children }) => <li>{children}</li>,

                    // Enlace (Strapi lo expone como block 'link')
                    link: ({ children, url }) => (
                        <a href={url} className="underline underline-offset-4">
                            {children}
                        </a>
                    ),
                }}
                modifiers={{
                    bold: ({ children }) => <strong>{children}</strong>,
                    italic: ({ children }) => <em>{children}</em>,
                    underline: ({ children }) => <u>{children}</u>,
                    strikethrough: ({ children }) => <s>{children}</s>,
                    code: ({ children }) => (
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{children}</code>
                    ),
                }}
            />

            {/* Regla local: sangrar todo lo que venga después de un H3 (p, ul, ol). */}
            <style>{`
        .article-scope h3,
        .article-scope h3 ~ p,
        .article-scope h3 ~ ul,
        .article-scope h3 ~ ol {
          margin-left: 1rem; /* equivalente a ml-4 */
        }
      `}</style>
        </article>
    );
}
