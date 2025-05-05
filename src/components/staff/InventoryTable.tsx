// import React, { useState, useEffect } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@/components/ui/select";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell} from "@/components/ui/table";
// import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { PackageSearch, Filter as FilterIcon, ArrowUpDown, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
// import AddInventoryItem from "@/components/staff/AddInventoryItem";
// import { cn } from "@/lib/utils"

// export interface InventoryRow {
//   inventory_id: string;
//   product_id:   string;
//   product_name: string;
//   variant_id:   string;
//   color:        string;
//   size:         string;
//   quantity:     number;
//   status:       "available" | "unavailable" | "discontinued";
//   last_updated: string;
// }

// interface Props {
//   initialData: InventoryRow[];
// }

// export default function InventoryTable({ initialData }: Props) {
//   const [data, setData] = useState<InventoryRow[]>(initialData);
//   const [loadingRow, setLoadingRow] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<InventoryRow["status"] | "all">("all");
//   const [sortField, setSortField] = useState<keyof InventoryRow>("last_updated");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
//   const [syncedAt, setSyncedAt] = useState("");

//   // Variant modal state
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedProductId, setSelectedProductId] = useState<string>("");
//   const [selectedProductName, setSelectedProductName] = useState<string>("");
//   const [newSize, setNewSize] = useState("");
//   const [newColor, setNewColor] = useState("");
//   const [newQuantity, setNewQuantity] = useState<number>(0);
//   const [newStatus, setNewStatus] = useState<"available" | "unavailable" | "discontinued">("available");
//   const [variantLoading, setVariantLoading] = useState(false);
//   const [variantError, setVariantError] = useState<string | null>(null);

//   useEffect(() => {
//     setSyncedAt(new Date().toLocaleString("en-GB"));
//   }, []);

//   const onUpdate = async (
//     id: string,
//     patch: Partial<Pick<InventoryRow, "quantity" | "status">>
//   ) => {
//     setLoadingRow(id);
//     const res = await fetch(`/api/inventory/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(patch),
//     });
//     const json = await res.json();
//     if (res.ok && json.success) {
//       setData((d) =>
//         d.map((r) => (r.inventory_id === id ? { ...r, ...json.row } : r))
//       );
//     } else {
//       alert(json.error || "Update failed");
//     }
//     setLoadingRow(null);
//   };

//   const filtered = data.filter((r) => {
//     const matchText = [
//       r.product_name,
//       r.variant_id,
//       r.color,
//       r.size,
//     ].some((f) =>
//       f.toLowerCase().includes(searchTerm.trim().toLowerCase())
//     );
//     const matchStatus =
//       statusFilter === "all" || r.status === statusFilter;
//     return matchText && matchStatus;
//   });

//   const sorted = [...filtered].sort((a, b) => {
//     if (sortField === "quantity") {
//       return sortDirection === "asc"
//         ? a.quantity - b.quantity
//         : b.quantity - a.quantity;
//     }
//     if (sortField === "last_updated") {
//       return sortDirection === "asc"
//         ? new Date(a.last_updated).getTime() -
//           new Date(b.last_updated).getTime()
//         : new Date(b.last_updated).getTime() -
//           new Date(a.last_updated).getTime();
//     }
//     const va = String(a[sortField]),
//       vb = String(b[sortField]);
//     return sortDirection === "asc"
//       ? va.localeCompare(vb)
//       : vb.localeCompare(va);
//   });

//   const toggleSort = (field: keyof InventoryRow) => {
//     if (sortField === field) {
//       setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
//     } else {
//       setSortField(field);
//       setSortDirection("desc");
//     }
//   };

//   const SortIcon = ({ field }: { field: keyof InventoryRow }) =>
//     sortField === field ? (
//       sortDirection === "asc" ? (
//         <ChevronUp className="ml-1 h-4 w-4" />
//       ) : (
//         <ChevronDown className="ml-1 h-4 w-4" />
//       )
//     ) : (
//       <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
//     );

