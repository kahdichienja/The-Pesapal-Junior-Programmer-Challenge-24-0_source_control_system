# Version Control System: Documentation

This is a lightweight version control system inspired by Git. It allows tracking file changes, creating commits, managing branches, merging changes, and viewing differences between commits or branches.


## Getting Started
For detailed instructions on running this project, check out the [RUN.md](RUN.md) file.


## **Features**

### **1. Core Features**
#### **Initialize Repository**
- Sets up a `.control` directory to manage versioning.
- Directory structure:
  - **`objects/`**: Stores hashed contents of tracked files.
  - **`HEADER`**: Tracks the current HEAD commit.
  - **`INDEX`**: A staging area for files to be committed.
  - **`BRANCHES`**: Tracks branches and their HEAD commits.
  - **`.controlignore`**: Specifies files or patterns to ignore.

```javascript
await control.initialize();
```

---

#### **Add Files**
- Stages files for the next commit.
- Hashes the file content and stores it in `objects/`.
- Updates the `INDEX` file with the file path and hash.

```javascript
await control.add('file.txt'); // Adds file.txt to staging
```

---

#### **Commit Changes**
- Creates a commit containing:
  - A unique hash generated from commit metadata.
  - The parent commit hash (if applicable).
  - A list of staged files and their hashes.
  - A commit message and timestamp.
- Updates the `HEADER` to point to the new commit.
- Clears the `INDEX`.

```javascript
await control.controlcommit('Initial commit');
```

---

#### **View Commit History**
- Traverses commit history backward from the current HEAD.
- Displays metadata for each commit.

```javascript
await control.log();
```

---

#### **Diff Between Commits**
- Compares files in a commit to its parent commit.
- Highlights differences line by line.

```javascript
await control.diff(commitHash); // Compare a commit to its parent
```

---

### **2. Branching**
#### **Create a New Branch**
- Adds a new branch and points it to the current HEAD.

```javascript
await control.createBranch('new-feature');
```

---

#### **Switch Branches**
- Updates the `HEADER` to reflect the HEAD commit of the specified branch.

```javascript
await control.switchBranch('new-feature');
```

---

#### **Merge Branches**
- Merges changes from a target branch into the current branch.
- Creates a merge commit with two parent commits.

```javascript
await control.mergeBranch('main');
```

---

#### **Diff Between Branches**
- Compares the HEAD commits of two branches.

```javascript
await control.diffBranches('branch1', 'branch2');
```

---

### **3. Cloning a Repository**
- Copies an existing repository to a new location (disk-based, no networking).

```javascript
await control.cloneRepository('/source/path', '/target/path');
```

---

### **4. Ignoring Files**
- Skips files or patterns specified in `.controlignore` from being staged or committed.

```plaintext
# .controlignore example
*.log
node_modules/
temp/
```

```javascript
await control.add('debug.log');  // Skipped if in .controlignore
await control.add('index.js');  // Staged normally
```

---

## **Data Structures and Algorithms (DSA)**
This project uses several fundamental DSA concepts to implement version control functionality.

### **1. Directory Structure (Filesystem as a Tree)**
- The `.control` directory mirrors a **tree structure**:
  - `objects/` stores hashed file contents.
  - Metadata files (`HEADER`, `INDEX`, etc.) act as **pointers** for traversing and managing branches and commits.

### **2. Hashing (SHA-1)**
- **Purpose**: Provides unique identifiers for files and commits.
- **Usage**:
  - File content is hashed to generate a unique `hash` stored in `objects/`.
  - Commit data (metadata and parent hash) is hashed to generate commit IDs.
- **Algorithm**: SHA-1 ensures that identical content always generates the same hash.

```javascript
const hash = crypto.createHash('sha1');
hash.update(data, 'utf-8');
return hash.digest('hex');
```

---

### **3. Linked List for Commit History**
- **Structure**: Each commit contains a `parent` pointer to its predecessor, forming a **singly linked list**.
- **Traversal**: `log` iterates through commits by following parent hashes.
- **Benefits**:
  - Easy to append new commits.
  - Efficient to traverse backward through commit history.

---

### **4. Staging Area (Dynamic Array)**
- The `INDEX` file acts as a **dynamic array**, storing metadata about staged files.
- Operations:
  - **Add**: Append new entries to the array.
  - **Clear**: Reset the array after a commit.

---

### **5. Branch Management (Key-Value Store)**
- The `BRANCHES` file acts as a **key-value store**:
  - Keys: Branch names.
  - Values: HEAD commit hashes.
- **Benefits**: Quick lookup and updates for branch operations.

---

### **6. Diff Algorithm**
- **Type**: Line-by-line diffing of file content.
- **Library Used**: [diff](https://www.npmjs.com/package/diff).
- **Highlights**:
  - Added lines: Displayed in green.
  - Removed lines: Displayed in yellow.

---

### **7. Recursive Directory Copy**
- **Purpose**: Cloning replicates the `.control` directory structure and contents to a new location.
- **Algorithm**:
  - Recursively traverse the source directory.
  - Copy each file and subdirectory to the target path.

---

### **8. Ignore File Patterns (Regular Expressions)**
- `.controlignore` uses **regex-like patterns** to match file paths.
- Example:
  - `*.log` matches any file ending with `.log`.
  - `node_modules/` matches the `node_modules` directory.

```javascript
const regex = new RegExp(pattern.replace(/\*/g, '.*'));
return regex.test(file);
```

---

## **How It All Comes Together**
1. **Initialization**:
   - Set up a `.control` directory to manage version control.

2. **Tracking Changes**:
   - Add files to the staging area and commit them.

3. **Branching and Merging**:
   - Manage multiple branches and integrate changes as needed.

4. **Cloning**:
   - Replicate repositories for collaboration or backup.

5. **Ignoring Files**:
   - Keep unnecessary files out of the repository.

---

## **Possible Enhancements**
1. **Conflict Resolution**:
   - Handle file conflicts during merges.

2. **Tags**:
   - Add tags to specific commits for better organization.

3. **Distributed System**:
   - Implement push/pull functionality for sharing repositories.

4. **CLI Tool**:
   - Wrap the functionality into a user-friendly command-line interface.

---

This README is a comprehensive guide for understanding and extending the system. Let me know if you'd like further refinements or explanations! 🚀