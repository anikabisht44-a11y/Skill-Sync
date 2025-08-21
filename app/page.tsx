"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Target, Trophy, Zap, Brain, Code, Palette } from "lucide-react"
import { GrewtChatbot } from "@/components/grewt-chatbot"

type AppState = "welcome" | "quiz" | "games" | "analysis" | "roadmap" | "tracker" | "internships"

interface QuizAnswer {
  questionId: number
  answer: string
  domainScores: Record<string, number>
}

interface GameScore {
  gameId: string
  score: number
  domainScores: Record<string, number>
}

interface UserData {
  quizAnswers: QuizAnswer[]
  gameScores: GameScore[]
  totalDomainScores: Record<string, number>
}

interface AnalysisResult {
  recommendedField: string
  confidence: number
  explanation: string
  roadmap: string[]
  resources: string[]
  internshipReadiness: number
  skillGaps: Array<{
    skill: string
    current: number
    target: number
    priority: "High" | "Medium" | "Low"
    courses: Array<{
      title: string
      provider: string
      url: string
      duration: string
      level: string
    }>
  }>
}

interface RoadmapProgress {
  completedItems: Set<number | string>
  completedResources: Set<number>
  weeklyTasks: {
    dsaProblems: number
    projectHours: number
    coursesCompleted: number
  }
  achievements: string[]
  currentLevel: number
  totalXP: number
}

interface DSAChallenge {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  description: string
  examples: Array<{
    input: string
    output: string
    explanation: string
  }>
  constraints: string[]
  hints: string[]
  solution: string
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
  points: number
}

interface DSAProgress {
  completedChallenges: Set<string>
  attemptedChallenges: Set<string>
  weeklyStreak: number
  totalScore: number
  lastCompletedDate: string
}

interface Project {
  id: number
  title: string
  description: string
  techStack: string[]
  estimatedHours: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  resources: Array<{
    title: string
    url: string
    type: "Tutorial" | "Documentation" | "Video" | "Article"
  }>
  milestones: string[]
  progress: number
  completed: boolean
}

interface InternshipOpportunity {
  id: string
  company: string
  role: string
  location: string
  stipend: string
  duration: string
  description: string
  requirements: string[]
  skills: string[]
  applyUrl: string
  fitScore?: number
}

interface WeeklyTest {
  id: string
  title: string
  description: string
  questions: Array<{
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }>
  timeLimit: number
  passingScore: number
}

const DOMAINS = [
  "Software Development",
  "Cybersecurity",
  "AI/ML",
  "Data Science",
  "Web Development",
  "Mobile Development",
]

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What type of problems do you enjoy solving the most?",
    options: [
      "Building user interfaces and experiences",
      "Protecting systems from threats",
      "Finding patterns in large datasets",
      "Creating intelligent algorithms",
      "Developing mobile applications",
      "Backend system architecture",
    ],
    domainScores: {
      "Web Development": [3, 0, 1, 1, 1, 2],
      Cybersecurity: [0, 3, 1, 1, 0, 2],
      "Data Science": [1, 0, 3, 2, 0, 1],
      "AI/ML": [1, 1, 2, 3, 1, 1],
      "Mobile Development": [2, 0, 1, 1, 3, 1],
      "Software Development": [2, 1, 1, 2, 2, 3],
    },
  },
  {
    id: 2,
    question: "Which work environment appeals to you most?",
    options: [
      "Creative agency or startup",
      "Government or security firm",
      "Research lab or analytics company",
      "Tech company or AI research",
      "App development studio",
      "Enterprise software company",
    ],
    domainScores: {
      "Web Development": [3, 0, 1, 1, 2, 1],
      Cybersecurity: [0, 3, 1, 1, 0, 2],
      "Data Science": [1, 1, 3, 2, 0, 1],
      "AI/ML": [1, 1, 2, 3, 1, 1],
      "Mobile Development": [2, 0, 1, 1, 3, 1],
      "Software Development": [1, 2, 1, 2, 1, 3],
    },
  },
  {
    id: 3,
    question: "What motivates you most in your work?",
    options: [
      "Creating beautiful, functional designs",
      "Keeping systems and data secure",
      "Discovering insights from data",
      "Building intelligent systems",
      "Reaching millions of mobile users",
      "Solving complex technical challenges",
    ],
    domainScores: {
      "Web Development": [3, 0, 1, 1, 1, 2],
      Cybersecurity: [0, 3, 1, 1, 0, 2],
      "Data Science": [1, 0, 3, 2, 0, 1],
      "AI/ML": [1, 1, 2, 3, 1, 2],
      "Mobile Development": [2, 0, 1, 1, 3, 1],
      "Software Development": [2, 2, 1, 2, 2, 3],
    },
  },
]

const CAREER_GAMES = [
  {
    id: "bug-buster",
    title: "Bug Buster",
    description: "Find and fix code bugs to test your debugging skills",
    domain: "Software Development",
    icon: "🐛",
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "code-match",
    title: "Code Match",
    description: "Match programming concepts with their definitions",
    domain: "Software Development",
    icon: "🧩",
    color: "from-green-500 to-blue-500",
  },
  {
    id: "cyber-chase",
    title: "Cyber Chase",
    description: "Identify security threats and vulnerabilities",
    domain: "Cybersecurity",
    icon: "🛡️",
    color: "from-red-500 to-orange-500",
  },
  {
    id: "data-detective",
    title: "Data Detective",
    description: "Analyze patterns and trends in datasets",
    domain: "Data Science",
    icon: "🔍",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "web-builder",
    title: "Web Builder Sprint",
    description: "Build responsive web layouts quickly",
    domain: "Web Development",
    icon: "🌐",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "career-sim",
    title: "Career Simulator",
    description: "Make career decisions and see outcomes",
    domain: "General",
    icon: "🎯",
    color: "from-yellow-500 to-red-500",
  },
]

const DSA_CHALLENGES: DSAChallenge[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists.",
    ],
    hints: [
      "Try using a hash map to store numbers you've seen",
      "For each number, check if target - number exists in the map",
    ],
    solution: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    testCases: [
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
      { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
    ],
    points: 10,
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: "Reverse the array of characters in-place.",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁵", "s[i] is a printable ascii character."],
    hints: ["Use two pointers approach", "Swap characters from both ends moving towards center"],
    solution: `function reverseString(s) {
    let left = 0;
    let right = s.length - 1;
    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
}`,
    testCases: [{ input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' }],
    points: 8,
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left.",
      },
    ],
    constraints: ["-2³¹ ≤ x ≤ 2³¹ - 1"],
    hints: ["Negative numbers are not palindromes", "Convert to string or reverse the number mathematically"],
    solution: `function isPalindrome(x) {
    if (x < 0) return false;
    const str = x.toString();
    return str === str.split('').reverse().join('');
}`,
    testCases: [
      { input: "121", expectedOutput: "true" },
      { input: "-121", expectedOutput: "false" },
    ],
    points: 8,
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "The string contains valid parentheses pairs.",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴"],
    hints: ["Use a stack data structure", "Push opening brackets, pop and match closing brackets"],
    solution: `function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };
    
    for (let char of s) {
        if (char in pairs) {
            if (stack.pop() !== pairs[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}`,
    testCases: [
      { input: '"()"', expectedOutput: "true" },
      { input: '"([)]"', expectedOutput: "false" },
    ],
    points: 12,
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵"],
    hints: ["Use Kadane's algorithm", "Keep track of current sum and maximum sum seen so far"],
    solution: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
    testCases: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" }],
    points: 15,
  },
]