//   const openVariantModal = (productId: string, productName: string) => {
//     setSelectedProductId(productId);
//     setSelectedProductName(productName);
//     setNewSize("");
//     setNewColor("");
//     setNewQuantity(0);
//     setNewStatus("available");
//     setVariantError(null);
//     setModalOpen(true);
//   };

//   const handleAddVariant = async () => {
//     setVariantLoading(true);
//     setVariantError(null);
//     try {
//       const res = await fetch(`/api/products/${selectedProductId}/variants`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           size: newSize,
//           color: newColor,
//           quantity: newQuantity,
//           status: newStatus,
//         }),
//       });
//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         throw new Error(json.error || "Failed to add variant");
//       }
//       setModalOpen(false);
//       window.location.reload();
//     } catch (e: any) {
//       setVariantError(e.message);
//     } finally {
//       setVariantLoading(false);
//     }
//   };

 
//   return (
//     <>
//       <Card className="shadow-sm">
//         <CardHeader className="pb-2">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <PackageSearch className="h-5 w-5 text-primary" />
//               <CardTitle className="text-lg">Inventory</CardTitle>
//             </div>
//             <div className="text-sm text-muted-foreground">{syncedAt && `Synced ${syncedAt}`}</div>
//             <AddInventoryItem />
//           </div>
//         </CardHeader>
//         <CardContent>
//           {/* Filters */}
//           <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
//             <Input
//               placeholder="Search by name, variant, colour or size…"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="flex-1"
//             />
//             <div className="flex items-center space-x-2 mt-2 sm:mt-0">
//               <FilterIcon className="h-5 w-5 text-muted-foreground" />
//               <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
//                 <SelectTrigger className="w-[160px] cursor-pointer">
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
//                 <TableHead className="cursor-pointer" onClick={() => toggleSort("product_name")}>
//                   <div className="flex font-semibold items-center text-stone-800">
//                     Product<SortIcon field="product_name" />
//                   </div>
//                 </TableHead>
//                 <TableHead className="font-semibold text-stone-800">Variant</TableHead>
//                 <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("quantity")}>
//                   <div className="flex justify-end items-center font-semibold text-stone-800">
//                     Qty<SortIcon field="quantity" />
//                   </div>
//                 </TableHead>
//                 <TableHead className="cursor-pointer font-semibold text-stone-800 text-center">Status</TableHead>
//                 <TableHead className="cursor-pointer" onClick={() => toggleSort("last_updated")}>
//                   <div className="flex items-center font-semibold text-stone-800">
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
//                 const isCritical = row.quantity <= 3;
//                 const isLow = row.quantity > 3 && row.quantity < 10;
//                 const badgeVariant = isCritical ? "destructive" : "default";
//                 const badgeClass = cn(
//                   loading ? "opacity-60" : "",
//                   isCritical ? "" : isLow ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
//                 );

