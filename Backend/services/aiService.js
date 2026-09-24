import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const hasOpenAI = Boolean(OPENAI_API_KEY);

/* ------------------------------------------------------------------ */
/* OpenAI HTTP helper (uses native fetch, no SDK dependency)           */
/* ------------------------------------------------------------------ */

async function callOpenAI(systemPrompt, userPrompt, jsonResult = true) {
  if (!hasOpenAI) return null;
  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1600,
  };
  if (jsonResult) body.response_format = { type: "json_object" };

  const res = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ OpenAI API error:", res.status, text.slice(0, 500));
    return null;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  if (jsonResult) {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return content;
}

/* ------------------------------------------------------------------ */
/* Question Bank — offline fallback used when no OpenAI key is set.    */
/* shape: topic -> [easyQ, mediumQ, hardQ]                             */
/* ------------------------------------------------------------------ */

const BANK = {
  html: [
    { q: "What does HTML stand for?", o: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"], a: 0, e: "HTML = HyperText Markup Language — it structures web content with tags." },
    { q: "Which element creates a clickable link?", o: ["<link>", "<a>", "<href>", "<nav>"], a: 1, e: "The <a> (anchor) element creates hyperlinks; <link> only links external resources." },
    { q: "Which HTML tag provides page-wide semantic semantics for the top section?", o: ["<head>", "<header>", "<top>", "<heading>"], a: 1, e: "<header> is a semantic element for introductory content; <head> holds metadata only." },
  ],
  css: [
    { q: "Which property changes the text color?", o: ["font-color", "text-color", "color", "text-style"], a: 2, e: "The CSS color property sets the foreground/text color." },
    { q: "Which selector has the highest specificity?", o: ["#id", ".class", "element", "*"], a: 0, e: "ID selectors (#id) beat class and element selectors in the specificity hierarchy." },
    { q: "Which combo nth-child() selector targets only the second list item?", o: ["li:nth-child(2)", "li(2)", "li:second", "li:nth(2)"], a: 0, e: ":nth-child(2) matches the second child; the other options are not valid selectors." },
  ],
  javascript: [
    { q: "What does `typeof null` return?", o: ["\"null\"", "\"object\"", "\"undefined\"", "\"number\""], a: 1, e: "typeof null returns \"object\" — a long-standing quirk of JavaScript." },
    { q: "Which array method creates a NEW array with elements that pass a test?", o: ["push()", "map()", "filter()", "reduce()"], a: 2, e: "filter() returns a new array of elements passing the callback's truthy test." },
    { q: "What is the output of: console.log([1,2,3].map(String).join('')) ?", o: ["123", "[1,2,3]", "\"1,2,3\"", "NaN"], a: 0, e: "map(String) converts each number to a string, join('') concatenates them into \"123\"." },
  ],
  react: [
    { q: "Which hook manages local state inside a function component?", o: ["useEffect", "useState", "useRef", "useContext"], a: 1, e: "useState returns a state value and its setter, enabling re-renders when it changes." },
    { q: "What is the purpose of the \"key\" prop on list items?", o: ["Styling", "Identity/performance", "Data binding", "Event handling"], a: 1, e: "Keys give React a stable identity for each list item, enabling efficient reconciliation." },
    { q: "How do you prevent a child component from re-rendering when its props did not change?", o: ["React.memo", "useState", "componentDidMount", "render-prop"], a: 0, e: "React.memo wraps the component and performs a shallow prop comparison to skip re-renders." },
  ],
  tailwindcss: [
    { q: "Which class makes text blue in Tailwind?", o: ["bg-blue-500", "text-blue-500", "color-blue", "text-color-blue"], a: 1, e: "text-blue-500 applies the blue palette to text color." },
    { q: "Which prefix makes a utility apply only on medium screens and up?", o: ["sm:", "xs:", "md:", "lg:"], a: 2, e: "md: applies the variant at the medium breakpoint (≥768px) and above." },
    { q: "Which utilities produce the popular \"card\" look of rounded corners plus shadow?", o: ["rounded-xl shadow-lg", "radius-lg shadow-xl", "rounded-lg shadow-l", "corner-xl"], a: 0, e: "rounded-* controls border radius and shadow-* controls box shadows." },
  ],
  "node.js": [
    { q: "Which built-in module is used to read and write files?", o: ["http", "fs", "path", "events"], a: 1, e: "The fs (file system) module provides read/write APIs." },
    { q: "Which statement loads a CommonJS module?", o: ["import from", "require()", "use()", "load()"], a: 1, e: "CommonJS uses require(); import is the ESM syntax available via .mjs / type: module." },
    { q: "Why does Node.js handle I/O non-blocking?", o: ["It uses threads", "Event loop + callbacks", "Worker pool for everything", "It is synchronous"], a: 1, e: "Node uses an event loop; blocking I/O is delegated so the loop keeps running." },
  ],
  "express.js": [
    { q: "Which method defines a GET route handler?", o: ["app.get()", "app.post()", "app.use()", "app.routes()"], a: 0, e: "app.get(path, handler) registers a GET route." },
    { q: "Which built-in middleware parses incoming JSON request bodies?", o: ["express.urlencoded()", "express.json()", "body.text()", "express.static()"], a: 1, e: "express.json() parses JSON payloads into req.body." },
    { q: "Which piece of code correctly calls the next middleware?", o: ["next()", "continue()", "proceed()", "next.request()"], a: 0, e: "next() signals Express to move to the next middleware in the stack." },
  ],
  mongodb: [
    { q: "What type of database is MongoDB?", o: ["Relational", "Document/NoSQL", "Graph", "Key-value only"], a: 1, e: "MongoDB stores JSON-like documents in collections — a NoSQL model." },
    { q: "Which aggregation stage groups documents by a field?", o: ["$match", "$group", "$sort", "$project"], a: 1, e: "$group rolls up documents using an _id expression, enabling averages/sums." },
    { q: "Which operator updates a field by adding a value?", o: ["$push", "$inc", "$set", "$mul"], a: 1, e: "$inc increments a numeric field by the given amount (e.g., count: +1)." },
  ],
  python: [
    { q: "Which keyword defines a function in Python?", o: ["function", "func", "def", "lambda"], a: 2, e: "def defines a named function; lambda defines inline anonymous functions." },
    { q: "Which data structure is immutable?", o: ["list", "dict", "set", "tuple"], a: 3, e: "Tuples cannot be modified after creation — they are immutable." },
    { q: "What does list comprehensions [x*2 for x in range(3)] produce?", o: ["[0, 2, 4]", "[1, 2, 3]", "[2, 4, 6]", "Can't run"], a: 0, e: "range(3) gives 0,1,2; each is doubled → [0, 2, 4]." },
  ],
  java: [
    { q: "Which keyword makes a variable a compile-time constant?", o: ["static", "final", "const", "fixed"], a: 1, e: "final prevents reassignment; static belongs to the class." },
    { q: "Which OOP principle is expressed by an \"is-a\" relationship?", o: ["Encapsulation", "Polymorphism", "Inheritance", "Abstraction"], a: 2, e: "Inheritance models an \"is-a\" relationship (e.g., Dog is an Animal)." },
    { q: "What is the value of the expression int x; x = 10 / 4; ?", o: ["2", "2.5", "3", "0"], a: 0, e: "Integer division truncates in Java, so 10 / 4 = 2." },
  ],
  c: [
    { q: "Which header declares printf()?", o: ["stdlib.h", "stdio.h", "string.h", "math.h"], a: 1, e: "printf lives in stdio.h (standard input/output)." },
    { q: "What does the unary & operator do?", o: ["Dereferences", "Gets the address", "Multiplies", "Negates"], a: 1, e: "& returns the memory address of a variable." },
    { q: "int a[] = {10, 20}; int *p = a; what is *p++?", o: ["20", "10", "11", "&a[1]"], a: 1, e: "p++ yields the old pointer (dereferenced → 10), then increments the pointer." },
  ],
  "c++": [
    { q: "Which keyword allocates an object on the heap?", o: ["malloc", "alloc", "new", "create"], a: 2, e: "new allocates and constructs; delete frees it." },
    { q: "Which smart pointer transfers ownership to avoid double-delete?", o: ["std::shared_ptr", "std::unique_ptr", "std::weak_ptr", "std::raw_ptr"], a: 1, e: "unique_ptr owns exclusively and can be moved, not copied." },
    { q: "What is the output of std::vector<int> v{1,2,3}; v.push_back(4); v.size() ?", o: ["3", "4", "5", "0"], a: 1, e: "push_back adds one element, so size becomes 4." },
  ],
  bootstrap: [
    { q: "Which class creates a responsive grid column?", o: ["col", "col-6", "grid-6", "m-6"], a: 1, e: "col-* (e.g. col-6) spans a fraction of the 12-column grid." },
    { q: "Which class enables Flexbox layout on an element?", o: ["d-flex", "flex-row", "align", "block"], a: 0, e: "d-flex sets display:flex; flex-row then controls direction." },
    { q: "Which breakpoint prefix applies styles only on large screens (≥992px)?", o: ["sm-", "md-", "lg-", "xl-"], a: 2, e: "lg- targets the large breakpoint (≥992px) in Bootstrap." },
  ],
  typescript: [
    { q: "How do you declare a type-safe object shape?", o: ["interface", "shape", "class", "module"], a: 0, e: "interface describes the shape of an object for compile-time checks." },
    { q: "Which type allows a value that can be string OR number?", o: ["any", "unknown | any", "string | number", "mixed"], a: 2, e: "Union types: string | number accepts either at compile time." },
    { q: "Which utility type makes every property of T optional?", o: ["Required<T>", "Readonly<T>", "Partial<T>", "Pick<T>"], a: 2, e: "Partial<T> maps each property to be optional." },
  ],
  mysql: [
    { q: "Which clause filters rows after grouping?", o: ["WHERE", "HAVING", "LIMIT", "ORDER"], a: 1, e: "WHERE filters raw rows; HAVING filters grouped results." },
    { q: "Which JOIN returns every row from the left table even without a match?", o: ["INNER JOIN", "LEFT JOIN", "RIGHT OUTER FULL", "CROSS JOIN"], a: 1, e: "LEFT JOIN keeps all left rows, filling NULLs when there is no match." },
    { q: "Which index ensures every row value in a column is unique?", o: ["FULLTEXT", "PRIMARY/UNIQUE", "SPATIAL", "HASH temporary"], a: 1, e: "PRIMARY and UNIQUE indexes enforce uniqueness." },
  ],
  git: [
    { q: "Which command stages changed files for a commit?", o: ["git commit", "git add", "git push", "git stage"], a: 1, e: "git add moves changes into the staging area." },
    { q: "Which command integrates a feature branch into the current branch?", o: ["git merge", "git clone", "git branch", "git status"], a: 0, e: "git merge brings commits from another branch into the current one." },
    { q: "Which command rewrites commit history by rebasing an interactive list?", o: ["git reset --hard", "git rebase -i", "git cherry-pick", "git revert"], a: 1, e: "git rebase -i lets you squash/reorder/rewrite commits." },
  ],
  github: [
    { q: "What is a Pull Request?", o: ["A deploy trigger", "A request to merge changes into another branch", "A fork", "An issue template"], a: 1, e: "A PR proposes merging a branch's changes, often after review." },
    { q: "Where do GitHub Actions workflow files live?", o: [".github/workflows", "src/actions", "config/", "build/"], a: 0, e: "Workflows are YAML files under .github/workflows." },
    { q: "Which GitHub feature keeps a fork in sync with the upstream repo?", o: ["Rebase but", "Sync fork", "Merge fork", "Git blame"], a: 1, e: "\"Sync fork\" fetches upstream commits into the fork." },
  ],
  "next.js": [
    { q: "Which directory-based convention creates new routes?", o: ["components/", "pages/ (or app/)", "hooks/", "public/"], a: 1, e: "Files in pages/ or app/ map 1:1 to routes." },
    { q: "Which function adds server-side rendering (pre-Next 13)?", o: ["getServerSideProps", "useSWR", "staticProps", "fetchOnMount"], a: 0, e: "getServerSideProps runs on the server per request." },
    { q: "Which feature enables static prerendering at build time?", o: ["getStaticProps", "getServerSideProps", "middleware", "serverActions"], a: 0, e: "getStaticProps generates static pages at build time." },
  ],
  redux: [
    { q: "Which method sends an action to the Redux store?", o: ["store.send()", "store.dispatch()", "store.emit()", "store.push()"], a: 1, e: "dispatch(action) triggers reducers to update state." },
    { q: "Which middleware is commonly used for async actions?", o: ["redux-thunk", "redux-sync", "axios", "useReducer"], a: 0, e: "redux-thunk lets action creators return functions for async logic." },
    { q: "Which Redux Toolkit function creates a slice with reducers?", o: ["configureSlice", "createSlice", "createStore", "makeReducer"], a: 1, e: "createSlice auto-generates actions and reducers together." },
  ],
  docker: [
    { q: "Which file defines how to build an image?", o: ["Dockerfile", "docker.yml", "Docker.config", "compose.txt"], a: 0, e: "A Dockerfile contains INSTRUCTIONS to build an image." },
    { q: "Which command runs a container from an image?", o: ["docker build", "docker run", "docker exec", "docker pull"], a: 1, e: "docker run creates and starts a container from an image." },
    { q: "Which command stops all running containers?", o: ["docker stop $(docker ps -q)", "docker rm -a", "docker kill 0", "docker down"], a: 0, e: "docker ps -q lists running IDs; passing them to docker stop halts them." },
  ],
  firebase: [
    { q: "Which Firebase service is a NoSQL document database?", o: ["Firestore", "Realtime memory", "Cloud SQL", "Functions"], a: 0, e: "Cloud Firestore is Firebase's scalable NoSQL document DB." },
    { q: "Which product provides ready-made authentication with Google/GitHub?", o: ["Firebase Auth", "Cloud Auth0", "IAM Roles", "Storage"], a: 0, e: "Firebase Auth supports email and social sign-in providers." },
    { q: "Which feature updates a Firestore document at a path?", o: ["db.collection().doc().update()", "db.set(path)", "db.patch(path)", "db.write('path')"], a: 0, e: "Firestore chains collection().doc().update() to modify fields." },
  ],
  aws: [
    { q: "Which AWS service provides virtual machines (compute)?", o: ["S3", "EC2", "Lambda", "RDS"], a: 1, e: "EC2 offers resizable virtual servers." },
    { q: "Which AWS service stores unlimited objects in the cloud?", o: ["EFS", "S3", "EBS", "Redshift"], a: 1, e: "S3 is object storage — static assets, backups, media." },
    { q: "Which AWS service runs code without provisioning servers?", o: ["EC2", "Lambda", "SQS", "CloudFront"], a: 1, e: "AWS Lambda executes functions on demand (serverless)." },
  ],
  php: [
    { q: "Which symbol prefixes every PHP variable?", o: ["&", "$", "#", "@"], a: 1, e: "PHP variables always start with $." },
    { q: "Which function connects to a MySQL database?", o: ["mysqli_connect", "db_open", "mysql()", "db_link()"], a: 0, e: "mysqli_connect(host, user, password, db) opens a connection." },
    { q: "What does $arr = [1,2,3]; echo $arr[count($arr)-1]; output?", o: ["1", "2", "3", "Unbound"], a: 2, e: "count=3, index 2 → 3." },
  ],
  jquery: [
    { q: "Which function runs code once the DOM is ready?", o: ["$(document).ready()", "window.init()", "onLoad()", "render()"], a: 0, e: ".ready() waits for the DOM before executing handlers." },
    { q: "Which method hides a selected element?", o: ["display()", ".hide()", ".removeOn()", ".toggleHide"], a: 1, e: ".hide() sets display:none (paired with .show())." },
    { q: "Which selector selects all <p> elements inside <div>?", o: ["div p", "div > p *", "div.p", "p div"], a: 0, e: "\"div p\" matches descendant p elements." },
  ],
  kubernetes: [
    { q: "What is the smallest deployable unit in Kubernetes?", o: ["Container", "Pod", "Node", "Service"], a: 1, e: "A Pod wraps one or more containers — Kubernetes' smallest unit." },
    { q: "Which controller manages scaled, self-healing app replicas?", o: ["Pod", "Deployment", "Job", "ConfigMap"], a: 1, e: "Deployments handle rolling updates and replica management." },
    { q: "How many replicas does a Deployment with spec.replicas: 3 ensure?", o: ["At least 3 running Pods", "Exactly 1", "3 Nodes", "Unlimited"], a: 0, e: "The controller reconciles until 3 Pods are running." },
  ],
  dsa: [
    { q: "Which data structure follows LIFO (Last In First Out)?", o: ["Queue", "Stack", "Array", "Tree"], a: 1, e: "A stack removes the most recently added item first." },
    { q: "Which data structure gives O(1) average-time lookups?", o: ["Linked list", "Hash table", "Binary search tree", "Array (unsorted)"], a: 1, e: "Hash tables map keys to buckets for ~O(1) access." },
    { q: "What is the time complexity of searching a balanced BST?", o: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 1, e: "Each level halves the search space → O(log n)." },
  ],
  algorithms: [
    { q: "Which sorting algorithms run in O(n log n) average time?", o: ["Bubble Sort", "Merge Sort", "Insertion Sort", "Selection Sort"], a: 1, e: "Merge/quick/heap sort achieve O(n log n)." },
    { q: "Which search requires a sorted array and runs in O(log n)?", o: ["Linear search", "Binary search", "Depth-first search", "Exponential probe"], a: 1, e: "Binary search repeatedly halves the range on sorted data." },
    { q: "Which traversal visits the root FIRST in a binary tree?", o: ["In-order", "Pre-order", "Post-order", "Level-order"], a: 1, e: "Pre-order: root → left → right." },
  ],
  os: [
    { q: "What is the main role of an operating system kernel?", o: ["Manage hardware & resources", "Render web pages", "Compile code", "Store files only"], a: 0, e: "The kernel manages processes, memory, and hardware." },
    { q: "Which scheduling algorithm executes the shortest task first?", o: ["FCFS", "SJF", "Round Robin", "Priority boost"], a: 1, e: "Shortest Job First minimizes average wait time." },
    { q: "What is the key difference between a process and a thread?", o: ["Same memory", "Threads share the process's memory", "Threads have no stack", "None"], a: 1, e: "Threads share memory within their process; processes are isolated." },
  ],
  networks: [
    { q: "Which protocol transfers hypertext (web pages)?", o: ["FTP", "HTTP", "SMTP", "DNS"], a: 1, e: "HTTP (and HTTPS) serves web documents to browsers." },
    { q: "At which layer of the OSI model does TCP operate?", o: ["Network", "Transport", "Session", "Application"], a: 1, e: "TCP is a transport-layer protocol (layer 4)." },
    { q: "Which device routes packets between different networks?", o: ["Switch", "Router", "Hub", "Repeater"], a: 1, e: "Routers forward packets across networks using IP addresses." },
  ],
  dbms: [
    { q: "What is a primary key used for?", o: ["Unique row identification", "Storing files", "Indexing text", "Encryption"], a: 0, e: "A primary key uniquely identifies each row." },
    { q: "Which normal form removes transitive dependencies?", o: ["1NF", "2NF", "3NF", "BCNF"], a: 2, e: "3NF removes non-key attributes depending on other non-key attributes." },
    { q: "Which ACID property guarantees a transaction is all-or-nothing?", o: ["Atomicity", "Consistency", "Isolation", "Durability"], a: 0, e: "Atomicity ensures the entire transaction commits or fully rolls back." },
  ],
};

/* ------------------------------------------------------------------ */
/* Mock question generation                                            */
/* ------------------------------------------------------------------ */

const DIFF_KEYS = { easy: 0, medium: 1, hard: 2 };

function pickQuestions(bank, difficulty, count) {
  const idx = DIFF_KEYS[difficulty] ?? 1;
  const pool = bank.map((qs) => qs[idx]).filter(Boolean);
  const out = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    const item = pool[i % pool.length];
    out.push({
      questionText: item.q,
      options: item.o,
      correctAnswer: item.a,
      explanation: item.e,
      difficulty,
      aiGenerated: true,
    });
  }
  // Pad with any-difficulty questions if the exact tier is thin.
  while (out.length < count && bank.flat().length) {
    const item = bank.flat()[Math.floor(Math.random() * bank.flat().length)];
    out.push({
      questionText: item.q,
      options: item.o,
      correctAnswer: item.a,
      explanation: item.e,
      difficulty: out.length % 2 === 0 ? difficulty : "medium",
      aiGenerated: true,
    });
  }
  return out.slice(0, count);
}

