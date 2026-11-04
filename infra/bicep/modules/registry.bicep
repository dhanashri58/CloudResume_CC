@description('Creates an Azure Container Registry for CloudResumeAI container images.')
param registryName string
param location string = resourceGroup().location
param tags object = {}
param principalId string = ''

// AcrPull built-in role definition ID
var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
    zoneRedundancy: 'Disabled'
  }
}

// Grant AcrPull to Managed Identity if principalId is provided
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(principalId)) {
  name: guid(containerRegistry.id, principalId, acrPullRoleId)
  scope: containerRegistry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}

@description('Resource ID of the container registry.')
output id string = containerRegistry.id

@description('Name of the container registry.')
output name string = containerRegistry.name

@description('Login server URL of the container registry.')
output loginServer string = containerRegistry.properties.loginServer

