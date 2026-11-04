# NoteNest — Modern Knowledge Management & Topic Retrieval

> **Phase 1: Frontend Workspace Prototype**  
> Desktop-first study workspace designed for developers and computer science students to rapidly organize, search, and retrieve specific topics from study notes, cheatsheets, and lecture materials.

---

## 🧭 Knowledge Hierarchy

NoteNest structures knowledge in a 5-tier architecture:
```
Library
  └── Subject / Collection (e.g. Java Development, Machine Learning, Web Development, Computer Networks)
        └── Document (e.g. Spring Boot Notes, ML Revision, React Notes, Network Fundamentals)
              └── Topic (e.g. Dependency Injection, K-Means Clustering, useEffect, OSI Model)
                    └── Subtopics, Formulas, Diagrams, and Code Snippets
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or newer (tested with Node.js v22.23.1)
- **npm**: v10 or newer (tested with npm 11.12.0)

### Installation & Run

1. **Navigate to the project root**:
   ```bash
   cd notenest
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Verify TypeScript & Linting**:
   ```bash
   npm run lint
   ```

5. **Create a production build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🛠️ Implemented Features (Phase 1)

### 1. Left Navigation Sidebar
- **Brand & Edition Indicator**: NoteNest header with Phase 1 status pill.
- **Library Navigation**: Quick links with item counts for **Library Dashboard**, **All Documents**, **Recently Opened**, **Bookmarks**, and **Trash**.
- **Hierarchical Collection Tree**:
  - Expandable and collapsible subject collections.
  - Nested documents with individual topic expanders.
  - Active selection styling and color coding.
- **Quick Collection Creation**: (+) action button opening the creation dialog.
- **Workspace Reset**: Instant reset action to restore default study notes.
- **Responsive Drawer**: Turns into an accessible sliding drawer on smaller screen sizes.

### 2. Top Bar & Global Header
- **Dynamic Breadcrumbs**: Clickable multi-tier path (`Library > Subject > Document > Topic`).
- **Global Search Shortcut**: Prominent search bar with `Ctrl + K` trigger.
- **Quick Action Buttons**: `+ New Note` and `Import Document`.
- **User Profile Menu**: Mock profile for software engineering students.

### 3. Library Dashboard
- **Search-First Header**: Centralized search trigger and welcome subtitle.
- **Workspace Metrics**: Real-time counts for Collections, Documents, Indexed Topics, and Bookmarks.
- **Recently Opened Topics Grid**: 1-click jump cards displaying topic summaries.
- **Subject Collections Grid**: Color-coded cards with document count and topic totals.
- **Recently Updated Documents List**: Tabular document breakdown with bookmark toggles.

### 4. Document Explorer
- **Collection View**: Dedicated workspace for documents belonging to a selected collection.
- **Display Modes**: Toggle seamlessly between **Grid Mode** and **List Mode**.
- **Sorting & Filtering**: Real-time filtering by keyword and sorting by **Recently Updated**, **Title (A-Z)**, or **Topic Count**.
- **Nested Topic Outline**: Expandable outline preview right on each document card with 1-click topic reading.
- **Item Actions**: Open, inline Rename, Bookmark toggle, and Delete with destructive confirmation dialogs.

### 5. Topic Reader
- **Instant Client-Side Navigation**: Reads notes smoothly without page refreshes.
- **Custom Markdown Renderer**:
  - Headings with jump-link IDs.
  - Fenced code blocks with language labels and 1-click **Copy to Clipboard**.
  - Formatted data tables with horizontal scroll guards.
  - GitHub-style callouts (`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`).
  - Mathematical formulas (`$$...$$` and `$w_0 + w_1 x_1$`).
- **Sticky Desktop Outline**: Dynamic Table of Contents sidebar for rapid section jumping.
- **Sibling Document Topics**: Quick-switching list to traverse adjacent notes in the same document.
- **Original PDF Action**: Triggers a Phase 3 preview modal detailing synchronized dual-pane PDF reading.

### 6. Note Editor
- **Full Markdown Editor**: Create brand new topics or edit existing notes.
- **Dual & Split Preview**: Switch between **Write**, **Live Preview**, and **Split Screen** viewports.
- **Formatting Toolbar**: Quick insertion for Bold, Italic, H2, H3, Lists, Code, Tables, Quotes, and Links.
- **Keyboard Shortcuts**: `Ctrl + S` to save, `Tab` for indentation.
- **Unsaved Changes Guard**: Prompts confirmation before discarding dirty notes.