//                 return (
//                   <TableRow
//                     key={row.inventory_id}
//                     className={cn(isCritical ? "bg-destructive/10" : isLow ? "bg-warning/10" : "", loading ? "opacity-60" : "")}
//                   >
//                     <TableCell>
//                       <button
//                         onClick={() => openVariantModal(row.variant_id, row.product_name)}
//                         className="text-left underline cursor-pointer hover:text-amber-800"
//                       >
//                         {row.product_name}
//                       </button>
//                     </TableCell>
//                     <TableCell>
//                       {row.color} · {row.size}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end space-x-2">
//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <Badge variant={badgeVariant} className={cn(badgeClass, "h-6 w-6 p-0")}>
//                                 {isCritical && <AlertCircle className="h-3 w-3" />}
//                               </Badge>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                               {isCritical ? "Critical" : isLow ? "Low stock" : "In stock"}
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
//                         <SelectTrigger className="w-32 mx-auto cursor-pointer">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="available">Available</SelectItem>
//                           <SelectItem value="unavailable">Unavailable</SelectItem>
//                           <SelectItem value="discontinued">Discontinued</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </TableCell>
//                     <TableCell className="text-sm text-muted-foreground">
//                       {new Date(row.last_updated).toLocaleString("en-GB", {
//                         day: "2-digit",
//                         month: "2-digit",
//                         year: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* Add Variant Modal */}
//       <Dialog open={modalOpen} onOpenChange={setModalOpen}>
//         <DialogContent className="sm:max-w-lg bg-stone-50">
//           <DialogHeader>
//             <DialogTitle className="text-stone-900">Add Variant for "{selectedProductName}"</DialogTitle>
//             <DialogDescription>Enter new size, color, quantity & status.</DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div>
//               <label className="text-sm font-medium text-stone-500">Size</label>
//               <Input className="placeholder:text-stone-300 text-stone-900" value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="e.g., Large" />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-stone-500">Color</label>
//               <Input className="placeholder:text-stone-300 text-stone-900" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="e.g., Navy" />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-stone-500">Initial Quantity</label>
//               <Input
//                 type="number"
//                 min={0}
//                 value={newQuantity}
//                 className="placeholder:text-stone-300 text-stone-900"
//                 onChange={(e) => setNewQuantity(parseInt(e.target.value, 10))}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-stone-500">Status</label>
//               <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
//                 <SelectTrigger className="cursor-pointer text-stone-900">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem className="cursor-pointer" value="available">Available</SelectItem>
//                   <SelectItem className="cursor-pointer" value="unavailable">Unavailable</SelectItem>
//                   <SelectItem className="cursor-pointer" value="discontinued">Discontinued</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             {variantError && <p className="text-red-600 text-sm">{variantError}</p>}
//           </div>
//           <DialogFooter>
//             <DialogClose asChild>
//               <Button variant="outline" className="bg-red-700 hover:bg-red-600 cursor-pointer">Cancel</Button>
//             </DialogClose>
//             <Button onClick={handleAddVariant} disabled={variantLoading} className="hover:bg-green-800 cursor-pointer">
//               {variantLoading ? "Adding..." : "Add Variant"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// } 



// using variant model
// // components/staff/InventoryTable.tsx
// import React, { useState, useEffect } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
// import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
// import { PackageSearch, Filter as FilterIcon, ArrowUpDown, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
// import AddInventoryItem from "@/components/staff/AddInventoryItem";
// import AddVariantModal from "@/components/staff/AddVariantModal";
// import { cn } from "@/lib/utils";

// export interface InventoryRow {
//   inventory_id: string;
//   product_id:   string;          // ← added
//   product_name: string;
//   variant_id:   string;
//   color:        string;
//   size:         string;
//   quantity:     number;
//   status:       "available" | "unavailable" | "discontinued";
//   last_updated: string;
// }

// interface Props {
//   initialData: InventoryRow[];
// }

// export default function InventoryTable({ initialData }: Props) {
//   const [data, setData] = useState<InventoryRow[]>(initialData);
//   const [loadingRow, setLoadingRow] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<InventoryRow["status"] | "all">("all");
//   const [sortField, setSortField] = useState<keyof InventoryRow>("last_updated");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
//   const [syncedAt, setSyncedAt] = useState("");
//   const [selectedProductId, setSelectedProductId] = useState<string>("");

//   // helper to read store_id cookie
//   const getCookie = (name: string): string | undefined => {
//     if (typeof document === "undefined") return undefined;
//     const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
//     return m ? decodeURIComponent(m[2]) : undefined;
//   };
//   const storeId = getCookie("store_id") ?? process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!;

//   useEffect(() => {
//     setSyncedAt(new Date().toLocaleString("en-GB"));
//   }, []);

//   const onUpdate = async (
//     id: string,
//     patch: Partial<Pick<InventoryRow, "quantity" | "status">>
//   ) => {
//     setLoadingRow(id);
//     const res = await fetch(`/api/inventory/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(patch),
//     });
//     const json = await res.json();
//     if (res.ok && json.success) {
//       setData((d) =>
//         d.map((r) => (r.inventory_id === id ? { ...r, ...json.row } : r))
//       );
//     } else {
//       alert(json.error || "Update failed");
//     }
//     setLoadingRow(null);
//   };

