"use client"

import { Eye, Edit, Heart, User, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PatientRecord, SOAPNote } from "../../app/emr/page"

interface PatientRecordsListProps {
  patients: PatientRecord[]
  onViewEMR: (patient: PatientRecord) => void
  onEditSOAP: (patient: PatientRecord, soap: SOAPNote) => void
  onDeleteSOAP: (patientId: string, soapId: string) => void
}

export default function PatientRecordsList({ patients, onViewEMR, onEditSOAP, onDeleteSOAP }: PatientRecordsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-yellow-100 text-yellow-800"
      case "Deceased":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No patient records found</h3>
        <p className="text-gray-600">No patients match your current filters</p>
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
                Patient Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Visit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Records Summary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-blue-600 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">
                        {patient.species} - {patient.breed}
                      </div>
                      <div className="text-xs text-gray-400">
                        {patient.age} years old, {patient.gender}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-green-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-900">{patient.ownerName}</div>
                      <div className="text-sm text-gray-500">{patient.ownerPhone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-purple-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-900">{new Date(patient.lastVisit).toLocaleDateString()}</div>
                      {patient.nextAppointment && (
                        <div className="text-xs text-gray-500">
                          Next: {new Date(patient.nextAppointment).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>{patient.soapNotes.length} SOAP Notes</div>
                    <div>{patient.vaccinations.length} Vaccinations</div>
                    <div>{patient.labResults.length} Lab Results</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onViewEMR(patient)} title="View Complete EMR">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {patient.soapNotes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSOAP(patient, patient.soapNotes[0])}
                      title="Edit Latest SOAP Note"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
