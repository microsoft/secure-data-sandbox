using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace Laboratory.Entities
{
  public class Contest
  {
    public Contest(string name)
    {
      Name = name;
    }

    [Required]
    public string Name { get; set; }
  }
}