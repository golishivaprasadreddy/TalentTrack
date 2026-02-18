import React, { useState, useEffect } from 'react';
import quizService from '../services/quizService';
import { useNavigate } from 'react-router-dom';

const AdminQuizManagement = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'JavaScript',
    totalMarks: 100,
    passingMarks: 40,
    duration: 30,
    recruitmentDrive: '',
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    marks: 1,
    questionType: 'MCQ',
    difficulty: 'medium',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalMarks' || name === 'passingMarks' || name === 'duration' ? parseInt(value) : value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: name === 'marks' ? parseInt(value) : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index].text = value;
    setCurrentQuestion((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleCorrectOptionChange = (index) => {
    const newOptions = currentQuestion.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setCurrentQuestion((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText || currentQuestion.options.some((opt) => !opt.text)) {
      alert('Please fill all fields');
      return;
    }

    if (!currentQuestion.options.some((opt) => opt.isCorrect)) {
      alert('Please select a correct option');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, _id: Date.now() }],
    }));

    setCurrentQuestion({
      questionText: '',
      marks: 1,
      questionType: 'MCQ',
      difficulty: 'medium',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    });
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    if (formData.questions.length === 0) {
      alert('Quiz must have at least one question');
      return;
    }

    try {
      const quizPayload = {
        ...formData,
        questions: formData.questions.map((q) => ({
          questionText: q.questionText,
          marks: q.marks,
          questionType: q.questionType,
          difficulty: q.difficulty,
          options: q.options,
        })),
      };

      if (editingQuiz) {
        await quizService.updateQuiz(editingQuiz._id, quizPayload);
      } else {
        await quizService.createQuiz(quizPayload);
      }

      setFormData({
        title: '',
        description: '',
        category: 'JavaScript',
        totalMarks: 100,
        passingMarks: 40,
        duration: 30,
        recruitmentDrive: '',
        questions: [],
      });
      setShowForm(false);
      setEditingQuiz(null);
      fetchQuizzes();
    } catch (error) {
      alert('Error saving quiz: ' + error.message);
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      duration: quiz.duration,
      recruitmentDrive: quiz.recruitmentDrive || '',
      questions: quiz.questions || [],
    });
    setShowForm(true);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizService.deleteQuiz(quizId);
        fetchQuizzes();
      } catch (error) {
        alert('Error deleting quiz: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (quizId) => {
    try {
      await quizService.toggleQuizStatus(quizId);
      fetchQuizzes();
    } catch (error) {
      alert('Error updating quiz status: ' + error.message);
    }
  };

  const copyQuizLink = (quizLink) => {
    const link = `${window.location.origin}/quiz/${quizLink}`;
    navigator.clipboard.writeText(link);
    alert('Quiz link copied to clipboard!');
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Quiz Management</h1>
          <button
            onClick={() => {
              setEditingQuiz(null);
              setFormData({
                title: '',
                description: '',
                category: 'JavaScript',
                totalMarks: 100,
                passingMarks: 40,
                duration: 30,
                recruitmentDrive: '',
                questions: [],
              });
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {showForm ? 'Cancel' : 'Create New Quiz'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-6">{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h2>
            <form onSubmit={handleCreateQuiz}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Quiz Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>JavaScript</option>
                    <option>Python</option>
                    <option>Java</option>
                    <option>C++</option>
                    <option>React</option>
                    <option>Node.js</option>
                    <option>SQL</option>
                    <option>MongoDB</option>
                    <option>General</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Total Marks</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Passing Marks</label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold mb-4">Add Questions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Question Text</label>
                    <textarea
                      name="questionText"
                      value={currentQuestion.questionText}
                      onChange={handleQuestionChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows="2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Marks</label>
                      <input
                        type="number"
                        name="marks"
                        value={currentQuestion.marks}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Type</label>
                      <select
                        name="questionType"
                        value={currentQuestion.questionType}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option>MCQ</option>
                        <option>true-false</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Difficulty</label>
                      <select
                        name="difficulty"
                        value={currentQuestion.difficulty}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option>easy</option>
                        <option>medium</option>
                        <option>hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Select Correct Option</label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={option.isCorrect}
                          onChange={() => handleCorrectOptionChange(index)}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Add Question
                  </button>
                </div>
              </div>

              {formData.questions.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold mb-4">Questions Added: {formData.questions.length}</h3>
                  <div className="space-y-2">
                    {formData.questions.map((question, index) => (
                      <div key={question._id} className="flex justify-between items-start bg-white p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">Q{index + 1}: {question.questionText}</p>
                          <p className="text-sm text-gray-600">Marks: {question.marks} | Type: {question.questionType}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingQuiz(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">{quiz.title}</h3>
                  <p className="text-gray-600 mb-2">{quiz.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-semibold text-gray-700">Category:</span>
                      <p className="text-gray-600">{quiz.category}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Questions:</span>
                      <p className="text-gray-600">{quiz.totalQuestions}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Total Marks:</span>
                      <p className="text-gray-600">{quiz.totalMarks}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Passing Marks:</span>
                      <p className="text-gray-600">{quiz.passingMarks}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Duration:</span>
                      <p className="text-gray-600">{quiz.duration} mins</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Status:</span>
                      <p className={quiz.isActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {quiz.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-semibold mb-2">Quiz Link:</p>
                    <code className="bg-gray-100 p-2 rounded text-xs break-all">
                      {`${window.location.origin}/quiz/${quiz.quizLink}`}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyQuizLink(quiz.quizLink)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => navigate(`/admin/quiz/${quiz._id}/responses`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold text-sm"
                >
                  View Responses
                </button>
                <button
                  onClick={() => navigate(`/admin/quiz/${quiz._id}/stats`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold text-sm"
                >
                  Statistics
                </button>
                <button
                  onClick={() => handleEditQuiz(quiz)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(quiz._id)}
                  className={`${quiz.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded font-semibold text-sm`}
                >
                  {quiz.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminQuizManagement;
