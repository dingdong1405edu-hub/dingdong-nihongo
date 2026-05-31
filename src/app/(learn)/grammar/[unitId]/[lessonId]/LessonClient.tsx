// Re-export the shared LessonClient from vocab module.
// Grammar lessons use the same exercise engine — only the server action differs,
// which is controlled by the `module` prop passed from the grammar page.
export { LessonClient } from '@/app/(learn)/vocab/[unitId]/[lessonId]/LessonClient'
export type { LessonClientProps } from '@/app/(learn)/vocab/[unitId]/[lessonId]/LessonClient'
