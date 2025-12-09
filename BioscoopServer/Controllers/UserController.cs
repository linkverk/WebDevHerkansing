using Microsoft.AspNetCore.Mvc;
using BioscoopServer.models;
using BioscoopServer.DBServices;
using BioscoopServer.Models.ModelsDTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly DBUserService _DBUserService;
        private readonly CinemaContext _context;

        public UsersController(DBUserService DBUserService, CinemaContext context)
        {
            _DBUserService = DBUserService;
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            var user = await _DBUserService.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = $"User with id {id} was not found" });
            }

            var userDto = new UserDTO
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

            return Ok(userDto);
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] string? email = null)
        {
            if (!string.IsNullOrWhiteSpace(email))
            {
                var user = await _DBUserService.GetByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = $"User with email {email} was not found" });
                }

                var userDto = new UserDTO
                {
                    Id = user.Id.ToString(),
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName
                };

                return Ok(userDto);
            }

            var allUsers = await _DBUserService.GetAllAsync();
            var userDtos = allUsers.Select(u => new UserDTO
            {
                Id = u.Id.ToString(),
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName
            }).ToList();

            return Ok(userDtos);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateUser([FromBody] UserDTO userModel)
        {
            if (userModel == null)
                return BadRequest(new { message = "User data is required" });

            if (!string.IsNullOrWhiteSpace(userModel.Id))
                return BadRequest(new { message = "ID should not be provided when creating a user" });

            var userId = Guid.NewGuid();

            var user = new User
            {
                Id = userId,
                Email = userModel.Email,
                Password = userModel.Password ?? "",
                FirstName = userModel.FirstName,
                LastName = userModel.LastName
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            Console.WriteLine($"✅ User created successfully: {userId}");

            var responseDto = new UserDTO
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

            return CreatedAtAction(nameof(GetUserById), new { id = userId }, responseDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserDTO userModel)
        {
            if (userModel == null)
                return BadRequest(new { message = "User data is required" });

            if (!Guid.TryParse(id, out var userId))
                return BadRequest(new { message = "Invalid user ID format" });

            var existingUser = await _context.Users.FindAsync(userId);
            if (existingUser == null)
                return NotFound(new { message = $"User with id {id} was not found" });

            Console.WriteLine($"Updating user: {userId}");
            Console.WriteLine($"Old: {existingUser.FirstName} {existingUser.LastName}");
            Console.WriteLine($"New: {userModel.FirstName} {userModel.LastName}");

            existingUser.Email = userModel.Email;
            existingUser.FirstName = userModel.FirstName;
            existingUser.LastName = userModel.LastName;
            
            if (!string.IsNullOrWhiteSpace(userModel.Password))
            {
                existingUser.Password = userModel.Password;
            }

            _context.Users.Update(existingUser);
            await _context.SaveChangesAsync();

            Console.WriteLine($"✅ User updated successfully!");

            var responseDto = new UserDTO
            {
                Id = existingUser.Id.ToString(),
                Email = existingUser.Email,
                FirstName = existingUser.FirstName,
                LastName = existingUser.LastName
            };

            return Ok(responseDto);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchUser(string id, [FromBody] UserDTO userModel)
        {
            if (userModel == null)
                return BadRequest(new { message = "User data is required" });

            if (!Guid.TryParse(id, out var userId))
                return BadRequest(new { message = "Invalid user ID format" });

            var existingUser = await _context.Users.FindAsync(userId);
            if (existingUser == null)
                return NotFound(new { message = $"User with id {id} was not found" });

            if (!string.IsNullOrWhiteSpace(userModel.Email))
                existingUser.Email = userModel.Email;

            if (!string.IsNullOrWhiteSpace(userModel.FirstName))
                existingUser.FirstName = userModel.FirstName;

            if (!string.IsNullOrWhiteSpace(userModel.LastName))
                existingUser.LastName = userModel.LastName;

            if (!string.IsNullOrWhiteSpace(userModel.Password))
                existingUser.Password = userModel.Password;

            _context.Users.Update(existingUser);
            await _context.SaveChangesAsync();

            Console.WriteLine($"✅ User partially updated!");

            var responseDto = new UserDTO
            {
                Id = existingUser.Id.ToString(),
                Email = existingUser.Email,
                FirstName = existingUser.FirstName,
                LastName = existingUser.LastName
            };

            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            if (!Guid.TryParse(id, out var userId))
                return BadRequest(new { message = "Invalid user ID format" });

            var user = await _DBUserService.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = $"User with id {id} was not found" });

            await _DBUserService.DeleteAsync(user);
            
            return NoContent();
        }

        [HttpGet("{id}/history")]
        public async Task<IActionResult> GetUserHistory(string id)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            var history = await _DBUserService.GetUserHistoryAsync(userId);
            if (history == null)
            {
                return NotFound(new { message = $"User with id {id} was not found" });
            }

            return Ok(history);
        }

        [HttpPost("{id}/history")]
        public async Task<IActionResult> AddToHistory(string id, [FromBody] HistoryDTO historyModel)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            if (historyModel == null || string.IsNullOrWhiteSpace(historyModel.FilmId))
            {
                return BadRequest(new { message = "Film ID is required" });
            }

            if (!Guid.TryParse(historyModel.FilmId, out var filmId))
            {
                return BadRequest(new { message = "Invalid film ID format" });
            }

            var result = await _DBUserService.AddToHistoryAsync(userId, filmId);
            if (!result)
            {
                return NotFound(new { message = "User or Film not found" });
            }

            return Ok(new { message = "Film added to history successfully" });
        }

        [HttpGet("{id}/bookings")]
        public async Task<IActionResult> GetUserBookings(string id)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            var bookings = await _DBUserService.GetUserBookingsAsync(userId);
            if (bookings == null)
            {
                return NotFound(new { message = $"User with id {id} was not found" });
            }

            return Ok(bookings);
        }
    }
}