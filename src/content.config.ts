import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    audience: z.string().default('Усі'),
    color: z.enum(['violet', 'coral', 'gold']).default('violet'),
    description: z.string(),
    formUrl: z.string().optional(),
  }),
});

const guests = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guests' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: z.string().optional(),
    sort: z.number().default(0),
    upcoming: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    category: z.string().default('Корисне'),
    excerpt: z.string(),
    icon: z.string().default('📄'),
    cover: z.enum(['c-c', 'c-v', 'c-y']).default('c-c'),
    sort: z.number().default(0),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    quote: z.string(),
    author: z.string(),
    sort: z.number().default(0),
  }),
});

const vacancies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/vacancies' }),
  schema: z.object({
    title: z.string(),
    meta: z.string().default('Ворзель · повна зайнятість'),
    url: z.string().optional(),
    sort: z.number().default(0),
  }),
});

export const collections = { events, guests, articles, stories, vacancies };
