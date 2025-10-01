import { Backpack, Coins } from "lucide-react";

interface InventoryItem {
  itemName: string;
  quantity: number;
  description?: string;
  reason?: string;
}

interface InventoryPanelProps {
  inventory: InventoryItem[];
  gold: number;
}

export function InventoryPanel({ inventory, gold }: InventoryPanelProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 p-3 rounded-lg border border-emerald-300 dark:border-emerald-600 flex-1">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Backpack size={18} /> Inventory
        </h4>
        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
          <Coins size={16} />
          <span>{gold}</span>
        </div>
      </div>
      <div className="overflow-y-auto space-y-2" style={{ maxHeight: "calc(50vh - 200px)" }}>
        {inventory.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">Your inventory is empty...</p>
        ) : (
          inventory.map((item) => (
            <div
              key={item.itemName}
              className="bg-white dark:bg-slate-700 p-2 rounded border border-emerald-200 dark:border-emerald-700">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">{item.itemName}</span>
                {item.quantity > 1 && (
                  <span className="text-xs bg-emerald-200 dark:bg-emerald-700 px-1 rounded">{item.quantity}</span>
                )}
              </div>
              {item.description && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>}
              {item.reason && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 italic">Found: {item.reason}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
