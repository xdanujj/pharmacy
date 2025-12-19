import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  Pill,
  FileText,
  Package,
  TrendingUp,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { getMedicines, getPrescriptions } from '../utils/api';

export default function Dashboard({ onSignOut }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    pendingPrescriptions: 0,
    completedToday: 0,
  });
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [medicinesRes, prescriptionsRes, lowStockRes] = await Promise.all([
        getMedicines(),
        getPrescriptions(),
        getMedicines({ lowStock: 'true' }),
      ]);

      const medicines = medicinesRes.data.medicines;
      const prescriptions = prescriptionsRes.data.prescriptions;
      const lowStock = lowStockRes.data.medicines;

      setStats({
        totalMedicines: medicines.length,
        lowStock: lowStock.length,
        pendingPrescriptions: prescriptions.filter(
          (p) => p.status === 'pending' || p.status === 'processing'
        ).length,
        completedToday: prescriptions.filter(
          (p) =>
            p.status === 'completed' &&
            new Date(p.updatedAt).toDateString() === new Date().toDateString()
        ).length,
      });

      setLowStockMedicines(lowStock.slice(0, 5));
      setRecentPrescriptions(prescriptions.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-full">
              <Pill className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">
                {user?.pharmacyName || 'Pharmacy'}
              </h1>
              <p className="text-gray-500 text-sm">{user?.name || 'Pharmacist'}</p>
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="flex items-center px-4 py-2 text-sm font-medium text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Medicines</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stats.totalMedicines}
                </p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {stats.lowStock}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.pendingPrescriptions}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed Today</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.completedToday}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/medicines"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition text-center"
          >
            <Package className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">View Inventory</h3>
            <p className="text-sm text-gray-500 mt-1">Manage all medicines</p>
          </Link>

          <Link
            to="/medicines/add"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition text-center"
          >
            <Plus className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Add Medicine</h3>
            <p className="text-sm text-gray-500 mt-1">Add new stock</p>
          </Link>

          <Link
            to="/prescriptions"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition text-center"
          >
            <FileText className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Prescriptions</h3>
            <p className="text-sm text-gray-500 mt-1">View all orders</p>
          </Link>
        </div>

        {/* Low Stock & Recent Prescriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Low Stock Alert
              </h3>
              <Link
                to="/medicines?lowStock=true"
                className="text-sm text-teal-600 hover:underline"
              >
                View All
              </Link>
            </div>

            {lowStockMedicines.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                All medicines are well stocked! 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockMedicines.map((medicine) => (
                  <div
                    key={medicine._id}
                    className="flex justify-between items-center p-3 bg-orange-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{medicine.name}</p>
                      <p className="text-sm text-gray-500">{medicine.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{medicine.quantity}</p>
                      <p className="text-xs text-gray-500">in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Recent Prescriptions
              </h3>
              <Link
                to="/prescriptions"
                className="text-sm text-teal-600 hover:underline"
              >
                View All
              </Link>
            </div>

            {recentPrescriptions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No prescriptions yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentPrescriptions.map((prescription) => (
                  <div
                    key={prescription._id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/prescriptions/${prescription._id}`)}
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {prescription.patientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {prescription.prescriptionId}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
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
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}