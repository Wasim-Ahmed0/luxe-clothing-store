// // components/account/ProfileSection.tsx
// import { useEffect, useState } from "react"
// import { signOut } from "next-auth/react"

// interface User {
//   user_id:  string
//   email:    string
//   username: string
//   role:     string
// }

// export default function ProfileSection() {
//   const [user, setUser] = useState<User | null>(null)
//   const [email, setEmail] = useState("")
//   const [username, setUsername] = useState("")
//   const [currentPassword, setCurrentPassword] = useState("")
//   const [newPassword, setNewPassword] = useState("")
//   const [saving, setSaving] = useState(false)
//   const [message, setMessage] = useState<string | null>(null)

//   // load current user
//   useEffect(() => {
//     fetch("/api/users/me")
//       .then((r) => r.json())
//       .then((j) => {
//         if (j.success) {
//           setUser(j.user)
//           setUsername(j.user.username)
//           setEmail(j.user.email)
//         }
//       })
//   }, [])

//   const isGoogle = user?.email.endsWith("@gmail.com")

//   // save username / email
//   const saveDetails = async () => {
//     if (!user) return
//     setSaving(true)
//     setMessage(null)

//     const payload: any = { username }
//     if (!isGoogle) {
//       payload.email = email
//       if (currentPassword) payload.currentPassword = currentPassword
//     }

//     try {
//       const res = await fetch(`/api/users/${user.user_id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       })
//       const j = await res.json()
//       if (!res.ok || !j.success) throw new Error(j.error || "Failed")
//       setMessage("Profile Updated Successfully")
//       setCurrentPassword("")
//     } catch (e: any) {
//       setMessage(e.message)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // change password (non-google only)
//   const changePassword = async () => {
//     if (!user) return
//     setSaving(true)
//     setMessage(null)
//     try {
//       const res = await fetch(`/api/users/${user.user_id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ currentPassword, newPassword }),
//       })
//       const j = await res.json()
//       if (!res.ok || !j.success) throw new Error(j.error || "Failed")
//       setMessage("Password Changed Successfully")
//       setCurrentPassword("")
//       setNewPassword("")
//     } catch (e: any) {
//       setMessage(e.message)
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {message && (
//         <div className="p-2 bg-green-50 text-green-800 rounded">
//           {message}
//         </div>
//       )}

//       {/* Personal Details */}
//       <div>
//         <h2 className="font-medium text-lg text-stone-900 mb-3">Personal Details</h2>
//         <div className="space-y-4">
//           {/* Username */}
//           <div>
//             <label className="block text-base text-stone-500">Username</label>
//             <input
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full border p-2 rounded text-sm text-stone-700"
//             />
//           </div>

//           {/* Email (non-Google only) */}
//           {!isGoogle && (
//             <div>
//               <label className="block text-base text-stone-500">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full border p-2 rounded text-sm text-stone-700"
//               />
//             </div>
//           )}

//           {/* Current Password (non-Google only) */}
//           {!isGoogle && (
//             <div>
//               <label className="block text-base text-stone-500">Current Password</label>
//               <input
//                 type="password"
//                 value={currentPassword}
//                 onChange={(e) => setCurrentPassword(e.target.value)}
//                 className="w-full border p-2 rounded text-sm text-stone-700"
//                 placeholder="required to save changes"
//               />
//             </div>
//           )}

//           <button
//             onClick={saveDetails}
//             disabled={saving}
//             className="mt-2 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 cursor-pointer"
//           >
//             Save Profile
//           </button>
//         </div>
//       </div>

//       {/* Change Password (non-Google only) */}
//       {!isGoogle && (
//         <div>
//           <h2 className="font-medium text-lg text-stone-900 mb-3">Change Password</h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-base text-stone-500">Current Password</label>
//               <input
//                 type="password"
//                 value={currentPassword}
//                 onChange={(e) => setCurrentPassword(e.target.value)}
//                 className="w-full border p-2 rounded text-sm text-stone-700"
//               />
//             </div>
//             <div>
//               <label className="block text-base text-stone-500">New Password</label>
//               <input
//                 type="password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 className="w-full border p-2 rounded text-sm text-stone-700"
//               />
//             </div>
//             <button
//               onClick={changePassword}
//               disabled={saving}
//               className="mt-2 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700"
//             >
//               Change Password
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Log Out Button */}
//       <div className="pt-4 border-t">
//         <button
//           onClick={() => signOut({ callbackUrl: "/" })}
//           className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
//         >
//           Log Out
//         </button>
//       </div>
//     </div>
//   )
// }

// components/account/ProfileSection.tsx
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"

interface User {
  user_id:  string
  email:    string
  username: string
  role:     string
}

export default function ProfileSection() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")

  // passwords for changing password
  const [passwordOld, setPasswordOld] = useState("")
  const [passwordNew, setPasswordNew] = useState("")

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // load current user
  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setUser(j.user)
          setUsername(j.user.username)
          setEmail(j.user.email)
        }
      })
  }, [])

  const isGoogle = user?.email.endsWith("@gmail.com")

  // save username / email
  const saveDetails = async () => {
    if (!user) return
    setSaving(true)
    setMessage(null)

    const payload: any = { username }
    if (!isGoogle) {
      payload.email = email
    }

    try {
      const res = await fetch(`/api/users/${user.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (!res.ok || !j.success) throw new Error(j.error || "Failed")
      setMessage("Profile Updated Successfully")
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setSaving(false)
    }
  }

  // change password (non-Google only)
  const changePassword = async () => {
    if (!user) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/users/${user.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordOld, newPassword: passwordNew }),
      })
      const j = await res.json()
      if (!res.ok || !j.success) throw new Error(j.error || "Failed")
      setMessage("Password Changed Successfully")
      setPasswordOld("")
      setPasswordNew("")
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-2 bg-green-50 text-green-800 rounded">
          {message}
        </div>
      )}

      {/* Personal Details */}
      <div>
        <h2 className="font-medium text-lg text-stone-900 mb-3">Personal Details</h2>
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-base text-stone-500">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-2 rounded text-sm text-stone-700"
            />
          </div>

          {/* Email (non-Google only) */}
          {!isGoogle && (
            <div>
              <label className="block text-base text-stone-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded text-sm text-stone-700"
              />
            </div>
          )}

          <button
            onClick={saveDetails}
            disabled={saving}
            className="mt-2 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 cursor-pointer"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Change Password (non-Google only) */}
      {!isGoogle && (
        <div>
          <h2 className="font-medium text-lg text-stone-900 mb-3">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-base text-stone-500">Current Password</label>
              <input
                type="password"
                value={passwordOld}
                onChange={(e) => setPasswordOld(e.target.value)}
                className="w-full border p-2 rounded text-sm text-stone-700"
              />
            </div>
            <div>
              <label className="block text-base text-stone-500">New Password</label>
              <input
                type="password"
                value={passwordNew}
                onChange={(e) => setPasswordNew(e.target.value)}
                className="w-full border p-2 rounded text-sm text-stone-700"
              />
            </div>
            <button
              onClick={changePassword}
              disabled={saving}
              className="mt-2 px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-700 cursor-pointer"
            >
              Change Password
            </button>
          </div>
        </div>
      )}

      {/* Log Out Button */}
      <div className="pt-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
