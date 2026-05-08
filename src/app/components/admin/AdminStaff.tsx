import { useState } from 'react';
import {
  UserPlus,
  Search,
  Trash2,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useStaff, useCreateStaff, useDeleteStaff } from '../../hooks/useStaff';
import { ErrorState, CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';

// ── Sub-components ──
import type { StaffRole, StaffForm } from './admin-staff/staffConstants';
import { roleConfig } from './admin-staff/staffConstants';
import AddStaffModal from './admin-staff/AddStaffModal';
import DeleteConfirmModal from './admin-staff/DeleteConfirmModal';

export default function AdminStaff() {
  const { data: staffData = [], isLoading, isError } = useStaff();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const staff = staffData.filter((u) => u.role !== 'admin');

  const filtered = staff.filter((u) => {
    const matchSearch =
      u.name.includes(search) || u.email.includes(search) || (u.phone || '').includes(search);
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAddStaff = async (values: StaffForm) => {
    try {
      await createStaff.mutateAsync({
        name: values.fullName.trim(),
        email: values.email,
        password: values.password,
        role: values.role as StaffRole,
        nationalId: values.nationalId,
        phone: values.phone,
        address: values.address,
        city: values.city,
      });
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStaff.mutateAsync(id);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading)
    return (
      <div className="space-y-6 p-2">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <CardSkeleton count={3} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  if (isError)
    return (
      <ErrorState message="فشل تحميل الكوادر الطبية" onRetry={() => window.location.reload()} />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 800 }}>
            إدارة الكوادر الطبية
          </h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>
            {staff.length} حساب مسجل في النظام
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm"
          style={{ fontSize: '14px', fontWeight: 700 }}
        >
          <UserPlus className="w-5 h-5" /> إضافة كادر طبي جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الكوادر', count: staff.length, color: 'text-gray-900', bg: 'bg-gray-50', onClick: () => setFilterRole('') },
          { label: 'أطباء', count: staff.filter((u) => u.role === 'doctor').length, color: 'text-teal-700', bg: 'bg-teal-50', onClick: () => setFilterRole('doctor') },
          { label: 'دكاترة تحاليل', count: staff.filter((u) => u.role === 'lab').length, color: 'text-green-700', bg: 'bg-green-50', onClick: () => setFilterRole('lab') },
          { label: 'أميناء المخازن', count: staff.filter((u) => u.role === 'inventory').length, color: 'text-blue-700', bg: 'bg-blue-50', onClick: () => setFilterRole('inventory') },
        ].map((s, i) => (
          <button
            key={i}
            onClick={s.onClick}
            className={`${s.bg} rounded-xl p-4 text-center hover:opacity-80 transition-opacity`}
          >
            <div className={s.color} style={{ fontSize: '24px', fontWeight: 800 }}>
              {s.count}
            </div>
            <div className="text-gray-600" style={{ fontSize: '12px' }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو البريد أو الهاتف..."
              className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              style={{ fontSize: '13px' }}
            />
          </div>
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل الأدوار</option>
              <option value="doctor">طبيب</option>
              <option value="lab">دكتور تحاليل</option>
              <option value="inventory">أمين مخزن</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pr-4 pl-8 py-2.5 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 outline-none focus:border-green-400 appearance-none"
              style={{ fontSize: '13px' }}
            >
              <option value="">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">معطل</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <span className="text-gray-500" style={{ fontSize: '13px' }}>
            {filtered.length} نتيجة
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                {[
                  'الاسم والدور',
                  'رقم الهوية',
                  'الهاتف',
                  'البريد الإلكتروني',
                  'العنوان',
                  'تاريخ الإضافة',
                  'الحالة',
                  'إجراءات',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-gray-500 whitespace-nowrap"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const cfg = roleConfig[u.role as StaffRole] || roleConfig.doctor;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${cfg.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
                        >
                          <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div>
                          <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                            {u.name}
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full ${cfg.badge}`}
                            style={{ fontSize: '10px', fontWeight: 700 }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-600 font-mono" style={{ fontSize: '12px' }}>
                        {u.nationalId || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-600 font-mono" style={{ fontSize: '12px' }}>
                        {u.phone || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-mono" style={{ fontSize: '11px' }}>
                          {u.email}
                        </span>
                        <button
                          onClick={() => copyEmail(u.email)}
                          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        >
                          {copied === u.email ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-500" style={{ fontSize: '12px' }}>
                        {u.address || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-400" style={{ fontSize: '12px' }}>
                        {u.createdAt}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        style={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        {u.status === 'active' ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <EmptyState colSpan={8} message="لا توجد نتائج" />}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddStaff}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
