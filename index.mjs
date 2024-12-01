#!/usr/bin/env node
import Control from './control.mjs';
import { Command } from 'commander'

const program = new Command();

program.version('0.0.1');

program.command('init').action(async () => {
    const control = new Control();
    await control.initialize();
});


program.command('add <file>').action(async (file) => {
    const control = new Control();
    await control.add(file);
});

program.command('commit <message>').action(async (message) => {
    const control = new Control();
    await control.controlcommit(message);
});

program.command('log').action(async () => {
    const control = new Control();
    await control.log();
});

program.command('diff <hash>').action(async (hash) => {
    const control = new Control();
    await control.diff(hash);
});

// create a new branch
program.command('branch <branch>').action(async (branch) => {
    const control = new Control();
    await control.createBranch(branch);
});
// switch to a branch
program.command('checkout <branch>').action(async (branch) => {
    const control = new Control();
    await control.switchBranch(branch);
});


//  Merge Two Branches
program.command('merge <branch>').action(async (branch) => {
    const control = new Control();
    await control.mergeBranch(branch);
});

// Diff Between Branches:
program.command('diffbranch <branch1> <branch2>').action(async (branch1, branch2) => {
    const control = new Control();
    await control.diffBranches(branch1, branch2);
});

// Cloning a Repository:
program.command('clone <source> <destination>').action(async (source, destination) => {
    const control = new Control();
    await control.cloneRepository(source, destination);
});

program.parse(process.argv);

