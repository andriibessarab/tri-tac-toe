class ValidationPatterns:
    # Regex patterns for username, email, and password validation
    USERNAME_PATTERN = r"^[a-zA-Z0-9_-]{3,16}$"
    EMAIL_PATTERN = r"^[\w-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$"
    PASSWORD_PATTERN = r"^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$"