export async function generateQuestions({ topic, difficulty = "easy", count = 5 } = {}) {
  const t = String(topic || "").trim().toLowerCase();
  const total = Math.min(Math.max(Number(count) || 5, 1), 15);
  const diff = ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "easy";

  // If OpenAI is configured, ask the model to write fresh questions.
  if (hasOpenAI) {
    const prompt = `Generate exactly ${total} unique multiple-choice questions about "${topic}" at the "${diff}" difficulty level.\n` +
      `Return ONLY JSON: { "questions": [ { "questionText": string, "options": [4 strings], "correctAnswer": number index, "explanation": string } ] }.\n` +
      `Make options plausible, the explanation educational (2-3 sentences), and ensure it remains a single topic.`;
    const data = await callOpenAI(
      "You are a senior software engineering educator creating quiz questions.",
      prompt
    );
    if (data && Array.isArray(data.questions) && data.questions.length) {
      return data.questions.slice(0, total).map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: diff,
        aiGenerated: true,
      }));
    }
  }

  // Offline deterministic fallback.
  const bank = BANK[t] || BANK.javascript;
  return pickQuestions(bank, diff, total);
}

/* ------------------------------------------------------------------ */
/* Mock answer explanation                                             */
/* ------------------------------------------------------------------ */

export async function explainAnswer({ questionText, options, selectedAnswer, correctAnswer } = {}) {
  const opts = Array.isArray(options) ? options : [];
  const correct = opts[correctAnswer];
  const selected = opts[selectedAnswer];
  const correctLabel = ["A", "B", "C", "D"][correctAnswer] ?? "?";
  const selectedLabel = ["A", "B", "C", "D"][selectedAnswer] ?? "?";

  if (hasOpenAI) {
    const prompt = `Question: ${questionText}\nOptions: ${opts.map((o, i) => `${["A","B","C","D"][i]}. ${o}`).join("\n")}\n` +
      `The student chose ${selectedLabel}. ${selected}, but the correct answer is ${correctLabel}. ${correct}.\n` +
      `Return ONLY JSON: { "explanation": string } — 2-4 sentences: why the answer is wrong and why the correct option is right.`;
    const data = await callOpenAI("You are a patient programming tutor.", prompt);
    if (data && data.explanation) return data.explanation;
  }

  const whyWrong =
    selected === correct
      ? "correct — nice work."
      : `not the right one because the key concept being tested is different — reread the question's keywords and compare how "${correct}" satisfies it.`;

  return `The correct answer was ${correctLabel}. ${correct}. ` +
    (selected !== undefined
      ? `Your choice, "${selected}", was ${whyWrong}`
      : "Compare the keywords in the question with each option to see why this one fits best.") +
    ` Tip: for "${correct}" focus on understanding the underlying concept rather than memorizing the option text.`;
}

