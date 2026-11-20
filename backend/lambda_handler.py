"""AWS Lambda WSGI entrypoint for CloudResumeAI."""
from apig_wsgi import make_lambda_handler
from app import create_app

# Instantiate Flask application
app = create_app()

# Expose standard AWS Lambda handler
handler = make_lambda_handler(app)
