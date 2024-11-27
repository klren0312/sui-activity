import { PlusOutlined } from '@ant-design/icons'
import { Form, Input, Radio, Upload } from 'antd'
import ImgCrop from 'antd-img-crop'
import TextArea from 'antd/es/input/TextArea'
import { UploadImageApi } from '../apis/common.api'
import { forwardRef, useImperativeHandle } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useNetworkVariable } from '../utils/networkConfig'
import { SUI_HAI_SERVER, WALRUS_AGGREGATOR } from '../utils/constants'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { message } from 'antd'

interface RegisterFormProps {
  onSuccess: () => void
}

const RegisterForm = forwardRef(({onSuccess}: RegisterFormProps, ref) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const packageId = useNetworkVariable('packageId')


  const { mutate } = useSignAndExecuteTransaction()
  useImperativeHandle(ref, () => ({
    submitForm: () => form.submit(),
  }))
  /**
   * 自定义上传逻辑
   */
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options
    const res = await UploadImageApi(file)
    if (res) {
      onProgress(100)
      let blobId = ''
      if (res.alreadyCertified) {
        blobId = res.alreadyCertified.blobId
      } else if (res.newlyCreated) {
        blobId = res.newlyCreated.blobObject.blobId
      }
      onSuccess(blobId)
      form.setFieldValue('avatar', blobId)
    } else {
      onError('上传失败')
    }
  }
  const onFinish = (values: any) => {
    console.log(values)
    const txb = new Transaction()
    txb.moveCall({
      target: `${packageId}::sui_hai::add_memeber`,
      arguments: [
        txb.object(SUI_HAI_SERVER),
        txb.pure.string(values.name),
        txb.pure.string(values.description),
        txb.pure.string(values.sex),
        txb.pure.string(WALRUS_AGGREGATOR[0] +values.avatar),
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
          onSuccess()
          messageApi.success(`注册成功: ${result.digest}`)
        },
      }
    )
  }
  return (
    <>
      {contextHolder}
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        variant="filled"
        onFinish={onFinish}
      >
        <Form.Item label="昵称：" name="name" rules={[{ required: true, message: '请输入昵称!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="性别：" name="sex" rules={[{ required: true, message: '请选择性别!' }]}>
          <Radio.Group>
            <Radio value="未知"> 未知 </Radio>
            <Radio value="女"> 女 </Radio>
            <Radio value="男"> 男 </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="描述：" name="description" rules={[{ required: true, message: '请输入描述!' }]}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="头像：" name="avatar" rules={[{ required: true, message: '请上传头像!' }]}>
          <ImgCrop rotationSlider modalOk="确定" modalCancel="取消">
            <Upload customRequest={customUpload} multiple={false} maxCount={1} listType="picture-card">
              <button style={{ border: 0, background: 'none' }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </button>
            </Upload>
          </ImgCrop>
        </Form.Item>
      </Form>
    </>
  )
})

export default RegisterForm