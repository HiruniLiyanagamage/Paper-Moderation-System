'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, Users, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function SubjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;
  const { user } = useAuth();

  const [subject, setSubject] = useState<any>(null);
  const [existingPaperId, setExistingPaperId] = useState<string | null>(null);
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [markingSchemeFile, setMarkingSchemeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSubjectAndPapers = async () => {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`);
        if (res.ok) {
          const data = await res.json();
          setSubject(data);
          
          if (data.papers && data.papers.length > 0) {
            setExistingPaperId(data.papers[0].id);
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
      alert('Please upload both paper and marking scheme');
      return;
    }
    if (!user || !subject) return;

    setUploading(true);
    try {
      // Upload files to Supabase Storage
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
        alert('Paper submitted for review!');
        router.push('/lecturer/dashboard');
      } else {
        alert('Failed to submit paper for review');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'An error occurred while submitting');
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

  return (
    <div className="p-8">
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Upload Examination Paper</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
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
    </div>
  );
}
