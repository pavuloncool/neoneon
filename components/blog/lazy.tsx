'use client'

// components/blog/lazy.tsx
// Komponenty klienckie trasy [...segments] ładowane osobnym plikiem JS — tylko na stronach, które je
// renderują (artykuł, strona z formularzem, treść z embedami). SSR bez zmian (HTML identyczny), ale
// strona kategorii, obsługiwana przez tę samą trasę, nie pobiera kodu formularzy i embedów.

import dynamic from 'next/dynamic'

export const CommentForm = dynamic(() => import('./CommentForm').then((m) => m.CommentForm))
export const ContactForm = dynamic(() => import('./ContactForm').then((m) => m.ContactForm))
export const SocialEmbed = dynamic(() => import('./SocialEmbed').then((m) => m.SocialEmbed))
export const EmbedActivator = dynamic(() => import('./EmbedActivator').then((m) => m.EmbedActivator))
export const ArticleScroll = dynamic(() => import('./ArticleScroll').then((m) => m.ArticleScroll))
