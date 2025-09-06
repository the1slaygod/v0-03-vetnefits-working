import { Suspense } from "react"
import { FaFlask, FaPlus, FaMicroscope, FaClock, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getLabReports, getLabReportStats } from "@/app/actions/lab-reports-actions"
import LabReportsList from "./components/LabReportsList"
import CreateLabReportModal from "./components/CreateLabReportModal"

export default function LabReportsPage({
  searchParams
}: {
  searchParams: { status?: string; type?: string; search?: string }
}) {

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaFlask className="text-blue-600" />
            Lab Reports
          </h1>
          <p className="text-gray-600 mt-1">Manage laboratory tests and results</p>
        </div>
        <CreateLabReportModal />
      </div>

      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search by test name, patient, or lab..."
                  defaultValue={searchParams.search || ""}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select defaultValue={searchParams.status || "all"}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue={searchParams.type || "all"}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Test Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="blood_work">Blood Work</SelectItem>
                  <SelectItem value="urine_analysis">Urine Analysis</SelectItem>
                  <SelectItem value="fecal_exam">Fecal Exam</SelectItem>
                  <SelectItem value="skin_scraping">Skin Scraping</SelectItem>
                  <SelectItem value="biopsy">Biopsy</SelectItem>
                  <SelectItem value="x_ray">X-Ray</SelectItem>
                  <SelectItem value="ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaFlask className="text-blue-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Total</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <LabReportStatsCard type="total" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-yellow-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Pending</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <LabReportStatsCard type="pending" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaMicroscope className="text-orange-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">In Progress</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <LabReportStatsCard type="inProgress" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Completed</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <LabReportStatsCard type="completed" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaFlask className="text-purple-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Today</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <LabReportStatsCard type="today" />
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
                <h3 className="text-sm font-medium text-gray-900">Abnormal</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <LabReportStatsCard type="abnormal" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="abnormal">Abnormal Results</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Suspense fallback={<LabReportsListSkeleton />}>
            <LabReportsList filter="all" />
          </Suspense>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Suspense fallback={<LabReportsListSkeleton />}>
            <LabReportsList filter="pending" />
          </Suspense>
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-6">
          <Suspense fallback={<LabReportsListSkeleton />}>
            <LabReportsList filter="in_progress" />
          </Suspense>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Suspense fallback={<LabReportsListSkeleton />}>
            <LabReportsList filter="completed" />
          </Suspense>
        </TabsContent>

        <TabsContent value="abnormal" className="space-y-6">
          <Suspense fallback={<LabReportsListSkeleton />}>
            <LabReportsList filter="abnormal" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function LabReportStatsCard({ type }: { type: string }) {
  const stats = await getLabReportStats()
  
  const getValue = () => {
    switch (type) {
      case "total":
        return stats.totalReports.toString()
      case "pending":
        return stats.pendingReports.toString()
      case "inProgress":
        return stats.inProgressReports.toString()
      case "completed":
        return stats.completedReports.toString()
      case "today":
        return stats.todayReports.toString()
      case "abnormal":
        return stats.abnormalReports.toString()
      default:
        return "0"
    }
  }

  return <p className="text-2xl font-bold text-gray-900">{getValue()}</p>
}

function LabReportsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
