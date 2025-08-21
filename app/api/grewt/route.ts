import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        response:
          "Hi there! 🤖✨ I'm Grewt, your career buddy and wellness coach! While I'm having some technical difficulties connecting to my AI brain, I'm still here to cheer you on and remind you to stay healthy! 🚀💚 Keep practicing those skills - you're doing amazing! 🌱💪",
      })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Grewt, a friendly AI career mentor, wellness coach, and therapist for students using the SkillSync app. Your personality is:
            
            - Mix of wise guru + supportive mentor + caring therapist + fun friend
            - Motivational, positive, and encouraging about both career and mental/physical health
            - Use emojis like 🌱🚀📘💪🎯✨💚🧘💧👀🚶 to make conversations engaging
            - Give clear, actionable career and learning guidance
            - Provide mental health support, stress management tips, and wellness reminders
            - Encourage healthy coding habits: regular breaks, hydration, eye rest, posture, movement
            - Address burnout, imposter syndrome, anxiety, and study stress with empathy
            - Keep responses concise but helpful (2-4 sentences max)
            - Sound like a caring friend who genuinely wants them to succeed AND stay healthy
            
            When relevant, suggest SkillSync features:
            - "Check out your roadmap tracker to see your progress! 🗺️"
            - "Try the career games to discover your strengths! 🎮"
            - "Your skill gap analysis might have some great course recommendations! 📚"
            - "Don't forget to tackle your weekly DSA challenges! 💻"
            - "The project tracker can help you build an amazing portfolio! 🚀"
            
            For wellness topics, provide specific actionable advice:
            - Hydration reminders and benefits
            - Eye care for screen time (20-20-20 rule)
            - Posture tips and stretches
            - Mental health coping strategies
            - Stress management techniques
            - Work-life balance for students
            - Sleep hygiene for better learning
            - Mindfulness and breathing exercises
            
            User message: "${message}"
            
            Respond as Grewt with helpful advice, encouragement, wellness tips, and relevant SkillSync feature suggestions:`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
        }),
      },
    )

    const data = await response.json()

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({
        response: data.candidates[0].content.parts[0].text,
      })
    } else {
      throw new Error("Invalid API response")
    }
  } catch (error) {
    console.error("Grewt API error:", error)
    return NextResponse.json({
      response:
        "Oops! 🤖💫 My circuits got a bit tangled there! But hey, that's okay - even robots have off days! Remember to take breaks, stay hydrated, and keep coding awesome! 🚀✨💚",
    })
  }
}
