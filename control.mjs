import path from 'path'
import fs from 'fs/promises'
import crypto  from 'crypto'
import { diffLines } from 'diff'
import chalk from 'chalk'



class Control {
    constructor(sourcePath = '.') {
        this.sourcePath = path.join(sourcePath, '.control')
        this.objectsPath =  path.join(this.sourcePath, 'objects')
        this.headerPath =  path.join(this.sourcePath, 'HEADER')
        this.indexPath = path.join(this.sourcePath, 'INDEX')
        
    }

    async initialize() {
        await fs.mkdir(this.objectsPath, {recursive: true})
        try {
            await fs.writeFile(this.headerPath, '', {flag: 'wx'})
            await fs.writeFile(path.join(this.sourcePath, '.controlignore'), '# Add files or patterns to ignore\n', { flag: 'wx' });
            await fs.writeFile(this.indexPath, JSON.stringify([]), {flag: 'wx'})
            await fs.writeFile(path.join(this.sourcePath, 'BRANCHES'), JSON.stringify({ main: '' }), { flag: 'wx' });
            console.log('Control initialized successfully')
        } catch (error) {
            console.error('Control already initialized in .control directory')
        }
    }

    hashObject(data) {
        const hash = crypto.createHash('sha1');
        hash.update(data, 'utf-8')
        return hash.digest('hex')
    }

