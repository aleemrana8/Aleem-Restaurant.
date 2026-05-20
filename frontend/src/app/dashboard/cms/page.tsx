'use client';

export default function CmsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Content Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-lg mb-2">Banners</h3>
          <p className="text-sm text-gray-500">Manage homepage banners and promotional content.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-lg mb-2">Posts</h3>
          <p className="text-sm text-gray-500">Manage blog posts and announcements.</p>
        </div>
      </div>
    </div>
  );
}
