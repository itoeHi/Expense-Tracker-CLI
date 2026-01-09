#! /usr/bin/env node

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import {fileURLToPath} from 'url';
import {hideBin} from 'yargs/helpers';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'expenses.json');
const BUGGET_FILE = path.join(__dirname, 'budget.json');

// init data file
function initDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(BUGGET_FILE)) {
        fs.writeFileSync(BUGGET_FILE, JSON.stringify([], null, 2));
    }
}

// read expenses from file
function readExpenses() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// read budget from file
function readBudgets() {
    try {
        const data = fs.readFileSync(BUGGET_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// save expenses to file
function saveExpenses(expenses) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2));
}

// save budget to file
function saveBudgets(budgets) {
    fs.writeFileSync(BUGGET_FILE, JSON.stringify(budgets, null, 2));
}

// generate next ID
function getNextId(expenses) {
    if (expenses.length === 0) return 1;
    return Math.max(...expenses.map(exp => exp.id)) + 1;
}

// aquire date in YYYY-MM-DD format (NOW)
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// add expense
function addExpense(description, amount, categroy = 'Uncategorized') {
    const expenses = readExpenses();

    // Testify input
    if(!description || description.trim() === '') {
        console.error('Error: Description is required.');
        process.exit(1);
    }

    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
        console.error('Error: Amount must be a positive number.');
        process.exit(1);
    }

    const newExpense = {
        id: getNextId(expenses),
        date: getCurrentDate(),
        description: description.trim(),
        amount: parseFloat(amount.toFixed(2)),
        category: categroy.trim()
    };

    expenses.push(newExpense);
    saveExpenses(expenses);

    // Check budget exceed
    checkBudget(newExpense.date);

    console.log(`Expense added successfully (ID: ${newExpense.id})`);
}

// Update expense
function updateExpense(id, description, amount, category) {
    const expenses = readExpenses();
    const expenseIndex = expenses.findIndex(exp => exp.id === id);

    if (expenseIndex === -1) {
        console.error(`Error: Expense with ID ${id} not found.`);
        process.exit(1);
    }

    const expense = expenses[expenseIndex];

    if (description !== undefined) {
        amount = parseFloat(amount);
        if (isNaN(amount) || amount <= 0) {
            console.error('Error: Amount must be a positive number.');
            process.exit(1);
        }
        expense.amount = parseFloat(amount.toFixed(2));
    }

    if (category !== undefined) {
        expense.category = category.trim();
    }

    saveExpenses(expenses);
    console.log(`Expense updated successfully (ID: ${id})`);
}

// delete expense
function deleteExpense(id) {
    const expenses = readExpenses();
    const initialLength = expenses.length;

    const filteredExpenses = expenses.filter(exp => exp.id !== id);

    if (filteredExpenses.length === initialLength) {
        console.error(`Error: Expense with ID ${id} not found.`);
        process.exit(1);
    }

    saveExpenses(filteredExpenses);
    console.log(`Expense deleted successfully (ID: ${id})`);
}

// list expenses (Able to filter)
function listExpenses(filterCategroy = null, filterMonth = null) {
    let expenses = readExpenses();

    // Sort by date descending (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Application filter
    if (filterCategroy) {
        expenses = expenses.filter(exp => exp.category.toLowerCase() === filterCategroy.toLowerCase());
    }

    if (filterMonth) {
        const month = parseInt(filterMonth);
        if (month < 1 || month > 12) {
            console.error('Error: Month must be between 1 and 12.');
            process.exit(1);
        }
        expenses = expenses.filter(exp => {
            const expMonth = new Date(exp.date).getMonth() + 1;
            return expMonth === month;
        });
    }

    if (expenses.length === 0) {
        console.log('No expenses found.');
        return;
    }

    console.log('ID   Date       Description               Amount    Category');
    console.log('---- --------- -------------------------- --------- -------');

    expenses.forEach(expense =>{
        console.log(
            `${expense.id.toString().padEnd(3)} ` +
            `${expense.date} ` +
            `${expense.description.padEnd(25).substring(0,25)} ` +
            `${expense.amount.toFixed(2).padStart(8)}` +
            ` ${expense.category}`
        );
    });
}


