# Command-Line Interface (CLI) for the Version Control System

This script provides a CLI interface for interacting with the version control system. It wraps the core functionality into user-friendly commands using the **Commander.js** library.

## **Features**

### **1. Setup**
The CLI script:
- Starts with a shebang line (`#!/usr/bin/env node`) to enable direct execution in a Unix-like environment.
- Imports the core functionality from `control.mjs` and integrates it into the command structure.

```javascript
#!/usr/bin/env node
import Control from './control.mjs';
import { Command } from 'commander';
```

The CLI is defined using **Commander.js**, which makes it easy to structure and manage commands, options, and arguments.

---

### **2. Available Commands**

#### **Initialize a Repository**
Initializes the `.control` directory for version control.

**Command:**
```bash
./index.mjs control init
```

**Implementation:**
```javascript
program.command('init').action(async () => {
    const control = new Control();
    await control.initialize();
});
```

---

#### **Add Files to Staging**
Stages a file for the next commit.

**Command:**
```bash
./index.mjs control add <file>
```

**Example:**
```bash
./index.mjs control add file.txt
```

**Implementation:**
```javascript
program.command('add <file>').action(async (file) => {
    const control = new Control();
    await control.add(file);
});
```

---

#### **Commit Changes**
Creates a new commit with a message.

**Command:**
```bash
./index.mjs control commit <message>
```

**Example:**
```bash
./index.mjs control commit "Initial commit"
```

**Implementation:**
```javascript
program.command('commit <message>').action(async (message) => {
    const control = new Control();
    await control.controlcommit(message);
});
```

---

#### **View Commit History**
Displays the commit log from the current branch.

**Command:**
```bash
./index.mjs control log
```

**Implementation:**
```javascript
program.command('log').action(async () => {
    const control = new Control();
    await control.log();
});
```

---

#### **View File Differences**
Displays differences between a commit and its parent.

**Command:**
```bash
./index.mjs control diff <hash>
```

**Example:**
```bash
./index.mjs control diff abc123
```

**Implementation:**
```javascript
program.command('diff <hash>').action(async (hash) => {
    const control = new Control();
    await control.diff(hash);
});
```

---

#### **Branch Management**
- **Create a Branch**:
  Creates a new branch at the current HEAD.

  **Command:**
  ```bash
  ./index.mjs control branch <branch>
  ```

  **Example:**
  ```bash
  ./index.mjs control branch new-feature
  ```

  **Implementation:**
  ```javascript
  program.command('branch <branch>').action(async (branch) => {
      const control = new Control();
      await control.createBranch(branch);
  });
  ```

- **Switch to a Branch**:
  Switches the current working branch.

  **Command:**
  ```bash
  ./index.mjs control checkout <branch>
  ```

  **Example:**
  ```bash
  ./index.mjs control checkout main
  ```

  **Implementation:**
  ```javascript
  program.command('checkout <branch>').action(async (branch) => {
      const control = new Control();
      await control.switchBranch(branch);
  });
  ```

---

#### **Merge Branches**
Merges a target branch into the current branch.

**Command:**
```bash
./index.mjs control merge <branch>
```

**Example:**
```bash
./index.mjs control merge main
```

**Implementation:**
```javascript
program.command('merge <branch>').action(async (branch) => {
    const control = new Control();
    await control.mergeBranch(branch);
});
```

---

#### **Diff Between Branches**
Shows differences between the HEAD commits of two branches.

**Command:**
```bash
./index.mjs control diffbranch <branch1> <branch2>
```

**Example:**
```bash
./index.mjs control diffbranch main new-feature
```

**Implementation:**
```javascript
program.command('diffbranch <branch1> <branch2>').action(async (branch1, branch2) => {
    const control = new Control();
    await control.diffBranches(branch1, branch2);
});
```

---

#### **Clone Repository**
Copies an existing repository to a new location on disk.

**Command:**
```bash
./index.mjs control clone <source> <destination>
```

**Example:**
```bash
./index.mjs control clone /path/to/source /path/to/destination
```

**Implementation:**
```javascript
program.command('clone <source> <destination>').action(async (source, destination) => {
    const control = new Control();
    await control.cloneRepository(source, destination);
});
```

---

## **How the CLI Works**
1. **Command Registration**:
   - Commands like `init`, `add`, and `commit` are registered using `program.command()` from Commander.js.
   - Each command is linked to a method in the `Control` class, ensuring seamless integration with the core functionality.

2. **Execution**:
   - The CLI is run from the terminal. Example:
     ```bash
     ./index.mjs control init
     ```
   - The appropriate command is matched and executed.

3. **Modularity**:
   - The CLI script imports the `Control` class from `control.mjs` for core operations, keeping business logic separate from the user interface.

4. **Error Handling**:
   - The `async` nature of commands allows for proper handling of asynchronous operations and errors.

---

## **Enhancements**
- Add support for command options, e.g., `control commit -a "Commit all changes"`.
- Add verbose mode for debugging command execution.
- Integrate with `.controlignore` for better file handling during `add`.
- Build a help command for detailed usage:
  ```bash
  control --help
  ```

---

This script provides a fully functional CLI for interacting with the lightweight version control system. Its modularity and simplicity make it easy to extend or customize.