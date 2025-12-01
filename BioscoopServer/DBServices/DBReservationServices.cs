using BioscoopServer.models;
using Microsoft.EntityFrameworkCore;

namespace BioscoopServer.DBServices
{
    public class DBReservationService
    {
        private readonly CinemaContext _context;

        public DBReservationService(CinemaContext context)
        {
            _context = context;
        }

        //reserved seats for show
        public async Task<List<string>> GetReservedSeatNumbersForShowAsync(Guid showId)
        {
            return await _context.Reservations
                .AsNoTracking()
                .Where(r => r.ShowId == showId)
                .SelectMany(r => r.Seats)
                .Select(s => s.Stoelnummer)
                .ToListAsync();
        }

        // Create reservation with seats
        public async Task<Reservation?> CreateReservationAsync(Guid userId, Guid showId, List<string> seatNumbers)
        {
            //checks user chairs against all chairs in database (reserved ones) and adds duplicates to list 
            var alreadyReserved = await _context.Seats
                .AsNoTracking()
                .Where(s => s.Reservation.ShowId == showId && seatNumbers.Contains(s.Stoelnummer))
                .Select(s => s.Stoelnummer)
                .ToListAsync();

            //handles if any chosen chairs are in list
            if (alreadyReserved.Any())
            {
                //add feedback to user that seat is already taken
                return null;
            }

            //fills a reservation with user and chairs data.
            var reservation = new Reservation
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ShowId = showId,
                Seats = seatNumbers.Select(sn => new Seat
                {
                    Id = Guid.NewGuid(),
                    Stoelnummer = sn
                }).ToList()
            };

            await _context.Reservations.AddAsync(reservation);
            await _context.SaveChangesAsync();

            return reservation;
        }
    }
}
