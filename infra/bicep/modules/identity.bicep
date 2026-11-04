@description('Creates a User-Assigned Managed Identity for CloudResumeAI services.')
param identityName string
param location string = resourceGroup().location
param tags object = {}

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
  tags: tags
}

@description('Resource ID of the created managed identity.')
output id string = managedIdentity.id

@description('Name of the created managed identity.')
output name string = managedIdentity.name

@description('Principal (Object) ID used for role assignments.')
output principalId string = managedIdentity.properties.principalId

@description('Client ID used by services to authenticate as this identity.')
output clientId string = managedIdentity.properties.clientId

