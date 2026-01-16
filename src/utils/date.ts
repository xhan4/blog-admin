// 不足两位补 0
const fillTimeGap = (time: number) => (time < 10 ? `0${time}` : `${time}`)

/** 输入 string 或 Date, 返回 Date 对象 */
const getDate = (input: string | Date) => {
  if (input instanceof Date) {
    return input
  }
  if (input.includes('T')) {
    return new Date(input)
  }
  // todo 根据字符串长度判断不是很健壮 有时间专门优化一下不同浏览器的兼容
  if (input.includes('-') && input.length >= 8) {
    return new Date(input.replace(/-/g, '/'))
  }
  return new Date(input)
}

/** 格式化日期 */
export function formatDate(input: string | Date = new Date(), timeFormat = 'YYYY-MM-DD hh:mm:ss') {
  const weekArr = ['日', '一', '二', '三', '四', '五', '六']
  const date = getDate(input)

  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const MM = fillTimeGap(M)
  const D = date.getDate()
  const DD = fillTimeGap(date.getDate())
  const W = weekArr[date.getDay()]
  const h = date.getHours()
  const hh = fillTimeGap(date.getHours())
  const m = date.getMinutes()
  const mm = fillTimeGap(date.getMinutes())
  const s = date.getSeconds()
  const ss = fillTimeGap(date.getSeconds())

  return timeFormat
    .replace('YYYY', Y.toString())
    .replace(/M{2}/, MM)
    .replace(/M/, M.toString())
    .replace(/D{2}/, DD)
    .replace(/D/, D.toString())
    .replace(/W{1,2}/, W)
    .replace(/h{2}/, hh)
    .replace(/h/, h.toString())
    .replace(/m{2}/, mm)
    .replace(/m/, m.toString())
    .replace(/s{2}/, ss)
    .replace(/s/, s.toString())
}
