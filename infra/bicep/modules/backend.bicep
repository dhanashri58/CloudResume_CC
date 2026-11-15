@description('Creates the Azure Container App for the CloudResumeAI Flask backend API.')
param appName string
param location string = resourceGroup().location
param tags object = {}
param environmentId string
param identityId string
param identityClientId string
param registryLoginServer string
param image string
param cpu string = '0.5'
param memory string = '1.0Gi'
param minReplicas int = 1
param maxReplicas int = 5

param databaseHost string
param databaseName string
param databaseUser string

@secure()
param databasePassword string

@secure()
param secretKey string

@secure()
param geminiApiKey string

param geminiModel string = 'gemini-3.5-flash-lite'
param storageAccountName string
param storageContainerName string = 'cloudresumeai-resumes'
param keyVaultUrl string = ''
param entraTenantId string = ''
param entraClientId string = ''
param entraAudience string = ''
param entraIssuer string = ''
param corsOrigins string = 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173'

resource backendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: appName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 5000
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: registryLoginServer
          identity: identityId
        }
      ]
      secrets: [
        {
          name: 'db-password'
          value: databasePassword
        }
        {
          name: 'secret-key'
          value: secretKey
        }
        {
          name: 'gemini-api-key'
          value: geminiApiKey
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: image
          resources: {
            cpu: json(cpu)
            memory: memory
          }
          env: [
            {
              name: 'FLASK_ENV'
              value: 'production'
            }
            {
              name: 'FLASK_DEBUG'
              value: '0'
            }
            {
              name: 'PORT'
              value: '5000'
            }
            {
              name: 'SECRET_KEY'
              secretRef: 'secret-key'
            }
            {
              name: 'POSTGRES_USER'
              value: databaseUser
            }
            {
              name: 'POSTGRES_PASSWORD'
              secretRef: 'db-password'
            }
            {
              name: 'POSTGRES_DB'
              value: databaseName
            }
            {
              name: 'POSTGRES_HOST'
              value: databaseHost
            }
            {
              name: 'POSTGRES_PORT'
              value: '5432'
            }
            {
              name: 'POSTGRES_SSLMODE'
              value: 'require'
            }
            {
              name: 'DATABASE_URL'
              value: 'postgresql+psycopg2://${databaseUser}:${databasePassword}@${databaseHost}:5432/${databaseName}?sslmode=require'
            }
            {
              name: 'AZURE_STORAGE_MODE'
              value: 'azure'
            }
            {
              name: 'AZURE_STORAGE_ACCOUNT_NAME'
              value: storageAccountName
            }
            {
              name: 'AZURE_STORAGE_CONTAINER_NAME'
              value: storageContainerName
            }
            {
              name: 'AZURE_KEY_VAULT_URL'
              value: keyVaultUrl
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: identityClientId
            }
            {
              name: 'GEMINI_API_KEY'
              secretRef: 'gemini-api-key'
            }
            {
              name: 'GEMINI_MODEL'
              value: geminiModel
            }
            {
              name: 'DEV_AUTH_ENABLED'
              value: 'false'
            }
            {
              name: 'CORS_ORIGINS'
              value: corsOrigins
            }
            {
              name: 'AZURE_ENTRA_TENANT_ID'
              value: entraTenantId
            }
            {
              name: 'AZURE_ENTRA_CLIENT_ID'
              value: entraClientId
            }
            {
              name: 'AZURE_ENTRA_AUDIENCE'
              value: entraAudience
            }
            {
              name: 'AZURE_ENTRA_ISSUER'
              value: entraIssuer
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: 5000
              }
              initialDelaySeconds: 15
              periodSeconds: 30
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 5000
              }
              initialDelaySeconds: 5
              periodSeconds: 15
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
      }
    }
  }
}

@description('Resource ID of the backend Container App.')
output id string = backendApp.id

@description('Name of the backend Container App.')
output name string = backendApp.name

@description('FQDN of the backend Container App.')
output fqdn string = backendApp.properties.configuration.ingress.fqdn

@description('Full HTTPS URL of the backend API.')
output apiUrl string = 'https://${backendApp.properties.configuration.ingress.fqdn}'