const WEEKLY_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Personal Portfolio Website",
    description: "Build a responsive portfolio website showcasing your projects and skills",
    techStack: ["HTML", "CSS", "JavaScript", "React"],
    estimatedHours: 15,
    difficulty: "Beginner",
    resources: [
      { title: "React Tutorial", url: "#", type: "Tutorial" },
      { title: "CSS Grid Guide", url: "#", type: "Documentation" },
    ],
    milestones: ["Setup project", "Create layout", "Add projects", "Deploy"],
    progress: 0,
    completed: false,
  },
  {
    id: 2,
    title: "Task Management App",
    description: "Create a full-stack task management application with user authentication",
    techStack: ["React", "Node.js", "Express", "MongoDB"],
    estimatedHours: 25,
    difficulty: "Intermediate",
    resources: [
      { title: "MERN Stack Tutorial", url: "#", type: "Video" },
      { title: "JWT Authentication", url: "#", type: "Article" },
    ],
    milestones: ["Backend API", "Frontend UI", "Authentication", "Database integration"],
    progress: 0,
    completed: false,
  },
  {
    id: 3,
    title: "E-commerce Platform",
    description: "Build a complete e-commerce platform with payment integration",
    techStack: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"],
    estimatedHours: 40,
    difficulty: "Advanced",
    resources: [
      { title: "Next.js Commerce", url: "#", type: "Tutorial" },
      { title: "Stripe Integration", url: "#", type: "Documentation" },
    ],
    milestones: ["Product catalog", "Shopping cart", "Payment system", "Order management"],
    progress: 0,
    completed: false,
  },
  {
    id: 4,
    title: "Data Visualization Dashboard",
    description: "Create an interactive dashboard for data visualization and analytics",
    techStack: ["React", "D3.js", "Python", "Flask"],
    estimatedHours: 30,
    difficulty: "Intermediate",
    resources: [
      { title: "D3.js Tutorial", url: "#", type: "Tutorial" },
      { title: "Flask API Guide", url: "#", type: "Documentation" },
    ],
    milestones: ["Data processing", "Chart components", "Interactive features", "API integration"],
    progress: 0,
    completed: false,
  },
  {
    id: 5,
    title: "Mobile Weather App",
    description: "Develop a cross-platform mobile app for weather forecasting",
    techStack: ["React Native", "TypeScript", "Weather API"],
    estimatedHours: 20,
    difficulty: "Intermediate",
    resources: [
      { title: "React Native Guide", url: "#", type: "Tutorial" },
      { title: "Weather API Docs", url: "#", type: "Documentation" },
    ],
    milestones: ["App setup", "Weather API", "UI components", "Location services"],
    progress: 0,
    completed: false,
  },
]

const INTERNSHIP_OPPORTUNITIES: InternshipOpportunity[] = [
  {
    id: "flipkart-swe",
    company: "Flipkart",
    role: "Software Engineering Intern",
    location: "Bengaluru, India | Hybrid",
    stipend: "₹40,000/month",
    duration: "6 months",
    description: "Work on India's largest e-commerce platform, building scalable solutions for millions of users.",
    requirements: ["CS/IT background", "Strong programming skills", "Problem-solving abilities"],
    skills: ["Java", "Python", "React", "Microservices"],
    applyUrl: "https://www.flipkartcareers.com",
  },
  {
    id: "zomato-product",
    company: "Zomato",
    role: "Product Management Intern",
    location: "Gurugram, India | Remote",
    stipend: "₹35,000/month",
    duration: "4 months",
    description:
      "Drive product strategy for India's leading food delivery platform and work with cross-functional teams.",
    requirements: ["Business/Engineering background", "Analytical mindset", "User-centric thinking"],
    skills: ["Product Strategy", "Data Analysis", "User Research", "SQL"],
    applyUrl: "https://www.zomato.com/careers",
  },
  {
    id: "paytm-data",
    company: "Paytm",
    role: "Data Science Intern",
    location: "Noida, India | Hybrid",
    stipend: "₹45,000/month",
    duration: "6 months",
    description: "Analyze financial data and build ML models to enhance India's digital payment ecosystem.",
    requirements: ["Statistics/CS background", "Python proficiency", "ML knowledge"],
    skills: ["Python", "SQL", "Machine Learning", "Financial Analytics"],
    applyUrl: "https://jobs.paytm.com",
  },
  {
    id: "byju-frontend",
    company: "BYJU'S",
    role: "Frontend Development Intern",
    location: "Bengaluru, India | On-site",
    stipend: "₹30,000/month",
    duration: "5 months",
    description:
      "Build engaging educational interfaces for India's largest ed-tech platform serving millions of students.",
    requirements: ["Web development skills", "React knowledge", "UI/UX understanding"],
    skills: ["React", "JavaScript", "CSS", "UI Design"],
    applyUrl: "https://byjus.com/careers",
  },
  {
    id: "swiggy-mobile",
    company: "Swiggy",
    role: "Mobile App Development Intern",
    location: "Bengaluru, India | Hybrid",
    stipend: "₹38,000/month",
    duration: "4 months",
    description: "Develop mobile features for India's leading food delivery app used by millions daily.",
    requirements: ["Mobile development experience", "React Native/Flutter", "API integration"],
    skills: ["React Native", "JavaScript", "Mobile UI", "API Integration"],
    applyUrl: "https://careers.swiggy.com",
  },
  {
    id: "ola-backend",
    company: "Ola",
    role: "Backend Engineering Intern",
    location: "Bengaluru, India | On-site",
    stipend: "₹42,000/month",
    duration: "6 months",
    description:
      "Build scalable backend systems for India's mobility platform connecting millions of riders and drivers.",
    requirements: ["Backend development skills", "Database knowledge", "System design basics"],
    skills: ["Node.js", "Python", "MongoDB", "System Design"],
    applyUrl: "https://www.olacabs.com/careers",
  },
  {
    id: "razorpay-fintech",
    company: "Razorpay",
    role: "Fintech Development Intern",
    location: "Bengaluru, India | Hybrid",
    stipend: "₹50,000/month",
    duration: "6 months",
    description: "Work on payment solutions and financial products powering India's digital economy.",
    requirements: ["Strong programming skills", "Interest in fintech", "Security awareness"],
    skills: ["Java", "Python", "Payment APIs", "Security"],
    applyUrl: "https://razorpay.com/jobs",
  },
  {
    id: "freshworks-saas",
    company: "Freshworks",
    role: "SaaS Development Intern",
    location: "Chennai, India | Remote",
    stipend: "₹35,000/month",
    duration: "5 months",
    description: "Contribute to customer experience software used by businesses across India and globally.",
    requirements: ["Full-stack development", "SaaS understanding", "Customer-focused mindset"],
    skills: ["Ruby on Rails", "JavaScript", "PostgreSQL", "SaaS"],
    applyUrl: "https://www.freshworks.com/company/careers",
  },
]

