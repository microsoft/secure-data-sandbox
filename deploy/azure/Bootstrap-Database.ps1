$ErrorActionPreference='Stop'

function Bootstrap-Database {
  $token = curl 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://database.windows.net/' -H 'Metadata: true' | convertfrom-json;

  $conn = new-object System.Data.SqlClient.SqlConnection;
  $conn.ConnectionString = "Data Source=${Env:SERVER}; Initial Catalog=${Env:DATABASE};";
  $conn.AccessToken = $token.access_token;
  
  $sql = @"
create user [@identity] with default_schema=[dbo], SID=@sid, TYPE=E;
alter role db_ddladmin add member [@identity];
alter role db_datareader add member [@identity];
alter role db_datawriter add member [@identity];
"@
  $cmd = new-object System.Data.SqlClient.SqlCommand($sql, $conn)
  $cmd.Parameters.AddWithValue("@identity", $Env:IDENTITY)
  
  foreach ($byte in [System.Guid]::Parse($Env:CLIENT_ID).ToByteArray()) { $byteGuid += [System.String]::Format("{0:X2}", $byte) }
  $cmd.Parameters.AddWithValue("@sid", "0x$byteGuid")

  $conn.Open()
  $cmd.ExecuteNonQuery()
  $conn.Close()
}

Bootstrap-Database
