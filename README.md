# 메모 앱 (Memo App)

Next.js 14와 Supabase를 사용한 메모 관리 애플리케이션입니다.

## 기능

- ✅ 메모 생성, 읽기, 수정, 삭제 (CRUD)
- ✅ 카테고리별 메모 분류
- ✅ 태그 시스템
- ✅ 검색 기능
- ✅ Markdown 에디터 지원
- ✅ Supabase 데이터베이스 연동
- ✅ 실시간 데이터 동기화

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS
- **Editor**: @uiw/react-md-editor
- **Testing**: Playwright

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Supabase 설정

#### 3.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 로그인하여 새 프로젝트를 생성합니다.
2. 프로젝트 URL과 anon key를 `.env.local`에 추가합니다.

#### 3.2 데이터베이스 스키마 생성
Supabase 대시보드의 SQL Editor에서 다음 SQL을 실행하거나, `supabase/migrations/001_create_memos_table.sql` 파일의 내용을 실행하세요:

```sql
-- Create memos table
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

-- Enable Row Level Security
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all operations for authenticated users" ON public.memos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for anonymous users" ON public.memos
    FOR SELECT USING (true);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memos_updated_at
    BEFORE UPDATE ON public.memos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── MemoForm.tsx       # 메모 생성/수정 폼
│   ├── MemoItem.tsx       # 개별 메모 아이템
│   ├── MemoList.tsx       # 메모 목록
│   └── MemoViewer.tsx     # 메모 뷰어
├── hooks/                 # 커스텀 훅
│   └── useMemos.ts        # 메모 관리 훅
├── lib/                   # 라이브러리 설정
│   └── supabase.ts        # Supabase 클라이언트
├── types/                 # TypeScript 타입 정의
│   └── memo.ts            # 메모 관련 타입
└── utils/                 # 유틸리티 함수
    ├── localStorage.ts    # 데이터베이스 유틸리티 (구 localStorage 유틸리티)
    └── seedData.ts        # 샘플 데이터
```

## 데이터베이스 스키마

### memos 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID | 기본 키 (자동 생성) |
| `title` | TEXT | 메모 제목 |
| `content` | TEXT | 메모 내용 (Markdown 지원) |
| `category` | TEXT | 카테고리 (personal, work, study, idea, other) |
| `tags` | TEXT[] | 태그 배열 |
| `created_at` | TIMESTAMPTZ | 생성 시간 (자동 설정) |
| `updated_at` | TIMESTAMPTZ | 수정 시간 (자동 업데이트) |

## 주요 기능

### 메모 관리
- 메모 생성, 수정, 삭제
- Markdown 에디터를 통한 풍부한 텍스트 작성
- 실시간 미리보기

### 분류 및 검색
- 5개 카테고리로 메모 분류 (개인, 업무, 학습, 아이디어, 기타)
- 태그 시스템으로 메모 분류
- 제목, 내용, 태그 기반 실시간 검색

### 사용자 인터페이스
- 반응형 디자인 (모바일, 태블릿, 데스크톱 지원)
- 다크/라이트 테마 지원
- 직관적인 사용자 경험

## 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 실행
- `npm run test` - Playwright 테스트 실행

## 마이그레이션 정보

이 프로젝트는 로컬 스토리지 기반에서 Supabase 데이터베이스 기반으로 마이그레이션되었습니다:

- ✅ 기존 인터페이스 타입 그대로 유지
- ✅ PostgreSQL 테이블 스키마 생성
- ✅ Row Level Security (RLS) 적용
- ✅ 성능 최적화를 위한 인덱스 생성
- ✅ 자동 timestamp 업데이트 트리거
- ✅ 한국어 전문 검색 지원

## 라이선스

MIT License