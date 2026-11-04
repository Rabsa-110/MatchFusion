const fs = require('fs');
const path = require('path');

// 1. Update index.html
const htmlPath = path.resolve('frontend/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
if (!html.includes('name="color-scheme"')) {
  html = html.replace('<head>', '<head>\n    <meta name="color-scheme" content="dark" />');
}
if (!html.includes('class="dark"')) {
  html = html.replace('<html lang="en">', '<html lang="en" class="dark" style="color-scheme: dark;">');
}
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('1. index.html updated');

// 2. Update index.css
const cssPath = path.resolve('frontend/src/index.css');
let css = fs.readFileSync(cssPath, 'utf8');
const darkRules = `
:root {
  color-scheme: dark;
}
html, body, select, option, input, textarea {
  color-scheme: dark;
}
select {
  background-color: #0c1120 !important;
  color: #f4f7fc !important;
}
select option {
  background-color: #0c1120 !important;
  color: #f4f7fc !important;
}
`;

if (!css.includes(':root {')) {
  css = css.replace('select {', darkRules + '\nselect {');
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('2. index.css updated');
}

// 3. Update Matches.jsx select to have explicit inline style and classes
const matchesPath = path.resolve('frontend/src/pages/Matches.jsx');
let matchesCode = fs.readFileSync(matchesPath, 'utf8');

matchesCode = matchesCode.replace(
  /<select\s+value=\{sortBy\}[\s\S]*?>/,
  `<select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ backgroundColor: '#090D16', color: '#F4F7FC', colorScheme: 'dark' }}
              className="rounded-lg border border-white/10 bg-[#090D16] px-3 py-1.5 text-xs font-medium text-[#F4F7FC] shadow-sm transition focus:border-broadcast focus:outline-none cursor-pointer"
            >`
);

matchesCode = matchesCode.replace(
  /<option key=\{opt\.id\} value=\{opt\.id\} className="[^"]*">/g,
  `<option key={opt.id} value={opt.id} style={{ backgroundColor: '#090D16', color: '#F4F7FC' }} className="bg-[#090D16] text-[#F4F7FC] py-1">`
);

fs.writeFileSync(matchesPath, matchesCode, 'utf8');
console.log('3. Matches.jsx select updated');

// 4. Update Community.jsx selects to have explicit inline style
const commPath = path.resolve('frontend/src/pages/Community.jsx');
let commCode = fs.readFileSync(commPath, 'utf8');

commCode = commCode.replace(
  /<select\s+value=\{postCategory\}[\s\S]*?>/,
  `<select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    style={{ backgroundColor: '#090D16', color: '#F4F7FC', colorScheme: 'dark' }}
                    className="rounded-lg border border-white/10 bg-[#090D16] px-2.5 py-1 text-xs text-[#F4F7FC]"
                  >`
);

commCode = commCode.replace(
  /<select\s+value=\{pollStatus\}[\s\S]*?>/,
  `<select
                value={pollStatus}
                onChange={(e) => setPollStatus(e.target.value)}
                style={{ backgroundColor: '#090D16', color: '#F4F7FC', colorScheme: 'dark' }}
                className="rounded-lg border border-white/10 bg-[#090D16] px-2.5 py-1 text-xs text-[#F4F7FC]"
                disabled={!user || creatingPoll}
              >`
);

fs.writeFileSync(commPath, commCode, 'utf8');
console.log('4. Community.jsx selects updated');
