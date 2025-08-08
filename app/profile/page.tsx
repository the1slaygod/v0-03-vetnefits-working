"use client"

import type React from "react"

import { useState } from "react"
import Sidebar from "../../components/Sidebar"
import { FaCamera, FaSave, FaEdit } from "react-icons/fa"

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "Suyash Pets Clinic",
    email: "dr.smith@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    setTimeout(() => {
      setSaving(false)
      setIsEditing(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
              <p className="text-gray-600 mt-2">Manage your clinic information and account settings</p>
            </div>
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave()
                } else {
                  setIsEditing(true)
                }
              }}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              {saving ? (
                "Saving..."
              ) : isEditing ? (
                <>
                  <FaSave className="mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <FaEdit className="mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clinic Logo */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinic Logo</h2>
                <div className="text-center">
                  <div className="h-32 w-32 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl font-bold text-blue-600">{formData.name?.charAt(0) || "C"}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center mx-auto">
                    <FaCamera className="mr-2" />
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>

            {/* Clinic Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Clinic Information</h2>

                <div className="space-y-6">
                  <div>
                    <label className="form-label">Clinic Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Address</label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        className="form-input"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.address || "No address provided"}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Change Password</p>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Change</button>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Enable</button>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-gray-900">Account Data</p>
                      <p className="text-sm text-gray-600">Download or delete your account data</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Manage</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
