import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';

const CandidateQuizDashboard = () => {
  const navigate = useNavigate();
  const { candidate } = useAuth();
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkedQuiz, setLinkedQuiz] = useState('');
  const [error, setError] = useState('');

  const fetchQuizHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await quizService.getCandidateQuizzes(candidate._id);
      setQuizHistory(data);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
    } finally {
      setLoading(false);
    }
  }, [candidate]);

  useEffect(() => {
    if (candidate?._id) {
      fetchQuizHistory();
    }
  }, [candidate?._id, fetchQuizHistory]);

  const handleLoadQuizByLink = async () => {
    if (!linkedQuiz.trim()) {
      setError('Please enter a valid quiz link');
      return;
    }

    try {
      // Extract the quiz link from URL if full URL is provided
      let quizLinkStr = linkedQuiz.trim();
      if (linkedQuiz.includes('/')) {
        quizLinkStr = linkedQuiz.split('/').pop();
      }

      // Navigate to the SECURE quiz page with fullscreen & tab monitoring
      navigate(`/quiz/take/${quizLinkStr}`);
    } catch (err) {
      setError('Invalid quiz link');
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Quiz Dashboard</h1>

        {/* Access Quiz by Link */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Access Quiz</h2>
          <p className="text-gray-600 mb-4">Enter the quiz link provided by your recruiter</p>
                     
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={linkedQuiz}
              onChange={(e) => {
                setLinkedQuiz(e.target.value);
                setError('');
              }}
              placeholder="Paste quiz link or link ID here..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLoadQuizByLink}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Load Quiz
            </button>
          </div>
          
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        {/* Quiz History */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Quiz History</h2>

          {loading ? (
            <div className="text-center p-8 bg-white rounded-lg">
              <p className="text-gray-600">Loading quiz history...</p>
            </div>
          ) : quizHistory.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg">
              <p className="text-gray-600">No quizzes taken yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quiz Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date Taken</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizHistory.map((quiz) => (
                      <tr key={quiz._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-800 font-medium">{quiz.quiz.title}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(quiz.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateQuizDashboard;
