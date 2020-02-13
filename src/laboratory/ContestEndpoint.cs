using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using Laboratory.Entities;
using System.ComponentModel.DataAnnotations;
using System.IO;
using Microsoft.WindowsAzure.Storage.Blob;
using Newtonsoft.Json;

namespace Laboratory
{
  [StorageAccount(AppSettings.MetadataStorageAccount)]
  public class ContestEndpoint
  {
    [FunctionName("CreateContest")]
    public async Task<IActionResult> CreateContest(
        [HttpTrigger("put", Route = "contests/{contestName}")] Contest contest,
        string contestName,
        [Blob("laboratory/contests/{contestName}/contest.json", FileAccess.ReadWrite)] CloudBlockBlob blob,
        ILogger log)
    {
      var validationResults = new List<ValidationResult>();
      if (!Validator.TryValidateObject(contest, new ValidationContext(contest), validationResults, true))
      {
        var error = new
        {
          Message = "Invalid Contest",
          Errors = validationResults.Select(r => r.ErrorMessage)
        };
        return new BadRequestObjectResult(error);
      }

      if (contestName != contest.Name)
      {
        var error = new
        {
          Message = "Name mismatch",
          Errors = new[] { $"The name in the URL must match the name specified in the body: {contestName} vs {contest.Name}" }
        };
        return new BadRequestObjectResult(error);
      }

      var json = JsonConvert.SerializeObject(contest);
      await blob.UploadTextAsync(json);

      return new OkObjectResult(contest);
    }

    [FunctionName("GetContest")]
    public IActionResult GetContest(
        [HttpTrigger("get", Route = "contests/{contestName}")] HttpRequest req,
        [Blob("laboratory/contests/{contestName}/contest.json", FileAccess.Read)] string contestText,
        ILogger log)
    {
      if (contestText != null)
      {
        var contest = JsonConvert.DeserializeObject<Contest>(contestText);
        return new OkObjectResult(contest);
      }

      return new NotFoundResult();
    }

    [FunctionName("ListContests")]
    public async Task<IActionResult> ListContests(
        [HttpTrigger("get", Route = "contests")] HttpRequest req,
        [Blob("laboratory/contests", FileAccess.Read)] CloudBlobDirectory contestsDir,
        ILogger log)
    {
      var lookupTasks = new List<Task<string>>();
      BlobContinuationToken continuationToken = new BlobContinuationToken();
      do
      {
        var resultSegment = await contestsDir.ListBlobsSegmentedAsync(false, BlobListingDetails.Metadata, null, continuationToken, null, null);
        var tasks = resultSegment.Results
          .OfType<CloudBlobDirectory>()
          .Select(d => d.GetBlockBlobReference("contest.json").DownloadTextAsync());
        lookupTasks.AddRange(tasks);

        continuationToken = resultSegment.ContinuationToken;
      } while (continuationToken != null);

      var jsons = await Task.WhenAll(lookupTasks);
      var contests = jsons.Select(s => JsonConvert.DeserializeObject<Contest>(s));

      return new OkObjectResult(contests);
    }
  }
}
