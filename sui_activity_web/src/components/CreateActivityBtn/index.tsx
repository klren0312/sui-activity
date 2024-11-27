import { PlusOutlined } from '@ant-design/icons'
import { DatePicker, FloatButton, Form, FormInstance, Input, InputNumber, Modal, Select, Upload } from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'

const { RangePicker } = DatePicker

export default function CreateActivityBtn() {
  const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false)
  const [form] = Form.useForm()
  const createActivityFormRef = useRef<FormInstance>(null)

  const handleCreateActivity = () => {
    console.log(createActivityFormRef.current?.getFieldsValue())
  }
  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().endOf('day');
  }
  return (
    <>
      <FloatButton type="primary" tooltip={<div>创建活动</div>} icon={<PlusOutlined />} onClick={() => setIsCreateActivityModalOpen(true)} />
      <Modal title="创建活动" open={isCreateActivityModalOpen} onOk={handleCreateActivity} onCancel={() => setIsCreateActivityModalOpen(false)}>
        <Form form={form} ref={createActivityFormRef}>
          <Form.Item name="title" label="活动标题" rules={[{ required: true, message: '请输入活动标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="活动描述" rules={[{ required: true, message: '请输入活动描述' }]}>
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
            <InputNumber />
          </Form.Item>
          <Form.Item name="join_fee" label="参与费用" rules={[{ required: true, message: '请输入参与费用' }]}>
            <InputNumber formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '_')} />
          </Form.Item>
          <Form.Item name="media" label="活动图片" rules={[{ required: true, message: '请输入活动图片' }]}>
            <Upload></Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
