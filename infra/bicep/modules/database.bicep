@description('Creates an Azure Database for PostgreSQL Flexible Server for CloudResumeAI.')
param serverName string
param location string = resourceGroup().location
param tags object = {}
param adminUsername string = 'cloudresume_admin'

@secure()
@description('Administrator password for PostgreSQL.')
param adminPassword string

param databaseName string = 'cloudresumeai_prod'
param skuName string = 'Standard_B1ms'
param tier string = 'Burstable'
param postgresVersion string = '16'
param storageSizeGB int = 32

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: serverName
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: tier
  }
  properties: {
    version: postgresVersion
    administratorLogin: adminUsername
    administratorLoginPassword: adminPassword
    storage: {
      storageSizeGB: storageSizeGB
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// Enforce SSL connections
resource sslConfig 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2023-03-01-preview' = {
  parent: postgresServer
  name: 'require_secure_transport'
  properties: {
    value: 'ON'
    source: 'user-override'
  }
}

// Allow Azure services and Container Apps to connect (0.0.0.0 rule)
resource allowAzureIps 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAllAzureServicesAndResourcesWithinAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: databaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

@description('Resource ID of the PostgreSQL server.')
output id string = postgresServer.id

@description('Name of the PostgreSQL server.')
output name string = postgresServer.name

@description('Fully qualified domain name of the PostgreSQL server.')
output fqdn string = postgresServer.properties.fullyQualifiedDomainName

@description('Database name created on the server.')
output databaseName string = database.name

@description('Administrator login username.')
output adminUsername string = adminUsername

