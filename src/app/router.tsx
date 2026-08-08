import { createBrowserRouter, createHashRouter, type RouteObject } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { FlashcardsPage } from '../modules/lessons/FlashcardsPage'
import { LessonDetailPage } from '../modules/lessons/LessonDetailPage'
import { LessonListPage } from '../modules/lessons/LessonListPage'
import { LessonQuizPage } from '../modules/lessons/LessonQuizPage'
import { DiagnosticTestPage } from '../modules/mastery/DiagnosticTestPage'
import { MasteryPage } from '../modules/mastery/MasteryPage'
import { ParentOverviewPage } from '../modules/mastery/ParentOverviewPage'
import { CustomMockTestPage } from '../modules/mock-test/CustomMockTestPage'
import { MockTestPage } from '../modules/mock-test/MockTestPage'
import { PracticeBySkillPage } from '../modules/practice/PracticeBySkillPage'
import { PracticeByTopicPage } from '../modules/practice/PracticeByTopicPage'
import { PracticeMenuPage } from '../modules/practice/PracticeMenuPage'
import { SpeedChallengePage } from '../modules/practice/SpeedChallengePage'
import { TreasureHuntPage } from '../modules/practice/TreasureHuntPage'
import { WritingPromptDetailPage } from '../modules/practice/WritingPromptDetailPage'
import { WritingPromptListPage } from '../modules/practice/WritingPromptListPage'
import { HomePage } from './HomePage'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'hoc-ly-thuyet', element: <LessonListPage /> },
      { path: 'hoc-ly-thuyet/tu-vung/:topicId', element: <FlashcardsPage /> },
      { path: 'hoc-ly-thuyet/:topicId', element: <LessonDetailPage /> },
      { path: 'hoc-ly-thuyet/:topicId/quiz', element: <LessonQuizPage /> },
      { path: 'luyen-tap', element: <PracticeMenuPage /> },
      { path: 'luyen-tap/dang-bai', element: <PracticeBySkillPage /> },
      { path: 'luyen-tap/chu-diem', element: <PracticeByTopicPage /> },
      { path: 'luyen-tap/viet', element: <WritingPromptListPage /> },
      { path: 'luyen-tap/viet/:promptId', element: <WritingPromptDetailPage /> },
      { path: 'luyen-tap/tro-choi/toc-do', element: <SpeedChallengePage /> },
      { path: 'luyen-tap/tro-choi/kho-bau', element: <TreasureHuntPage /> },
      { path: 'thi-thu', element: <MockTestPage /> },
      { path: 'thi-thu/tu-tao-de', element: <CustomMockTestPage /> },
      { path: 'ho-so', element: <MasteryPage /> },
      { path: 'ho-so/kiem-tra-dau-vao', element: <DiagnosticTestPage /> },
      { path: 'ho-so/phu-huynh', element: <ParentOverviewPage /> },
    ],
  },
]

// Bản "offline" (mở trực tiếp bằng file:// — xem `npm run build:offline`)
// không có máy chủ để xử lý URL, nên phải dùng HashRouter (điều hướng qua
// "#/...") thay vì BrowserRouter (dùng History API, cần máy chủ thật).
export const router =
  import.meta.env.MODE === 'offline' ? createHashRouter(routes) : createBrowserRouter(routes)
