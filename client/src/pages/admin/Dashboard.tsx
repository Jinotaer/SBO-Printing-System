import { useState, useMemo, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Pagination } from '../../common/Pagination';
import {
  Printer,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface PrintJob {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  documentName: string;
  pages: number;
  copies: number;
  colorMode: 'Grayscale' | 'Full Color';
  paperSize: 'Letter (Short)' | 'A4' | 'Legal (Long)';
  submittedAt: string;
  status: 'pending' | 'processing' | 'ready' | 'completed';
}

const INITIAL_JOBS: PrintJob[] = [
  {
    id: 'REQ-2024-001',
    studentId: '2022-30129',
    studentName: 'Hannah Nicole Cruz',
    department: 'College of Technologies (BSIT)',
    documentName: 'IT302_System_Architecture_Doc.pdf',
    pages: 18,
    copies: 2,
    colorMode: 'Full Color',
    paperSize: 'Letter (Short)',
    submittedAt: '10 mins ago',
    status: 'pending',
  },
  {
    id: 'REQ-2024-002',
    studentId: '2021-10482',
    studentName: 'Marcus James Villanueva',
    department: 'College of Education (BSED)',
    documentName: 'Lesson_Plan_Unit4_Science.pdf',
    pages: 6,
    copies: 1,
    colorMode: 'Grayscale',
    paperSize: 'A4',
    submittedAt: '25 mins ago',
    status: 'processing',
  },
  {
    id: 'REQ-2024-003',
    studentId: '2023-40911',
    studentName: 'Althea Mae Santos',
    department: 'College of Nursing (BSN)',
    documentName: 'Clinical_Duty_Log_ShiftB.docx',
    pages: 4,
    copies: 3,
    colorMode: 'Grayscale',
    paperSize: 'Letter (Short)',
    submittedAt: '42 mins ago',
    status: 'ready',
  },
  {
    id: 'REQ-2024-004',
    studentId: '2020-00831',
    studentName: 'Christian Dave Perez',
    department: 'College of Business (BSBA)',
    documentName: 'Feasibility_Study_Executive_Summary.pdf',
    pages: 32,
    copies: 1,
    colorMode: 'Full Color',
    paperSize: 'A4',
    submittedAt: '1 hour ago',
    status: 'completed',
  },
  {
    id: 'REQ-2024-005',
    studentId: '2022-29810',
    studentName: 'Janelle Bianca Roxas',
    department: 'College of Arts & Sciences',
    documentName: 'Midterm_Thesis_Draft_v3.pdf',
    pages: 14,
    copies: 1,
    colorMode: 'Grayscale',
    paperSize: 'Legal (Long)',
    submittedAt: '1 hour ago',
    status: 'pending',
  },
];

const TABLE_PAGE_SIZE = 4;

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth();
  const [jobs, setJobs] = useState<PrintJob[]>(INITIAL_JOBS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'processing' | 'ready' | 'completed'>('all');
  const [tablePage, setTablePage] = useState(1);

  const updateJobStatus = (id: string, newStatus: PrintJob['status']) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status: newStatus } : job))
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (activeFilter === 'all') return true;
      return j.status === activeFilter;
    });
  }, [jobs, activeFilter]);

  // reset to first page when filter changes
  useEffect(() => {
    setTablePage(1);
  }, [activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / TABLE_PAGE_SIZE));

  // clamp page if jobs were removed and page is now out of range
  useEffect(() => {
    if (tablePage > totalPages) setTablePage(totalPages);
  }, [tablePage, totalPages]);

  const paginatedJobs = useMemo(() => {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return filteredJobs.slice(start, start + TABLE_PAGE_SIZE);
  }, [filteredJobs, tablePage]);

  return (
    <AdminLayout
    >
      <div className="space-y-6">
        {/* Welcome Operational Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#073474] via-[#052655] to-[#041d40] text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#FF7701]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold mb-2.5 border border-white/10 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFB647]" />
                Authenticated BukSU Google Workspace Session
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome back, {adminUser?.name || 'BukSU Officer'}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                Role: <span className="font-bold text-[#FFB647]">{adminUser?.role || 'Admin'}</span> • Department:{' '}
                <span className="font-medium text-white">{adminUser?.department || 'College of Technologies'}</span> • Student ID:{' '}
                <span className="font-mono text-blue-200">{adminUser?.studentId || '2024-ADMIN'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SBO Desk Station Online
              </span>
            </div>
          </div>
        </div>

        {/* Operational Queue Table & Station Hardware Health */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Column (2/3 width): Live Queue Table */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {/* Header & Filter Controls */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAF9]/60">
              <div>
                <h3 className="text-base font-black text-[#2A1400] tracking-tight">
                  Live Print Request Queue
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Review student documents, update print statuses, and dispatch to tray
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
                {(['all', 'pending', 'processing', 'ready', 'completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFilter(tab)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                      activeFilter === tab
                        ? 'bg-white text-[#073474] shadow-xs'
                        : 'text-slate-500 hover:text-[#073474]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-[#FAFAF9] border-b border-slate-200/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student & ID</th>
                    <th className="py-3 px-4">Document / Specs</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                        No print requests matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Student Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#2A1400]">{job.studentName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{job.studentId}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {job.department}
                          </div>
                        </td>

                        {/* Document Specs */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#073474]">
                            <span className="truncate max-w-[200px]" title={job.documentName}>
                              {job.documentName}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="font-semibold">{job.pages} pgs × {job.copies} copy</span>
                            <span>•</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                job.colorMode === 'Full Color'
                                  ? 'bg-[#FF7701]/10 text-[#FF7701]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {job.colorMode}
                            </span>
                            <span>•</span>
                            <span>{job.paperSize}</span>
                          </div>
                        </td>

                        {/* Submitted */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium text-[11px]">
                          {job.submittedAt}
                        </td>

                        {/* Status Pill */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {job.status === 'pending' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Approval
                            </span>
                          )}
                          {job.status === 'processing' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Printing
                            </span>
                          )}
                          {job.status === 'ready' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Ready for Claim
                            </span>
                          )}
                          {job.status === 'completed' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Claimed
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {job.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => updateJobStatus(job.id, 'processing')}
                                className="px-2.5 py-1 bg-[#073474] text-white rounded-lg text-xs font-bold hover:bg-[#052655] transition-colors cursor-pointer"
                              >
                                Print
                              </button>
                            )}
                            {job.status === 'processing' && (
                              <button
                                type="button"
                                onClick={() => updateJobStatus(job.id, 'ready')}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                              >
                                Mark Ready
                              </button>
                            )}
                            {job.status === 'ready' && (
                              <button
                                type="button"
                                onClick={() => updateJobStatus(job.id, 'completed')}
                                className="px-2.5 py-1 bg-[#FF7701] text-white rounded-lg text-xs font-bold hover:bg-[#e06900] transition-colors cursor-pointer"
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={tablePage}
              total={filteredJobs.length}
              limit={TABLE_PAGE_SIZE}
              onPageChange={setTablePage}
              itemLabel="jobs"
            />
          </div>

          {/* Side Column (1/3 width): Hardware, Supply & Station Status */}
          <div className="space-y-4">
            {/* Station Hardware Widget */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-[#073474]" />
                  <h4 className="text-sm font-black text-[#2A1400]">Station Hardware</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                {/* Black Toner */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#2A1400] mb-1">
                    <span>Black Toner (K)</span>
                    <span className="text-slate-500 font-mono">82%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-900 h-full rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                {/* Color Toner (CMY) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#2A1400] mb-1">
                    <span>Color Cartridge (CMY)</span>
                    <span className="text-slate-500 font-mono">64%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-[#FF7701] h-full" style={{ width: '64%' }} />
                  </div>
                </div>

                {/* Paper Tray 1 */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#2A1400] mb-1">
                    <span>Paper Tray 1 (Letter 80gsm)</span>
                    <span className="text-slate-500 font-mono">340 / 500 sheets</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#073474] h-full rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>

                {/* Paper Tray 2 */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#2A1400] mb-1">
                    <span>Paper Tray 2 (A4 80gsm)</span>
                    <span className="text-slate-500 font-mono">480 / 500 sheets</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#073474] h-full rounded-full" style={{ width: '96%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* BukSU SBO Policy Reminder */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs leading-relaxed space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                BukSU Officer Policy Notice
              </div>
              <p className="text-[11px] text-amber-800/90">
                Ensure all documents are inspected for standard BukSU academic guidelines prior to releasing from the claim desk. Free printing quota is strictly non-transferable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

