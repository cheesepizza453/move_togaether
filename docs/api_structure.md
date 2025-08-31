# Move Togaether API 구조 문서

## 📅 생성일
2025년 8월 31일

## ��️ API 구조 개요

### **중요: 백엔드 중심 구조**
- **모든 데이터베이스 접근**: 백엔드 API를 통해서만 처리
- **클라이언트**: Supabase 인증만 담당, 직접 DB 접근 금지
- **보안**: 서버 사이드에서 모든 권한 검증 및 데이터 처리

### **Base URL**
```
/api
```

### **인증 방식**
- **Bearer Token**: Supabase JWT 토큰 사용
- **Header**: `Authorization: Bearer {token}`
- **미들웨어**: `withAuth`, `withPostOwnership` 등으로 권한 제어

## 📋 API 엔드포인트

### **1. 인증 및 프로필 관리**

#### **GET /api/auth/profile**
사용자 프로필 조회
```javascript
// 사용 예시
const { profile } = await profileAPI.get()
```

#### **PUT /api/auth/profile**
사용자 프로필 수정
```javascript
// 사용 예시
const profileData = {
  display_name: "새로운 이름",
  phone: "010-1234-5678",
  phone_visible: true,
  bio: "자기소개"
}
const { profile } = await profileAPI.update(profileData)
```

### **2. 게시물 관리**

#### **GET /api/posts**
게시물 목록 조회 (검색, 필터링, 페이지네이션)
```javascript
// 사용 예시
const params = {
  page: 1,
  limit: 10,
  search: "서울",
  dogSize: "소형견",
  status: "active"
}
const { posts, pagination } = await postsAPI.getList(params)
```

#### **GET /api/posts/my**
내가 작성한 게시물 목록
```javascript
// 사용 예시
const { posts, pagination } = await postsAPI.getMyPosts({ status: 'active' })
```

#### **POST /api/posts**
새 게시물 생성
```javascript
// 사용 예시
const postData = {
  title: "서울에서 대구까지 이동봉사",
  description: "강아지 호치의 이동을 도와주세요",
  departure_address: "서울역",
  arrival_address: "대구역",
  dog_name: "호치",
  dog_size: "소형견",
  dog_breed: "믹스",
  deadline: "2025-10-27"
}
const { post } = await postsAPI.create(postData)
```

#### **GET /api/posts/[id]**
개별 게시물 조회
```javascript
// 사용 예시
const { post } = await postsAPI.getById(1)
```

#### **PUT /api/posts/[id]**
게시물 수정
```javascript
// 사용 예시
const updateData = { title: "수정된 제목" }
const { post } = await postsAPI.update(1, updateData)
```

#### **DELETE /api/posts/[id]**
게시물 삭제 (소프트 삭제)
```javascript
// 사용 예시
await postsAPI.delete(1)
```

### **3. 봉사 신청 관리**

#### **GET /api/applications**
봉사 신청 목록 조회
```javascript
// 사용 예시
// 내가 신청한 봉사
const { applications } = await applicationsAPI.getMyApplications()

// 내가 받은 봉사 신청
const { applications } = await applicationsAPI.getReceivedApplications()
```

#### **POST /api/applications**
봉사 신청 생성
```javascript
// 사용 예시
const applicationData = {
  post_id: 1,
  message: "봉사를 도와드릴 수 있습니다. 자차로 이동 가능합니다."
}
const { application } = await applicationsAPI.create(applicationData)
```

#### **PUT /api/applications/[id]/status**
봉사 신청 상태 변경 (수락/거절)
```javascript
// 사용 예시
await applicationsAPI.updateStatus(1, 'accepted', '수락합니다!')
```

### **4. 찜 목록 관리**

#### **GET /api/favorites**
찜 목록 조회
```javascript
// 사용 예시
const params = { page: 1, limit: 10 }
const { favorites, pagination } = await favoritesAPI.getList(params)
```

#### **GET /api/favorites/check**
특정 게시물 찜 여부 확인
```javascript
// 사용 예시
const { isFavorited, favoriteId } = await favoritesAPI.check(1)
```

#### **POST /api/favorites**
찜 추가
```javascript
// 사용 예시
await favoritesAPI.add(1) // post_id: 1
```

#### **DELETE /api/favorites**
찜 제거
```javascript
// 사용 예시
await favoritesAPI.remove(1) // post_id: 1
```

### **5. 보호소 관리**

#### **GET /api/shelters**
보호소 목록 조회
```javascript
// 사용 예시
const params = { search: "서울", verified: "true" }
const { shelters, pagination } = await sheltersAPI.getList(params)
```

