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
            var review = new Review
            {
                Id = reviewDTO.Id,
                UserId = reviewDTO.UserId,
                FilmId = reviewDTO.FilmId,
                Rating = reviewDTO.Rating,
                Description = reviewDTO.Description
            };
            var AddReview = await _DBReviewService.AddAsync(review);
            return Ok(AddReview);
        }

    }
}