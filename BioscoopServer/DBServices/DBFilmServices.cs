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

        public override async Task<bool> Valid(Film entity)
        {
            Film? completeFilm = await GetFilmByIdFull(entity.Id);
            if (completeFilm == null || completeFilm.Shows.Count() == 0)
            {
                return true;
            }
            else
            {
                foreach (Show show in completeFilm.Shows)
                {
                    if (show.EndDate - show.StartDate < TimeSpan.FromMinutes((Double)entity.Duration))
                    {
                        return false;
                    }
                }
            }
            return true;
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
