import React, { useState } from 'react';
import { MilitaryUser, MilitaryRole } from '../types/military';
import { MILITARY_RANKS, MILITARY_POSITIONS, SAMPLE_UNITS } from '../data/mockMilitaryData';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  Unlock,
  Edit,
  X
} from 'lucide-react';

interface UserManagementProps {
  users: MilitaryUser[];
  onAddUser: (user: MilitaryUser) => void;
  onUpdateUser: (user: MilitaryUser) => void;
  onToggleUserStatus: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onToggleUserStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<MilitaryUser | null>(null);

  // Form
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [rank, setRank] = useState(MILITARY_RANKS[0]);
  const [position, setPosition] = useState(MILITARY_POSITIONS[0]);
  const [unit, setUnit] = useState(SAMPLE_UNITS[0]);
  const [role, setRole] = useState<MilitaryRole>('candidate');
  const [permissions, setPermissions] = useState({
    canCreateExam: false,
    canEditBank: false,
    canManageUsers: false,
    canViewProctor: false,
    canExportExcel: false,
    canDisqualify: false
  });

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.unit.toLowerCase().includes(term) ||
      u.rank.toLowerCase().includes(term)
    );
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFullName('');
    setUsername(`qn_${Math.floor(1000 + Math.random() * 9000)}`);
    setRank(MILITARY_RANKS[0]);
    setPosition(MILITARY_POSITIONS[0]);
    setUnit(SAMPLE_UNITS[0]);
    setRole('candidate');
    setPermissions({
      canCreateExam: false,
      canEditBank: false,
      canManageUsers: false,
      canViewProctor: false,
      canExportExcel: false,
      canDisqualify: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: MilitaryUser) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setUsername(user.username);
    setRank(user.rank);
    setPosition(user.position);
    setUnit(user.unit);
    setRole(user.role);
    setPermissions({ ...user.permissions });
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: MilitaryRole) => {
    setRole(newRole);
    if (newRole === 'super_admin') {
      setPermissions({
        canCreateExam: true,
        canEditBank: true,
        canManageUsers: true,
        canViewProctor: true,
        canExportExcel: true,
        canDisqualify: true
      });
    } else if (newRole === 'admin') {
      setPermissions({
        canCreateExam: true,
        canEditBank: true,
        canManageUsers: false,
        canViewProctor: true,
        canExportExcel: true,
        canDisqualify: true
      });
    } else if (newRole === 'proctor') {
      setPermissions({
        canCreateExam: false,
        canEditBank: false,
        canManageUsers: false,
        canViewProctor: true,
        canExportExcel: true,
        canDisqualify: true
      });
    } else {
      setPermissions({
        canCreateExam: false,
        canEditBank: false,
        canManageUsers: false,
        canViewProctor: false,
        canExportExcel: false,
        canDisqualify: false
      });
    }
  };

  const handleSave = () => {
    if (!fullName.trim() || !username.trim()) {
      alert('Vui lòng nhập họ tên và tên đăng nhập!');
      return;
    }

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        fullName,
        username,
        rank,
        position,
        unit,
        role,
        permissions
      });
    } else {
      const newUser: MilitaryUser = {
        id: `USR_${Date.now()}`,
        username,
        fullName,
        rank,
        position,
        unit,
        militaryCode: `QD305-${Math.floor(100 + Math.random() * 900)}`,
        role,
        isActive: true,
        permissions
      };
      onAddUser(newUser);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-2 border-emerald-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold uppercase font-military">
              QUÂN KHU 5 — SƯ ĐOÀN BB 305
            </span>
            <span className="text-xs text-stone-500 font-semibold">Bảo Mật & Phân Quyền Quân Nhân</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-military tracking-wide mt-1">
            QUẢN LÝ QUÂN NHÂN & PHÂN QUYỀN CHI TIẾT
          </h2>
          <p className="text-xs text-stone-600">
            Cấp quyền phân cấp nghiêm ngặt cho Chỉ huy trưởng, Cán bộ khảo thí, Giám thị coi thi và Chiến sĩ dự thi Sư đoàn BB 305.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase flex items-center gap-2 cursor-pointer shadow-lg transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Quân Nhân Mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="w-full max-w-md relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên quân nhân, cấp bậc, chức vụ hoặc đơn vị..."
            className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-amber-400 font-military uppercase text-[11px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="py-3 px-4">Quân Nhân / Cấp Bậc</th>
                <th className="py-3 px-4">Tài Khoản / Mã QN</th>
                <th className="py-3 px-4">Chức Vụ & Đơn Vị</th>
                <th className="py-3 px-4">Vai Trò Phân Cấp</th>
                <th className="py-3 px-4 text-center">Quyền Hạn Chi Tiết</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-stone-850/60 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-100">{u.fullName}</div>
                    <span className="text-[10px] text-amber-400 font-semibold">{u.rank}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="text-stone-300 font-semibold">{u.username}</div>
                    <span className="text-[10px] text-stone-500">{u.militaryCode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-stone-200">{u.position}</div>
                    <div className="text-[10px] text-stone-500 truncate max-w-xs">{u.unit}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'super_admin'
                          ? 'bg-red-950 text-amber-300 border border-red-700'
                          : u.role === 'admin'
                          ? 'bg-amber-950 text-amber-400 border border-amber-700'
                          : u.role === 'proctor'
                          ? 'bg-blue-950 text-blue-300 border border-blue-700'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {u.role === 'super_admin'
                        ? 'Chỉ huy trưởng'
                        : u.role === 'admin'
                        ? 'Cán bộ khảo thí'
                        : u.role === 'proctor'
                        ? 'Giám thị coi thi'
                        : 'Chiến sĩ dự thi'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center flex-wrap gap-1 max-w-xs mx-auto">
                      {u.permissions.canCreateExam && (
                        <span className="px-1.5 py-0.2 rounded bg-stone-800 text-[9px] text-stone-300">Tạo đề</span>
                      )}
                      {u.permissions.canEditBank && (
                        <span className="px-1.5 py-0.2 rounded bg-stone-800 text-[9px] text-stone-300">Sửa ngân hàng</span>
                      )}
                      {u.permissions.canViewProctor && (
                        <span className="px-1.5 py-0.2 rounded bg-stone-800 text-[9px] text-red-300">Giám sát</span>
                      )}
                      {u.permissions.canExportExcel && (
                        <span className="px-1.5 py-0.2 rounded bg-stone-800 text-[9px] text-emerald-300">Xuất Excel</span>
                      )}
                      {u.permissions.canManageUsers && (
                        <span className="px-1.5 py-0.2 rounded bg-stone-800 text-[9px] text-amber-300">Quản trị</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleUserStatus(u.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        u.isActive
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-red-950 text-red-400 border border-red-700'
                      }`}
                    >
                      {u.isActive ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{u.isActive ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 cursor-pointer"
                      title="Chỉnh sửa phân quyền"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-600/70 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-amber-400 font-military uppercase">
                {editingUser ? 'CHỈNH SỬA THÔNG TIN & PHÂN QUYỀN' : 'THÊM MỚI QUÂN NHÂN VÀO HỆ THỐNG'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Tên đăng nhập *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Cấp bậc</label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    {MILITARY_RANKS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-300 mb-1">Chức vụ</label>
                  <input
                    type="text"
                    list="user-positions"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="user-positions">
                    {MILITARY_POSITIONS.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Đơn vị</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">Vai trò chính</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as MilitaryRole)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="super_admin">Chỉ huy trưởng (Toàn quyền)</option>
                  <option value="admin">Cán bộ khảo thí</option>
                  <option value="proctor">Giám thị coi thi</option>
                  <option value="candidate">Chiến sĩ dự thi</option>
                </select>
              </div>

              {/* Granular Permission Checklist */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
                <span className="font-bold text-amber-400 block mb-1">Phân quyền chi tiết:</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canCreateExam}
                      onChange={(e) => setPermissions({ ...permissions, canCreateExam: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Tạo đề & Phòng thi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canEditBank}
                      onChange={(e) => setPermissions({ ...permissions, canEditBank: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Sửa ngân hàng câu hỏi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canViewProctor}
                      onChange={(e) => setPermissions({ ...permissions, canViewProctor: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Giám sát chống gian lận</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canExportExcel}
                      onChange={(e) => setPermissions({ ...permissions, canExportExcel: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Xuất báo cáo Excel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageUsers}
                      onChange={(e) => setPermissions({ ...permissions, canManageUsers: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Quản lý người dùng</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canDisqualify}
                      onChange={(e) => setPermissions({ ...permissions, canDisqualify: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Đình chỉ thi & Kỷ luật</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase cursor-pointer"
              >
                Lưu Quân Nhân
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
