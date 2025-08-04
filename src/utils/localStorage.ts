import { Memo } from '@/types/memo'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export const databaseUtils = {
  // 모든 메모 가져오기
  getMemos: async (): Promise<Memo[]> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading memos from database:', error)
        return []
      }

      return data.map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags,
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error loading memos from database:', error)
      return []
    }
  },

  // 메모 추가
  addMemo: async (memo: Memo): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .insert({
          id: memo.id,
          title: memo.title,
          content: memo.content,
          category: memo.category,
          tags: memo.tags,
          created_at: memo.createdAt,
          updated_at: memo.updatedAt,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding memo to database:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error adding memo to database:', error)
      return null
    }
  },

  // 메모 업데이트
  updateMemo: async (updatedMemo: Memo): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .update({
          title: updatedMemo.title,
          content: updatedMemo.content,
          category: updatedMemo.category,
          tags: updatedMemo.tags,
          updated_at: updatedMemo.updatedAt,
        })
        .eq('id', updatedMemo.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating memo in database:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error updating memo in database:', error)
      return null
    }
  },

  // 메모 삭제
  deleteMemo: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting memo from database:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting memo from database:', error)
      return false
    }
  },

  // 메모 검색
  searchMemos: async (query: string): Promise<Memo[]> => {
    try {
      const lowercaseQuery = query.toLowerCase()
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .or(`title.ilike.%${lowercaseQuery}%,content.ilike.%${lowercaseQuery}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching memos in database:', error)
        return []
      }

      return data.map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags,
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error searching memos in database:', error)
      return []
    }
  },

  // 카테고리별 메모 필터링
  getMemosByCategory: async (category: string): Promise<Memo[]> => {
    try {
      const query = supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: false })

      if (category !== 'all') {
        query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error filtering memos by category:', error)
        return []
      }

      return data.map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags,
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error filtering memos by category:', error)
      return []
    }
  },

  // 특정 메모 가져오기
  getMemoById: async (id: string): Promise<Memo | null> => {
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error getting memo by id:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error getting memo by id:', error)
      return null
    }
  },

  // 모든 메모 삭제
  clearMemos: async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .neq('id', '')

      if (error) {
        console.error('Error clearing all memos:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error clearing all memos:', error)
      return false
    }
  },

  // 샘플 데이터 삽입 (서버 사이드에서 사용)
  seedSampleData: async (): Promise<void> => {
    try {
      // 기존 메모가 있는지 확인
      const { data: existingMemos } = await supabase
        .from('memos')
        .select('id')
        .limit(1)

      if (existingMemos && existingMemos.length > 0) {
        return // 이미 데이터가 있으면 시딩하지 않음
      }

      // 샘플 데이터 생성
      const sampleMemos = [
        {
          id: uuidv4(),
          title: 'Supabase 마이그레이션 완료',
          content: '로컬 스토리지에서 Supabase 데이터베이스로 성공적으로 마이그레이션했습니다!',
          category: 'work',
          tags: ['supabase', 'migration', 'database'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          title: 'Next.js 14 학습 계획',
          content: 'App Router, Server Components, Server Actions에 대해 심화 학습하기',
          category: 'study',
          tags: ['nextjs', 'react', 'learning'],
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ]

      const { error } = await supabase
        .from('memos')
        .insert(sampleMemos)

      if (error) {
        console.error('Error seeding sample data:', error)
      }
    } catch (error) {
      console.error('Error seeding sample data:', error)
    }
  },
}
