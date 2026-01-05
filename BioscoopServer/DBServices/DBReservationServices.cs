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
        public async Task<List<int>> GetReservedSeatNumbersForShowAsync(Guid showId)
        {
            return await _context.Reservations
                .AsNoTracking()
                .Where(r => r.ShowId == showId)
                .SelectMany(r => r.Seats)
                .Select(s => s.Stoelnummer)
                .ToListAsync();
        }

        // Create reservation with seats
        public async Task<Reservation?> CreateReservationAsync(Guid userId, Guid showId, List<int> seatNumbers)
        {
            var alreadyReserved = await _context.Reservations
            .AsNoTracking()
            .Where(r => r.ShowId == showId)
            .SelectMany(r => r.Seats)
            .Where(s => seatNumbers.Contains(s.Stoelnummer))
            .Select(s => s.Stoelnummer)
            .ToListAsync();

            if (alreadyReserved.Any()) return null;


            // LOAD Show to get RoomId
            var show = await _context.Shows.FindAsync(showId);
            if (show == null) return null;

            //fills a reservation with user and chairs data.
            var reservation = new Reservation
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ShowId = showId,
                Seats = seatNumbers.Select(sn => new Seat
                {
                    Id = Guid.NewGuid(),
                    Stoelnummer = sn,
                    RoomId = show.RoomId
                }).ToList()
            };

            await _context.Reservations.AddAsync(reservation);
            await _context.SaveChangesAsync();

            return reservation;
        }
        public async Task<Reservation?> UpdateReservationSeatsAsync(Guid reservationId, Guid userId, List<int> newSeatNumbers)
        {
            // load reservation including seats
            var reservation = await _context.Reservations
                .Include(r => r.Seats)
                .Include(r => r.Show)
                .FirstOrDefaultAsync(r => r.Id == reservationId && r.UserId == userId);

            if (reservation == null)
            {
                return null; // not found or not user's reservation
            }

            if (newSeatNumbers == null || !newSeatNumbers.Any())
            {
                // optionally: clear all seats, or treat as invalid

                return null;
            }

            // find conflicts: seats in this show reserved by OTHERS
            var conflicts = await _context.Seats
                .AsNoTracking()
                .Where(s =>
                    s.Reservation.ShowId == reservation.ShowId &&
                    s.Reservation.Id != reservation.Id &&          // other reservations
                    newSeatNumbers.Contains(s.Stoelnummer))
                .Select(s => s.Stoelnummer)
                .ToListAsync();

            if (conflicts.Any())
            {
                //keeping same pattern as CreateReservationAsync
                return null;
            }

            reservation.Seats = await _context.Seats
            .Where(s => s.ReservationId == reservation.Id)
            .ToListAsync();


            // remove old seats
            _context.Seats.RemoveRange(reservation.Seats);

            // add new seats
            reservation.Seats = newSeatNumbers.Select(sn => new Seat
            {
                Id = Guid.NewGuid(),
                Stoelnummer = sn,
                RoomId = reservation.Show.RoomId
            }).ToList();

            await _context.SaveChangesAsync();
            return reservation;
        }

        public async Task<bool> DeleteReservationAsync(Guid reservationId, Guid userId)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Seats)
                .FirstOrDefaultAsync(r => r.Id == reservationId && r.UserId == userId);

            if (reservation == null)
            {
                return false;
            }

            // EF will cascade if configured; otherwise explicitly remove seats
            _context.Seats.RemoveRange(reservation.Seats);
            _context.Reservations.Remove(reservation);

            await _context.SaveChangesAsync();
            return true;
        }

    }
}
