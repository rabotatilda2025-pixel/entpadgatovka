import React, { useState, useEffect } from 'react';
import Header from './Header';
import ProfilePicker from './ProfilePicker';
import TestSimulator from './TestSimulator';
import MistakesReview from './MistakesReview';
import RetestModal from './RetestModal';
import { INITIAL_MISTAKES_BANK } from '../data/bilingualQuestions';

export default function EntPlatform() {
  // 1. Language state: "kk" | "ru" with localStorage sync
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ent_language') || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('ent_language', language);
  }, [language]);

  // 2. Active View Tab: "test" | "mistakes" | "profile"
  const [activeTab, setActiveTab] = useState('test');

  // 3. Selected Profile Combination ID (default: "math_physics")
  const [selectedProfileId, setSelectedProfileId] = useState(() => {
    return localStorage.getItem('ent_profile') || 'math_physics';
  });

  useEffect(() => {
    localStorage.setItem('ent_profile', selectedProfileId);
  }, [selectedProfileId]);

  // 4. Mistakes Bank (loaded from localStorage or INITIAL_MISTAKES_BANK)
  const [mistakes, setMistakes] = useState(() => {
    const saved = localStorage.getItem('ent_mistakes_bank');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse mistakes from localStorage", e);
      }
    }
    return INITIAL_MISTAKES_BANK;
  });

  useEffect(() => {
    localStorage.setItem('ent_mistakes_bank', JSON.stringify(mistakes));
  }, [mistakes]);

  // 5. Retest Modal State
  const [retestItems, setRetestItems] = useState(null);

  // Handlers
  const handleUpdateMistakeStatus = (mistakeId, newStatus) => {
    setMistakes(prev =>
      prev.map(m => (m.mistakeId === mistakeId ? { ...m, status: newStatus } : m))
    );
  };

  const handleResolveMistake = (mistakeId) => {
    setMistakes(prev =>
      prev.map(m => (m.mistakeId === mistakeId ? { ...m, status: 'resolved' } : m))
    );
  };

  const handleFinishTestWithMistakes = (newMistakes) => {
    if (newMistakes && newMistakes.length > 0) {
      setMistakes(prev => {
        // avoid duplicate mistakes for identical questions if already exists
        const existingIds = new Set(prev.map(m => m.questionId));
        const filteredNew = newMistakes.filter(m => !existingIds.has(m.questionId));
        return [...filteredNew, ...prev];
      });
    }
    // Switch to mistakes tab to view mistakes review immediately
    setActiveTab('mistakes');
  };

  const activeMistakesCount = mistakes.filter(m => m.status === 'needs_review').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Bilingual Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeMistakesCount={activeMistakesCount}
      />

      {/* 2. Main Content View according to activeTab */}
      <main className="flex-1">
        {activeTab === 'profile' && (
          <ProfilePicker
            language={language}
            selectedProfileId={selectedProfileId}
            onSelectProfile={setSelectedProfileId}
            onStartTesting={() => setActiveTab('test')}
          />
        )}

        {activeTab === 'test' && (
          <TestSimulator
            language={language}
            profileCombinationId={selectedProfileId}
            onFinishTestWithMistakes={handleFinishTestWithMistakes}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakesReview
            language={language}
            mistakes={mistakes}
            onUpdateMistakeStatus={handleUpdateMistakeStatus}
            onLaunchRetest={(items) => setRetestItems(items)}
          />
        )}
      </main>

      {/* 3. Retest Modal for Drilling Mistakes */}
      {retestItems && (
        <RetestModal
          language={language}
          mistakeItems={retestItems}
          onClose={() => setRetestItems(null)}
          onResolveMistake={handleResolveMistake}
        />
      )}
    </div>
  );
}