// Display abstract
function showSummary(month = null) {
    const expenses = readExpenses();

    let filteredExpenses = expenses;
    if (month) {
        month = parseInt(month);
        if (month < 1 || month > 12) {
            console.error('Error: Month must be between 1 and 12.');
            process.exit(1);
        }
        filteredExpenses = expenses.filter(exp => {
            const expMonth = new Date(exp.date).getMonth() + 1;
            return expMonth === month;
        });

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        console.log(`Total expenses for ${monthNames[month - 1]}: $${total.toFixed(2)}`);
    } else {
        const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        console.log(`Total expenses: $${total.toFixed(2)}`);
    }

    // Details Display by category
    const categories = {};
    filteredExpenses.forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });

    if (Object.keys(categories).length > 0) {
        console.log('\nBreakdown by Category:');
        for (const [category, amount] of Object.entries(categories)) {
            console.log(`- ${category}: $${amount.toFixed(2)}`);
        }
    }
}

// Set budget
function setBudget(amount, month) {
    month = parseInt(month);
    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) {
        console.error('Error: Amount must be a positive number.');
        process.exit(1);
    }

    const budgets = readBudgets();
    const existingBudgetIndex = budgets.findIndex(b => b.month === month);

    if (existingBudgetIndex !== -1) {
        budgets[existingBudgetIndex].amount = parseFloat(amount.toFixed(2));
    } else {
        budgets.push({
            month,
            amount: parseFloat(amount.toFixed(2))
        });
    }

    saveBudgets(budgets);
    console.log(`Budget set successfully for month ${month}: $${amount.toFixed(2)}`);
}

// Check budget
function checkBudget(date) {
    const month = new Date(date).getMonth() + 1;
    const budgets = readBudgets();
    const budget = budgets.find(b => b.month === month);

    if (!budget) return;

    const expenses = readExpenses();
    const monthlyExpenses = expenses.filter(exp => {
        const expMonth = new Date(exp.date).getMonth() + 1;
        return expMonth === month;
    });

    const total = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (total > budget.amount) {
        console.warn(`\n    Warning: You have exceeded your budget for month ${month}!`);
        console.warn(`    Spent: $${total.toFixed(2)}`);
        console.warn(`    Over budget by: $${total - budget.amount.toFixed(2)}\n`);
    } else if (total >= budget.amount * 0.9) {
        console.warn(`\n    Warning: You are close to exceeding your budget for month ${month}!`);
        console.warn(`    Spent: $${total.toFixed(2)}`);
        console.warn(`    Remaining budget: $${(budget.amount - total).toFixed(2)}\n`);
    }
}

// Export as CSV file
function exportToCSV(filename = 'expenses.csv') {
    const expenses = readExpenses();
    const csvHeaders = ['ID', 'Date', 'Description', 'Amount', 'Category'];

    if (expenses.length === 0) {
        console.error('Error: No expenses to export.');
        process.exit(1);
    }

    const csvRows = expenses.map(exp => {
        // process description to handle commas and quotes
        // change " to ""
        let escapedDescription = exp.description;
        if (escapedDescription.includes(',') ||
            escapedDescription.includes('"') ||
            escapedDescription.includes('\n')) {
            escapedDescription = `"${escapedDescription.replace(/"/g, '""')}"`;
        }

        return [
            exp.id,
            exp.date,
            escapedDescription,
            exp.amount,
            exp.category
        ];
    });


    const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
    ].join('\n');


    fs.writeFileSync(filename, csvContent);
    console.log(`Expenses exported to ${filename}`);
}

