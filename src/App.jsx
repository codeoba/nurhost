import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DriveToolbar from './components/DriveToolbar';
import FolderGrid from './components/FolderGrid';
import FileGrid from './components/FileGrid';
import AudioPlayerModal from './components/AudioPlayerModal';
import { VideoPlayerModal, ImageViewerModal, CodeViewerModal, FileDetailModal } from './components/MediaViewerModals';
import ShareModal from './components/ShareModal';
import PublicShareView from './components/PublicShareView';
import UploadModal from './components/UploadModal';
import NewFolderModal from './components/NewFolderModal';
import PricingModal from './components/PricingModal';
import Toast from './components/Toast';

import { INITIAL_FOLDERS, INITIAL_FILES } from './mockData';
import { fetchFilesAndFolders, detectFileType, deleteFileApi, deleteBatchFilesApi } from './api';

import MonacoTextEditorModal from './components/MonacoTextEditorModal';
import ZipUnzipModal from './components/ZipUnzipModal';
import RenameModal from './components/RenameModal';
import FileVersionDrawer from './components/FileVersionDrawer';
import TrashManager from './components/TrashManager';
import MoveToFolderModal from './components/MoveToFolderModal';
import StorageAnalyticsModal from './components/StorageAnalyticsModal';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('drive'); // 'drive' or 'public-share'
  const [activeNav, setActiveNav] = useState('drive');
  const [currentFolderId, setCurrentFolderId] = useState(null);

  const [folders, setFolders] = useState(() => {
    try {
      const saved = localStorage.getItem('nurhost_folders');
      return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
    } catch (e) {
      return INITIAL_FOLDERS;
    }
  });

  const [files, setFiles] = useState(() => {
    try {
      const saved = localStorage.getItem('nurhost_files');
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    } catch (e) {
      return INITIAL_FILES;
    }
  });

  // Automatically persist files & folders to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('nurhost_folders', JSON.stringify(folders));
    } catch (e) {}
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem('nurhost_files', JSON.stringify(files));
    } catch (e) {}
  }, [files]);

  // Fetch real uploaded files from server disk storage on mount
  useEffect(() => {
    fetchFilesAndFolders().then(data => {
      if (data && data.success && Array.isArray(data.files)) {
        setFiles(data.files);
      }
    }).catch(err => console.warn("Could not sync server files:", err));
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Bulk Selection
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);

  // Active Modals
  const [previewAudioFile, setPreviewAudioFile] = useState(null);
  const [previewVideoFile, setPreviewVideoFile] = useState(null);
  const [previewImageFile, setPreviewImageFile] = useState(null);
  const [previewCodeFile, setPreviewCodeFile] = useState(null);
  const [previewDetailFile, setPreviewDetailFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null); // { item, isFolder }
  const [versionFileTarget, setVersionFileTarget] = useState(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showMonacoModal, setShowMonacoModal] = useState(false);
  const [activeZipFile, setActiveZipFile] = useState(null);
  const [showStorageAnalytics, setShowStorageAnalytics] = useState(false);
  const [moveTargetFiles, setMoveTargetFiles] = useState([]); // files to move
  const [showMoveModal, setShowMoveModal] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sync Dark Mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Sort Logic
  const filteredFolders = folders.filter((folder) => {
    if (activeNav === 'trash') return false;
    if (currentFolderId && folder.parentId !== currentFolderId) return false;
    if (!currentFolderId && folder.parentId !== null) return false;
    if (searchQuery && !folder.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredFiles = files.filter((file) => {
    // Navigation filtering
    if (activeNav === 'trash') return file.inTrash;
    if (file.inTrash) return false;

    if (activeNav === 'starred' && !file.isStarred) return false;
    if (activeNav === 'shared' && !file.isShared) return false;
    if (activeNav === 'public-links' && !file.shareUrl) return false;
    if (activeNav === 'recent') {
      const isRecent = new Date(file.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (!isRecent) return false;
    }

    // Folder structure filtering (only filter by folder if in 'drive' nav and no active search)
    if (activeNav === 'drive' && !searchQuery) {
      if (currentFolderId) {
        if (file.folderId !== currentFolderId) return false;
      } else {
        if (file.folderId !== null) return false;
      }
    }

    // Category filter chip
    if (selectedCategory !== 'all' && file.type !== selectedCategory) return false;

    // Search Query
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    if (sortBy === 'size') comparison = a.size - b.size;
    if (sortBy === 'date') comparison = new Date(b.updatedAt) - new Date(a.updatedAt);
    if (sortBy === 'type') comparison = a.type.localeCompare(b.type);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Handlers
  const handlePreviewFile = (file) => {
    const name = (file.name || file.originalFilename || '').toLowerCase();

    // 1. Strict guard: if filename ends with zip/rar/7z/tar/iso, ALWAYS route to ZipUnzipModal!
    if (/\.(zip|rar|7z|tar|gz|bz2|iso)$/i.test(name) || name.endsWith('.zip')) {
      setActiveZipFile(file);
      return;
    }

    const detected = detectFileType(name, file.mimeType);

    if (detected === 'archive') {
      setActiveZipFile(file);
    } else if (detected === 'audio') {
      setPreviewAudioFile(file);
    } else if (detected === 'video') {
      setPreviewVideoFile(file);
    } else if (detected === 'image') {
      setPreviewImageFile(file);
    } else if (detected === 'code') {
      setPreviewCodeFile(file);
    } else {
      setPreviewDetailFile(file);
    }
  };

  const handleToggleStarFile = (id) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, isStarred: !f.isStarred } : f));
    triggerToast('Starred status updated');
  };

  const handleToggleStarFolder = (id) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, isStarred: !f.isStarred } : f));
    triggerToast('Folder starred status updated');
  };

  const handleDeleteFile = (id) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, inTrash: true } : f));
    triggerToast('Moved item to trash');
  };

  const handleDeleteFolder = (id) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    triggerToast('Folder deleted');
  };

  const handleRestoreFile = (id) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, inTrash: false } : f));
    triggerToast('File restored to Drive ✓');
  };

  const handlePermanentDelete = async (id) => {
    const targetFile = files.find(f => f.id === id);
    if (targetFile) {
      try {
        await deleteFileApi(targetFile.id, targetFile.cleanFilename || targetFile.name);
      } catch (e) {}
    }
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    try {
      localStorage.setItem('nurhost_files', JSON.stringify(updated));
    } catch (e) {}
    triggerToast('File permanently deleted from server disk');
  };

  const handleBulkRestore = (ids) => {
    setFiles(prev => prev.map(f => ids.includes(f.id) ? { ...f, inTrash: false } : f));
    triggerToast(`${ids.length} file(s) restored to Drive ✓`);
  };

  const handleBulkPermanentDelete = async (ids) => {
    const targets = files.filter(f => ids.includes(f.id));
    try {
      await deleteBatchFilesApi(
        targets.map(f => f.id),
        targets.map(f => f.cleanFilename || f.name)
      );
    } catch (e) {}
    const updated = files.filter(f => !ids.includes(f.id));
    setFiles(updated);
    try {
      localStorage.setItem('nurhost_files', JSON.stringify(updated));
    } catch (e) {}
    triggerToast(`${ids.length} file(s) permanently deleted from server disk`);
  };

  const handleMoveFiles = (fileIds, targetFolderId) => {
    setFiles(prev => prev.map(f =>
      fileIds.includes(f.id) ? { ...f, folderId: targetFolderId } : f
    ));
    const target = folders.find(fo => fo.id === targetFolderId);
    triggerToast(`Moved ${fileIds.length} file(s) to ${target ? target.name : 'My Drive'} ✓`);
    setMoveTargetFiles([]);
    setShowMoveModal(false);
  };

  const handleToggleSelectFile = (id) => {
    setSelectedFileIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFileIds.length === filteredFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredFiles.map(f => f.id));
    }
  };

  const handleUploadComplete = (newFiles) => {
    const created = newFiles.map(nf => {
      const detectedType = detectFileType(nf.name || nf.originalFilename, nf.mimeType || '');
      const clean = nf.cleanFilename || nf.name || nf.originalFilename;
      const fileUrl = nf.url || nf.storagePath || `/api/files/uploads-serve/user_demo-user-123/${encodeURIComponent(clean)}`;

      return {
        id: nf.id || `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: nf.name || nf.originalFilename || 'Uploaded File',
        originalFilename: nf.originalFilename || nf.name,
        cleanFilename: clean,
        type: nf.type || detectedType,
        mimeType: nf.mimeType || (detectedType === 'audio' ? 'audio/mpeg' : 'application/octet-stream'),
        size: nf.size || 0,
        sizeFormatted: nf.sizeFormatted || '0.0 KB',
        url: fileUrl,
        storagePath: fileUrl,
        shareCode: nf.shareCode || `code-${Date.now()}`,
        shareUrl: nf.shareUrl || `https://nurhost.app/drive/s/code-${Date.now()}`,
        folderId: currentFolderId,
        isStarred: false,
        isShared: false,
        inTrash: false,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        owner: { name: 'Administrator', email: 'admin@nurhost.app', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }
      };
    });

    setFiles(prev => [...created, ...prev]);
    triggerToast(`Successfully uploaded ${newFiles.length} file(s) to NurHost!`);
  };

  const handleCreateFolder = (newFolder) => {
    setFolders(prev => [newFolder, ...prev]);
    triggerToast(`Folder "${newFolder.name}" created`);
  };

  const handleExecuteRename = (id, newName, isFolder) => {
    if (isFolder) {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
      triggerToast(`Badilisho la jina la folda kuwa "${newName}" limehifadhiwa`);
    } else {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
      triggerToast(`Badilisho la jina la faili kuwa "${newName}" limehifadhiwa`);
    }
  };

  const currentFolder = folders.find(f => f.id === currentFolderId);

  // If Public Share Link View Tab is Active
  if (activeTab === 'public-share') {
    const demoAudioFile = files.find(f => f.id === 'file-audio-1') || files[0];
    return (
      <PublicShareView
        file={demoAudioFile}
        onBackToDrive={() => setActiveTab('drive')}
        onToast={triggerToast}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPricing={() => setShowPricingModal(true)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <div className="main-body">
        {/* Sidebar */}
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          folders={folders}
          currentFolderId={currentFolderId}
          setCurrentFolderId={setCurrentFolderId}
          onOpenUpload={() => setShowUploadModal(true)}
          onOpenNewFolder={() => setShowNewFolderModal(true)}
          onOpenPricing={() => setShowPricingModal(true)}
          onOpenMonaco={() => setShowMonacoModal(true)}
          onOpenStorageAnalytics={() => setShowStorageAnalytics(true)}
        />

        {/* Main Drive Area */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-primary)'
        }}>
          {/* Drive Controls Toolbar */}
          <DriveToolbar
            currentFolder={currentFolder}
            onBackToRoot={() => setCurrentFolderId(null)}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedItemsCount={selectedFileIds.length}
            onSelectAll={handleSelectAll}
            allSelected={selectedFileIds.length > 0 && selectedFileIds.length === filteredFiles.length}
            onBulkDownload={() => triggerToast(`Downloading ${selectedFileIds.length} file(s)...`)}
            onBulkStar={() => {
              setFiles(prev => prev.map(f => selectedFileIds.includes(f.id) ? { ...f, isStarred: true } : f));
              triggerToast(`Starred ${selectedFileIds.length} item(s)`);
            }}
            onBulkDelete={() => {
              setFiles(prev => prev.map(f => selectedFileIds.includes(f.id) ? { ...f, inTrash: true } : f));
              setSelectedFileIds([]);
              triggerToast(`Moved ${selectedFileIds.length} item(s) to trash`);
            }}
            onBulkShare={() => triggerToast(`Created shared bundle link`)}
            onBulkMove={() => {
              const selectedFiles = files.filter(f => selectedFileIds.includes(f.id));
              setMoveTargetFiles(selectedFiles);
              setShowMoveModal(true);
            }}
          />

          {/* Scrollable File Workspace */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

            {/* Trash Manager View */}
            {activeNav === 'trash' ? (
              <TrashManager
                files={files}
                onRestoreFile={handleRestoreFile}
                onPermanentDelete={handlePermanentDelete}
                onBulkRestore={handleBulkRestore}
                onBulkPermanentDelete={handleBulkPermanentDelete}
              />
            ) : (
              <>
                {/* Empty State Notice */}
                {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--text-muted)'
                  }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No files found
                    </p>
                    <p style={{ fontSize: '13px' }}>
                      Upload new audio, video or files to get started with NurHost
                    </p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="btn btn-primary"
                      style={{ marginTop: '16px', fontSize: '13px' }}
                    >
                      Upload Files
                    </button>
                  </div>
                )}

                {/* Folders Section */}
                <FolderGrid
                  folders={filteredFolders}
                  viewMode={viewMode}
                  onFolderClick={(id) => setCurrentFolderId(id)}
                  onToggleStar={handleToggleStarFolder}
                  onDeleteFolder={handleDeleteFolder}
                  onRenameFolder={(folder) => setRenameTarget({ item: folder, isFolder: true })}
                  selectedFolderIds={selectedFolderIds}
                  onToggleSelect={(id) => setSelectedFolderIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                />

                {/* Files Section */}
                <FileGrid
                  files={filteredFiles}
                  viewMode={viewMode}
                  onPreviewFile={handlePreviewFile}
                  onShareFile={(file) => setShareFile(file)}
                  onToggleStar={handleToggleStarFile}
                  onDeleteFile={handleDeleteFile}
                  onDownloadFile={(file) => triggerToast(`Downloading ${file.name}...`)}
                  onUnzipFile={(file) => setActiveZipFile(file)}
                  onRenameFile={(file) => setRenameTarget({ item: file, isFolder: false })}
                  onVersionHistory={(file) => setVersionFileTarget(file)}
                  onMoveFile={(file) => { setMoveTargetFiles([file]); setShowMoveModal(true); }}
                  selectedFileIds={selectedFileIds}
                  onToggleSelectFile={handleToggleSelectFile}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      {previewAudioFile && (
        <AudioPlayerModal
          file={previewAudioFile}
          onClose={() => setPreviewAudioFile(null)}
          onShare={(f) => setShareFile(f)}
          onToast={triggerToast}
        />
      )}

      {previewVideoFile && (
        <VideoPlayerModal
          file={previewVideoFile}
          onClose={() => setPreviewVideoFile(null)}
          onShare={(f) => setShareFile(f)}
          onToast={triggerToast}
        />
      )}

      {previewImageFile && (
        <ImageViewerModal
          file={previewImageFile}
          onClose={() => setPreviewImageFile(null)}
          onShare={(f) => setShareFile(f)}
        />
      )}

      {previewCodeFile && (
        <CodeViewerModal
          file={previewCodeFile}
          onClose={() => setPreviewCodeFile(null)}
          onToast={triggerToast}
        />
      )}

      {previewDetailFile && (
        <FileDetailModal
          file={previewDetailFile}
          onClose={() => setPreviewDetailFile(null)}
          onShare={(f) => setShareFile(f)}
          onToast={triggerToast}
        />
      )}

      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => setShareFile(null)}
          onToast={triggerToast}
        />
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {showNewFolderModal && (
        <NewFolderModal
          onClose={() => setShowNewFolderModal(false)}
          onCreateFolder={handleCreateFolder}
        />
      )}

      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          onToast={triggerToast}
        />
      )}

      {/* In-Browser Monaco Text Editor Modal */}
      <MonacoTextEditorModal
        isOpen={showMonacoModal}
        onClose={() => setShowMonacoModal(false)}
        onSaved={(newFile) => {
          setFiles(prev => [{
            id: newFile.id || `file-${Date.now()}`,
            name: newFile.name,
            type: 'code',
            mimeType: 'text/plain',
            size: newFile.size || 512,
            sizeFormatted: '512 B',
            url: '#',
            shareCode: `code-${Date.now()}`,
            shareUrl: `http://localhost:5173/share/code-${Date.now()}`,
            folderId: currentFolderId,
            isStarred: false,
            isShared: false,
            inTrash: false,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }, ...prev]);
          triggerToast(`Created code file: ${newFile.name}`);
        }}
      />

      {/* Selective Zip Extraction Modal */}
      <ZipUnzipModal
        isOpen={!!activeZipFile}
        onClose={() => setActiveZipFile(null)}
        zipFile={activeZipFile}
        onExtracted={(extracted) => {
          triggerToast(`Extracted ${extracted.length} files from ${activeZipFile?.name}`);
        }}
      />

      {/* Rename File / Folder Modal */}
      <RenameModal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        item={renameTarget?.item}
        isFolder={renameTarget?.isFolder}
        onRename={handleExecuteRename}
      />


      {/* File Version History Drawer */}
      <FileVersionDrawer
        isOpen={!!versionFileTarget}
        onClose={() => setVersionFileTarget(null)}
        file={versionFileTarget}
        onToast={triggerToast}
      />

      {/* Storage Analytics Modal */}
      <StorageAnalyticsModal
        isOpen={showStorageAnalytics}
        onClose={() => setShowStorageAnalytics(false)}
        onOpenPricing={() => setShowPricingModal(true)}
      />

      {/* Move to Folder Modal */}
      <MoveToFolderModal
        isOpen={showMoveModal}
        onClose={() => { setShowMoveModal(false); setMoveTargetFiles([]); }}
        files={moveTargetFiles}
        folders={folders}
        onMove={handleMoveFiles}
      />

      {/* Floating Notification Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
