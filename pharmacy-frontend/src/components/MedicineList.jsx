import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  Pill,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { getMedicines, deleteMedicine } from '../utils/api';

export default function MedicineList({ onSignOut }) {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchMedicines();
  }, [categoryFilter]);

  const fetchMedicines = async () => {
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await getMedicines(params);
      setMedicines(response.data.medicines);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await deleteMedicine(id);
        fetchMedicines();
      } catch (error) {
        console.error('Failed to delete medicine:', error);
      }
    }
  };

  const filteredMedicines = medicines.filter((m) =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="font-semibold text-lg">{user?.pharmacyName}</h1>
              <p className="text-gray-500 text-sm">Medicine Inventory</p>
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
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">All Medicines</h2>
              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
                {filteredMedicines.length} items
              </span>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 flex-1 md:w-64">
                <Search className="h-4 w-4 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Categories</option>
                <option value="tablet">Tablet</option>
                <option value="syrup">Syrup</option>
                <option value="injection">Injection</option>
                <option value="ointment">Ointment</option>
                <option value="drops">Drops</option>
                <option value="other">Other</option>
              </select>

              <Link
                to="/medicines/add"
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Medicine
              </Link>
            </div>
          </div>

          {/* Medicine Table */}
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : filteredMedicines.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No medicines found. Add your first medicine!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="py-3">Medicine Name</th>
                    <th>Category</th>
                    <th>Manufacturer</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Expiry</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((medicine) => {
                    const isLowStock = medicine.quantity <= medicine.reorderLevel;
                    const isExpiringSoon =
                      new Date(medicine.expiryDate) <
                      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                    return (
                      <tr key={medicine._id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-gray-800">
                              {medicine.name}
                            </p>
                            {medicine.genericName && (
                              <p className="text-xs text-gray-500">
                                {medicine.genericName}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="capitalize text-gray-600">
                            {medicine.category}
                          </span>
                        </td>
                        <td className="text-gray-600">{medicine.manufacturer}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                isLowStock ? 'text-orange-600' : 'text-gray-800'
                              }`}
                            >
                              {medicine.quantity}
                            </span>
                            {isLowStock && (
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                        </td>
                        <td className="text-gray-800 font-medium">
                          ${medicine.price.toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`text-sm ${
                              isExpiringSoon
                                ? 'text-red-600 font-medium'
                                : 'text-gray-600'
                            }`}
                          >
                            {new Date(medicine.expiryDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate(`/medicines/edit/${medicine._id}`)
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(medicine._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}