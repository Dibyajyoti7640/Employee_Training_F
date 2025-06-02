import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Send, Clock, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

const EmployeeQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const registrationsResponse = await api.get('/Registrations');
        const userRegistrationsData = registrationsResponse.data.filter(
          reg => reg.userId === Number(user.userId) && reg.programId !== null
        );
        setUserRegistrations(userRegistrationsData);

        const quizzesResponse = await api.get('/TrainingAssessments');
        const allQuizzes = quizzesResponse.data;

        const programIds = userRegistrationsData.map(reg => reg.programId);
        const relevantQuizzes = allQuizzes.filter(quiz => 
          programIds.includes(quiz.programId)
        );
        setQuizzes(relevantQuizzes);

        const submissionsResponse = await api.get('/AssessmentResponses');
        const userSubmissions = submissionsResponse.data.filter(
          sub => sub.userId === Number(user.userId)
        );
        setSubmittedQuizzes(new Set(userSubmissions.map(sub => sub.assessmentId)));
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        toast.error('Failed to load quizzes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAnswerChange = (quizId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [quizId]: answer
    }));
  };

  const handleSubmitQuiz = async (quizId) => {
    if (!answers[quizId]) {
      toast.warn('Please provide an answer before submitting.');
      return;
    }

    if (submittedQuizzes.has(quizId)) {
      toast.warn('You have already submitted this quiz.');
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = {
        assessmentId: quizId,
        userId: Number(user.userId),
        responseText: answers[quizId],
        submittedAt: new Date().toISOString()
      };

      const response = await api.post('/AssessmentResponses', submissionData);

      if (response.status === 200 || response.status === 201) {
        toast.success('Quiz submitted successfully!');
        setSubmittedQuizzes(prev => new Set([...prev, quizId]));
        setSelectedQuiz(null);
        setAnswers(prev => {
          const newAnswers = { ...prev };
          delete newAnswers[quizId];
          return newAnswers;
        });
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnswerInput = (quiz) => {
    switch (quiz.answerType) {
      case 'Multiple Choice':
        return (
          <div className="space-y-2">
            {['Option A', 'Option B', 'Option C', 'Option D'].map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`quiz-${quiz.assessmentId}`}
                  value={option}
                  checked={answers[quiz.assessmentId] === option}
                  onChange={(e) => handleAnswerChange(quiz.assessmentId, e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'Short Answer':
        return (
          <textarea
            value={answers[quiz.assessmentId] || ''}
            onChange={(e) => handleAnswerChange(quiz.assessmentId, e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Enter your answer here..."
            rows={3}
          />
        );
      case 'True/False':
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`quiz-${quiz.assessmentId}`}
                value="True"
                checked={answers[quiz.assessmentId] === 'True'}
                onChange={(e) => handleAnswerChange(quiz.assessmentId, e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">True</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`quiz-${quiz.assessmentId}`}
                value="False"
                checked={answers[quiz.assessmentId] === 'False'}
                onChange={(e) => handleAnswerChange(quiz.assessmentId, e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700">False</span>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-indigo-600">Loading quizzes...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
        <h3 className="font-semibold text-lg mb-2">Authentication Required</h3>
        <p>Please sign in to view and attempt quizzes.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Quizzes</h2>
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No quizzes available for your registered courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          My Quizzes
        </span>
      </h2>

      {selectedQuiz ? (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Quiz for Program ID: {selectedQuiz.programId}
            </h3>
            <button
              onClick={() => setSelectedQuiz(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-2">{selectedQuiz.questionText}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              selectedQuiz.answerType === 'Multiple Choice' ? 'bg-indigo-100 text-indigo-800' :
              selectedQuiz.answerType === 'Short Answer' ? 'bg-emerald-100 text-emerald-800' :
              'bg-amber-100 text-amber-800'
            }`}>
              {selectedQuiz.answerType}
            </span>
          </div>

          {renderAnswerInput(selectedQuiz)}

          <button
            onClick={() => handleSubmitQuiz(selectedQuiz.assessmentId)}
            disabled={submitting || submittedQuizzes.has(selectedQuiz.assessmentId)}
            className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              submitting || submittedQuizzes.has(selectedQuiz.assessmentId)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <div
              key={quiz.assessmentId}
              className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${
                submittedQuizzes.has(quiz.assessmentId)
                  ? 'opacity-75 cursor-not-allowed'
                  : 'hover:shadow-md cursor-pointer'
              }`}
              onClick={() => !submittedQuizzes.has(quiz.assessmentId) && setSelectedQuiz(quiz)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800">
                  Program ID: {quiz.programId}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    quiz.answerType === 'Multiple Choice' ? 'bg-indigo-100 text-indigo-800' :
                    quiz.answerType === 'Short Answer' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {quiz.answerType}
                  </span>
                  {submittedQuizzes.has(quiz.assessmentId) && (
                    <CheckCircle size={16} className="text-green-600" />
                  )}
                </div>
              </div>
              <p className="text-gray-600 line-clamp-2">{quiz.questionText}</p>
              <div className="mt-3 flex items-center text-indigo-600">
                <Clock size={16} className="mr-1" />
                <span className="text-sm">
                  {submittedQuizzes.has(quiz.assessmentId) ? 'Submitted' : 'Attempt Quiz'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeQuiz;