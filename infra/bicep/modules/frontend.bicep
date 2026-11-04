@description('Creates the Azure Container App for the CloudResumeAI React frontend.')
param appName string
param location string = resourceGroup().location
param tags object = {}
param environmentId string
param identityId string
param registryLoginServer string
param image string
param cpu string = '0.25'
param memory string = '0.5Gi'
param minReplicas int = 1
param maxReplicas int = 3
param backendApiUrl string

resource frontendApp 'Microsoft.App/containerApps@2023-05-01' = {
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
        targetPort: 80
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: registryLoginServer
          identity: identityId
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: image
          resources: {
            cpu: json(cpu)
            memory: memory
          }
          env: [
            {
              name: 'BACKEND_API_URL'
              value: backendApiUrl
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/'
                port: 80
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/'
                port: 80
              }
              initialDelaySeconds: 5
              periodSeconds: 15
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

@description('Resource ID of the frontend Container App.')
output id string = frontendApp.id

@description('Name of the frontend Container App.')
output name string = frontendApp.name

@description('FQDN of the frontend Container App.')
output fqdn string = frontendApp.properties.configuration.ingress.fqdn

@description('Full HTTPS URL of the frontend application.')
output appUrl string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'