    async add(file) {
        // const data = await fs.readFile(file, {encoding: 'utf-8'})
        // const hash = this.hashObject(data)
        // console.log(hash);
        // const objectPath = path.join(this.objectsPath, hash)
        // await fs.writeFile(objectPath, data)
        // // TODO: Add file to staging area (INDEX)
        // await this.updateStageArea(file, hash)
        // console.table({hash, file, objectPath})
        // console.log("===============================")

        const ignoredPatterns = await this.getIgnoredPatterns();

        // Check if file matches any ignore pattern
        const isIgnored = ignoredPatterns.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(file);
        });
    
        if (isIgnored) {
            console.log(`File ${file} is ignored and will not be staged.`);
            return;
        }
    
        const data = await fs.readFile(file, { encoding: 'utf-8' });
        const hash = this.hashObject(data);
    
        const objectPath = path.join(this.objectsPath, hash);
        await fs.writeFile(objectPath, data);
    
        await this.updateStageArea(file, hash);
        console.table({ hash, file, objectPath });
        console.log("===============================");

        
    }

    async updateStageArea(path, hash) {
        const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'}))
        index.push({path, hash})
        await fs.writeFile(this.indexPath, JSON.stringify(index))


    }

    async controlcommit(message) {
        // const index = JSON.parse(await fs.readFile(this.indexPath, {encoding: 'utf-8'}))
        // const parent = await this.getCurrentHead()
        // const commintTimestamp = {
        //     timestamp: new Date().toISOString(),
        //     message,
        //     file: index,
        //     parent: parent || ''
        // }

        // const commitHash = this.hashObject(JSON.stringify(commintTimestamp))
        // const commitPath = path.join(this.objectsPath, commitHash)
        // await fs.writeFile(commitPath, JSON.stringify(commintTimestamp))
        // await fs.writeFile(this.headerPath, commitHash) // Update HEAD to point to the new commit hash
        // // Clear the staging area
        // await fs.writeFile(this.indexPath, JSON.stringify([]))

        // // console.table({
        // //     commitHash, 
        // //     commitPath,
        // //     parent: commintTimestamp.parent, 
        // //     file: commintTimestamp.file,
        // //     message: commintTimestamp.message,
        // //     timestamp: commintTimestamp.timestamp
        // // })
        // console.log("===============================")
        // console.log('Control commit was successful')
        // console.log("===============================")

        const branchesPath = path.join(this.sourcePath, 'BRANCHES');
        const branches = JSON.parse(await fs.readFile(branchesPath, { encoding: 'utf-8' }));
    
        const currentHead = await this.getCurrentHead();
        const branch = Object.entries(branches).find(([_, head]) => head === currentHead)[0];
    
        const index = JSON.parse(await fs.readFile(this.indexPath, { encoding: 'utf-8' }));
        const commintTimestamp = {
            timestamp: new Date().toISOString(),
            message,
            file: index,
            parent: currentHead || ''
        };
    
        const commitHash = this.hashObject(JSON.stringify(commintTimestamp));
        const commitPath = path.join(this.objectsPath, commitHash);
        await fs.writeFile(commitPath, JSON.stringify(commintTimestamp));
    
        branches[branch] = commitHash; // Update the branch's HEAD to the new commit
        await fs.writeFile(branchesPath, JSON.stringify(branches));
    
        await fs.writeFile(this.headerPath, commitHash);
        await fs.writeFile(this.indexPath, JSON.stringify([])); // Clear staging area
    
        console.log(`Control commit was successful on branch ${branch}`);
    
    }

    async getCurrentHead() {
        try {
            return await fs.readFile(this.headerPath, {encoding: 'utf-8'})
            
        } catch (error) {
            return null;
        }
    }

    async log() {
        console.log("============LOG HISTORY===================")
        let commitHash = await this.getCurrentHead()
        while (commitHash) {
            const commit = JSON.parse(await fs.readFile(path.join(this.objectsPath, commitHash), {encoding: 'utf-8'}))
            console.table({
                commitHash,
                parent: commit.parent,
                message: commit.message,
                timestamp: commit.timestamp
            })
            console.log("===============================")
            commitHash = commit.parent

        }
        console.log("============END LOG HISTORY===================")
    }

    async diff(hash) {
        const commit = await this.getCommitData(hash)
        if (!commit) {
            console.log('Commit not found')
            return
        }

        for (const file of commit.file) {

            const fileContent = await this.getFileContent(file.hash)

            // console.log(fileContent)


            if (commit.parent) {
                const parentCommit = await this.getCommitData(commit.parent)
                const parentFileContent = await this.getParentFileContent(parentCommit, file.path)

                if(parentFileContent !== undefined) {
                    console.log('\n Diff:')
                    const diff = diffLines(parentFileContent, fileContent)

                    diff.forEach(part => {
                        const color = part.added ? chalk.green : part.removed ? chalk.yellow : chalk.grey
                        process.stdout.write(color(part.value))
                    })
                    console.log('\n')
                }else {
                    console.log('New file commit')
                }
                
            }else {
                console.log('First control commit')
            }

 
        }


    
        
    }

    async getParentFileContent(data, path) {

        const parentFile = data.file.find(file => file.path === path)
        if (!parentFile) {
            return null
        }

        return await this.getFileContent(parentFile.hash)

    }

    async getFileContent(hash) {
        const data =  await fs.readFile(path.join(this.objectsPath, hash), {encoding: 'utf-8'})
        return data
    }

    async getCommitData(hash){
        const fpath = path.join(this.objectsPath, hash)

        try {
            const data = await fs.readFile(fpath, {encoding: 'utf-8'})

            return JSON.parse(data)
        }catch (error) {
            console.error('Commit not found', error)
        }

    }

    async createBranch(branchName) {
        const branchesPath = path.join(this.sourcePath, 'BRANCHES');
        const branches = JSON.parse(await fs.readFile(branchesPath, { encoding: 'utf-8' }));
        const currentHead = await this.getCurrentHead();
    
        if (branches[branchName]) {
            throw new Error(`Branch ${branchName} already exists`);
        }
    
        branches[branchName] = currentHead; // Point the new branch to the current HEAD
        await fs.writeFile(branchesPath, JSON.stringify(branches));
        console.log(`Branch ${branchName} created successfully`);
    }

    async switchBranch(branchName) {
        const branchesPath = path.join(this.sourcePath, 'BRANCHES');
        const branches = JSON.parse(await fs.readFile(branchesPath, { encoding: 'utf-8' }));
    
        if (!branches[branchName]) {
            throw new Error(`Branch ${branchName} does not exist`);
        }
    
        // Update HEADER to point to the branch's HEAD commit
        await fs.writeFile(this.headerPath, branches[branchName]);
        console.log(`Switched to branch ${branchName}`);
    }

    // Merge Two Branches
    async mergeBranch(targetBranch) {
        const branchesPath = path.join(this.sourcePath, 'BRANCHES');
        const branches = JSON.parse(await fs.readFile(branchesPath, { encoding: 'utf-8' }));
    
        const currentHead = await this.getCurrentHead();
        const targetHead = branches[targetBranch];
    
        if (!targetHead) {
            throw new Error(`Branch ${targetBranch} does not exist`);
        }
    
        if (currentHead === targetHead) {
            console.log(`Branches are already identical`);
            return;
        }
    
        // Fetch commit data
        const currentCommit = await this.getCommitData(currentHead);
        const targetCommit = await this.getCommitData(targetHead);
    
        // TODO: Handle merge conflicts using diffs
        console.log('Merging changes...');
        const mergedFiles = [...currentCommit.file, ...targetCommit.file]; // Simplified, conflicts not handled
    
        const mergeCommit = {
            timestamp: new Date().toISOString(),
            message: `Merge branch ${targetBranch} into current`,
            file: mergedFiles,
            parent: [currentHead, targetHead]
        };
    
        const mergeCommitHash = this.hashObject(JSON.stringify(mergeCommit));
        const mergeCommitPath = path.join(this.objectsPath, mergeCommitHash);
        await fs.writeFile(mergeCommitPath, JSON.stringify(mergeCommit));
    
        // Update current branch's HEAD
        const currentBranch = Object.entries(branches).find(([_, head]) => head === currentHead)[0];
        branches[currentBranch] = mergeCommitHash;
        await fs.writeFile(branchesPath, JSON.stringify(branches));
        await fs.writeFile(this.headerPath, mergeCommitHash);
    
        console.log(`Merge successful. New commit: ${mergeCommitHash}`);
    }

    // Diff Between Branches

    async diffBranches(branchA, branchB) {
        const branchesPath = path.join(this.sourcePath, 'BRANCHES');
        const branches = JSON.parse(await fs.readFile(branchesPath, { encoding: 'utf-8' }));
    
        const headA = branches[branchA];
        const headB = branches[branchB];
    
        if (!headA || !headB) {
            throw new Error(`One or both branches do not exist`);
        }
    
        const commitA = await this.getCommitData(headA);
        const commitB = await this.getCommitData(headB);
    
        console.log(`Diff between ${branchA} and ${branchB}:`);
        for (const fileA of commitA.file) {
            const fileB = commitB.file.find(f => f.path === fileA.path);
            const contentA = await this.getFileContent(fileA.hash);
            const contentB = fileB ? await this.getFileContent(fileB.hash) : '';
    
            console.log(`File: ${fileA.path}`);
            const diff = diffLines(contentA, contentB);
            diff.forEach(part => {
                const color = part.added ? chalk.green : part.removed ? chalk.yellow : chalk.grey;
                process.stdout.write(color(part.value));
            });
            console.log('\n');
        }
    }

    async cloneRepository(sourcePath, targetPath) {
        const sourceControlPath = path.join(sourcePath, '.control');
        const targetControlPath = path.join(targetPath, '.control');
    
        try {
            // Copy `.control` directory recursively
            await fs.cp(sourceControlPath, targetControlPath, { recursive: true });
            console.log(`Repository cloned from ${sourcePath} to ${targetPath}`);
        } catch (error) {
            console.error('Failed to clone repository:', error);
        }
    }

    async getIgnoredPatterns() {
        const ignorePath = path.join(this.sourcePath, '.controlignore');
    
        try {
            const ignoreContent = await fs.readFile(ignorePath, { encoding: 'utf-8' });
            return ignoreContent.split('\n').map(pattern => pattern.trim()).filter(Boolean); // Remove empty lines
        } catch {
            return []; // If `.controlignore` does not exist, return an empty array
        }
    }
    
    
    
    
    
    

}


export default Control