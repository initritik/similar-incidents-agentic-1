import logging
import os

from openai import OpenAI

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating embeddings using OpenAI."""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable is not set. "
                "Please configure it in .env file."
            )
        self.client = OpenAI(api_key=api_key)
        self.model = "text-embedding-3-small"

    def generate_embedding(self, text: str) -> list[float]:
        """
        Generate embedding for text using OpenAI.

        Args:
            text: The text to embed.

        Returns:
            A list of floats representing the embedding vector.

        Raises:
            ValueError: If text is empty.
            Exception: If OpenAI API call fails.
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty.")

        try:
            logger.debug(f"Generating embedding for text: {text[:100]}...")
            response = self.client.embeddings.create(
                input=text,
                model=self.model,
            )
            embedding = response.data[0].embedding
            logger.debug(f"Embedding generated successfully. Vector size: {len(embedding)}")
            return embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {str(e)}")
            raise
