import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';

const CandidateQuizResult = () => {
  const { quizResultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    fetchResult();
  }, [quizResultId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const data = await quizService.getCandidateQuizResult(quizResultId);
      setResult(data);
    } catch (error) {
      console.error('Error fetching result:', error);
      alert('Result not found');
      navigate('/candidate/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionExpand = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return <div className="text-center p-8">Loading result...</div>;
  }

  if (!result) {
    return <div className="text-center p-8">Result not found</div>;
  }

  const { quiz, candidate, totalScore, totalMarks, percentage, isPassed, timeTaken, answers } = result;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Result Header */}
        <div className={`p-8 rounded-lg shadow-md mb-6 ${isPassed ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-gray-800">{quiz.title}</h1>
            <p className={`text-2xl font-bold mb-6 ${isPassed ? 'text-green-700' : 'text-red-700'}`}>
              {isPassed ? '✅ PASSED' : '❌ FAILED'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600 font-semibold">Your Score</p>
              <p className="text-3xl font-bold text-blue-600">{totalScore}</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600 font-semibold">Total Marks</p>
              <p className="text-3xl font-bold text-gray-800">{totalMarks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600 font-semibold">Percentage</p>
              <p className="text-3xl font-bold text-purple-600">{percentage.toFixed(2)}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-gray-600 font-semibold">Time Taken</p>
              <p className="text-2xl font-bold text-orange-600">{formatTime(timeTaken)}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-700">
              Passing Marks: <span className="font-bold">{quiz.passingMarks}</span>
            </p>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 font-semibold">Candidate Name</p>
              <p className="text-lg text-gray-800">{candidate.name}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Email</p>
              <p className="text-lg text-gray-800">{candidate.email}</p>
            </div>
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Answer Review</h2>
          
          {quiz.questions.map((question, index) => {
            const answer = answers[index];
            const isAnswerCorrect = answer?.isCorrect;
            const selectedOption = answer ? question.options[answer.selectedOptionIndex] : null;
            const correctOptionIndex = question.correctOptionIndex;
            const correctOption = question.options[correctOptionIndex];

            return (
              <div key={question._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  onClick={() => toggleQuestionExpand(index)}
                  className={`p-6 cursor-pointer flex justify-between items-start ${
                    isAnswerCorrect ? 'bg-green-50 border-l-4 border-green-600' : 'bg-red-50 border-l-4 border-red-600'
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
                  <div className="ml-4">
                    {expandedQuestions[index] ? '▼' : '▶'}
                  </div>
                </div>

                {expandedQuestions[index] && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-gray-800 mb-3">Your Answer:</p>
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

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateQuizResult;
