// 'use client'

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-[#111] dark:to-[#333] text-gray-800 dark:text-white font-sans relative">
      
//       {/* Top bar */}
//       <div className="absolute top-0 right-0 p-6">
//         <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition">
//           Login
//         </button>
//       </div>

//       {/* Center content */}
//       <div className="flex items-center justify-center min-h-screen">
//         <h1 className="text-4xl font-bold">Welcome to HRM</h1>
//       </div>
//     </div>
//   );
// }









'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleLoginClick = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-[#111] dark:to-[#333] text-gray-800 dark:text-white font-sans relative">
      
      {/* Top bar */}
      <div className="absolute top-0 right-0 p-6">
        <button 
          onClick={handleLoginClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          Login
        </button>
      </div>

      {/* Center content */}
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold">Welcome to HRM</h1>
      </div>
    </div>
  )
}