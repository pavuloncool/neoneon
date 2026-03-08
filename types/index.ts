export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Comment {
  id: string
  article_id: string
  author_name: string
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

export interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  content: any
  category: 'content-writing' | 'ux-strategies'
  cover_image_url?: string | null
  status: 'draft' | 'published'
  published_at?: string | null
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export type ArticleRow = Omit<Article, 'tags'>

export interface TiptapNode {
  type: string
  attrs?: Record<string, any>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

export interface TiptapMark {
  type: string
  attrs?: Record<string, any>
}

export interface TiptapContent {
  type: 'doc'
  content: TiptapNode[]
}

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: ArticleRow
        Insert: Omit<ArticleRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ArticleRow, 'id' | 'created_at' | 'updated_at'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id'>
        Update: Partial<Omit<Tag, 'id'>>
      }
      article_tags: {
        Row: { article_id: string; tag_id: string }
        Insert: { article_id: string; tag_id: string }
        Update: { article_id?: string; tag_id?: string }
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at'>
        Update: Partial<Omit<Comment, 'id' | 'created_at'>>
      }
      contacts: {
        Row: Contact
        Insert: Omit<Contact, 'id' | 'created_at'>
        Update: Partial<Omit<Contact, 'id' | 'created_at'>>
      }
    }
  }
}

export type Category = 'content-writing' | 'ux-strategies'
export type ArticleStatus = 'draft' | 'published'
