import { UploadWalrusResponse } from './types/common.type'
import request from '/@/utils/request'
// import { getRandomInt } from '/@/utils/tools'
import mime from 'mime'
// import { WALRUS_PUBLISHER } from '../utils/constants'

// 上传图片
export async function UploadImageApi (file: File): Promise<UploadWalrusResponse | null> {
  const buffer = await file.arrayBuffer()
  const binary = new Uint8Array(buffer)
  return request({
    method: 'PUT',
    url: 'https://publisher-walrus.zzes1314.cn/v1/store?epochs=100',
    // url: 'http://127.0.0.1:31415/v1/store?epochs=100',
    data: binary,
    headers: {
      'Content-Type': mime.getType(file.name)
    },
    transformRequest: [(data) => data]
  }).then(res => {
    if (res.status === 200) {
      return res.data
    } else {
      console.error(res)
      return null
    }
  })
}
