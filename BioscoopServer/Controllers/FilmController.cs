using Microsoft.AspNetCore.Mvc;
using BioscoopServer.models;
using BioscoopServer.DBServices;

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

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllFilms()
        {
            var films = await _DBFilmService.GetAllAsync();
            return Ok(films);
        }

        [HttpPost("AddOrUpdate")]
        public async Task<IActionResult> AddOrUpdateFilm([FromBody] FilmModel filmModel)
        {
            if (filmModel == null)
                return BadRequest("Film is required.");

            Guid filmId;
            if (string.IsNullOrWhiteSpace(filmModel.Id) || !Guid.TryParse(filmModel.Id, out filmId))
                filmId = Guid.NewGuid();

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
    }
    public class FilmModel
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Rating { get; set; }
        public string? Genre { get; set; }
        public int? Duration { get; set; }
        public string? Description { get; set; }
    }
}