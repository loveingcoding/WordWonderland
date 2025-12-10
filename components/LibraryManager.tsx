
import React, { useState } from 'react';
import { WordLibrary, Word } from '../types';

interface LibraryManagerProps {
  libraries: WordLibrary[];
  onAddLibrary: (lib: WordLibrary) => void;
  onDeleteLibrary: (id: string) => void;
}

const LibraryManager: React.FC<LibraryManagerProps> = ({ libraries, onAddLibrary, onDeleteLibrary }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [rawWords, setRawWords] = useState(''); // Simple text area for CSV style input

  const handleCreate = () => {
    if (!newName.trim() || !rawWords.trim()) return;

    const lines = rawWords.split('\n');
    const words: Word[] = lines.filter(l => l.includes(',')).map((line, idx) => {
      // Split by common comma separators (Chinese or English comma)
      const parts = line.split(/[,，]/).map(s => s.trim());
      if (parts.length < 2) return null;
      
      const text = parts[0];
      const translation = parts[1];
      const difficulty = parts[2] ? parseInt(parts[2]) : 1;

      return {
        id: `${newName}_${idx}`,
        text: text,
        translation: translation,
        difficulty: (difficulty as 1|2|3) || 1
      };
    }).filter(w => w !== null) as Word[];

    if (words.length === 0) {
        alert("请按照格式输入：单词, 翻译, 难度(1-3)");
        return;
    }

    const newLib: WordLibrary = {
      id: `custom_${Date.now()}`,
      name: newName,
      description: 'Custom library created by user',
      isCustom: true,
      words: words
    };

    onAddLibrary(newLib);
    setIsCreating(false);
    setNewName('');
    setRawWords('');
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-3xl font-display font-bold text-gray-800">我的词库</h2>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-brand-green text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 transition"
          >
            {isCreating ? '取消' : '➕ 新建词库'}
          </button>
       </div>

       {isCreating && (
         <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 animate-slide-in">
            <h3 className="font-bold text-lg mb-4">创建新词库</h3>
            <div className="space-y-4">
                <input 
                    type="text" 
                    placeholder="词库名称 (例如：我的易错词)"
                    className="w-full p-3 rounded-lg border border-gray-300"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                />
                <div>
                    <label className="block text-xs text-gray-500 mb-1">格式: 英文, 中文, 难度(1-3) (每行一个)</label>
                    <textarea 
                        placeholder={`cat, 猫, 1\nastronaut, 宇航员, 3`}
                        className="w-full p-3 rounded-lg border border-gray-300 h-32"
                        value={rawWords}
                        onChange={e => setRawWords(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleCreate}
                    className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold"
                >
                    保存词库
                </button>
            </div>
         </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraries.map(lib => (
            <div key={lib.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
               <div>
                 <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-800">{lib.name}</h3>
                    {lib.isCustom && (
                        <button onClick={() => onDeleteLibrary(lib.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                    )}
                 </div>
                 <p className="text-gray-500 text-sm mt-2">{lib.description}</p>
                 <div className="mt-4 flex gap-2">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                        {lib.words.length} 个单词
                    </span>
                 </div>
               </div>
               <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-400 truncate">
                      例词: {lib.words.slice(0,3).map(w => w.text).join(', ')}...
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

export default LibraryManager;
