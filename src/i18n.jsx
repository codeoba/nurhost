import React, { useState, useEffect, createContext, useContext } from 'react';

const translations = {
  sw: {
    // Header & Navigation
    searchPlaceholder: 'Tafuta mafaili, maelekezo, vitabu au kodi... (Bonyeza /)',
    myDrive: 'My Drive',
    shared: 'Shared',
    starred: 'Starred',
    trash: 'Trash',
    remoteUpload: 'Remote Upload',
    storageUsed: 'Imetumika',
    freeStorage: 'Bure',
    getMoreStorage: 'Ongeza Storage',
    analytics: 'Analytics',
    
    // Actions & Buttons
    newUpload: 'Pakia Faili Mapya',
    newFolder: 'Folder Jipya',
    newTextFile: 'Faili la Text/Code',
    downloadZip: 'Download kama Zip',
    deleteSelected: 'Futa Yaliyochaguliwa',
    moveSelected: 'Hamisha Yaliyochaguliwa',
    emptyTrash: 'Empty Trash',
    selectAll: 'Chagua Zote',
    deselectAll: 'Ondoa Uchaguzi',
    
    // Categories
    allFiles: 'Mafaili Yote',
    images: 'Picha',
    videos: 'Video',
    audio: 'Sauti / Audio',
    documents: 'Nyaraka / Vitabu',
    archives: 'Archives / Zip',
    codeText: 'Kodi / Text',
    
    // Modals
    uploadTitle: 'Upload & Remote Fetch Engine',
    uploadDesc: 'Weka mafaili kutoka kifaa chako, URL au Magnet link',
    localFiles: 'Local Files',
    remoteUrl: 'Remote URL',
    torrentMagnet: 'Torrent / Magnet',
    startUpload: 'Anza Kupakia',
    cancel: 'Ghairi',
    saveFile: 'Hifadhi Faili',
    saving: 'Inahifadhi...',
    
    // Notifications & Status
    fileDeleted: 'Faili limefutwa server disk kikamilifu',
    fileRestored: 'Faili limerudishwa My Drive',
    fileSaved: 'Faili limehifadhiwa kikamilifu',
    copied: 'Imenakiliwa!',
    
    // Features
    passwordProtected: 'Ilindwe na Password',
    selfDestruct: 'Self-Destruct',
    audioPlayer: 'NurHost Player Engine',
    photoEditor: 'Photo Editor & Converter',
    cleanDuplicates: 'Futa Yaliyojirudia',
    
    // Language
    langSwahili: 'Kiswahili 🇹🇿',
    langEnglish: 'English 🇬🇧'
  },
  en: {
    // Header & Navigation
    searchPlaceholder: 'Search files, documents, books or code... (Press /)',
    myDrive: 'My Drive',
    shared: 'Shared',
    starred: 'Starred',
    trash: 'Trash',
    remoteUpload: 'Remote Upload',
    storageUsed: 'Used',
    freeStorage: 'Free',
    getMoreStorage: 'Get Storage',
    analytics: 'Analytics',
    
    // Actions & Buttons
    newUpload: 'Upload New File',
    newFolder: 'New Folder',
    newTextFile: 'Text/Code File',
    downloadZip: 'Download as Zip',
    deleteSelected: 'Delete Selected',
    moveSelected: 'Move Selected',
    emptyTrash: 'Empty Trash',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    
    // Categories
    allFiles: 'All Files',
    images: 'Images',
    videos: 'Videos',
    audio: 'Audio',
    documents: 'Documents',
    archives: 'Archives / Zip',
    codeText: 'Code / Text',
    
    // Modals
    uploadTitle: 'Upload & Remote Fetch Engine',
    uploadDesc: 'Upload files from device, URL, or Magnet link',
    localFiles: 'Local Files',
    remoteUrl: 'Remote URL',
    torrentMagnet: 'Torrent / Magnet',
    startUpload: 'Start Upload',
    cancel: 'Cancel',
    saveFile: 'Save File',
    saving: 'Saving...',
    
    // Notifications & Status
    fileDeleted: 'File permanently deleted from server disk',
    fileRestored: 'File restored to My Drive',
    fileSaved: 'File saved successfully',
    copied: 'Copied!',
    
    // Features
    passwordProtected: 'Password Protected',
    selfDestruct: 'Self-Destruct',
    audioPlayer: 'NurHost Player Engine',
    photoEditor: 'Photo Editor & Converter',
    cleanDuplicates: 'Clean Duplicates',
    
    // Language
    langSwahili: 'Kiswahili 🇹🇿',
    langEnglish: 'English 🇬🇧'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('nurhost_lang') || 'sw';
    } catch (e) {
      return 'sw';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nurhost_lang', lang);
    } catch (e) {}
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'sw' ? 'en' : 'sw'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['sw']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'sw',
      toggleLanguage: () => {},
      t: (key) => key
    };
  }
  return context;
}