/* ------------------------------------------------------------------ */
/* Mock performance analysis + recommendations                         */
/* ------------------------------------------------------------------ */

export const TOPIC_TIPS = {
  html: "Practice semantic tags, forms, and accessibility (ARIA) attributes.",
  css: "Drill selectors, specificity, flexbox, and grid layouts.",
  javascript: "Practice closures, async/await, array methods, and call-stack behavior.",
  react: "Master hooks, state management, effects, and the reconciliation lifecycle.",
  tailwindcss: "Learn the utility API, responsive variants, and custom config.",
  "node.js": "Practice the event loop, streams, and fs/async patterns.",
  "express.js": "Build REST routes, middleware, error handling, and request validation.",
  mongodb: "Practice CRUD, aggregation pipelines, indexes, and the document model.",
  python: "Drill data structures, comprehensions, functions, and error handling.",
  java: "Practice OOP concepts, collections, and exception handling.",
  c: "Master pointers, memory management, and header organization.",
  "c++": "Practice RAII, templates, STL containers, and smart pointers.",
  bootstrap: "Practice the grid, utilities, and component classes.",
  typescript: "Drill unions, generics, utility types, and structural typing.",
  mysql: "Practice JOINs, indexes, GROUP BY + HAVING, and normalization.",
  git: "Practice branching, merging, rebasing, and resolving conflicts.",
  github: "Practice PRs, Actions workflows, and collaboration flows.",
  "next.js": "Practice routing, SSR/SSG, and the App Router.",
  redux: "Drill actions, reducers, async middleware, and selectors.",
  docker: "Practice Dockerfiles, layers, networking, and container lifecycle.",
  firebase: "Practice Firestore queries, security rules, and Auth.",
  aws: "Drill EC2, S3, Lambda, IAM, and billing basics.",
  php: "Practice arrays, functions, and PDO database access.",
  jquery: "Practice selection, events, and DOM manipulation.",
  kubernetes: "Practice Pods, Deployments, Services, and scaling.",
  dsa: "Drill complexity analysis, stacks/queues, hashing, and linked lists.",
  algorithms: "Practice sorting, searching, recursion, and greedy vs DP.",
  os: "Practice process/threads, scheduling, memory, and deadlock.",
  networks: "Drill OSI layers, TCP/IP, DNS, and HTTP.",
  dbms: "Practice keys, normal forms, transactions, and ACID.",
};

