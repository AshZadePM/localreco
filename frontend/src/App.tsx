import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [status, setStatus] = useState<string>('Checking backend...')

  useEffect(() => {
    axios.get('/api/health')
      .then(response => {
        setStatus(response.data.message)
      })
      .catch(error => {
        console.error(error)
        setStatus('Backend not reachable')
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">App Stack Scaffold</h1>
        <p className="text-gray-700">Backend Status: <span className="font-semibold">{status}</span></p>
      </div>
    </div>
  )
}

export default App
