$ErrorActionPreference='Stop'

Import-Module Az.Sql

function Bootstrap-Database {
  $token = curl 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://database.windows.net/' -H 'Metadata: true' | convertfrom-json;

  while ($true) {
    try {
      $conn = New-Object System.Data.SqlClient.SqlConnection;
      $conn.ConnectionString = "Data Source=${Env:SERVER_FQDN}; Initial Catalog=${Env:DATABASE};";
      $conn.AccessToken = $token.access_token;
      $conn.Open()

      Write-Output "Connected to ${Env:SERVER_FQDN}/${Env:DATABASE} using Managed Identity"
      break
    }
    catch [System.Data.SqlClient.SqlException] {
      if ($_.Exception.Message -match 'Client with IP address ''(?<ipAddress>.*)'' is not allowed to access the server') {
        $ipAddress = $Matches.ipAddress
        
        Connect-AzAccount -Identity
        New-AzSqlServerFirewallRule -ResourceGroupName $Env:RESOURCE_GROUP -ServerName $Env:SERVER -FirewallRuleName 'bootstrap' -StartIpAddress $ipAddress -EndIpAddress $ipAddress
        Write-Output "Added bootstrap firewall rule for $ipAddress"
        Start-Sleep -Seconds 5
      }
    }
  }
  
  foreach ($byte in [System.Guid]::Parse($Env:CLIENT_ID).ToByteArray()) { $byteGuid += [System.String]::Format("{0:X2}", $byte) }
  $sql = @"
if not exists (select name from sys.database_principals where name = '$Env:IDENTITY')
begin
  create user [$Env:IDENTITY] with default_schema=[dbo], SID=0x$byteGuid, TYPE=E;
end

alter role db_ddladmin add member [$Env:IDENTITY];
alter role db_datareader add member [$Env:IDENTITY];
alter role db_datawriter add member [$Env:IDENTITY];
"@
  $cmd = New-Object System.Data.SqlClient.SqlCommand($sql, $conn)
  $cmd.ExecuteNonQuery()
  Write-Output "Added ${Env:IDENTITY} as an AAD user to ${Env:SERVER_FQDN}/${Env:DATABASE}"

  $conn.Close()

  try {
    Remove-AzSqlServerFirewallRule -ResourceGroupName $Env:RESOURCE_GROUP -ServerName $Env:SERVER -FirewallRuleName 'bootstrap' -Force
    Write-Output "Removed bootstrap firewall rule"
  }
  catch {
    Write-Output "Could not remove bootstrap firewall rule"
  }
}

Bootstrap-Database
