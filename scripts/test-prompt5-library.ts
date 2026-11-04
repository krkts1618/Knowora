import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/db";
import { auth } from "../src/lib/auth/auth";
import { foldersService } from "../src/services/folders.service";
import { documentsService } from "../src/services/documents.service";
import { topicsService } from "../src/services/topics.service";
import { user } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

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

async function runPrompt5Tests() {
  console.log("==================================================");
  console.log("STARTING PROMPT 5: LIBRARY, FOLDERS & DOCUMENTS VERIFICATION");
  console.log("==================================================\n");

  const testEmail = `library.test.${Date.now()}@example.com`;
  const testPassword = "Password123!";
  let testUserId = "";

  try {
    // 1. Create authenticated test user
    const regRes = await auth.api.signUpEmail({
      body: {
        name: "Library Tester",
        email: testEmail,
        password: testPassword,
      },
    });
    testUserId = regRes.user.id;
    assert(Boolean(testUserId), "Test user created for Library management verification");

    // 2. Folder Hierarchy & Unlimited Nesting
    console.log("\n--- Testing Unlimited Folder Nesting & Recursive Path ---");
    const rootA = await foldersService.createFolder(testUserId, { name: "Engineering" });
    const subL1 = await foldersService.createFolder(testUserId, { name: "Computer Science", parentFolderId: rootA.id });
    const subL2 = await foldersService.createFolder(testUserId, { name: "Operating Systems", parentFolderId: subL1.id });
    const subL3 = await foldersService.createFolder(testUserId, { name: "Memory Management", parentFolderId: subL2.id });

    assert(Boolean(subL3.id), "Created 4-level deep nested folder structure");

    // Recursive Path verification via CTE
    const pathNodes = await foldersService.getFolderPath(subL3.id, testUserId);
    assert(pathNodes.length === 4, `Recursive path CTE resolved exactly 4 ancestors (Found: ${pathNodes.length})`);
    assert(pathNodes[0]?.name === "Engineering", "First breadcrumb node is Root ('Engineering')");
    assert(pathNodes[3]?.name === "Memory Management", "Leaf breadcrumb node is 'Memory Management'");

    // 3. Circular Nesting Loop Prevention
    console.log("\n--- Testing Circular Move Prevention ---");
    let circularPrevented = false;
    try {
      await foldersService.updateFolder(rootA.id, testUserId, { parentFolderId: subL3.id });
    } catch {
      circularPrevented = true;
    }
    assert(circularPrevented, "Circular nesting rejected: Root folder cannot be moved into its descendant subfolder");

    let selfMovePrevented = false;
    try {
      await foldersService.updateFolder(subL1.id, testUserId, { parentFolderId: subL1.id });
    } catch {
      selfMovePrevented = true;
    }
    assert(selfMovePrevented, "Folder cannot be set as its own parent");

    // 4. Folder Renaming
    console.log("\n--- Testing Folder Renaming ---");
    const renamed = await foldersService.updateFolder(subL3.id, testUserId, { name: "Virtual Memory & Paging" });
    assert(renamed.name === "Virtual Memory & Paging", "Folder renamed successfully");

    // 5. Document Management
    console.log("\n--- Testing Manual Document Creation & Metadata ---");
    const doc1 = await documentsService.createDocument(testUserId, {
      title: "Paging and TLB Architecture",
      description: "Detailed study notes on page tables and TLB hit rates",
      folderId: subL3.id,
      sourceType: "manual",
    });
    assert(doc1.title === "Paging and TLB Architecture", "Manual document created with title and description");
    assert(doc1.folderId === subL3.id, "Document assigned to deeply nested folder");

    // Create topic under document
    await topicsService.createTopic(testUserId, {
      documentId: doc1.id,
      title: "Two-Level Page Tables",
      plainText: "Address translation via PDE and PTE registers.",
    });

    // Check item counts on folder and document
    console.log("\n--- Testing Dynamic Item Counts ---");
    const fetchedDoc = await documentsService.getDocumentById(doc1.id, testUserId);
    assert(fetchedDoc.topicCount === 1, `Document topicCount correctly computed via subquery (topicCount=${fetchedDoc.topicCount})`);

    const folderContents = await foldersService.getFolderById(subL2.id, testUserId);
    assert(folderContents.subfolderCount === 1, `subfolderCount correctly computed via subquery (subfolderCount=${folderContents.subfolderCount})`);

    // 6. Moving Document Between Folders and Root
    console.log("\n--- Testing Document Relocation ---");
    const movedDoc = await documentsService.updateDocument(doc1.id, testUserId, {
      folderId: null, // Move to root library
    });
    assert(movedDoc.folderId === null, "Document moved successfully to Root Library");

    const movedBack = await documentsService.updateDocument(doc1.id, testUserId, {
      folderId: rootA.id,
    });
    assert(movedBack.folderId === rootA.id, "Document moved successfully to 'Engineering' folder");

    // 7. Document Editing
    console.log("\n--- Testing Document Editing ---");
    const editedDoc = await documentsService.updateDocument(doc1.id, testUserId, {
      title: "Advanced Virtual Memory Systems",
      description: "Updated memory virtualization lecture notes",
    });
    assert(editedDoc.title === "Advanced Virtual Memory Systems", "Document title updated");
    assert(editedDoc.description === "Updated memory virtualization lecture notes", "Document description updated");

    // 8. Search & Sort Verification
    console.log("\n--- Testing Document Search & Sorting ---");
    const searchDocs = await documentsService.getDocuments(testUserId, { search: "Virtual" });
    assert(searchDocs.items.some((d) => d.id === doc1.id), "Document search by keyword 'Virtual' found document");

    // 9. Document Deletion Strategy
    console.log("\n--- Testing Document Deletion Strategy ---");
    await documentsService.deleteDocument(doc1.id, testUserId, { strategy: "all" });
    let deletedDocCheck = false;
    try {
      await documentsService.getDocumentById(doc1.id, testUserId);
    } catch {
      deletedDocCheck = true;
    }
    assert(deletedDocCheck, "Document deleted and no longer accessible");

    // 10. Folder Deletion Policy
    console.log("\n--- Testing Folder Deletion Policy ---");
    // Create doc inside subL1, delete subL1, confirm doc is preserved in root
    const safeDoc = await documentsService.createDocument(testUserId, {
      title: "Preserved Notes Document",
      folderId: subL1.id,
      sourceType: "manual",
    });
    await foldersService.deleteFolder(subL1.id, testUserId);

    const preservedDoc = await documentsService.getDocumentById(safeDoc.id, testUserId);
    assert(preservedDoc.folderId === null, "Contained document safely relocated to root library when parent folder was deleted");

    console.log("\nPROMPT 5 TEST SUITE COMPLETED SUCCESSFULLY.");
  } catch (err) {
    console.error("Test failed with error:", err);
    failedCount++;
  } finally {
    console.log("Cleaning up test user...");
    if (testUserId) {
      await db.delete(user).where(eq(user.id, testUserId));
    }
    console.log("Cleanup finished.");
  }

  console.log("\n==================================================");
  console.log(`PROMPT 5 SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPrompt5Tests();
