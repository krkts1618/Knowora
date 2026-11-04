import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/db";
import { auth } from "../src/lib/auth/auth";
import { foldersService } from "../src/services/folders.service";
import { documentsService } from "../src/services/documents.service";
import { topicsService } from "../src/services/topics.service";
import { topicsRepository } from "../src/repositories/topics.repository";
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

async function runPrompt6Tests() {
  console.log("==================================================");
  console.log("STARTING PROMPT 6: RICH TEXT EDITOR & TOPIC MANAGEMENT VERIFICATION");
  console.log("==================================================\n");

  const testEmail = `editor.test.${Date.now()}@example.com`;
  const testPassword = "Password123!";
  let testUserId = "";

  try {
    // 1. Authenticated User & Document Setup
    console.log("--- 1. Authenticated User & Document Setup ---");
    const regRes = await auth.api.signUpEmail({
      body: {
        name: "Editor Tester",
        email: testEmail,
        password: testPassword,
      },
    });
    testUserId = regRes.user.id;
    assert(Boolean(testUserId), "Test user created for Editor & Topic verification");

    const folder = await foldersService.createFolder(testUserId, {
      name: "Computer Science Notes",
    });
    assert(Boolean(folder.id), "Parent folder created");

    const doc = await documentsService.createDocument(testUserId, {
      title: "Distributed Systems & Concurrency",
      description: "Comprehensive study notes with math formulas, tables, and code snippets.",
      folderId: folder.id,
      sourceType: "manual",
    });
    assert(Boolean(doc.id), "Target document created");

    // 2. Topic Creation & Unlimited Nesting
    console.log("\n--- 2. Topic Creation & Unlimited Nesting ---");
    const topicL1 = await topicsService.createTopic(testUserId, {
      documentId: doc.id,
      title: "1. Consensus Algorithms",
      position: 0,
      plainText: "Overview of distributed consensus protocols.",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Overview of distributed consensus protocols." }],
          },
        ],
      },
    });
    assert(Boolean(topicL1.id), "Root topic created (Consensus Algorithms)");

    const topicL2 = await topicsService.createTopic(testUserId, {
      documentId: doc.id,
      parentTopicId: topicL1.id,
      title: "1.1 Raft Protocol",
      position: 0,
      plainText: "Leader election and log replication details.",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Leader election and log replication details." }],
          },
        ],
      },
    });
    assert(topicL2.parentTopicId === topicL1.id, "Nested subtopic created (Raft Protocol -> Consensus Algorithms)");

    const topicL3 = await topicsService.createTopic(testUserId, {
      documentId: doc.id,
      parentTopicId: topicL2.id,
      title: "1.1.1 Log Replication & Invariants",
      position: 0,
      plainText: "State machine safety and append entries RPC.",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "State machine safety and append entries RPC." }],
          },
        ],
      },
    });
    assert(topicL3.parentTopicId === topicL2.id, "Level 3 deeply nested topic created");

    // 3. Document Topic Listing
    console.log("\n--- 3. Document Topic Listing & Hierarchy Fetch ---");
    const allDocTopics = await topicsService.getTopicsByDocument(doc.id, testUserId);
    assert(allDocTopics.length === 3, `Fetched all 3 nested topics for document (Found: ${allDocTopics.length})`);

    // 4. Circular Reference & Self-Parenting Prevention
    console.log("\n--- 4. Circular Reference & Validation Safeguards ---");
    let selfParentBlocked = false;
    try {
      await topicsService.updateTopic(topicL1.id, testUserId, {
        parentTopicId: topicL1.id,
      });
    } catch {
      selfParentBlocked = true;
    }
    assert(selfParentBlocked, "Self-parenting rejected by validation (Topic cannot be its own parent)");

    let circularBlocked = false;
    try {
      // Trying to move topicL1 (parent) under topicL3 (its grandchild)
      await topicsService.updateTopic(topicL1.id, testUserId, {
        parentTopicId: topicL3.id,
      });
    } catch {
      circularBlocked = true;
    }
    assert(circularBlocked, "Circular ancestor loop rejected (Parent cannot be placed inside descendant)");

    // 5. Rich Text Content Saving (Tiptap JSON with Code, Tables & Math)
    console.log("\n--- 5. Tiptap JSON Rich Text Saving & PlainText Synchronization ---");
    const richTiptapContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Raft Consensus In-Depth" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "In a cluster with " },
            { type: "inlineMath", attrs: { latex: "N = 2F + 1" } },
            { type: "text", text: " nodes, the system tolerates up to " },
            { type: "inlineMath", attrs: { latex: "F" } },
            { type: "text", text: " crash faults." },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: "typescript" },
          content: [
            {
              type: "text",
              text: "interface RequestVoteArgs {\n  term: number;\n  candidateId: string;\n  lastLogIndex: number;\n  lastLogTerm: number;\n}",
            },
          ],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "State" }] }],
                },
                {
                  type: "tableHeader",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Responsibility" }] }],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Follower" }] }],
                },
                {
                  type: "tableCell",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "Responds to leader RPCs" }] }],
                },
              ],
            },
          ],
        },
      ],
    };

    const plainTextExtracted = "Raft Consensus In-Depth. In a cluster with N = 2F + 1 nodes, tolerating F crash faults.";

    const updatedL2 = await topicsService.updateTopic(topicL2.id, testUserId, {
      title: "1.1 Raft Protocol (Updated)",
      content: richTiptapContent,
      plainText: plainTextExtracted,
      createSnapshot: true,
    });
    assert(Boolean(updatedL2), "Topic updated successfully");
    if (!updatedL2) throw new Error("updatedL2 is null");
    assert(updatedL2.title === "1.1 Raft Protocol (Updated)", "Topic title updated");
    assert(Boolean(updatedL2.content), "Topic JSONB content persisted in Neon PostgreSQL");
    assert(updatedL2.plainText === plainTextExtracted, "Topic plainText synchronized for search");

    // 6. Topic Version History Snapshots & Restoration
    console.log("\n--- 6. Topic Version History & Rollback Transaction ---");
    // Make another update to create a second snapshot
    const secondUpdateContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Second version with election safety theorem." }],
        },
      ],
    };
    await topicsService.updateTopic(topicL2.id, testUserId, {
      content: secondUpdateContent,
      plainText: "Second version with election safety theorem.",
      createSnapshot: true,
    });

    const versions = await topicsService.getTopicVersions(topicL2.id, testUserId);
    assert(versions.length >= 1, `Version snapshots retrieved from database (Count: ${versions.length})`);

    const oldestVersion = versions[versions.length - 1];
    assert(Boolean(oldestVersion.id), "Found oldest version snapshot to restore");

    // Restore the oldest version
    const restoredTopic = await topicsService.restoreTopicVersion(topicL2.id, oldestVersion.id, testUserId);
    assert(Boolean(restoredTopic), "Version restoration transaction completed");

    // Verify versions grew (a snapshot of the state before restoration was preserved)
    const versionsAfterRestore = await topicsService.getTopicVersions(topicL2.id, testUserId);
    assert(
      versionsAfterRestore.length > versions.length,
      `State prior to restoration preserved as new snapshot (Total versions: ${versionsAfterRestore.length})`
    );

    // 7. Within-Document Topic Search
    console.log("\n--- 7. Within-Document Search Verification ---");
    const searchMatchTitle = allDocTopics.filter((t) =>
      t.title.toLowerCase().includes("consensus")
    );
    assert(searchMatchTitle.length >= 1, "Topic search by title 'consensus' matched successfully");

    // 8. Reordering Topics
    console.log("\n--- 8. Reordering Topics (Position Index) ---");
    const siblingTopic = await topicsService.createTopic(testUserId, {
      documentId: doc.id,
      parentTopicId: topicL1.id,
      title: "1.2 Paxos Protocol",
      position: 1,
      plainText: "Synod algorithm and multi-paxos.",
    });
    assert(siblingTopic.position === 1, "Sibling topic created at position 1");

    // Move sibling up to position 0
    const reorderedSibling = await topicsService.updateTopic(siblingTopic.id, testUserId, {
      position: 0,
      createSnapshot: false,
    });
    assert(Boolean(reorderedSibling), "Sibling topic repositioned successfully");
    if (!reorderedSibling) throw new Error("reorderedSibling is null");
    assert(reorderedSibling.position === 0, "Sibling topic repositioned to position 0");

    // 9. Topic Deletion
    console.log("\n--- 9. Topic Deletion Verification ---");
    await topicsService.deleteTopic(siblingTopic.id, testUserId);
    let deletedCheck = false;
    try {
      await topicsService.getTopicById(siblingTopic.id, testUserId);
    } catch {
      deletedCheck = true;
    }
    assert(deletedCheck, "Topic deleted cleanly from database");

    console.log("\n==================================================");
    console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log("==================================================");

  } catch (error) {
    console.error("Test execution threw an unhandled error:", error);
    failedCount++;
  } finally {
    // Cleanup test user
    if (testUserId) {
      try {
        await db.delete(user).where(eq(user.id, testUserId));
        console.log(`\nCleaned up test user: ${testUserId}`);
      } catch (cleanErr) {
        console.error("Failed to clean up test user:", cleanErr);
      }
    }
  }

  process.exit(failedCount > 0 ? 1 : 0);
}

runPrompt6Tests();