#### **GET /api/shelters/[id]**
보호소 상세 정보
```javascript
// 사용 예시
const { shelter } = await sheltersAPI.getById(1)
```

#### **POST /api/shelters**
보호소 등록
```javascript
// 사용 예시
const shelterData = {
  name: "행복한 보호소",
  description: "유기견들을 위한 따뜻한 보호소입니다",
  phone: "02-1234-5678",
  address: "서울시 강남구"
}
const { shelter } = await sheltersAPI.create(shelterData)
```

#### **PUT /api/shelters/[id]**
보호소 정보 수정
```javascript
// 사용 예시
const updateData = { phone: "02-9876-5432" }
const { shelter } = await sheltersAPI.update(1, updateData)
```

## 🔐 보안 및 권한

### **RLS (Row Level Security)**
- 모든 테이블에 RLS 활성화
- 사용자별 데이터 접근 제어
- 소프트 삭제로 데이터 보호

### **인증 미들웨어**
```javascript
// 기본 인증
export const GET = withAuth(async (request) => {
  const { profile } = request  // 이미 인증 완료
  return NextResponse.json({ profile })
})

// 게시물 작성자 권한 확인
export const PUT = withPostOwnership(async (request) => {
  // 권한 검증 완료된 상태
  return NextResponse.json({ message: 'Updated' })
})
```

### **권한 제어**
- **게시물**: 작성자만 수정/삭제 가능
- **봉사 신청**: 게시물 작성자만 상태 변경 가능
- **보호소**: 등록자만 수정 가능
- **프로필**: 본인만 수정 가능

## 📊 데이터 흐름

### **1. 게시물 생성 플로우**
```
클라이언트 → API 요청 → 인증 미들웨어 → 권한 검증 → 데이터베이스 저장 → 응답
```

### **2. 봉사 신청 플로우**
```
클라이언트 → API 요청 → 인증 미들웨어 → 중복 신청 검증 → 데이터베이스 저장 → 응답
```

### **3. 찜 관리 플로우**
```
클라이언트 → API 요청 → 인증 미들웨어 → 중복 찜 검증 → 데이터베이스 저장/제거 → 응답
```

## 🛠️ 에러 처리

### **에러 타입**
- **401 Unauthorized**: 인증 실패 (자동 로그아웃)
- **403 Forbidden**: 권한 부족
- **404 Not Found**: 리소스 없음
- **400 Bad Request**: 잘못된 요청
- **500 Internal Server Error**: 서버 오류

### **에러 처리 유틸리티**
```javascript
import { handleAPIError } from '@/lib/api'

try {
  const result = await postsAPI.create(postData)
} catch (error) {
  const errorInfo = handleAPIError(error)
  // 에러 타입에 따른 처리
  if (errorInfo.type === 'auth') {
    // 로그인 페이지로 리다이렉트
  }
}
```

## 🚀 사용 예시

### **게시물 목록 페이지**
```javascript
import { postsAPI } from '@/lib/api'

const PostsPage = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const { posts } = await postsAPI.getList({ page: 1, limit: 20 })
        setPosts(posts)
      } catch (error) {
        console.error('게시물 조회 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // 렌더링 로직...
}
```

### **봉사 신청 모달**
```javascript
import { applicationsAPI } from '@/lib/api'

const ApplicationModal = ({ postId, onSuccess }) => {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSubmitting(true)
      await applicationsAPI.create({ post_id: postId, message })
      onSuccess()
    } catch (error) {
      console.error('신청 실패:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // 렌더링 로직...
}
```

### **찜 토글 기능**
```javascript
import { favoritesAPI } from '@/lib/api'

const FavoriteButton = ({ postId, isFavorited, onToggle }) => {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    try {
      setLoading(true)
      if (isFavorited) {
        await favoritesAPI.remove(postId)
      } else {
        await favoritesAPI.add(postId)
      }
      onToggle()
    } catch (error) {
      console.error('찜 토글 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleToggle} disabled={loading}>
      {isFavorited ? '❤️' : '🤍'}
    </button>
  )
}
```

## 📝 다음 단계

### **1. 프론트엔드 연동**
- React 컴포넌트에서 API 호출
- 인증 상태 관리 (Context/Redux)
- 보호된 라우트 구현

### **2. 추가 기능**
- 이미지 업로드 API
- 실시간 알림 (Supabase Realtime)
- 검색 및 필터링 최적화

### **3. 테스트**
- API 단위 테스트
- 통합 테스트
- 성능 테스트

---

*이 문서는 백엔드 중심 API 구조를 반영하여 업데이트되었습니다.*
