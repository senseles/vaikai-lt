'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  reviewCount: number;
  forumPostCount: number;
  forumCommentCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const updateUser = async (userId: string, update: { role?: string; isBlocked?: boolean }) => {
    setUpdating(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...update }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, ...data.data } : u
        ));
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Vartotojai</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Iš viso: {pagination.total} {pagination.total === 1 ? 'vartotojas' : 'vartotojų'}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Ieškoti pagal el. paštą arba vardą..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm"
          >
            <option value="">Visos rolės</option>
            <option value="USER">Vartotojas</option>
            <option value="ADMIN">Administratorius</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#2d6a4f] text-white rounded-lg text-sm font-medium hover:bg-[#40916c] transition-colors"
          >
            Ieškoti
          </button>
        </form>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-[3px] border-gray-200 dark:border-slate-700 border-t-[#2d6a4f] rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Vartotojų nerasta
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Vartotojas</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Rolė</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Atsiliepimai</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Forumas</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Registracija</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Veiksmai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${user.isBlocked ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300 flex-shrink-0">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {user.name || 'Be vardo'}
                            {user.isBlocked && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Užblokuotas
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
                      }`}>
                        {user.role === 'ADMIN' ? 'Admin' : 'Vartotojas'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{user.reviewCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-700 dark:text-gray-300">{user.forumPostCount}</span>
                      <span className="text-gray-400 dark:text-gray-500 mx-0.5">/</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{user.forumCommentCount}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('lt-LT')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* Toggle role */}
                        <button
                          onClick={() => updateUser(user.id, { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                          disabled={updating === user.id}
                          className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50"
                          title={user.role === 'ADMIN' ? 'Pakeisti į vartotoją' : 'Padaryti admin'}
                        >
                          {user.role === 'ADMIN' ? 'Pašalinti admin' : 'Admin'}
                        </button>
                        {/* Toggle block */}
                        <button
                          onClick={() => updateUser(user.id, { isBlocked: !user.isBlocked })}
                          disabled={updating === user.id}
                          className={`px-2 py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-50 ${
                            user.isBlocked
                              ? 'border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={user.isBlocked ? 'Atblokuoti' : 'Užblokuoti'}
                        >
                          {user.isBlocked ? 'Atblokuoti' : 'Blokuoti'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Puslapis {pagination.page} iš {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-xs border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
              >
                Ankstesnis
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-xs border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
              >
                Kitas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
