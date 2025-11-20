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

        [HttpGet("GetById")]
        public async Task<IActionResult> GetRoomById([FromQuery] string id)
        {
            var Room = await _DBRoomService.GetByIdAsync(Guid.Parse(id));
            if (Room == null)
            {
                return BadRequest($"Room with id {id} was not found");
            }
            return Ok(Room);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllRooms()
        {
            var Rooms = await _DBRoomService.GetAllAsync();
            return Ok(Rooms);
        }

        [HttpPost("AddOrUpdate")]
        public async Task<IActionResult> AddOrUpdateRoom([FromBody] RoomDTO RoomModel)
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

            var addedRoom = await _DBRoomService.AddOrUpdateAsync(Room);
            return Ok(addedRoom);
        }
        [HttpPost("Delete")]
        public async Task<IActionResult> DeleteRoom([FromBody] RoomDTO RoomModel)
        {
            if (RoomModel == null)
                return BadRequest("Room is required.");

            Guid RoomId;
            if (Guid.TryParse(RoomModel.Id, out RoomId))
            {
                var Room = new Room
                {
                    Id = RoomId,
                    Naam = RoomModel.Naam,
                    Rijen = RoomModel.Rijen,
                    StoelenPerRij = RoomModel.StoelenPerRij
                };

                await _DBRoomService.DeleteAsync(Room);
                return Ok();
            }
            else
            {
                return BadRequest("Room Id is invalid");
            }
        }
    }
}