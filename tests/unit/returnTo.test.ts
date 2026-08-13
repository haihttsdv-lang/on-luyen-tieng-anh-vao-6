import { describe, expect, it } from 'vitest'
import { withSessionReturn } from '../../src/modules/curriculum/returnTo'

describe('withSessionReturn', () => {
  it('gắn ?from=<sessionId> khi URL chưa có query string', () => {
    expect(withSessionReturn('/hoc-ly-thuyet/NP-01', 'B02')).toBe(
      '/hoc-ly-thuyet/NP-01?from=B02',
    )
  })

  it('gắn &from=<sessionId> khi URL đã có query string', () => {
    expect(withSessionReturn('/luyen-tap/dang-bai?skill=KN-08', 'B14')).toBe(
      '/luyen-tap/dang-bai?skill=KN-08&from=B14',
    )
  })

  it('encode đúng sessionId có ký tự đặc biệt', () => {
    expect(withSessionReturn('/thi-thu', 'W-2026-08-09')).toBe(
      '/thi-thu?from=W-2026-08-09',
    )
  })
})
