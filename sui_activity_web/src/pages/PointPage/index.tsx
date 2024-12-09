import { useEffect } from 'react'
import supabase from '/@/utils/supabase'
import { useState } from 'react'
import { Table } from 'antd'
interface PointData {
  point: number
  address: string
}
export default function PointPage () {
  const [pointData, setPointData] = useState<PointData[]>([])
  const columns = [
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '积分',
      dataIndex: 'point',
      key: 'point',
    },
  ]
  const getPointData = async () => {
    let { data, error } = await supabase
      .from('member')
      .select('address, point')
      .order('id', { ascending: false })
    if (error) {
      console.error(error)
      return
    }
    console.log(data)
    setPointData(data as PointData[])
  }
  useEffect(() => {
    getPointData()
  }, [])
  return (
    <div>
      <Table bordered size="small" pagination={false} rowKey="address" columns={columns} dataSource={pointData} />
    </div>
  )
}