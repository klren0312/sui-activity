/**
 * 返回范围内的随机数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数
 */
export const getRandomInt = (min: number, max: number) => {
  const range = max - min + 1
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return min + (array[0] % range)
}
