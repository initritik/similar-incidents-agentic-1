from pydantic import BaseModel


class Datafix(BaseModel):
    datafix_id: str
    incident_number: str
    description: str
    datafix_code: str

