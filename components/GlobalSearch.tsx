"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { FaSearch, FaTimes, FaUser, FaCalendarAlt, FaBoxes, FaFileInvoice, FaSpinner } from "react-icons/fa"
import { globalSearch, SearchResult } from "@/app/actions/search-actions"

export default function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true)
        try {
          const searchResults = await globalSearch(query)
          setResults(searchResults)
          setSelectedIndex(-1)
        } catch (error) {
          console.error("Search error:", error)
          setResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
        setSelectedIndex(-1)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "patient":
        return <FaUser className="text-blue-500" />
      case "appointment":
        return <FaCalendarAlt className="text-green-500" />
      case "inventory":
        return <FaBoxes className="text-orange-500" />
      case "billing":
        return <FaFileInvoice className="text-purple-500" />
      default:
        return <FaSearch className="text-gray-500" />
    }
  }

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "patient":
        return "Patient"
      case "appointment":
        return "Appointment"
      case "inventory":
        return "Inventory"
      case "billing":
        return "Billing"
      case "emr":
        return "Medical Record"
      case "admission":
        return "Admission"
      default:
        return ""
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search patients, appointments, inventory..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center">
              <FaSpinner className="animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Searching...</p>
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm">No results found for "{query}"</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 font-medium">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
              </div>
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-50 last:border-b-0 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {result.subtitle}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}