### 7. Global Search (Client-Side)
- **Full-Text Matching**: Searches across topic titles, parent document names, subject collections, and full note content.
- **Category Filter Tabs**: Filter by *All*, *Topics*, *Documents*, or *Collections*.
- **Keyboard Friendly**: Navigate results with `Up` / `Down` arrows, select with `Enter`, close with `Esc`.
- **Match Excerpts**: Generates contextual snippets surrounding matched queries.

### 8. Create Collection Dialog
- Modal with custom collection name, description, 7 color themes, and 6 domain icons.
- Validates empty strings and checks for duplicate collection names.

### 9. Import Document Dialog
- Functional drag-and-drop file uploader for `.pdf` and `.txt` files.
- Accepts and displays file names and sizes locally.
- Explicitly informs the user that cloud storage, OCR extraction, and page citations will be connected in Phase 3.

---

## 📚 Study Notes Dataset Included

Realistic, detailed study notes have been authored for:

1. **Java Development** (`Spring Boot Notes`):
   - Introduction to Spring Boot
   - Dependency Injection & IoC
   - Spring MVC Request Flow
   - Layered Architecture (Controller, Service, Repository)
   - Spring Data JPA & Hibernate
2. **Machine Learning** (`Machine Learning Revision`):
   - Linear Regression & Gradient Descent
   - Logistic Regression & Cross-Entropy
   - Decision Trees (Gini Impurity & Information Gain)
   - Random Forest (Bagging & Feature Subsets)
   - K-Means Clustering & The Elbow Method
3. **Web Development** (`React Notes`):
   - Props and State Primitives
   - useEffect, Lifecycle & Dependencies
   - React Router & Single-Page Architecture
4. **Computer Networks** (`Network Fundamentals`):
   - 7-Layer OSI Reference Model
   - Error Detection (Parity, Checksums, CRC)
   - Stop-and-Wait ARQ Protocol

---

## 🏛️ Architecture & Separation of Concerns

```
notenest/
├── src/
│   ├── app/
│   │   ├── globals.css           # Refined dark developer workspace styling & scrollbars
│   │   ├── layout.tsx            # Root layout with fonts and client providers
│   │   └── page.tsx              # Main entry point mounting MainWorkspace
│   ├── types/
│   │   └── index.ts              # Domain types (Collection, DocumentItem, Topic, ViewType)
│   ├── lib/
│   │   ├── mock-data.ts          # Structured study datasets
│   │   └── knowledge-service.ts  # Isolated data repository interface (ready for Phase 2 Supabase swap)
│   ├── context/
│   │   └── knowledge-context.tsx # Application state, view routing, modals, and persistent cache
│   └── components/
│       ├── layout/               # Sidebar and TopBar
│       ├── dashboard/            # LibraryDashboard overview
│       ├── explorer/             # DocumentExplorer and AllDocumentsView
│       ├── reader/               # TopicReader and MarkdownRenderer
│       ├── editor/               # NoteEditor with markdown preview & split-screen
│       ├── search/               # GlobalSearchModal (Ctrl+K)
│       ├── dialogs/              # CreateCollection, ImportDocument, Confirm, PdfPlaceholder
│       ├── providers/            # ClientProviders wrapper
│       └── ui/                   # Toast notification system
```

### Phase 2 Readiness (Supabase Integration)
The entire data access layer is abstracted in `src/lib/knowledge-service.ts`. In Phase 2:
- Replace `LocalKnowledgeRepository` methods (`getCollections`, `createTopic`, `search`, etc.) with Supabase client queries (`supabase.from('topics').select(...)`).
- UI components and context hooks will remain untouched, ensuring a seamless migration without UI rewrites.

---

## 🧪 Verification & Test Commands Run

- **TypeScript Verification**: Passed with 0 errors (`npm run build`).
- **ESLint Validation**: Passed with 0 errors and 0 warnings (`npm run lint`).
- **Production Build**: Successfully generated static and dynamic routes.
- **Server Execution**: Development server running on port 3000 with hot module reloading verified.