//   // filtering + sorting (unchanged)...
//   const filtered = data.filter((r) => {
//     const matchText = [r.product_name, r.variant_id, r.color, r.size].some((f) =>
//       f.toLowerCase().includes(searchTerm.trim().toLowerCase())
//     );
//     const matchStatus = statusFilter === "all" || r.status === statusFilter;
//     return matchText && matchStatus;
//   });
//   const sorted = [...filtered].sort((a, b) => {
//     if (sortField === "quantity") {
//       return sortDirection === "asc"
//         ? a.quantity - b.quantity
//         : b.quantity - a.quantity;
//     }
//     if (sortField === "last_updated") {
//       return sortDirection === "asc"
//         ? new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime()
//         : new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
//     }
//     const va = String(a[sortField]),
//       vb = String(b[sortField]);
//     return sortDirection === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
//   });
//   const toggleSort = (field: keyof InventoryRow) => {
//     if (sortField === field) {
//       setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
//     } else {
//       setSortField(field);
//       setSortDirection("desc");
//     }
//   };
//   const SortIcon = ({ field }: { field: keyof InventoryRow }) =>
//     sortField === field ? (
//       sortDirection === "asc" ? (
//         <ChevronUp className="ml-1 h-4 w-4" />
//       ) : (
//         <ChevronDown className="ml-1 h-4 w-4" />
//       )
//     ) : (
//       <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
//     );

//   return (
//     <Card className="shadow-sm">
//       <CardHeader className="pb-2">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <PackageSearch className="h-5 w-5 text-primary" />
//             <CardTitle className="text-lg">Inventory</CardTitle>
//           </div>
//           <div className="text-sm text-muted-foreground">
//             {syncedAt && `Synced ${syncedAt}`}
//           </div>
//           <AddInventoryItem />
//         </div>
//       </CardHeader>

//       <CardContent>
//         {/* Filters */}
//         <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
//           <Input
//             placeholder="Search by name, variant, colour or size…"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="flex-1"
//           />
//           <div className="flex items-center space-x-2 mt-2 sm:mt-0">
//             <FilterIcon className="h-5 w-5 text-muted-foreground" />
//             <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
//               <SelectTrigger className="w-[160px] cursor-pointer">
//                 <SelectValue placeholder="All statuses" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All statuses</SelectItem>
//                 <SelectItem value="available">Available</SelectItem>
//                 <SelectItem value="unavailable">Unavailable</SelectItem>
//                 <SelectItem value="discontinued">Discontinued</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Table */}
//         <Table>
//           <TableHeader>
//             <TableRow className="bg-muted/50">
//               <TableHead className="cursor-pointer" onClick={() => toggleSort("product_name")}>
//                 <div className="flex font-semibold items-center text-stone-800">
//                   Product<SortIcon field="product_name" />
//                 </div>
//               </TableHead>
//               <TableHead className="font-semibold text-stone-800">Variant</TableHead>
//               <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("quantity")}>
//                 <div className="flex justify-end items-center font-semibold text-stone-800">
//                   Qty<SortIcon field="quantity" />
//                 </div>
//               </TableHead>
//               <TableHead className="cursor-pointer font-semibold text-stone-800 text-center">
//                 Status
//               </TableHead>
//               <TableHead className="cursor-pointer" onClick={() => toggleSort("last_updated")}>
//                 <div className="flex items-center font-semibold text-stone-800">
//                   Last Updated<SortIcon field="last_updated" />
//                 </div>
//               </TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {sorted.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5} className="text-center py-8">
//                   No items
//                 </TableCell>
//               </TableRow>
//             ) : (
//               sorted.map((row) => {
//                 const loading = loadingRow === row.inventory_id;
//                 const isCritical = row.quantity <= 3;
//                 const isLow = row.quantity > 3 && row.quantity < 10;
//                 const badgeVariant = isCritical ? "destructive" : "default";
//                 const badgeClass = cn(
//                   loading ? "opacity-60" : "",
//                   isCritical ? "" : isLow ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
//                 );

