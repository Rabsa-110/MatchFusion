const fs = require('fs');
const path = require('path');

const cPath = path.resolve('frontend/src/pages/Community.jsx');
let content = fs.readFileSync(cPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add import
if (!content.includes('MatchAutocomplete')) {
  content = content.replace(
    'import PollCard from "../components/community/PollCard.jsx";',
    'import PollCard from "../components/community/PollCard.jsx";\nimport MatchAutocomplete from "../components/community/MatchAutocomplete.jsx";'
  );
}

// 2. Add state
if (!content.includes('selectedPollMatch')) {
  content = content.replace(
    'const [pollMatchTag, setPollMatchTag] = useState("");',
    'const [pollMatchTag, setPollMatchTag] = useState("");\n  const [selectedPollMatch, setSelectedPollMatch] = useState(null);'
  );
}

// 3. Clear selectedPollMatch on submit
content = content.replace(
  'setPollMatchTag("");',
  'setPollMatchTag("");\n        setSelectedPollMatch(null);'
);

// 4. Replace the plain input with MatchAutocomplete
const plainInputCode = `<input
                type="text"
                value={pollMatchTag}
                onChange={(e) => setPollMatchTag(e.target.value)}
                placeholder="Linked Match (optional)"
                className="input !py-1.5 !px-3 text-xs w-full sm:w-64"
                disabled={!user || creatingPoll}
              />`;

const autocompleteCode = `<div className="w-full sm:w-80">
                <MatchAutocomplete
                  selectedMatch={selectedPollMatch}
                  onSelectMatch={(m) => {
                    setSelectedPollMatch(m);
                    if (m) {
                      setPollMatchTag(m.id);
                      setPollStatus(
                        m.status === "LIVE"
                          ? "LIVE"
                          : m.status === "UPCOMING"
                          ? "UPCOMING"
                          : "COMPLETED"
                      );
                    } else {
                      setPollMatchTag("");
                      setPollStatus("ALL");
                    }
                  }}
                  disabled={!user || creatingPoll}
                />
              </div>`;

content = content.replace(plainInputCode, autocompleteCode);

fs.writeFileSync(cPath, content, 'utf8');
console.log('Successfully updated Community.jsx with MatchAutocomplete!');

