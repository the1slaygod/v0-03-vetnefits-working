"use client"

import { FaEye, FaDownload, FaShare, FaFileAlt, FaFlask, FaImage } from "react-icons/fa"

interface Report {
  id: string
  petName: string
  ownerName: string
  testType: string
  subType: string
  date: string
  status: string
  reportType: string
  doctorName: string
  shared: boolean
  sharedVia: string[]
}

interface ReportsListProps {
  reports: Report[]
  onViewReport: (report: Report) => void
  onShareReport: (report: Report) => void
  onDownloadReport: (report: Report) => void
}

export default function ReportsList({ reports, onViewReport, onShareReport, onDownloadReport }: ReportsListProps) {
  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case "Blood Test":
        return <FaFlask className="h-5 w-5 text-red-500" />
      case "Urine Test":
        return <FaFlask className="h-5 w-5 text-yellow-500" />
      case "Imaging":
        return <FaImage className="h-5 w-5 text-blue-500" />
      default:
        return <FaFileAlt className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
        <p className="text-gray-500">No lab reports match your current filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Lab Reports ({reports.length})</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {reports.map((report) => (
          <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">{getTestTypeIcon(report.testType)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{report.petName}</h4>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </span>
                    {report.shared && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Shared
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Owner: {report.ownerName}</span>
                    <span>•</span>
                    <span>
                      {report.testType} - {report.subType}
                    </span>
                    <span>•</span>
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{report.doctorName}</span>
                  </div>

                  {report.shared && report.sharedVia.length > 0 && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Shared via:</span>
                      {report.sharedVia.map((method, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewReport(report)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaEye className="mr-2 h-4 w-4" />
                  View
                </button>

                <button
                  onClick={() => onDownloadReport(report)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaDownload className="mr-2 h-4 w-4" />
                  Download
                </button>

                <button
                  onClick={() => onShareReport(report)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaShare className="mr-2 h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
