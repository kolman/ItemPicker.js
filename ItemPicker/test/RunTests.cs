using System.IO;
using System.Linq;
using NUnit.Framework;
using SQUnit;

namespace ItemPicker.test
{
	public class RunTests
	{
		TestRunner _runner;

		[TestFixtureSetUp]
		public void TestFixtureSetUp()
		{
			_runner = new TestRunner();
		}

		[TestFixtureTearDown]
		public void TestFixtureTearDown()
		{
			_runner.Dispose();
		}

		static readonly string TestDirectory = Path.GetFullPath(@"..\test");
		public static string[] GetAllQUnitTestFiles()
		{
			return Directory
				.GetFiles(TestDirectory, "*.htm*")
				.Select(Path.GetFileName)
				.ToArray();
		}

		[Test]
		[TestCaseSource("GetAllQUnitTestFiles")]
		public void RunQUnitTests(string file)
		{
			var fullPath = Path.Combine(TestDirectory, file);
			var results = _runner.RunTestsInFile(fullPath);
			results.AssertAllTestsPassed();
		}
	}
}