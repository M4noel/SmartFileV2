# UI/UX Design Plan for New Features

## Overview
This document outlines the UI/UX design for the new features to be implemented in the Vue/Node.js website. The design focuses on maintaining consistency with the existing interface while providing intuitive user experiences for each new tool.

## Design Principles
1. Consistency with existing design language
2. Intuitive file upload and processing workflows
3. Clear visual feedback during processing
4. Responsive design for all device sizes
5. Prominent advertising placement without disrupting UX
6. Clear messaging about premium features and benefits

## Color Scheme & Styling
- Primary color: #2a75ff (existing)
- Secondary color: #4a90e2 (existing)
- Success color: #2b8a3e (existing)
- Error color: #ff6b6b (existing)
- Background: #f5f5f5 (existing)
- Cards: White with subtle shadows
- Buttons: Consistent with existing style

## Common UI Components
1. FileDrop Component (already exists, will be reused)
2. Processing Indicator (new)
3. Result Display (new)
4. AdBanner Component (already exists, will be reused)

## Feature-Specific Designs

### 1. Image Converter

#### Page Structure
```
[Header: "🖼️ Converter de Imagens"]
[Subtitle: "Converta entre formatos (JPG, PNG, WEBP, SVG, etc.)"]

[FileDrop Component]
[Format Selection Dropdown: JPG, PNG, WEBP, SVG, etc.]
[Convert Button]

[AdBanner Component (300x250)]

[Preview Area (if applicable)]
[Result Display with Download Link]
```

#### User Flow
1. User uploads an image file
2. User selects output format from dropdown
3. User clicks "Converter" button
4. Processing indicator appears
5. Result is displayed with download link

### 2. OCR Online

#### Page Structure
```
[Header: "🔍 OCR Online"]
[Subtitle: "Extraia texto de imagens ou PDFs"]

[FileDrop Component (accepts images and PDFs)]

[OCR Options:
 - Language Selection (Portuguese, English, Spanish, etc.)
 - Output Format (Plain Text, PDF, Word Document)
]

[Process Button]

[AdBanner Component (300x250)]

[Result Display Area with Text Preview]
[Download Options for different formats]
```

#### User Flow
1. User uploads an image or PDF file
2. User selects OCR options (language, output format)
3. User clicks "Processar" button
4. Processing indicator appears
5. Extracted text is displayed
6. User can download in different formats

### 3. Basic PDF Editor

#### Page Structure
```
[Header: "✏️ Editor de PDF"]
[Subtitle: "Rotacione, divida, extraia páginas ou adicione marcas d'água"]

[FileDrop Component (accepts PDFs only)]

[Editor Options Tabs:
 - Rotate Pages
 - Split PDF
 - Extract Pages
 - Add Watermark
]

[Rotate Pages Tab:
 - Preview of PDF pages
 - Rotate buttons (90°, 180°, 270°)
 - Apply to all or selected pages
]

[Split PDF Tab:
 - Split by page count (every X pages)
 - Split by file size
 - Manual split points
]

[Extract Pages Tab:
 - Page selector (checkboxes for each page)
 - Extract selected pages button
]

[Add Watermark Tab:
 - Text watermark input
 - Image watermark upload
 - Position selector
 - Opacity control
]

[Process Button]

[AdBanner Component (300x250)]

[Result Display with Download Link]
```

#### User Flow
1. User uploads a PDF file
2. User selects an editing operation from tabs
3. User configures options for the selected operation
4. User clicks "Processar" button
5. Processing indicator appears
6. Result is displayed with download link

### 4. Image Resizer

#### Page Structure
```
[Header: "📐 Redimensionar Imagem"]
[Subtitle: "Altere dimensões (pixels) sem perder qualidade"]

[FileDrop Component]

[Resize Options:
 - Width input (pixels)
 - Height input (pixels)
 - Maintain aspect ratio checkbox
 - Resize method (Stretch, Fit, Fill, etc.)
]

[Preview of current dimensions]
[Preview of new dimensions]

[Resize Button]

[AdBanner Component (300x250)]

[Result Display with Download Link]
```

#### User Flow
1. User uploads an image file
2. Current dimensions are displayed
3. User inputs new dimensions
4. User selects resize options
5. User clicks "Redimensionar" button
6. Processing indicator appears
7. Result is displayed with download link

### 5. Premium Features Page

#### Page Structure
```
[Header: "⭐ Recursos Premium"]
[Subtitle: "Funcionalidades avançadas gratuitamente"]

[Feature Cards:
 - Batch Download
 - Temporary Storage (24h)
]

[Batch Download Card:
 - Description: "Baixe vários arquivos processados de uma vez"
 - How it works: "Process multiple files and download them all in a single ZIP"
 - File List Component showing processed files
 - "Download All as ZIP" button
]

[Temporary Storage Card:
 - Description: "Seus arquivos ficam disponíveis por 24h para download"
 - How it works: "No registration required. Files automatically deleted after 24h"
 - File List Component showing stored files with expiration times
 - Individual download buttons
]

[AdBanner Component (728x90)]
```

## Attention-Grabbing Elements

### File Limits Badge
- Position: Next to tool titles
- Text: "Até 50 MB por arquivo"
- Style: Green badge with white text

### No Watermark Badge
- Position: Next to tool titles
- Text: "Sem marca d'água"
- Style: Blue badge with white text

### Speed Indicator
- Position: In tool descriptions
- Text: "Processamento em segundos - Sem filas!"
- Style: Small, italicized text in green

## Responsive Design Considerations
1. All pages will be fully responsive
2. FileDrop component will adapt to mobile screens
3. Complex options will stack vertically on small screens
4. Result displays will be scrollable on small screens if needed
5. Ad banners will use appropriate sizes for different viewports

## Accessibility Features
1. Proper contrast ratios for all text
2. Keyboard navigation support
3. Screen reader-friendly labels
4. Focus indicators for interactive elements
5. ARIA attributes where needed

## Error Handling UI
1. Clear error messages for invalid file types
2. File size limit warnings
3. Processing error notifications
4. Retry options for failed operations
5. User-friendly error explanations

## Loading States
1. Skeleton screens for file previews
2. Progress bars for long processing operations
3. Clear status messages during processing
4. Cancel options for long operations