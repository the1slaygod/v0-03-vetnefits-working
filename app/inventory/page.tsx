import { Suspense } from "react"
import InventoryClient from "./inventory-client"
import { getAllInventoryItems } from "../actions/inventory-actions"

export default async function InventoryPage() {
  const inventory = await getAllInventoryItems()

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading inventory...</div>}>
        <InventoryClient initialInventory={inventory} />
      </Suspense>
    </div>
  )
}