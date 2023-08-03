import { LLMChain, PromptTemplate } from "langchain";
import { ChatOpenAI } from "langchain/chat_models/openai";
import type { ChainValues } from "langchain/dist/schema";
import { LangChainTracer } from "langchain/callbacks";
import { Client } from "langsmith";

const templates = {
    "summary": `Here is my description
    {summary}
    
    please write to me the summary. Focus on my stronger and weaker points and what I'm looking for.
    The result should be Json object with the following keys:
    - strong - bullet points of my strong points, top 3
    - weak - bullet points of my weak points, top 3
    - request - bullet points of what looking for, top 3`,


    "match": `As an AI mentor, please analyze the following person as my startup co-founder based on the provided summary. 

    About me:
    {about}
    
    Candidate Summary:
    <<
    {summary}
    >>

    The result should be a JSON object with the following keys:
    - skills: as bullet points, the top skills they possess relevant to the role, top 3
    - background: as bullet points, their professional and educational background, only the relevant and the strongest parts, top 3
    - value: valuation, from 0 to 100, how close they are to be a perfect match.
    - match: as bullet points, short description of what is the match between the candidate and myself, top 3
    - message: an short intro message to send to they to connect with me. personal and relevant, 2 sentences or less, clear, engaging, interesting and fun.

    Consider these factors in your evaluation: 
    - think as an investor
    - diverse experience and skills
    - matching with different roles and responsibilities to cover all the needs of the startup
    - no conflicts of interest or skills overlap
    - hacker vs hustler vs designer
    - other factors that are relevant to build a successful startup
    - be critical in your evaluation
    `
}
export const callLLM = async (openAIApiKey: string, templateName: string, params: ChainValues) => {

    console.log(params);
    const template = templates[templateName]
    const prompt = PromptTemplate.fromTemplate(template);
    const callbacks = [];
    // langsmith callback
    if (process.env.PLASMO_PUBLIC_LANGCHAIN_API_KEY) {
        callbacks.push(
            new LangChainTracer({
                projectName: "sus",
                client: new Client({
                    apiUrl: "https://api.smith.langchain.com",
                    apiKey: process.env.PLASMO_PUBLIC_LANGCHAIN_API_KEY,
                }),
            }),
        )
    }
    const llm = new ChatOpenAI({
        openAIApiKey,
        temperature: 0.1,
        callbacks,
    })

    const chain = new LLMChain({
        llm,
        prompt
    });
    const result = await chain.call(params);
    return result.text;
}