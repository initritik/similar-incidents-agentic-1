import ast
import logging
import re
from datetime import datetime
from pathlib import Path

from app.models import Incident

logger = logging.getLogger(__name__)


def _mock_data_file_path() -> Path:
    """Return the path to backend/app/mock_data/incidents.py."""
    return Path(__file__).resolve().parents[1] / "mock_data" / "incidents.py"


def _format_datetime_literal(value: datetime) -> str:
    """Format a datetime object as a Python datetime(...) literal."""
    value = value.replace(tzinfo=None)
    return (
        f"datetime({value.year}, {value.month}, {value.day}, "
        f"{value.hour}, {value.minute}, {value.second})"
    )


def _update_incident_segment(
    segment: str,
    *,
    resolution_notes: str,
    updated_date: datetime,
) -> str:
    """Update the state, resolution notes, and updated_date lines inside one Incident(...) block."""
    segment = re.sub(
        r"(?m)^(?P<indent>\s*)state=IncidentState\.[A-Z_]+(?P<comma>,)$",
        lambda m: f"{m.group('indent')}state=IncidentState.RESOLVED{m.group('comma')}",
        segment,
        count=1,
    )

    resolution_literal = repr(resolution_notes.strip())
    segment = re.sub(
        r"(?ms)^(?P<indent>\s*)resolution_notes=.*?(?P<comma>,\s*$)",
        lambda m: f"{m.group('indent')}resolution_notes={resolution_literal}{m.group('comma')}",
        segment,
        count=1,
    )

    segment = re.sub(
        r"(?m)^(?P<indent>\s*)updated_date=datetime\([^)]*\)(?P<comma>,)$",
        lambda m: f"{m.group('indent')}updated_date={_format_datetime_literal(updated_date)}{m.group('comma')}",
        segment,
        count=1,
    )

    return segment


def persist_incident_to_mock_source(incident: Incident, resolution_notes: str) -> None:
    """Persist the updated incident back into backend/app/mock_data/incidents.py.

    This keeps the mock source file in sync with the in-memory mutation so that
    a server restart or a fresh import still sees the new RESOLVED state and
    resolution notes.
    """
    source_path = _mock_data_file_path()

    try:
        source = source_path.read_text(encoding="utf-8")
    except OSError as exc:
        logger.warning("Unable to read mock incident source file %s: %s", source_path, exc)
        return

    try:
        module = ast.parse(source)
    except SyntaxError as exc:
        logger.warning("Unable to parse mock incident source file %s: %s", source_path, exc)
        return

    start_line = end_line = None
    for node in ast.walk(module):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Name)
            and node.func.id == "Incident"
        ):
            for kw in node.keywords:
                if kw.arg == "incident_number" and isinstance(kw.value, ast.Constant):
                    if kw.value.value == incident.incident_number:
                        start_line = node.lineno
                        end_line = node.end_lineno
                        break
        if start_line is not None:
            break

    if start_line is None or end_line is None:
        logger.warning(
            "Incident %s not found in mock source file %s; source file not updated.",
            incident.incident_number,
            source_path,
        )
        return

    lines = source.splitlines(keepends=True)
    segment = "".join(lines[start_line - 1 : end_line])
    updated_segment = _update_incident_segment(
        segment,
        resolution_notes=resolution_notes,
        updated_date=incident.updated_date,
    )

    if updated_segment == segment:
        logger.warning(
            "No source changes were applied for incident %s in %s.",
            incident.incident_number,
            source_path,
        )
        return

    lines[start_line - 1 : end_line] = [updated_segment]
    new_source = "".join(lines)

    try:
        source_path.write_text(new_source, encoding="utf-8")
        logger.info(
            "Persisted incident %s state and resolution notes to %s.",
            incident.incident_number,
            source_path,
        )
    except OSError as exc:
        logger.warning("Unable to write mock incident source file %s: %s", source_path, exc)