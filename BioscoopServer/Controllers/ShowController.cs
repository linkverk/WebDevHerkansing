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

        [HttpGet("GetById")]
        public async Task<IActionResult> GetShowById([FromQuery] string id)
        {
            var Show = await _DBShowService.GetByIdAsync(Guid.Parse(id));
            if (Show == null)
            {
                return BadRequest($"Show with id {id} was not found");
            }
            return Ok(Show);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllShows()
        {
            var Shows = await _DBShowService.GetAllAsync();
            return Ok(Shows);
        }

        [HttpPost("AddOrUpdate")]
        public async Task<IActionResult> AddOrUpdateShow([FromBody] ShowDTO ShowModel)
        {
            if (ShowModel == null)
                return BadRequest("Show is required.");

            Console.WriteLine(ShowModel.FilmId);
            Console.WriteLine(ShowModel.RoomId);

            Guid ShowId;
            Guid.TryParse(ShowModel.Id, out ShowId);
            Guid FilmId;
            Guid.TryParse(ShowModel.FilmId, out FilmId);
            Guid RoomId;
            Guid.TryParse(ShowModel.RoomId, out RoomId);
            Console.WriteLine(FilmId);
            Console.WriteLine(RoomId);
            var Show = new Show
            {
                Id = ShowId,
                FilmId = FilmId,
                RoomId = RoomId,
                Begintijd = ShowModel.startDate,
                Eindtijd = ShowModel.endDate

            };

            var addedShow = await _DBShowService.AddOrUpdateAsync(Show);
            return Ok(addedShow);
        }
        [HttpPost("Delete")]
        public async Task<IActionResult> DeleteShow([FromBody] ShowDTO ShowModel)
        {
            if (ShowModel == null)
                return BadRequest("Show is required.");

            Guid ShowId;
            Guid FilmId;
            Guid RoomId;
            if (Guid.TryParse(ShowModel.Id, out ShowId) && Guid.TryParse(ShowModel.FilmId, out FilmId) && Guid.TryParse(ShowModel.RoomId, out RoomId))
            {

                var Show = new Show
                {
                    Id = ShowId,
                    FilmId = FilmId,
                    RoomId = RoomId,
                    Begintijd = ShowModel.startDate,
                    Eindtijd = ShowModel.endDate
                };
                await _DBShowService.DeleteAsync(Show);
                return Ok();
            }
            else
                {
                    return BadRequest("Show Id is invalid");
                }
            }
        }
    }