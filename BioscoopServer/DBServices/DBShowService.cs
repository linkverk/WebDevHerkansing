using BioscoopServer.models;
using Microsoft.EntityFrameworkCore;
namespace BioscoopServer.DBServices
{
    public class DBShowService : DBDefaultService<Show>
    {
        public DBShowService(CinemaContext context) : base(context) { }
        public override bool Exists(Show entity, out Show? existing)
        {
            existing = _dbSet.AsNoTracking().FirstOrDefault(f => f.Id == entity.Id);
            return existing != null;
        }
        public override async Task<Show?> AddOrUpdateAsync(Show entity)
        {
            List<Show>? shows = _dbSet.AsNoTracking()
            .Where(f => f.RoomId == entity.RoomId).ToList();

            if (shows == null || shows.Count() == 0)
            {
                return await base.AddOrUpdateAsync(entity);
            }
            else
            {
                foreach (Show show in shows)
                {
                    if (show.StartDate <= entity.EndDate && show.StartDate >= entity.StartDate || show.EndDate <= entity.EndDate && show.EndDate >= entity.StartDate || show.EndDate >= entity.EndDate && show.StartDate <= entity.StartDate || show.EndDate == entity.EndDate && show.StartDate == entity.StartDate)
                    {
                        return null;
                    }
                }
            }
            return await base.AddOrUpdateAsync(entity);
        }

    }
}
