@description('Creates an Azure Key Vault with RBAC authorization for CloudResumeAI secrets.')
param keyVaultName string
param location string = resourceGroup().location
param tags object = {}
param principalId string = ''

// Key Vault Secrets User built-in role definition ID
var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
  }
}

// Grant Key Vault Secrets User to Managed Identity
resource keyVaultRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(principalId)) {
  name: guid(keyVault.id, principalId, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}

@description('Resource ID of the key vault.')
output id string = keyVault.id

@description('Name of the key vault.')
output name string = keyVault.name

@description('URI endpoint of the key vault.')
output vaultUri string = keyVault.properties.vaultUri

