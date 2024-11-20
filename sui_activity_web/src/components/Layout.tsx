import { Layout, Menu, theme } from 'antd'
import router from '../routers/router'
import React from 'react'
import { RouterProvider } from 'react-router-dom'
const { Header, Content, Footer } = Layout

const items = new Array(15).fill(null).map((_, index) => ({
  key: index + 1,
  label: `nav ${index + 1}`,
}))
export default function PageLayout() {
  const {
    token: { borderRadiusLG },
  } = theme.useToken()
  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="flex items-center">
          <div className="demo-logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={items}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
        
      </Header>
      <Content style={{ padding: '20px 20px 0', height: 'calc(100vh - 132px)' }}>
        <div
          style={{
            background: '#ffffff',
            height: '100%',
            padding: '20px',
            borderRadius: borderRadiusLG,
          }}
        >
          <React.StrictMode>
            <RouterProvider router={router} future={{v7_startTransition: true}}/>
          </React.StrictMode>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        ZZES ©{new Date().getFullYear()} 求真 务实 坚韧 无畏 POWER BY <a href="https://walrus.xyz" target="_blank">WALRUS. </a>
      </Footer>
    </Layout>
  )
}
