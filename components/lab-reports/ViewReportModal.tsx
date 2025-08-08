"use client"

import { FaTimes, FaDownload, FaPrint, FaFileAlt } from "react-icons/fa"

interface ViewReportModalProps {
  report: any
  onClose: () => void
}

export default function ViewReportModal({ report, onClose }: ViewReportModalProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Simulate PDF download
    const link = document.createElement("a")
    link.href = `/api/reports/${report.id}/download`
    link.download = `${report.petName}_${report.testType}_${report.date}.pdf`
    link.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600 bg-green-100"
      case "abnormal":
        return "text-yellow-600 bg-yellow-100"
      case "critical":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lab Report Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Print Report"
            >
              <FaPrint className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Download PDF"
            >
              <FaDownload className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Report Header */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Vetnefits Clinic</h3>
                <p className="text-gray-600">123 Veterinary Street, Pet City, PC 12345</p>
                <p className="text-gray-600">Phone: (555) 123-4567 | Email: info@vetnefits.com</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Report ID: {report.id}</p>
                <p className="text-sm text-gray-600">Date: {new Date(report.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                <p>
                  <span className="font-medium">Pet Name:</span> {report.petName}
                </p>
                <p>
                  <span className="font-medium">Owner:</span> {report.ownerName}
                </p>
                <p>
                  <span className="font-medium">Pet ID:</span> {report.petId}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Test Information</h4>
                <p>
                  <span className="font-medium">Test Type:</span> {report.testType}
                </p>
                <p>
                  <span className="font-medium">Sub Type:</span> {report.subType}
                </p>
                <p>
                  <span className="font-medium">Doctor:</span> {report.doctorName}
                </p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          {report.reportType === "structured" && report.results ? (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parameter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(report.results).map(([key, result]: [string, any]) => (
                      <tr key={key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.range}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}
                          >
                            {result.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Report</h4>
              <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">{report.fileName || "Report file"}</p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaDownload className="mr-2 h-4 w-4" />
                    Download File
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {report.notes && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{report.notes}</p>
              </div>
            </div>
          )}

          {/* Doctor Signature */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600">Reviewed by:</p>
                <p className="text-lg font-semibold text-gray-900">{report.doctorName}</p>
                <p className="text-sm text-gray-500">Veterinarian</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Date: {new Date(report.date).toLocaleDateString()}</p>
                <div className="mt-2 p-2 border border-gray-300 rounded">
                  <p className="text-xs text-gray-500">Digital Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
