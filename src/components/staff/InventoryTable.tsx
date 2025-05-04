// // components/staff/InventoryTable.tsx
// import React, { useState } from 'react';
// import type { Inventory } from '../../generated/prisma';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
// import { Card, CardHeader, CardTitle, CardContent, } from '@/components/ui/card';
// import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
// import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
// import { PackageSearch, Filter as FilterIcon, ArrowUpDown, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
// import { cn } from '@/lib/utils';

// export interface InventoryRow {
//     inventory_id: string;
//     variant_id: string;
//     product_id: string;
//     quantity: number;
//     status: Inventory['status'];
//     last_updated: string;
//   }
  
//   interface Props {
//     initialData: InventoryRow[];
//   }
  
//   export default function InventoryTable({ initialData }: Props) {
//     // Local state
//     const [data, setData] = useState<InventoryRow[]>(initialData);
//     const [loadingRow, setLoadingRow] = useState<string | null>(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState<
//       InventoryRow['status'] | 'all'
//     >('all');
//     const [sortField, setSortField] = useState<keyof InventoryRow>(
//       'last_updated'
//     );
//     const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
//       'desc'
//     );
  
//     // Push updates to API
//     const onUpdate = async (
//       id: string,
//       patch: Partial<Pick<InventoryRow, 'quantity' | 'status'>>
//     ) => {
//       setLoadingRow(id);
//       const res = await fetch(`/api/inventory/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(patch),
//       });
//       const json = await res.json();
//       if (res.ok && json.success) {
//         setData((d) =>
//           d.map((r) => (r.inventory_id === id ? { ...r, ...json.row } : r))
//         );
//       } else {
//         alert(json.error || 'Update failed');
//       }
//       setLoadingRow(null);
//     };
  
//     // Filter & sort
//     const filtered = data.filter((r) => {
//       const textMatch = [r.variant_id, r.product_id].some((f) =>
//         f.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       const statusMatch =
//         statusFilter === 'all' || r.status === statusFilter;
//       return textMatch && statusMatch;
//     });
  
//     const sorted = [...filtered].sort((a, b) => {
//       if (sortField === 'quantity') {
//         return sortDirection === 'asc'
//           ? a.quantity - b.quantity
//           : b.quantity - a.quantity;
//       }
//       if (sortField === 'last_updated') {
//         return sortDirection === 'asc'
//           ? new Date(a.last_updated).getTime() -
//               new Date(b.last_updated).getTime()
//           : new Date(b.last_updated).getTime() -
//               new Date(a.last_updated).getTime();
//       }
//       const va = String(a[sortField]),
//         vb = String(b[sortField]);
//       return sortDirection === 'asc'
//         ? va.localeCompare(vb)
//         : vb.localeCompare(va);
//     });
  
//     const toggleSort = (field: keyof InventoryRow) => {
//       if (sortField === field) {
//         setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
//       } else {
//         setSortField(field);
//         setSortDirection('desc');
//       }
//     };
  
//     const SortIcon = ({ field }: { field: keyof InventoryRow }) =>
//       sortField === field ? (
//         sortDirection === 'asc' ? (
//           <ChevronUp className="ml-1 h-4 w-4" />
//         ) : (
//           <ChevronDown className="ml-1 h-4 w-4" />
//         )
//       ) : (
//         <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
//       );
  
//     return (
//       <Card className="shadow-sm">
//         <CardHeader className="pb-2">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <PackageSearch className="h-5 w-5 text-primary" />
//               <CardTitle className="text-lg">Inventory</CardTitle>
//             </div>
//             <div className="text-sm text-muted-foreground">
//               Synced {new Date().toLocaleString('en-GB')}
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {/* Filters */}
//           <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
//             <Input
//               placeholder="Search by variant or product ID..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="flex-1"
//             />
//             <div className="flex items-center space-x-2 mt-2 sm:mt-0">
//               <FilterIcon className="h-5 w-5 text-muted-foreground" />
//               <Select
//                 value={statusFilter}
//                 onValueChange={(v) => setStatusFilter(v as any)}
//               >
//                 <SelectTrigger className="w-[160px]">
//                   <SelectValue placeholder="All statuses" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All statuses</SelectItem>
//                   <SelectItem value="available">Available</SelectItem>
//                   <SelectItem value="unavailable">Unavailable</SelectItem>
//                   <SelectItem value="discontinued">Discontinued</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
  
