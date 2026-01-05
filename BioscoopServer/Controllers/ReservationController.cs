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
        public async Task<IActionResult> UpdateReservation(Guid reservationId, [FromBody] UpdateReservationRequest request)
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
    }
}
