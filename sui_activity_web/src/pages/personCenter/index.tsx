import { Avatar, Card, Divider } from "antd"
import { useUserStore } from "/@/stores/user"
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit"
import { useNetworkVariable } from "/@/utils/networkConfig"
import { useEffect, useState } from "react"
import JoinActivityCard, { JoinActivityData } from "/@/components/JoinActivityCard"
import './index.less'
const { Meta } = Card

export default function PersonCenter() {
  const { userData } = useUserStore()
  const account = useCurrentAccount()
  const packageId = useNetworkVariable('packageId')
  const [joinActivity, setJoinActivity] = useState<any>()
  // 查找参加的活动
  const { data: joinData } = useSuiClientQuery(
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
        showContent: true,
      },
    },
    {
      gcTime: 10000,
    },
  )
  useEffect(() => {
    console.log('joinData', joinData)
    if (joinData && joinData.data.length > 0) {
      setJoinActivity(joinData.data.map((item) => {
        if (item?.data?.content?.dataType === 'moveObject') {
          return item.data.content.fields as unknown as JoinActivityData
        }
        return undefined
      }).filter((item) => item !== undefined))
    }
  }, [joinData])
  return (
    <div>
      <div className="flex">
        <Card
          hoverable
          style={{ width: 300, height: 400 }}
          cover={
            <img
              className="object-cover w-72 h-72"
              alt="avatar"
              src={userData.avatar}
            />
          }
        >
          <div className="absolute top-0 right-0">
            #{userData.index}
          </div>
          <Meta
            avatar={<Avatar src={
              userData.sex === '未知' ?
              '/logo.svg' :
              userData.sex === '男' ?
              'https://api.dicebear.com/7.x/miniavs/svg?seed=8' :
              'https://api.dicebear.com/7.x/miniavs/svg?seed=9'
            } />}
            title={userData.nickname}
            description={userData.description}
          />
        </Card>
        <div className="flex-1 pl-5 box-border">
          <div className="text-xl font-bold">参与的活动</div>
          <Divider />
          {/* 参与的活动卡片 */}
          <div className="grid grid-cols-3 gap-4">
            {joinActivity && joinActivity.map((item: JoinActivityData) => (
              <JoinActivityCard key={item.id.id} joinData={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}