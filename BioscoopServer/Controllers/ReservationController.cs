using BioscoopServer.DBServices;
using BioscoopServer.models;
using Microsoft.AspNetCore.Mvc;

namespace Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationController : ControllerBase
    {
        private readonly DBReservationService _reservationService;

        public ReservationController(DBReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        //DTO
        public class CreateReservationRequest
        {
            public Guid UserId { get; set; }
            public Guid ShowId { get; set; }
            public List<int> SeatNumbers { get; set; } = new();
        }

        //DTO
        public class UpdateReservationRequest
        {
            public Guid UserId { get; set; }
            public List<int> SeatNumbers { get; set; } = new();
        }

        [HttpGet("show/{showId}/seats")]
        public async Task<ActionResult<List<string>>> GetReservedSeats(Guid showId)
        {
            var seats = await _reservationService.GetReservedSeatNumbersForShowAsync(showId);
            return Ok(seats);
        }

        [HttpPost]
        public async Task<ActionResult<Reservation>> CreateReservation([FromBody] CreateReservationRequest request)
        {
            if (request.SeatNumbers == null || request.SeatNumbers.Count == 0)
                return BadRequest("No seats selected.");

            var reservation = await _reservationService.CreateReservationAsync(
                request.UserId, request.ShowId, request.SeatNumbers);

            if (reservation == null)
                return Conflict("One or more seats are already reserved.");

            return CreatedAtAction(nameof(GetReservedSeats),
                new { showId = reservation.ShowId }, reservation);
        }

        [HttpPut("{reservationId}")]
        public async Task<IActionResult> UpdateReservation(
            Guid reservationId,
            [FromBody] UpdateReservationRequest request)
        {
            if (request.SeatNumbers == null || request.SeatNumbers.Count == 0)
            {
                return BadRequest("No seats selected.");
            }

            var updated = await _reservationService.UpdateReservationSeatsAsync(
                reservationId,
                request.UserId,
                request.SeatNumbers);

            if (updated == null)
            {
                //could be: not found, not owner, or seat conflict
                return Conflict("Reservation cannot be updated; seats may be taken or reservation not found.");
            }

            return Ok(updated);
        }

        [HttpDelete("{reservationId}")]
        public async Task<IActionResult> DeleteReservation(
            Guid reservationId,
            [FromQuery] Guid userId)
        {
            var success = await _reservationService.DeleteReservationAsync(reservationId, userId);

            if (!success)
            {
                return NotFound("Reservation not found for this user.");
            }

            return NoContent();
        }

        // TESTING AREA, DELETE WHEN TESTING IS DONE, NEVER PUSH TO MAIN!
        // TESTING AREA, DELETE WHEN TESTING IS DONE, NEVER PUSH TO MAIN!
        // TESTING AREA, DELETE WHEN TESTING IS DONE, NEVER PUSH TO MAIN!
        // --------------------------------------------------------------

        // TEMP: quick test endpoint for Swagger (no real foreign keys)
        [HttpPost("test")]
        public async Task<ActionResult<Reservation>> CreateTestReservation()
        {
            // Hard-coded test IDs (do not rely on real User/Show entries)
            var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var showId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var seatNumbers = new List<int> { 1, 2, 3 };

            var reservation = await _reservationService.CreateReservationAsync(userId, showId, seatNumbers);

            if (reservation == null)
            {
                return Conflict("One or more seats are already reserved.");
            }

            return Ok(reservation);
        }

    }
}
