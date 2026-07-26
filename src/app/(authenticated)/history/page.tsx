'use client';

import { useState, useEffect, Fragment } from 'react';
import { Download, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface HistoryEntry {
  id: string;
  subject: string;
  subjectCode: string;
  year: string;
  semester: number;
  finalPaper?: string;
  finalMarkingScheme?: string;
  moderatorReport?: string;
}

export default function HistoryPage() {
  const [selectedYear, setSelectedYear] = useState('2025/2026');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/papers');
        if (res.ok) {
          const papers = await res.json();
          const finalizedPapers = papers.filter((p: any) => p.status === 'finalized');
          
          const historyData = finalizedPapers.map((p: any) => ({
            id: p.id,
            subject: p.subjectName,
            subjectCode: p.subjectCode,
            year: p.academicYear,
            semester: p.semester,
            finalPaper: p.paperUrl,
            finalMarkingScheme: p.markingSchemeUrl,
            moderatorReport: `/api/moderation-reports?paperId=${p.id}`,
          }));
          
          setHistory(historyData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredHistory = history.filter(
    (entry) => entry.year === selectedYear && entry.semester.toString() === selectedSemester
  );

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading history entries...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Finalized Papers</h1>
        <p className="text-gray-600 mt-1">View all completed and locked examination papers and reports</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Academic Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Semester
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHistory.map((entry) => (
              <Fragment key={entry.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRow(entry.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedRows.has(entry.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{entry.subjectCode}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{entry.subject}</td>
                  <td className="px-6 py-4 text-gray-600">{entry.year}</td>
                  <td className="px-6 py-4 text-gray-600">Semester {entry.semester}</td>
                </tr>
                {expandedRows.has(entry.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-12 py-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Finalized Version & Report</h3>
                          <div className="flex gap-3">
                            {entry.finalPaper ? (
                              <a
                                href={entry.finalPaper}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                View Final Paper
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500 font-medium px-4 py-2 bg-gray-100 rounded-lg">Final paper not uploaded</span>
                            )}
                            {entry.finalMarkingScheme ? (
                              <a
                                href={entry.finalMarkingScheme}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                View Final Marking Scheme
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500 font-medium px-4 py-2 bg-gray-100 rounded-lg">Final marking scheme not uploaded</span>
                            )}
                            <a
                              href={`/revision/${entry.id}`}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors inline-flex"
                            >
                              <FileText className="w-4 h-4" />
                              View Moderation Report & Actions
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        
        {filteredHistory.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-medium bg-white">
            No finalized history entries found.
          </div>
        )}
      </div>
    </div>
  );
}
