"""Professional PDF Resume Generation Service using ReportLab."""
import html
import io
import logging
import re
from typing import Dict, Any, List

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.pdfgen import canvas

from app.models.resume import Resume

logger = logging.getLogger(__name__)

# A4 dimensions: 595.27 x 841.89 points
PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT_MARGIN = 36
RIGHT_MARGIN = 36
TOP_MARGIN = 36
BOTTOM_MARGIN = 36
CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN


class PDFGenerationError(Exception):
    """Raised when PDF document generation fails."""

    def __init__(self, message: str = "Failed to generate PDF document."):
        self.message = message
        super().__init__(self.message)


# Template color palettes matching frontend RESUME_TEMPLATES
TEMPLATE_PALETTES: Dict[str, Dict[str, Any]] = {
    # Flagship Academic & SDE
    "latex-classic": {
        "primary": colors.HexColor("#0f172a"),      # Slate 900
        "accent": colors.HexColor("#0f6292"),       # Cerulean / Steel Blue
        "secondary": colors.HexColor("#475569"),    # Slate 600
        "border": colors.HexColor("#6b7280"),       # Gray 500 horizontal rule
        "body": colors.HexColor("#1e293b"),         # Slate 800
    },
    "research-fellow": {
        "primary": colors.HexColor("#1e293b"),
        "accent": colors.HexColor("#1d4ed8"),
        "secondary": colors.HexColor("#475569"),
        "border": colors.HexColor("#cbd5e1"),
        "body": colors.HexColor("#334155"),
    },
    "cambridge-minimal": {
        "primary": colors.HexColor("#1c1917"),
        "accent": colors.HexColor("#b45309"),
        "secondary": colors.HexColor("#78716c"),
        "border": colors.HexColor("#d6d3d1"),
        "body": colors.HexColor("#292524"),
    },
    # Modern & Double Column
    "ivy-league": {
        "primary": colors.HexColor("#0f172a"),
        "accent": colors.HexColor("#1e3a8a"),
        "secondary": colors.HexColor("#475569"),
        "border": colors.HexColor("#e2e8f0"),
        "body": colors.HexColor("#334155"),
    },
    "double-column-pro": {
        "primary": colors.HexColor("#0f172a"),
        "accent": colors.HexColor("#2563eb"),
        "secondary": colors.HexColor("#64748b"),
        "border": colors.HexColor("#e2e8f0"),
        "body": colors.HexColor("#334155"),
    },
    "timeline": {
        "primary": colors.HexColor("#18181b"),
        "accent": colors.HexColor("#059669"),
        "secondary": colors.HexColor("#71717a"),
        "border": colors.HexColor("#e4e4e7"),
        "body": colors.HexColor("#27272a"),
    },
    "compact-grid": {
        "primary": colors.HexColor("#0f172a"),
        "accent": colors.HexColor("#0284c7"),
        "secondary": colors.HexColor("#475569"),
        "border": colors.HexColor("#cbd5e1"),
        "body": colors.HexColor("#1e293b"),
    },
    "bold-split": {
        "primary": colors.HexColor("#1e293b"),
        "accent": colors.HexColor("#3b82f6"),
        "secondary": colors.HexColor("#64748b"),
        "border": colors.HexColor("#cbd5e1"),
        "body": colors.HexColor("#334155"),
    },
    "sleek-hybrid": {
        "primary": colors.HexColor("#111827"),
        "accent": colors.HexColor("#8b5cf6"),
        "secondary": colors.HexColor("#6b7280"),
        "border": colors.HexColor("#e5e7eb"),
        "body": colors.HexColor("#374151"),
    },
    "impact-metrics": {
        "primary": colors.HexColor("#0f172a"),
        "accent": colors.HexColor("#d97706"),
        "secondary": colors.HexColor("#475569"),
        "border": colors.HexColor("#fde68a"),
        "body": colors.HexColor("#1f2937"),
    },
    # Professional & ATS
    "executive": {
        "primary": colors.HexColor("#0f172a"),      # Slate 900
        "accent": colors.HexColor("#2563eb"),       # Blue 600
        "secondary": colors.HexColor("#475569"),    # Slate 600
        "border": colors.HexColor("#e2e8f0"),       # Slate 200
        "body": colors.HexColor("#334155"),         # Slate 700
    },
    "corporate-classic": {
        "primary": colors.HexColor("#1e293b"),
        "accent": colors.HexColor("#334155"),
        "secondary": colors.HexColor("#64748b"),
        "border": colors.HexColor("#cbd5e1"),
        "body": colors.HexColor("#1e293b"),
    },
    "ats-standard": {
        "primary": colors.HexColor("#000000"),
        "accent": colors.HexColor("#1f2937"),
        "secondary": colors.HexColor("#4b5563"),
        "border": colors.HexColor("#e5e7eb"),
        "body": colors.HexColor("#111827"),
    },
    "directorate": {
        "primary": colors.HexColor("#0f172a"),
        "accent": colors.HexColor("#0284c7"),
        "secondary": colors.HexColor("#475569"),
        "border": colors.HexColor("#bae6fd"),
        "body": colors.HexColor("#1e293b"),
    },
    "consulting-edge": {
        "primary": colors.HexColor("#0f172a"),
        "accent": colors.HexColor("#0f766e"),
        "secondary": colors.HexColor("#475569"),
        "border": colors.HexColor("#99f6e4"),
        "body": colors.HexColor("#1e293b"),
    },
    "wall-street": {
        "primary": colors.HexColor("#09090b"),
        "accent": colors.HexColor("#18181b"),
        "secondary": colors.HexColor("#52525b"),
        "border": colors.HexColor("#d4d4d8"),
        "body": colors.HexColor("#18181b"),
    },
    "modern-clean": {
        "primary": colors.HexColor("#1e293b"),
        "accent": colors.HexColor("#475569"),
        "secondary": colors.HexColor("#64748b"),
        "border": colors.HexColor("#e2e8f0"),
        "body": colors.HexColor("#334155"),
    },
    "metro": {
        "primary": colors.HexColor("#111827"),
        "accent": colors.HexColor("#dc2626"),
        "secondary": colors.HexColor("#6b7280"),
        "border": colors.HexColor("#fecaca"),
        "body": colors.HexColor("#1f2937"),
    },
    # Creative & Minimalist
    "editorial": {
        "primary": colors.HexColor("#1c1917"),
        "accent": colors.HexColor("#78716c"),
        "secondary": colors.HexColor("#78716c"),
        "border": colors.HexColor("#e7e5e4"),
        "body": colors.HexColor("#292524"),
    },
    "swiss-grid": {
        "primary": colors.HexColor("#09090b"),
        "accent": colors.HexColor("#e11d48"),
        "secondary": colors.HexColor("#71717a"),
        "border": colors.HexColor("#fecdd3"),
        "body": colors.HexColor("#18181b"),
    },
    "monochrome-minimal": {
        "primary": colors.HexColor("#000000"),
        "accent": colors.HexColor("#52525b"),
        "secondary": colors.HexColor("#71717a"),
        "border": colors.HexColor("#e4e4e7"),
        "body": colors.HexColor("#18181b"),
    },
    "studio": {
        "primary": colors.HexColor("#18181b"),
        "accent": colors.HexColor("#7c3aed"),
        "secondary": colors.HexColor("#71717a"),
        "border": colors.HexColor("#ddd6fe"),
        "body": colors.HexColor("#27272a"),
    },
    "horizon": {
        "primary": colors.HexColor("#1e293b"),      # Slate 800
        "accent": colors.HexColor("#0ea5e9"),       # Sky 500
        "secondary": colors.HexColor("#64748b"),    # Slate 500
        "border": colors.HexColor("#cbd5e1"),       # Slate 300
        "body": colors.HexColor("#334155"),         # Slate 700
    },
    "nordic": {
        "primary": colors.HexColor("#1e293b"),
        "accent": colors.HexColor("#64748b"),
        "secondary": colors.HexColor("#64748b"),
        "border": colors.HexColor("#e2e8f0"),
        "body": colors.HexColor("#334155"),
    },
    "aura": {
        "primary": colors.HexColor("#1c1917"),
        "accent": colors.HexColor("#d97706"),
        "secondary": colors.HexColor("#78716c"),
        "border": colors.HexColor("#fed7aa"),
        "body": colors.HexColor("#292524"),
    },
    "clarity": {
        "primary": colors.HexColor("#111827"),      # Gray 900
        "accent": colors.HexColor("#6366f1"),       # Indigo 500
        "secondary": colors.HexColor("#6b7280"),    # Gray 500
        "border": colors.HexColor("#e5e7eb"),       # Gray 200
        "body": colors.HexColor("#374151"),         # Gray 700
    },
    "prism": {
        "primary": colors.HexColor("#18181b"),      # Zinc 900
        "accent": colors.HexColor("#8b5cf6"),       # Purple 500
        "secondary": colors.HexColor("#71717a"),    # Zinc 500
        "border": colors.HexColor("#e4e4e7"),       # Zinc 200
        "body": colors.HexColor("#3f3f46"),         # Zinc 700
    },
    "scholar": {
        "primary": colors.HexColor("#1c1917"),      # Stone 900
        "accent": colors.HexColor("#b45309"),       # Amber 700
        "secondary": colors.HexColor("#78716c"),    # Stone 500
        "border": colors.HexColor("#d6d3d1"),       # Stone 300
        "body": colors.HexColor("#44403c"),         # Stone 700
    },
    "atlas": {
        "primary": colors.HexColor("#0f2942"),      # Deep Navy
        "accent": colors.HexColor("#0284c7"),       # Light Blue
        "secondary": colors.HexColor("#475569"),    # Slate 600
        "border": colors.HexColor("#94a3b8"),       # Slate 400
        "body": colors.HexColor("#1e293b"),         # Slate 800
    },
    "pulse": {
        "primary": colors.HexColor("#0c0a09"),      # Near Black
        "accent": colors.HexColor("#e11d48"),       # Rose 600
        "secondary": colors.HexColor("#71717a"),    # Zinc 500
        "border": colors.HexColor("#fecdd3"),       # Rose 200
        "body": colors.HexColor("#292524"),         # Stone 800
    },
    "meridian": {
        "primary": colors.HexColor("#134e4a"),      # Teal 900
        "accent": colors.HexColor("#0d9488"),       # Teal 600
        "secondary": colors.HexColor("#475569"),    # Slate 600
        "border": colors.HexColor("#99f6e4"),       # Teal 200
        "body": colors.HexColor("#1f2937"),         # Gray 800
    },
    "terracotta-split": {
        "primary": colors.HexColor("#1c1917"),      # Stone 900
        "accent": colors.HexColor("#c2410c"),       # Terracotta / Orange 700
        "secondary": colors.HexColor("#78716c"),    # Stone 500
        "border": colors.HexColor("#fdba74"),       # Orange 300
        "body": colors.HexColor("#292524"),         # Stone 800
    },
    "emerald-matrix": {
        "primary": colors.HexColor("#064e3b"),      # Emerald 900
        "accent": colors.HexColor("#059669"),       # Emerald 600
        "secondary": colors.HexColor("#475569"),    # Slate 600
        "border": colors.HexColor("#a7f3d0"),       # Emerald 200
        "body": colors.HexColor("#1e293b"),         # Slate 800
    },
}


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas that renders page numbers and running footer."""

    def __init__(self, *args, **kwargs):
        # Keep pageCompression=0 for predictable test verification
        kwargs["pageCompression"] = 0
        super().__init__(*args, **kwargs)
        self._saved_page_states: List[Dict[str, Any]] = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, total_pages: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#94a3b8"))

        # Footer divider line
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(LEFT_MARGIN, 26, PAGE_WIDTH - RIGHT_MARGIN, 26)

        # Footer labels
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(PAGE_WIDTH - RIGHT_MARGIN, 14, page_str)
        self.drawString(
            LEFT_MARGIN, 14, "CloudResumeAI — ATS-Optimized Resume"
        )
        self.restoreState()


class PDFService:
    """Service generating professional, ATS-friendly PDF resumes."""

    @classmethod
    def get_safe_filename(cls, resume: Resume) -> str:
        """Derive a safe, sanitized filename from full name or resume title."""
        raw_name = (
            (resume.full_name or "").strip()
            or (resume.title or "").strip()
            or "Resume"
        )
        # Strip illegal characters, replace spaces with single underscore
        clean = re.sub(r"[^\w\s-]", "", raw_name).strip()
        clean = re.sub(r"[\s-]+", "_", clean)
        if not clean:
            clean = "Resume"
        return f"{clean}_Resume.pdf"

    @classmethod
    def _escape(cls, text: Any) -> str:
        """Safely convert and XML-escape text for ReportLab Paragraphs."""
        if text is None:
            return ""
        return html.escape(str(text).strip())

    @classmethod
    def _resolve_palette(cls, template_id: str) -> Dict[str, Any]:
        """Resolve color palette for requested template with safe fallback."""
        tid = (template_id or "").strip().lower()
        if tid in TEMPLATE_PALETTES:
            return TEMPLATE_PALETTES[tid]
        logger.warning(
            "Template '%s' is not supported; falling back to 'executive'.",
            template_id
        )
        return TEMPLATE_PALETTES["executive"]

    @classmethod
    def _build_styles(
        cls, palette: Dict[str, Any], template_id: str = "executive"
    ) -> Dict[str, ParagraphStyle]:
        """Create custom styles with proper leading to avoid overlap."""
        sheet = getSampleStyleSheet()
        tid = (template_id or "").strip().lower()
        is_serif = tid in ("latex-classic", "cambridge-minimal", "editorial", "scholar")
        font_bold = "Times-Bold" if is_serif else "Helvetica-Bold"
        font_regular = "Times-Roman" if is_serif else "Helvetica"
        font_italic = "Times-Italic" if is_serif else "Helvetica-Oblique"

        return {
            "Name": ParagraphStyle(
                "ResumeName",
                parent=sheet["Normal"],
                fontName=font_bold,
                fontSize=20,
                leading=24,
                textColor=palette["primary"],
                spaceAfter=2,
            ),
            "Headline": ParagraphStyle(
                "ResumeHeadline",
                parent=sheet["Normal"],
                fontName=font_bold,
                fontSize=10,
                leading=14,
                textColor=palette["accent"],
                spaceAfter=4,
            ),
            "Contact": ParagraphStyle(
                "ResumeContact",
                parent=sheet["Normal"],
                fontName=font_regular,
                fontSize=8.5,
                leading=12,
                textColor=palette["secondary"],
                spaceAfter=6,
            ),
            "SectionTitle": ParagraphStyle(
                "ResumeSectionTitle",
                parent=sheet["Normal"],
                fontName=font_bold,
                fontSize=10,
                leading=14,
                textColor=palette["primary"],
                spaceBefore=8,
                spaceAfter=2,
                keepWithNext=True,
            ),
            "ItemTitle": ParagraphStyle(
                "ResumeItemTitle",
                parent=sheet["Normal"],
                fontName=font_bold,
                fontSize=9.5,
                leading=13,
                textColor=palette["primary"],
            ),
            "ItemSubtitle": ParagraphStyle(
                "ResumeItemSubtitle",
                parent=sheet["Normal"],
                fontName=font_italic,
                fontSize=8.5,
                leading=12,
                textColor=palette["secondary"],
            ),
            "ItemDate": ParagraphStyle(
                "ResumeItemDate",
                parent=sheet["Normal"],
                fontName=font_regular,
                fontSize=8.5,
                leading=12,
                textColor=palette["secondary"],
                alignment=2,  # Right-aligned
            ),
            "Body": ParagraphStyle(
                "ResumeBody",
                parent=sheet["Normal"],
                fontName=font_regular,
                fontSize=8.5,
                leading=12.5,
                textColor=palette["body"],
                spaceAfter=4,
            ),
            "Bullet": ParagraphStyle(
                "ResumeBullet",
                parent=sheet["Normal"],
                fontName=font_regular,
                fontSize=8.5,
                leading=12,
                textColor=palette["body"],
                leftIndent=12,
                firstLineIndent=-8,
                spaceAfter=2,
            ),
        }

    @classmethod
    def generate_resume_pdf(cls, resume: Resume) -> io.BytesIO:
        """Generate a complete, professional A4 PDF resume document."""
        try:
            palette = cls._resolve_palette(resume.template_id)
            styles = cls._build_styles(palette, resume.template_id)

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                leftMargin=LEFT_MARGIN,
                rightMargin=RIGHT_MARGIN,
                topMargin=TOP_MARGIN,
                bottomMargin=BOTTOM_MARGIN,
            )

            story: List[Any] = []

            # 1. Top Decorative Bar
            story.append(
                HRFlowable(
                    width="100%",
                    thickness=3,
                    color=palette["accent"],
                    spaceBefore=0,
                    spaceAfter=8,
                )
            )

            # 2. Header: Personal Details & Contact
            cls._append_header(story, resume, styles, palette)

            # 3. Professional Summary
            if resume.summary and resume.summary.strip():
                cls._append_section_heading(
                    story, "PROFESSIONAL SUMMARY", styles, palette
                )
                story.append(
                    Paragraph(cls._escape(resume.summary), styles["Body"])
                )
                story.append(Spacer(1, 4))

            # 4. Work Experience
            if resume.experiences:
                cls._append_section_heading(
                    story, "WORK EXPERIENCE", styles, palette
                )
                for exp in resume.experiences:
                    cls._append_experience_item(story, exp, styles)
                story.append(Spacer(1, 4))

            # 5. Education
            if resume.educations:
                cls._append_section_heading(
                    story, "EDUCATION", styles, palette
                )
                for edu in resume.educations:
                    cls._append_education_item(story, edu, styles)
                story.append(Spacer(1, 4))

            # 6. Skills
            if resume.skills:
                cls._append_section_heading(
                    story, "SKILLS & EXPERTISE", styles, palette
                )
                for sk in resume.skills:
                    cls._append_skill_item(story, sk, styles, palette)
                story.append(Spacer(1, 4))

            # 7. Projects
            if resume.projects:
                cls._append_section_heading(
                    story, "PROJECTS", styles, palette
                )
                for proj in resume.projects:
                    cls._append_project_item(story, proj, styles, palette)
                story.append(Spacer(1, 4))

            # Build document using the two-pass NumberedCanvas
            doc.build(story, canvasmaker=NumberedCanvas)
            buffer.seek(0)
            return buffer

        except Exception as exc:
            logger.error(
                "PDF generation failed for resume ID %s: %s",
                getattr(resume, "id", "unknown"),
                exc,
                exc_info=True,
            )
            raise PDFGenerationError(
                f"Failed to generate PDF document: {str(exc)}"
            )

    @classmethod
    def _append_header(
        cls,
        story: List[Any],
        resume: Resume,
        styles: Dict[str, ParagraphStyle],
        palette: Dict[str, Any],
    ) -> None:
        """Render candidate name, headline, and structured contact info."""
        raw_title = resume.full_name or resume.title or "Untitled Resume"
        name = cls._escape(raw_title)
        story.append(Paragraph(name, styles["Name"]))

        headline = cls._escape(resume.headline or resume.target_role or "")
        if headline:
            story.append(Paragraph(headline, styles["Headline"]))

        # Build contact items
        contacts: List[str] = []
        if resume.email:
            contacts.append(f"Email: {cls._escape(resume.email)}")
        if resume.phone:
            contacts.append(f"Phone: {cls._escape(resume.phone)}")
        if resume.location:
            contacts.append(f"Location: {cls._escape(resume.location)}")
        if resume.linkedin:
            contacts.append(f"LinkedIn: {cls._escape(resume.linkedin)}")
        if resume.github:
            contacts.append(f"GitHub: {cls._escape(resume.github)}")
        if resume.website:
            contacts.append(f"Web: {cls._escape(resume.website)}")

        if contacts:
            contact_line = "  •  ".join(contacts)
            story.append(Paragraph(contact_line, styles["Contact"]))

        story.append(Spacer(1, 4))

    @classmethod
    def _append_section_heading(
        cls,
        story: List[Any],
        title: str,
        styles: Dict[str, ParagraphStyle],
        palette: Dict[str, Any],
    ) -> None:
        """Render section title with an accent underline rule."""
        story.append(Paragraph(title, styles["SectionTitle"]))
        story.append(
            HRFlowable(
                width="100%",
                thickness=1,
                color=palette["accent"],
                spaceBefore=1,
                spaceAfter=5,
            )
        )

    @classmethod
    def _append_experience_item(
        cls, story: List[Any], exp: Any, styles: Dict[str, ParagraphStyle]
    ) -> None:
        """Render a work experience entry with dates and bullet points."""
        date_end = (
            "Present"
            if getattr(exp, "is_current", False)
            else (exp.end_date or "")
        )
        date_range = (
            f"{cls._escape(exp.start_date)} – {cls._escape(date_end)}"
            if exp.start_date or date_end
            else ""
        )

        loc = getattr(exp, "location", None)
        loc_str = f" · {cls._escape(loc)}" if loc else ""
        left_html = (
            f"<b>{cls._escape(exp.role)}</b><br/>"
            f"<font color='#475569'>{cls._escape(exp.company)}{loc_str}</font>"
        )

        table_data = [
            [
                Paragraph(left_html, styles["ItemTitle"]),
                Paragraph(date_range, styles["ItemDate"]),
            ]
        ]
        item_table = Table(
            table_data,
            colWidths=[CONTENT_WIDTH * 0.75, CONTENT_WIDTH * 0.25],
        )
        item_table.setStyle(
            TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ])
        )

        flowables = [item_table]

        # Bullets
        bullets = getattr(exp, "bullets", None) or []
        for bullet in bullets:
            if isinstance(bullet, str) and bullet.strip():
                flowables.append(
                    Paragraph(f"• {cls._escape(bullet)}", styles["Bullet"])
                )

        flowables.append(Spacer(1, 3))
        story.append(KeepTogether(flowables))

    @classmethod
    def _append_education_item(
        cls, story: List[Any], edu: Any, styles: Dict[str, ParagraphStyle]
    ) -> None:
        """Render education entry with degree, institution, and honors."""
        date_range = (
            f"{cls._escape(edu.start_date)} – {cls._escape(edu.end_date)}"
            if edu.start_date or edu.end_date
            else ""
        )

        degree_parts = []
        if getattr(edu, "degree", None):
            degree_parts.append(cls._escape(edu.degree))
        if getattr(edu, "field_of_study", None):
            degree_parts.append(f"in {cls._escape(edu.field_of_study)}")
        degree_text = " ".join(degree_parts) if degree_parts else "Degree"

        left_html = (
            f"<b>{degree_text}</b><br/>"
            f"<font color='#475569'>{cls._escape(edu.institution)}</font>"
        )

        table_data = [
            [
                Paragraph(left_html, styles["ItemTitle"]),
                Paragraph(date_range, styles["ItemDate"]),
            ]
        ]
        item_table = Table(
            table_data,
            colWidths=[CONTENT_WIDTH * 0.75, CONTENT_WIDTH * 0.25],
        )
        item_table.setStyle(
            TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ])
        )

        flowables = [item_table]

        extras = []
        if getattr(edu, "gpa", None) and str(edu.gpa).strip():
            extras.append(f"GPA: {cls._escape(edu.gpa)}")
        if getattr(edu, "honors", None) and str(edu.honors).strip():
            extras.append(f"Honors: {cls._escape(edu.honors)}")

        if extras:
            flowables.append(
                Paragraph(
                    f"<i>{' · '.join(extras)}</i>",
                    styles["ItemSubtitle"],
                )
            )

        flowables.append(Spacer(1, 3))
        story.append(KeepTogether(flowables))

    @classmethod
    def _append_skill_item(
        cls,
        story: List[Any],
        sk: Any,
        styles: Dict[str, ParagraphStyle],
        palette: Dict[str, Any],
    ) -> None:
        """Render skills categorized by group."""
        cat = cls._escape(getattr(sk, "category", "Skills"))
        raw_skills = getattr(sk, "skills", None) or []
        skills_str = ", ".join(
            cls._escape(s) for s in raw_skills if str(s).strip()
        )

        if skills_str:
            line_html = f"<b>{cat}:</b> {skills_str}"
            story.append(Paragraph(line_html, styles["Body"]))

    @classmethod
    def _append_project_item(
        cls,
        story: List[Any],
        proj: Any,
        styles: Dict[str, ParagraphStyle],
        palette: Dict[str, Any],
    ) -> None:
        """Render a project entry with technologies, description, and link."""
        name = cls._escape(getattr(proj, "name", "Project"))
        raw_techs = getattr(proj, "technologies", None) or []
        tech_str = " · ".join(
            cls._escape(t) for t in raw_techs if str(t).strip()
        )

        header_html = f"<b>{name}</b>"
        if tech_str:
            header_html += f" <font color='#64748b'>({tech_str})</font>"

        links = []
        if getattr(proj, "url", None) and str(proj.url).strip():
            links.append(cls._escape(proj.url))
        if getattr(proj, "github", None) and str(proj.github).strip():
            links.append(f"GitHub: {cls._escape(proj.github)}")
        link_str = "  |  ".join(links)

        table_data = [
            [
                Paragraph(header_html, styles["ItemTitle"]),
                Paragraph(link_str, styles["ItemDate"]),
            ]
        ]
        item_table = Table(
            table_data,
            colWidths=[CONTENT_WIDTH * 0.70, CONTENT_WIDTH * 0.30],
        )
        item_table.setStyle(
            TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ])
        )

        flowables = [item_table]

        desc = getattr(proj, "description", None)
        if desc and str(desc).strip():
            flowables.append(Paragraph(cls._escape(desc), styles["Body"]))

        flowables.append(Spacer(1, 3))
        story.append(KeepTogether(flowables))
