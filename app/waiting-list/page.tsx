import { Suspense } from "react"
import { FaClock, FaPlus, FaUsers, FaExclamationTriangle, FaPlay, FaChartBar } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getWaitingList, getWaitingListStats } from "@/app/actions/waiting-list-actions"
import WaitingListQueue from "./components/WaitingListQueue"
import AddToWaitingListModal from "./components/AddToWaitingListModal"

export default function WaitingListPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaClock className="text-blue-600" />
            Waiting List
          </h1>
          <p className="text-gray-600 mt-1">Manage patient queue and waiting times</p>
        </div>
        <AddToWaitingListModal />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Waiting</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <WaitingListStatsCard type="waiting" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaPlay className="text-green-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <WaitingListStatsCard type="inProgress" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Urgent</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <WaitingListStatsCard type="urgent" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaChartBar className="text-orange-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Avg Wait</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <WaitingListStatsCard type="avgWait" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="queue">Current Queue</TabsTrigger>
          <TabsTrigger value="completed">Completed Today</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          <Suspense fallback={<WaitingListQueueSkeleton />}>
            <WaitingListQueue filter="active" />
          </Suspense>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Suspense fallback={<WaitingListQueueSkeleton />}>
            <WaitingListQueue filter="completed" />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Waiting List Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <FaChartBar className="mx-auto text-4xl mb-4" />
                <p>Analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function WaitingListStatsCard({ type }: { type: string }) {
  const stats = await getWaitingListStats()
  
  const getValue = () => {
    switch (type) {
      case "waiting":
        return stats.waitingCount.toString()
      case "inProgress":
        return stats.inProgressCount.toString()
      case "urgent":
        return stats.urgentCount.toString()
      case "avgWait":
        return stats.avgWaitTime > 0 ? `${Math.round(stats.avgWaitTime)}min` : "N/A"
      default:
        return "0"
    }
  }

  return <p className="text-2xl font-bold text-gray-900">{getValue()}</p>
}

function WaitingListQueueSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}