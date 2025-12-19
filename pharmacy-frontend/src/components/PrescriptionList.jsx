import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Pill, Search, FileText, User } from 'lucide-react';
import { getPrescriptions } from '../utils/api';

export default function PrescriptionList({ onSignOut }) {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchPrescriptions();
  }, [statusFilter]);

  const fetchPrescriptions = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await getPrescriptions(params);
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prescriptionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'partial':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-full">
              <Pill className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{user?.pharmacyName}</h1>
              <p className="text-gray-500 text-sm">Prescriptions</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Dashboard
            </button>
            <button
              onClick={onSignOut}
              className="flex items-center px-4 py-2 text-sm font-medium text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                All Prescriptions
              </h2>
              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                {filteredPrescriptions.length} orders
              </span>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 flex-1 md:w-64">
                <Search className="h-4 w-4 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : filteredPrescriptions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No prescriptions found
            </p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-3">Prescription ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((prescription) => (
                  <tr
                    key={prescription._id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/prescriptions/${prescription._id}`)}
                  >
                    <td className="py-3 font-medium text-teal-600">
                      {prescription.prescriptionId}
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-800">
                          {prescription.patientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Age: {prescription.patientAge}
                        </p>
                      </div>
                    </td>
                    <td className="text-gray-600">{prescription.doctorName}</td>
                    <td className="text-gray-600">
                      {prescription.items.length} items
                    </td>
                    <td className="font-medium text-gray-800">
                      ${prescription.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(
                          prescription.status
                        )}`}
                      >
                        {prescription.status}
                      </span>
                    </td>
                    <td className="text-gray-600">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/prescriptions/${prescription._id}`);
                        }}
                        className="text-teal-600 hover:underline text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}