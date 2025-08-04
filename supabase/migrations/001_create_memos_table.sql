-- Create memos table based on existing Memo interface
CREATE TABLE IF NOT EXISTS public.memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON public.memos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_category ON public.memos(category);
CREATE INDEX IF NOT EXISTS idx_memos_title ON public.memos USING gin(to_tsvector('korean', title));
CREATE INDEX IF NOT EXISTS idx_memos_content ON public.memos USING gin(to_tsvector('korean', content));
CREATE INDEX IF NOT EXISTS idx_memos_tags ON public.memos USING gin(tags);

-- Enable Row Level Security (RLS)
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their own memos
-- For now, allow all authenticated users to read and write all memos
-- In production, you might want to add user_id column and restrict access
CREATE POLICY "Enable all operations for authenticated users" ON public.memos
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for anonymous users (if needed)
CREATE POLICY "Enable read access for anonymous users" ON public.memos
    FOR SELECT USING (true);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on memo updates
CREATE TRIGGER update_memos_updated_at
    BEFORE UPDATE ON public.memos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data (optional)
INSERT INTO public.memos (id, title, content, category, tags, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Supabase 마이그레이션 완료', '로컬 스토리지에서 Supabase 데이터베이스로 성공적으로 마이그레이션했습니다!', 'work', ARRAY['supabase', 'migration', 'database'], now(), now()),
    (gen_random_uuid(), 'Next.js 14 학습 계획', 'App Router, Server Components, Server Actions에 대해 심화 학습하기', 'study', ARRAY['nextjs', 'react', 'learning'], now() - interval '1 hour', now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;