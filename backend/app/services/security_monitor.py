"""Application-level security event logging and failed attempt monitoring.

Provides:
- Safe structured security event logging without exposing sensitive tokens.
- In-memory repeated authentication failure tracking by IP.
- Cross-user access denial auditing.
"""
from collections import defaultdict
import logging
import threading
import time
from typing import Dict

logger = logging.getLogger("cloudresumeai.security")

# Maximum failed attempts within observation window before alerting
ALERT_FAILURE_THRESHOLD = 5
FAILURE_WINDOW_SECONDS = 300  # 5 minutes


class SecurityMonitor:
    """Tracks security events and detects repeated authentication failures."""

    _lock = threading.Lock()
    # Maps client_ip -> list of failure timestamps
    _failed_attempts: Dict[str, list] = defaultdict(list)

    @classmethod
    def reset(cls) -> None:
        """Reset in-memory counters (useful for unit testing)."""
        with cls._lock:
            cls._failed_attempts.clear()

    @classmethod
    def record_auth_failure(
        cls,
        reason: str,
        client_ip: str = "unknown",
        endpoint: str = "-",
    ) -> int:
        """Log authentication failure safely and track failure frequency by IP.

        Never records Authorization header, token payload, or user secrets.
        Returns the current failure count within the observation window.
        """
        now = time.time()
        with cls._lock:
            # Purge older attempts outside the window
            attempts = [
                t for t in cls._failed_attempts[client_ip]
                if now - t < FAILURE_WINDOW_SECONDS
            ]
            attempts.append(now)
            cls._failed_attempts[client_ip] = attempts
            count = len(attempts)

        # Log safe audit event
        logger.warning(
            "[SECURITY] event=AUTH_FAILURE reason=\"%s\" ip=%s endpoint=%s",
            reason,
            client_ip,
            endpoint,
        )

        # Trigger security alert if threshold exceeded
        if count >= ALERT_FAILURE_THRESHOLD:
            logger.error(
                "[SECURITY_ALERT] event=REPEATED_AUTH_FAILURES ip=%s count=%d "
                "window_sec=%d message=\"Multiple auth failures detected\"",
                client_ip,
                count,
                FAILURE_WINDOW_SECONDS,
            )

        return count

    @classmethod
    def record_auth_success(cls, client_ip: str) -> None:
        """Clear failed attempt history on successful authentication."""
        with cls._lock:
            if client_ip in cls._failed_attempts:
                cls._failed_attempts.pop(client_ip, None)

    @classmethod
    def record_cross_user_denial(
        cls,
        user_id: str,
        target_resource: str,
        endpoint: str,
        client_ip: str = "unknown",
    ) -> None:
        """Audit access attempt by user to an unowned resource."""
        logger.warning(
            "[SECURITY] event=CROSS_USER_DENIED requester_id=%s "
            "target=\"%s\" endpoint=%s ip=%s",
            user_id,
            target_resource,
            endpoint,
            client_ip,
        )
