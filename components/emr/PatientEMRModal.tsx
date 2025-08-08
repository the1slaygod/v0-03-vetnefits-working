"use client"

import { useState } from "react"
import { X, Edit, Trash2, FileText, Syringe, TestTube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PatientRecord, SOAPNote } from "../../app/emr/page"

interface PatientEMRModalProps {
  patient: PatientRecord
  onClose: () => void
  onEditSOAP: (patient: PatientRecord, soap: SOAPNote) => void
  onDeleteSOAP: (patientId: string, soapId: string) => void
}

export default function PatientEMRModal({ patient, onClose, onEditSOAP, onDeleteSOAP }: PatientEMRModalProps) {
  const [activeTab, setActiveTab] = useState("soap")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800"
      case "Abnormal":
        return "bg-red-100 text-red-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold">{patient.name} - Complete EMR</h2>
            <p className="text-gray-600">
              {patient.species} • {patient.breed} • {patient.age} years old • {patient.gender}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Patient Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Owner Information</h3>
                <p className="text-sm text-gray-600">{patient.ownerName}</p>
                <p className="text-sm text-gray-600">{patient.ownerPhone}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Medical Info</h3>
                <p className="text-sm text-gray-600">Allergies: {patient.allergies || "None"}</p>
                <p className="text-sm text-gray-600">Conditions: {patient.chronicConditions || "None"}</p>
                <p className="text-sm text-gray-600">Medications: {patient.currentMedications || "None"}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Status</h3>
                <Badge
                  className={`${patient.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {patient.status}
                </Badge>
                {patient.microchipId && <p className="text-sm text-gray-600 mt-1">Chip: {patient.microchipId}</p>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="soap" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                SOAP Notes ({patient.soapNotes.length})
              </TabsTrigger>
              <TabsTrigger value="vaccinations" className="flex items-center">
                <Syringe className="mr-2 h-4 w-4" />
                Vaccinations ({patient.vaccinations.length})
              </TabsTrigger>
              <TabsTrigger value="labs" className="flex items-center">
                <TestTube className="mr-2 h-4 w-4" />
                Lab Results ({patient.labResults.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="soap" className="mt-6">
              <div className="space-y-4">
                {patient.soapNotes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No SOAP notes recorded</p>
                ) : (
                  patient.soapNotes.map((soap) => (
                    <div key={soap.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">
                            {new Date(soap.date).toLocaleDateString()} at {soap.time}
                          </h4>
                          <p className="text-sm text-gray-600">Dr. {soap.doctorName}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => onEditSOAP(patient, soap)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDeleteSOAP(patient.id, soap.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-gray-900">Subjective</h5>
                          <p className="text-gray-600">{soap.subjective}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Objective</h5>
                          <p className="text-gray-600">{soap.objective}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Assessment</h5>
                          <p className="text-gray-600">{soap.assessment}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Plan</h5>
                          <p className="text-gray-600">{soap.plan}</p>
                        </div>
                      </div>
                      {soap.followUpRequired && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded">
                          <p className="text-sm text-yellow-800">
                            Follow-up required
                            {soap.followUpDate && ` on ${new Date(soap.followUpDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="vaccinations" className="mt-6">
              <div className="space-y-4">
                {patient.vaccinations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No vaccinations recorded</p>
                ) : (
                  patient.vaccinations.map((vacc) => (
                    <div key={vacc.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{vacc.vaccineName}</h4>
                          <p className="text-sm text-gray-600">
                            Administered: {new Date(vacc.dateAdministered).toLocaleDateString()}
                          </p>
                        </div>
                        {vacc.nextDueDate && (
                          <Badge variant="outline">Next due: {new Date(vacc.nextDueDate).toLocaleDateString()}</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-gray-900">Manufacturer</h5>
                          <p className="text-gray-600">{vacc.manufacturer}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Lot Number</h5>
                          <p className="text-gray-600">{vacc.lotNumber}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Doctor</h5>
                          <p className="text-gray-600">{vacc.doctorName}</p>
                        </div>
                      </div>
                      {vacc.reactions && (
                        <div className="mt-3">
                          <h5 className="font-medium text-gray-900">Reactions</h5>
                          <p className="text-gray-600">{vacc.reactions}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="labs" className="mt-6">
              <div className="space-y-4">
                {patient.labResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No lab results recorded</p>
                ) : (
                  patient.labResults.map((lab) => (
                    <div key={lab.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{lab.testName}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(lab.testDate).toLocaleDateString()} • {lab.doctorName}
                          </p>
                        </div>
                        <Badge className={getStatusColor(lab.status)}>{lab.status}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-gray-900">Results</h5>
                          <p className="text-gray-600">{lab.results}</p>
                        </div>
                        {lab.normalRange && (
                          <div>
                            <h5 className="font-medium text-gray-900">Normal Range</h5>
                            <p className="text-gray-600">{lab.normalRange}</p>
                          </div>
                        )}
                      </div>
                      {lab.notes && (
                        <div className="mt-3">
                          <h5 className="font-medium text-gray-900">Notes</h5>
                          <p className="text-gray-600">{lab.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
