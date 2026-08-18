'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Users, Send, Loader2, Clock, Eye } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/Toast';

export default function SubjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const { user } = useAuth();

  const [subject, setSubject] = useState<any>(null);
  const [existingPaperId, setExistingPaperId] = useState<string | null>(null);
  const [existingPaperStatus, setExistingPaperStatus] = useState<string | null>(null);
  const [submittedPaper, setSubmittedPaper] = useState<any>(null);
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [markingSchemeFile, setMarkingSchemeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { showToast, ToastElement } = useToast();

  useEffect(() => {
    const fetchSubjectAndPapers = async () => {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`);
        if (res.ok) {
          const data = await res.json();
          setSubject(data);

          if (data.papers && data.papers.length > 0) {
            setExistingPaperId(data.papers[0].id);
            setExistingPaperStatus(data.papers[0].status);
            setSubmittedPaper(data.papers[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjectAndPapers();
  }, [subjectId]);

  const handlePaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaperFile(e.target.files[0]);
    }
  };

  const handleMarkingSchemeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMarkingSchemeFile(e.target.files[0]);
    }
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

  const handleSubmitForReview = async () => {
    if (!paperFile || !markingSchemeFile) {
      showToast('Please upload both paper and marking scheme', 'warning');
      return;
    }
    if (!user || !subject) return;

    setUploading(true);
    try {
      const [paperUrl, markingSchemeUrl] = await Promise.all([
        uploadFile(paperFile, `papers/${subjectId}`),
        uploadFile(markingSchemeFile, `marking-schemes/${subjectId}`),
      ]);

      let response;
      if (existingPaperId && !existingPaperId.startsWith('virtual-')) {
        response = await fetch(`/api/papers/${existingPaperId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'under_moderation',
            paperUrl,
            markingSchemeUrl,
          }),
        });
      } else {
        response = await fetch('/api/papers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId,
            lecturerId: user.id,
            academicYear: subject.academicYear,
            semester: subject.semester,
            status: 'under_moderation',
            paperUrl,
            markingSchemeUrl,
          }),
        });
      }

      if (response.ok) {
        showToast('Paper submitted for review!', 'success');
        setTimeout(() => router.push('/lecturer/dashboard'), 1500);
      } else {
        showToast('Failed to submit paper for review', 'error');
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'An error occurred while submitting', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.push('/lecturer/dashboard');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading subject details...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Subject not found</h1>
        <button onClick={handleCancel} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isUnderModeration = existingPaperStatus === 'under_moderation';

  return (
    <div className="p-4 md:p-8">
      {ToastElement}
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      {/* Subject info card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Upload Examination Paper</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Subject Code:</span>
            <span className="ml-2 font-medium">{subject.code}</span>
          </div>
          <div>
            <span className="text-gray-600">Subject Name:</span>
            <span className="ml-2 font-medium">{subject.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Academic Year:</span>
            <span className="ml-2 font-medium">{subject.academicYear}</span>
          </div>
          <div>
            <span className="text-gray-600">Semester:</span>
            <span className="ml-2 font-medium">Semester {subject.semester}</span>
          </div>
        </div>
      </div>

      {/* Under moderation view section */}
      {isUnderModeration && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="font-semibold text-yellow-800 text-lg">Paper Under Moderation</h2>
                <p className="text-yellow-700 text-sm mt-1">
                  Your paper has been submitted and is currently being reviewed by the moderator.
                  You cannot upload or edit files until the moderator has returned their feedback.
                </p>
                <p className="text-yellow-600 text-xs mt-2 font-medium">
                  You will be able to make revisions once you receive the moderation report.
                </p>
              </div>
            </div>
          </div>

          {/* Submitted Files View Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submitted Files for Review</h2>
            <p className="text-sm text-gray-600 mb-4">You can view the documents you submitted below:</p>
            <div className="flex flex-wrap gap-4">
              {submittedPaper?.paperUrl ? (
                <a
                  href={submittedPaper.paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  View Submitted Paper (PDF)
                </a>
              ) : (
                <span className="px-4 py-3 bg-gray-100 text-gray-400 rounded-lg font-medium">Paper unavailable</span>
              )}

              {submittedPaper?.markingSchemeUrl ? (
                <a
                  href={submittedPaper.markingSchemeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  View Submitted Marking Scheme (PDF)
                </a>
              ) : (
                <span className="px-4 py-3 bg-gray-100 text-gray-400 rounded-lg font-medium">Marking scheme unavailable</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Assigned Moderator</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">{subject.moderator?.name || 'Not assigned'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload section — hidden while under moderation */}
      {!isUnderModeration && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">Upload Files</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Examination Paper (PDF)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePaperUpload}
                    className="hidden"
                    id="paper-upload"
                  />
                  <label
                    htmlFor="paper-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {paperFile ? paperFile.name : 'Click to upload paper'}
                    </span>
                    {paperFile && (
                      <span className="text-xs text-green-600 mt-1">✓ File selected</span>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Marking Scheme (PDF)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleMarkingSchemeUpload}
                    className="hidden"
                    id="marking-scheme-upload"
                  />
                  <label
                    htmlFor="marking-scheme-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {markingSchemeFile ? markingSchemeFile.name : 'Click to upload marking scheme'}
                    </span>
                    {markingSchemeFile && (
                      <span className="text-xs text-green-600 mt-1">✓ File selected</span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Assigned Moderator</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">{subject.moderator?.name || 'Not assigned'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitForReview}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading &amp; Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit for Review
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
