const fs = require('fs');
const path = require('path');

const cPath = path.resolve('frontend/src/pages/Community.jsx');
let cContent = fs.readFileSync(cPath, 'utf8').replace(/\r\n/g, '\n');
const cLines = cContent.split('\n');

for (let i = 0; i < cLines.length; i++) {
  if (cLines[i].includes('value={pollStatus}')) {
    let startIdx = i;
    while (startIdx > 0 && !cLines[startIdx].includes('<select')) {
      startIdx--;
    }
    let endIdx = i + 1;
    while (endIdx < cLines.length && !cLines[endIdx].includes('<option value="ALL">')) {
      endIdx++;
    }
    const cleanSelect = [
      '              <select',
      '                value={pollStatus}',
      '                onChange={(e) => setPollStatus(e.target.value)}',
      '                style={{ backgroundColor: "#090D16", color: "#F4F7FC", colorScheme: "dark" }}',
      '                className="rounded-lg border border-white/10 bg-[#090D16] px-2.5 py-1 text-xs text-[#F4F7FC]"',
      '                disabled={!user || creatingPoll}',
      '              >'
    ];
    cLines.splice(startIdx, endIdx - startIdx, ...cleanSelect);
    break;
  }
}
fs.writeFileSync(cPath, cLines.join('\n'), 'utf8');
console.log('Cleaned second select in Community.jsx');
