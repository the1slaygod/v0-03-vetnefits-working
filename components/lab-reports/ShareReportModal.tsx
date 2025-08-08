"use client"

import { useState } from "react"
import { FaTimes, FaEnvelope, FaWhatsapp, FaLink, FaCopy } from "react-icons/fa"

interface ShareReportModalProps {
  report: any
  onClose: () => void
  onShare: (method: string) => void
}

export default function ShareReportModal({ report, onClose, onShare }: ShareReportModalProps) {
  const [shareMethod, setShareMethod] = useState<"email" | "whatsapp" | "link">("email")
  const [emailData, setEmailData] = useState({
    to: "",
    subject: `Lab Report for ${report.petName}`,
    message: `Dear Pet Owner,

Please find attached the lab report for ${report.petName}.

Test Type: ${report.testType} - ${report.subType}
Date: ${new Date(report.date).toLocaleDateString()}

If you have any questions about the results, please don't hesitate to contact us.

Best regards,
${report.doctorName}
Vetnefits Clinic`,
  })

  const [whatsappData, setWhatsappData] = useState({
    phone: "",
    message: `Hi! Lab report for ${report.petName} is ready. Test: ${report.testType} - ${report.subType}. Date: ${new Date(report.date).toLocaleDateString()}. Please check the attached report. Contact us for any questions. - ${report.doctorName}, Vetnefits Clinic`,
  })

  const [linkCopied, setLinkCopied] = useState(false)
  const shareableLink = `https://vetnefits.com/reports/view/${report.id}?token=secure_token_here`

  const handleEmailShare = () => {
    console.log("Sending email:", emailData)
    onShare("email")
  }

  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(whatsappData.message)
    const whatsappUrl = `https://wa.me/${whatsappData.phone}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
    onShare("whatsapp")
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleLinkShare = () => {
    handleCopyLink()
    onShare("link")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Share Lab Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Report Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Report Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Pet:</span> {report.petName}
              </div>
              <div>
                <span className="font-medium">Owner:</span> {report.ownerName}
              </div>
              <div>
                <span className="font-medium">Test:</span> {report.testType}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(report.date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Share Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose sharing method</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setShareMethod("email")}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  shareMethod === "email" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <FaEnvelope className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Email</p>
              </button>

              <button
                onClick={() => setShareMethod("whatsapp")}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  shareMethod === "whatsapp" ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <FaWhatsapp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">WhatsApp</p>
              </button>

              <button
                onClick={() => setShareMethod("link")}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  shareMethod === "link" ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <FaLink className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Share Link</p>
              </button>
            </div>
          </div>

          {/* Share Forms */}
          {shareMethod === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email *</label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, to: e.target.value }))}
                  placeholder="owner@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleEmailShare}
                disabled={!emailData.to}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <FaEnvelope className="mr-2 h-4 w-4" />
                Send Email
              </button>
            </div>
          )}

          {shareMethod === "whatsapp" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (with country code) *
                </label>
                <input
                  type="tel"
                  value={whatsappData.phone}
                  onChange={(e) => setWhatsappData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={whatsappData.message}
                  onChange={(e) => setWhatsappData((prev) => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleWhatsAppShare}
                disabled={!whatsappData.phone}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <FaWhatsapp className="mr-2 h-4 w-4" />
                Send via WhatsApp
              </button>
            </div>
          )}

          {shareMethod === "link" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shareable Link</label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareableLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg transition-colors ${
                      linkCopied ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaCopy className="h-4 w-4" />
                  </button>
                </div>
                {linkCopied && <p className="text-sm text-green-600 mt-1">Link copied to clipboard!</p>}
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This link will be valid for 30 days and can be accessed without login. The
                  recipient will be able to view and download the report.
                </p>
              </div>

              <button
                onClick={handleLinkShare}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaLink className="mr-2 h-4 w-4" />
                Generate & Copy Link
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
