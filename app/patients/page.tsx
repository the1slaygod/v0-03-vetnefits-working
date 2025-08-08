"use client"

import { useState } from "react"
import Link from "next/link"
import { FaPlus, FaSearch, FaFilter, FaPaw, FaEdit } from "react-icons/fa"

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age: number
  gender: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  photoURL?: string
  status: "active" | "inactive"
}

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)

  const pets: Pet[] = [
    {
      id: "1",
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      age: 3,
      gender: "Male",
      ownerName: "John Smith",
      ownerPhone: "+1 (555) 123-4567",
      ownerEmail: "john@example.com",
      status: "active",
    },
    {
      id: "2",
      name: "Whiskers",
      species: "Cat",
      breed: "Persian",
      age: 5,
      gender: "Female",
      ownerName: "Sarah Johnson",
      ownerPhone: "+1 (555) 987-6543",
      ownerEmail: "sarah@example.com",
      status: "active",
    },
    {
      id: "3",
      name: "Max",
      species: "Dog",
      breed: "German Shepherd",
      age: 7,
      gender: "Male",
      ownerName: "Mike Davis",
      ownerPhone: "+1 (555) 456-7890",
      ownerEmail: "mike@example.com",
      status: "active",
    },
    {
      id: "4",
      name: "Luna",
      species: "Cat",
      breed: "Siamese",
      age: 2,
      gender: "Female",
      ownerName: "Emily Wilson",
      ownerPhone: "+1 (555) 321-0987",
      ownerEmail: "emily@example.com",
      status: "active",
    },
    {
      id: "5",
      name: "Charlie",
      species: "Dog",
      breed: "Labrador",
      age: 4,
      gender: "Male",
      ownerName: "Robert Brown",
      ownerPhone: "+1 (555) 654-3210",
      ownerEmail: "robert@example.com",
      status: "active",
    },
    {
      id: "6",
      name: "Bella",
      species: "Cat",
      breed: "Maine Coon",
      age: 6,
      gender: "Female",
      ownerName: "Lisa Garcia",
      ownerPhone: "+1 (555) 789-0123",
      ownerEmail: "lisa@example.com",
      status: "active",
    },
  ]

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecies = speciesFilter === "all" || pet.species.toLowerCase() === speciesFilter

    return matchesSearch && matchesSpecies
  })

  const getSpeciesIcon = (species: string) => {
    return species.toLowerCase() === "dog" ? "🐕" : species.toLowerCase() === "cat" ? "🐱" : "🐾"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-2">Manage your clinic's patient records</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New Patient
        </button>
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
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Species</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="bird">Birds</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
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
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPets.length === 0 && (
        <div className="text-center py-12">
          <FaPaw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || speciesFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first patient"}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Patient
          </button>
        </div>
      )}
    </div>
  )
}
