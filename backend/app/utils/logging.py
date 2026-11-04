"""Structured application logging, request correlation, and privacy filtering.

Provides:
- Request ID correlation via X-Request-ID.
- Latency and duration measurement.
- Sensitive data redaction (tokens, passwords, API keys).
- Idempotent log handler configuration preventing duplication.
"""
from datetime import datetime, timezone
import logging
import os
import re
import time
import uuid

from flask import g, has_request_context, request

# Regular expressions matching sensitive tokens, credentials, and API keys
SENSITIVE_PATTERNS = [
    (
        re.compile(r"Bearer\s+[A-Za-z0-9\-\._~+/]+=*", re.IGNORECASE),
        "Bearer [REDACTED]",
    ),
    (
        re.compile(
            r"(api[_-]?key[\"'\s:=]+)[\"']?[A-Za-z0-9_\-]{16,}[\"']?",
            re.IGNORECASE,
        ),
        r"\1[REDACTED]",
    ),
    (
        re.compile(
            r"(password[\"'\s:=]+)[\"']?[^\"'\s,]+[\"']?",
            re.IGNORECASE,
        ),
        r"\1[REDACTED]",
    ),
    (
        re.compile(r"AIza[0-9A-Za-z\-_]{35}"),
        "[REDACTED_GEMINI_KEY]",
    ),
    (
        re.compile(
            r"(secret[\"'\s:=]+)[\"']?[^\"'\s,]{8,}[\"']?",
            re.IGNORECASE,
        ),
        r"\1[REDACTED]",
    ),
    (
        re.compile(
            r"(access_token[\"'\s:=]+)[\"']?[^\"'\s,]+[\"']?",
            re.IGNORECASE,
        ),
        r"\1[REDACTED]",
    ),
]


class SensitiveDataFilter(logging.Filter):
    """Redacts sensitive credentials, tokens, and keys from all log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            msg = record.msg
            for pattern, replacement in SENSITIVE_PATTERNS:
                msg = pattern.sub(replacement, msg)
            record.msg = msg

        if record.args:
            if isinstance(record.args, dict):
                clean_args = {}
                for k, v in record.args.items():
                    if isinstance(v, str):
                        clean_v = v
                        for pattern, replacement in SENSITIVE_PATTERNS:
                            clean_v = pattern.sub(replacement, clean_v)
                        clean_args[k] = clean_v
                    else:
                        clean_args[k] = v
                record.args = clean_args
            elif isinstance(record.args, (list, tuple)):
                clean_list = []
                for item in record.args:
                    if isinstance(item, str):
                        clean_item = item
                        for pattern, replacement in SENSITIVE_PATTERNS:
                            clean_item = pattern.sub(replacement, clean_item)
                        clean_list.append(clean_item)
                    else:
                        clean_list.append(item)
                record.args = tuple(clean_list)

        return True


class StructuredFormatter(logging.Formatter):
    """Formats log records with ISO timestamps, level, and request context."""

    def format(self, record: logging.LogRecord) -> str:
        # Populate request context attributes if inside a Flask request
        if has_request_context():
            record.request_id = getattr(g, "request_id", "-")
            record.endpoint = request.path
            record.method = request.method
        else:
            record.request_id = getattr(record, "request_id", "-")
            record.endpoint = getattr(record, "endpoint", "-")
            record.method = getattr(record, "method", "-")

        # UTC timestamp
        record.utc_time = datetime.now(timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%S.%fZ"
        )
        return super().format(record)


def setup_logging(app) -> None:
    """Configure structured logging and request correlation on Flask app."""
    # Prevent duplicate setup if handlers already configured
    if getattr(app, "_logging_configured", False):
        return

    log_level_str = app.config.get(
        "LOG_LEVEL",
        os.getenv("LOG_LEVEL", "INFO")
    ).upper()
    log_level = getattr(logging, log_level_str, logging.INFO)

    # Format: [ISO_UTC] [LEVEL] [req_id=UUID] [module] message
    log_format = (
        "[%(utc_time)s] [%(levelname)s] [req=%(request_id)s] "
        "[%(name)s] %(message)s"
    )
    formatter = StructuredFormatter(log_format)
    privacy_filter = SensitiveDataFilter()

    # Configure root logger handler
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Only add handler if not already present
    has_stream_handler = any(
        isinstance(h, logging.StreamHandler) for h in root_logger.handlers
    )
    if not has_stream_handler:
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        handler.addFilter(privacy_filter)
        root_logger.addHandler(handler)
    else:
        for handler in root_logger.handlers:
            handler.setFormatter(formatter)
            handler.addFilter(privacy_filter)

    # Ensure app logger also adopts the privacy filter
    app.logger.setLevel(log_level)
    app.logger.addFilter(privacy_filter)

    # Request Lifecycle Hooks for Correlation & Latency Tracking
    @app.before_request
    def record_request_context():
        # Correlation ID from header or generate a new UUIDv4
        req_id = request.headers.get("X-Request-ID")
        if not req_id or not re.match(r"^[a-zA-Z0-9_\-]+$", req_id):
            req_id = f"req-{uuid.uuid4().hex[:12]}"
        g.request_id = req_id
        g.start_time = time.perf_counter()

    @app.after_request
    def record_response_context(response):
        # Invert request ID into response header
        req_id = getattr(g, "request_id", "-")
        response.headers["X-Request-ID"] = req_id

        # Calculate request execution duration
        start_time = getattr(g, "start_time", None)
        if start_time is not None:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            # Add or append to Server-Timing header
            existing_timing = response.headers.get("Server-Timing", "")
            app_timing = f"total;dur={duration_ms}"
            if existing_timing:
                response.headers["Server-Timing"] = (
                    f"{existing_timing}, {app_timing}"
                )
            else:
                response.headers["Server-Timing"] = app_timing

            # Skip noisy health check logging in normal operations
            if not request.path.startswith("/api/health"):
                app.logger.info(
                    "%s %s -> %s (%sms)",
                    request.method,
                    request.path,
                    response.status_code,
                    duration_ms,
                )

        return response

    app._logging_configured = True
