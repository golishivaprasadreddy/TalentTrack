import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';

const QuizDirectLink = () => {
  const { quizLink } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Quiz State
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Quiz Progress State
  const [quizStarted, setQuizStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // Monitoring State
  const [isSuspicious, setIsSuspicious] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const cameraStreamRef = React.useRef(null);
  const cameraVideoRef = React.useRef(null);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileUA = /android|iphone|ipad|ipod|mobile/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobileDevice(isMobileUA || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (!quizStarted) return;
      if (cameraStreamRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        cameraStreamRef.current = stream;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
        setCameraError('');
      } catch (error) {
        console.error('Camera error:', error);
        setCameraError('Camera access is required to take this quiz.');
      }
    };

    startCamera();
    return () => stopCamera();
  }, [quizStarted, stopCamera]);

  // Fetch quiz on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        
        // Always require authentication for secure exam flow
        if (!user) {
          navigate('/login', { state: { from: `/quiz/take/${quizLink}` } });
          return;
        }
        
        // Fetch quiz with full content (authenticated)
        const data = await quizService.getQuizViaDirectLink(quizLink);
        
        // Check if user has already submitted this quiz
        try {
          const submissionStatus = await quizService.checkQuizSubmissionStatus(data._id);
          if (submissionStatus.alreadySubmitted) {
            alert('You have already submitted this quiz. Redirecting to dashboard...');
            navigate('/candidate/dashboard');
            return;
          }
        } catch (error) {
          console.error('Error checking submission status:', error);
          // Continue anyway if check fails
        }
        
        setTimeLeft(data.duration * 60);
        
        // Initialize answers
        const initialAnswers = {};
        data.questions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
        setQuiz(data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        if (error.response?.status === 401) {
          navigate('/login', { state: { from: `/quiz/take/${quizLink}` } });
        } else {
          alert('Quiz not found or is inactive');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizLink, user, navigate]);

  // Request fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      console.log('Requesting fullscreen...');
      
      const promise = elem.requestFullscreen?.() || 
                      elem.webkitRequestFullscreen?.() || 
                      elem.mozRequestFullScreen?.() || 
                      elem.msRequestFullscreen?.();
      
      if (promise) {
        await promise;
        console.log('Fullscreen request successful');
        return true;
      } else {
        alert('Fullscreen is not supported on this browser');
        return false;
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      alert('Press F11 to enable fullscreen or allow fullscreen access');
      return false;
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFS = !!(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFS);
    };

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'];
    events.forEach(event => document.addEventListener(event, handleFullscreenChange));
    
    return () => {
      events.forEach(event => document.removeEventListener(event, handleFullscreenChange));
    };
  }, []);

  // Auto-submit function (no confirmation) - used for time-up and tab-switch
  // MUST be defined before useEffect hooks that use it
  const autoSubmitQuiz = useCallback(async (reason = 'suspicious') => {
    if (submitting) return; // Prevent double submission
    
    try {
      setSubmitting(true);
      const timeTaken = Math.floor((new Date() - startTime) / 1000);
      
      const submissionData = {
        quizId: quiz._id,
        answers: Object.entries(answers)
          .map(([idx, optIdx]) => ({
            questionId: quiz.questions[idx]._id,
            selectedOptionIndex: optIdx,
          }))
          .filter(a => a.selectedOptionIndex !== null),
        timeTaken,
        isSuspicious: reason === 'tabswitch', // Only mark as suspicious for tab switch
      };

      const result = await quizService.submitQuizAnswers(submissionData);
      
      let alertMsg;
      if (reason === 'tabswitch') {
        alertMsg = `🚨 Quiz Auto-Submitted\n\nTab switching detected! Your quiz has been automatically submitted.\n\nScore: ${result.result.totalScore}/${result.result.totalMarks}\nPercentage: ${result.result.percentage.toFixed(2)}%\n\nThis attempt is marked as SUSPICIOUS and will be reviewed.`;
      } else if (reason === 'timeup') {
        alertMsg = `⏰ Time's Up!\n\nYour quiz has been automatically submitted.\n\nScore: ${result.result.totalScore}/${result.result.totalMarks}\nPercentage: ${result.result.percentage.toFixed(2)}%\nStatus: ${result.result.isPassed ? '✅ PASSED' : '❌ FAILED'}`;
      } else {
        alertMsg = `🚨 SUSPICIOUS\n\nYour attempt is marked as SUSPICIOUS.\n\nScore: ${result.result.totalScore}/${result.result.totalMarks}\nPercentage: ${result.result.percentage.toFixed(2)}%\n\nThis attempt will be reviewed by the admin.`;
      }
      
      alert(alertMsg);
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      stopCamera();
      navigate('/candidate/dashboard');
    } catch (error) {
      alert('Error submitting quiz: ' + (error.response?.data?.error || error.message));
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  }, [startTime, quiz, answers, navigate, submitting]);

  // Prevent copy/cut keyboard shortcuts during quiz
  useEffect(() => {
    if (!quizStarted) return;

    const preventCopyPaste = (e) => {
      // Prevent Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
      // Prevent F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', preventCopyPaste);
    
    return () => {
      document.removeEventListener('keydown', preventCopyPaste);
    };
  }, [quizStarted]);

  // Tab monitoring - Auto-submit on tab switch
  useEffect(() => {
    if (!quizStarted || submitting) {
      console.log('Quiz not started or already submitting, tab monitoring disabled');
      return;
    }

    console.log('Tab monitoring enabled - will auto-submit on tab switch');

    const handleVisibilityChange = () => {
      console.log('Visibility event fired. Hidden:', document.hidden);
      
      if (document.hidden && !isSuspicious && !submitting) {
        console.log('Tab switch detected - auto-submitting quiz!');
        setIsSuspicious(true);
        autoSubmitQuiz('tabswitch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      console.log('Removing tab monitoring');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quizStarted, isSuspicious, submitting, autoSubmitQuiz]);

  // Manual submit with confirmation
  const handleSubmit = useCallback(async () => {
    if (!window.confirm('Are you sure you want to submit the quiz?')) return;

    try {
      setSubmitting(true);
      const timeTaken = Math.floor((new Date() - startTime) / 1000);
      
      const submissionData = {
        quizId: quiz._id,
        answers: Object.entries(answers)
          .map(([idx, optIdx]) => ({
            questionId: quiz.questions[idx]._id,
            selectedOptionIndex: optIdx,
          }))
          .filter(a => a.selectedOptionIndex !== null),
        timeTaken,
        isSuspicious, // Send suspicious status to backend
      };

      const result = await quizService.submitQuizAnswers(submissionData);
      
      // If suspicious, show only SUSPICIOUS status (third group - neither pass nor fail)
      let alertMsg;
      if (isSuspicious) {
        alertMsg = `🚨 SUSPICIOUS\n\nYour attempt is marked as SUSPICIOUS.\n\nScore: ${result.result.totalScore}/${result.result.totalMarks}\nPercentage: ${result.result.percentage.toFixed(2)}%\n\nThis attempt will be reviewed by the admin.`;
      } else {
        // Normal case - show pass/fail status
        alertMsg = `Quiz Submitted!\n\nScore: ${result.result.totalScore}/${result.result.totalMarks}\nPercentage: ${result.result.percentage.toFixed(2)}%\nStatus: ${result.result.isPassed ? '✅ PASSED' : '❌ FAILED'}`;
      }
      
      alert(alertMsg);
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      stopCamera();
      navigate('/candidate/dashboard');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  }, [startTime, quiz, answers, isSuspicious, navigate]);

  // Timer
  useEffect(() => {
    if (!quizStarted || timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          autoSubmitQuiz('timeup');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, autoSubmitQuiz]);

  // Start quiz
  const startQuiz = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
      setCameraError('');
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Camera access is required to take this quiz.');
      alert('Camera access is required to start the quiz.');
      return;
    }
    const fullscreenOk = isFullscreen || (await requestFullscreen());
    if (!fullscreenOk) {
      stopCamera();
      alert('Fullscreen mode is required to start the quiz.');
      return;
    }
    setQuizStarted(true);
    setStartTime(new Date());
  }, [isFullscreen, requestFullscreen, stopCamera]);

  // Handle answer change
  const handleAnswerChange = (index, value) => {
    if (isSuspicious) {
      alert('Cannot answer - your attempt is marked as suspicious');
      return;
    }
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  // Format time
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-500">Loading quiz...</div>;
  }

  if (isMobileDevice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg p-8 max-w-md w-full rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Laptop Required</h1>
          <p className="text-gray-700">
            This quiz can only be taken on a laptop or desktop device. Please switch to a
            larger screen and try again.
          </p>
        </div>
      </div>
    );
  }

  // Pre-quiz screen (authentication already enforced)
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg p-8 max-w-md w-full rounded-lg">
          <h1 className="text-3xl font-bold mb-2">{quiz?.title}</h1>
          <p className="text-gray-600 mb-6">{quiz?.description}</p>
          
          <div className="mb-6 bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
            <h3 className="font-bold text-yellow-900 mb-3">⚠️ Security Requirements</h3>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>✓ Fullscreen mode is <strong>required</strong></li>
              <li>✓ Camera access is <strong>required</strong></li>
              <li>✓ Tab switching will <strong>auto-submit</strong> your quiz immediately</li>
              <li>✓ Copy and paste are <strong>disabled</strong></li>
            </ul>
            {cameraError && (
              <p className="text-xs text-red-600 font-semibold mt-3">{cameraError}</p>
            )}
          </div>

          <button 
            onClick={requestFullscreen} 
            className={`w-full py-2 rounded mb-2 font-semibold transition ${
              isFullscreen 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isFullscreen ? '✓ Fullscreen Active' : 'Enter Fullscreen Mode'}
          </button>

          <button 
            onClick={startQuiz} 
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold transition"
          >
            Start Quiz (Camera + Fullscreen)
          </button>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const question = quiz.questions[currentQuestionIndex];

  return (
    <div 
      className="w-full h-screen bg-white flex flex-col overflow-hidden select-none"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="border-b bg-gray-100 p-4 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="font-bold text-lg">{quiz.title}</h1>
          <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold tabular-nums ${timeLeft < 300 ? 'text-red-600' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="mt-2 flex justify-end">
            {cameraError ? (
              <div className="text-xs text-red-600 font-semibold">{cameraError}</div>
            ) : (
              <video
                ref={cameraVideoRef}
                autoPlay
                muted
                playsInline
                className="w-24 h-16 rounded border border-gray-300 object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-xl font-semibold mb-2">{question.questionText}</h2>
        <p className="text-sm text-gray-600 mb-6">Marks: <strong>{question.marks}</strong></p>
        
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <label key={idx} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
              <input 
                type="radio" 
                checked={answers[currentQuestionIndex] === idx} 
                onChange={() => handleAnswerChange(currentQuestionIndex, idx)} 
                disabled={isSuspicious}
                className="mr-4 cursor-pointer"
              />
              <span className="text-gray-800">{option.text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t bg-gray-100 p-4 flex-shrink-0">
        <div className="flex justify-between items-center gap-4 mb-4">
          <button 
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} 
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 transition font-semibold"
          >
            ← Previous
          </button>

          <div className="flex gap-1 flex-wrap justify-center">
            {quiz.questions.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentQuestionIndex(idx)} 
                className={`w-8 h-8 rounded text-xs font-bold transition ${
                  answers[idx] !== null 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-300 text-gray-700'
                } ${currentQuestionIndex === idx ? 'ring-2 ring-blue-500' : ''}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))} 
              disabled={currentQuestionIndex === quiz.questions.length - 1}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 transition font-semibold"
            >
              Next →
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={submitting}
              className={`px-6 py-2 text-white rounded font-bold transition ${
                isSuspicious 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>

      {/* Suspicious Alert */}
      {isSuspicious && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-xs">
          <strong>🚨 SUSPICIOUS ACTIVITY</strong>
          <p className="text-sm mt-1">Your attempt has been marked as suspicious and will be reviewed by the panel.</p>
        </div>
      )}
    </div>
  );
};

export default QuizDirectLink;
