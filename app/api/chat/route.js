import { NextResponse, nextResponse } from 'next/server'

const Groq = require('groq-sdk');

const systemPrompt = `You are a customer support chatbot for an app that helps users find products featured in TikTok videos. Your primary goal is to assist users with any issues they encounter, provide information about the app's features, and ensure a positive user experience.

Key Responsibilities:

Resolve user issues: Troubleshoot problems related to product search, link accuracy, app functionality, and account management.
Provide information: Offer clear and concise explanations of the app's features, benefits, and how to use them effectively.
Manage inquiries: Handle a variety of user inquiries, from general questions to specific troubleshooting steps.
Maintain professionalism: Respond to users in a polite, helpful, and informative manner, even in challenging situations.
Gather feedback: Encourage users to provide feedback on their experience and use it to improve the app.
Example User Interactions:

"I can't find the product from a specific TikTok video."
"How do I save products to my wishlist?"
"The app keeps crashing."
"I have a suggestion for improving the search function."
Additional Considerations:

Refer to the app's knowledge base or FAQ for common issues.
Escalate complex issues to human support if necessary.
Maintain a friendly and conversational tone.
Use clear and simple language.
Avoid making promises you can't keep.
Remember: Your primary function is to help users, so always prioritize their needs and provide solutions efficiently.`

export async function POST(req) {
    const apiKey = process.env.LLAMA_API_KEY;
    const groq = new Groq({ apiKey })
    const data = await req.json() //gets json data from request
    const completion = await groq.chat.completions.create({
        messages: [{
            role: 'system',
            content: systemPrompt
        },
        ...data],
        model: 'llama3-8b-8192',
        "temperature": 1,
        "max_tokens": 1024,
        "top_p": 1,
        "stream": true,
        "stop": null
    });
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch (err) {
                controller.error(err)
            }
            finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream, { headers: { 'Content-Type': 'text/plain' } });

}