//                 return (
//                   <TableRow
//                     key={row.inventory_id}
//                     className={cn(
//                       isCritical ? "bg-destructive/10" : isLow ? "bg-warning/10" : "",
//                       loading ? "opacity-60" : ""
//                     )}
//                   >
//                     <TableCell>
//                       <AddVariantModal
//                         productId={row.product_id}
//                         productName={row.product_name}
//                         storeId={storeId}
//                         onCreated={() => window.location.reload()}
//                       >
//                         <button className="text-left underline hover:text-amber-800">
//                           {row.product_name}
//                         </button>
//                       </AddVariantModal>
//                     </TableCell>
//                     <TableCell>
//                       {row.color} · {row.size}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end space-x-2">
//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <Badge variant={badgeVariant} className={cn(badgeClass, "h-6 w-6 p-0")}>
//                                 {isCritical && <AlertCircle className="h-3 w-3" />}
//                               </Badge>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                               {isCritical ? "Critical" : isLow ? "Low stock" : "In stock"}
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
//                         <SelectTrigger className="w-32 mx-auto cursor-pointer">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="available">Available</SelectItem>
//                           <SelectItem value="unavailable">Unavailable</SelectItem>
//                           <SelectItem value="discontinued">Discontinued</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </TableCell>
//                     <TableCell className="text-sm text-muted-foreground">
//                       {new Date(row.last_updated).toLocaleString("en-GB", {
//                         day: "2-digit",
//                         month: "2-digit",
//                         year: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </TableCell>
//                   </TableRow>
//                 );
//               })
//             )}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }



//not using variant model fix:

// components/staff/InventoryTable.tsx
import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  PackageSearch,
  Filter as FilterIcon,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from "lucide-react"
import AddInventoryItem from "@/components/staff/AddInventoryItem"
import { cn } from "@/lib/utils"

export interface InventoryRow {
  inventory_id: string
  product_name: string
  variant_id: string
  color: string
  size: string
  quantity: number
  status: "available" | "unavailable" | "discontinued"
  last_updated: string
}

interface Props {
  storeId: string
  initialData: InventoryRow[]
}

