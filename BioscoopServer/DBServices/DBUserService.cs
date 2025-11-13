using BioscoopServer.models;
using Microsoft.EntityFrameworkCore;

namespace BioscoopServer.DBServices
{
    public class DBUserService : DBDefaultService<User>
    {
        public DBUserService(CinemaContext context) : base(context) { }

        public override bool Exists(User entity, out User? existing)
        {
            // Check by ID first
            existing = _dbSet.FirstOrDefault(u => u.Id == entity.Id);
            
            // If not found by ID, check by email
            if (existing == null)
            {
                existing = _dbSet.FirstOrDefault(u => u.Email == entity.Email);
            }
            
            return existing != null;
        }

        // Get user by email
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        // OVERRIDE: Custom AddOrUpdate with proper update logic
        public override async Task<User?> AddOrUpdateAsync(User entity)
        {
            if (entity == null) return entity;

            // Try to find existing user by ID or Email
            var existing = await _dbSet.FirstOrDefaultAsync(u => u.Id == entity.Id);
            
            if (existing == null)
            {
                existing = await _dbSet.FirstOrDefaultAsync(u => u.Email == entity.Email);
            }

            if (existing != null)
            {
                // UPDATE existing user - manually update all properties
                existing.Email = entity.Email;
                existing.Password = entity.Password;
                existing.FirstName = entity.FirstName;
                existing.LastName = entity.LastName;

                _context.Entry(existing).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"✅ User updated: {existing.Id} - {existing.FirstName} {existing.LastName}");
                return existing;
            }
            else
            {
                // ADD new user
                await _dbSet.AddAsync(entity);
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"✅ User created: {entity.Id} - {entity.FirstName} {entity.LastName}");
                return entity;
            }
        }

        public async Task<List<Film>?> GetUserHistoryAsync(Guid userId)
        {
            var user = await _dbSet
                .AsNoTracking()
                .Include(u => u.Reviews)
                .ThenInclude(r => r.Film)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return null;

            // Return films that user has reviewed (this serves as history)
            return user.Reviews.Select(r => r.Film).ToList();
        }

        public async Task<bool> AddToHistoryAsync(Guid userId, Guid filmId)
        {
            var user = await _dbSet.FindAsync(userId);
            if (user == null)
                return false;

            var film = await _context.Set<Film>().FindAsync(filmId);
            if (film == null)
                return false;

            // Check if review already exists
            var existingReview = await _context.Set<Review>()
                .FirstOrDefaultAsync(r => r.UserId == userId && r.FilmId == filmId);

            if (existingReview != null)
                return true; // Already in history

            // Create a review entry to track history
            var review = new Review
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FilmId = filmId,
                Rating = null, // No rating, just history tracking
                Description = null
            };

            await _context.Set<Review>().AddAsync(review);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<Reservation>?> GetUserBookingsAsync(Guid userId)
        {
            var user = await _dbSet
                .AsNoTracking()
                .Include(u => u.Reservations)
                .ThenInclude(r => r.Show)
                .ThenInclude(s => s.Film)
                .Include(u => u.Reservations)
                .ThenInclude(r => r.Show)
                .ThenInclude(s => s.Zaal)
                .Include(u => u.Reservations)
                .ThenInclude(r => r.Seats)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return null;

            return user.Reservations.ToList();
        }

        public async Task<User?> GetUserWithDetailsAsync(Guid userId)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(u => u.Reservations)
                .ThenInclude(r => r.Show)
                .ThenInclude(s => s.Film)
                .Include(u => u.Reviews)
                .ThenInclude(r => r.Film)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
}