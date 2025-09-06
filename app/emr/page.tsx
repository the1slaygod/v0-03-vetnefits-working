import { Suspense } from "react"
import { FaFileMedical, FaPlus, FaUser, FaPaw, FaCalendarAlt, FaSearch, FaFilter, FaFileAlt } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getEMRRecords } from "@/app/actions/emr-actions"
import EMRRecordsList from "./components/EMRRecordsList"
import CreateEMRModal from "./components/CreateEMRModal"

export default function EMRPage({
  searchParams
}: {
  searchParams: { patient?: string; pet?: string; search?: string }
}) {

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaFileMedical className="text-blue-600" />
            Electronic Medical Records
          </h1>
          <p className="text-gray-600 mt-1">Manage patient medical records and SOAP notes</p>
        </div>
        <CreateEMRModal />
      </div>

      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by patient name, pet name, diagnosis..."
                  className="pl-10"
                  defaultValue={searchParams.search || ""}
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <FaFilter />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaFileAlt className="text-blue-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Records</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <EMRStatsCard type="total" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-green-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Today's Records</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <EMRStatsCard type="today" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaUser className="text-orange-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Follow-ups Due</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <EMRStatsCard type="followups" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaPaw className="text-purple-600 text-lg" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Patients</h3>
                <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
                  <EMRStatsCard type="patients" />
                </Suspense>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="followup">Follow-up Due</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Suspense fallback={<EMRRecordsListSkeleton />}>
            <EMRRecordsList filter="all" />
          </Suspense>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Suspense fallback={<EMRRecordsListSkeleton />}>
            <EMRRecordsList filter="recent" />
          </Suspense>
        </TabsContent>

        <TabsContent value="followup" className="space-y-6">
          <Suspense fallback={<EMRRecordsListSkeleton />}>
            <EMRRecordsList filter="followup" />
          </Suspense>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Suspense fallback={<EMRRecordsListSkeleton />}>
            <EMRRecordsList filter="pending" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function EMRStatsCard({ type }: { type: string }) {
  const records = await getEMRRecords()
  
  const getStats = () => {
    const today = new Date().toDateString()
    
    switch (type) {
      case "total":
        return records.length.toString()
      case "today":
        return records.filter(r => new Date(r.visit_date).toDateString() === today).length.toString()
      case "followups":
        const followupDue = records.filter(r => {
          if (!r.follow_up_required || !r.follow_up_date) return false
          return new Date(r.follow_up_date) <= new Date()
        }).length
        return followupDue.toString()
      case "patients":
        const uniquePatients = new Set(records.map(r => r.patient_id))
        return uniquePatients.size.toString()
      default:
        return "0"
    }
  }

  return <p className="text-2xl font-bold text-gray-900">{getStats()}</p>
}

function EMRRecordsListSkeleton() {
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
