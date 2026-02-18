import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';

const CandidateTakeQuiz = () => {
  const { quizLink } = useParams();
  const navigate = useNavigate();
  const { user, candidate } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizLink]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuizByLink(quizLink);
      setQuiz(data);
      setTimeLeft(data.duration * 60);
      initializeAnswers(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Quiz not found or is inactive');
      navigate('/candidate/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const initializeAnswers = (quizData) => {
    const initialAnswers = {};
    quizData.questions.forEach((q, index) => {
      initialAnswers[index] = null;
    });
    setAnswers(initialAnswers);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (!window.confirm('Are you sure you want to submit the quiz?')) {
      return;
    }

    try {
      setSubmitting(true);

      const endTime = new Date();
      const timeTaken = Math.floor((endTime - startTime) / 1000);

      const submissionData = {
        quizId: quiz._id,
        candidateId: candidate?._id,
        answers: Object.entries(answers)
          .map(([questionIndex, optionIndex]) => ({
            questionId: quiz.questions[questionIndex]._id,
            selectedOptionIndex: optionIndex,
          }))
          .filter((ans) => ans.selectedOptionIndex !== null),
        timeTaken,
      };

      const result = await quizService.submitQuizAnswers(submissionData);
      
      alert(
        `Quiz Submitted!\n\nYour Score: ${result.result.totalScore}/${result.result.totalMarks}\nPercentage: ${result.result.percentage.toFixed(2)}%\nStatus: ${result.result.isPassed ? 'PASSED' : 'FAILED'}`
      );
      
      navigate('/candidate/dashboard');
    } catch (error) {
      alert('Error submitting quiz: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-center p-8">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="text-center p-8">Quiz not found</div>;
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">{quiz.title}</h1>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <p className="text-gray-700 mb-4">{quiz.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600 font-semibold">Total Questions</p>
                <p className="text-2xl font-bold text-blue-600">{quiz.totalQuestions}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600 font-semibold">Total Marks</p>
                <p className="text-2xl font-bold text-blue-600">{quiz.totalMarks}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600 font-semibold">Passing Marks</p>
                <p className="text-2xl font-bold text-green-600">{quiz.passingMarks}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600 font-semibold">Duration</p>
                <p className="text-2xl font-bold text-orange-600">{quiz.duration} minutes</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <p className="font-semibold text-gray-800 mb-2">⚠️ Instructions:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Once you start the quiz, you cannot pause it</li>
                <li>The timer will auto-submit your quiz when time is up</li>
                <li>You can navigate between questions using previous/next buttons</li>
                <li>Review your answers before submitting</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold text-lg"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.values(answers).filter((ans) => ans !== null).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
            <p className="text-gray-600">Question {currentQuestionIndex + 1} of {quiz.totalQuestions}</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${timeLeft <= 300 ? 'bg-red-100' : 'bg-blue-100'}`}>
            <p className="text-sm text-gray-600">Time Left</p>
            <p className={`text-3xl font-bold ${timeLeft <= 300 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
              <p className="text-lg font-semibold mb-4 text-gray-800">{currentQuestion.questionText}</p>
              <p className="text-sm text-gray-500 mb-4">Marks: {currentQuestion.marks}</p>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      answers[currentQuestionIndex] === index
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        checked={answers[currentQuestionIndex] === index}
                        onChange={() => handleAnswerSelect(index)}
                        className="mr-3"
                      />
                      <label className="cursor-pointer flex-1 font-medium text-gray-800">
                        {option.text}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Next
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-semibold"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>

          {/* Question List Sidebar */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
            <p className="font-bold text-gray-800 mb-4">Questions ({answeredCount}/{quiz.totalQuestions})</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-full p-2 rounded-lg text-sm font-semibold transition ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[index] !== null
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Q{index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateTakeQuiz;
