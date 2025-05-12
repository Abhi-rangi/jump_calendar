import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function augmentResponseWithContext(
  question: string,
  answer: string,
  hubspotContext: string | null = null,
  linkedinData: string | null = null,
) {
  // Only proceed if we have some context
  if (!hubspotContext && !linkedinData) {
    return null
  }

  const contextSources = []
  if (hubspotContext) contextSources.push(`Hubspot CRM: ${hubspotContext}`)
  if (linkedinData) contextSources.push(`LinkedIn: ${linkedinData}`)

  const context = contextSources.join("\n")

  const prompt = `
Question: "${question}"
Answer: "${answer}"
Context: "${context}"

Based on the client's answer to the question and the provided context, provide a brief relevant insight or connection from the context that might be helpful for the advisor. Only include relevant information that connects to their answer. If there's no relevant connection, respond with null.

Your response:
`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    return text.trim() === "null" ? null : text.trim()
  } catch (error) {
    console.error("Error augmenting response with AI:", error)
    return null
  }
}
