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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFilmByIdFull(string id)
        {
            var film = await _DBFilmService.GetFilmByIdFull(Guid.Parse(id));
            if (film == null)
            {
                return BadRequest($"Film with id {id} was not found");
            }
            return Ok(film);
        }

        [HttpGet()]
        public async Task<IActionResult> GetAllFilmsFull()
        {
            var films = await _DBFilmService.GetFilmsFull();
            return Ok(films);
        }

        [HttpPost()]
        public async Task<IActionResult> AddFilm([FromBody] FilmDTO filmModel)
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

            var addedFilm = await _DBFilmService.AddValidAsync(film);
            if (addedFilm == null)
            {
                return BadRequest("Show cannot be added because the duration does not fit some of its shows.");
            }
            return Ok(addedFilm);
        }

        [HttpPatch()]
        public async Task<IActionResult> UpdateFilm([FromBody] FilmDTO filmModel)
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

            var addedFilm = await _DBFilmService.UpdateValidAsync(film);
            if (addedFilm == null)
            {
                return BadRequest("Show cannot be added because the duration does not fit some of its shows.");
            }
            return Ok(addedFilm);
        }

        [HttpDelete("")]
        public async Task<IActionResult> DeleteFilm([FromQuery] string id)
        {
            var film = await _DBFilmService.GetByIdAsync(Guid.Parse(id));
            if (film == null)
            {
                return BadRequest($"Film with id {id} was not found");
            }
            await _DBFilmService.DeleteAsync(film);
            return NoContent();
        }
    }
}
