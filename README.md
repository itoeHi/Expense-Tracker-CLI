# Expense-tracker-CLI

## Intro

This is backend pratice project. Detail Please visit Roadmap.
https://roadmap.sh/projects/expense-tracker
## Menu structure

- [Intro](#Intro)
- [Setup](#Setup)
- [Project](#Project)
- [Usage](#Usage)
- [FileStatement](#FileStatement)
- [Contribute](#Contribute)
- [Lisence](#Lisence)

## Setup
### Install Node.js (Make sure npm is install too)
https://nodejs.org/zh-cn/download
Use cmd command to check if Node.js and npm are installed:
```bash
node --version 
npm --version
```

### Install yrags package in your environmet
```bash
cd projectFile/clone-project
npm install yrags
```


## Project
Expense tracker is a appliction used to track and manage your expense for finances. Building a simple command line interface (CLI) to track > what you to add, delete and change monthly record expenses with corresponding cost, description and tag, and what you are currently working on.Like setting a Budget for a month and check how much budget let with corresponding history month-expenses, and metioned if there is a execced of budget or lower then 10% budget are left. Listing all input expense history. Export your total expenses data into a CSV file.

### Requirements
The application should run from the command line, accept user actions and inputs as arguments, and store the tasks in a JSON file. The user should be able to:
+ Users can add an expense with a description and amount.
+ Users can update an expense.
+ Users can delete an expense.
+ Users can view all expenses.
+ Users can view a summary of all expenses.
+ Users can view a summary of expenses for a specific month (of current year).
+ Add expense categories and allow users to filter expenses by category.
+ Allow users to set a budget for each month and show a warning when the user exceeds the budget.
+ Allow users to export expenses to a CSV file.



## Usage
Terminal Example Input: (if use node directly, add "node" at front)
```
$ node expense-tracker.js add --description "Lunch" --amount 20
# Expense added successfully (ID: 1)
# (if category is not input, default is "Uncategroized")
# (Use 'node expense-tracker.js add -h' for detail command)

$ node expense-tracker.js add --description "Dinner" --amount 90
# Expense added successfully (ID: 2)

$ node expense-tracker.js list
# ID  Date       Description     Amount   Category
#---  ---------- --------------- -------- -------
# 1   2024-08-06  Lunch          $20 Uncategorized
# 2   2024-08-06  Dinner         $10 Uncategorized

$ node expense-tracker.js update --id 2 --category Party
# Expense updated successfully (ID: 2)
# (Use 'node expense-tracker.js update -h' for detail command)

$ node expense-tracker.js summary
# Total expenses: $30
#
# Breakdown bu Category:
# - Uncategorized: $ 20.00
# - Party: # 90.00
# (Use 'node expense-tracker.js summary -h' for detail command)

$ node expense-tracker.js delete --id 2
# Expense deleted successfully

$ node expense-tracker.js summary
# Total expenses: $20
# 
# Breakdown by Category:
# - Uncategorized: $20

$ node expense-tracker.js summary --month 8
# Total expenses for August: $20

$ node expense-tracker.js add --description "phone bill" --amout 164 --category Bill
#  Expense added successfully (ID: 2)

$ node expense-tracker.js set-budget --month 8 -amount 200
# Budget set successfully for month 8: $200.00
# (Use 'node expense-tracker.js set-budget -h' for detail command)

$ node expense-tracker.js check-budget
# Budget for month 8: $200.00
# Spend this month: $184.00
# Remaining budget: $16
#
#    Warning: You're close to exceeding your budget!(left less than 10%) Only $16.00 left.

$ node expense-tracker.js list
# ID  Date       Description     Amount   Category
#---  ---------- --------------- -------- -------
# 1   2024-08-06  Lunch          $20   Uncategorized
# 2   2024-08-06  phone-bill     $164  Bill

$ node expense-tracker.js summary
# Budget for month 8: $200
# Spend this month: $184
# Remaining budget: $16
#
#    Warning: You're close to exceeding your budget!(left less than 10%) Only $16.00 left.


$ node expense-tracker.js export
# Export expenses data to CSV file (default name is "expense.csv")

$ node expense-tracker.js -h
# (Or: node expense-tracker.js --help)
# Display the menu of Appliction commands
```

## FileStatement
- expense-tracker.js (Main appliction function code file)
- expenses.json      (Storage all expense data, if had any)
- budget.json        (if User had set any budget, they will storage here. If user had never set budget, this file will not exis)
- package.json       (Project package set file)
- README.md          (Project statement file)

## Contribute
yilinDai (GitHub name: itoeHi, email:daiyilin1425251132@qq.com)

## Lisence
MIT lisence