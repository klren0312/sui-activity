import { Avatar, Button, Layout, Modal } from 'antd'
import router from '../../routers/router'
import React, { useRef, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'
import './style.less'
import RegisterForm from '../RegisterForm'
import { useNetworkVariable } from '/@/utils/networkConfig'
import { LoadingOutlined } from '@ant-design/icons'
import { MoveValue } from '@mysten/sui/client'
import CreateActivityBtn from '../CreateActivityBtn'

interface MemberData {
  [key: string]: MoveValue;
}

const { Header, Content } = Layout

export default function PageLayout() {
  const packageId = useNetworkVariable('packageId')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const registerFormRef = useRef<{ submitForm: () => void; resetForm: () => void }>(null)
  const account = useCurrentAccount()
  const { data: memberQueryData, isPending } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address || '',
      limit: 1,
      filter: {
        MatchAll: [
          {
            StructType: `${packageId}::member::MemberNft`,
          },
          {
            AddressOwner: account?.address!!,
          },
        ],
      },
      options: {
        showDisplay: true,
        showContent: true,
      },
    },
    {
      gcTime: 10000,
    },
  )
  let memeberData: MemberData | undefined = undefined
  if (memberQueryData && memberQueryData.data.length > 0 && memberQueryData.data[0].data?.content?.dataType === 'moveObject') {
    memeberData = memberQueryData.data[0].data.content.fields as MemberData
  }
  console.log(memberQueryData)
  const openRegisterMember = () => {
    setIsRegisterModalOpen(true)
  }
  const handleRegisterMember = () => {
    registerFormRef.current?.submitForm()
  }
  return (
    <Layout>
      <Header className="page-header flex items-center justify-between px-5">
        <div className="flex items-center">
          <img className="w-10 h-10" src="/logo-transparent.svg" alt="logo" />
          <div className="page-title ml-5 text-white font-bold text-xl">SuiHi 随嗨</div>
        </div>
        <div className="flex items-center justify-between">
          {
            isPending ?
            <LoadingOutlined /> :
            memeberData ?
            <div className="flex items-center">
              <Avatar
                size="default"
                icon={<img src={memeberData.avatar as string} />}
              />
              <div className="flex items-center ml-2 mr-5">欢迎回家，<div className="font-bold text-green-500">{memeberData.name as string}</div></div>
            </div> :
            <Button className="mr-5" type="primary" onClick={openRegisterMember}>申请会员</Button>
          }
          <ConnectButton className="reset-connect-button" connectText="使用钱包登录"></ConnectButton>
        </div>
      </Header>
      <Content className="p-2" style={{ height: 'calc(100vh - 63px)' }}>
        <div className="h-full p-5 bg-white rounded-md box-border">
          <React.StrictMode>
            <RouterProvider router={router} future={{v7_startTransition: true}}/>
          </React.StrictMode>
        </div>
      </Content>
      <Modal title="申请会员" open={isRegisterModalOpen} onOk={handleRegisterMember} onCancel={() => setIsRegisterModalOpen(false)}>
        <RegisterForm ref={registerFormRef} onSuccess={() => setIsRegisterModalOpen(false)}></RegisterForm>
      </Modal>
      <CreateActivityBtn />
    </Layout>
  )
}
