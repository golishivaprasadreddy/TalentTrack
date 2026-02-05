import React, { useState, useEffect, useCallback } from 'react';
import candidateService from '../services/candidateService';
import Footer from '../components/Footer';

const CandidateDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await candidateService.getDashboard();
      setDashboard(data);
      console.log('Dashboard data updated at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately on mount
    fetchDashboard();
    
    // Auto-refresh every 5 seconds to show real-time updates
    const interval = setInterval(fetchDashboard, 5000);
    
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!dashboard) {
    return <div className="text-center p-8">Failed to load dashboard</div>;
  }

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen flex-grow">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">My Dashboard</h1>

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={fetchDashboard}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              refreshing 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Results'}
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Candidate ID</p>
              <p className="text-xl font-semibold">{dashboard.candidateId}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="text-xl font-semibold">{dashboard.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-xl font-semibold">{dashboard.email}</p>
            </div>
          </div>
        </div>

        {/* Recruitment Drive Info */}
        {dashboard.recruitmentDrive && (
          <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">Recruitment Drive</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Drive Name</p>
                <p className="text-xl font-semibold">
                  {dashboard.recruitmentDrive.name}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Company</p>
                <p className="text-xl font-semibold">
                  {dashboard.recruitmentDrive.company}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-2">Current Status</h2>
          <p className="text-3xl font-bold">{dashboard.currentStatus}</p>
        </div>

        {/* Results Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Selection History</h2>
          {dashboard.results && dashboard.results.length > 0 ? (
            <div className="space-y-4">
              {/* Main section - only show Selected results */}
              {dashboard.results
                .filter(result => result.decision === 'selected')
                .map((result, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center p-4 border-l-4 border-green-600 bg-green-50 rounded-r-lg transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-800">
                        {result.round?.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Round {result.round?.sequenceNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-2xl font-bold mb-1">✅</span>
                      <p className="font-semibold text-green-600">Selected</p>
                    </div>
                  </div>
                ))}
              
              {/* Show only pending rounds in Awaiting Evaluation section */}
              {dashboard.results.filter(r => r.status === '⏳ Under Review').length > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <p className="text-gray-600 font-semibold mb-3">⏳ Awaiting Evaluation</p>
                  {dashboard.results
                    .filter(result => result.status === '⏳ Under Review')
                    .map((result, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg mb-2 transition-all"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {result.round?.name}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Round {result.round?.sequenceNumber}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-yellow-600">
                          Under Review...
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">⏳ Waiting for evaluation results...</p>
              <p className="text-gray-500 text-sm mt-2">
                Your results will appear here once the panel evaluates your performance.
              </p>
            </div>
          )}
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-bold text-amber-900 mb-2">
            Privacy Notice
          </h3>
          <p className="text-amber-800">
            You only see your selection status (Selected/Not Selected/Under Review).
            Scores and panel comments are confidential and visible only to the
            admin team.
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default CandidateDashboard;
