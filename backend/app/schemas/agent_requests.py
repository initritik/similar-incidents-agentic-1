from pydantic import BaseModel, Field


class Agent1ValidationRequest(BaseModel):
    incident_number: str = Field(examples=["INC000001"])

