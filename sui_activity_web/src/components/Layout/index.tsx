import { Button, Layout, Modal } from 'antd'
import router from '../../routers/router'
import React, { useRef, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConnectButton } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'
import './style.less'
import RegisterForm from '../RegisterForm'

const { Header, Content } = Layout

export default function PageLayout() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const registerFormRef = useRef<{ submitForm: () => void; resetForm: () => void }>(null)
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
          {/* <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={items}
            style={{ flex: 1, minWidth: 0 }}
          /> */}
        </div>
        <div className="flex items-center justify-between">
          <Button className="mr-5" type="primary" onClick={openRegisterMember}>申请会员</Button>
          <ConnectButton className="reset-connect-button" connectText="使用钱包登录"></ConnectButton>
        </div>
      </Header>
      <Content className="p-2" style={{ height: 'calc(100vh - 63px)' }}>
        <div className="h-full p-5 bg-white rounded-md">
          <React.StrictMode>
            <RouterProvider router={router} future={{v7_startTransition: true}}/>
          </React.StrictMode>
        </div>
      </Content>
      <Modal title="Basic Modal" open={isRegisterModalOpen} onOk={handleRegisterMember} onCancel={() => setIsRegisterModalOpen(false)}>
        <RegisterForm ref={registerFormRef} onSuccess={() => setIsRegisterModalOpen(false)}></RegisterForm>
      </Modal>
    </Layout>
  )
}
