
import React, { useState, useEffect } from 'react';
import { WordLibrary, Word } from '../types';
import { CourseService } from '../services/CourseService'; // Use service to fetch official data
import { Course } from '../types';

interface LibraryManagerProps {
  libraries: WordLibrary[];
  onAddLibrary: (lib: WordLibrary) => void;
  onDeleteLibrary: (id: string) => void;
  onStartLibrary: (id: string) => void; 
}

const LibraryManager: React.FC<LibraryManagerProps> = ({ libraries, onAddLibrary, onDeleteLibrary, onStartLibrary }) => {
  const [activeTab, setActiveTab] = useState<'custom' | 'official'>('custom');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [rawWords, setRawWords] = useState(''); 
  const [officialCourses, setOfficialCourses] = useState<Course[]>([]);

  useEffect(() => {
     // Fetch official courses when component mounts or tab changes
     const loadCourses = async () => {
         const courses = await CourseService.getAvailableCourses();
         setOfficialCourses(courses);
     };
     loadCourses();
  }, []);

  const handleCreate = () => {
    if (!newName.trim() || !rawWords.trim()) return;

    const lines = rawWords.split('\n');
    const words: Word[] = lines.filter(l => l.includes(',')).map((line, idx) => {
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
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-3xl font-display font-bold text-gray-800">📚 档案库</h2>
          {activeTab === 'custom' && (
              <button 
                onClick={() => setIsCreating(!isCreating)}
                className="bg-brand-green text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-200"
              >
                {isCreating ? '取消' : '➕ 新建词库'}
              </button>
          )}
       </div>

       {/* Tab Navigation */}
       <div className="flex gap-4 border-b-2 border-gray-100">
          <button 
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-lg font-bold px-4 transition-all border-b-4 rounded-t-lg -mb-[2px] ${activeTab === 'custom' ? 'border-brand-blue text-brand-blue bg-blue-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            我的词库
          </button>
          <button 
            onClick={() => setActiveTab('official')}
            className={`pb-3 text-lg font-bold px-4 transition-all border-b-4 rounded-t-lg -mb-[2px] ${activeTab === 'official' ? 'border-brand-orange text-brand-orange bg-orange-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            🏛️ 官方教材
          </button>
       </div>

       {/* Create Form */}
       {isCreating && activeTab === 'custom' && (
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

       {/* Official Curriculum Grid */}
       {activeTab === 'official' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
             {officialCourses.map(course => (
                <div key={course.id} className="relative group perspective-1000 cursor-pointer" onClick={() => onStartLibrary(course.id)}>
                    <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-r-xl rounded-l-md shadow-xl aspect-[3/4] p-6 text-white flex flex-col justify-between transform transition-transform group-hover:rotate-y-6 group-hover:scale-105 duration-500 border-l-8 border-l-red-800 relative overflow-hidden">
                        {/* Book Spine Effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/20 to-transparent"></div>
                        
                        <div className="relative z-10">
                            <div className="bg-white/20 inline-block px-3 py-1 rounded text-xs font-bold mb-4 backdrop-blur-sm">PEP Primary English</div>
                            <h3 className="text-2xl font-display font-bold leading-tight drop-shadow-md">{course.name}</h3>
                            <p className="opacity-90 mt-2 font-serif italic text-sm">{course.description}</p>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex gap-2 mb-6 flex-wrap">
                                <span className="bg-black/20 px-2 py-1 rounded text-xs">{course.categories.length} 个单元</span>
                                <span className="bg-black/20 px-2 py-1 rounded text-xs">一年级</span>
                            </div>
                            <button 
                                className="w-full bg-white text-red-600 font-bold py-3 rounded-lg shadow-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
                            >
                                <span>▶️</span> 开始练习
                            </button>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 rotate-12">📚</div>
                    </div>
                </div>
             ))}
          </div>
       )}

       {/* Custom/Default Libraries Grid */}
       {activeTab === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
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
                <div className="mt-6 pt-4 border-t border-gray-100 flex gap-4">
                    <button 
                        onClick={() => onStartLibrary(lib.id)}
                        className="flex-1 bg-brand-blue text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                    >
                        练习
                    </button>
                </div>
                </div>
            ))}
        </div>
       )}
    </div>
  );
};

export default LibraryManager;
