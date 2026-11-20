"""Service for extracting raw text from various resume file formats."""
import io
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class ResumeParserService:
    """Extracts raw text from uploaded PDF, DOCX, TXT, HTML, and RTF documents."""

    @staticmethod
    def extract_text(file_bytes: bytes, filename: str) -> str:
        """Extract plain text from uploaded file bytes according to file extension."""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

        if ext == "pdf":
            return ResumeParserService._extract_pdf(file_bytes)
        elif ext in ("docx", "doc"):
            return ResumeParserService._extract_docx(file_bytes)
        elif ext in ("html", "htm"):
            return ResumeParserService._extract_html(file_bytes)
        elif ext == "rtf":
            return ResumeParserService._extract_rtf(file_bytes)
        else:
            # Default to text decoding
            return ResumeParserService._extract_txt(file_bytes)

    @staticmethod
    def _extract_pdf(file_bytes: bytes) -> str:
        """Extract text from PDF using pypdf with fallback."""
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted)
            if text_parts:
                return "\n".join(text_parts).strip()
        except Exception as exc:
            logger.warning("pypdf extraction failed, attempting stream fallback: %s", exc)

        # Fallback: scan printable characters from byte stream
        try:
            cleaned = re.sub(rb"[^\x20-\x7E\n\r\t]", b" ", file_bytes).decode("latin-1")
            cleaned = re.sub(r"\s+", " ", cleaned).strip()
            if len(cleaned) > 50:
                return cleaned
        except Exception:
            pass

        return ""

    @staticmethod
    def _extract_docx(file_bytes: bytes) -> str:
        """Extract text from DOCX using python-docx with fallback."""
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            paragraphs.append(cell.text.strip())
            return "\n".join(paragraphs).strip()
        except Exception as exc:
            logger.warning("docx extraction failed, attempting xml fallback: %s", exc)

        # Fallback: search for <w:t> tags in zip-based docx bytes
        try:
            decoded = file_bytes.decode("utf-8", errors="ignore")
            matches = re.findall(r"<w:t[^>]*>(.*?)</w:t>", decoded)
            if matches:
                return " ".join(matches).strip()
        except Exception:
            pass

        return ResumeParserService._extract_txt(file_bytes)

    @staticmethod
    def _extract_html(file_bytes: bytes) -> str:
        """Extract text from HTML by removing tags."""
        try:
            decoded = file_bytes.decode("utf-8", errors="ignore")
            # Remove scripts and styles
            clean = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", decoded, flags=re.DOTALL | re.IGNORECASE)
            # Remove all html tags
            clean = re.sub(r"<[^>]+>", " ", clean)
            # Unescape basic entities
            clean = clean.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
            return re.sub(r"\s+", " ", clean).strip()
        except Exception as exc:
            logger.warning("HTML parsing failed: %s", exc)
            return ResumeParserService._extract_txt(file_bytes)

    @staticmethod
    def _extract_rtf(file_bytes: bytes) -> str:
        """Extract plain text from RTF content."""
        try:
            decoded = file_bytes.decode("latin-1", errors="ignore")
            # Remove RTF control words
            clean = re.sub(r"\\[a-z0-9]+-?", " ", decoded)
            clean = re.sub(r"[{}]", " ", clean)
            return re.sub(r"\s+", " ", clean).strip()
        except Exception:
            return ResumeParserService._extract_txt(file_bytes)

    @staticmethod
    def _extract_txt(file_bytes: bytes) -> str:
        """Extract text from plain text files."""
        for enc in ("utf-8", "latin-1", "cp1252"):
            try:
                return file_bytes.decode(enc).strip()
            except UnicodeDecodeError:
                continue
        return file_bytes.decode("utf-8", errors="ignore").strip()
