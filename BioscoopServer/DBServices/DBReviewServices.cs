using BioscoopServer.models;
using Microsoft.EntityFrameworkCore;

public class DBReviewServices : DBDefaultService<Review>
{
    protected readonly CinemaContext _context;
    protected readonly DbSet<Review> _dbSet;

    public DBReviewServices(CinemaContext context) : base(context)
    {
        _context = context;
        _dbSet = _context.Set<Review>();
    }

    public override bool Exists(Review entity, out Review? existing)
    {
        existing = _dbSet.AsNoTracking().FirstOrDefault(f => f.Id == entity.Id);
        return existing != null;
    }

    public override async Task<Review?> AddAsync(Review review)
    {

        await _dbSet.AddAsync(review);
        await _context.SaveChangesAsync();
        return review;
    }

}