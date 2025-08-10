# 소프트웨어 마에스트로 프로젝트

소프트웨어 마에스트로 프로그램의 모든 프로젝트를 한눈에 탐색할 수 있는 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [환경 변수 설정](#환경-변수-설정)
- [라이센스](#라이센스)
- [연락처](#연락처)

## 프로젝트 소개

소프트웨어 마에스트로 프로그램의 모든 기수별 프로젝트를 효율적으로 탐색하고 검색할 수 있는 웹 플랫폼입니다.

- 기수별, 분야별 프로젝트 필터링
- 우수 프로젝트 별도 확인
- 반응형 웹 디자인
- 관리자 프로젝트 등록 기능

## 기술 스택

### Frontend
- **Framework**: Next.js 15.3 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hooks
- **Form Handling**: React Hook Form + Zod

### Backend & Database
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage
- **Hosting**: Vercel

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Next.js Config
- **Formatting**: Prettier
- **Icons**: Lucide React
- **Analytics**: Google Analytics 4

## 시작하기

### 필요 환경
- Node.js 18.0 이상
- npm
- Firebase 프로젝트

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/wibaek/soma-projects.git
cd soma-projects
```

2. **패키지 설치**
```bash
npm install
```

3. **환경 변수 설정**
`.env.local` 파일을 생성하고 Firebase 설정 정보를 입력하세요:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **개발 서버 실행**
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 환경 변수 설정

### Firebase 설정 가이드

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. **Authentication** 활성화 (이메일/비밀번호 방식)
3. **Firestore Database** 생성
4. **프로젝트 설정 > 일반**에서 앱 추가 후 구성 정보 복사
5. `.env.local` 파일에 정보 입력

### Firestore 데이터 구조

```javascript
// projects 컬렉션
{
  title: string,           // 프로젝트 제목
  description: string,     // 프로젝트 설명
  link: string,           // 프로젝트 링크
  imageUrl: string,       // 이미지 URL
  type: string,           // 프로젝트 타입 (Web, App, AI 등)
  generation: number,     // 소마 기수
  rank: boolean | null    // 우수 프로젝트 여부
}
```

## 라이센스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

## 연락처

### 프로젝트 관리자
- **GitHub**: [@wibaek](https://github.com/wibaek)
- **Email**: [devmuromi@gmail.com](mailto:devmuromi@gmail.com)

### 소프트웨어 마에스트로 관련 문의
- **카카오톡 오픈채팅**: [문의하기](https://open.kakao.com/o/sFa5F6rh)
- **공식 웹사이트**: [소프트웨어 마에스트로](https://www.swmaestro.org)

---

<div align="center">

**소마에 도전하는 모든 분들을 응원합니다**

</div>