export default function InventoryTable({ storeId, initialData }: Props) {
  const [data, setData] = useState<InventoryRow[]>(initialData)
  const [loadingRow, setLoadingRow] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    InventoryRow["status"] | "all"
  >("all")
  const [sortField, setSortField] = useState<keyof InventoryRow>(
    "last_updated"
  )
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [syncedAt, setSyncedAt] = useState("")

  // for inline "Add Variant" modal
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string>("")
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [selectedProductName, setSelectedProductName] = useState<string>("")
  const [newSize, setNewSize] = useState("")
  const [newColor, setNewColor] = useState("")
  const [newQuantity, setNewQuantity] = useState<number>(0)
  const [newStatus, setNewStatus] = useState<
    "available" | "unavailable" | "discontinued"
  >("available")
  const [variantLoading, setVariantLoading] = useState(false)
  const [variantError, setVariantError] = useState<string | null>(null)

  useEffect(() => {
    setSyncedAt(new Date().toLocaleString("en-GB"))
  }, [])

  const onUpdate = async (
    id: string,
    patch: Partial<Pick<InventoryRow, "quantity" | "status">>
  ) => {
    setLoadingRow(id)
    const res = await fetch(`/api/inventory/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    const json = await res.json()
    if (res.ok && json.success) {
      setData((d) =>
        d.map((r) => (r.inventory_id === id ? { ...r, ...json.row } : r))
      )
    } else {
      alert(json.error || "Update failed")
    }
    setLoadingRow(null)
  }

  // clicking product → lookup its product_id, then open modal
  const openVariantModal = async (variantId: string, productName: string) => {
    setVariantError(null)
    try {
      const res = await fetch(`/api/variants/${variantId}/product`)
      const json = await res.json()
      if (!res.ok || !json.product_id) {
        throw new Error(json.error || "Failed to lookup product")
      }
      setSelectedVariantId(variantId)
      setSelectedProductId(json.product_id)
      setSelectedProductName(productName)
      setNewSize("")
      setNewColor("")
      setNewQuantity(0)
      setNewStatus("available")
      setModalOpen(true)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleAddVariant = async () => {
    setVariantLoading(true)
    setVariantError(null)
    try {
      // 1) create variant + inventory via your combined endpoint
      const res = await fetch(
        `/api/products/${selectedProductId}/variants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            size: newSize,
            color: newColor,
            quantity: newQuantity,
            status: newStatus,
          }),
        }
      )
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add variant")
      }
      setModalOpen(false)
      window.location.reload()
    } catch (e: any) {
      setVariantError(e.message)
    } finally {
      setVariantLoading(false)
    }
  }

  // filter & sort
  const filtered = data.filter((r) => {
    const textMatch = [
      r.product_name,
      r.variant_id,
      r.color,
      r.size,
    ].some((f) =>
      f.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    const statusMatch = statusFilter === "all" || r.status === statusFilter
    return textMatch && statusMatch
  })
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "quantity") {
      return sortDirection === "asc"
        ? a.quantity - b.quantity
        : b.quantity - a.quantity
    }
    if (sortField === "last_updated") {
      return sortDirection === "asc"
        ? new Date(a.last_updated).getTime() -
            new Date(b.last_updated).getTime()
        : new Date(b.last_updated).getTime() -
            new Date(a.last_updated).getTime()
    }
    const va = String(a[sortField]),
      vb = String(b[sortField])
    return sortDirection === "asc"
      ? va.localeCompare(vb)
      : vb.localeCompare(va)
  })

  const toggleSort = (field: keyof InventoryRow) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }
  const SortIcon = ({ field }: { field: keyof InventoryRow }) =>
    sortField === field ? (
      sortDirection === "asc" ? (
        <ChevronUp className="ml-1 h-4 w-4" />
      ) : (
        <ChevronDown className="ml-1 h-4 w-4" />
      )
    ) : (
      <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
    )

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <PackageSearch className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Inventory</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {syncedAt && `Synced ${syncedAt}`}
            </div>
            <AddInventoryItem />
          </div>
        </CardHeader>
        <CardContent>
          {/* filters */}
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
                  <SelectItem value="discontinued">
                    Discontinued
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* table */}
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("product_name")}
                >
                  <div className="flex items-center font-semibold text-stone-800">
                    Product
                    <SortIcon field="product_name" />
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
                    Qty
                    <SortIcon field="quantity" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer text-center font-semibold text-stone-800">
                  Status
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("last_updated")}
                >
                  <div className="flex items-center font-semibold text-stone-800">
                    Last Updated
                    <SortIcon field="last_updated" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8"
                  >
                    No items
                  </TableCell>
                </TableRow>
              )}
              {sorted.map((row) => {
                const loading = loadingRow === row.inventory_id
                const isCritical = row.quantity <= 3
                const isLow = row.quantity > 3 && row.quantity < 10
                const badgeVariant = isCritical ? "destructive" : "default"
                const badgeClass = cn(
                  loading ? "opacity-60" : "",
                  isCritical
                    ? ""
                    : isLow
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                )

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
                      <button
                        className="underline hover:text-amber-800 cursor-pointer"
                        onClick={() =>
                          openVariantModal(
                            row.variant_id,
                            row.product_name
                          )
                        }
                      >
                        {row.product_name}
                      </button>
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
                                className={cn(
                                  badgeClass,
                                  "h-6 w-6 p-0"
                                )}
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
                              quantity: parseInt(
                                e.target.value,
                                10
                              ),
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
                      {new Date(
                        row.last_updated
                      ).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* inline Add Variant dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Variant for “{selectedProductName}”
            </DialogTitle>
            <DialogDescription>
              Specify size, colour and initial stock.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">
                Size
              </label>
              <Input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="e.g., M, L, XL"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Color
              </label>
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="e.g., Navy"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Initial Quantity
              </label>
              <Input
                type="number"
                min={0}
                value={newQuantity}
                onChange={(e) =>
                  setNewQuantity(
                    parseInt(e.target.value, 10)
                  )
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Status
              </label>
              <Select
                value={newStatus}
                onValueChange={(v) =>
                  setNewStatus(v as any)
                }
              >
                <SelectTrigger>
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
            </div>
            {variantError && (
              <p className="text-red-600 text-sm">
                {variantError}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAddVariant}
              disabled={variantLoading}
            >
              {variantLoading
                ? "Adding..."
                : "Create Variant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
