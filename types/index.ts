// ============================================================
// types/index.ts — centralne typy projektu
// ============================================================

export type Category = 'content-writing' | 'ux-strategies'
export type ArticleStatus = 'draft' | 'published'

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: TiptapContent | null
  category: Category
  cover_image_url: string | null
  status: ArticleStatus
  published_at: string | null
  created_at: string
  updated_at: string
  // Pole wirtualne — pochodzi z JOIN, nie z tabeli articles
  tags?: Tag[]
}

// Wiersz tabeli articles bez pola tags (relacja, nie kolumna)
export type ArticleRow = Omit<Article, 'tags'>

// Tiptap JSON content
export interface TiptapContent {
  type: 'doc'
  content: TiptapNode[]
}

export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface Comment {
  id: string
  article_id: string
  author_name: string
  author_email: string
  body: string
  approved: boolean
  created_at: string
}

export interface Contact {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

// Supabase DB types (uproszczone)
export type Database = {
  public: {
    Tables: {
      articles: {
        Row: ArticleRow
        Insert: Omit<ArticleRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ArticleRow, 'id' | 'created_at'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id'>
        Update: Partial<Omit<Tag, 'id'>>
      }
      article_tags: {
        Row: { article_id: string; tag_id: string }
        Insert: { article_id: string; tag_id: string }
        Update: never
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at' | 'approved'>
        Update: Partial<Pick<Comment, 'approved'>>
      }
      contacts: {
        Row: Contact
        Insert: Omit<Contact, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
