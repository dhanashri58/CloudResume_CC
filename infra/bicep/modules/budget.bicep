@description('Provisions an Azure Cost Management budget and automated threshold alerts.')
param budgetName string
param amount int = 25
param contactEmails array = []
param startDate string = utcNow('yyyy-MM-01')

resource budget 'Microsoft.Consumption/budgets@2023-05-01' = if (!empty(contactEmails)) {
  name: budgetName
  properties: {
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: startDate
    }
    amount: amount
    category: 'Cost'
    notifications: {
      NotificationFor50Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 50
        contactEmails: contactEmails
        thresholdType: 'Actual'
      }
      NotificationFor75Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 75
        contactEmails: contactEmails
        thresholdType: 'Actual'
      }
      NotificationFor90Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 90
        contactEmails: contactEmails
        thresholdType: 'Actual'
      }
      NotificationFor100Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        contactEmails: contactEmails
        thresholdType: 'Actual'
      }
    }
  }
}

@description('Name of the cost budget rule.')
output name string = budgetName

@description('Monthly spending limit in USD.')
output budgetAmount int = amount

