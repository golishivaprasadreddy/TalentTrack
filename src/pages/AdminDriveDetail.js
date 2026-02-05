import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import Footer from '../components/Footer';

const AdminDriveDetail = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [roundData, setRoundData] = useState({
    name: '',
    description: '',
    sequenceNumber: 1,
  });
  const [panelMembers, setPanelMembers] = useState([]);
  const [showPanelModal, setShowPanelModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedPanels, setSelectedPanels] = useState([]);

  useEffect(() => {
    fetchDriveDetails();
    fetchPanelMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveId]);

  const fetchDriveDetails = async () => {
    try {
      const data = await adminService.getDriveDetails(driveId);
      setDrive(data);
    } catch (error) {
      console.error('Error fetching drive details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPanelMembers = async () => {
    try {
      const data = await adminService.getPanelMembers();
      setPanelMembers(data);
    } catch (error) {
      console.error('Error fetching panel members:', error);
    }
  };



  const handleAddRound = async (e) => {
    e.preventDefault();
    try {
      await adminService.addRound(driveId, roundData);
      setRoundData({ name: '', description: '', sequenceNumber: drive.rounds.length + 1 });
      setShowRoundForm(false);
      fetchDriveDetails();
    } catch (error) {
      console.error('Error adding round:', error);
    }
  };

  const openPanelModal = (round) => {
    setSelectedRound(round);
    setSelectedPanels(round.panelMembers ? round.panelMembers.map(p => p._id) : []);
    setShowPanelModal(true);
  };

  const handlePanelSelection = (panelId) => {
    setSelectedPanels(prev => {
      if (prev.includes(panelId)) {
        return prev.filter(id => id !== panelId);
      } else {
        return [...prev, panelId];
      }
    });
  };

  const handleAssignPanel = async () => {
    try {
      await adminService.assignPanelToRound(selectedRound._id, selectedPanels);
      setShowPanelModal(false);
      setSelectedRound(null);
      setSelectedPanels([]);
      fetchDriveDetails();
      alert('Panel members assigned successfully!');
    } catch (error) {
      console.error('Error assigning panel:', error);
      alert('Error assigning panel members. Please try again.');
    }
  };



  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!drive) {
    return <div className="text-center p-8">Drive not found</div>;
  }

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen flex-grow">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            ← Back
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{drive.name}</h1>
          <p className="text-gray-600">
            <strong>Company:</strong> {drive.company}
          </p>
          <p className="text-gray-600">
            <strong>Status:</strong>{' '}
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {drive.status}
            </span>
          </p>
          <p className="text-gray-600 mt-2">{drive.description}</p>
        </div>

        <div className="flex space-x-4 mb-6">
          {['overview', 'rounds', 'candidates'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-2">Total Rounds</p>
                <p className="text-3xl font-bold text-blue-600">{drive.rounds.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-2">Status</p>
                <p className="text-2xl font-bold text-green-600">{drive.status}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rounds' && (
          <div>
            <button
              onClick={() => setShowRoundForm(!showRoundForm)}
              className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {showRoundForm ? 'Cancel' : 'Add New Round'}
            </button>

            {showRoundForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-2xl font-bold mb-4">Create New Round</h3>
                <form onSubmit={handleAddRound}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Round Name
                      </label>
                      <input
                        type="text"
                        value={roundData.name}
                        onChange={(e) =>
                          setRoundData({ ...roundData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., Round 1, Technical, HR"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Sequence Number
                      </label>
                      <input
                        type="number"
                        value={roundData.sequenceNumber}
                        onChange={(e) =>
                          setRoundData({
                            ...roundData,
                            sequenceNumber: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Description
                      </label>
                      <textarea
                        value={roundData.description}
                        onChange={(e) =>
                          setRoundData({ ...roundData, description: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        rows="3"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Create Round
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drive.rounds && drive.rounds.length > 0 ? (
                drive.rounds.map((round) => (
                  <div key={round._id} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-blue-600 mb-2">{round.name}</h3>
                    <p className="text-gray-600 mb-2">
                      <strong>Sequence:</strong> {round.sequenceNumber}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Status:</strong> {round.status}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Candidates:</strong>{' '}
                      {round.candidates && round.candidates.length > 0 ? (
                        <span className="text-green-600">{round.candidates.length} assigned</span>
                      ) : (
                        <span className="text-red-500">No candidates</span>
                      )}
                    </p>
                    <p className="text-gray-600 mb-4">
                      <strong>Panel Members:</strong>{' '}
                      {round.panelMembers && round.panelMembers.length > 0 ? (
                        <span>
                          {round.panelMembers.length} assigned
                          <div className="text-sm text-gray-500 mt-1">
                            {round.panelMembers.map(p => p.name).join(', ')}
                          </div>
                        </span>
                      ) : (
                        <span className="text-red-500">Not assigned</span>
                      )}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openPanelModal(round)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                      >
                        Assign Panel
                      </button>
                      <a
                        href={`/admin/round/${round._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm inline-block"
                      >
                        Manage Round
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No rounds yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Candidates</h2>
            {drive.candidates && drive.candidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200 border-b-2 border-gray-400">
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Current Round</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drive.candidates.map((candidate) => (
                      <tr key={candidate._id} className="border-b border-gray-300 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 font-medium">{candidate.name}</td>
                        <td className="px-4 py-3 text-gray-600">{candidate.email}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {candidate.currentRound ? (
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {candidate.currentRound}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {candidate.status === 'selected' && (
                            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              Selected
                            </span>
                          )}
                          {candidate.status === 'rejected' && (
                            <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                              Rejected
                            </span>
                          )}
                          {candidate.status === 'pending' && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm max-w-xs truncate">
                          {candidate.feedback || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No candidates assigned to this drive yet.</p>
            )}
          </div>
        )}

        {/* Panel Assignment Modal */}
        {showPanelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                Assign Panel Members to {selectedRound?.name}
              </h2>
              
              {panelMembers.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {panelMembers.map((panel) => (
                    <div
                      key={panel._id}
                      className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        id={`panel-${panel._id}`}
                        checked={selectedPanels.includes(panel._id)}
                        onChange={() => handlePanelSelection(panel._id)}
                        className="w-5 h-5 text-blue-600 mr-3"
                      />
                      <label
                        htmlFor={`panel-${panel._id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-semibold text-gray-800">{panel.name}</div>
                        <div className="text-sm text-gray-600">{panel.email}</div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 mb-6">No panel members available.</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPanelModal(false);
                    setSelectedRound(null);
                    setSelectedPanels([]);
                  }}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPanel}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                  disabled={selectedPanels.length === 0}
                >
                  Assign {selectedPanels.length} Panel Member{selectedPanels.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </>
  );
};

export default AdminDriveDetail;
