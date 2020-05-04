#!/usr/bin/env pwsh
$ErrorActionPreference='Stop'

# Retrieve settings from DNS TXT record
$settings = @{}
$(dig '@168.63.129.16' +short laboratory.environment.private txt).Split("\n") | % { 
  $parts = $_.Substring(1, $_.Length-2)
  $delimiter = $parts.IndexOf("=")
  $key = $parts.Substring(0, $delimiter)
  $value = $parts.Substring($delimiter + 1)
  $settings[$key] = $value
}

$server = $settings["sqlServer"]
$database = $settings["sqlDatabase"]
$identity = $settings["identity"]
$clientId = $settings["clientId"]
$storageAccount = $settings["storageAccount"]

$settings["runsQueueEndpoint"] -match 'https://(?<storageAccount>\w+)\..*/(?<queue>\w+)'
$runsQueueStorageAccount = $matches["storageAccount"]
$runsQueue = $matches["queue"]

# Configure storage
az storage queue create --auth-mode login --account-name $runsQueueStorageAccount -n $runsQueue
if ($LastExitCode -ne 0) {
  exit $LastExitCode 
}

# Connect to Azure SQL via AAD (Managed Identity)
$token = curl -s 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://database.windows.net/' -H 'Metadata: true' | ConvertFrom-Json;
$conn = New-Object System.Data.SqlClient.SqlConnection;
$conn.ConnectionString = "Data Source=$server; Initial Catalog=$database;";
$conn.AccessToken = $token.access_token;
$conn.Open()
Write-Output "Connected to $server/$database using Managed Identity"

# Grant AAD permissions in Azure SQL
foreach ($byte in [System.Guid]::Parse($clientId).ToByteArray()) { $byteGuid += [System.String]::Format("{0:X2}", $byte) }
$sql = @"
if not exists (select name from sys.database_principals where name = '$identity')
begin
create user [$identity] with default_schema=[dbo], SID=0x$byteGuid, TYPE=E;
end

alter role db_ddladmin add member [$identity];
alter role db_datareader add member [$identity];
alter role db_datawriter add member [$identity];
"@
$cmd = New-Object System.Data.SqlClient.SqlCommand($sql, $conn)
$cmd.ExecuteNonQuery()
Write-Output "Added $identity as an AAD user to $server/$database"

$conn.Close()

# Deallocate bootstrap VM (self)
$vmId = $(curl -s 'http://169.254.169.254/metadata/instance/compute/resourceId?api-version=2019-08-15&format=text' -H 'Metadata: true')
az vm deallocate --no-wait --ids $vmId