// Mian function
function main() {
    initDataFile();

    yargs(hideBin(process.argv))
        .command('add', 'Add a new expense', (yargs) => {
            return yargs
                .option('description', {
                    alias: 'd',
                    type: 'string',
                    description: 'Description of the expense',
                    demandOption: true
                })
                .option('amount', {
                    alias: 'a',
                    type: 'number',
                    description: 'Amount of the expense',
                    demandOption: true
                })
                .option('category', {
                    alias: 'c',
                    type: 'string',
                    description: 'Category of the expense',
                    default: 'Uncategorized'
                });
        }, (argv) => {
            addExpense(argv.description, argv.amount, argv.category);
        })

        .command('update', 'Update an existing expense', (yargs) => {
            return yargs
                .option('id', {
                    alias: 'i',
                    type: 'number',
                    description: 'ID of the expense to update',
                    demandOption: true
                })
                .option('description', {
                    alias: 'd',
                    type: 'string',
                    description: 'New description of the expense'
                })
                .option('amount', {
                    alias: 'a',
                    type: 'number',
                    description: 'New amount of the expense'
                })
                .option('category', {
                    alias: 'c',
                    type: 'string',
                    description: 'New category of the expense'
                });
        }, (argv) => {
            updateExpense(argv.id, argv.description, argv.amount, argv.category);
        })

        .command('delete', 'Delete an expense', (yargs) => {
            return yargs
                .option('id', {
                    alias: 'i',
                    type: 'number',
                    description: 'ID of the expense to delete',
                    demandOption: true
                });
        }, (argv) => {
            deleteExpense(argv.id);
        })

        .command('list', 'List all expenses', (yargs) => {
            return yargs
                .option('category', {
                    alias: 'c',
                    type: 'string',
                    description: 'Filter by category'
                })
                .option('month', {
                    alias: 'm',
                    type: 'number',
                    description: 'Filter by month (1-12)'
                });
        }, (argv) => {
            listExpenses(argv.category, argv.month);
        })

        .command('summary', 'Show expense summary', (yargs) => {
            return yargs
                .option('month', {
                    alias: 'm',
                    type: 'number',
                    description: 'Show summary for specific month (1-12)',
                })
        }, (argv) => {
            showSummary(argv.month);
        })

        .command('set-budget', 'Set monthly budget', (yargs) => {
            return yargs
                .option('month', {
                    alias: 'm',
                    type: 'number',
                    description: 'Month for the budget (1-12)',
                    demandOption: true
                })
                .option('amount', {
                    alias: 'a',
                    type: 'number',
                    description: 'Budget amount',
                    demandOption: true
                });
        }, (argv) => {
            setBudget(argv.amount, argv.month);
        })

        .command('export', 'Export expenses data to CSV', (yargs) => {
            return yargs
                .option('file', {
                    alias: 'f',
                    type: 'string',
                    description: 'The Output CSV file name',
                    default: 'expenses.csv'
                });
        }, (argv) => {
            exportToCSV(argv.file);
        })

        .command('check-budget', 'Check current month budget status', {}, () => {
            const currentMonth = new Date().getMonth() + 1;
            const budgets = readBudgets();
            const budget = budgets.find(b => b.month === currentMonth);

            if (!budget) {
                console.log(`No budget set for month ${currentMonth}.`);
                return;
            }

            const expenses = readExpenses();
            const monthlyExpenses = expenses.filter(exp => {
                const expMonth = new Date(exp.date).getMonth() + 1;
                return expMonth === currentMonth;
            });

            const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            const remaining = budget.amount - total;

            console.log(`Budget for month ${currentMonth}: $${budget.amount.toFixed(2)}`);
            console.log(`Spend this month: $${total.toFixed(2)}`);
            console.log(`Remaining budget: $${remaining.toFixed(2)}`);

            if (remaining < 0) {
                console.warn(`\n    Warning: You're over your budget by ${Math.abs(remaining).toFixed(2)}`);
            }else if (remaining <= budget.amount * 0.1) {
                console.warn(`\n    Warning: You're close to exceeding your budget!(left less than 10%) Only $${remaining.toFixed(2)} left.`);
            }
        })

        .demandCommand(1, 'You need to specify a command.')
        .help()
        .alias('help', 'h')
        .parse();
}

main();