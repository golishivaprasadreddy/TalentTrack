import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    company: '',
    startDate: '',
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const data = await adminService.getAllDrives();
      setDrives(data);
    } catch (error) {
      console.error('Error fetching drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      await adminService.createRecruitmentDrive(formData);
      setFormData({ name: '', description: '', company: '', startDate: '' });
      setShowForm(false);
      fetchDrives();
    } catch (error) {
      console.error('Error creating drive:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen flex-grow">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          {showForm ? 'Cancel' : 'Create New Recruitment Drive'}
        </button>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">Create Recruitment Drive</h2>
            <form onSubmit={handleCreateDrive}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Drive Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Create Drive
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drives.map((drive) => (
            <div key={drive._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-blue-600 mb-2">{drive.name}</h3>
              <p className="text-gray-600 mb-2">
                <strong>Company:</strong> {drive.company}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Status:</strong> {drive.status}
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Rounds:</strong> {drive.rounds ? drive.rounds.length : 0}
              </p>
              <a
                href={`/admin/drive/${drive._id}`}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Manage Drive →
              </a>
            </div>
          ))}
        </div>

        {drives.length === 0 && !showForm && (
          <div className="text-center p-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No recruitment drives yet.</p>
            <p className="text-gray-500">Create one to get started!</p>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
