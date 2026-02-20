import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';

const AdminQuizResponseDetail = () => {
  const { quizId, responseId } = useParams();
  const navigate = useNavigate();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const fetchResponse = useCallback(async () => {
    try {
      setLoading(true);
      const data = await quizService.getCandidateQuizResult(responseId);
      setResponse(data);
    } catch (error) {
      console.error('Error fetching response:', error);
      alert('Response not found');
      navigate(`/admin/quiz/${quizId}/responses`);
    } finally {
      setLoading(false);
    }
  }, [responseId, navigate, quizId]);

  useEffect(() => {
    fetchResponse();
  }, [fetchResponse]);

  const toggleQuestionExpand = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!response) {
    return <div className="text-center p-8">Response not found</div>;
  }

  const { quiz, candidate, totalScore, totalMarks, percentage, isPassed, timeTaken, answers } = response;

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Response Detail</h1>
          <button
            onClick={() => navigate(`/admin/quiz/${quizId}/responses`)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back
          </button>
        </div>

        {/* Result Summary */}
        <div className={`p-8 rounded-lg shadow-md mb-6 ${isPassed ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600 font-semibold">Candidate</p>
              <p className="text-lg font-bold text-gray-800">{candidate.name}</p>
              <p className="text-xs text-gray-600">{candidate.email}</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600 font-semibold">Score</p>
              <p className="text-3xl font-bold text-blue-600">{totalScore}/{totalMarks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600 font-semibold">Percentage</p>
              <p className="text-3xl font-bold text-purple-600">{percentage.toFixed(2)}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600 font-semibold">Time Taken</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 font-semibold">Quiz Title</p>
              <p className="font-bold text-gray-800">{quiz.title}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 font-semibold">Passing Marks</p>
              <p className="font-bold text-gray-800">{quiz.passingMarks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 font-semibold">Status</p>
              <p className={`font-bold ${isPassed ? 'text-green-700' : 'text-red-700'}`}>
                {isPassed ? '✅ PASSED' : '❌ FAILED'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 font-semibold">Total Questions</p>
              <p className="font-bold text-gray-800">{quiz.questions.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 font-semibold">Correct Answers</p>
              <p className="font-bold text-green-600">{answers.filter((a) => a.isCorrect).length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600 font-semibold">Submitted At</p>
              <p className="font-bold text-gray-800 text-sm">{formatDate(response.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Questions Detail */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Question Review</h2>

          {quiz.questions.map((question, index) => {
            const answer = answers[index];
            const isAnswerCorrect = answer?.isCorrect;
            const selectedOption = answer
              ? question.options[answer.selectedOptionIndex]
              : null;
            const correctOptionIndex = question.correctOptionIndex;
            const correctOption = question.options[correctOptionIndex];

            return (
              <div key={question._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  onClick={() => toggleQuestionExpand(index)}
                  className={`p-6 cursor-pointer flex justify-between items-start ${
                    isAnswerCorrect
                      ? 'bg-green-50 border-l-4 border-green-600'
                      : 'bg-red-50 border-l-4 border-red-600'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 mb-2">
                      Q{index + 1}: {question.questionText}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Marks: {question.marks}</span>
                      <span>Difficulty: {question.difficulty}</span>
                      <span className={isAnswerCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                        {isAnswerCorrect ? `✓ Correct (+${question.marks})` : '✗ Incorrect (0)'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 text-gray-600">
                    {expandedQuestions[index] ? '▼' : '▶'}
                  </div>
                </div>

                {expandedQuestions[index] && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-gray-800 mb-3">Candidate's Answer:</p>
                        {selectedOption ? (
                          <div className={`p-3 rounded-lg ${isAnswerCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                            <p className={isAnswerCorrect ? 'text-green-800' : 'text-red-800'}>
                              {selectedOption.text}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-gray-100">
                            <p className="text-gray-800">Not answered</p>
                          </div>
                        )}
                      </div>

                      {!isAnswerCorrect && (
                        <div>
                          <p className="font-semibold text-gray-800 mb-3">Correct Answer:</p>
                          <div className="p-3 rounded-lg bg-green-100">
                            <p className="text-green-800">{correctOption.text}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-gray-800 mb-3">All Options:</p>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg ${
                                optIndex === correctOptionIndex
                                  ? 'bg-green-100 border-2 border-green-600'
                                  : optIndex === answer?.selectedOptionIndex && !isAnswerCorrect
                                  ? 'bg-red-100 border-2 border-red-600'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <p className="text-gray-800">
                                {optIndex === correctOptionIndex && '✓ '}
                                {optIndex === answer?.selectedOptionIndex && !isAnswerCorrect && '✗ '}
                                {option.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminQuizResponseDetail;