function topicStats(attempts) {
  const map = new Map();
  for (const a of attempts) {
    const topic = (a.topic || "general").toLowerCase();
    const prev = map.get(topic) || { count: 0, correct: 0, total: 0 };
    prev.count += 1;
    prev.correct += a.score || 0;
    prev.total += a.total || 0;
    map.set(topic, prev);
  }
  return Array.from(map.entries()).map(([topic, s]) => ({
    topic,
    attempts: s.count,
    avgScore: s.total ? Math.round((s.correct / s.total) * 100) : 0,
  }));
}

export async function analyzePerformance(attempts = []) {
  const perTopic = topicStats(attempts);
  const overallTotal = perTopic.reduce((sum, t) => sum + t.attempts, 0);
  const overallAvg = perTopic.length
    ? Math.round(perTopic.reduce((sum, t) => sum + t.avgScore, 0) / perTopic.length)
    : 0;

  const weaknesses = perTopic
    .filter((t) => t.avgScore < 60 && t.attempts >= 1)
    .sort((a, b) => a.avgScore - b.avgScore);
  const strengths = perTopic
    .filter((t) => t.avgScore >= 80)
    .sort((a, b) => b.avgScore - a.avgScore);
  const strongTopics = strengths.map((t) => t.topic);
  const weakTopics = weaknesses.map((t) => t.topic);

  if (hasOpenAI && attempts.length) {
    const summary = perTopic
      .map((t) => `${t.topic.toUpperCase()}: ${t.avgScore}% across ${t.attempts} attempt(s)`)
      .join(", ");
    const prompt = `Student quiz history: ${summary || "no data yet"}.\n` +
      `Overall average ≈ ${overallAvg}%.\n` +
      `Return ONLY JSON: { "overview": string, "strengths": [string], "weaknesses": [string], "recommendations": [string (2-4 each)], "suggestedTopics": [topic strings to practice next] }.`;
    const data = await callOpenAI("You are a learning coach producing a personalized study report.", prompt);
    if (data && data.recommendations) {
      return {
        score: overallAvg,
        attempts: overallTotal,
        overview: data.overview || `You are currently averaging ${overallAvg}% across ${perTopic.length} subject(s).`,
        strengths: data.strengths || strongTopics,
        weaknesses: data.weaknesses || weakTopics,
        recommendations: data.recommendations,
        suggestedTopics: data.suggestedTopics || weakTopics,
      };
    }
  }

  // Rule-based fallback report.
  const recs = [];
  if (weakTopics.length) {
    recs.push(
      `Your weakest subject${weakTopics.length > 1 ? "s" : ""}: ${weakTopics
        .join(", ")
        .toUpperCase()}. Spend 20-30 minutes daily on ${TOPIC_TIPS[weakTopics[0]] || "topic fundamentals"}`
    );
  }
  if (perTopic.length === 0) {
    recs.push("Take your first quiz in any topic to unlock personalized recommendations.");
  } else {
    recs.push(`Next step: attempt an adaptive quiz on ${weakTopics[0] || perTopic[0].topic} — it adjusts difficulty to your skill level.`);
    if (strongTopics.length) {
      recs.push(`You're strong in: ${strongTopics.join(", ").toUpperCase()}. Retake hard questions to keep sharpening.`);
    }
  }

  return {
    score: overallAvg,
    attempts: overallTotal,
    overview:
      perTopic.length === 0
        ? "No quiz attempts yet — your personalized learning report will appear after your first quiz."
        : `You are averaging ${overallAvg}% across ${perTopic.length} subject(s). ${weakTopics.length ? `Your most urgent focus should be ${weakTopics[0].toUpperCase()}.` : "Balanced performance — try harder difficulty levels to keep growing."}`,
    strengths: strengths.length ? strongTopics : ["Complete more quizzes to identify strengths."],
    weaknesses: weaknesses.length ? weakTopics : ["None detected — solid performance so far!"],
    recommendations: recs,
    suggestedTopics: weaknesses.length ? weakTopics : perTopic.map((t) => t.topic).slice(0, 3),
  };
}

export default { generateQuestions, explainAnswer, analyzePerformance, TOPIC_TIPS, hasOpenAI };