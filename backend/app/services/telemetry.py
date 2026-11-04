"""Azure Monitor and Application Insights OpenTelemetry telemetry service.

Safely initializes OpenTelemetry tracing and metrics when
APPLICATIONINSIGHTS_CONNECTION_STRING is provided. In local development
and testing without a connection string, monitoring remains disabled without
requiring Azure credentials or cloud access.
"""
import logging
import os

logger = logging.getLogger(__name__)


class TelemetryService:
    """Manages Azure Monitor OpenTelemetry initialization and status."""

    _is_configured: bool = False

    @classmethod
    def init_app(cls, app) -> bool:
        """Initialize Azure Monitor OpenTelemetry if configured."""
        if cls._is_configured:
            return True

        conn_str = (
            app.config.get("APPLICATIONINSIGHTS_CONNECTION_STRING")
            or os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING", "")
        )

        if not conn_str:
            logger.debug(
                "APPLICATIONINSIGHTS_CONNECTION_STRING not set; "
                "Application Insights telemetry is inactive."
            )
            return False

        try:
            from azure.monitor.opentelemetry import configure_azure_monitor

            configure_azure_monitor(
                connection_string=conn_str,
                disable_offline_storage=app.config.get("TESTING", False),
            )
            cls._is_configured = True
            logger.info("Azure Monitor OpenTelemetry initialized.")
            return True
        except Exception as e:
            logger.warning(
                "Could not initialize Azure Monitor OpenTelemetry: %s", str(e)
            )
            return False

    @classmethod
    def is_enabled(cls) -> bool:
        """Check if telemetry collection is currently active."""
        return cls._is_configured

    @classmethod
    def reset(cls) -> None:
        """Reset internal configuration state (for unit testing)."""
        cls._is_configured = False
