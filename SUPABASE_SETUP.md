# Supabase 설정 가이드

이 문서는 메모 앱의 Supabase 데이터베이스 설정 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인합니다.
2. "New project" 버튼을 클릭하여 새 프로젝트를 생성합니다.
3. 프로젝트 이름, 데이터베이스 패스워드, 리전을 설정합니다.
4. 프로젝트 생성이 완료될 때까지 기다립니다 (약 2-3분).

## 2. 환경변수 설정

1. 프로젝트 루트에 `.env.local` 파일을 생성합니다:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Supabase 대시보드에서 필요한 값들을 가져옵니다:
   - **Settings > API**로 이동
   - `Project URL`을 복사하여 `NEXT_PUBLIC_SUPABASE_URL`에 입력
   - `anon public` 키를 복사하여 `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 입력

## 3. 데이터베이스 스키마 생성

Supabase 대시보드의 **SQL Editor**에서 다음 SQL을 실행합니다:

```sql
-- memos 테이블 생성
CREATE TABLE IF NOT EXISTS public.memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON public.memos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memos_category ON public.memos(category);
CREATE INDEX IF NOT EXISTS idx_memos_title ON public.memos USING gin(to_tsvector('korean', title));
CREATE INDEX IF NOT EXISTS idx_memos_content ON public.memos USING gin(to_tsvector('korean', content));
CREATE INDEX IF NOT EXISTS idx_memos_tags ON public.memos USING gin(tags);

-- Row Level Security (RLS) 활성화
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자를 위한 정책 생성
CREATE POLICY "Enable all operations for authenticated users" ON public.memos
    FOR ALL USING (auth.role() = 'authenticated');

-- 익명 사용자 읽기 권한 (선택사항)
CREATE POLICY "Enable read access for anonymous users" ON public.memos
    FOR SELECT USING (true);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_memos_updated_at
    BEFORE UPDATE ON public.memos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

또는 프로젝트의 `supabase/migrations/001_create_memos_table.sql` 파일의 내용을 복사하여 실행할 수도 있습니다.

## 4. 애플리케이션 실행

1. 의존성을 설치합니다:
```bash
npm install
```

2. 개발 서버를 실행합니다:
```bash
npm run dev
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인합니다.

## 5. 데이터베이스 확인

Supabase 대시보드의 **Table Editor**에서 `memos` 테이블이 생성되었는지 확인할 수 있습니다. 애플리케이션 첫 실행 시 샘플 데이터가 자동으로 추가됩니다.

## 6. 추가 설정 (선택사항)

### 사용자 인증 설정
현재는 RLS가 활성화되어 있지만 모든 사용자가 모든 메모에 접근할 수 있습니다. 사용자별 메모 격리를 원한다면:

1. `memos` 테이블에 `user_id UUID REFERENCES auth.users(id)` 컬럼을 추가
2. RLS 정책을 수정하여 사용자가 자신의 메모만 접근할 수 있도록 변경

### 백업 설정
정기적으로 데이터베이스를 백업하는 것을 권장합니다. Supabase Pro 플랜에서는 자동 백업을 제공합니다.

## 문제 해결

### 연결 오류
- 환경변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 정상적으로 생성되고 실행 중인지 확인
- 브라우저 개발자 도구에서 네트워크 오류 확인

### 권한 오류
- RLS 정책이 올바르게 설정되었는지 확인
- API 키가 올바른지 확인 (anon key 사용)

### 성능 문제
- 대량 데이터의 경우 적절한 인덱스가 생성되었는지 확인
- 쿼리 최적화 필요 시 Supabase 대시보드의 Performance 탭 활용