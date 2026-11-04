@description('Creates a Log Analytics Workspace and Azure Container Apps Managed Environment.')
param environmentName string
param location string = resourceGroup().location
param tags object = {}
param logAnalyticsWorkspaceName string = '${environmentName}-logs'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource managedEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: environmentName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    zoneRedundant: false
  }
}

@description('Resource ID of the managed environment.')
output id string = managedEnvironment.id

@description('Name of the managed environment.')
output name string = managedEnvironment.name

@description('Default domain of the managed environment.')
output defaultDomain string = managedEnvironment.properties.defaultDomain

