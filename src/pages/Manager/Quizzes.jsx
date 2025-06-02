import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PlusCircle, Trash2, Edit, Filter, Search, FileText } from 'lucide-react';

const ManagerQuizzes = () => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newQuiz, setNewQuiz] = useState({
    programId: '',
    questionText: '',
    answerType: 'Multiple Choice',
  });

  useEffect(() => {
    setIsLoading(true);
    api.get('/TrainingAssessments')
      .then(response => {
        setAssessments(response.data);
        setFilteredAssessments(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = assessments;
    
    if (searchTerm) {
      result = result.filter(quiz => 
        quiz.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.programId.toString().includes(searchTerm)
      );
    }
    
    if (filterType !== 'All') {
      result = result.filter(quiz => quiz.answerType === filterType);
    }
    
    setFilteredAssessments(result);
  }, [searchTerm, filterType, assessments]);

  const handleInputChange = (e) => {
    setNewQuiz({ ...newQuiz, [e.target.name]: e.target.value });
  };

  const handleAddQuiz = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (editingId) {
      api.put(`/TrainingAssessments/${editingId}`, newQuiz)
        .then(response => {
          const updatedAssessments = assessments.map(quiz => 
            quiz.id === editingId ? response.data : quiz
          );
          setAssessments(updatedAssessments);
          resetForm();
          setIsLoading(false);
        })
        .catch(error => {
          console.error(error);
          setIsLoading(false);
        });
    } else {
      api.post('/TrainingAssessments', newQuiz)
        .then(response => {
          setAssessments([...assessments, response.data]);
          resetForm();
          setIsLoading(false);
        })
        .catch(error => {
          console.error(error);
          setIsLoading(false);
        });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this quiz question?')) {
      setIsLoading(true);
      api.delete(`/TrainingAssessments/${id}`)
        .then(() => {
          setAssessments(assessments.filter(quiz => quiz.id !== id));
          setIsLoading(false);
        })
        .catch(error => {
          console.error(error);
          setIsLoading(false);
        });
    }
    window.location.reload();
  };

  const resetForm = () => {
    setNewQuiz({
      programId: '',
      questionText: '',
      answerType: 'Multiple Choice',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getAnswerTypeColor = (type) => {
    switch(type) {
      case 'Multiple Choice':
        return 'bg-indigo-100 text-indigo-800';
      case 'Short Answer':
        return 'bg-emerald-100 text-emerald-800';
      case 'True/False':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800 relative">
          <span className="relative z-10">Manage Quizzes</span>
          <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-200 -z-10 transform translate-y-1"></span>
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          {showForm ? 'Hide Form' : 'Add New Quiz'}
          <PlusCircle size={18} />
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      <div className={`mb-8 transition-all duration-500 ease-in-out overflow-hidden ${showForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleAddQuiz} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {editingId ? 'Edit Quiz Question' : 'Add New Quiz Question'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program ID</label>
              <input
                type="number"
                name="programId"
                placeholder="Enter Program ID"
                value={newQuiz.programId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer Type</label>
              <select
                name="answerType"
                value={newQuiz.answerType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="Short Answer">Short Answer</option>
                <option value="True/False">True/False</option>
              </select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <textarea
                name="questionText"
                placeholder="Enter question text..."
                value={newQuiz.questionText}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {editingId ? 'Update' : 'Save'} Quiz
              <FileText size={18} />
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions or program ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
        
        <div className="flex items-center gap-2 min-w-fit">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          >
            <option value="All">All Types</option>
            <option value="Short Answer">Short Answer</option>
            <option value="True/False">True/False</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <h3 className="text-xl font-bold p-4 border-b border-gray-100 bg-gray-50 text-gray-800">
          Existing Quizzes ({filteredAssessments.length})
        </h3>
        
        {filteredAssessments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || filterType !== 'All' 
              ? 'No quizzes found matching your filters.' 
              : 'No quizzes available. Add your first quiz question above!'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredAssessments.map(quiz => (
              <li 
                key={quiz.id} 
                className="p-4 hover:bg-gray-50 transition-colors duration-150 animate-fadeIn"
              >
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-indigo-600">Program ID: {quiz.programId}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getAnswerTypeColor(quiz.answerType)}`}>
                        {quiz.answerType}
                      </span>
                    </div>
                    <p className="text-gray-800">{quiz.questionText}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    
                    <button 
                      onClick={() => handleDelete(quiz.assessmentId)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
                      title="Delete Question"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManagerQuizzes;