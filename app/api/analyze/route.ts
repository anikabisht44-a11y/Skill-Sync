import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

interface AnalysisRequest {
  quizAnswers: Array<{
    questionId: number
    answer: string
    domainScores: Record<string, number>
  }>
  gameScores: Array<{
    gameId: string
    score: number
    domainScores: Record<string, number>
  }>
  totalDomainScores: Record<string, number>
}

interface AnalysisResponse {
  recommendedField: string
  confidence: number
  explanation: string
  roadmap: string[]
  resources: string[]
  internshipReadiness: number
}

const DOMAIN_INFO = {
  SDE: {
    title: "Software Development Engineer",
    roadmap: [
      "Master Data Structures & Algorithms",
      "Learn System Design Basics",
      "Build 3 Full-Stack Projects",
      "Practice Coding Interviews",
    ],
    resources: [
      "FreeCodeCamp - Full Stack Development",
      "LeetCode - Algorithm Practice",
      "System Design Primer (GitHub)",
      "CS50 - Computer Science Fundamentals",
    ],
  },
  "Data Analyst": {
    title: "Data Analyst",
    roadmap: [
      "Master SQL and Database Concepts",
      "Learn Python/R for Data Analysis",
      "Study Statistics and Data Visualization",
      "Build Portfolio with Real Datasets",
    ],
    resources: [
      "Kaggle Learn - Data Analysis",
      "Python for Data Analysis (Book)",
      "Tableau Public - Visualization",
      "Google Analytics Academy",
    ],
  },
  Cybersecurity: {
    title: "Cybersecurity Specialist",
    roadmap: [
      "Learn Network Security Fundamentals",
      "Study Ethical Hacking Techniques",
      "Get Security Certifications (CompTIA)",
      "Practice on Capture The Flag Platforms",
    ],
    resources: [
      "Cybrary - Free Security Training",
      "OWASP - Web Security",
      "TryHackMe - Hands-on Practice",
      "SANS Reading Room",
    ],
  },
  Cloud: {
    title: "Cloud Engineer",
    roadmap: [
      "Learn AWS/Azure/GCP Fundamentals",
      "Master Infrastructure as Code",
      "Study DevOps and CI/CD Pipelines",
      "Get Cloud Certifications",
    ],
    resources: [
      "AWS Free Tier - Hands-on Practice",
      "Terraform Documentation",
      "Docker and Kubernetes Tutorials",
      "Cloud Guru - Certification Prep",
    ],
  },
  Tester: {
    title: "Quality Assurance Engineer",
    roadmap: [
      "Learn Manual Testing Fundamentals",
      "Master Test Automation Tools",
      "Study API and Performance Testing",
      "Build Testing Framework Projects",
    ],
    resources: [
      "Selenium WebDriver Documentation",
      "Postman API Testing",
      "JMeter Performance Testing",
      "TestNG/JUnit Frameworks",
    ],
  },
  "Product Manager": {
    title: "Product Manager",
    roadmap: [
      "Learn Product Strategy and Roadmapping",
      "Study User Research and Analytics",
      "Master Agile and Scrum Methodologies",
      "Build Product Case Studies",
    ],
    resources: [
      "Product School - PM Courses",
      "Google Analytics Certification",
      "Figma - Design Collaboration",
      "Mixpanel - Product Analytics",
    ],
  },
}

export async function POST(request: NextRequest) {
  try {
    const data: AnalysisRequest = await request.json()

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      // Fallback analysis based on highest domain score
      const topDomain = Object.entries(data.totalDomainScores).sort(([, a], [, b]) => b - a)[0][0]

      const domainInfo = DOMAIN_INFO[topDomain as keyof typeof DOMAIN_INFO]

      return NextResponse.json({
        recommendedField: topDomain,
        confidence: 75,
        explanation: `Based on your quiz answers and game performance, you show strong alignment with ${domainInfo.title}. Your responses indicate good problem-solving skills and interest in this domain.`,
        roadmap: domainInfo.roadmap,
        resources: domainInfo.resources,
        internshipReadiness: Math.min(
          Math.max(Object.values(data.totalDomainScores).reduce((a, b) => a + b, 0) * 2, 40),
          95,
        ),
      })
    }

    // Use Gemini API for analysis
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
    Analyze this computer science student's career assessment data and recommend the best-fit field:

    Quiz Answers:
    ${data.quizAnswers.map((q) => `Q${q.questionId}: ${q.answer}`).join("\n")}

    Game Performance Scores:
    ${data.gameScores.map((g) => `${g.gameId}: ${g.score}/100`).join("\n")}

    Domain Scores:
    ${Object.entries(data.totalDomainScores)
      .map(([domain, score]) => `${domain}: ${score}`)
      .join("\n")}

    Available CS Fields: Software Development Engineer, Data Analyst, Cybersecurity Specialist, Cloud Engineer, Quality Assurance Engineer, Product Manager

    Please respond with a JSON object containing:
    - recommendedField: The best-fit field name (exact match from available fields)
    - confidence: Confidence percentage (0-100)
    - explanation: 2-3 sentence explanation of why this field fits
    - internshipReadiness: Score 0-100 for internship readiness

    Focus on the field with highest domain score but consider overall profile.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      const analysis = JSON.parse(text)
      const domainInfo = DOMAIN_INFO[analysis.recommendedField as keyof typeof DOMAIN_INFO]

      return NextResponse.json({
        ...analysis,
        roadmap: domainInfo?.roadmap || [],
        resources: domainInfo?.resources || [],
      })
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const topDomain = Object.entries(data.totalDomainScores).sort(([, a], [, b]) => b - a)[0][0]

      const domainInfo = DOMAIN_INFO[topDomain as keyof typeof DOMAIN_INFO]

      return NextResponse.json({
        recommendedField: topDomain,
        confidence: 80,
        explanation: `Based on comprehensive analysis of your responses, ${domainInfo.title} appears to be your best career match. Your skills and interests align well with this field.`,
        roadmap: domainInfo.roadmap,
        resources: domainInfo.resources,
        internshipReadiness: Math.min(
          Math.max(Object.values(data.totalDomainScores).reduce((a, b) => a + b, 0) * 2, 40),
          95,
        ),
      })
    }
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze career data" }, { status: 500 })
  }
}
