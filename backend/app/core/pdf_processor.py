# pdf_preprocessor.py

import os
from pypdf import PdfReader
from pdf2image import convert_from_path
import pytesseract

# Optional: Set Tesseract path manually on Windows
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from both text-based and image-based PDFs.
    Falls back to OCR using pytesseract if no embedded text is found.
    """
    text_output = []
    reader = PdfReader(file_path)
    total_pages = len(reader.pages)

    print(f"📄 Processing PDF: {file_path} ({total_pages} pages)")

    for page_num, page in enumerate(reader.pages, start=1):
        try:
            # Try normal text extraction
            extracted_text = page.extract_text()
            if extracted_text and extracted_text.strip():
                text_output.append(extracted_text)
                print(f"✅ Page {page_num}: Extracted embedded text.")
            else:
                # Run OCR if no text found
                print(f"🔍 Page {page_num}: No text found, running OCR...")
                images = convert_from_path(
                    file_path, first_page=page_num, last_page=page_num
                )
                ocr_text = ""
                for img in images:
                    ocr_text += pytesseract.image_to_string(img, lang="eng", config="--psm 6")
                if ocr_text.strip():
                    text_output.append(ocr_text)
                    print(f"🧠 Page {page_num}: OCR extraction complete.")
                else:
                    print(f"⚠️ Page {page_num}: OCR found no readable text.")
        except Exception as e:
            print(f"❌ Error processing page {page_num}: {e}")

    full_text = "\n".join(text_output)
    if not full_text.strip():
        print("⚠️ Warning: No text extracted from this PDF at all.")
    else:
        print(f"✅ Done! Extracted {len(full_text.split())} words total.")

    return full_text
