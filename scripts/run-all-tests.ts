import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/db";
import { auth } from "../src/lib/auth/auth";
import { foldersService } from "../src/services/folders.service";
import { documentsService } from "../src/services/documents.service";
import { topicsService } from "../src/services/topics.service";
import { bookmarksService } from "../src/services/bookmarks.service";
import { tagsService } from "../src/services/tags.service";
import { profileService } from "../src/services/profile.service";
import { preferencesService } from "../src/services/preferences.service";
import { searchService } from "../src/services/search.service";
import { registerSchema } from "../src/lib/validation/auth";
import { user, session, profiles, userPreferences } from "../src/lib/db/schema";
import { eq, or } from "drizzle-orm";
import pg from "pg";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log("==================================================");
  console.log("STARTING NOTENEST PHASE 1 TEST SUITE");
  console.log("==================================================\n");

  const testEmail1 = `notenest.test1.${Date.now()}@example.com`;
  const testEmail2 = `notenest.test2.${Date.now()}@example.com`;
  const testPassword = "Password123!";

  let user1Id = "";
  let user2Id = "";

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: DATABASE SCHEMA & METADATA VERIFICATION
    // ----------------------------------------------------
    console.log("SECTION 1: Database Schema & Connectivity Verification");
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name;
    `);
    const tableNames = tablesRes.rows.map((r) => r.table_name);

    const requiredAuthTables = ["user", "session", "account", "verification"];
    const requiredAppTables = [
      "profiles",
      "user_preferences",
      "folders",
      "documents",
      "topics",
      "topic_versions",
      "processing_jobs",
      "document_pages",
      "extraction_drafts",
      "extraction_draft_nodes",
      "assets",
      "storage_objects",
      "storage_deletion_jobs",
      "bookmarks",
      "tags",
      "topic_tags",
      "recent_views",
    ];

    for (const t of requiredAuthTables) {
      assert(tableNames.includes(t), `Auth table 'public.${t}' exists`);
    }

    for (const t of requiredAppTables) {
      assert(tableNames.includes(t), `Application table 'public.${t}' exists`);
    }

    // Check indexes
    const indexesRes = await client.query(`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
    `);
    const indexNames = indexesRes.rows.map((r) => r.indexname);
    assert(indexNames.includes("folders_user_id_parent_id_idx"), "Index folders(user_id, parent_id) exists");
    assert(indexNames.includes("documents_user_id_folder_id_idx"), "Index documents(user_id, folder_id) exists");
    assert(indexNames.includes("topics_doc_id_parent_pos_idx"), "Index topics(document_id, parent_topic_id, position) exists");
    assert(indexNames.includes("topic_versions_topic_id_version_idx"), "Index topic_versions(topic_id, version_number) exists");
    assert(indexNames.includes("bookmarks_user_id_topic_id_idx"), "Index bookmarks(user_id, topic_id) exists");
    assert(indexNames.includes("tags_user_id_name_idx"), "Index tags(user_id, name) exists");
    assert(indexNames.includes("folders_name_trgm_idx"), "Trigram GIN index on folders(name) exists");
    assert(indexNames.includes("topics_fts_idx"), "Full-Text Search GIN index on topics exists");

    await client.end();
    console.log();

    // ----------------------------------------------------
    // TEST SUITE 2: AUTHENTICATION
    // ----------------------------------------------------
    console.log("SECTION 2: Authentication System Verification");

    // 2.1 Validation
    let weakPassFailed = false;
    try {
      registerSchema.parse({
        fullName: "Test User",
        email: "test@example.com",
        password: "weak",
        confirmPassword: "weak",
      });
    } catch {
      weakPassFailed = true;
    }
    assert(weakPassFailed, "Zod rejects weak password (< 8 chars, missing uppercase/number)");

    let invalidEmailFailed = false;
    try {
      registerSchema.parse({
        fullName: "Test User",
        email: "invalid-email-format",
        password: testPassword,
        confirmPassword: testPassword,
      });
    } catch {
      invalidEmailFailed = true;
    }
    assert(invalidEmailFailed, "Zod rejects invalid email format");

    // 2.2 User 1 Registration
    const regRes1 = await auth.api.signUpEmail({
      body: {
        name: "Scholar One",
        email: testEmail1,
        password: testPassword,
      },
    });

    assert(Boolean(regRes1?.user?.id), "User 1 registered successfully with stable ID");
    user1Id = regRes1.user.id;

    // Check auto-creation of profile and preferences
    const profile1 = await profileService.getProfile(user1Id);
    assert(Boolean(profile1 && profile1.id === user1Id), "Profile automatically created after registration");

    const prefs1 = await preferencesService.getPreferences(user1Id);
    assert(Boolean(prefs1 && prefs1.theme === "system"), "Default preferences initialized with 'system' theme");

    // 2.3 Reject duplicate email
    let duplicateRejected = false;
    try {
      await auth.api.signUpEmail({
        body: {
          name: "Duplicate User",
          email: testEmail1,
          password: testPassword,
        },
      });
    } catch {
      duplicateRejected = true;
    }
    assert(duplicateRejected, "Better Auth rejects duplicate email registration");

    // 2.4 Login with valid credentials
    const loginRes = await auth.api.signInEmail({
      body: {
        email: testEmail1,
        password: testPassword,
      },
    });
    assert(Boolean(loginRes?.user?.id === user1Id && loginRes?.token), "Login succeeds with valid credentials and returns active session");

    // 2.5 Login with invalid credentials
    let invalidLoginRejected = false;
    try {
      await auth.api.signInEmail({
        body: {
          email: testEmail1,
          password: "WrongPassword999!",
        },
      });
    } catch {
      invalidLoginRejected = true;
    }
    assert(invalidLoginRejected, "Login rejected for invalid password");

    // 2.6 Register User 2 for multi-tenant isolation tests
    const regRes2 = await auth.api.signUpEmail({
      body: {
        name: "Scholar Two",
        email: testEmail2,
        password: testPassword,
      },
    });
    user2Id = regRes2.user.id;
    assert(Boolean(user2Id && user2Id !== user1Id), "User 2 registered for cross-user isolation verification");
    console.log();

    // ----------------------------------------------------
    // TEST SUITE 3: FOLDERS & HIERARCHY RULES
    // ----------------------------------------------------
    console.log("SECTION 3: Folders & Unlimited Nesting Rules");

    const rootFolder = await foldersService.createFolder(user1Id, {
      name: "Computer Science",
    });
    assert(Boolean(rootFolder?.id), "User 1 created root folder");

    const subFolder1 = await foldersService.createFolder(user1Id, {
      name: "Algorithms",
      parentFolderId: rootFolder.id,
    });
    assert(Boolean(subFolder1?.parentFolderId === rootFolder.id), "Nested subfolder created (Depth 1)");

    const subFolder2 = await foldersService.createFolder(user1Id, {
      name: "Dynamic Programming",
      parentFolderId: subFolder1.id,
    });
    assert(Boolean(subFolder2?.parentFolderId === subFolder1.id), "Nested subfolder created (Depth 2)");

    // Prevent circular folder reference
    let circularFolderPrevented = false;
    try {
      await foldersService.updateFolder(rootFolder.id, user1Id, {
        parentFolderId: subFolder2.id,
      });
    } catch (err: any) {
      circularFolderPrevented = true;
    }
    assert(circularFolderPrevented, "Circular folder hierarchy detected and rejected (root cannot be child of descendant)");

    // User 2 cannot access or modify User 1's folder
    let crossFolderForbidden = false;
    try {
      await foldersService.getFolderById(rootFolder.id, user2Id);
    } catch {
      crossFolderForbidden = true;
    }
    assert(crossFolderForbidden, "User 2 cannot read User 1's folder (404/Isolated)");

    let crossFolderParentForbidden = false;
    try {
      await foldersService.createFolder(user2Id, {
        name: "Unauthorized Folder",
        parentFolderId: rootFolder.id, // User 1's folder
      });
    } catch {
      crossFolderParentForbidden = true;
    }
    assert(crossFolderParentForbidden, "User 2 cannot create folder with User 1's folder as parent");
    console.log();

    // ----------------------------------------------------
    // TEST SUITE 4: DOCUMENTS & TOPICS WITH VERSIONING
    // ----------------------------------------------------
    console.log("SECTION 4: Documents, Topics, Unlimited Nesting & Versioning");

    const doc1 = await documentsService.createDocument(user1Id, {
      title: "Introduction to Algorithms",
      description: "Core algorithms and asymptotic notation",
      folderId: subFolder2.id,
      sourceType: "manual",
    });
    assert(Boolean(doc1?.id), "User 1 created manual document inside nested folder");

    // User 2 cannot read User 1's document
    let crossDocForbidden = false;
    try {
      await documentsService.getDocumentById(doc1.id, user2Id);
    } catch {
      crossDocForbidden = true;
    }
    assert(crossDocForbidden, "User 2 cannot read User 1's document (Tenant Isolation)");

    // Create topic
    const topic1 = await topicsService.createTopic(user1Id, {
      documentId: doc1.id,
      title: "Divide and Conquer",
      content: { type: "doc", content: [{ type: "paragraph", text: "Initial divide & conquer notes" }] },
      plainText: "Initial divide & conquer notes",
    });
    assert(Boolean(topic1?.id), "Topic 1 created with initial version snapshot (v1)");

    const subTopic1 = await topicsService.createTopic(user1Id, {
      documentId: doc1.id,
      parentTopicId: topic1.id,
      title: "Merge Sort",
      content: { type: "doc", content: [{ type: "paragraph", text: "O(n log n) sorting algorithm" }] },
      plainText: "O(n log n) sorting algorithm",
    });
    assert(Boolean(subTopic1?.parentTopicId === topic1.id), "Nested subtopic created under Topic 1");

    // Prevent circular topic reference
    let circularTopicPrevented = false;
    try {
      await topicsService.updateTopic(topic1.id, user1Id, {
        parentTopicId: subTopic1.id,
      });
    } catch {
      circularTopicPrevented = true;
    }
    assert(circularTopicPrevented, "Circular topic hierarchy detected and rejected");

    // Version snapshotting on update
    await topicsService.updateTopic(topic1.id, user1Id, {
      title: "Divide and Conquer Paradigms",
      content: { type: "doc", content: [{ type: "paragraph", text: "Updated revision of D&C paradigms" }] },
      plainText: "Updated revision of D&C paradigms",
      createSnapshot: true,
    });

    const versions = await topicsService.getTopicVersions(topic1.id, user1Id);
    assert(versions.length >= 2, `Topic versions tracked automatically (Found ${versions.length} versions)`);

    // Restore previous version
    const v1 = versions.find((v) => v.versionNumber === 1);
    assert(Boolean(v1), "Found Version 1 in snapshot history");
    if (v1) {
      const restored = await topicsService.restoreTopicVersion(topic1.id, v1.id, user1Id);
      assert(
        restored.title === "Divide and Conquer",
        "Topic version restoration successfully reverted title and content to v1 snapshot"
      );
    }

    // User 2 cannot modify User 1's topic
    let crossTopicModifyForbidden = false;
    try {
      await topicsService.updateTopic(topic1.id, user2Id, {
        title: "Malicious Tampering",
      });
    } catch {
      crossTopicModifyForbidden = true;
    }
    assert(crossTopicModifyForbidden, "User 2 cannot update or tamper with User 1's topic");
    console.log();

    // ----------------------------------------------------
    // TEST SUITE 5: BOOKMARKS, TAGS & RECENT VIEWS
    // ----------------------------------------------------
    console.log("SECTION 5: Bookmarks, Tags, and Recent Views");

    const bookmark = await bookmarksService.createBookmark(user1Id, {
      topicId: topic1.id,
    });
    assert(Boolean(bookmark?.id), "Bookmark created for Topic 1");

    // Unique bookmark constraint (no duplicate bookmarks per user/topic)
    const duplicateBookmark = await bookmarksService.createBookmark(user1Id, {
      topicId: topic1.id,
    });
    assert(duplicateBookmark?.id === bookmark?.id, "Duplicate bookmark gracefully handled (idempotent unique constraint)");

    const user1Bookmarks = await bookmarksService.getBookmarks(user1Id);
    const user2Bookmarks = await bookmarksService.getBookmarks(user2Id);
    assert(user1Bookmarks.length === 1 && user2Bookmarks.length === 0, "Bookmarks isolated per authenticated user");

    // Tags
    const tag = await tagsService.createTag(user1Id, {
      name: "ExamPrep",
      color: "#1F6B4D",
    });
    assert(Boolean(tag?.id), "Tag 'ExamPrep' created with natural forest green color");

    let duplicateTagForbidden = false;
    try {
      await tagsService.createTag(user1Id, { name: "ExamPrep" });
    } catch {
      duplicateTagForbidden = true;
    }
    assert(duplicateTagForbidden, "Duplicate tag name per user rejected");

    // Search foundation
    const searchRes = await searchService.search(user1Id, {
      q: "Divide",
      type: "all",
    });
    assert(searchRes.topics.length > 0, "Full-Text Search foundation successfully retrieves matching topics");
    console.log();

    // ----------------------------------------------------
    // TEST SUITE 6: DOCUMENT DELETION STRATEGIES
    // ----------------------------------------------------
    console.log("SECTION 6: Document Deletion Strategies");

    // Option 2: Delete PDF only
    const pdfDoc = await documentsService.createDocument(user1Id, {
      title: "PDF Lecture Notes",
      sourceType: "pdf",
      originalFileKey: "storage/test-pdf-1.pdf",
      originalFileName: "test-pdf-1.pdf",
      fileSizeBytes: 1048576,
      mimeType: "application/pdf",
    });
    const pdfTopic = await topicsService.createTopic(user1Id, {
      documentId: pdfDoc.id,
      title: "Extracted Chapter 1",
      plainText: "Notes extracted from PDF",
    });

    const deletePdfOnlyRes = await documentsService.deleteDocument(pdfDoc.id, user1Id, {
      strategy: "pdf_only",
    });
    assert(
      deletePdfOnlyRes?.originalFileKey === null && deletePdfOnlyRes?.fileSizeBytes === 0,
      "Strategy 'pdf_only' cleared PDF reference and file size"
    );

    const retainedDoc = await documentsService.getDocumentById(pdfDoc.id, user1Id);
    const retainedTopic = await topicsService.getTopicById(pdfTopic.id, user1Id);
    assert(
      Boolean(retainedDoc && retainedTopic),
      "Strategy 'pdf_only' preserved document entity and extracted notes"
    );

    // Option 1: Complete deletion
    await documentsService.deleteDocument(pdfDoc.id, user1Id, {
      strategy: "all",
    });

    let docDeleted = false;
    try {
      await documentsService.getDocumentById(pdfDoc.id, user1Id);
    } catch {
      docDeleted = true;
    }
    assert(docDeleted, "Strategy 'all' completely deleted the document and cascaded");
    console.log();

  } catch (err: any) {
    console.error("Test Suite Runtime Error:", err);
    failedCount++;
  } finally {
    // Clean up test users
    console.log("Cleaning up test records...");
    if (user1Id || user2Id) {
      await db.delete(user).where(or(eq(user.id, user1Id), eq(user.id, user2Id)));
    }
    console.log("Test records cleaned up.\n");
  }

  console.log("==================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite();
