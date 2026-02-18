import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (candidate?._id) {
      fetchQuizHistory();
    }
  }, [candidate?._id]);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const data = await quizService.getCandidateQuizzes(candidate._id);
      setQuizHistory(data);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
    } finally {
      setLoading(false);
    }
  };

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

      // Navigate to the quiz page
      navigate(`/quiz/${quizLinkStr}`);
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
            <div className="space-y-4">
              {quizHistory.map((quiz) => (
                <div
                  key={quiz._id}
                  className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${
                    quiz.isPassed ? 'border-green-600' : 'border-red-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{quiz.quiz.title}</h3>
                      <p className="text-gray-600 text-sm">Category: {quiz.quiz.category}</p>
                    </div>
                    <div className={`text-right font-bold ${quiz.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                      {quiz.isPassed ? '✅ PASSED' : '❌ FAILED'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Your Score</p>
                      <p className="font-bold text-gray-800">
                        {quiz.totalScore}/{quiz.totalMarks}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Percentage</p>
                      <p className="font-bold text-gray-800">{quiz.percentage.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Time Taken</p>
                      <p className="font-bold text-gray-800">
                        {Math.floor(quiz.timeTaken / 60)}m {quiz.timeTaken % 60}s
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Passing Marks</p>
                      <p className="font-bold text-gray-800">{quiz.quiz.passingMarks}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date Taken</p>
                      <p className="font-bold text-gray-800 text-xs">
                        {formatDate(quiz.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/quiz/result/${quiz._id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateQuizDashboard;
