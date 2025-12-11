using Microsoft.AspNetCore.Mvc;

namespace Controllers
{
    [ApiController]
    [Route("api/Posters")]
    public class PosterController : ControllerBase
    {
        [HttpPost()]
        public async Task<IActionResult> UploadPoster([FromQuery] string id, IFormFile poster)
        {
            if (poster == null || poster.Length == 0)
                return BadRequest("No file uploaded.");

            var rootPath = Path.Combine(Directory.GetCurrentDirectory(), "../Biscoop-app/public/images");

            if (!Directory.Exists(rootPath))
                Directory.CreateDirectory(rootPath);

            var existingFiles = Directory.GetFiles(rootPath, $"movie_{id}.*");
            foreach (var file in existingFiles)
            {
                System.IO.File.Delete(file);
            }

            var fileName = $"movie_{id}{Path.GetExtension(poster.FileName)}";
            var filePath = Path.Combine(rootPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await poster.CopyToAsync(stream);

            return Ok("Uploaded");
        }

        [HttpDelete()]
        public async Task<IActionResult> DeletePoster([FromQuery] string id)
        {
            var rootPath = Path.Combine(Directory.GetCurrentDirectory(), "../Biscoop-app/public/images");

            if (!Directory.Exists(rootPath))
                Directory.CreateDirectory(rootPath);

            var existingFiles = Directory.GetFiles(rootPath, $"movie_{id}.*");
            foreach (var file in existingFiles)
            {
                System.IO.File.Delete(file);
            }

            return NoContent();
        }
    }
}