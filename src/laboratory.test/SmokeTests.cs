using System;
using Xunit;

namespace Laboratory.Tests
{
  public class SmokeTests
  {
    [Fact]
    public void AlwaysPassingTest()
    {
      // Make sure that tests can compile & run
      // Make sure that CI triggers
      Assert.True(true);
    }
  }
}