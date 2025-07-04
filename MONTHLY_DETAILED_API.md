# Monthly Detailed Summary API

## Endpoint
```
POST /api/monthly/detailed-summary
```

## Description
This API provides a comprehensive monthly summary with detailed breakdowns of all transactions, categories, parties, accounts, and daily summaries for a selected month.

## Request Body
```json
{
  "Month": 12,           // Required: Month number (1-12)
  "Year": 2024,          // Required: Year number
  "AccountId": 1,        // Optional: Filter by specific account
  "PartyId": 5,          // Optional: Filter by specific party
  "CategoryId": 3,       // Optional: Filter by specific category
  "SubCategoryId": 10    // Optional: Filter by specific sub-category
}
```

## Response Structure
```json
{
  "status": true,
  "message": "SUCCESS",
  "data": {
    "month": 12,
    "year": 2024,
    "monthName": "December",
    
    "summary": {
      "totalIn": 50000,
      "totalOut": 30000,
      "totalInvestment": 10000,
      "totalCredit": 25000,
      "totalDebit": 15000,
      "realIncome": 75000,
      "realExpense": 45000,
      "netIncome": 30000,
      "netCredit": 10000
    },
    
    "categorySummary": [
      {
        "name": "Electronics",
        "In": 20000,
        "Out": 15000,
        "Investment": 0,
        "Credit": 10000,
        "Debit": 5000,
        "Buyer": 50000,
        "Payer": 30000,
        "Refund": 15000,
        "Return": 10000,
        "Installment": 0,
        "From": 0,
        "To": 0
      }
    ],
    
    "subCategorySummary": [
      {
        "name": "Laptop",
        "In": 20000,
        "Out": 15000,
        "Investment": 0,
        "Credit": 10000,
        "Debit": 5000,
        "Buyer": 50000,
        "Payer": 30000,
        "Refund": 15000,
        "Return": 10000,
        "Installment": 0,
        "From": 0,
        "To": 0
      }
    ],
    
    "partySummary": [
      {
        "name": "John Doe",
        "Credit": 10000,
        "Debit": 5000,
        "Buyer": 50000,
        "Payer": 30000,
        "Refund": 15000,
        "Return": 10000
      }
    ],
    
    "accountSummary": [
      {
        "name": "HDFC Bank",
        "In": 20000,
        "Out": 15000,
        "Investment": 0,
        "Credit": 10000,
        "Debit": 5000,
        "Buyer": 50000,
        "Payer": 30000,
        "Refund": 15000,
        "Return": 10000,
        "Installment": 0,
        "From": 0,
        "To": 0
      }
    ],
    
    "actionSummary": [
      {
        "action": "Buyer",
        "amount": 50000
      },
      {
        "action": "Payer",
        "amount": 30000
      },
      {
        "action": "Refund",
        "amount": 15000
      },
      {
        "action": "Return",
        "amount": 10000
      }
    ],
    
    "dailySummary": [
      {
        "date": "2024-12-01",
        "totalIn": 20000,
        "totalOut": 15000,
        "totalInvestment": 0,
        "totalCredit": 10000,
        "totalDebit": 5000,
        "realIncome": 30000,
        "realExpense": 20000,
        "transactions": [
          {
            "transactionId": 1,
            "date": "2024-12-01T10:00:00.000Z",
            "action": "Buyer",
            "amount": 50000,
            "details": "Paid by John Doe for Electronics / Laptop",
            "categoryName": "Electronics",
            "subCategoryName": "Laptop",
            "accountName": "HDFC Bank",
            "partyName": "John Doe",
            "description": "Friend bought laptop for me"
          }
        ]
      }
    ],
    
    "transactions": [
      {
        "transactionId": 1,
        "date": "2024-12-01T10:00:00.000Z",
        "action": "Buyer",
        "amount": 50000,
        "details": "Paid by John Doe for Electronics / Laptop",
        "categoryName": "Electronics",
        "subCategoryName": "Laptop",
        "accountName": "HDFC Bank",
        "partyName": "John Doe",
        "description": "Friend bought laptop for me"
      }
    ],
    
    "statistics": {
      "totalTransactions": 25,
      "uniqueCategories": 8,
      "uniqueSubCategories": 15,
      "uniqueParties": 5,
      "uniqueAccounts": 3,
      "daysWithTransactions": 20
    }
  }
}
```

## Key Features

### 1. Overall Summary
- **totalIn**: Direct income transactions
- **totalOut**: Direct expense transactions
- **totalInvestment**: Investment transactions
- **totalCredit**: Money received from parties
- **totalDebit**: Money given to parties
- **realIncome**: Actual income (In + Buyer + Refund)
- **realExpense**: Actual expense (Out + Installment + Return + Payer)
- **netIncome**: Real income - Real expense
- **netCredit**: Total credit - Total debit

### 2. Category Breakdown
Shows how much money was spent/received in each category with action-wise breakdown.

### 3. Sub-Category Breakdown
Detailed breakdown by sub-categories with all action types.

### 4. Party Summary
Shows all transactions with each party (friend, family, etc.) with action-wise amounts.

### 5. Account Summary
Shows how much money moved in/out of each account with action-wise breakdown.

### 6. Action Summary
Shows total amount for each action type (Buyer, Payer, Refund, Return, etc.).

### 7. Daily Summary
Day-wise breakdown with all transactions for that day.

### 8. All Transactions
Complete list of all transactions with full details.

### 9. Statistics
Quick statistics about the month's data.

## Usage Examples

### Get December 2024 Summary
```json
{
  "Month": 12,
  "Year": 2024
}
```

### Get December 2024 Summary for Specific Account
```json
{
  "Month": 12,
  "Year": 2024,
  "AccountId": 1
}
```

### Get December 2024 Summary for Specific Friend
```json
{
  "Month": 12,
  "Year": 2024,
  "PartyId": 5
}
```

## Real-World Scenarios

### Scenario 1: Friend buys laptop for you
- **Buyer** action will show in:
  - `realIncome`: +₹50,000
  - `categorySummary.Electronics.Buyer`: +₹50,000
  - `partySummary.John Doe.Buyer`: +₹50,000
  - `actionSummary.Buyer`: +₹50,000

### Scenario 2: You pay friend back
- **Return** action will show in:
  - `realExpense`: +₹30,000
  - `categorySummary.Repayment.Return`: +₹30,000
  - `partySummary.John Doe.Return`: +₹30,000
  - `actionSummary.Return`: +₹30,000

This API gives you complete visibility into your monthly financial activities! 