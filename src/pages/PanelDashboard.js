import React, { useState, useEffect } from 'react';
import panelService from '../services/panelService';
import Footer from '../components/Footer';

const PanelDashboard = () => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllRounds();
  }, []);

  const fetchAllRounds = async () => {
    try {
      const data = await panelService.getAssignedRounds();
      setRounds(data);
    } catch (error) {
      console.error('Error fetching rounds:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen flex-grow">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Panel Member Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-2">Available Rounds</p>
            <p className="text-3xl font-bold text-blue-600">{rounds.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rounds.map((round) => (
            <div key={round._id} className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition ${
              round.isAssigned ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-300'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-blue-600">{round.name}</h3>
                {round.isAssigned ? (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Assigned
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                    View Only
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">
                <strong>Drive:</strong> {round.recruitmentDrive?.name || 'N/A'}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Sequence:</strong> {round.sequenceNumber}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Status:</strong> {round.status}
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Candidates:</strong> {round.candidates ? round.candidates.length : 0}
              </p>
              <a
                href={`/panel/round/${round._id}`}
                className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  round.isAssigned 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {round.isAssigned ? 'Evaluate →' : 'View Results →'}
              </a>
            </div>
          ))}
        </div>

        {rounds.length === 0 && (
          <div className="text-center p-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No rounds available yet.</p>
            <p className="text-gray-500">Check back later for recruitment rounds.</p>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
};

export default PanelDashboard;
