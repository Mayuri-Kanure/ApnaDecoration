import React, { useState } from 'react'

const Dashboard = () => {
  const [enabled, setEnabled] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    value: ''
  })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    if (!enabled) return

    // API ready
    console.log('Saved Data:', form)
    alert('Settings saved successfully')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Settings Configuration
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and configure your application settings
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          
          {/* Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                Enable Feature
              </h2>
              <p className="text-sm text-gray-500">
                Turn this setting on or off
              </p>
            </div>

            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition
                ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition
                  ${enabled ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                disabled={!enabled}
                placeholder="Enter title"
                className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={!enabled}
                placeholder="Enter description"
                className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                name="value"
                value={form.value}
                onChange={handleChange}
                disabled={!enabled}
                placeholder="Enter value"
                className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={!enabled}
              className="px-5 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
