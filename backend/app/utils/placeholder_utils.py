import re

def standardize_placeholders(text: str) -> str:
    """
    Detects and replaces specific identifier patterns with standardized placeholders.
    
    Patterns covered:
    - VMware IDs (VMW12345)
    - Email IDs (john.doe@company.com)
    - Staff/Employee IDs (EMP56789)
    - Policy IDs (POL123456)
    - Generic User IDs (often found in SQL as 'user_id' or 'uid')
    """
    if not text:
        return ""

    # 1. VMware IDs
    text = re.sub(r'\bVMW\d+\b', '<PASTE_VMWARE_ID>', text, flags=re.IGNORECASE)

    # 2. Email IDs
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    text = re.sub(email_pattern, '<PASTE_EMAIL_ID>', text)

    # 3. Staff/Employee IDs
    text = re.sub(r'\bEMP\d+\b', '<PASTE_STAFF_ID>', text, flags=re.IGNORECASE)

    # 4. Policy IDs
    text = re.sub(r'\bPOL\d+\b', '<PASTE_POLICY_ID>', text, flags=re.IGNORECASE)
    
    # 5. Generic Alphanumeric User IDs (Example: jdoe123 inside quotes or after equals)
    # This is a bit more aggressive, usually needed for SQL templates
    text = re.sub(r"(?<=['\"=])\b[a-z]{1,2}[a-z0-9]{3,8}\b(?=['\" \n;])", '<PASTE_USER_ID>', text)

    return text

def apply_placeholders_to_list(items: list[str]) -> list[str]:
    """Applies placeholder standardization to a list of strings."""
    return [standardize_placeholders(item) for item in items]