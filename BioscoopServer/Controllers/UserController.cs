using Microsoft.AspNetCore.Mvc;
using BioscoopServer.models;
using BioscoopServer.DBServices;
using BioscoopServer.Models.ModelsDTOs;

namespace Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly DBUserService _DBUserService;

        public UserController(DBUserService DBUserService)
        {
            _DBUserService = DBUserService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest("Invalid user ID format");
            }

            var user = await _DBUserService.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound($"User with id {id} was not found");
            }

            // Return user without password
            var userDto = new UserDTO
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

            return Ok(userDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserDTO userModel)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest("Invalid user ID format");
            }

            if (userModel == null)
            {
                return BadRequest("User data is required");
            }

            var existingUser = await _DBUserService.GetByIdAsync(userId);
            if (existingUser == null)
            {
                return NotFound($"User with id {id} was not found");
            }

            // Update only provided fields
            if (!string.IsNullOrWhiteSpace(userModel.Email))
                existingUser.Email = userModel.Email;
            
            if (!string.IsNullOrWhiteSpace(userModel.FirstName))
                existingUser.FirstName = userModel.FirstName;
            
            if (!string.IsNullOrWhiteSpace(userModel.LastName))
                existingUser.LastName = userModel.LastName;
            
            if (!string.IsNullOrWhiteSpace(userModel.Password))
                existingUser.Password = userModel.Password; // Consider hashing in production

            var updatedUser = await _DBUserService.UpdateAsync(existingUser);

            var userDto = new UserDTO
            {
                Id = updatedUser.Id.ToString(),
                Email = updatedUser.Email,
                FirstName = updatedUser.FirstName,
                LastName = updatedUser.LastName
            };

            return Ok(userDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest("Invalid user ID format");
            }

            var user = await _DBUserService.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound($"User with id {id} was not found");
            }

            await _DBUserService.DeleteAsync(user);
            return Ok(new { message = "User deleted successfully" });
        }

        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetUserHistory(string id)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest("Invalid user ID format");
            }

            var history = await _DBUserService.GetUserHistoryAsync(userId);
            if (history == null)
            {
                return NotFound($"User with id {id} was not found");
            }

            return Ok(history);
        }

        [HttpPost("{id}/history")]
        public async Task<IActionResult> AddToHistory(string id, [FromBody] HistoryDTO historyModel)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest("Invalid user ID format");
            }

            if (historyModel == null || string.IsNullOrWhiteSpace(historyModel.FilmId))
            {
                return BadRequest("Film ID is required");
            }

            if (!Guid.TryParse(historyModel.FilmId, out var filmId))
            {
                return BadRequest("Invalid film ID format");
            }

            var result = await _DBUserService.AddToHistoryAsync(userId, filmId);
            if (!result)
            {
                return NotFound("User or Film not found");
            }

            return Ok(new { message = "Film added to history successfully" });
        }

        [HttpGet("{id}/bookings")]
        public async Task<IActionResult> GetUserBookings(string id)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest("Invalid user ID format");
            }

            var bookings = await _DBUserService.GetUserBookingsAsync(userId);
            if (bookings == null)
            {
                return NotFound($"User with id {id} was not found");
            }

            return Ok(bookings);
        }
    }
}


