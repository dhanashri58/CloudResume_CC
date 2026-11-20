"""Resume management API endpoints."""
from flask import Blueprint, request, jsonify, send_file
from pydantic import ValidationError
from app.services.auth_service import AuthService, require_auth
from app.services.resume_service import ResumeService
from app.services.pdf_service import PDFGenerationError
from app.services.ai_service import AIService
from app.services.parser_service import ResumeParserService
from app.schemas.resume import ResumeCreateSchema, ResumeUpdateSchema

resumes_bp = Blueprint("resumes", __name__)


@resumes_bp.route("/resumes/upload-optimize", methods=["POST"])
@resumes_bp.route("/resume/upload-optimize", methods=["POST"])
def upload_and_optimize():
    """Extract raw text from uploaded resume document and optimize with Gemini AI."""
    filename = "resume.pdf"
    raw_text = ""

    # Check for file in multipart form-data
    if "file" in request.files:
        uploaded_file = request.files["file"]
        filename = uploaded_file.filename or "uploaded_resume.pdf"
        file_bytes = uploaded_file.read()
        raw_text = ResumeParserService.extract_text(file_bytes, filename)
    elif request.is_json:
        body = request.get_json(silent=True) or {}
        raw_text = body.get("raw_text", "")
        filename = body.get("filename", "sample_resume.pdf")

    req_id = request.headers.get("X-Request-ID")
    optimized = AIService.parse_and_optimize_resume(
        raw_text=raw_text, filename=filename, request_id=req_id
    )

    return jsonify({
        "success": True,
        "filename": filename,
        "resume": optimized
    }), 200


@resumes_bp.route("/resumes", methods=["GET"])
@require_auth
def list_resumes():
    """List all resumes belonging to the authenticated user."""
    user = AuthService.get_current_user()
    resumes = ResumeService.list_resumes(user)
    return jsonify({"resumes": resumes, "count": len(resumes)}), 200


@resumes_bp.route("/resumes", methods=["POST"])
@require_auth
def create_resume():
    """Create a new resume with structured sections for the current user."""
    payload = request.get_json(silent=True) or {}
    try:
        validated = ResumeCreateSchema(**payload)
    except ValidationError as err:
        return jsonify({
            "error": "Validation Error",
            "details": err.errors()
        }), 422

    user = AuthService.get_current_user()
    data = validated.model_dump()
    resume = ResumeService.create_resume(user, data)
    return jsonify(resume), 201


@resumes_bp.route("/resumes/<string:resume_id>", methods=["GET"])
@require_auth
def get_resume(resume_id: str):
    """Retrieve full resume details for the current user."""
    user = AuthService.get_current_user()
    resume = ResumeService.get_resume(resume_id, user)
    if not resume:
        return jsonify({
            "error": "Not Found",
            "message": f"Resume with ID '{resume_id}' was not found."
        }), 404
    return jsonify(resume), 200


@resumes_bp.route("/resumes/<string:resume_id>", methods=["PUT"])
@require_auth
def update_resume(resume_id: str):
    """Update existing resume document and child collections."""
    payload = request.get_json(silent=True) or {}
    try:
        validated = ResumeUpdateSchema(**payload)
    except ValidationError as err:
        return jsonify({
            "error": "Validation Error",
            "details": err.errors()
        }), 422

    user = AuthService.get_current_user()
    data = validated.model_dump(exclude_unset=True)
    updated = ResumeService.update_resume(resume_id, user, data)
    if not updated:
        return jsonify({
            "error": "Not Found",
            "message": f"Resume with ID '{resume_id}' was not found."
        }), 404
    return jsonify(updated), 200


@resumes_bp.route("/resumes/<string:resume_id>", methods=["DELETE"])
@require_auth
def delete_resume(resume_id: str):
    """Delete a resume and all associated child entities."""
    user = AuthService.get_current_user()
    deleted = ResumeService.delete_resume(resume_id, user)
    if not deleted:
        return jsonify({
            "error": "Not Found",
            "message": f"Resume with ID '{resume_id}' was not found."
        }), 404
    return jsonify({
        "message": "Resume deleted successfully.",
        "id": resume_id
    }), 200


@resumes_bp.route(
    "/resumes/<string:resume_id>/export-pdf", methods=["POST", "GET"]
)
@require_auth
def export_resume_pdf(resume_id: str):
    """Generate and download a professional PDF for an owned resume."""
    user = AuthService.get_current_user()
    try:
        pdf_buffer, filename = ResumeService.export_pdf(resume_id, user)
        if not pdf_buffer:
            return jsonify({
                "error": "Not Found",
                "message": f"Resume with ID '{resume_id}' was not found."
            }), 404
        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename,
        )
    except PDFGenerationError as err:
        return jsonify({
            "error": "PDF Generation Error",
            "message": err.message
        }), 500
    except Exception:
        return jsonify({
            "error": "Internal Server Error",
            "message": "An error occurred while generating the resume PDF."
        }), 500
