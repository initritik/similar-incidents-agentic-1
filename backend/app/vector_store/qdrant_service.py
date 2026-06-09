import logging
import os
from urllib.parse import urlparse

from qdrant_client import QdrantClient
from qdrant_client.http import models

logger = logging.getLogger(__name__)


class QdrantService:
    """Service for interacting with Qdrant Cloud."""

    def __init__(self):
        url = os.getenv("QDRANT_URL")
        api_key = os.getenv("QDRANT_API_KEY")
        collection_name = os.getenv("QDRANT_COLLECTION_NAME", "servicenow_incidents")

        if not url or not api_key:
            raise ValueError(
                "QDRANT_URL and QDRANT_API_KEY environment variables must be set. "
                "Please configure them in .env file."
            )

        parsed_url = urlparse(url)
        if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
            raise ValueError(
                f"Invalid QDRANT_URL '{url}'. Use a full HTTP(S) URL, for example "
                "'https://your-cluster.qdrant.io' for Qdrant Cloud or "
                "'http://localhost:6333' for a local Qdrant instance."
            )

        if parsed_url.hostname in {"localhost", "127.0.0.1"}:
            logger.warning(
                "QDRANT_URL points to a local Qdrant instance (%s). "
                "Make sure Qdrant is actually running on that host and port.",
                url,
            )

        self.client = QdrantClient(url=url, api_key=api_key)
        self.collection_name = collection_name
        logger.info(f"QdrantService initialized with collection: {collection_name}")

    def collection_exists(self) -> bool:
        """Check if collection exists in Qdrant."""
        try:
            self.client.get_collection(self.collection_name)
            logger.debug(f"Collection {self.collection_name} exists")
            return True
        except Exception:
            logger.debug(f"Collection {self.collection_name} does not exist")
            return False

    def create_collection(self, vector_size: int = 1536) -> None:
        """
        Create collection if it does not exist.

        Args:
            vector_size: Dimension of the embedding vectors (default: 1536 for text-embedding-3-small).
        """
        if self.collection_exists():
            logger.info(f"Collection {self.collection_name} already exists. Skipping creation.")
            return

        try:
            logger.info(
                f"Creating collection {self.collection_name} with vector size {vector_size}"
            )
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=vector_size,
                    distance=models.Distance.COSINE,
                ),
            )
            logger.info(f"Collection {self.collection_name} created successfully")
        except Exception as e:
            logger.error(f"Failed to create collection: {str(e)}")
            raise

    def upsert_batch(
        self,
        points: list[models.PointStruct],
    ) -> None:
        """
        Upsert a batch of points into the collection.

        Args:
            points: List of PointStruct objects to upsert.

        Raises:
            Exception: If upsert operation fails.
        """
        if not points:
            logger.warning("Empty batch. Skipping upsert.")
            return

        try:
            logger.debug(f"Upserting {len(points)} points into {self.collection_name}")
            self.client.upsert(
                collection_name=self.collection_name,
                points=points,
            )
            logger.info(f"Successfully upserted {len(points)} points")
        except Exception as e:
            logger.error(f"Failed to upsert batch: {str(e)}")
            raise

    def search_similar_incidents(
        self,
        query_embedding: list[float],
        limit: int = 5,
        score_threshold: float = 0.3,
    ) -> list[models.ScoredPoint]:
        """
        Search for similar incidents based on embedding vector.

        Args:
            query_embedding: The embedding vector to search with.
            limit: Maximum number of results to return.
            score_threshold: Minimum similarity score (0.3 = 30%).

        Returns:
            List of ScoredPoint objects with similar incidents.

        Raises:
            Exception: If search operation fails.
        """
        try:
            logger.debug(
                f"Searching similar incidents with threshold {score_threshold}"
            )

            # Newer qdrant-client versions expose vector search through query_points.
            # Older versions used search(). Keep both so the app works across versions.
            if hasattr(self.client, "query_points"):
                results = self.client.query_points(
                    collection_name=self.collection_name,
                    query=query_embedding,
                    limit=limit,
                    score_threshold=score_threshold,
                    with_payload=True,
                    with_vectors=False,
                )
                results = getattr(results, "points", results)
            else:
                results = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_embedding,
                    limit=limit,
                    score_threshold=score_threshold,
                )

            logger.info(f"Found {len(results)} similar incidents")
            return results
        except Exception as e:
            logger.error(f"Failed to search similar incidents: {str(e)}")
            raise

    def get_incident(self, point_id: int) -> models.PointStruct | None:
        """
        Retrieve a specific point (incident) by ID.

        Args:
            point_id: The ID of the point to retrieve.

        Returns:
            PointStruct object if found, None otherwise.
        """
        try:
            logger.debug(f"Retrieving point {point_id} from {self.collection_name}")
            point = self.client.retrieve(
                collection_name=self.collection_name,
                ids=[point_id],
            )
            if point:
                logger.debug(f"Point {point_id} retrieved successfully")
                return point[0]
            else:
                logger.debug(f"Point {point_id} not found")
                return None
        except Exception as e:
            logger.error(f"Failed to retrieve point: {str(e)}")
            raise

    def delete_points(self, point_ids: list[int]) -> None:
        """
        Delete points from the collection.

        Args:
            point_ids: List of point IDs to delete.
        """
        if not point_ids:
            logger.warning("Empty list of point IDs. Skipping deletion.")
            return

        try:
            logger.debug(f"Deleting {len(point_ids)} points from {self.collection_name}")
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.PointIdsList(
                    ids=point_ids,
                ),
            )
            logger.info(f"Successfully deleted {len(point_ids)} points")
        except Exception as e:
            logger.error(f"Failed to delete points: {str(e)}")
            raise
