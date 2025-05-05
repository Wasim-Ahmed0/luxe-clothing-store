// import React, { useState } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';

// export interface FittingRequestRow {
//   request_id:      string;
//   fitting_cart_id: string;
//   variant_id:      string;
//   fitting_room_id: string | null;
//   status:          'pending' | 'fulfilled' | 'cancelled';
//   created_at:      string;
// }

// interface Props {
//   initialData: FittingRequestRow[];
// }

// export default function FittingRequestsTable({ initialData }: Props) {
//   const [data, setData]         = useState<FittingRequestRow[]>(initialData);
//   const [loadingRow, setLoadingRow] = useState<string | null>(null);

//   // detect duplicates
//   const roomCounts: Record<string, number> = {};
//   data.forEach(r => {
//     if (r.fitting_room_id) {
//       roomCounts[r.fitting_room_id] = (roomCounts[r.fitting_room_id] || 0) + 1;
//     }
//   });
//   const duplicateRooms = new Set(
//     Object.entries(roomCounts)
//       .filter(([_, c]) => c > 1)
//       .map(([rid]) => rid)
//   );

//   const onUpdate = async (row: FittingRequestRow, newStatus: 'fulfilled' | 'cancelled') => {
//     setLoadingRow(row.request_id);
//     const res = await fetch(
//       `/api/fitting-carts/${row.fitting_cart_id}/requests/${row.request_id}`,
//       {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus }),
//       }
//     );
//     const json = await res.json();
//     if (res.ok && json.success) {
//       setData(d => d.filter(r => r.request_id !== row.request_id));
//     } else {
//       alert(json.error || 'Failed to update');
//     }
//     setLoadingRow(null);
//   };

//   return (
//     <Card className="shadow-sm">
//       <CardHeader>
//         <CardTitle>Fitting Room Requests</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Request ID</TableHead>
//               <TableHead>Variant</TableHead>
//               <TableHead>Room</TableHead>
//               <TableHead>Requested At</TableHead>
//               <TableHead>Action</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {data.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={5} className="text-center py-8">
//                   No pending requests
//                 </TableCell>
//               </TableRow>
//             )}
//             {data.map(r => {
//               const highlight = r.fitting_room_id && duplicateRooms.has(r.fitting_room_id);
//               return (
//                 <TableRow
//                   key={r.request_id}
//                   className={highlight ? 'bg-amber-50' : ''}
//                 >
//                   <TableCell className="font-mono text-xs break-all">
//                     {r.request_id}
//                   </TableCell>
//                   <TableCell className="font-mono text-xs break-all">
//                     {r.variant_id}
//                   </TableCell>
//                   <TableCell>
//                     {r.fitting_room_id || '—'}
//                     {highlight && (
//                       <Badge variant="secondary" className="ml-2 p-1">
//                         Duplicate
//                       </Badge>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {new Date(r.created_at).toLocaleString('en-GB')}
//                   </TableCell>
//                   <TableCell>
//                     <Button
//                       size="sm"
//                       disabled={loadingRow === r.request_id}
//                       onClick={() => onUpdate(r, 'fulfilled')}
//                       className='cursor-pointer'
//                     >
//                       Fulfill
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface FittingRequestRow {
  request_id:      string
  fitting_cart_id: string
  variant_id:      string
  fitting_room_id: string | null
  status:          'pending' | 'fulfilled' | 'cancelled'
  created_at:      string
}

interface Props {
  initialData: FittingRequestRow[]
}

export default function FittingRequestsTable({ initialData }: Props) {
  const [data, setData] = useState<FittingRequestRow[]>(initialData)
  const [loadingRow, setLoadingRow] = useState<string | null>(null)

  // generate rooms A–P
  const ROOM_OPTIONS = Array.from({ length: 16 }, (_, i) =>
    String.fromCharCode(65 + i)
  )

  // detect duplicates
  const roomCounts: Record<string, number> = {}
  data.forEach((r) => {
    if (r.fitting_room_id) {
      roomCounts[r.fitting_room_id] = (roomCounts[r.fitting_room_id] || 0) + 1
    }
  })
  const duplicateRooms = new Set(
    Object.entries(roomCounts)
      .filter(([, c]) => c > 1)
      .map(([rid]) => rid)
  )

  const onUpdateStatus = async (
    row: FittingRequestRow,
    newStatus: 'fulfilled' | 'cancelled'
  ) => {
    setLoadingRow(row.request_id)
    const res = await fetch(
      `/api/fitting-carts/${row.fitting_cart_id}/requests/${row.request_id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }
    )
    const json = await res.json()
    if (res.ok && json.success) {
      setData((d) =>
        d.filter((r) => r.request_id !== row.request_id)
      )
    } else {
      alert(json.error || 'Failed to update status')
    }
    setLoadingRow(null)
  }

  const onAssignRoom = async (
    row: FittingRequestRow,
    newRoom: string
  ) => {
    setLoadingRow(row.request_id)
    const res = await fetch(
      `/api/fitting-carts/${row.fitting_cart_id}/requests/${row.request_id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fitting_room_id: newRoom }),
      }
    )
    const json = await res.json()
    if (res.ok && json.success) {
      // update local state
      setData((d) =>
        d.map((r) =>
          r.request_id === row.request_id
            ? { ...r, fitting_room_id: newRoom }
            : r
        )
      )
    } else {
      alert(json.error || 'Failed to assign room')
    }
    setLoadingRow(null)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className='text-lg'>Fitting Room Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='font-semibold text-stone-800'>Request ID</TableHead>
              <TableHead className='font-semibold text-stone-800'>Variant</TableHead>
              <TableHead className='font-semibold text-stone-800'>Room</TableHead>
              <TableHead className='font-semibold text-stone-800'>Requested At</TableHead>
              <TableHead className='font-semibold text-stone-800'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No pending requests
                </TableCell>
              </TableRow>
            )}
            {data.map((r) => {
              const highlight =
                r.fitting_room_id &&
                duplicateRooms.has(r.fitting_room_id!)

              return (
                <TableRow
                  key={r.request_id}
                  className={highlight ? 'bg-amber-50' : ''}
                >
                  <TableCell className="font-mono text-xs break-all">
                    {r.request_id}
                  </TableCell>
                  <TableCell className="font-mono text-xs break-all">
                    {r.variant_id}
                  </TableCell>
                  <TableCell className="flex items-center space-x-2">
                    <select
                      value={r.fitting_room_id ?? ''}
                      disabled={loadingRow === r.request_id}
                      onChange={(e) =>
                        onAssignRoom(r, e.target.value)
                      }
                      className="border rounded px-2 py-1 cursor-pointer"
                    >
                      <option value="">— Unassigned —</option>
                      {ROOM_OPTIONS.map((room) => (
                        <option key={room} value={room}>
                          Room {room}
                        </option>
                      ))}
                    </select>
                    {highlight && (
                      <Badge variant="secondary" className="p-1">
                        Duplicate
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(r.created_at).toLocaleString('en-GB')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      disabled={loadingRow === r.request_id}
                      onClick={() => onUpdateStatus(r, 'fulfilled')}
                      className='cursor-pointer'
                    >
                      Fulfill
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
