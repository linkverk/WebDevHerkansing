using Microsoft.AspNetCore.Mvc;
using BioscoopServer.models;
using BioscoopServer.DBServices;
using BioscoopServer.Models.ModelsDTOs;

namespace Controllers
{
    [ApiController]
    [Route("api/Films")]
    public class FilmController : ControllerBase
    {
        private readonly DBFilmService _DBFilmService;

        public FilmController(DBFilmService DBFilmService)
        {
            _DBFilmService = DBFilmService;
        }

        [HttpGet("GetById")]
        public async Task<IActionResult> GetFilmById([FromQuery] string id)
        {
            var film = await _DBFilmService.GetByIdAsync(Guid.Parse(id));
            if (film == null)
            {
                return BadRequest($"Film with id {id} was not found");
            }
            return Ok(film);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllFilms()
        {
            var films = await _DBFilmService.GetAllAsync();
            return Ok(films);
        }

        [HttpGet("GetAllFull")]
        public async Task<IActionResult> GetAllFilmsFull()
        {
            var films = await _DBFilmService.GetFilmsFull();
            return Ok(films);
        }

        [HttpPost("UploadPoster")]
        public async Task<IActionResult> UploadPoster([FromQuery] string id, IFormFile poster)
        {
            if (poster == null || poster.Length == 0)
                return BadRequest("No file uploaded.");

            var rootPath = Path.Combine(Directory.GetCurrentDirectory(), "../Biscoop-app/public/images");

            if (!Directory.Exists(rootPath))
                Directory.CreateDirectory(rootPath);

            var fileName = $"movie_{id}{Path.GetExtension(poster.FileName)}";

            var filePath = Path.Combine(rootPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await poster.CopyToAsync(stream);

            return Ok("Uploaded");
        }

        [HttpPost("AddOrUpdate")]
        public async Task<IActionResult> AddOrUpdateFilm([FromBody] FilmDTO filmModel)
        {
            if (filmModel == null)
                return BadRequest("Film is required.");

            Guid filmId;
            Guid.TryParse(filmModel.Id, out filmId);

            var film = new Film
            {
                Id = filmId,
                Name = filmModel.Name,
                Rating = filmModel.Rating,
                Genre = filmModel.Genre,
                Duration = filmModel.Duration,
                Description = filmModel.Description,
            };

            var addedFilm = await _DBFilmService.AddOrUpdateAsync(film);
            return Ok(addedFilm);
        }
        [HttpPost("Delete")]
        public async Task<IActionResult> DeleteFilm([FromBody] FilmDTO filmModel)
        {
            if (filmModel == null)
                return BadRequest("Film is required.");

            if (!Guid.TryParse(filmModel.Id, out Guid filmId))
                return BadRequest("Film Id is invalid");

            var posterPath = Path.Combine(Directory.GetCurrentDirectory(),
                "../Biscoop-app/public/images", $"movie_{filmModel.Id}.png");

            if (System.IO.File.Exists(posterPath))
            {
                System.IO.File.Delete(posterPath);
            }

            var film = new Film
            {
                Id = filmId,
                Name = filmModel.Name,
                Rating = filmModel.Rating,
                Genre = filmModel.Genre,
                Duration = filmModel.Duration,
                Description = filmModel.Description,
            };

            await _DBFilmService.DeleteAsync(film);

            return Ok();
        }

    }
}
