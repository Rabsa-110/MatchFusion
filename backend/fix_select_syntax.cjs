const fs = require('fs');
const path = require('path');

// 1. Fix Matches.jsx
const matchesPath = path.resolve('frontend/src/pages/Matches.jsx');
let mCode = fs.readFileSync(matchesPath, 'utf8');

const badMatchesRegex = /<select[\s\S]*?> setSortBy\(e\.target\.value\)\}[\s\S]*?>/;
mCode = mCode.replace(
  badMatchesRegex,
  `<select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ backgroundColor: '#090D16', color: '#F4F7FC', colorScheme: 'dark' }}
              className="rounded-lg border border-white/10 bg-[#090D16] px-3 py-1.5 text-xs font-medium text-[#F4F7FC] shadow-sm transition focus:border-broadcast focus:outline-none cursor-pointer"
            >`
);
fs.writeFileSync(matchesPath, mCode, 'utf8');
console.log('Fixed Matches.jsx select');

// 2. Fix Community.jsx
const commPath = path.resolve('frontend/src/pages/Community.jsx');
let cCode = fs.readFileSync(commPath, 'utf8');

const badCommRegex = /<select[\s\S]*?> setPostCategory\(e\.target\.value\)\}[\s\S]*?>/;
cCode = cCode.replace(
  badCommRegex,
  `<select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    style={{ backgroundColor: '#090D16', color: '#F4F7FC', colorScheme: 'dark' }}
                    className="rounded-lg border border-white/10 bg-[#090D16] px-2.5 py-1 text-xs text-[#F4F7FC]"
                  >`
);
fs.writeFileSync(commPath, cCode, 'utf8');
console.log('Fixed Community.jsx select');
