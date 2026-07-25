import { defineCollection } from 'astro:content';
// Astro 7 khuyến nghị `astro/zod` (bản re-export Zod 4); `z` từ 'astro:content' đã deprecate.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.md',
    base: './src/content/posts',
    // Tên file có tiền tố YYYY-MM- để dễ sắp xếp trong VS Code, nhưng URL thì không
    // cần nó: /posts/vi-sao-nen-chon-playwright... gọn hơn và khớp slug bài cũ.
    generateId: ({ entry }) =>
      entry
        .replace(/\.md$/, '')
        .replace(/^.*\//, '')
        .replace(/^\d{4}-\d{2}-/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    /** Slug gốc trên WordPress — giữ để đối chiếu khi migrate, không dùng để routing. */
    wpSlug: z.string().optional(),
    wpId: z.number().optional(),
  }),
});

export const collections = { posts };
