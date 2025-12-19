import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { getPrescription, completePrescription, updatePrescriptionStatus } from '../utils/api';

export default function PrescriptionDetail({ onSignOut }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      const response = await getPrescription(id);
      setPrescription(response.data);
    } catch (error) {
      console.error('Failed to fetch prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (window.confirm('Complete this prescription and deduct inventory?')) {
      try {
        setActionLoading(true);
        await completePrescription(id);
        fetchPrescription();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to complete prescription');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      setActionLoading(true);
      await updatePrescriptionStatus(id, status);
      fetchPrescription();
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Prescription not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/prescriptions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Prescriptions
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Prescription Details
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                ID: {prescription.prescriptionId}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                prescription.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : prescription.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {prescription.status}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Patient & Doctor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              Patient Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-800">
                  {prescription.patientName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium text-gray-800">
                  {prescription.patientAge} years
                </p>
              </div>
              {prescription.patientPhone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {prescription.patientPhone}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-teal-600" />
              Doctor Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Doctor Name</p>
                <p className="font-medium text-gray-800">
                  {prescription.doctorName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prescribed Date</p>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(prescription.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Medicine Items */}
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Prescribed Medicines</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-3">Medicine</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {prescription.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 font-medium text-gray-800">
                      {item.medicineName}
                    </td>
                    <td className="text-gray-600">{item.dosage || 'N/A'}</td>
                    <td className="text-gray-800 font-medium">{item.quantity}</td>
                    <td>
                      {item.available ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          Out of stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {prescription.notes && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
              <p className="text-sm text-gray-600">{prescription.notes}</p>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center pt-4 border-t">
            <p className="text-lg font-semibold text-gray-800">Total Amount</p>
            <p className="text-2xl font-bold text-teal-600">
              ${prescription.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Actions */}
        {prescription.status !== 'completed' && prescription.status !== 'cancelled' && (
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
            <div className="flex gap-3">
              {prescription.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('processing')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Start Processing
                </button>
              )}
              
              {(prescription.status === 'processing' || prescription.status === 'partial') && (
                <button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Complete & Deduct Stock'}
                </button>
              )}

              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={actionLoading}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                Cancel Prescription
              </button>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> Completing this prescription will automatically
                deduct the quantities from your inventory. This action cannot be undone.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}