const HEALTH_REMINDERS = [
  {
    id: "hydration",
    title: "Stay Hydrated! 💧",
    message: "Time for a water break! Aim for 8 glasses throughout the day.",
    icon: "💧",
    type: "physical",
  },
  {
    id: "eye-rest",
    title: "Rest Your Eyes 👀",
    message: "Follow the 20-20-20 rule: Look at something 20 feet away for 20 seconds.",
    icon: "👀",
    type: "physical",
  },
  {
    id: "posture",
    title: "Check Your Posture 🪑",
    message: "Sit up straight! Keep your feet flat and shoulders relaxed.",
    icon: "🪑",
    type: "physical",
  },
  {
    id: "movement",
    title: "Time to Move! 🚶",
    message: "Take a 5-minute walk or do some stretches to keep your body active.",
    icon: "🚶",
    type: "physical",
  },
  {
    id: "mental-break",
    title: "Mental Health Check 🧠",
    message: "Take a deep breath. How are you feeling? It's okay to take breaks.",
    icon: "🧠",
    type: "mental",
  },
]

export default function SkillSync() {
  const [currentState, setCurrentState] = useState<AppState>("welcome")
  const [progress, setProgress] = useState(0)
  const [userData, setUserData] = useState<UserData>({
    quizAnswers: [],
    gameScores: [],
    totalDomainScores: Object.fromEntries(DOMAINS.map((d) => [d, 0])),
  })
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [gameCompleted, setGameCompleted] = useState<boolean[]>(new Array(6).fill(false))
  const [gameScores, setGameScores] = useState<number[]>(new Array(6).fill(0))

  // Game-specific states
  const [bugBusterCode, setBugBusterCode] = useState(`function calculateSum(a, b) {
  return a + b;
}`)
  const [codeMatchPairs, setCodeMatchPairs] = useState<Array<{ term: string; definition: string; matched: boolean }>>(
    [],
  )

  const [selectedTerm, setSelectedTerm] = useState<number | null>(null)
  const [selectedDefinition, setSelectedDefinition] = useState<number | null>(null)

  const [cyberThreats, setCyberThreats] = useState<Array<{ threat: string; severity: string; identified: boolean }>>([])
  const [dataPattern, setDataPattern] = useState<number[]>([])
  const [webLayout, setWebLayout] = useState("")
  const [careerChoices, setCareerChoices] = useState<Array<{ choice: string; outcome: string; selected: boolean }>>([])

  // Health and wellness states
  const [currentHealthReminder, setCurrentHealthReminder] = useState<(typeof HEALTH_REMINDERS)[0] | null>(null)

  // Internship finder states
  const [currentInternshipIndex, setCurrentInternshipIndex] = useState(0)
  const [likedInternships, setLikedInternships] = useState<InternshipOpportunity[]>([])
  const [passedInternships, setPassedInternships] = useState<string[]>([])
  const [showInternshipDetails, setShowInternshipDetails] = useState<InternshipOpportunity | null>(null)
  const [internshipOpportunities, setInternshipOpportunities] =
    useState<InternshipOpportunity[]>(INTERNSHIP_OPPORTUNITIES)

  // DSA and Projects states
  const [dsaProgress, setDsaProgress] = useState<DSAProgress>({
    completedChallenges: new Set<string>(),
    attemptedChallenges: new Set<string>(),
    weeklyStreak: 0,
    totalScore: 0,
    lastCompletedDate: "",
  })
  const [currentChallenge, setCurrentChallenge] = useState<DSAChallenge | null>(null)
  const [userSolution, setUserSolution] = useState("")
  const [showHints, setShowHints] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [projects, setProjects] = useState<Project[]>(WEEKLY_PROJECTS)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Roadmap progress
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgress>({
    completedItems: new Set<number | string>(),
    completedResources: new Set<number>(),
    weeklyTasks: { dsaProblems: 0, projectHours: 0, coursesCompleted: 0 },
    achievements: [],
    currentLevel: 1,
    totalXP: 0,
  })

  const initializeBugBuster = () => {
    const buggyCode = `function calculateSum(a, b) {
  return a - b; // Bug: should be + not -
}`
    setBugBusterCode(buggyCode)
  }

  const initializeCodeMatch = () => {
    const pairs = [
      { term: "Variable", definition: "A container for storing data values", matched: false },
      { term: "Function", definition: "A block of code designed to perform a task", matched: false },
      { term: "Loop", definition: "A sequence of instructions that repeats", matched: false },
      { term: "Array", definition: "A collection of elements stored in order", matched: false },
    ]
    setCodeMatchPairs(pairs)
    setSelectedTerm(null)
    setSelectedDefinition(null)
  }

  const initializeCyberChase = () => {
    const threats = [
      { threat: "Suspicious email with attachment", severity: "High", identified: false },
      { threat: "Weak password policy", severity: "Medium", identified: false },
      { threat: "Unencrypted data transmission", severity: "High", identified: false },
      { threat: "Outdated software version", severity: "Medium", identified: false },
    ]
    setCyberThreats(threats)
  }

  const initializeDataDetective = () => {
    const pattern = [2, 4, 8, 16, 32, 64]
    setDataPattern(pattern)
  }

  const initializeWebBuilder = () => {
    setWebLayout("")
  }

  const initializeCareerSim = () => {
    const choices = [
      { choice: "Focus on frontend development", outcome: "High demand, creative work", selected: false },
      { choice: "Specialize in cybersecurity", outcome: "Growing field, high salary", selected: false },
      { choice: "Pursue data science", outcome: "Analytical work, AI integration", selected: false },
      { choice: "Learn mobile development", outcome: "App market opportunities", selected: false },
    ]
    setCareerChoices(choices)
  }

  const recordGameScore = (gameId: string, score: number, domainScores: Record<string, number>) => {
    const gameScore: GameScore = { gameId, score, domainScores }
    setUserData((prev) => ({
      ...prev,
      gameScores: [...prev.gameScores.filter((gs) => gs.gameId !== gameId), gameScore],
      totalDomainScores: Object.keys(domainScores).reduce(
        (acc, domain) => ({
          ...acc,
          [domain]: (acc[domain] || 0) + domainScores[domain],
        }),
        prev.totalDomainScores,
      ),
    }))

    const gameIndex = CAREER_GAMES.findIndex((game) => game.id === gameId)
    if (gameIndex !== -1) {
      setGameCompleted((prev) => {
        const newCompleted = [...prev]
        newCompleted[gameIndex] = true
        return newCompleted
      })
      setGameScores((prev) => {
        const newScores = [...prev]
        newScores[gameIndex] = score
        return newScores
      })

      setTimeout(() => {
        const nextIncompleteIndex = gameCompleted.findIndex((completed, index) => !completed && index > gameIndex)
        if (nextIncompleteIndex !== -1) {
          setCurrentGameIndex(nextIncompleteIndex)
          // Initialize the next game
          const nextGame = CAREER_GAMES[nextIncompleteIndex]
          if (nextGame.id === "bug-buster") initializeBugBuster()
          else if (nextGame.id === "code-match") initializeCodeMatch()
          else if (nextGame.id === "cyber-chase") initializeCyberChase()
          else if (nextGame.id === "data-detective") initializeDataDetective()
          else if (nextGame.id === "web-builder") initializeWebBuilder()
          else if (nextGame.id === "career-sim") initializeCareerSim()
        }
      }, 1000)
    }
  }

  const handleCodeMatchSelection = (type: "term" | "definition", index: number) => {
    if (type === "term") {
      if (selectedTerm === index) {
        setSelectedTerm(null)
      } else {
        setSelectedTerm(index)
        if (selectedDefinition !== null) {
          // Check if it's a correct match
          if (index === selectedDefinition) {
            const newPairs = [...codeMatchPairs]
            newPairs[index].matched = true
            setCodeMatchPairs(newPairs)
            setSelectedTerm(null)
            setSelectedDefinition(null)

            if (newPairs.every((p) => p.matched)) {
              const score = 90
              const domainScores = {
                "Software Development": 12,
                "Web Development": 8,
              }
              recordGameScore("code-match", score, domainScores)
            }
          } else {
            // Wrong match, reset selections after brief delay
            setTimeout(() => {
              setSelectedTerm(null)
              setSelectedDefinition(null)
            }, 500)
          }
        }
      }
    } else {
      if (selectedDefinition === index) {
        setSelectedDefinition(null)
      } else {
        setSelectedDefinition(index)
        if (selectedTerm !== null) {
          // Check if it's a correct match
          if (selectedTerm === index) {
            const newPairs = [...codeMatchPairs]
            newPairs[index].matched = true
            setCodeMatchPairs(newPairs)
            setSelectedTerm(null)
            setSelectedDefinition(null)

            if (newPairs.every((p) => p.matched)) {
              const score = 90
              const domainScores = {
                "Software Development": 12,
                "Web Development": 8,
              }
              recordGameScore("code-match", score, domainScores)
            }
          } else {
            // Wrong match, reset selections after brief delay
            setTimeout(() => {
              setSelectedTerm(null)
              setSelectedDefinition(null)
            }, 500)
          }
        }
      }
    }
  }

  const calculateFitScore = (internship: InternshipOpportunity, userSkills: string[]): number => {
    if (!userSkills.length) return 50 // Default score if no skills logged

    const skillsMatch = internship.skills.filter((skill) =>
      userSkills.some(
        (userSkill) =>
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase()),
      ),
    ).length

    const skillsScore = (skillsMatch / internship.skills.length) * 100

    // Add some randomization for demo purposes (25-100 range)
    const finalScore = Math.max(25, Math.min(100, skillsScore + Math.random() * 20))
    return Math.round(finalScore)
  }

  const handleSwipeRight = (internship: InternshipOpportunity) => {
    setLikedInternships((prev) => [...prev, internship])
    nextInternship()
  }

  const handleSwipeLeft = () => {
    setPassedInternships((prev) => [...prev, internshipOpportunities[currentInternshipIndex]?.id || ""])
    nextInternship()
  }

  const handleSwipeUp = (internship: InternshipOpportunity) => {
    setShowInternshipDetails(internship)
  }

  const nextInternship = () => {
    if (currentInternshipIndex < internshipOpportunities.length - 1) {
      setCurrentInternshipIndex((prev) => prev + 1)
    }
  }

  const performAnalysis = async () => {
    setIsAnalyzing(true)

    setTimeout(() => {
      const recommendedField = DOMAINS.sort(
        (a, b) => (userData.totalDomainScores[b] || 0) - (userData.totalDomainScores[a] || 0),
      )[0]

      const confidence = Math.min(
        95,
        Math.max(
          60,
          ((userData.totalDomainScores[recommendedField] || 0) /
            Math.max(1, Math.max(...Object.values(userData.totalDomainScores)))) *
            100,
        ),
      )

      const skillGaps = [
        {
          skill: "Data Structures & Algorithms",
          current: 60,
          target: 85,
          priority: "High" as const,
          courses: [
            {
              title: "JavaScript Algorithms and Data Structures",
              provider: "freeCodeCamp",
              url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
              duration: "300 hours",
              level: "Beginner to Advanced",
            },
          ],
        },
        {
          skill: "System Design",
          current: 40,
          target: 75,
          priority: "Medium" as const,
          courses: [
            {
              title: "System Design Interview Course",
              provider: "Coursera",
              url: "https://www.coursera.org/learn/system-design-interview",
              duration: "4 weeks",
              level: "Intermediate",
            },
          ],
        },
      ]

      const result: AnalysisResult = {
        recommendedField,
        confidence,
        explanation: `Based on your quiz responses and game performance, you show strong aptitude for ${recommendedField}. Your problem-solving skills and technical interests align well with this field.`,
        roadmap: [
          "Complete foundational courses",
          "Build portfolio projects",
          "Practice coding challenges",
          "Apply for internships",
          "Network with professionals",
        ],
        resources: [
          "freeCodeCamp - Free coding bootcamp",
          "Coursera - University courses",
          "LeetCode - Coding practice",
          "GitHub - Portfolio hosting",
        ],
        internshipReadiness: Math.round(confidence * 0.8),
        skillGaps,
      }

      setAnalysisResult(result)
      setIsAnalyzing(false)
      setCurrentState("analysis")
    }, 2000)
  }

  const renderWelcome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to SkillSync
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Discover your ideal tech career path through interactive assessments and personalized guidance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Career Assessment</h3>
              <p className="text-sm text-gray-600">Take our comprehensive quiz to identify your strengths</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Skill Games</h3>
              <p className="text-sm text-gray-600">Play interactive games to test your technical abilities</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Roadmap</h3>
              <p className="text-sm text-gray-600">Get a customized learning path for your career goals</p>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={() => setCurrentState("quiz")}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Start Your Journey
        </Button>
      </div>
    </div>
  )

  const renderQuiz = () => {
    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex]

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">Career Assessment Quiz</h2>
              <Badge variant="outline" className="text-sm">
                {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
              </Badge>
            </div>
            <Progress value={(currentQuestionIndex / QUIZ_QUESTIONS.length) * 100} className="h-2" />
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-800">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start p-4 h-auto hover:bg-blue-50 hover:border-blue-300 transition-colors bg-transparent"
                  onClick={() => {
                    const answer: QuizAnswer = {
                      questionId: currentQuestion.id,
                      answer: option,
                      domainScores: Object.fromEntries(
                        Object.entries(currentQuestion.domainScores).map(([domain, scores]) => [domain, scores[index]]),
                      ),
                    }

                    setUserData((prev) => ({
                      ...prev,
                      quizAnswers: [...prev.quizAnswers.filter((qa) => qa.questionId !== currentQuestion.id), answer],
                      totalDomainScores: Object.keys(answer.domainScores).reduce(
                        (acc, domain) => ({
                          ...acc,
                          [domain]: (acc[domain] || 0) + answer.domainScores[domain],
                        }),
                        prev.totalDomainScores,
                      ),
                    }))

                    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1)
                    } else {
                      setCurrentState("games")
                      setCurrentGameIndex(0)
                      initializeBugBuster()
                    }
                  }}
                >
                  {option}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderGames = () => {
    const currentGame = CAREER_GAMES[currentGameIndex]
    const completedCount = gameCompleted.filter(Boolean).length

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">Skill Assessment Games</h2>
              <Badge variant="outline" className="text-sm">
                {completedCount} of {CAREER_GAMES.length} completed
              </Badge>
            </div>
            <Progress value={(completedCount / CAREER_GAMES.length) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {CAREER_GAMES.map((game, index) => (
              <Card
                key={game.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  index === currentGameIndex
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : gameCompleted[index]
                      ? "bg-green-50 border-green-200"
                      : "hover:shadow-md"
                }`}
                onClick={() => {
                  setCurrentGameIndex(index)
                  if (game.id === "bug-buster") initializeBugBuster()
                  else if (game.id === "code-match") initializeCodeMatch()
                  else if (game.id === "cyber-chase") initializeCyberChase()
                  else if (game.id === "data-detective") initializeDataDetective()
                  else if (game.id === "web-builder") initializeWebBuilder()
                  else if (game.id === "career-sim") initializeCareerSim()
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{game.icon}</span>
                    {gameCompleted[index] && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{game.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{game.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {game.domain}
                  </Badge>
                  {gameCompleted[index] && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        Score: {gameScores[index]}%
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {renderCurrentGame()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentGameIndex(Math.max(0, currentGameIndex - 1))}
              disabled={currentGameIndex === 0}
            >
              Previous Game
            </Button>

            {completedCount === CAREER_GAMES.length ? (
              <div className="text-center">
                <Card className="mb-6 border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">All Games Completed!</h3>
                    <p className="text-green-700 mb-4">
                      Congratulations! You've completed all {CAREER_GAMES.length} skill assessment games.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {CAREER_GAMES.map((game, index) => (
                        <div key={game.id} className="text-center">
                          <div className="text-2xl mb-1">{game.icon}</div>
                          <div className="text-sm font-medium">{game.title}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {gameScores[index]}%
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">🎯 Recommended Career Path</h4>
                      <div className="text-left">
                        {(() => {
                          const avgScore = gameScores.reduce((sum, score) => sum + score, 0) / gameScores.length
                          const topDomain = Object.entries(userData.totalDomainScores).sort(([, a], [, b]) => b - a)[0]

                          if (avgScore >= 80) {
                            return (
                              <div>
                                <p className="text-green-700 font-medium">🌟 Excellent Performance!</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Based on your strong performance (avg: {Math.round(avgScore)}%), you show great
                                  potential in <strong>{topDomain?.[0] || "Software Development"}</strong>. You're ready
                                  for advanced challenges and leadership roles in tech.
                                </p>
                              </div>
                            )
                          } else if (avgScore >= 65) {
                            return (
                              <div>
                                <p className="text-blue-700 font-medium">🚀 Strong Foundation!</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  With your solid performance (avg: {Math.round(avgScore)}%), you have a good foundation
                                  in <strong>{topDomain?.[0] || "Software Development"}</strong>. Focus on building
                                  deeper expertise in your strongest areas.
                                </p>
                              </div>
                            )
                          } else {
                            return (
                              <div>
                                <p className="text-orange-700 font-medium">📚 Learning Opportunity!</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Your performance (avg: {Math.round(avgScore)}%) shows room for growth in{" "}
                                  <strong>{topDomain?.[0] || "Software Development"}</strong>. Consider starting with
                                  foundational courses and practice projects.
                                </p>
                              </div>
                            )
                          }
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={() => setCurrentState("tracker")}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Start Your Journey
                </Button>
                <Button variant="outline" onClick={() => setCurrentState("internships")}>
                  Find Internships
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setCurrentGameIndex(Math.min(CAREER_GAMES.length - 1, currentGameIndex + 1))}
                disabled={currentGameIndex === CAREER_GAMES.length - 1}
              >
                Next Game
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderCurrentGame = () => {
    const currentGame = CAREER_GAMES[currentGameIndex]

    switch (currentGame.id) {
      case "bug-buster":
        return renderBugBuster()
      case "code-match":
        return renderCodeMatch()
      case "cyber-chase":
        return renderCyberChase()
      case "data-detective":
        return renderDataDetective()
      case "web-builder":
        return renderWebBuilder()
      case "career-sim":
        return renderCareerSim()
      default:
        return null
    }
  }

  const renderBugBuster = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🐛</span>
          Bug Buster Challenge
        </CardTitle>
        <CardDescription>
          Find and fix the bug in this JavaScript function. The function should add two numbers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <pre>{bugBusterCode}</pre>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">What's wrong with this code?</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              "The function uses subtraction (-) instead of addition (+)",
              "The function name is incorrect",
              "Missing semicolon at the end",
              "Variables a and b are not defined",
            ].map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start bg-transparent"
                onClick={() => {
                  const isCorrect = index === 0
                  const score = isCorrect ? 85 : 45
                  const domainScores = {
                    "Software Development": isCorrect ? 15 : 5,
                    "Problem Solving": isCorrect ? 8 : 3,
                  }
                  recordGameScore("bug-buster", score, domainScores)
                }}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderCodeMatch = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🧩</span>
          Code Match Challenge
        </CardTitle>
        <CardDescription>
          Match programming terms with their correct definitions by clicking on matching pairs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Terms</h4>
            {codeMatchPairs.map((pair, index) => (
              <Button
                key={index}
                variant={pair.matched ? "default" : selectedTerm === index ? "secondary" : "outline"}
                className={`w-full text-left justify-start ${
                  pair.matched ? "bg-green-500 text-white" : selectedTerm === index ? "bg-blue-100 border-blue-500" : ""
                }`}
                disabled={pair.matched}
                onClick={() => handleCodeMatchSelection("term", index)}
              >
                {pair.term}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Definitions</h4>
            {codeMatchPairs.map((pair, index) => (
              <Button
                key={index}
                variant={pair.matched ? "default" : selectedDefinition === index ? "secondary" : "outline"}
                className={`w-full text-left justify-start text-sm ${
                  pair.matched
                    ? "bg-green-500 text-white"
                    : selectedDefinition === index
                      ? "bg-blue-100 border-blue-500"
                      : ""
                }`}
                disabled={pair.matched}
                onClick={() => handleCodeMatchSelection("definition", index)}
              >
                {pair.definition}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Click on a term, then click on its matching definition. Correct matches will turn green!
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderCyberChase = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          Cyber Chase Challenge
        </CardTitle>
        <CardDescription>Identify security threats and assess their severity levels.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cyberThreats.map((threat, index) => (
          <Card key={index} className={threat.identified ? "bg-red-50 border-red-200" : "border-gray-200"}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{threat.threat}</p>
                  <Badge variant={threat.severity === "High" ? "destructive" : "secondary"} className="mt-1">
                    {threat.severity} Risk
                  </Badge>
                </div>
                <Button
                  variant={threat.identified ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newThreats = [...cyberThreats]
                    newThreats[index].identified = true
                    setCyberThreats(newThreats)

                    if (newThreats.every((t) => t.identified)) {
                      const domainScores = {
                        Cybersecurity: 16,
                        "Problem Solving": 8,
                      }
                      recordGameScore("cyber-chase", 88, domainScores)
                    }
                  }}
                >
                  {threat.identified ? "✓ Identified" : "Identify"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )

  const renderDataDetective = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          Data Detective Challenge
        </CardTitle>
        <CardDescription>Analyze this number sequence and identify the pattern.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-center text-lg font-mono">{dataPattern.join(" → ")} → ?</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">What's the next number in the sequence?</p>
          <div className="grid grid-cols-2 gap-2">
            {[128, 96, 72, 100].map((option, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => {
                  const isCorrect = option === 128
                  const score = isCorrect ? 92 : 50
                  const domainScores = {
                    "Data Science": isCorrect ? 16 : 6,
                    "AI/ML": isCorrect ? 8 : 3,
                  }
                  recordGameScore("data-detective", score, domainScores)
                }}
              >
                {option} GB
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderWebBuilder = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          Web Builder Sprint
        </CardTitle>
        <CardDescription>Choose the best CSS layout approach for a responsive navigation bar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            You need to create a navigation bar that works on both desktop and mobile devices. Which CSS approach would
            be most effective?
          </p>
        </div>
        <div className="space-y-2">
          {[
            "Flexbox with responsive breakpoints",
            "CSS Grid with fixed columns",
            "Float-based layout with clearfix",
            "Absolute positioning with fixed widths",
          ].map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full text-left justify-start bg-transparent"
              onClick={() => {
                const isCorrect = index === 0
                const score = isCorrect ? 87 : 45
                const domainScores = {
                  "Web Development": isCorrect ? 15 : 5,
                  "Software Development": isCorrect ? 8 : 3,
                }
                recordGameScore("web-builder", score, domainScores)
              }}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const renderCareerSim = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Career Simulator
        </CardTitle>
        <CardDescription>You're starting your tech career. Which specialization interests you most?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {careerChoices.map((choice, index) => (
          <Card key={index} className="border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
            <CardContent className="p-4">
              <Button
                variant="outline"
                className="w-full text-left justify-start h-auto p-4 bg-transparent"
                onClick={() => {
                  const newChoices = careerChoices.map((c, i) => ({
                    ...c,
                    selected: i === index,
                  }))
                  setCareerChoices(newChoices)

                  const domainScores = {
                    [choice.title]: 15,
                    "Career Planning": 10,
                  }
                  recordGameScore("career-sim", 80, domainScores)
                }}
              >
                <div>
                  <div className="font-semibold text-base mb-1">{choice.title}</div>
                  <div className="text-sm text-gray-600">{choice.description}</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )

  const renderAnalysis = () => {
    if (isAnalyzing) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Analyzing Your Results</h3>
              <p className="text-gray-600">Processing your quiz answers and game performance...</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (!analysisResult) return null

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-8 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Career Analysis</h2>
            <p className="text-gray-600">Based on your assessment results</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Recommended Career Path</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{analysisResult.recommendedField}</h3>
                <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                  {analysisResult.confidence}% Match
                </Badge>
              </div>
              <p className="text-gray-700 leading-relaxed">{analysisResult.explanation}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Learning Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.roadmap.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Recommended Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.resources.map((resource, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700">{resource}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {analysisResult.skillGaps && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Skill Gap Analysis & Course Recommendations</CardTitle>
                <CardDescription>Areas for improvement with personalized course suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysisResult.skillGaps.map((gap, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{gap.skill}</h4>
                      <Badge
                        variant={
                          gap.priority === "High" ? "destructive" : gap.priority === "Medium" ? "default" : "secondary"
                        }
                      >
                        {gap.priority} Priority
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Current Level</span>
                        <span>{gap.current}%</span>
                      </div>
                      <Progress value={gap.current} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Target Level</span>
                        <span>{gap.target}%</span>
                      </div>
                      <Progress value={gap.target} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800">Recommended Courses:</h5>
                      {gap.courses.map((course, courseIndex) => (
                        <Card key={courseIndex} className="bg-blue-50 border-blue-200">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h6 className="font-medium text-blue-900">{course.title}</h6>
                                <p className="text-sm text-blue-700">by {course.provider}</p>
                                <div className="flex gap-4 mt-1">
                                  <span className="text-xs text-blue-600">⏱️ {course.duration}</span>
                                  <span className="text-xs text-blue-600">📊 {course.level}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-300 bg-transparent"
                              >
                                View Course
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setCurrentState("tracker")}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Start Your Journey
            </Button>
            <Button variant="outline" onClick={() => setCurrentState("internships")}>
              Find Internships
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderNavigation = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-gray-900">SkillSync</span>
          </div>

          <div className="flex items-center gap-1">
            {["roadmap", "tracker", "internships"].map((state) => (
              <Button
                key={state}
                variant={currentState === state ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentState(state as AppState)}
                className="capitalize"
              >
                {state === "roadmap" && <Target className="w-4 h-4 mr-1" />}
                {state === "tracker" && <Trophy className="w-4 h-4 mr-1" />}
                {state === "internships" && <Zap className="w-4 h-4 mr-1" />}
                {state.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {currentState !== "welcome" &&
        currentState !== "quiz" &&
        currentState !== "games" &&
        currentState !== "analysis" &&
        renderNavigation()}

      {currentState === "welcome" && renderWelcome()}
      {currentState === "quiz" && renderQuiz()}
      {currentState === "games" && renderGames()}
      {currentState === "analysis" && renderAnalysis()}
      {currentState === "roadmap" && (
        <div className="p-4">
          <div className="max-w-4xl mx-auto pt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Career Journey</h2>
              <p className="text-gray-600">Navigate your path to success with our interactive roadmap</p>
            </div>

            {/* Career Path Selection */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["AI/ML Engineer", "Web Developer", "Data Scientist"].map((career) => null)}
              </div>
            </div>

            {/* Interactive Roadmap */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="relative">
                {/* Vertical Path Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-400 to-pink-600 rounded-full"></div>

                {/* Milestones */}
                <div className="space-y-8">
                  {/* Phase 1: Foundations */}
                  <div className="relative flex items-start">
                    <div className="relative z-10 w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div className="ml-6 flex-1">
                      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 1: Foundations</h3>
                        <p className="text-gray-600 mb-3">Master the core programming languages and concepts</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {["Python", "Java", "C++", "Data Structures", "Algorithms", "Git"].map((skill) => (
                            <div
                              key={skill}
                              className="bg-white px-3 py-2 rounded-md text-sm font-medium text-gray-700 border border-pink-100"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 text-pink-600 border-pink-300 hover:bg-pink-50 bg-transparent"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: Core Technologies */}
                  <div className="relative flex items-start">
                    <div className="relative z-10 w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg opacity-60">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div className="ml-6 flex-1">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Phase 2: Core Technologies</h3>
                        <p className="text-gray-500 mb-3">Learn frameworks and tools for your chosen path</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {["React", "Node.js", "TensorFlow", "MongoDB", "AWS", "Docker"].map((skill) => (
                            <div
                              key={skill}
                              className="bg-white px-3 py-2 rounded-md text-sm font-medium text-gray-500 border border-gray-200"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 bg-transparent" disabled>
                          Locked
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Phase 3: Specialization & Projects */}
                  <div className="relative flex items-start">
                    <div className="relative z-10 w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-gray-600 font-bold">3</span>
                    </div>
                    <div className="ml-6 flex-1">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Phase 3: Specialization & Projects</h3>
                        <p className="text-gray-500 mb-3">Build portfolio projects and gain expertise</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {[
                            "Portfolio",
                            "Capstone",
                            "Open Source",
                            "Internship",
                            "Certification",
                            "Interview Prep",
                          ].map((skill) => (
                            <div
                              key={skill}
                              className="bg-white px-3 py-2 rounded-md text-sm font-medium text-gray-500 border border-gray-200"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 bg-transparent" disabled>
                          Locked
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Position Indicator */}
                <div className="absolute left-4 top-4 w-8 h-8 bg-white border-4 border-pink-500 rounded-full shadow-lg animate-pulse">
                  <div className="w-full h-full bg-pink-500 rounded-full"></div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-pink-50 rounded-lg p-4 text-center border border-pink-200">
                  <div className="text-2xl font-bold text-pink-600">25%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
                <div className="bg-pink-50 rounded-lg p-4 text-center border border-pink-200">
                  <div className="text-2xl font-bold text-pink-600">3/12</div>
                  <div className="text-sm text-gray-600">Skills Mastered</div>
                </div>
                <div className="bg-pink-50 rounded-lg p-4 text-center border border-pink-200">
                  <div className="text-2xl font-bold text-pink-600">Phase 1</div>
                  <div className="text-sm text-gray-600">Current Level</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {currentState === "tracker" && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-6xl mx-auto p-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">🗺️ Your Career Journey</h2>
              <p className="text-gray-600">Track your progress like a GPS navigation system</p>
            </div>

            {/* GPS-Style Progress Map */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Current Location</h3>
                    <p className="text-gray-600">Beginner Developer</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">25%</div>
                  <div className="text-sm text-gray-500">Journey Complete</div>
                </div>
              </div>

              {/* Road Progress */}
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200"></div>
                <div className="absolute left-6 top-0 w-1 bg-blue-600 h-1/4"></div>

                {/* Milestones */}
                <div className="space-y-8">
                  {[
                    { title: "HTML & CSS Basics", status: "completed", icon: "✅", week: "Week 1" },
                    { title: "JavaScript Fundamentals", status: "current", icon: "🎯", week: "Week 2" },
                    { title: "React Components", status: "upcoming", icon: "⏳", week: "Week 3" },
                    { title: "Backend APIs", status: "upcoming", icon: "⏳", week: "Week 4" },
                    { title: "Full Stack Project", status: "upcoming", icon: "⏳", week: "Week 5" },
                  ].map((milestone, index) => (
                    <div key={index} className="flex items-center gap-4 relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 ${
                          milestone.status === "completed"
                            ? "bg-green-100 border-4 border-green-500"
                            : milestone.status === "current"
                              ? "bg-blue-100 border-4 border-blue-500 animate-pulse"
                              : "bg-gray-100 border-4 border-gray-300"
                        }`}
                      >
                        {milestone.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-semibold ${
                              milestone.status === "completed"
                                ? "text-green-700"
                                : milestone.status === "current"
                                  ? "text-blue-700"
                                  : "text-gray-500"
                            }`}
                          >
                            {milestone.title}
                          </h4>
                          <Badge variant={milestone.status === "completed" ? "default" : "outline"}>
                            {milestone.week}
                          </Badge>
                        </div>
                        {milestone.status === "current" && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">75% Complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Challenges & Projects */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* DSA Challenges */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">DSA Weekly Challenges</h3>
                      <p className="text-sm text-gray-600">5 beginner-friendly problems</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { title: "Two Sum Problem", difficulty: "Easy", completed: true },
                      { title: "Reverse String", difficulty: "Easy", completed: true },
                      { title: "Valid Parentheses", difficulty: "Easy", completed: false },
                      { title: "Merge Arrays", difficulty: "Medium", completed: false },
                      { title: "Binary Search", difficulty: "Medium", completed: false },
                    ].map((challenge, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                              challenge.completed ? "bg-green-500 text-white" : "bg-gray-200"
                            }`}
                          >
                            {challenge.completed ? "✓" : index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{challenge.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {challenge.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" variant={challenge.completed ? "outline" : "default"}>
                          {challenge.completed ? "Review" : "Solve"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mini Projects */}
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Weekly Mini Project</h3>
                      <p className="text-sm text-gray-600">Portfolio builder projects</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Personal Portfolio Website</h4>
                        <Badge className="bg-purple-600">Week 2</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Build a responsive portfolio website using HTML, CSS, and JavaScript
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 w-32">
                            <div className="bg-purple-600 h-2 rounded-full w-1/2"></div>
                          </div>
                          <span className="text-sm text-gray-600">50%</span>
                        </div>
                        <Button size="sm">Continue</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {["Todo App", "Weather Widget", "Calculator", "Quiz Game"].map((project, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border text-center">
                          <p className="font-medium text-sm">{project}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            Week {index + 3}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress Pins */}
            <Card className="mt-6 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">📌 Weekly Progress Pins</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { week: "Week 1", achievement: "Completed HTML/CSS Basics", points: 150, date: "Jan 15" },
                    { week: "Week 2", achievement: "JavaScript Functions Mastered", points: 200, date: "Jan 22" },
                    { week: "Week 3", achievement: "In Progress...", points: 75, date: "Jan 29", current: true },
                  ].map((pin, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        pin.current ? "bg-blue-100 border-blue-300" : "bg-white border-green-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={pin.current ? "default" : "outline"}>{pin.week}</Badge>
                        <span className="text-sm text-gray-500">{pin.date}</span>
                      </div>
                      <p className="font-medium text-sm mb-2">{pin.achievement}</p>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold">{pin.points} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {currentState === "internships" && (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-4">
          <div className="max-w-md mx-auto pt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover Indian Internships</h2>
              <p className="text-sm text-gray-600 mb-3">🇮🇳 Exclusively Indian companies • INR stipends only</p>
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                <span>❤️ {likedInternships.length} Liked</span>
                <span>
                  👀 {currentInternshipIndex + 1}/{internshipOpportunities.length}
                </span>
              </div>
            </div>

            <div className="relative h-[600px] mb-8">
              {currentInternshipIndex < internshipOpportunities.length ? (
                <div className="relative w-full h-full">
                  {/* Current card */}
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col">
                    {(() => {
                      const internship = internshipOpportunities[currentInternshipIndex]
                      const fitScore = calculateFitScore(
                        internship,
                        gameScores.codeMatch > 0 ? ["JavaScript", "React", "Python"] : [],
                      )

                      return (
                        <>
                          {/* Fit Score Badge */}
                          <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                            <div className="text-center">
                              <div className="text-white font-bold text-lg">{fitScore}%</div>
                              <div className="text-pink-100 text-xs">FIT</div>
                            </div>
                          </div>

                          {/* Company & Role */}
                          <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">{internship.role}</h3>
                            <p className="text-xl text-pink-600 font-semibold">{internship.company}</p>
                          </div>

                          {/* Key Details with Indian-specific formatting */}
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                <span className="text-pink-600">💰</span>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900">{internship.stipend}</span>
                                <div className="text-xs text-green-600 font-medium">✓ Verified INR Stipend</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                <span className="text-pink-600">📍</span>
                              </div>
                              <div>
                                <span className="text-gray-700">{internship.location}</span>
                                <div className="text-xs text-green-600 font-medium">✓ Indian Location</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                <span className="text-pink-600">⏱️</span>
                              </div>
                              <span className="text-gray-700">{internship.duration}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600">🏢</span>
                              </div>
                              <div>
                                <span className="text-gray-700 text-sm">Verified Indian Company</span>
                                <div className="text-xs text-gray-500">Source: Company Career Page</div>
                              </div>
                            </div>
                          </div>

                          {/* Skills Required */}
                          <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Skills Required</h4>
                            <div className="flex flex-wrap gap-2">
                              {internship.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="flex-1">
                            <p className="text-gray-600 leading-relaxed">{internship.description}</p>
                          </div>

                          {/* Swipe Instructions */}
                          <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 mb-4">
                              ← Swipe left to pass • Swipe right to like →<br />↑ Swipe up for details
                            </p>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Next card preview */}
                  {currentInternshipIndex + 1 < internshipOpportunities.length && (
                    <div className="absolute inset-0 bg-gray-50 rounded-2xl shadow-lg -z-10 transform scale-95 translate-y-2" />
                  )}
                </div>
              ) : (
                /* All cards viewed */
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center h-full flex flex-col justify-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">All Done!</h3>
                  <p className="text-gray-600 mb-6">You've viewed all available internships.</p>
                  <Button
                    onClick={() => {
                      setCurrentInternshipIndex(0)
                      setPassedInternships([])
                    }}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    Start Over
                  </Button>
                </div>
              )}
            </div>

            {currentInternshipIndex < internshipOpportunities.length && (
              <div className="flex justify-center gap-6 mb-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSwipeLeft}
                  className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 bg-transparent"
                >
                  <span className="text-2xl">✕</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSwipeUp(internshipOpportunities[currentInternshipIndex])}
                  className="w-16 h-16 rounded-full border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                >
                  <span className="text-2xl">ℹ️</span>
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleSwipeRight(internshipOpportunities[currentInternshipIndex])}
                  className="w-16 h-16 rounded-full bg-pink-600 hover:bg-pink-700"
                >
                  <span className="text-2xl text-white">❤️</span>
                </Button>
              </div>
            )}

            {likedInternships.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ❤️ Liked Internships ({likedInternships.length})
                </h3>
                <div className="space-y-3">
                  {likedInternships.map((internship) => (
                    <div key={internship.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{internship.role}</p>
                        <p className="text-sm text-gray-600">
                          {internship.company} • {internship.stipend} • 🇮🇳
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => window.open(internship.applyUrl, "_blank")}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {showInternshipDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{showInternshipDetails.role}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowInternshipDetails(null)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Company</h4>
                    <p className="text-gray-700">{showInternshipDetails.company}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{showInternshipDetails.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {showInternshipDetails.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Skills Needed</h4>
                    <div className="flex flex-wrap gap-2">
                      {showInternshipDetails.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSwipeLeft()
                      setShowInternshipDetails(null)
                    }}
                    className="flex-1"
                  >
                    Pass
                  </Button>
                  <Button
                    onClick={() => {
                      handleSwipeRight(showInternshipDetails)
                      setShowInternshipDetails(null)
                    }}
                    className="flex-1 bg-pink-600 hover:bg-pink-700"
                  >
                    Like ❤️
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <GrewtChatbot />
    </div>
  )
}
