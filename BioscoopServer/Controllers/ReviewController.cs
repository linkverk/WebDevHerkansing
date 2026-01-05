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

        [HttpPost("{id}")]
        public async Task<IActionResult> AddReview([FromBody] ReviewDTO reviewDTO)
        {
            if (reviewDTO == null)
                return BadRequest("Nothing was filled in");

            if (!Guid.TryParse(reviewDTO.UserId, out Guid userId))
                return BadRequest("Invalid UserId GUID format");

            if (!Guid.TryParse(reviewDTO.FilmId, out Guid filmId))
                return BadRequest("Invalid FilmId GUID format");

            var film = await _context.Films.FindAsync(filmId);
            if (film == null)
                return BadRequest($"There is no film with this id: {filmId}");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return BadRequest($"There is no user with this id: {userId}");

            Review review = new Review
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FilmId = filmId,
                Rating = reviewDTO.Rating,
                Description = reviewDTO.Description
            };

            var addedReview = await _DBReviewService.AddAsync(review);

            ReviewDTO responseDTO = new ReviewDTO
            {
                Id = addedReview.Id.ToString(),
                UserId = addedReview.UserId.ToString(),
                FilmId = addedReview.FilmId.ToString(),
                Rating = addedReview.Rating,
                Description = addedReview.Description
            };

            return Ok(responseDTO);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(Guid id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
                return NotFound($"No review found with id: {id}");

            var responseDTO = new ReviewDTO
            {
                Id = review.Id.ToString(),
                UserId = review.UserId.ToString(),
                FilmId = review.FilmId.ToString(),
                Rating = review.Rating,
                Description = review.Description
            };

            await _DBReviewService.DeleteAsync(review);

            return Ok(new
            {
                message = $"Review with id: {id} has been deleted.",
                deletedReview = responseDTO
            });
        }

        [HttpGet()]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _DBReviewService.GetAllAsync();
            var reviewDTOs = reviews.Select(review => new ReviewDTO
            {
                Id = review.Id.ToString(),
                UserId = review.UserId.ToString(),
                FilmId = review.FilmId.ToString(),
                Rating = review.Rating,
                Description = review.Description
            }).ToList();

            return Ok(reviewDTOs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReviewById(Guid id)
        {
            var review = await _DBReviewService.GetByIdAsync(id);
            if (review == null)
                return NotFound($"No review found with id: {id}");

            var reviewDTO = new ReviewDTO
            {
                Id = review.Id.ToString(),
                UserId = review.UserId.ToString(),
                FilmId = review.FilmId.ToString(),
                Rating = review.Rating,
                Description = review.Description
            };

            return Ok(reviewDTO);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateReview(Guid id, [FromBody] ReviewUpdateDTO UpdatedReview)
        {
            Review? existingReview = await _context.Reviews.FindAsync(id);

            if (existingReview == null)
                return NotFound($"No review found with id: {id}");

            if (UpdatedReview == null)
                return BadRequest("Nothing was filled in.");

            if (UpdatedReview.Rating < 1 || UpdatedReview.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            if (UpdatedReview.Rating.HasValue)
                existingReview.Rating = UpdatedReview.Rating.Value;

            if (!string.IsNullOrWhiteSpace(UpdatedReview.Description))
                existingReview.Description = UpdatedReview.Description;

            Review updatedReview = await _DBReviewService.UpdateAsync(existingReview);

            ReviewDTO responseDTO = new ReviewDTO
            {
                Id = updatedReview.Id.ToString(),
                UserId = updatedReview.UserId.ToString(),
                FilmId = updatedReview.FilmId.ToString(),
                Rating = updatedReview.Rating,
                Description = updatedReview.Description
            };

            return Ok(responseDTO);
        }
    }
}