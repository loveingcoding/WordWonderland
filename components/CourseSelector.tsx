
import React from 'react';
import { Course, CourseCategory } from '../types';

interface CourseSelectorProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (id: string) => void;
  categories: CourseCategory[];
  selectedCategoryIndex: number;
  onSelectCategory: (index: number) => void;
  loading?: boolean;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  categories,
  selectedCategoryIndex,
  onSelectCategory,
  loading = false
}) => {
  return (
    <div className="w-full bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 mb-6 animate-fade-in z-20">
      
      {/* Top Row: Textbook Select */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📖</span>
          <h3 className="font-bold text-gray-700">当前课程:</h3>
        </div>
        <div className="flex-1 w-full md:w-auto">
          <select 
            value={selectedCourseId}
            onChange={(e) => onSelectCourse(e.target.value)}
            disabled={loading}
            className="w-full p-2.5 rounded-lg border-2 border-brand-blue/30 bg-white font-bold text-gray-800 focus:border-brand-blue outline-none transition hover:border-brand-blue/60 cursor-pointer"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom Row: Category Tabs */}
      <div className="relative">
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
                onClick={() => onSelectCategory(-1)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all border-2
                    ${selectedCategoryIndex === -1 
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md transform scale-105' 
                      : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'}`}
            >
                全部单词
            </button>
            {categories.map((cat, idx) => (
               <button
                  key={idx}
                  onClick={() => onSelectCategory(idx)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all border-2
                      ${selectedCategoryIndex === idx 
                        ? 'bg-brand-orange text-white border-brand-orange shadow-md transform scale-105' 
                        : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'}`}
               >
                  {cat.name}
               </button>
            ))}
         </div>
         {/* Fade indicator for scrolling */}
         <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
      </div>
    </div>
  );
};

export default CourseSelector;
