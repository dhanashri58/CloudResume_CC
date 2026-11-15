targetScope = 'resourceGroup'

@description('Target environment name (dev, staging, prod).')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

@description('Azure region for resource deployment.')
param location string = resourceGroup().location

@description('Base workload name used for resource naming.')
param workloadName string = 'cloudresumeai'

@description('PostgreSQL Administrator username.')
param postgresAdminUsername string = 'cloudresume_admin'

@secure()
@description('PostgreSQL Administrator password.')
param postgresAdminPassword string

@secure()
@description('Flask backend SECRET_KEY.')
param flaskSecretKey string

@secure()
@description('Google Gemini API Key for AI resume features.')
param geminiApiKey string

param geminiModel string = 'gemini-3.5-flash-lite'

@description('Microsoft Entra External ID Tenant ID.')
param entraTenantId string = ''

@description('Microsoft Entra External ID Application (Client) ID.')
param entraClientId string = ''

@description('Microsoft Entra External ID Audience.')
param entraAudience string = ''

@description('Microsoft Entra External ID Issuer URL.')
param entraIssuer string = ''

@description('Allowed CORS origins for the backend API (comma-separated).')
param corsOrigins string = ''

@description('Optional notification email addresses for Azure Cost Management budget alerts.')
param budgetAlertEmails array = []

@description('Monthly spending budget limit in USD.')
param monthlyBudgetAmount int = 25

@description('Tag metadata applied to all deployed Azure resources.')
param tags object = {
  project: 'CloudResumeAI'
  environment: environment
  managedBy: 'AzureBicep'
}

// Deterministic unique token for globally unique Azure resource names (ACR, Storage, Key Vault)
var uniqueToken = toLower(uniqueString(resourceGroup().id, workloadName))

// Scale-to-zero in non-production environments to eliminate idle compute cost
var minReplicas = environment == 'prod' ? 1 : 0

var identityName = 'id-${workloadName}-${environment}'
var registryName = 'cr${take(replace(workloadName, '-', ''), 12)}${take(uniqueToken, 6)}'
var storageAccountName = 'st${take(replace(workloadName, '-', ''), 10)}${take(uniqueToken, 8)}'
var keyVaultName = 'kv-${take(workloadName, 12)}-${take(uniqueToken, 6)}'
var postgresServerName = 'psql-${workloadName}-${environment}-${take(uniqueToken, 6)}'
var containerAppEnvName = 'cae-${workloadName}-${environment}'
var backendAppName = 'ca-${workloadName}-backend-${environment}'
var frontendAppName = 'ca-${workloadName}-frontend-${environment}'

// 1. User-Assigned Managed Identity
module identity 'modules/identity.bicep' = {
  name: 'deploy-identity-${environment}'
  params: {
    identityName: identityName
    location: location
    tags: tags
  }
}

// 2. Azure Container Registry
module registry 'modules/registry.bicep' = {
  name: 'deploy-registry-${environment}'
  params: {
    registryName: registryName
    location: location
    tags: tags
    principalId: identity.outputs.principalId
  }
}

// 3. Azure Storage Account with Private Container
module storage 'modules/storage.bicep' = {
  name: 'deploy-storage-${environment}'
  params: {
    storageAccountName: storageAccountName
    location: location
    tags: tags
    containerName: 'cloudresumeai-resumes'
    principalId: identity.outputs.principalId
  }
}

// 4. Azure Key Vault
module keyVault 'modules/keyvault.bicep' = {
  name: 'deploy-keyvault-${environment}'
  params: {
    keyVaultName: keyVaultName
    location: location
    tags: tags
    principalId: identity.outputs.principalId
  }
}

// 5. Azure Database for PostgreSQL Flexible Server
module database 'modules/database.bicep' = {
  name: 'deploy-database-${environment}'
  params: {
    serverName: postgresServerName
    location: location
    tags: tags
    adminUsername: postgresAdminUsername
    adminPassword: postgresAdminPassword
    databaseName: 'cloudresumeai_${environment}'
  }
}

// 6. Azure Container Apps Managed Environment
module containerAppEnv 'modules/environment.bicep' = {
  name: 'deploy-environment-${environment}'
  params: {
    environmentName: containerAppEnvName
    location: location
    tags: tags
  }
}

// Placeholder image tag; replaced in CD deployment workflow
var backendImage = '${registry.outputs.loginServer}/cloudresumeai-backend:latest'
var frontendImage = '${registry.outputs.loginServer}/cloudresumeai-frontend:latest'

var defaultCorsOrigins = environment == 'prod' ? 'https://${frontendAppName}.${containerAppEnv.outputs.defaultDomain}' : 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173'
var effectiveCorsOrigins = !empty(corsOrigins) ? corsOrigins : defaultCorsOrigins

// 7. Backend Container App
module backendApp 'modules/backend.bicep' = {
  name: 'deploy-backend-${environment}'
  params: {
    appName: backendAppName
    location: location
    tags: tags
    environmentId: containerAppEnv.outputs.id
    identityId: identity.outputs.id
    identityClientId: identity.outputs.clientId
    registryLoginServer: registry.outputs.loginServer
    image: backendImage
    databaseHost: database.outputs.fqdn
    databaseName: database.outputs.databaseName
    databaseUser: database.outputs.adminUsername
    databasePassword: postgresAdminPassword
    secretKey: flaskSecretKey
    geminiApiKey: geminiApiKey
    geminiModel: geminiModel
    storageAccountName: storage.outputs.name
    storageContainerName: storage.outputs.containerName
    keyVaultUrl: keyVault.outputs.vaultUri
    minReplicas: minReplicas
    entraTenantId: entraTenantId
    entraClientId: entraClientId
    entraAudience: entraAudience
    entraIssuer: entraIssuer
    corsOrigins: effectiveCorsOrigins
  }
}

// 8. Frontend Container App
module frontendApp 'modules/frontend.bicep' = {
  name: 'deploy-frontend-${environment}'
  params: {
    appName: frontendAppName
    location: location
    tags: tags
    environmentId: containerAppEnv.outputs.id
    identityId: identity.outputs.id
    registryLoginServer: registry.outputs.loginServer
    image: frontendImage
    minReplicas: minReplicas
    backendApiUrl: backendApp.outputs.apiUrl
  }
}

// 9. Azure Cost Management Budget & Alerts
module budget 'modules/budget.bicep' = if (!empty(budgetAlertEmails)) {
  name: 'deploy-budget-${environment}'
  params: {
    budgetName: 'budget-${workloadName}-${environment}'
    amount: monthlyBudgetAmount
    contactEmails: budgetAlertEmails
  }
}

// Deployment Outputs
@description('Resource ID of the managed identity.')
output identityId string = identity.outputs.id

@description('Login server URL for Azure Container Registry.')
output acrLoginServer string = registry.outputs.loginServer

@description('Storage Account name for resumes.')
output storageAccountName string = storage.outputs.name

@description('Azure Key Vault URI.')
output keyVaultUri string = keyVault.outputs.vaultUri

@description('PostgreSQL server fully qualified domain name.')
output postgresFqdn string = database.outputs.fqdn

@description('Backend API HTTPS URL.')
output backendApiUrl string = backendApp.outputs.apiUrl

@description('Frontend application HTTPS URL.')
output frontendAppUrl string = frontendApp.outputs.appUrl
