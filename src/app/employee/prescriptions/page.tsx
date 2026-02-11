'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PrescriptionService, Prescription, PrescriptionItem } from '@/services/prescriptionService';
import { EmployeeService, Employee } from '@/services/employeeService';
import { MockBackend, User } from '@/lib/mockData';
import { ArrowLeft, FileText, Plus, X, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function EmployeePrescriptionsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [assignedFarmers, setAssignedFarmers] = useState<User[]>([]);
    const [isNewFarmer, setIsNewFarmer] = useState(false);

    const [formData, setFormData] = useState({
        farmerId: '',
        newFarmerName: '',
        newFarmerVillage: '',
        newFarmerPhone: '',
        products: [{ productName: '', quantity: 1, unit: 'kg', instructions: '' }] as PrescriptionItem[],
        notes: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'employee') {
            router.push('/');
            return;
        }

        const emp = EmployeeService.getEmployee(user.id);
        if (!emp) {
            alert('Employee data not found');
            router.push('/');
            return;
        }

        setEmployee(emp);
        loadData();

        // Load assigned farmers
        const allFarmers = MockBackend.getUsers().filter(u => u.role === 'farmer');
        const assigned = allFarmers.filter(f => emp.assignedFarmers.includes(f.id));
        setAssignedFarmers(assigned);

        const interval = setInterval(loadData, 10000); // Optimized: 5s -> 10s
        return () => clearInterval(interval);
    }, [user, router]);

    const loadData = () => {
        if (user) {
            const employeePrescriptions = PrescriptionService.getEmployeePrescriptions(user.id);
            setPrescriptions(employeePrescriptions);
        }
    };

    const addProduct = () => {
        setFormData({
            ...formData,
            products: [...formData.products, { productName: '', quantity: 1, unit: 'kg', instructions: '' }]
        });
    };

    const removeProduct = (index: number) => {
        setFormData({
            ...formData,
            products: formData.products.filter((_, i) => i !== index)
        });
    };

    const updateProduct = (index: number, field: keyof PrescriptionItem, value: any) => {
        const updated = [...formData.products];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, products: updated });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!employee) return;

        // Validate based on farmer type
        if (isNewFarmer) {
            if (!formData.newFarmerName.trim() || !formData.newFarmerVillage.trim()) {
                alert('Please enter farmer name and village');
                return;
            }
        } else {
            if (!formData.farmerId) {
                alert('Please select a farmer');
                return;
            }
        }

        if (formData.products.length === 0 || !formData.products[0].productName.trim()) {
            alert('Please add at least one product');
            return;
        }

        if (isNewFarmer) {
            // Create prescription for unassigned farmer
            const tempFarmerId = `temp_${Date.now()}`;
            PrescriptionService.createPrescription(
                tempFarmerId,
                formData.newFarmerName,
                employee.id,
                employee.name,
                formData.products.filter(p => p.productName.trim() !== ''),
                formData.notes,
                formData.newFarmerVillage
            );
        } else {
            // Create prescription for assigned farmer
            const farmer = assignedFarmers.find(f => f.id === formData.farmerId);
            if (!farmer) return;

            PrescriptionService.createPrescription(
                farmer.id,
                farmer.name,
                employee.id,
                employee.name,
                formData.products.filter(p => p.productName.trim() !== ''),
                formData.notes,
                farmer.village
            );
        }

        alert('Prescription created successfully!');
        setShowCreateModal(false);
        setIsNewFarmer(false);
        setFormData({
            farmerId: '',
            newFarmerName: '',
            newFarmerVillage: '',
            newFarmerPhone: '',
            products: [{ productName: '', quantity: 1, unit: 'kg', instructions: '' }],
            notes: ''
        });
        loadData();
    };

    if (!employee) return <div>Loading...</div>;

    return (
        <div className="flex h-screen flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/employee" className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-indigo-700">My Prescriptions</h1>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Create Prescription
                </button>
            </div>

            {/* Stats */}
            <div className="bg-white border-b px-6 py-4">
                <div className="bg-indigo-50 rounded-lg p-4 inline-block">
                    <p className="text-sm text-indigo-600 font-medium">Total Created</p>
                    <p className="text-2xl font-bold text-indigo-700">{prescriptions.length}</p>
                </div>
            </div>

            {/* Prescriptions List */}
            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                        <div key={prescription.id} className="rounded-xl bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{prescription.farmerName}</h3>
                                    <p className="text-sm text-gray-600">
                                        {prescription.farmerVillage && `📍 ${prescription.farmerVillage}`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Created: {new Date(prescription.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className={`rounded-full px-3 py-1 text-xs font-medium ${prescription.status === 'active' ? 'bg-green-100 text-green-700' :
                                    prescription.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {prescription.status}
                                </div>
                            </div>

                            {/* Products */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Products:</h4>
                                <div className="space-y-2">
                                    {prescription.products.map((product, index) => (
                                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-900">{product.productName}</span>
                                            <span className="text-sm text-gray-600">
                                                {product.quantity} {product.unit}
                                            </span>
                                            {product.instructions && (
                                                <span className="text-sm text-gray-500 italic">
                                                    {product.instructions}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {prescription.notes && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <strong>Notes:</strong> {prescription.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                    {prescriptions.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No prescriptions created yet</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <Plus className="h-5 w-5" />
                                Create your first prescription
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
                    <div className="w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Create Prescription</h2>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Farmer Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Farmer Selection
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsNewFarmer(false)}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 px-4 font-medium ${!isNewFarmer ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <FileText className="h-4 w-4" />
                                        Assigned Farmers
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewFarmer(true)}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 px-4 font-medium ${isNewFarmer ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        New Farmer
                                    </button>
                                </div>
                            </div>

                            {/* Assigned Farmer Selection */}
                            {!isNewFarmer && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Farmer <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.farmerId}
                                        onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                        required={!isNewFarmer}
                                    >
                                        <option value="">Choose a farmer...</option>
                                        {assignedFarmers.map(farmer => (
                                            <option key={farmer.id} value={farmer.id}>
                                                {farmer.name} - {farmer.village}
                                            </option>
                                        ))}
                                    </select>
                                    {assignedFarmers.length === 0 && (
                                        <p className="text-sm text-amber-600 mt-2">
                                            No assigned farmers. Use "New Farmer" to create prescription for unassigned farmers.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* New Farmer Details */}
                            {isNewFarmer && (
                                <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700 font-medium">
                                        📝 Enter details for unassigned farmer
                                    </p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Farmer Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.newFarmerName}
                                            onChange={(e) => setFormData({ ...formData, newFarmerName: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                            placeholder="Enter farmer's full name"
                                            required={isNewFarmer}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Village Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.newFarmerVillage}
                                            onChange={(e) => setFormData({ ...formData, newFarmerVillage: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                            placeholder="Enter village name"
                                            required={isNewFarmer}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number (Optional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.newFarmerPhone}
                                            onChange={(e) => setFormData({ ...formData, newFarmerPhone: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Products */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Products <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addProduct}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        + Add Product
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.products.map((product, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg">
                                            <input
                                                type="text"
                                                placeholder="Product name"
                                                value={product.productName}
                                                onChange={(e) => updateProduct(index, 'productName', e.target.value)}
                                                className="col-span-4 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={product.quantity}
                                                onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                                                className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                                required
                                            />
                                            <select
                                                value={product.unit}
                                                onChange={(e) => updateProduct(index, 'unit', e.target.value)}
                                                className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                            >
                                                <option value="kg">kg</option>
                                                <option value="g">g</option>
                                                <option value="L">L</option>
                                                <option value="ml">ml</option>
                                                <option value="units">units</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Instructions"
                                                value={product.instructions}
                                                onChange={(e) => updateProduct(index, 'instructions', e.target.value)}
                                                className="col-span-3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                            />
                                            {formData.products.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(index)}
                                                    className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                                    placeholder="Any special instructions or notes..."
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 rounded-lg border-2 border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
                                >
                                    Create Prescription
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
