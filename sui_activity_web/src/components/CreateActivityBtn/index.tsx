import { InboxOutlined, PlusOutlined } from '@ant-design/icons'
import { DatePicker, FloatButton, Form, FormInstance, Input, InputNumber, message, Modal, Select, Upload } from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'
import { UploadImageApi } from '/@/apis/common.api'
import { WALRUS_AGGREGATOR } from '/@/utils/constants'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useNetworkVariable } from '/@/utils/networkConfig'
import { useUserStore } from '/@/stores/user'

const { Dragger } = Upload
const { RangePicker } = DatePicker

export default function CreateActivityBtn() {
  const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [fee, setFee] = useState<number>(0)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const createActivityFormRef = useRef<FormInstance>(null)
  const packageId = useNetworkVariable('packageId')
  const { mutate } = useSignAndExecuteTransaction()
  const { userData } = useUserStore()
  const [messageApi, contextHolder] = message.useMessage()

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().endOf('day');
  }
  const onFinish = async (values: any) => {
    setSubmitLoading(true)
    console.log(values)
    const mediaArr = values.media
    const res = await Promise.all(mediaArr.map(async (file: any) => {
      const res = await UploadImageApi(file.originFileObj)
      if (res) {
        let blobId = ''
        if (res.alreadyCertified) {
          blobId = res.alreadyCertified.blobId
        } else if (res.newlyCreated) {
          blobId = res.newlyCreated.blobObject.blobId
        }
        return `${WALRUS_AGGREGATOR[0]}${blobId}`
      } else {
        message.error('上传失败')
      }
      return ''
    }))
    const linkArr = res.filter(item => item)
    console.log(linkArr, values)
    const txb = new Transaction()
    /**
     * _: &MemberNft,
      title: String, // 活动标题
      description: String, // 描述
      date_range: vector<String>, // 时间范围
      location: String, // 地点
      tag: String, // 分类
      total_people_num: u64, // 人数
      join_fee: u64,  // 参与费用
      media: VecSet<String>, // 图片
      ctx: &mut TxContext
     */
    txb.moveCall({
      target: `${packageId}::activity::create_activity`,
      arguments: [
        txb.object(userData.objectId),
        txb.pure.string(values.title),
        txb.pure.string(values.description),
        txb.pure.vector('string', [
          dayjs(values.date_range[0]).format('YYYY-MM-DD HH:mm:ss'),
          dayjs(values.date_range[1]).format('YYYY-MM-DD HH:mm:ss')
        ]),
        txb.pure.string(values.location),
        txb.pure.string(values.tag),
        txb.pure.u64(values.total_people_num),
        txb.pure.u64(values.join_fee),
        txb.pure.vector('string', linkArr),
      ]
    })
    mutate(
      {
        transaction: txb
      },
      {
        onError: (err) => {
          console.log(err.message)
          messageApi.error(err.message)
        },
        onSuccess: (result) => {
          form.resetFields()
          setIsCreateActivityModalOpen(false)
          messageApi.success(`活动创建成功: ${result.digest}`)
        },
      }
    )
    setSubmitLoading(false)
  }
  const beforeUpload = (file: File) => {
    const isLessThan10M = file.size / 1024 / 1024 < 10;
    const isImage = /^image\/(jpeg|png|gif|webp)$/.test(file.type);
    
    if (!isLessThan10M) {
      messageApi.error('文件必须小于10MB!');
    }
    if (!isImage) {
      messageApi.error('只能上传 JPG/PNG/GIF/WEBP 格式的图片!');
    }
    return false
  }
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  return (
    <>
      {contextHolder}
      <FloatButton type="primary" tooltip={<div>创建活动</div>} icon={<PlusOutlined />} onClick={() => {form.resetFields(); setIsCreateActivityModalOpen(true)}} />
      <Modal title="创建活动" open={isCreateActivityModalOpen} loading={submitLoading} onOk={() => form.submit()} onCancel={() => setIsCreateActivityModalOpen(false)}>
        <Form form={form} ref={createActivityFormRef} onFinish={onFinish}>
          <Form.Item name="title" label="活动标题" rules={[{ required: true, message: '请输入活动标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date_range" label="时间范围" rules={[{ required: true, message: '请输入时间范围' }]}>
            <RangePicker
              disabledDate={disabledDate}
              showTime={{
                hideDisabledOptions: true,
                defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('11:59:59', 'HH:mm:ss')],
              }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
          <Form.Item name="location" label="活动地点" rules={[{ required: true, message: '请输入活动地点' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tag" label="活动分类" rules={[{ required: true, message: '请输入活动分类' }]}>
            <Select>
              <Select.Option value="线上">线上</Select.Option>
              <Select.Option value="线下">线下</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="total_people_num" label="活动人数" rules={[{ required: true, message: '请输入活动人数' }]}>
            <InputNumber className="w-full"/>
          </Form.Item>
          <Form.Item name="join_fee" label="参与费用" rules={[{ required: true, message: '请输入参与费用' }]}>
            <div>
              <InputNumber<number>
                className="w-full"
                onChange={(value) => setFee(value || 0)}
              />
              { fee / 1000000000 } SUI
            </div>
          </Form.Item>
          <Form.Item name="media" label="活动图片" rules={[{ required: true, message: '请输入活动图片' }]} getValueFromEvent={normFile} valuePropName="fileList">
            <Dragger
              accept="image/*"
              maxCount={3}
              beforeUpload={beforeUpload}
              multiple={true}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或者拖拽文件到此区域完成上传</p>
              <p className="ant-upload-hint">
                支持单个或批量上传，仅支持图片格式，单个文件大小不超过 10MB，最多上传6张图片
              </p>
            </Dragger>
          </Form.Item>
          <Form.Item name="description" label="活动描述" rules={[{ required: true, message: '请输入活动描述' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
