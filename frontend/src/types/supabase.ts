export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      opportunities: {
        Row: {
          id: string
          user_id: string
          title: string
          category: 'carro' | 'imovel' | 'empresa' | 'item_premium'
          value: number
          description: string | null
          photos: string[] | null
          location: string | null
          status: 'novo' | 'em_negociacao' | 'vendido'
          pipeline_stage: 'Novo' | 'Interessado' | 'Proposta enviada' | 'Negociação' | 'Finalizado'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          category: 'carro' | 'imovel' | 'empresa' | 'item_premium'
          value: number
          description?: string | null
          photos?: string[] | null
          location?: string | null
          status?: 'novo' | 'em_negociacao' | 'vendido'
          pipeline_stage?: 'Novo' | 'Interessado' | 'Proposta enviada' | 'Negociação' | 'Finalizado'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: 'carro' | 'imovel' | 'empresa' | 'item_premium'
          value?: number
          description?: string | null
          photos?: string[] | null
          location?: string | null
          status?: 'novo' | 'em_negociacao' | 'vendido'
          pipeline_stage?: 'Novo' | 'Interessado' | 'Proposta enviada' | 'Negociação' | 'Finalizado'
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          source: string | null
          interests: string | null
          status: 'novo' | 'quente' | 'morno' | 'frio'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          phone?: string | null
          source?: string | null
          interests?: string | null
          status?: 'novo' | 'quente' | 'morno' | 'frio'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          source?: string | null
          interests?: string | null
          status?: 'novo' | 'quente' | 'morno' | 'frio'
          created_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          contact_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          content?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          description: string | null
          price: number
          commission_percent: number | null
          category: string
          status: string
          tags: string[]
          stock: number
          images: string[]
          is_national: boolean | null
          location_info: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          description?: string | null
          price: number
          commission_percent?: number | null
          category: string
          status?: string
          tags?: string[]
          stock?: number
          images?: string[]
          is_national?: boolean | null
          location_info?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          description?: string | null
          price?: number
          commission_percent?: number | null
          category?: string
          status?: string
          tags?: string[]
          stock?: number
          images?: string[]
          is_national?: boolean | null
          location_info?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'user' | 'adm'
          bio: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'user' | 'adm'
          bio?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'user' | 'adm'
          bio?: string | null
          avatar_url?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