//           {/* Table */}
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-muted/50">
//                 <TableHead
//                   onClick={() => toggleSort('variant_id')}
//                   className="cursor-pointer"
//                 >
//                   <div className="flex font-semibold items-center text-stone-800">
//                     Variant ID<SortIcon field="variant_id" />
//                   </div>
//                 </TableHead>
//                 <TableHead
//                   onClick={() => toggleSort('product_id')}
//                   className="cursor-pointer"
//                 >
//                   <div className="flex font-semibold items-center text-stone-800">
//                     Product ID<SortIcon field="product_id" />
//                   </div>
//                 </TableHead>
//                 <TableHead
//                   onClick={() => toggleSort('quantity')}
//                   className="cursor-pointer text-right"
//                 >
//                   <div className="flex justify-end items-center text-stone-900 font-semibold">
//                     Qty<SortIcon field="quantity" />
//                   </div>
//                 </TableHead>
//                 <TableHead
//                   onClick={() => toggleSort('status')}
//                   className="cursor-pointer text-center"
//                 >
//                   <div className="flex justify-center items-center text-stone-900 font-semibold">
//                     Status<SortIcon field="status" />
//                   </div>
//                 </TableHead>
//                 <TableHead
//                   onClick={() => toggleSort('last_updated')}
//                   className="cursor-pointer"
//                 >
//                   <div className="flex items-center text-stone-900 font-semibold">
//                     Last Updated<SortIcon field="last_updated" />
//                   </div>
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {sorted.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center py-8">
//                     No items
//                   </TableCell>
//                 </TableRow>
//               )}
//               {sorted.map((row) => {
//                 const loading = loadingRow === row.inventory_id;
  
//                 // determine badge style
//                 const isCritical = row.quantity <= 3;
//                 const isLow = row.quantity > 3 && row.quantity < 10;
//                 const badgeVariant = isCritical ? 'destructive' : 'default';
//                 const badgeClass = cn(
//                   loading ? 'opacity-60' : '',
//                   isCritical
//                     ? ''
//                     : isLow
//                     ? 'bg-amber-100 text-amber-800'
//                     : 'bg-green-100 text-green-800'
//                 );
  
//                 return (
//                   <TableRow
//                     key={row.inventory_id}
//                     className={cn(
//                       isCritical
//                         ? 'bg-destructive/10'
//                         : isLow
//                         ? 'bg-warning/10'
//                         : '',
//                       loading ? 'opacity-60' : ''
//                     )}
//                   >
//                     <TableCell className="font-mono text-xs break-all">
//                       {row.variant_id}
//                     </TableCell>
//                     <TableCell className="font-mono text-xs break-all">
//                       {row.product_id}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end space-x-2">
//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <Badge
//                                 variant={badgeVariant}
//                                 className={cn(badgeClass, 'h-6 w-6 p-0')}
//                               >
//                                 {isCritical && (
//                                   <AlertCircle className="h-3 w-3" />
//                                 )}
//                               </Badge>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                               {isCritical
//                                 ? 'Critical'
//                                 : isLow
//                                 ? 'Low stock'
//                                 : 'In stock'}
//                             </TooltipContent>
//                           </Tooltip>
//                         </TooltipProvider>
//                         <Input
//                           type="number"
//                           min={0}
//                           value={row.quantity}
//                           disabled={loading}
//                           onChange={(e) =>
//                             onUpdate(row.inventory_id, {
//                               quantity: parseInt(e.target.value, 10),
//                             })
//                           }
//                           className="w-20 text-right"
//                         />
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-center">
//                       <Select
//                         value={row.status}
//                         disabled={loading}
//                         onValueChange={(v) =>
//                           onUpdate(row.inventory_id, {
//                             status: v as any,
//                           })
//                         }
//                       >
//                         <SelectTrigger className="w-32 mx-auto">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="available">
//                             Available
//                           </SelectItem>
//                           <SelectItem value="unavailable">
//                             Unavailable
//                           </SelectItem>
//                           <SelectItem value="discontinued">
//                             Discontinued
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </TableCell>
//                     <TableCell className="text-sm text-muted-foreground">
//                       {new Date(row.last_updated).toLocaleString('en-GB', {
//                         day: '2-digit',
//                         month: '2-digit',
//                         year: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     );
//   }

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  PackageSearch,
  Filter as FilterIcon,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface InventoryRow {
  inventory_id: string;
  product_name: string;
  variant_id:   string;
  color:        string;
  size:         string;
  quantity:     number;
  status:       "available" | "unavailable" | "discontinued";
  last_updated: string;
}

interface Props {
  initialData: InventoryRow[];
}

export default function InventoryTable({ initialData }: Props) {
  const [data, setData]           = useState<InventoryRow[]>(initialData);
  const [loadingRow, setLoadingRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    InventoryRow["status"] | "all"
  >("all");
  const [sortField, setSortField]     = useState<keyof InventoryRow>("last_updated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [syncedAt, setSyncedAt]       = useState("");

  useEffect(() => {
    setSyncedAt(new Date().toLocaleString("en-GB"));
  }, []);

  const onUpdate = async (
    id: string,
    patch: Partial<Pick<InventoryRow, "quantity" | "status">>
  ) => {
    setLoadingRow(id);
    const res = await fetch(`/api/inventory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (res.ok && json.success) {
      setData((d) =>
        d.map((r) => (r.inventory_id === id ? { ...r, ...json.row } : r))
      );
    } else {
      alert(json.error || "Update failed");
    }
    setLoadingRow(null);
  };

  const filtered = data.filter((r) => {
    const matchText = [
      r.product_name,
      r.variant_id,
      r.color,
      r.size,
    ].some((f) =>
      f.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    const matchStatus =
      statusFilter === "all" || r.status === statusFilter;
    return matchText && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "quantity") {
      return sortDirection === "asc"
        ? a.quantity - b.quantity
        : b.quantity - a.quantity;
    }
    if (sortField === "last_updated") {
      return sortDirection === "asc"
        ? new Date(a.last_updated).getTime() -
          new Date(b.last_updated).getTime()
        : new Date(b.last_updated).getTime() -
          new Date(a.last_updated).getTime();
    }
    const va = String(a[sortField]),
      vb = String(b[sortField]);
    return sortDirection === "asc"
      ? va.localeCompare(vb)
      : vb.localeCompare(va);
  });

  const toggleSort = (field: keyof InventoryRow) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: keyof InventoryRow }) =>
    sortField === field ? (
      sortDirection === "asc" ? (
        <ChevronUp className="ml-1 h-4 w-4" />
      ) : (
        <ChevronDown className="ml-1 h-4 w-4" />
      )
    ) : (
      <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
    );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PackageSearch className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Inventory</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {syncedAt && `Synced ${syncedAt}`}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
          <Input
            placeholder="Search by name, variant, colour or size…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <FilterIcon className="h-5 w-5 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as any)}
            >
              <SelectTrigger className="w-[160px] cursor-pointer">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("product_name")}
              >
                <div className="flex font-semibold items-center text-stone-800">
                  Product<SortIcon field="product_name" />
                </div>
              </TableHead>
              <TableHead className="font-semibold text-stone-800">
                Variant
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => toggleSort("quantity")}
              >
                <div className="flex justify-end items-center font-semibold text-stone-800">
                  Qty<SortIcon field="quantity" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer font-semibold text-stone-800 text-center">
                Status
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("last_updated")}
              >
                <div className="flex items-center font-semibold text-stone-800">
                  Last Updated<SortIcon field="last_updated" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No items
                </TableCell>
              </TableRow>
            )}
            {sorted.map((row) => {
              const loading = loadingRow === row.inventory_id;
              const isCritical = row.quantity <= 3;
              const isLow = row.quantity > 3 && row.quantity < 10;
              const badgeVariant = isCritical ? "destructive" : "default";
              const badgeClass = cn(
                loading ? "opacity-60" : "",
                isCritical
                  ? ""
                  : isLow
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-100 text-green-800"
              );

              return (
                <TableRow
                  key={row.inventory_id}
                  className={cn(
                    isCritical
                      ? "bg-destructive/10"
                      : isLow
                      ? "bg-warning/10"
                      : "",
                    loading ? "opacity-60" : ""
                  )}
                >
                  <TableCell>
                    <div>{row.product_name}</div>
                  </TableCell>
                  <TableCell>
                    {row.color} · {row.size}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant={badgeVariant}
                              className={cn(badgeClass, "h-6 w-6 p-0")}
                            >
                              {isCritical && (
                                <AlertCircle className="h-3 w-3" />
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isCritical
                              ? "Critical"
                              : isLow
                              ? "Low stock"
                              : "In stock"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Input
                        type="number"
                        min={0}
                        value={row.quantity}
                        disabled={loading}
                        onChange={(e) =>
                          onUpdate(row.inventory_id, {
                            quantity: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-20 text-right"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Select
                      value={row.status}
                      disabled={loading}
                      onValueChange={(v) =>
                        onUpdate(row.inventory_id, {
                          status: v as any,
                        })
                      }
                    >
                      <SelectTrigger className="w-32 mx-auto cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">
                          Available
                        </SelectItem>
                        <SelectItem value="unavailable">
                          Unavailable
                        </SelectItem>
                        <SelectItem value="discontinued">
                          Discontinued
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(row.last_updated).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
