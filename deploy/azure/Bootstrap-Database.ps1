$ErrorActionPreference='Stop'

function Bootstrap-Database {
  $token = curl 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://database.windows.net/' -H 'Metadata: true' | convertfrom-json;

  $conn = new-object System.Data.SqlClient.SqlConnection;
  $conn.ConnectionString = "Data Source=${Env:SERVER}; Initial Catalog=${Env:DATABASE};";
  $conn.AccessToken = $token.access_token;
  $conn.Open()

  foreach ($byte in [System.Guid]::Parse($Env:CLIENT_ID).ToByteArray()) { $byteGuid += [System.String]::Format("{0:X2}", $byte) }
  $sql = @"
if not exists (select name from sys.database_principals where name = '[$Env:IDENTITY]')
begin
  create user [$Env:IDENTITY] with default_schema=[dbo], SID=0x$byteGuid, TYPE=E;
end

alter role db_ddladmin add member [$Env:IDENTITY];
alter role db_datareader add member [$Env:IDENTITY];
alter role db_datawriter add member [$Env:IDENTITY];
"@
  $cmd = new-object System.Data.SqlClient.SqlCommand($sql, $conn)
  $cmd.ExecuteNonQuery()

  $conn.Close()
}

Bootstrap-Database
