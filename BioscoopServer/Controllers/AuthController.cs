using Microsoft.AspNetCore.Mvc;
using BioscoopServer.models;
using BioscoopServer.DBServices;
using BioscoopServer.Models.ModelsDTOs;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly DBUserService _DBUserService;
        private readonly CinemaContext _context;

        public AuthController(DBUserService DBUserService, CinemaContext context)
        {
            _DBUserService = DBUserService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerModel)
        {
            if (registerModel == null)
                return BadRequest(new { message = "Registration data is required" });

            if (string.IsNullOrWhiteSpace(registerModel.Email))
                return BadRequest(new { message = "Email is required" });

            if (string.IsNullOrWhiteSpace(registerModel.Password))
                return BadRequest(new { message = "Password is required" });

            if (registerModel.Password.Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters" });

            // Check if user already exists
            var existingUser = await _DBUserService.GetByEmailAsync(registerModel.Email);
            if (existingUser != null)
            {
                return Conflict(new { message = "User with this email already exists" });
            }

            // Hash the password with BCrypt (automatically generates salt)
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerModel.Password);

            // Create new user with hashed password
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

                var responseDto = new AuthResponseDTO
                {
                    Id = user.Id.ToString(),
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Message = "Registration successful"
                };

                return Ok(responseDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Registration error: {ex.Message}");
                return StatusCode(500, new { message = "Error creating user account" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginModel)
        {
            if (loginModel == null)
                return BadRequest(new { message = "Login data is required" });

            if (string.IsNullOrWhiteSpace(loginModel.Email))
                return BadRequest(new { message = "Email is required" });

            if (string.IsNullOrWhiteSpace(loginModel.Password))
                return BadRequest(new { message = "Password is required" });

            // Find user by email
            var user = await _DBUserService.GetByEmailAsync(loginModel.Email);
            
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Verify password against hash
            bool isValidPassword = BCrypt.Net.BCrypt.Verify(loginModel.Password, user.Password);
            
            if (!isValidPassword)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            Console.WriteLine($"✅ User logged in: {user.Email} (ID: {user.Id})");

            var responseDto = new AuthResponseDTO
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Message = "Login successful"
            };

            return Ok(responseDto);
        }

        [HttpPost("logout")]
        public IActionResult Logout([FromBody] LogoutDTO? logoutModel)
        {
            // For a stateless API, logout is handled client-side
            // This endpoint exists for completeness and future token invalidation
            
            var userId = logoutModel?.UserId ?? "unknown";
            Console.WriteLine($"✅ User logged out: {userId}");

            return Ok(new { message = "Logout successful" });
        }

        [HttpGet("verify")]
        public async Task<IActionResult> VerifyUser([FromQuery] string id)
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