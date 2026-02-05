import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import panelService from '../services/panelService';
import authService from '../services/authService';
import Footer from '../components/Footer';

const PanelRoundDetail = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [canEvaluate, setCanEvaluate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [myEvaluation, setMyEvaluation] = useState(null);
  const [evaluationForm, setEvaluationForm] = useState({
    score: 50,
    decision: 'hold',
    remarks: '',
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchCandidatesAndEvaluations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId]);

  useEffect(() => {
    if (selectedCandidateId && evaluations.length > 0) {
      // Find my evaluation for this candidate
      const myEval = evaluations.find(
        e => e.candidate?._id === selectedCandidateId && e.panelMember?._id === currentUser?.id
      );
      
      if (myEval) {
        setMyEvaluation(myEval);
        setEvaluationForm({
          score: myEval.score,
          decision: myEval.decision,
          remarks: myEval.remarks || '',
        });
      } else {
        setMyEvaluation(null);
        setEvaluationForm({
          score: 50,
          decision: 'hold',
          remarks: '',
        });
      }
    }
  }, [selectedCandidateId, evaluations, currentUser]);

  const fetchCandidatesAndEvaluations = async () => {
    try {
      const [candData, evalData, roundsData] = await Promise.all([
        panelService.getAssignedCandidates(roundId),
        panelService.getEvaluations(roundId),
        panelService.getAssignedRounds(),
      ]);
      setCandidates(candData);
      setEvaluations(evalData);
      
      // Check if user is assigned to this round
      const currentRound = roundsData.find(r => r._id === roundId);
      setCanEvaluate(currentRound?.canEvaluate || false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    try {
      await panelService.submitEvaluation(roundId, selectedCandidateId, evaluationForm);
      alert(myEvaluation ? 'Evaluation updated successfully!' : 'Evaluation submitted successfully!');
      setEvaluationForm({ score: 50, decision: 'hold', remarks: '' });
      setSelectedCandidateId(null);
      fetchCandidatesAndEvaluations();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Error submitting evaluation. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen flex-grow">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Evaluate Candidates</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidates List */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Candidates</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {candidates.map((candidate) => (
                  <button
                    key={candidate._id}
                    onClick={() => setSelectedCandidateId(candidate._id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedCandidateId === candidate._id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-semibold">{candidate.name || candidate.user?.name || 'Unknown'}</p>
                    <p className="text-sm opacity-75">{candidate.email || candidate.user?.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Evaluation Form and Results */}
          <div className="lg:col-span-2">
            {selectedCandidateId && canEvaluate && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {myEvaluation ? 'Update Your Evaluation' : 'Submit Evaluation'}
                  </h2>
                  {myEvaluation && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ✓ Already Evaluated
                    </span>
                  )}
                </div>
                <form onSubmit={handleSubmitEvaluation}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={evaluationForm.score}
                      onChange={(e) =>
                        setEvaluationForm({
                          ...evaluationForm,
                          score: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Decision
                    </label>
                    <select
                      value={evaluationForm.decision}
                      onChange={(e) =>
                        setEvaluationForm({
                          ...evaluationForm,
                          decision: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="pass">Pass</option>
                      <option value="hold">Hold</option>
                      <option value="fail">Fail</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Remarks
                    </label>
                    <textarea
                      value={evaluationForm.remarks}
                      onChange={(e) =>
                        setEvaluationForm({
                          ...evaluationForm,
                          remarks: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      rows="4"
                      placeholder="Your feedback and observations..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    {myEvaluation ? 'Update Evaluation' : 'Submit Evaluation'}
                  </button>
                </form>
              </div>
            )}

            {selectedCandidateId && !canEvaluate && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-2 text-yellow-800">View Only Mode</h2>
                <p className="text-gray-700">
                  You are not assigned to evaluate this round. You can view all evaluations below.
                </p>
              </div>
            )}

            {/* All Evaluations with Feedback */}
            {selectedCandidateId && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Panel Evaluations & Feedback</h2>
                {evaluations.filter(e => e.candidate?._id === selectedCandidateId).length > 0 ? (
                  <div className="space-y-4">
                    {evaluations
                      .filter(e => e.candidate?._id === selectedCandidateId)
                      .map((evaluation, idx) => (
                        <div key={idx} className="border-l-4 border-blue-600 bg-gray-50 p-4 rounded-r-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-lg text-gray-800">
                                {evaluation.candidate?.name || 'Unknown Candidate'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Evaluated by: <strong>{evaluation.panelMember?.name || 'Unknown Panel'}</strong>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">{evaluation.score}/100</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                evaluation.decision === 'pass' ? 'bg-green-100 text-green-800' :
                                evaluation.decision === 'fail' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {evaluation.decision.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {evaluation.remarks && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Feedback:</p>
                              <p className="text-gray-600 text-sm italic">{evaluation.remarks}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No evaluations submitted yet for this candidate.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default PanelRoundDetail;
