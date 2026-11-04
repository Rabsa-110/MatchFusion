const fs = require('fs');
const path = require('path');

// Fix Matches.jsx line by line
const mPath = path.resolve('frontend/src/pages/Matches.jsx');
let mContent = fs.readFileSync(mPath, 'utf8').replace(/\r\n/g, '\n');
const mLines = mContent.split('\n');

for (let i = 0; i < mLines.length; i++) {
  if (mLines[i].includes('Sort:')) {
    // lines i+1 to i+8 represent the select
    let endIdx = i + 1;
    while (endIdx < mLines.length && !mLines[endIdx].includes('{sortOptions.map')) {
      endIdx++;
    }
    const cleanSelect = [
      '            <select',
      '              value={sortBy}',
      '              onChange={(e) => setSortBy(e.target.value)}',
      '              style={{ backgroundColor: "#090D16", color: "#F4F7FC", colorScheme: "dark" }}',
      '              className="rounded-lg border border-white/10 bg-[#090D16] px-3 py-1.5 text-xs font-medium text-[#F4F7FC] shadow-sm transition focus:border-broadcast focus:outline-none cursor-pointer"',
      '            >'
    ];
    mLines.splice(i + 1, endIdx - (i + 1), ...cleanSelect);
    break;
  }
}
fs.writeFileSync(mPath, mLines.join('\n'), 'utf8');
console.log('Cleaned Matches.jsx');

// Fix Community.jsx line by line
const cPath = path.resolve('frontend/src/pages/Community.jsx');
let cContent = fs.readFileSync(cPath, 'utf8').replace(/\r\n/g, '\n');
const cLines = cContent.split('\n');

for (let i = 0; i < cLines.length; i++) {
  if (cLines[i].includes('Category:</span>')) {
    let endIdx = i + 1;
    while (endIdx < cLines.length && !cLines[endIdx].includes('<option value="ALL">')) {
      endIdx++;
    }
    const cleanSelect = [
      '                  <select',
      '                    value={postCategory}',
      '                    onChange={(e) => setPostCategory(e.target.value)}',
      '                    style={{ backgroundColor: "#090D16", color: "#F4F7FC", colorScheme: "dark" }}',
      '                    className="rounded-lg border border-white/10 bg-[#090D16] px-2.5 py-1 text-xs text-[#F4F7FC]"',
      '                  >'
    ];
    cLines.splice(i + 1, endIdx - (i + 1), ...cleanSelect);
    break;
  }
}
fs.writeFileSync(cPath, cLines.join('\n'), 'utf8');
console.log('Cleaned Community.jsx');
