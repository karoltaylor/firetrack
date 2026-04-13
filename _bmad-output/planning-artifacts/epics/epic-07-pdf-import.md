# Epic 7: Digital PDF Import
**Priority:** P1 — Many brokers export PDF statements; required for broad broker coverage
**PRD refs:** FR-02.1, FR-02.11
**Arch refs:** pdfjs-dist (client-side), AWS Textract (server-side for scanned PDFs)

## Goal
Enable users to import broker statements exported as PDF files. Digital PDFs are handled client-side with no server round-trip (preserving privacy). Scanned PDFs are handled server-side via AWS Textract as a fallback.

## Stories

---

### Story 7.1 — Digital PDF Text Extraction (Client-Side)
**As a** user with a PDF broker statement,
**I want** to upload it and have my transactions extracted,
**so that** I can import from brokers that only export PDFs.

**Acceptance Criteria:**
- [ ] `.pdf` added to accepted file types in upload component (Story 3.1)
- [ ] pdfjs-dist used client-side to extract text from digital PDFs (PDFs with embedded text, not scanned)
- [ ] Extracted text passed through existing column mapping / AI parse pipeline (same as CSV)
- [ ] Digital PDF detection: attempt pdfjs-dist extraction; if extracted text length < 100 chars, classify as likely scanned
- [ ] For digital PDFs: extraction happens entirely in the browser — no file or text sent to server (free tier privacy preserved)
- [ ] Extracted text displayed in column mapping interface as structured rows where possible
- [ ] Test with real PDF exports from: DEGIRO (Dutch broker), Trading 212, IBKR

**Technical notes:**
- pdfjs-dist v4 — runs in browser via WebWorker
- PDF extraction produces raw text; structured parsing is handled by the column mapping / AI pipeline

---

### Story 7.2 — Scanned PDF Fallback (AWS Textract)
**As a** user with a scanned (image-based) PDF broker statement,
**I want** FIREtrack to handle it even though it's not a digital PDF,
**so that** I can import older statements that were scanned.

**Acceptance Criteria:**
- [ ] If PDF detected as scanned (text extraction yields < 100 chars): user shown message "This appears to be a scanned document. FIREtrack will use OCR to read it — the document content will be processed by AWS Textract."
- [ ] User must explicitly consent before the scanned PDF is sent to the server
- [ ] On consent: file uploaded to `POST /api/parse/ocr` endpoint
- [ ] Server calls AWS Textract `DetectDocumentText` API
- [ ] Extracted text returned to client — same pipeline as digital PDF from this point
- [ ] Textract processing is premium-only (costs money per page)
- [ ] Free-tier users shown: "Scanned PDF processing is a Premium feature" with upgrade prompt
- [ ] Privacy disclosure in consent dialog: "Your document will be sent to AWS Textract for OCR processing. No data is stored by AWS after processing."

**Technical notes:**
- AWS Textract: ~$0.0015 per page — negligible at V1 scale
- Server receives raw PDF bytes; extracts text; returns text to client; does NOT store the PDF
- File bytes deleted from server memory immediately after Textract response
