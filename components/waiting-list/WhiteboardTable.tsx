"use client"

import { useState, useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Clock, Eye, EyeOff } from "lucide-react"
import type { WhiteboardRow } from "@/lib/types/whiteboard"
import { StatusMenu } from "./StatusMenu"
import { PhotoUploadCell } from "./PhotoUploadCell"
import { TimerCell } from "./TimerCell"

interface WhiteboardTableProps {
  data: WhiteboardRow[]
  onStatusUpdate: (id: string, status: string) => void
  onPhotoUpdate: (id: string, fileUrl: string) => void
}

export function WhiteboardTable({
  data,
  onStatusUpdate,
  onPhotoUpdate,
}: WhiteboardTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [showColumnToggle, setShowColumnToggle] = useState(false)

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "attending":
        return "bg-red-100 text-red-800 border-red-300"
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "no_show":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Helper function to check if appointment is imminent (within 5 minutes)
  const isImminent = (apptTimeISO: string) => {
    const apptTime = new Date(apptTimeISO).getTime()
    const now = Date.now()
    const diffMinutes = (apptTime - now) / (1000 * 60)
    return Math.abs(diffMinutes) <= 5
  }

  // Define table columns
  const columns: ColumnDef<WhiteboardRow>[] = useMemo(
    () => [
      {
        accessorKey: "sno",
        header: "S.No",
        cell: ({ row }) => (
          <div className="text-center font-medium text-sm">
            {row.original.sno}
          </div>
        ),
        size: 60,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusMenu
            currentStatus={row.original.status}
            onStatusChange={(status) => onStatusUpdate(row.original.id, status)}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "apptTimeISO",
        header: "Appt Time",
        cell: ({ row }) => {
          const apptTime = new Date(row.original.apptTimeISO)
          const timeString = apptTime.toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit" 
          })
          const isUrgent = isImminent(row.original.apptTimeISO)
          
          return (
            <div className="flex items-center gap-2">
              {isUrgent && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
              <span className={`text-sm font-medium ${isUrgent ? "text-red-600" : ""}`}>
                {timeString}
              </span>
            </div>
          )
        },
        size: 100,
      },
      {
        accessorKey: "checkedInAtISO",
        header: "Checked In",
        cell: ({ row }) => {
          const checkedIn = row.original.checkedInAtISO
          return (
            <div className="text-sm text-center">
              {checkedIn ? (
                new Date(checkedIn).toLocaleTimeString([], { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                })
              ) : (
                <span className="text-muted-foreground">--</span>
              )}
            </div>
          )
        },
        size: 100,
      },
      {
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => (
          <div className="font-medium text-sm text-blue-600 hover:underline cursor-pointer">
            {row.original.client}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "patient",
        header: "Patient",
        cell: ({ row }) => (
          <div className="font-medium text-sm text-blue-600 hover:underline cursor-pointer">
            {row.original.patient}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "photoUrl",
        header: "Photo",
        cell: ({ row }) => (
          <PhotoUploadCell
            currentPhotoUrl={row.original.photoUrl}
            onPhotoUpdate={(url) => onPhotoUpdate(row.original.id, url)}
          />
        ),
        size: 80,
      },
      {
        accessorKey: "apptType",
        header: "Appt Type",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.apptType}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: "confirmed",
        header: "Confirmed",
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.confirmed ? (
              <Badge className="bg-green-100 text-green-800 text-xs">Yes</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">No</Badge>
            )}
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "complaint",
        header: "Complaint",
        cell: ({ row }) => {
          const complaint = row.original.complaint || ""
          const truncated = complaint.length > 50 ? complaint.substring(0, 50) + "..." : complaint
          
          return (
            <div 
              className="text-sm max-w-[200px]" 
              title={complaint}
            >
              {truncated || <span className="text-muted-foreground">--</span>}
            </div>
          )
        },
        size: 200,
      },
      {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => (
          <div className="text-sm font-medium">
            {row.original.provider || <span className="text-muted-foreground">--</span>}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: "createdBy",
        header: "Created By",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.createdBy || "--"}
          </div>
        ),
        size: 100,
      },
      {
        id: "waitingTime",
        header: "Waiting Time",
        cell: ({ row }) => (
          <TimerCell
            type="waiting"
            checkedInAt={row.original.checkedInAtISO}
            attendingAt={row.original.attendingAtISO}
            completedAt={row.original.completedAtISO}
          />
        ),
        size: 100,
      },
      {
        id: "turnaroundTime",
        header: "Turn Around Time",
        cell: ({ row }) => (
          <TimerCell
            type="turnaround"
            checkedInAt={row.original.checkedInAtISO}
            attendingAt={row.original.attendingAtISO}
            completedAt={row.original.completedAtISO}
          />
        ),
        size: 120,
      },
      {
        accessorKey: "invoices",
        header: "Today's Invoices",
        cell: ({ row }) => (
          <div className="text-center">
            {row.original.invoices ? (
              <span className="text-blue-600 hover:underline cursor-pointer text-sm">
                {row.original.invoices}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">0.00</span>
            )}
          </div>
        ),
        size: 120,
      },
      {
        id: "activePlan",
        header: "Active Plan",
        cell: () => (
          <div className="text-center text-muted-foreground text-sm">--</div>
        ),
        size: 100,
      },
      {
        id: "cart",
        header: "Cart",
        cell: () => (
          <div className="text-center text-muted-foreground text-sm">--</div>
        ),
        size: 80,
      },
      {
        id: "openInvoices",
        header: "Open Invoices",
        cell: () => (
          <div className="text-center text-muted-foreground text-sm">0.00</div>
        ),
        size: 120,
      },
      {
        id: "readyForInvoice",
        header: "Ready For Invoice",
        cell: () => (
          <div className="text-center text-muted-foreground text-sm">0.00</div>
        ),
        size: 140,
      },
    ],
    [onStatusUpdate, onPhotoUpdate]
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
    },
  })

  return (
    <div className="relative">
      {/* Column Visibility Toggle */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowColumnToggle(!showColumnToggle)}
          className="bg-background"
        >
          {showColumnToggle ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        
        {showColumnToggle && (
          <div className="absolute right-0 mt-2 p-4 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <div key={column.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={(e) => column.toggleVisibility(e.target.checked)}
                        className="rounded"
                      />
                      <label className="text-sm font-medium leading-none">
                        {typeof column.columnDef.header === "string" 
                          ? column.columnDef.header 
                          : column.id
                        }
                      </label>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-background border-b-2 border-border z-20">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border bg-muted/50"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`hover:bg-muted/50 transition-colors ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-2 py-2 text-sm border-r border-border"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No appointments found for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}