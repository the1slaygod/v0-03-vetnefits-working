"use client"

import { useState } from "react"
import Link from "next/link"
import { FaPlus, FaSearch, FaFilter, FaPaw, FaEdit, FaDog, FaCat } from "react-icons/fa"
import { PatientWithPets } from "../actions/patient-actions"

interface PatientsClientProps {
  initialPatients: PatientWithPets[]
}

export default function PatientsClient({ initialPatients }: PatientsClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)

  // Flatten patients with pets for easier filtering
  const allPets = initialPatients.flatMap(patient => 
    patient.pets.map(pet => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "Unknown",
      age: pet.age || 0,
      gender: pet.gender || "Unknown",
      ownerName: patient.name,
      ownerPhone: patient.phone || "",
      ownerEmail: patient.email || "",
      photoURL: pet.photo,
      status: "active" as const
    }))
  )

  const filteredPets = allPets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecies = speciesFilter === "all" || pet.species.toLowerCase() === speciesFilter

    return matchesSearch && matchesSpecies
  })

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case "dog":
        return <FaDog className="text-blue-500" />
      case "cat":
        return <FaCat className="text-orange-500" />
      default:
        return <FaPaw className="text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">Manage your clinic's patients and their pets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus />
          Add Patient
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FaPaw className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{allPets.length}</h3>
              <p className="text-gray-600">Total Pets</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FaDog className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {allPets.filter(pet => pet.species.toLowerCase() === 'dog').length}
              </h3>
              <p className="text-gray-600">Dogs</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FaCat className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {allPets.filter(pet => pet.species.toLowerCase() === 'cat').length}
              </h3>
              <p className="text-gray-600">Cats</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <FaPaw className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{initialPatients.length}</h3>
              <p className="text-gray-600">Owners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by pet name, owner, or breed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Species</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredPets.length} of {allPets.length} pets
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    {pet.photoURL ? (
                      <img
                        src={pet.photoURL || "/placeholder.svg"}
                        alt={pet.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      getSpeciesIcon(pet.species)
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-600">{pet.breed}</p>
                  </div>
                </div>
                <Link href={`/patients/${pet.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                  <FaEdit className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Species:</span>
                  <span className="font-medium">{pet.species}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{pet.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{pet.gender}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900">{pet.ownerName}</p>
                <p className="text-sm text-gray-600">{pet.ownerPhone}</p>
                <p className="text-sm text-gray-600">{pet.ownerEmail}</p>
              </div>

              <div className="mt-4">
                <Link
                  href={`/patients/${pet.id}`}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPets.length === 0 && (
        <div className="text-center py-12">
          <FaPaw className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No pets found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || speciesFilter !== "all" 
              ? "Try adjusting your search criteria." 
              : "Get started by adding your first patient."}
          </p>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Patient</h2>
            <p className="text-gray-600 mb-4">Patient creation functionality coming soon...</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}