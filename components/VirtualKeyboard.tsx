
import React from 'react';

interface VirtualKeyboardProps {
  activeChar: string;
}

const ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Space']
];

// Map keys to finger colors for educational purpose
// p=pinky, r=ring, m=middle, i=index, t=thumb
const KEY_FINGER_MAP: {[key: string]: string} = {
  '1': 'p-l', 'q': 'p-l', 'a': 'p-l', 'z': 'p-l', '`': 'p-l',
  '2': 'r-l', 'w': 'r-l', 's': 'r-l', 'x': 'r-l',
  '3': 'm-l', 'e': 'm-l', 'd': 'm-l', 'c': 'm-l',
  '4': 'i-l', 'r': 'i-l', 'f': 'i-l', 'v': 'i-l',
  '5': 'i-l', 't': 'i-l', 'g': 'i-l', 'b': 'i-l',
  '6': 'i-r', 'y': 'i-r', 'h': 'i-r', 'n': 'i-r',
  '7': 'i-r', 'u': 'i-r', 'j': 'i-r', 'm': 'i-r',
  '8': 'm-r', 'i': 'm-r', 'k': 'm-r', ',': 'm-r',
  '9': 'r-r', 'o': 'r-r', 'l': 'r-r', '.': 'r-r',
  '0': 'p-r', 'p': 'p-r', ';': 'p-r', '/': 'p-r', '-': 'p-r', '=': 'p-r', '[': 'p-r', ']': 'p-r', "'": 'p-r',
  'Space': 't'
};

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeChar }) => {
  const getHighlightColor = (key: string) => {
    const k = key.toLowerCase();
    const active = activeChar.toLowerCase();
    
    // Check if this key matches active char
    if (k === active || (key === 'Space' && active === ' ')) {
       const finger = KEY_FINGER_MAP[k] || KEY_FINGER_MAP[key];
       switch(finger) {
         case 'p-l': return 'bg-red-400 border-red-600 shadow-red-200'; // Left Pinky
         case 'r-l': return 'bg-orange-400 border-orange-600 shadow-orange-200'; // Left Ring
         case 'm-l': return 'bg-yellow-400 border-yellow-600 shadow-yellow-200'; // Left Middle
         case 'i-l': return 'bg-green-400 border-green-600 shadow-green-200'; // Left Index
         case 'i-r': return 'bg-green-500 border-green-700 shadow-green-300'; // Right Index
         case 'm-r': return 'bg-blue-400 border-blue-600 shadow-blue-200'; // Right Middle
         case 'r-r': return 'bg-indigo-400 border-indigo-600 shadow-indigo-200'; // Right Ring
         case 'p-r': return 'bg-purple-400 border-purple-600 shadow-purple-200'; // Right Pinky
         case 't': return 'bg-gray-400 border-gray-600'; // Thumb
         default: return 'bg-brand-blue border-blue-600';
       }
    }
    return 'bg-white border-gray-200 text-gray-500';
  };

  return (
    <div className="bg-gray-100 p-4 rounded-3xl border-4 border-gray-300 shadow-inner select-none max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        {ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1.5">
            {row.map((key) => {
              let wClass = 'w-12';
              if (key === 'Backspace' || key === 'Tab' || key === '\\') wClass = 'w-20';
              if (key === 'Caps' || key === 'Enter') wClass = 'w-24';
              if (key === 'Shift') wClass = 'w-28';
              if (key === 'Space') wClass = 'w-96';

              const isActive = getHighlightColor(key);
              
              return (
                <div
                  key={key}
                  className={`
                    ${wClass} h-12 flex items-center justify-center rounded-lg border-b-4 
                    font-bold text-sm transition-all duration-100
                    ${isActive.includes('bg-white') ? 'shadow-sm' : 'transform translate-y-1 border-b-0 brightness-110'}
                    ${isActive}
                  `}
                >
                  {key === 'Space' ? '________' : key}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400 font-bold uppercase">
         <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-full"></span> 小拇指</div>
         <div className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-400 rounded-full"></span> 无名指</div>
         <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-full"></span> 中指</div>
         <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded-full"></span> 食指</div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
