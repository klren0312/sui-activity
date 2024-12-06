import { Avatar, Button, Card, Divider, Table } from "antd"
import { useUserStore } from "/@/stores/user"
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit"
import { useNetworkVariable } from "/@/utils/networkConfig"
import { useEffect, useState } from "react"
import JoinActivityCard, { JoinActivityData } from "/@/components/JoinActivityCard"
import './index.less'
import { ActivityEventData } from "../HomePage"
import { ActivityData } from "/@/components/ActivityCard"
import dayjs from "dayjs"
import { SUI_DECIMALS } from "/@/utils/constants"
const { Meta } = Card

export default function PersonCenter() {
  const { userData } = useUserStore()
  const account = useCurrentAccount()
  const packageId = useNetworkVariable('packageId')
  const [joinActivity, setJoinActivity] = useState<JoinActivityData[]>([])
  const [createActivity, setCreateActivity] = useState<ActivityData[]>([])

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

  /**
   * 查询活动创建事件
   */
  const {
    data: activityEvents,
  } = useSuiClientQuery(
    'queryEvents',
    {
      query: {
        MoveEventType:  `${packageId}::activity::CreateActivityEvent`,
      },
      order: "descending",
    },
    {
      refetchInterval: 10000,
    }
  )

  const { data: multiActivityObjects } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids:
       activityEvents?.data && (activityEvents?.data as unknown as ActivityEventData[]).filter((item) => item.parsedJson.creator === account?.address).map((item) => item.parsedJson.activity_id) || [],
      options: {
        showContent: true,
      },
    },
    {
      enabled:
        activityEvents &&
        activityEvents.data.length > 0,
      refetchInterval: 10000,
    }
  )

  /**
   * 提取活动经费
   * @param activityId 活动ID
   */
  const getActivityFunds = (activityId: string) => {
    console.log(activityId)
  }

  // 设置参与活动
  useEffect(() => {
    if (joinData && joinData.data.length > 0) {
      setJoinActivity(joinData.data.map((item) => {
        if (item?.data?.content?.dataType === 'moveObject') {
          return item.data.content.fields as unknown as JoinActivityData
        }
        return undefined
      }).filter((item) => item !== undefined))
    }
  }, [joinData])

  useEffect(() => {
    if (multiActivityObjects && multiActivityObjects.length > 0) {
      const formatArr = multiActivityObjects.map(item => {
        if (item.data && item.data.content && item.data.content.dataType === 'moveObject') {
          return item.data.content.fields as unknown as ActivityData
        }
        return undefined
      }).filter(item => item) as unknown as ActivityData[]
      setCreateActivity(formatArr)

    }
  }, [multiActivityObjects])

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
          <div className="mt-10 text-xl font-bold">发布的活动</div>
          <Divider />
          {/* 发布的活动卡片 */}
          <Table
            dataSource={createActivity}
            pagination={false}
            columns={[
              {
                title: '活动名称',
                dataIndex: 'title',
                key: 'title',
              },
              {
                title: '活动时间',
                dataIndex: 'date_range',
                key: 'date_range',
                render: (dateRange: string[]) => {
                  return dateRange.map((date) => dayjs(date).format('YYYY-MM-DD')).join(' - ')
                }
              },
              {
                title: '活动费用',
                dataIndex: 'join_fee',
                key: 'join_fee',
                render: (joinFee: string) => {
                  return `${(Number(joinFee) / SUI_DECIMALS).toFixed(2)} SUI`
                }
              },
              {
                title: '活动资金池',
                dataIndex: 'total_price',
                key: 'total_price',
                render: (totalPrice: string) => {
                  return `${(Number(totalPrice) / SUI_DECIMALS).toFixed(2)} SUI`
                }
              },
              {
                title: '活动人数',
                dataIndex: 'total_people_num',
                key: 'total_people_num',
              },
              {
                title: '参与人数',
                dataIndex: 'join_memeber',
                key: 'join_memeber',
                render: (joinMember: {
                  type: string
                  fields: {
                    contents: string[]
                  }
                }) => {
                  return joinMember.fields.contents.length
                }
              },
              {
                title: '活动类型',
                dataIndex: 'tag',
                key: 'tag',
              },
              {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                  <Button type="link" onClick={() => getActivityFunds(record.id.id)}>提取活动经费</Button>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}