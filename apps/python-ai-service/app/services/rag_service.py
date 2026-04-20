import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from app.core.config import settings

QA_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are a helpful sales assistant for a store.
Use the product catalog below to answer the customer's question.
Be concise, friendly, and accurate. If the product is not in the catalog, say so politely.

Catalog:
{context}

Customer: {question}
Assistant:""",
)


class RagService:
    def __init__(self) -> None:
        self._embeddings = OpenAIEmbeddings(api_key=settings.openai_api_key)
        self._llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, api_key=settings.openai_api_key)
        self._stores: dict[str, Chroma] = {}

    def _store_path(self, merchant_id: str) -> str:
        return os.path.join(settings.chroma_persist_dir, merchant_id)

    def _get_store(self, merchant_id: str) -> Chroma:
        if merchant_id not in self._stores:
            self._stores[merchant_id] = Chroma(
                persist_directory=self._store_path(merchant_id),
                embedding_function=self._embeddings,
                collection_name=f"catalog_{merchant_id}",
            )
        return self._stores[merchant_id]

    async def index_products(self, merchant_id: str, products: list[dict]) -> int:
        store = self._get_store(merchant_id)
        docs = []
        for p in products:
            text = (
                f"Product: {p['name']}\n"
                f"Category: {p.get('category', 'General')}\n"
                f"Price: ${p['price']}\n"
                f"Description: {p.get('description', '')}\n"
                f"Stock: {p.get('stock', 0)} units"
            )
            docs.append(
                Document(
                    page_content=text,
                    metadata={
                        "merchant_id": merchant_id,
                        "product_id": p.get("id", ""),
                        "name": p["name"],
                        "price": str(p["price"]),
                    },
                )
            )
        store.add_documents(docs)
        return len(docs)

    async def answer(self, merchant_id: str, question: str) -> str:
        store = self._get_store(merchant_id)
        retriever = store.as_retriever(search_kwargs={"k": 5})

        chain = RetrievalQA.from_chain_type(
            llm=self._llm,
            retriever=retriever,
            chain_type_kwargs={"prompt": QA_PROMPT},
        )
        result = await chain.ainvoke({"query": question})
        return result["result"]


rag_service = RagService()
