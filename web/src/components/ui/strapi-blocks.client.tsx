'use client';

import * as React from 'react';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';

export default function StrapiBlocks({
                                         content,
                                         useDiv = false,
                                     }: {
    content: BlocksContent;
    useDiv?: boolean;
}) {
    return (
        <article className="prose prose-neutral dark:prose-invert max-w-none" itemProp="articleBody">
            <BlocksRenderer
                content={content}
                blocks={{
                    paragraph: ({children}) =>
                        useDiv ? <div className="mb-4 leading-7">{children}</div> :
                            <p className="leading-7">{children}</p>,
                }}
                modifiers={{
                    bold: ({children}) => <strong>{children}</strong>,
                    italic: ({children}) => <em>{children}</em>,
                    code: ({children}) => (
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{children}</code>
                    ),
                }}
            />
        </article>
    );
};
