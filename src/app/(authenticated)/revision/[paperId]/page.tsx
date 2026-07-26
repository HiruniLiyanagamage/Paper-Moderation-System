'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download, Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PaperRevisionPage() {
  const router = useRouter();
  const params = useParams();
  const paperId = params.paperId as string;

  const [paper, setPaper] = useState<any>(null);
  const [moderationReport, setModerationReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [followUpActions, setFollowUpActions] = useState<string[]>(['', '', '', '', '']);
  const [finalPaperFile, setFinalPaperFile] = useState<File | null>(null);
  const [finalMarkingSchemeFile, setFinalMarkingSchemeFile] = useState<File | null>(null);
  const [lecturerSignatureFile, setLecturerSignatureFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paperRes, reportRes] = await Promise.all([
          fetch(`/api/papers/${paperId}`),
          fetch(`/api/moderation-reports?paperId=${paperId}`),
        ]);

        if (paperRes.ok) {
          const paperData = await paperRes.json();
          setPaper(paperData);
        }
        if (reportRes.ok) {
          const reportData = await reportRes.json();
          setModerationReport(reportData);
          if (reportData.followUpActions && Array.isArray(reportData.followUpActions)) {
            const actions = [...reportData.followUpActions];
            while (actions.length < 5) {
              actions.push('');
            }
            setFollowUpActions(actions);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [paperId]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading revision details...</p>
      </div>
    );
  }

  if (!paper || !moderationReport) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Paper or moderation report not found</h1>
        <button onClick={() => router.push('/lecturer/dashboard')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isFinalized = paper.status === 'finalized';

  const handleFollowUpChange = (index: number, value: string) => {
    if (isFinalized) return;
    const newActions = [...followUpActions];
    newActions[index] = value;
    setFollowUpActions(newActions);
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  };

  const handleDownloadReport = async () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('WAYAMBA UNIVERSITY OF SRI LANKA', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('FACULTY OF APPLIED SCIENCES', 105, 28, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Examination Question Paper Moderation', 105, 36, { align: 'center' });

    doc.setFontSize(10);
    let yPos = 50;
    doc.text(`Subject: ${paper.subjectName}`, 20, yPos);
    yPos += 7;
    doc.text(`Course Code: ${paper.subjectCode}`, 20, yPos);
    yPos += 7;
    doc.text(`Academic Year: ${paper.academicYear}`, 20, yPos);
    yPos += 7;
    doc.text(`Semester: ${paper.semester}`, 20, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.text('Moderator\'s Report', 20, yPos);
    yPos += 7;

    const remarkLabels = [
      'Questions are up to the standard appropriate for the level',
      'Paper covers main contents in the syllabus',
      'Questions assess learning outcomes appropriately',
      'Questions are clear and unambiguous',
      'Time allocation is appropriate',
      'Mark allocation is appropriate',
      'Numbering and formatting are appropriate',
      'Figures are clear and labeled',
      'Model answers are accurate',
      'Model answers are structured with marks breakdown',
    ];

    const remarksData = Object.values(moderationReport.remarks || {}).map((value, index) => [
      remarkLabels[index] || '',
      value ? 'Yes' : 'No',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Criteria', 'Status']],
      body: remarksData,
      theme: 'grid',
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.text('Additional Comments:', 20, yPos);
    yPos += 7;
    doc.setFontSize(9);
    const splitComments = doc.splitTextToSize(moderationReport.additionalComments || '', 170);
    doc.text(splitComments, 20, yPos);
    yPos += splitComments.length * 5 + 10;

    doc.setFontSize(11);
    doc.text('Follow-up Actions Taken:', 20, yPos);
    yPos += 7;
    doc.setFontSize(9);
    const actions = followUpActions.filter(a => a.trim());
    if (actions.length > 0) {
      actions.forEach((action, index) => {
        doc.text(`${index + 1}. ${action}`, 25, yPos);
        yPos += 5;
      });
    } else {
      doc.text('No follow-up actions added yet.', 25, yPos);
      yPos += 5;
    }

    // Add Signature Section
    yPos += 10;
    if (yPos > 210) {
      doc.addPage();
      yPos = 20;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // Left Column: Moderator
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Moderator Remarks Signed By:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${moderationReport.moderatorName}`, 20, yPos + 5);
    const modDateStr = new Date(moderationReport.createdAt).toLocaleString();
    doc.text(`Date & Time: ${modDateStr}`, 20, yPos + 10);
    
    // Embed Moderator's Signature Image if available
    if (moderationReport.moderatorSignatureUrl) {
      try {
        const modImg = await loadImage(moderationReport.moderatorSignatureUrl);
        doc.addImage(modImg, 'PNG', 20, yPos + 15, 40, 15);
      } catch (e) {
        console.error('Failed to embed moderator signature image in PDF:', e);
      }
    }

    doc.text('_____________________________________', 20, yPos + 33);
    doc.text('Signature of Moderator', 20, yPos + 38);

    // Right Column: Lecturer
    doc.setFont('helvetica', 'bold');
    doc.text('Follow-up Actions Signed By:', 110, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${paper.lecturerName}`, 110, yPos + 5);
    const lecDateStr = isFinalized 
      ? new Date(paper.updatedAt).toLocaleString() 
      : new Date().toLocaleString();
    doc.text(`Date & Time: ${lecDateStr}`, 110, yPos + 10);
    
    // Embed Lecturer's Signature Image if available
    const lecSigUrl = isFinalized 
      ? moderationReport.lecturerSignatureUrl 
      : (lecturerSignatureFile ? URL.createObjectURL(lecturerSignatureFile) : null);

    if (lecSigUrl) {
      try {
        const lecImg = await loadImage(lecSigUrl);
        doc.addImage(lecImg, 'PNG', 110, yPos + 15, 40, 15);
      } catch (e) {
        console.error('Failed to embed lecturer signature image in PDF:', e);
      }
    }

    doc.text('_____________________________________', 110, yPos + 33);
    doc.text('Signature of Lecturer', 110, yPos + 38);

    doc.setFont('helvetica', 'normal');

    doc.save(`Moderation_Report_${paper.subjectCode}.pdf`);
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'File upload failed');
    }

    const data = await res.json();
    return data.url;
  };

  const handleFinalize = async () => {
    if (isFinalized) return;
    if (!finalPaperFile || !finalMarkingSchemeFile) {
      alert('Please upload both final paper and marking scheme');
      return;
    }
    const filledActions = followUpActions.filter(a => a.trim());
    if (filledActions.length === 0) {
      alert('Please add at least one follow-up action');
      return;
    }
    if (!lecturerSignatureFile) {
      alert('Please upload your signature image');
      return;
    }

    setFinalizing(true);
    try {
      // Upload final files and lecturer signature
      const [paperUrl, markingSchemeUrl, lecturerSignatureUrl] = await Promise.all([
        uploadFile(finalPaperFile, `papers-final/${paperId}`),
        uploadFile(finalMarkingSchemeFile, `marking-schemes-final/${paperId}`),
        uploadFile(lecturerSignatureFile, `signatures-lecturer/${paperId}`),
      ]);

      // 1. Update the moderation report with the follow-up actions and lecturer signature
      const reportRes = await fetch('/api/moderation-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId,
          moderatorId: moderationReport.moderatorId,
          remarks: moderationReport.remarks,
          additionalComments: moderationReport.additionalComments,
          followUpActions: filledActions,
          lecturerSignatureUrl,
        }),
      });

      // 2. Update the paper status to FINALIZED and save final files
      const paperRes = await fetch(`/api/papers/${paperId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'finalized',
          paperUrl,
          markingSchemeUrl,
        }),
      });

      if (reportRes.ok && paperRes.ok) {
        alert('Paper finalized successfully! It is now locked and viewable in History.');
        router.push('/lecturer/dashboard');
      } else {
        alert('Failed to finalize paper');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'An error occurred during finalization');
    } finally {
      setFinalizing(false);
    }
  };

  const handleCancel = () => {
    router.push('/lecturer/dashboard');
  };

  return (
    <div className="p-8">
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      {isFinalized && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 font-medium">
          <CheckCircle className="w-5 h-5 text-green-600" />
          This paper has been Finalized. No further edits or uploads can be made.
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 font-sans">Paper Revision</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Subject:</span>
            <span className="ml-2 font-medium">{paper.subjectName}</span>
          </div>
          <div>
            <span className="text-gray-600">Course Code:</span>
            <span className="ml-2 font-medium">{paper.subjectCode}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Original Draft Files</h2>
        <div className="flex gap-3">
          {paper.paperUrl ? (
            <a
              href={paper.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              View Submitted Paper
            </a>
          ) : (
            <span className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg">Paper unavailable</span>
          )}
          {paper.markingSchemeUrl ? (
            <a
              href={paper.markingSchemeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              View Submitted Marking Scheme
            </a>
          ) : (
            <span className="px-4 py-2 text-gray-400 bg-gray-100 rounded-lg">Scheme unavailable</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Moderator's Feedback</h2>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{moderationReport.additionalComments}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Follow-Up Actions (Lecturer's Response)</h2>
        <p className="text-sm text-gray-600 mb-4">Describe the actions taken to address the moderator's feedback:</p>
        <div className="space-y-3">
          {followUpActions.map((action, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {index + 1}.
              </label>
              <input
                type="text"
                value={action}
                onChange={(e) => handleFollowUpChange(index, e.target.value)}
                disabled={isFinalized}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Describe the action taken..."
              />
            </div>
          ))}
        </div>
      </div>

      {!isFinalized && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Final Versions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Final Paper (PDF)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFinalPaperFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="final-paper-upload"
                />
                <label htmlFor="final-paper-upload" className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {finalPaperFile ? finalPaperFile.name : 'Click to upload final paper'}
                  </span>
                  {finalPaperFile && <span className="text-xs text-green-600 mt-1">✓ File selected</span>}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Final Marking Scheme (PDF)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFinalMarkingSchemeFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="final-scheme-upload"
                />
                <label htmlFor="final-scheme-upload" className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {finalMarkingSchemeFile ? finalMarkingSchemeFile.name : 'Click to upload final marking scheme'}
                  </span>
                  {finalMarkingSchemeFile && <span className="text-xs text-green-600 mt-1">✓ File selected</span>}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signatures UI Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Digital Signatures & Verification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Moderator Signature */}
          <div className="border border-blue-100 bg-blue-50/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-3">Moderator Signature</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between border-b border-blue-55 pb-1">
                <span className="text-gray-500">Digitally Signed By:</span>
                <span className="font-semibold text-gray-900">{moderationReport.moderatorName}</span>
              </p>
              <p className="flex justify-between border-b border-blue-55 pb-1">
                <span className="text-gray-500">Date & Time:</span>
                <span className="font-mono text-gray-900">{new Date(moderationReport.createdAt).toLocaleString()}</span>
              </p>
              <p className="flex justify-between items-center pt-1">
                <span className="text-gray-500">Signature Status:</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  Verified ✓
                </span>
              </p>
              {moderationReport.moderatorSignatureUrl && (
                <div className="mt-3 border rounded p-2 bg-white flex justify-center">
                  <img
                    src={moderationReport.moderatorSignatureUrl}
                    alt="Moderator Signature"
                    className="max-h-16 object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Lecturer Signature */}
          <div className="border border-purple-100 bg-purple-50/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wider mb-3">Lecturer Signature</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between border-b border-purple-55 pb-1">
                <span className="text-gray-500">Digitally Signed By:</span>
                <span className="font-semibold text-gray-900">{paper.lecturerName}</span>
              </p>
              <p className="flex justify-between border-b border-purple-55 pb-1">
                <span className="text-gray-500">Date & Time:</span>
                <span className="font-mono text-gray-900">
                  {isFinalized 
                    ? new Date(paper.updatedAt).toLocaleString() 
                    : new Date().toLocaleString() + ' (Digitally signed on download/finalization)'}
                </span>
              </p>
              <p className="flex justify-between items-center pt-1 mb-2">
                <span className="text-gray-500">Signature Status:</span>
                {isFinalized ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    Verified ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Pending Finalization
                  </span>
                )}
              </p>

              {!isFinalized ? (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Upload Signature Image (PNG/JPG)</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-white hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLecturerSignatureFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="lecturer-sig-upload"
                    />
                    <label htmlFor="lecturer-sig-upload" className="flex flex-col items-center cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600">
                        {lecturerSignatureFile ? lecturerSignatureFile.name : 'Click to upload signature image'}
                      </span>
                      {lecturerSignatureFile && <span className="text-[10px] text-green-600 mt-1">✓ Signature image selected</span>}
                    </label>
                  </div>
                  {lecturerSignatureFile && (
                    <div className="mt-2 border rounded p-2 bg-white flex justify-center">
                      <img
                        src={URL.createObjectURL(lecturerSignatureFile)}
                        alt="Lecturer Signature Preview"
                        className="max-h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : (
                moderationReport.lecturerSignatureUrl && (
                  <div className="mt-3 border rounded p-2 bg-white flex justify-center">
                    <img
                      src={moderationReport.lecturerSignatureUrl}
                      alt="Lecturer Signature"
                      className="max-h-16 object-contain"
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <FileText className="w-5 h-5" />
          Download Moderator Report (PDF)
        </button>
        {!isFinalized && (
          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            {finalizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Finalize Paper
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
