using Microsoft.AspNetCore.Mvc;
using BioscoopServer.models;
using BioscoopServer.DBServices;
using BioscoopServer.Models.ModelsDTOs;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DBUserService _DBUserService;
        private readonly CinemaContext _context;
        private readonly DBJwtService _DBJwtService;

        public AuthController(DBUserService DBUserService, CinemaContext context, DBJwtService DBJwtService)
        {
            _DBUserService = DBUserService;
            _context = context;
            _DBJwtService = DBJwtService;
        }

        [HttpPost("users")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateUser([FromBody] RegisterDTO registerModel)
        {
            if (registerModel == null)
                return BadRequest(new { message = "Registration data is required" });

            if (string.IsNullOrWhiteSpace(registerModel.Email))
                return BadRequest(new { message = "Email is required" });

            if (string.IsNullOrWhiteSpace(registerModel.Password))
                return BadRequest(new { message = "Password is required" });

            if (registerModel.Password.Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters" });

            var existingUser = await _DBUserService.GetByEmailAsync(registerModel.Email);
            if (existingUser != null)
            {
                return Conflict(new { message = "User with this email already exists" });
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerModel.Password);

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = registerModel.Email,
                Password = hashedPassword,
                FirstName = registerModel.FirstName ?? "",
                LastName = registerModel.LastName ?? ""
            };

            try
            {
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ User registered: {user.Email} (ID: {user.Id})");
                Console.WriteLine($"🔒 Password hashed and salted");

                var token = _DBJwtService.GenerateToken(user.Id.ToString(), user.Email);

                var responseDto = new AuthResponseDTO
                {
                    Id = user.Id.ToString(),
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Token = token,
                    Message = "Registration successful"
                };
                await EmailMaker.MakeEmail(user.Email, false, "Acount created", $"Welcome {user.FirstName} {user.LastName} to cinema app, your acount was created succesfully!");

                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, responseDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Registration error: {ex.Message}");
                return StatusCode(500, new { message = "Error creating user account" });
            }
        }

        [HttpPost("sessions")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateSession([FromBody] LoginDTO loginModel)
        {
            if (loginModel == null)
                return BadRequest(new { message = "Login data is required" });

            if (string.IsNullOrWhiteSpace(loginModel.Email))
                return BadRequest(new { message = "Email is required" });

            if (string.IsNullOrWhiteSpace(loginModel.Password))
                return BadRequest(new { message = "Password is required" });

            var user = await _DBUserService.GetByEmailAsync(loginModel.Email);
            
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            bool isValidPassword;
            try
            {
                isValidPassword = BCrypt.Net.BCrypt.Verify(loginModel.Password, user.Password);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ BCrypt verification error: {ex.Message}");
                Console.WriteLine($"   Password hash: {user.Password}");
                return StatusCode(500, new { message = "Authentication error. Please contact support." });
            }
            
            if (!isValidPassword)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            Console.WriteLine($"✅ User logged in: {user.Email} (ID: {user.Id})");

            var token = _DBJwtService.GenerateToken(user.Id.ToString(), user.Email);

            var responseDto = new AuthResponseDTO
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token,
                Message = "Login successful"
            };

            return Ok(responseDto);
        }

        [HttpDelete("sessions")]
        [Authorize]
        public IActionResult DeleteSession([FromBody] LogoutDTO? logoutModel)
        {
            var userId = logoutModel?.UserId ?? "unknown";
            Console.WriteLine($"✅ User logged out: {userId}");
            return NoContent();
        }

        [HttpGet("users/{id}")]
        [Authorize]
        public async Task<IActionResult> GetUser(string id)
        {
            if (!Guid.TryParse(id, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID format" });
            }

            var user = await _DBUserService.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var responseDto = new AuthResponseDTO
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Message = "User verified"
            };

            return Ok(responseDto);
        }
    }
}