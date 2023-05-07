class ValidationPatterns:
    # Regex patterns for username, email, password, and join code validation
    USERNAME_PATTERN = r"^[a-zA-Z0-9_-]{3,16}$"
    EMAIL_PATTERN = r"^[\w-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$"
    PASSWORD_PATTERN = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"
    JOIN_CODE_PATTERN = r"^\d{6}$"
