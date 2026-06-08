import re


INCIDENT_NUMBER_PATTERN = re.compile(r"^INC\d{6}$")


def is_valid_incident_number(incident_number: str) -> bool:
    return bool(INCIDENT_NUMBER_PATTERN.fullmatch(incident_number))

