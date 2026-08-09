import type { EarnedBadge } from './badges'

/** HA-05 · Dải huy hiệu — hiển thị ở bản đồ hành trình (Lộ trình học) và trang Hồ sơ. */
export function BadgeShelf({ badges }: { badges: EarnedBadge[] }) {
  if (badges.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Huy hiệu đã đạt được">
      {badges.map((badge) => (
        <span
          key={badge.id}
          role="listitem"
          title={badge.title}
          className="flex items-center gap-1.5 rounded-full border-2 border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
        >
          <span className="text-base leading-none" aria-hidden="true">
            {badge.emoji}
          </span>
          {badge.title}
        </span>
      ))}
    </div>
  )
}
