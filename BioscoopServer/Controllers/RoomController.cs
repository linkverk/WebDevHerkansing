using Microsoft.AspNetCore.Mvc;
using BioscoopServer.models;
using BioscoopServer.DBServices;
using BioscoopServer.Models.ModelsDTOs;

namespace Controllers
{
    [ApiController]
    [Route("api/Rooms")]
    public class RoomController : ControllerBase
    {
        private readonly DBRoomService _DBRoomService;

        public RoomController(DBRoomService DBRoomService)
        {
            _DBRoomService = DBRoomService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoomById(string id)
        {
            var Room = await _DBRoomService.GetByIdAsync(Guid.Parse(id));
            if (Room == null)
            {
                return BadRequest($"Room with id {id} was not found");
            }
            return Ok(Room);
        }

        [HttpGet()]
        public async Task<IActionResult> GetAllRoomsFull()
        {
            var Rooms = await _DBRoomService.GetRoomsFull();
            return Ok(Rooms);
        }

        [HttpPost()]
        public async Task<IActionResult> AddRoom([FromBody] RoomDTO RoomModel)
        {
            if (RoomModel == null)
                return BadRequest("Room is required.");

            Guid RoomId;
            Guid.TryParse(RoomModel.Id, out RoomId);

            var Room = new Room
            {
                Id = RoomId,
                Naam = RoomModel.Naam,
                Rijen = RoomModel.Rijen,
                StoelenPerRij = RoomModel.StoelenPerRij
            };

            var addedRoom = await _DBRoomService.AddAsync(Room);
            return Ok(addedRoom);
        }

        [HttpPatch()]
        public async Task<IActionResult> UpdateRoom([FromBody] RoomDTO RoomModel)
        {
            if (RoomModel == null)
                return BadRequest("Room is required.");

            Guid RoomId;
            Guid.TryParse(RoomModel.Id, out RoomId);

            var Room = new Room
            {
                Id = RoomId,
                Naam = RoomModel.Naam,
                Rijen = RoomModel.Rijen,
                StoelenPerRij = RoomModel.StoelenPerRij
            };

            var addedRoom = await _DBRoomService.UpdateAsync(Room);
            return Ok(addedRoom);
        }

        [HttpDelete("")]
        public async Task<IActionResult> DeleteRoom([FromQuery] string id)
        {
            if (id == null)
                return BadRequest("Room id is required.");

           var room = await _DBRoomService.GetByIdAsync(Guid.Parse(id));
            if (room == null)
            {
                return BadRequest($"room with id {id} was not found");
            }
            await _DBRoomService.DeleteAsync(room);
            return NoContent();
        }
    }
}