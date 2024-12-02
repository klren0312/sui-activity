import { Avatar, Button, Layout, Modal } from 'antd'
import router from '../../routers/router'
import React, { useEffect, useRef, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'
import './style.less'
import RegisterForm from '../RegisterForm'
import { useNetworkVariable } from '/@/utils/networkConfig'
import { LoadingOutlined } from '@ant-design/icons'
import CreateActivityBtn from '../CreateActivityBtn'
import { JoinActivityData, useUserStore } from '../../stores/user'

interface MemberData {
  avatar: string
  description: string
  id: {
    id: string
  }
  index: string
  name: string
  nickname: string
  sex: string
  url: string
}

const { Header, Content } = Layout

export default function PageLayout() {
  const packageId = useNetworkVariable('packageId')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [userData, setUserData] = useState<MemberData>()
  const registerFormRef = useRef<{ submitForm: () => void; resetForm: () => void }>(null)
  const needRefetch = useRef(false)
  const account = useCurrentAccount()
  const { setUser, setJoinActivityList, setActivityListRefetch } = useUserStore()
  // 查找会员卡
  const { data: memberQueryData, isPending, refetch } = useSuiClientQuery(
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
  // 查找参与的活动
  const { data: joinQueryData, refetch: joinRefetch } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address || '',
      filter: {
        MatchAll: [
          {
            StructType: `${packageId}::activity::JoinActivityNft`,
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

  /**
   * 打开注册会员弹窗
   */
  const openRegisterMember = () => {
    setIsRegisterModalOpen(true)
  }
  /**
   * 注册会员表单提交
   */
  const handleRegisterMember = () => {
    registerFormRef.current?.submitForm()
  }
  /**
   * 注册会员成功
   */
  const registerSuccess = async () => {
    needRefetch.current = true
    const result = await refetch()
    console.log('refetch', result)
    if (result.data && result.data.data.length > 0 && result.data.data[0].data?.content?.dataType === 'moveObject') {
      setUserData(result.data.data[0].data.content.fields as unknown as MemberData)
    } else {
      setUserData(undefined)
      registerSuccess()
    }
    setIsRegisterModalOpen(false)
  }
  /**
   * 初始化时设置活动列表刷新函数
   */
  useEffect(() => {
    setActivityListRefetch(joinRefetch)
  }, [])
  /**
   * 监听会员信息
   */
  useEffect(() => {
    let memeberData: MemberData | undefined = undefined
    if (memberQueryData && memberQueryData.data.length > 0 && memberQueryData.data[0].data?.content?.dataType === 'moveObject') {
      memeberData = memberQueryData.data[0].data.content.fields as unknown as MemberData
      setUser({
        objectId: memberQueryData.data[0].data.objectId,
        name: memeberData.name,
        nickname: memeberData.nickname,
        description: memeberData.description,
        sex: memeberData.sex,
        avatar: memeberData.avatar,
      })
      setUserData(memeberData)
    } else {
      setUserData(undefined)
    }
  }, [memberQueryData])

  /**
   * 监听参与活动列表
   */
  useEffect(() => {
    if (joinQueryData && joinQueryData.data.length > 0) {
      console.log('joinQueryData', joinQueryData)
      const arr = joinQueryData.data.map((item) => {
        if (item?.data?.content?.dataType === 'moveObject') {
          return item.data.content.fields as unknown as JoinActivityData
        }
        return undefined
      }).filter((item) => item !== undefined) as JoinActivityData[]
      setJoinActivityList(arr)
    } else {
      setJoinActivityList([])
    }
  }, [joinQueryData])
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
            userData ?
            <div className="flex items-center">
              <Avatar
                size="default"
                icon={<img src={userData.avatar as string} />}
              />
              <div className="flex items-center ml-2 mr-5">欢迎回家，<div className="font-bold text-green-500">{userData.nickname as string}</div></div>
            </div> :
            <Button className="mr-5" type="primary" onClick={openRegisterMember}>申请会员</Button>
          }
          <ConnectButton className="reset-connect-button" connectText="使用钱包登录"></ConnectButton>
        </div>
      </Header>
      <Content className="p-2 flex box-border">
        <div className="h-full w-full p-5 bg-white rounded-md box-border" style={{minHeight: 'calc(100vh - 83px)'}}>
          <React.StrictMode>
            <RouterProvider router={router} future={{v7_startTransition: true}}/>
          </React.StrictMode>
        </div>
      </Content>
      <Modal title="申请会员" open={isRegisterModalOpen} onOk={handleRegisterMember} onCancel={() => setIsRegisterModalOpen(false)}>
        <RegisterForm ref={registerFormRef} onSuccess={() => registerSuccess}></RegisterForm>
      </Modal>
      <CreateActivityBtn />
    </Layout>
  )
}
