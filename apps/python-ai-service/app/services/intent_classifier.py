from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from app.core.config import settings

INTENT_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are an intent classifier for a sales chatbot.
Classify the user message into exactly ONE of these intents:
- question   : asking about products, prices, availability, delivery
- order      : wants to place, modify, or cancel an order
- human      : requests a human agent or is angry/frustrated
- greeting   : hello, hi, thanks

Respond with ONLY the intent word, nothing else.""",
    ),
    ("human", "{message}"),
])


class IntentClassifier:
    def __init__(self) -> None:
        self._llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            api_key=settings.openai_api_key,
        )
        self._chain = INTENT_PROMPT | self._llm

    async def classify(self, message: str) -> str:
        result = await self._chain.ainvoke({"message": message})
        intent = result.content.strip().lower()
        if intent not in {"question", "order", "human", "greeting"}:
            return "question"
        return intent


intent_classifier = IntentClassifier()
