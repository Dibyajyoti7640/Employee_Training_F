import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Search, Filter, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const ManagerQuizResponses = () => {
  const [responses, setResponses] = useState([]);
  const [users, setUsers] = useState({});
  const [quizzes, setQuizzes] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserId, setFilterUserId] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const responsesResponse = await api.get('/AssessmentResponses');
        setResponses(responsesResponse.data);

        const usersResponse = await api.get('/Users');
        const userMap = {};
        usersResponse.data.forEach(user => {
          userMap[user.userId] = user.fullName || user.username || `User ${user.userId}`;
        });
        setUsers(userMap);

        const quizzesResponse = await api.get('/TrainingAssessments');
        const quizMap = {};
        quizzesResponse.data.forEach(quiz => {
          quizMap[quiz.assessmentId] = quiz;
        });
        setQuizzes(quizMap);
      } catch (error) {
        console.error('Error fetching quiz responses:', error);
        toast.error('Failed to load quiz responses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredResponses = responses.filter(response => {
    const userName = users[response.userId] || 'Unknown User';
    const quiz = quizzes[response.assessmentId] || { 
      questionText: 'Unknown Question', 
      answerType: 'Unknown', 
      programId: 'N/A' 
    };
    
    const searchFields = [
      userName.toLowerCase(),
      quiz.questionText?.toLowerCase() || '',
      response.responseText?.toLowerCase() || '',
      quiz.programId?.toString().toLowerCase() || ''
    ];
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    const matchesSearch = searchTermLower === '' || searchFields.some(field => field.includes(searchTermLower));
    const matchesFilter = filterUserId === 'All' || response.userId === Number(filterUserId);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-4 text-indigo-600">Loading responses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800 relative">
          <span className="relative z-10">Quiz Responses</span>
          <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-200 -z-10 transform translate-y-1"></span>
        </h2>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name, question, response, or program ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2 min-w-fit">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          >
            <option value="All">All Employees</option>
            {Object.entries(users).map(([userId, name]) => (
              <option key={userId} value={userId}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <h3 className="text-xl font-bold p-4 border-b border-gray-100 bg-gray-50 text-gray-800">
          Employee Responses ({filteredResponses.length})
        </h3>

        {filteredResponses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || filterUserId !== 'All'
              ? 'No responses found matching your filters.'
              : 'No quiz responses available yet.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredResponses.map(response => {
              const userName = users[response.userId] || 'Unknown User';
              const quiz = quizzes[response.assessmentId] || { 
                questionText: 'Unknown Question', 
                answerType: 'Unknown', 
                programId: 'N/A' 
              };

              return (
                <div
                  key={`${response.assessmentId}-${response.userId}`}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-indigo-600">
                          {userName}
                        </span>
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                          Program ID: {quiz.programId}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        quiz.answerType === 'Multiple Choice' ? 'bg-indigo-100 text-indigo-800' :
                        quiz.answerType === 'Short Answer' ? 'bg-emerald-100 text-emerald-800' :
                        quiz.answerType === 'True/False' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quiz.answerType}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium">Question: {quiz.questionText}</p>
                    <p className="text-gray-600">Response: {response.responseText}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(response.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerQuizResponses;