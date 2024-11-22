import { Layout, Menu } from 'antd'
import router from '../../routers/router'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConnectButton } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'
import './style.less'
const { Header, Content } = Layout

export default function PageLayout() {
  return (
    <Layout>
      <Header className="page-header flex items-center justify-between px-5">
        <div className="flex items-center">
          <img className="w-10 h-10" src="/logo-transparent.svg" alt="logo" />
          <div className="page-title ml-5 text-white font-bold text-xl">Sui-Activity</div>
          {/* <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={items}
            style={{ flex: 1, minWidth: 0 }}
          /> */}
        </div>
        <ConnectButton className="reset-connect-button" connectText="使用钱包登录"></ConnectButton>
      </Header>
      <Content className="p-2" style={{ height: 'calc(100vh - 63px)' }}>
        <div className="h-full p-5 bg-white rounded-md">
          <React.StrictMode>
            <RouterProvider router={router} future={{v7_startTransition: true}}/>
          </React.StrictMode>
        </div>
      </Content>
    </Layout>
  )
}
