import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';

const AdminQuizResponses = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, passed, failed, suspicious

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [responsesData, quizData, statsData] = await Promise.all([
        quizService.getQuizResponses(quizId),
        quizService.getQuizById(quizId),
        quizService.getQuizStatistics(quizId),
      ]);

      setResponses(responsesData);
      setQuiz(quizData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getFilteredResponses = () => {
    if (filter === 'passed') {
      return responses.filter((r) => r.isPassed && !r.isSuspicious);
    } else if (filter === 'failed') {
      return responses.filter((r) => !r.isPassed && !r.isSuspicious);
    } else if (filter === 'suspicious') {
      return responses.filter((r) => r.isSuspicious);
    }
    return responses;
  };

  const downloadCandidateDetails = () => {
    const filteredData = getFilteredResponses();
    
    // Prepare CSV content
    const headers = ['Candidate ID', 'Name', 'Email', 'Score', 'Total Marks', 'Percentage', 'Status', 'Time Taken (min:sec)', 'Submitted At', 'Tab Switches', 'Suspicious'];
    const rows = filteredData.map((r) => [
      r.candidate.candidateId,
      r.candidate.name,
      r.candidate.email,
      r.totalScore,
      r.totalMarks,
      r.percentage.toFixed(2),
      r.isSuspicious ? 'SUSPICIOUS' : (r.isPassed ? 'PASSED' : 'FAILED'),
      `${Math.floor(r.timeTaken / 60)}:${(r.timeTaken % 60).toString().padStart(2, '0')}`,
      new Date(r.submittedAt).toLocaleString(),
      r.tabSwitchCount || 0,
      r.isSuspicious ? 'Yes' : 'No',
    ]);

    // Create CSV
    let csvContent = headers.join(',') + '\n';
    rows.forEach((row) => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz?.title}-candidates-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  const filteredResponses = getFilteredResponses();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{quiz?.title}</h1>
            <p className="text-gray-600">Responses and Analysis</p>
          </div>
          <button
            onClick={() => navigate('/admin/quiz')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Quizzes
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600 font-semibold mb-2">Total Attempts</p>
              <p className="text-4xl font-bold text-blue-600">{stats.totalAttempts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600 font-semibold mb-2">Passed</p>
              <p className="text-4xl font-bold text-green-600">{stats.passCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600 font-semibold mb-2">Failed</p>
              <p className="text-4xl font-bold text-red-600">{stats.failCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600 font-semibold mb-2">Suspicious</p>
              <p className="text-4xl font-bold text-orange-600">{stats.suspiciousCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600 font-semibold mb-2">Avg Score</p>
              <p className="text-4xl font-bold text-purple-600">{stats.averageScore}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600 font-semibold mb-2">Avg %</p>
              <p className="text-4xl font-bold text-indigo-600">{stats.averagePercentage}%</p>
            </div>
          </div>
        )}

        {/* Filter Buttons and Download */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-300'
              }`}
            >
              All ({responses.length})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                filter === 'passed'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-300'
              }`}
            >
              Passed ({responses.filter((r) => r.isPassed && !r.isSuspicious).length})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                filter === 'failed' ? 'bg-red-600 text-white' : 'bg-white text-gray-800 border border-gray-300'
              }`}
            >
              Failed ({responses.filter((r) => !r.isPassed && !r.isSuspicious).length})
            </button>
            <button
              onClick={() => setFilter('suspicious')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                filter === 'suspicious' ? 'bg-orange-600 text-white' : 'bg-white text-gray-800 border border-gray-300'
              }`}
            >
              Suspicious ({responses.filter((r) => r.isSuspicious).length})
            </button>
          </div>
          <button
            onClick={downloadCandidateDetails}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            📥 Download CSV
          </button>
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredResponses.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-600">No responses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Candidate</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Score</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Percentage</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Suspicious</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Tab Switches</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Time Taken</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Submitted At</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResponses.map((response) => (
                    <tr key={response._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{response.candidate.name}</p>
                          <p className="text-sm text-gray-600">{response.candidate.email}</p>
                          <p className="text-xs text-gray-500">{response.candidate.candidateId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {response.totalScore}/{response.totalMarks}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{response.percentage.toFixed(2)}%</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            response.isSuspicious
                              ? 'bg-orange-100 text-orange-800'
                              : response.isPassed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {response.isSuspicious ? '🚨 SUSPICIOUS' : (response.isPassed ? '✓ Passed' : '✗ Failed')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            response.isSuspicious ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {response.isSuspicious ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800">{response.tabSwitchCount || 0}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800">
                          {Math.floor(response.timeTaken / 60)}m {response.timeTaken % 60}s
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="text-gray-800">{formatDate(response.submittedAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/admin/quiz/${quizId}/response/${response._id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuizResponses;
