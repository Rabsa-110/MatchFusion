// Mock community feed — stand-in for the Posts/Comments/Reactions/Polls tables
// defined in backend/prisma/schema.prisma once the community API is wired up.

export const posts = [
  {
    id: "p1",
    user: "Rahim",
    initials: "RH",
    color: "#2E9BFF",
    time: "2h ago",
    content: "Who do you think wins tonight? Barcelona vs Real Madrid feels too close to call.",
    matchTag: "Barcelona vs Real Madrid",
    likes: 24,
    comments: 12,
  },
  {
    id: "p2",
    user: "Tabassum",
    initials: "TB",
    color: "#9B7CFF",
    time: "4h ago",
    content: "Bangladesh's run rate tonight has been excellent. That partnership is exactly what we needed.",
    matchTag: "Bangladesh vs India",
    likes: 41,
    comments: 9,
  },
  {
    id: "p3",
    user: "Intasar",
    initials: "IM",
    color: "#1FE99C",
    time: "6h ago",
    content: "Haaland's numbers this season are genuinely ridiculous. 19 goals in 20 apps.",
    matchTag: null,
    likes: 58,
    comments: 15,
  },
  {
    id: "p4",
    user: "Pritoma",
    initials: "PL",
    color: "#FF4D5E",
    time: "9h ago",
    content: "Liverpool's front three looked unstoppable against Chelsea. Great result to build momentum.",
    matchTag: "Liverpool vs Chelsea",
    likes: 33,
    comments: 7,
  },
];

export const polls = [
  {
    id: "poll1",
    question: "Who will win — Barcelona vs Real Madrid?",
    options: [
      { label: "Barcelona", votes: 142 },
      { label: "Draw", votes: 41 },
      { label: "Real Madrid", votes: 98 },
    ],
  },
  {
    id: "poll2",
    question: "Player of the week?",
    options: [
      { label: "Haaland", votes: 76 },
      { label: "Salah", votes: 64 },
      { label: "Yamal", votes: 51 },
      { label: "Shakib", votes: 39 },
    ],
  },
];
