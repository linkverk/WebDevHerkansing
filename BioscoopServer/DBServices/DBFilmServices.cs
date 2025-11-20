using BioscoopServer.models;
using Microsoft.EntityFrameworkCore;
namespace BioscoopServer.DBServices
{
    public class DBFilmService : DBDefaultService<Film>
    {
        public DBFilmService(CinemaContext context) : base(context) { }
        public override bool Exists(Film entity, out Film? existing)
        {
            existing = _dbSet.AsNoTracking().FirstOrDefault(f => f.Id == entity.Id);
            return existing != null;
        }

        public async Task<Film?> GetFilmByIdFull(Guid id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(f => f.Shows)
                    .ThenInclude(s => s.Zaal)
                .Include(f => f.Reviews)
                .FirstOrDefaultAsync(f => f.Id == id);
        }


        public async Task<List<Film>> GetFilmsFull()
        {
            return await _dbSet
            .AsNoTracking()
            .Include(f => f.Shows)
            .ThenInclude(s => s.Zaal)
            .Include(f => f.Reviews)
            .ToListAsync();
        }
    }
}
