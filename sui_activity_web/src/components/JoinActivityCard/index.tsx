import { useState } from 'react'
import ActivityDetailModal from '../ActivityDetailModal'

export interface JoinActivityData {
  activity_id: string
  activity_title: string
  check_in: boolean
  id: {
    id: string
  }
  index: string
  join_time: string
  name: string
  url: string
}

interface Props {
  joinData: JoinActivityData
}

export default function JoinActivityCard({ joinData }: Props) {
  const [activityDetailModalOpen, setActivityDetailModalOpen] = useState(false)

  const handleActivityDetailModalOpen = () => {
    setActivityDetailModalOpen(true)
  }

  return (
    <>
      <div key={joinData.id.id} onClick={handleActivityDetailModalOpen} className="join-activity-card relative rounded-md shadow-lg shadow-black cursor-pointer">
        <div className="absolute top-4 left-4 text-white text-base">
          #{joinData.index}
        </div>
        <div className="w-full absolute bottom-4 left-4">
          <div className="text-lg font-bold text-white overflow-hidden whitespace-nowrap text-ellipsis" title={joinData.activity_title}>{joinData.activity_title}</div>
          <div className="text-sm text-white">{joinData.join_time}</div>
        </div>
      </div>
      {
        activityDetailModalOpen && 
        <ActivityDetailModal
          activityDetailModalOpen={activityDetailModalOpen}
          setActivityDetailModalOpen={setActivityDetailModalOpen}
          activityId={joinData.activity_id}
        />
      }
    </>
  )
}
