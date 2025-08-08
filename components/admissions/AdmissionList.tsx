"use client"

import { FaEye, FaSignOutAlt, FaBed, FaUser, FaPaw, FaClock } from "react-icons/fa"
import type { Admission, Room } from "../../app/admissions/page"

interface AdmissionListProps {
  admissions: Admission[]
  rooms: Room[]
  onViewTimeline: (admission: Admission) => void
  onDischarge: (admission: Admission) => void
}

export default function AdmissionList({ admissions, rooms, onViewTimeline, onDischarge }: AdmissionListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Discharged":
        return "bg-gray-100 text-gray-800"
      case "Transferred":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoomInfo = (roomNumber: string) => {
    return rooms.find((r) => r.number === roomNumber)
  }

  const calculateStayDuration = (admissionDate: string, dischargeDate?: string) => {
    const start = new Date(admissionDate)
    const end = dischargeDate ? new Date(dischargeDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (admissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <FaBed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No admissions found</h3>
        <p className="text-gray-600">No admissions match your current filters</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pet & Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room & Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admission Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stay Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bill Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admissions.map((admission) => {
              const roomInfo = getRoomInfo(admission.roomNumber)
              const stayDuration = calculateStayDuration(admission.admissionDate, admission.actualDischarge)

              return (
                <tr key={admission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaPaw className="h-4 w-4 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{admission.petName}</div>
                        <div className="text-sm text-gray-500">
                          {admission.petType} - {admission.petBreed}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <FaUser className="h-3 w-3 mr-1" />
                          {admission.ownerName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <FaBed className="h-4 w-4 text-green-600 mr-2" />
                        {admission.roomNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {roomInfo?.type} - ${roomInfo?.dailyRate}/day
                      </div>
                      <div className="text-xs text-gray-400">{admission.doctorName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">
                        {new Date(admission.admissionDate).toLocaleDateString()} at {admission.admissionTime}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{admission.reason}</div>
                      {admission.estimatedDischarge && (
                        <div className="text-xs text-gray-400 mt-1">
                          Est. discharge: {new Date(admission.estimatedDischarge).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FaClock className="h-4 w-4 text-gray-400 mr-2" />
                      {stayDuration} {stayDuration === 1 ? "day" : "days"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${admission.totalBill.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{admission.treatments.length} treatments</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(admission.status)}`}>
                      {admission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onViewTimeline(admission)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View Timeline"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    {admission.status === "Active" && (
                      <button
                        onClick={() => onDischarge(admission)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Discharge"
                      >
                        <FaSignOutAlt className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
