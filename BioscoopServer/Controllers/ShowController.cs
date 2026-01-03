using Microsoft.AspNetCore.Mvc;
using BioscoopServer.models;
using BioscoopServer.DBServices;
using BioscoopServer.Models.ModelsDTOs;

namespace Controllers
{
    [ApiController]
    [Route("api/Shows")]
    public class ShowController : ControllerBase
    {
        private readonly DBShowService _DBShowService;

        public ShowController(DBShowService DBShowService)
        {
            _DBShowService = DBShowService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetShowById(string id)
        {
            var Show = await _DBShowService.GetByIdAsync(Guid.Parse(id));
            if (Show == null)
            {
                return BadRequest($"Show with id {id} was not found");
            }
            return Ok(Show);
        }

        [HttpGet()]
        public async Task<IActionResult> GetAllShows()
        {
            var Shows = await _DBShowService.GetAllAsync();
            return Ok(Shows);
        }

        [HttpPost()]
        public async Task<IActionResult> AddShow([FromBody] ShowDTO ShowModel)
        {
            if (ShowModel == null)
                return BadRequest("Show is required.");

            Guid ShowId;
            Guid.TryParse(ShowModel.Id, out ShowId);
            Guid FilmId;
            Guid RoomId;
            if (Guid.TryParse(ShowModel.FilmId, out FilmId) && Guid.TryParse(ShowModel.RoomId, out RoomId))
            {

                var Show = new Show
                {
                    Id = ShowId,
                    FilmId = FilmId,
                    RoomId = RoomId,
                    StartDate = ShowModel.startDate,
                    EndDate = ShowModel.endDate

                };

                var addedShow = await _DBShowService.AddValidAsync(Show);
                if (addedShow == null)
                {
                    return BadRequest("There is already a show in this room at this time.");
                }
                return Ok(addedShow);
            }
            else
            {
                return BadRequest("Invalid show");
            }
        }

        [HttpPatch()]
        public async Task<IActionResult> UpdateShow([FromBody] ShowDTO ShowModel)
        {
            if (ShowModel == null)
                return BadRequest("Show is required.");

            Guid ShowId;
            Guid.TryParse(ShowModel.Id, out ShowId);
            Guid FilmId;
            Guid RoomId;
            if (Guid.TryParse(ShowModel.FilmId, out FilmId) && Guid.TryParse(ShowModel.RoomId, out RoomId))
            {

                var Show = new Show
                {
                    Id = ShowId,
                    FilmId = FilmId,
                    RoomId = RoomId,
                    StartDate = ShowModel.startDate,
                    EndDate = ShowModel.endDate

                };

                var addedShow = await _DBShowService.UpdateValidAsync(Show);
                if (addedShow == null)
                {
                    return BadRequest("There is already a show in this room at this time.");
                }
                return Ok(addedShow);
            }
            else
            {
                return BadRequest("Invalid show");
            }
        }

        [HttpDelete("")]
        public async Task<IActionResult> DeleteShow([FromQuery] string id)
        {
            var show = await _DBShowService.GetByIdAsync(Guid.Parse(id));
            if (show == null)
            {
                return BadRequest($"show with id {id} was not found");
            }
            await _DBShowService.DeleteAsync(show);
            return NoContent();
        }
    }
}