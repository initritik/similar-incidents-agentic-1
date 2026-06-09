from pydantic import BaseModel, Field


class Agent1ValidationRequest(BaseModel):
    incident_number: str = Field(examples=["INC000001"])


class Agent4ResolutionCaptureRequest(BaseModel):
    incident_number: str = Field(examples=["INC000005"])
    provide_resolution: bool | None = Field(
        default=None,
        description="False means the user declined to provide a resolution.",
    )
    resolution_notes: str | None = None
    datafix_description: str | None = None
    datafix_code: str | None = None
