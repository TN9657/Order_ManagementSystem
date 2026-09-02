import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers, useCreateCustomer } from '@/hooks/useApi';
import { MainLayout } from '@/layouts/MainLayout';
import { Loading, Error, EmptyState, Pagination } from '@/components/UI';
import { CustomerTable } from '@/components/CustomerTable';

export const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [formError, setFormError] = useState('');

  const { data: customersData, isLoading, error, refetch } = useCustomers(page, pageSize, search);
  const createCustomer = useCreateCustomer();

  const hasSearch = useMemo(() => search.trim().length > 0, [search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await createCustomer.mutateAsync(form);
      setShowModal(false);
      setForm({ name: '', email: '' });
      setPage(1);
      await refetch();
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || 'Failed to create customer');
    }
  };

  if (isLoading) return <MainLayout><Loading /></MainLayout>;
  if (error)
    return (
      <MainLayout>
        <Error message="Failed to load customers" onRetry={() => refetch()} />
      </MainLayout>
    );

  return (
    <MainLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Customer
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer name or email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear search
            </button>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Customer</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {formError && <p className="text-red-600 text-sm">{formError}</p>}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setFormError(''); setForm({ name: '', email: '' }); }}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCustomer.isPending}
                    className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {createCustomer.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {customersData && customersData.items.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <CustomerTable
                customers={customersData.items}
                onViewCustomer={(customerId) =>
                  navigate(`/customers/${customerId}`)
                }
              />
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={customersData.total}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState
            title={hasSearch ? 'No Matching Customers' : 'No Customers'}
            message={hasSearch ? 'No customers match your search' : 'No customers found'}
          />
        )}
      </div>
    </MainLayout>
  );
};
