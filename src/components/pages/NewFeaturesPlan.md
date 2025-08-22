# New Features Implementation Plan

## Overview
This document outlines the implementation plan for adding new features to the existing Vue/Node.js website. The new features include:
1. Image converter (JPG, PNG, WEBP, SVG, etc.)
2. OCR online (extract text from images/PDFs)
3. Basic PDF editor (rotate, split, extract pages, add watermarks)
4. Image resizer (change dimensions without losing quality)
5. Premium features (batch download, temporary storage)
6. Attention-grabbing elements (file limits, no watermarks, speed)

## Backend Architecture

### Current Structure
```
server/
├── app.js (Express app setup)
├── controllers/
│   └── toolsController.js (Image compression, PDF merging)
├── routes/
│   └── api.js (API endpoints)
├── utils/
│   ├── imageCompressor.js (Empty file)
│   └── pdfMerge.js (PDF merging utility)
└── package.json (Dependencies)
```

### Proposed Structure
```
server/
├── app.js (Express app setup)
├── controllers/
│   └── toolsController.js (All tool functions)
├── routes/
│   └── api.js (API endpoints for all tools)
├── utils/
│   ├── imageCompressor.js (Image compression utility)
│   ├── imageConverter.js (Image conversion utility)
│   ├── imageResizer.js (Image resizing utility)
│   ├── pdfMerge.js (PDF merging utility)
│   ├── pdfEditor.js (PDF editing utility)
│   └── ocrProcessor.js (OCR processing utility)
├── storage/
│   └── tempStorage.js (Temporary file storage for premium features)
└── package.json (Updated dependencies)
```

## Frontend Architecture

### Current Structure
```
frontend/client/src/
├── App.vue (Main app component)
├── main.js (Entry point)
├── assets/
│   ├── base.css
│   ├── logo.svg
│   └── main.css
├── components/
│   ├── AdBanner.vue (Advertisement component)
│   ├── FileDrop.vue (File upload component)
│   ├── ToolCard.vue (Tool card component)
│   ├── pages/
│   │   ├── Home.vue (Homepage)
│   │   ├── Compress.vue (Image compression page)
│   │   ├── MergePdf.vue (PDF merging page)
│   │   └── Extras.vue (Empty - will contain new features)
│   └── router/
│       └── index.js (Routing configuration)
└── package.json (Dependencies)
```

### Proposed Structure
```
frontend/client/src/
├── App.vue (Main app component)
├── main.js (Entry point)
├── assets/
│   ├── base.css
│   ├── logo.svg
│   └── main.css
├── components/
│   ├── AdBanner.vue (Advertisement component)
│   ├── FileDrop.vue (File upload component)
│   ├── ToolCard.vue (Tool card component)
│   ├── pages/
│   │   ├── Home.vue (Homepage)
│   │   ├── Compress.vue (Image compression page)
│   │   ├── MergePdf.vue (PDF merging page)
│   │   ├── ImageConverter.vue (Image conversion page)
│   │   ├── OcrReader.vue (OCR processing page)
│   │   ├── PdfEditor.vue (PDF editor page)
│   │   ├── ImageResizer.vue (Image resizing page)
│   │   └── Extras.vue (Premium features page)
│   └── router/
│       └── index.js (Updated routing configuration)
└── package.json (Dependencies)
```

## Feature Implementation Details

### 1. Image Converter
- **Backend**: Create `imageConverter.js` utility using Sharp library
- **Frontend**: Create `ImageConverter.vue` page component
- **API Endpoint**: `/api/convert-image`
- **Dependencies**: Sharp (already installed)

### 2. OCR Online
- **Backend**: Create `ocrProcessor.js` utility using Tesseract.js
- **Frontend**: Create `OcrReader.vue` page component
- **API Endpoint**: `/api/ocr-process`
- **Dependencies**: Tesseract.js

### 3. Basic PDF Editor
- **Backend**: Create `pdfEditor.js` utility using pdf-lib
- **Frontend**: Create `PdfEditor.vue` page component
- **API Endpoint**: `/api/edit-pdf`
- **Dependencies**: pdf-lib (already installed)

### 4. Image Resizer
- **Backend**: Create `imageResizer.js` utility using Sharp library
- **Frontend**: Create `ImageResizer.vue` page component
- **API Endpoint**: `/api/resize-image`
- **Dependencies**: Sharp (already installed)

### 5. Premium Features
- **Batch Download**: Implement zip file creation for multiple files
- **Temporary Storage**: Create temporary file storage system with 24h expiration
- **Backend**: Create `tempStorage.js` utility
- **Frontend**: Update `Extras.vue` page component
- **API Endpoint**: `/api/batch-download`, `/api/temp-storage`
- **Dependencies**: archiver (for zip creation), node-cron (for cleanup)

## Attention-Grabbing Elements Implementation

### File Limits
- Increase file size limits in Express middleware
- Display clear messaging about generous limits (50MB vs 10MB)

### No Watermarks
- Ensure all processed files are clean without any branding
- Add messaging to highlight this feature

### Fast Processing
- Optimize processing algorithms
- Implement progress indicators
- Add messaging about fast processing

## Integration Points

### Backend Integration
1. Update `toolsController.js` to include new tool functions
2. Update `api.js` to add new routes
3. Update `server/package.json` to add new dependencies

### Frontend Integration
1. Update `App.vue` navigation to include new tools
2. Update `Home.vue` to display new tool cards
3. Update `router/index.js` to add new routes
4. Update `main.js` if needed for new global components

## Implementation Order
1. Image Converter
2. Image Resizer
3. PDF Editor
4. OCR Online
5. Premium Features
6. Attention-Grabbing Elements
7. UI/UX Design
8. Testing and Optimization

## Dependencies to Install
- tesseract.js (for OCR functionality)
- archiver (for batch download functionality)
- node-cron (for temporary storage cleanup)