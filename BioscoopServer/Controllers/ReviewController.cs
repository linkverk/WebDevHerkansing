using Microsoft.AspNetCore.Mvc;
using BioscoopServer.models;
using BioscoopServer.DBServices;
using BioscoopServer.Models.ModelsDTOs;
using Microsoft.EntityFrameworkCore;

namespace Controllers
{
    [ApiController]
    [Route("api/Review")]
    public class ReviewController : ControllerBase
    {
        private readonly DBReviewServices _DBReviewService;
        private readonly CinemaContext _context;

        public ReviewController(DBReviewServices DBReviewService, CinemaContext context)
        {
            _DBReviewService = DBReviewService;
            _context = context;
        }

        [HttpPost("Post")]
        public async Task<IActionResult> AddReview([FromBody] ReviewDTO reviewDTO)
        {
            if (reviewDTO == null)
                return BadRequest("Nothing was filled in");

            var film = await _context.Films.FindAsync(reviewDTO.FilmId);
            if (film == null)
                return BadRequest($"There is no film with this id:{reviewDTO.FilmId}");

            var user = await _context.Users.FindAsync(reviewDTO.UserId);
            if (user == null)
                return BadRequest($"there is not user with this id:{reviewDTO.UserId}");

            Guid reviewId;
            Guid.TryParse(reviewDTO.Id, out reviewId);

            Guid userId;
            Guid.TryParse(reviewDTO.UserId, out userId);

            Guid filmId;
            Guid.TryParse(reviewDTO.FilmId, out filmId);

            var review = new Review
            {
                Id = reviewId,
                UserId = userId,
                FilmId = filmId,
                Rating = reviewDTO.Rating,
                Description = reviewDTO.Description
            };
            var AddReview = await _DBReviewService.AddAsync(review);
            return Ok(AddReview);
        }

    }
}